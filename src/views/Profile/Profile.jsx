import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Blog from '../Blogs/ViewBlogs/Blog/Blog';
import './Profile.scss';
import ip from '../../ip-config/ip';
import Swal from 'sweetalert2';
import NavBar from '../../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState(localStorage.getItem('name'));
    const userId = localStorage.getItem('id');
    const userEmail = localStorage.getItem('email');
    const [userImage, setUserImage] = useState(localStorage.getItem('image'));
    const [userPosts, setUserPosts] = useState([]);

    useEffect(() => {
        fetchUserPosts();
    }, []);

    const resolveImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${ip}${url}`;
    };

    const fetchUserPosts = async () => {
        try {
            const { data } = await axios.get(`${ip}/api/BlogPost/my-blogs/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const fetchedPosts = data.map(bp => ({
                id: bp.blog.id,
                title: bp.blog.title,
                authorName: bp.blog.author.userName,
                authorImage: bp.blog.author.image,
                postImage: bp.blog.imageUrl,
                description: bp.blog.body,
                popularity: bp.popularity,
                postLikeCount: bp.reactions.filter(r => r.type === 0).length,
                postDislikeCount: bp.reactions.filter(r => r.type === 1).length,
                commentCount: bp.comments.length,
                date: bp.blog.postDate,
                isLiked: bp.reactions.some(r => r.userId === localStorage.getItem('id') && r.type === 0),
                isDisliked: bp.reactions.some(r => r.userId === localStorage.getItem('id') && r.type === 1)
            }));
            console.log(fetchedPosts)
            setUserPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching user posts:", error);
            Swal.fire('Error', 'Failed to fetch user posts.', 'error');
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to update your profile?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Update"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const formData = new FormData();
                    formData.append('ImageFile', file);

                    try {
                        const { data } = await axios.put(`${ip}/api/Account/update-image/`, formData, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        console.log(data)
                        updateLocalStorageFromResponse(data);
                        Swal.fire({
                            title: "Profile Image Updated.",
                            icon: "success",
                            toast: true,
                            timer: 3000,
                            position: "top-right",
                            timerProgressBar: true,
                            showConfirmButton: false,
                            showCloseButton: true,
                        });
                        setUserImage(resolveImageUrl(data.imageUrl));
                    } catch (error) {
                        Swal.fire('Error', error.response?.data?.message || 'Failed to update image', 'error');
                    }
                }
            });

        }
    };

    const handleUpdateUserName = async () => {
        try {
            const { data } = await axios.put(`${ip}/api/Account/update-username/`, {
                NewUsername: userName
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            updateLocalStorageFromResponse(data);
            setUserName(data.username);
            Swal.fire({
                title: "Username Updated.",
                icon: "success",
                toast: true,
                timer: 3000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: true,
            });
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update username', 'error');
        }
    };

    const deleteUser = async () => {
        console.log(userId);
        try {
            const response = await axios.delete(`${ip}/api/Account/delete-user`, {
                data: { userId: userId },  // Include data in the config object
                headers: {
                    'Content-Type': 'application/json',  // Ensure the content type is set if required by the server
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Delete data:', response.data);
            Swal.fire({
                title: "User Deleted.",
                icon: "success",
                toast: true,
                timer: 3000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: true,
            });
            localStorage.clear()
            sessionStorage.clear()
            navigate('/home')
        } catch (error) {
            console.log('Error:', error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    function updateLocalStorageFromResponse(data) {
        localStorage.setItem('name', data.username);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', data.email);
        localStorage.setItem('id', data.id);
        localStorage.setItem('image', resolveImageUrl(data.imageUrl));
        setUserImage(resolveImageUrl(data.imageUrl));
    }


    return (
        <>
            <NavBar />
            <section className="profile-section">
                <div className="profile-card">
                    <div className="edit-profile">
                        <h4>Edit Profile</h4>
                        <div className="user-image">
                            <label htmlFor="profile-image-upload" className="profile-image-upload-label">
                                <div className="profile-image" style={userImage ? {
                                    backgroundImage: `url(${resolveImageUrl(userImage)})`,
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                } : null}>

                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} hidden id="profile-image-upload" />
                            </label>
                        </div>
                        <div className="user_description">
                            <form action="">
                                <div className="email">
                                    <label htmlFor="email">Email:</label>
                                    <input type="email" name="email" id="email" value={userEmail} />
                                </div>

                                <div className="username">
                                    <label htmlFor="username">Username:</label>
                                    <input type="text" name="username" id="username" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                </div>
                                <button onClick={handleUpdateUserName} className="update-username-btn">Update Username</button>
                            </form>
                        </div>
                    </div>
                    <div className="delete-profile">
                        <h4>Delete Profile</h4>
                        <button className='delete-btn' onClick={() => deleteUser(userId)}>Delete Account</button>
                    </div>
                </div>
                <div className="blog-container">
                    {userPosts.map(post => (
                        <Blog
                            key={post.id}
                            blogId={post.id}
                            postTitle={post.title}
                            authorName={post.authorName}
                            authorImage={post.authorImage}
                            postImage={post.postImage}
                            description={post.description}
                            popularity={post.popularity}
                            postLikeCount={post.postLikeCount}
                            postDislikeCount={post.postDislikeCount}
                            commentCount={post.commentCount}
                            isLiked={post.isLiked}
                            isDisliked={post.isDisliked}
                            date={post.date}
                            redirectPath="/profile"
                        />
                    ))}
                </div>
            </section>
        </>
    );
};

export default Profile;