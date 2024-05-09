import React, { useState, useEffect } from "react";
import axios from "axios";
import Blog from "../../Blogs/ViewBlogs/Blog/Blog";
import './ViewBlogs.scss';
import ip from '../../../ip-config/ip';
import swal from 'sweetalert2';
import 'boxicons'
import NavBar from '../../../components/NavBar/NavBar'
const ViewBlogs = () => {
    const [posts, setPosts] = useState([]);
    const [sortMethod, setSortMethod] = useState('random');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPosts, setTotalPosts] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({
        authorId: 'AuthorID',
        title: '',
        description: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        fetchPosts();
    }, [sortMethod, pageSize, pageNumber]);

    const fetchPosts = async () => {
        const sortType = sortMethod !== 'random' ? sortMethod : null;
        const userId = localStorage.getItem('id');

        try {
            const response = await axios.get(`${ip}/api/BlogPost/all`, {
                params: {
                    sortType,
                    pageNumber,
                    pageSize
                }
            });
            const fetchedPosts = response.data.blogPostsWithReactions.map(bp => {
                const isLiked = bp.reactions.some(r => r.userId == userId && r.type === 0);
                const isDisliked = bp.reactions.some(r => r.userId == userId && r.type === 1);
                console.log(isLiked)
                console.log(isDisliked)
                return {
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
                    isLiked,       // added isLiked flag
                    isDisliked     // added isDisliked flag
                };
            });
            setPosts(fetchedPosts);
            setTotalPosts(response.data.paginationMetadata.totalCount);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };


    const handleSortChange = (event) => {
        setSortMethod(event.target.value);
        setPageNumber(1);
    };

    const handleShowMore = () => {
        setPageSize(pageSize + 10);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewPost(prevState => ({ ...prevState, image: file }));
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewPost(prevState => ({ ...prevState, [name]: value }));
    };

    const validateForm = () => {
        let errors = {};
        if (!newPost.title.trim()) errors.title = "Title cannot be empty.";
        if (!newPost.description.trim()) errors.description = "Description cannot be empty.";
        if (!newPost.image) errors.image = "Image must be uploaded.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateForm()) {
            const formData = new FormData();
            formData.append('Title', newPost.title);
            formData.append('Body', newPost.description);
            formData.append('ImageFile', newPost.image);

            try {
                const response = await axios.post(`${ip}/api/BlogPost/add/`, formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 200) {
                    resetFormAndCloseModal();
                    fetchPosts();
                    swal.fire({
                        icon: 'success',
                        title: "Blog added successfully."
                    });
                } else {
                    throw new Error("Failed to add post"); // This will be caught by the catch block
                }
            } catch (error) {
                console.error("Error adding post:", error);
                setFormErrors({ submit: "Failed to add post." });
                swal.fire({
                    icon: 'error',
                    title: "Failed to add post."
                });
            }
        } else {
            swal.fire({
                icon: 'error',
                title: "Validation failed, please check the form."
            });
        }
    };


    const resetFormAndCloseModal = () => {
        setNewPost({ authorId: '', title: '', description: '', image: null });
        setImagePreview('');
        setFormErrors({});
        setShowModal(false);
    };

    return (
        <>
            <NavBar />
            <div>
                <div className="sort_posts_drop_down">
                    <div className="sort_posts_drop_down_wrapper">
                        <box-icon name='sort' color="blue"></box-icon>
                        <select onChange={handleSortChange} value={sortMethod} className="sort-dropdown">
                            <option value="recency">Recency</option>
                            <option value="popularity">Popularity</option>
                            <option value="random">Random</option>
                        </select>
                    </div>
                    {isLoggedIn && (
                        <div className="add_post_btn" onClick={() => setShowModal(true)}>
                            <box-icon name='plus-circle' color="white"></box-icon>
                            <p>Add Posts</p>
                        </div>
                    )}
                </div>
                {posts.map(post => (
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
                    />
                ))}
                <div className="show-more-div" onClick={handleShowMore}>
                    <hr />
                    <p>Show More</p>
                </div>

                {showModal && (
                    <div className="modal">
                        <div className="modal_content">
                            <div className="modal_head">
                                <h2>Add a New Blog</h2>
                                <box-icon name='x' onClick={resetFormAndCloseModal} color="red" size="lg"></box-icon>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <label>Title:</label>
                                <input type="text" name="title" value={newPost.title} onChange={handleInputChange} />
                                {formErrors.title && <p className="error">{formErrors.title}</p>}

                                <label>Description:</label>
                                <textarea name="description" value={newPost.description} onChange={handleInputChange} />
                                {formErrors.description && <p className="error">{formErrors.description}</p>}

                                <label>Upload Image:</label>
                                <input type="file" onChange={handleImageChange} />
                                {formErrors.image && <p className="error">{formErrors.image}</p>}
                                {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px' }} />}

                                <button type="submit">Submit Blog</button>
                                {formErrors.submit && <p className="error">{formErrors.submit}</p>}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ViewBlogs;
