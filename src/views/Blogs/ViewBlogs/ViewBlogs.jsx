import React, { useState, useEffect } from "react";
import axios from "axios";
import Blog from "../../Blogs/ViewBlogs/Blog/Blog";
import './ViewBlogs.scss';
import ip from '../../../ip-config/ip';
import swal from 'sweetalert2';
import 'boxicons'
import NavBar from '../../../components/NavBar/NavBar'
import AddBlog from "../AddBlog/AddBlog";
import { FaSort } from "react-icons/fa";

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
                if (response.status === 201) {
                    resetFormAndCloseModal();
                    fetchPosts();
                    swal.fire({
                        title: "Post added successfully.",
                        icon: "success",
                        toast: true,
                        timer: 3000,
                        position: "top-right",
                        timerProgressBar: true,
                        showConfirmButton: false,
                        showCloseButton: true,
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
            <section className="blogs-section">
                <div className="blog-options">
                    <div className="sort-container">
                        <label htmlFor="sort-dropdown">Sort <FaSort /></label>
                        <select onChange={handleSortChange} value={sortMethod} className="sort-dropdown" id="sort-dropdown">
                            <option value="recency">Recency</option>
                            <option value="popularity">Popularity</option>
                            <option value="random">Random</option>
                        </select>
                    </div>
                    {isLoggedIn && (
                        <div className="add-btn" onClick={() => setShowModal(true)}>
                            <box-icon name='plus-circle' color="#00ff00"></box-icon>
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
                        fetchPosts={fetchPosts}
                    />
                ))}
                <div className="show-more-div" onClick={handleShowMore}>
                    <hr />
                    <p>Show More</p>
                </div>

                {showModal && (
                    <AddBlog fetchPosts={fetchPosts} resetFormAndCloseModal={resetFormAndCloseModal} />
                )}
            </section>
        </>
    );
}

export default ViewBlogs;
