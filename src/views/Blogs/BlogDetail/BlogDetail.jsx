import React, { useEffect, useState } from 'react'
import './BlogDetail.scss'
import { RxCross2 } from "react-icons/rx";
import { BsThreeDots } from "react-icons/bs";
import moment from 'moment'
import { RiSendPlaneFill } from "react-icons/ri";
import axios from 'axios';
import ip from '../../../ip-config/ip';
import { useNavigate, useParams } from 'react-router-dom';
const swal = require('sweetalert2')
const truncateWords = (text, numWords) => {
    const words = text?.split(' ');
    if (numWords >= words?.length) {
        return text;
    }
    return words?.slice(0, numWords).join(' ') + ' ...';
};
function BlogDetail() {
    const { blogId } = useParams()
    const navigate = useNavigate()

    const [blogDetail, setBlogDetail] = useState()
    const fetchBlogDetails = async () => {
        try {
            const res = await axios.get(`${ip}/api/BlogPost/${blogId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if(res.data){
                setBlogDetail(res.data[0])
            }
            console.log('BLog Details are', res.data[0])
        }
        catch (e){
            console.log(e)
        }
    }
    const [comments, setComments] = useState([]);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'))

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id'); // User ID from local storage for reaction checks
    const UPVOTE_WEIGHT = 2;
    const DOWNVOTE_WEIGHT = -1;

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${ip}/api/Comment/${blogId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('the comments are: ', response)
            console.log(blogId)
            console.log("This is user ID")
            console.log(userId)
            console.log("This is reaction_id")
            response.data.forEach(a => {
                console.log(a)
            })
            const fetchedComments = response.data.map(comment => ({
                ...comment,
                authorImage: ip + comment.author.image,
                isLiked: comment.reactions.some(r => r.userId === userId && r.type === 0),
                isDisliked: comment.reactions.some(r => r.userId === userId && r.type === 1),
                commentLikeCount: comment.reactions.filter(r => r.type === 0).length,
                commentDislikeCount: comment.reactions.filter(r => r.type === 1).length,
            }));
            setComments(fetchedComments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    useEffect(() => {
        if (blogId) {
            fetchBlogDetails()
            fetchComments();
        }
    }, [blogId]);


    const handleAddComment = () => {
        if (!token) {
            swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You must be logged in to add comments.'
            });
            return;
        }

        swal.fire({
            title: 'Add a new comment',
            input: 'textarea',
            inputPlaceholder: 'Type your comment here...',
            inputAttributes: {
                'aria-label': 'Type your comment here'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (comment) => {
                if (!comment) {
                    swal.showValidationMessage('Please enter a comment before submitting.');
                    return false;
                }
                return submitComment(comment);
            },
            allowOutsideClick: () => !swal.isLoading()
        });
    };

    const submitComment = async (comment) => {
        try {
            const response = await axios.post(`${ip}/api/Comment/add/`, {
                blogPostId: blogId,
                content: comment
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                swal.fire({
                    icon: 'success',
                    title: 'Comment added successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchComments(); // Refresh comments after adding
            } else {
                throw new Error('Failed to add comment');
            }
        } catch (error) {
            swal.fire({
                icon: 'error',
                title: 'Failed to add comment',
                text: error.response?.data?.message || 'There was an error while posting your comment.'
            });
        }
    };




    // const [post, setPost] = useState(null)
    // const fetchPostDetails = async () => {
    //     try {
    //         const response = await axios.get(`${ip}/forum/post-detail/${post_id}/`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //             },
    //         });

    //         if (response.status === 200) { // Assuming 200 is the status for a successful request
    //             const data = response.data;
    //             console.log("The Post details are: ", data);
    //             setPost(data)
    //         } else {
    //             console.error('Error fetching posts:', response.statusText);
    //             // Handle error state as needed
    //         }
    //     } catch (error) {
    //         console.error('Error fetching posts:', error);
    //         // Handle error state as needed
    //     }
    // }
    // useEffect(() => {
    //     fetchPostDetails()
    // }, [])


    const [commentText, setCommentText] = useState('')
    const [paddingHeight, setPaddingHeight] = useState(100)
    const adjustTextareaHeight = (textarea) => {
        const maxHeight = 400;
        textarea.style.height = '25px'; // Reset height to auto to calculate the new height
        textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'; // Set the new height, max maxHeightpx
        setPaddingHeight(Math.min(textarea.scrollHeight, maxHeight) + 100)
        if (textarea.scrollHeight > maxHeight) {
            textarea.style.overflowY = 'auto';
        }
    };

    const handleCommentTextareaChange = (e) => {
        console.log(e.target.value)
        setCommentText(e.target.value);
        adjustTextareaHeight(e.target);
    };


    const addComment = async (e) => {
    //     e.preventDefault()
    //     if (commentText.length > 0) {
    //         try {
    //             const response = await axios.post(`${ip}/forum/post/${post_id}/comment/`, {
    //                 text: commentText
    //             }, {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //                 },
    //             });

    //             if (response.status === 201) { // Assuming 200 is the status for a successful request
    //                 const data = response.data;
    //                 console.log('response is : ', data)
    //                 fetchPostDetails();
    //                 setCommentText('')
    //             } else {
    //                 console.error('Error fetching posts:', response.statusText);
    //                 // Handle error state as needed
    //             }
    //         } catch (error) {
    //             console.error('Error fetching posts:', error);
    //             // Handle error state as needed
    //         }
    //     }
    //     else {
    //         swal.fire({
    //             title: "Comment cannot be empty.",
    //             icon: "warning",
    //             toast: true,
    //             timer: 3000,
    //             position: "top-right",
    //             timerProgressBar: true,
    //             showConfirmButton: false,
    //             showCloseButton: true,
    //         });
    //     }

    }

    const [showFullText, setShowFullText] = useState(false);
    return (
        <section className="post-detail-container">
            <div className="post-image-container">
                <div className="image" style={blogDetail ? {
                    backgroundImage: `url(${blogDetail.image})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                } : null}>

                </div>
            </div>
            <div className="right-content">
                <div className="top">
                    <h4>Comments</h4>
                    <button className='cross' onClick={() => navigate('/blogs', { scrollToTop: false })}><RxCross2 /></button>
                </div>

                <div className="post-details">
                    <div className="top">
                        {/* <div className="details-container">
                            <div className="user-details">
                                <div className="image" style={post?.user ? {
                                    backgroundImage: `url(${post?.user?.image})`,
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                } : null}>

                                </div>

                                <div className="details">
                                    <p>{post?.user?.username}</p>
                                    <span>{moment.utc(post?.date).local().startOf('seconds').fromNow()}</span>
                                </div>
                            </div>

                            <span className='icon'><BsThreeDots /></span>
                        </div> */}

                        <p className={`caption ${showFullText ? "show-all" : "limited"}`}>
                            {showFullText ? blogDetail?.body : truncateWords(blogDetail?.body, 30)}
                            {blogDetail?.body?.split(' ').length > 30 && (
                                <button
                                    className="see-more"
                                    style={{ display: 'inline', marginLeft: '5px' }}
                                    onClick={() => setShowFullText(!showFullText)}
                                >
                                    {showFullText ? "See Less" : "See More"}
                                </button>
                            )}
                        </p>
                    </div>

                    {/* <div className="comments-container" style={{ paddingBottom: `${paddingHeight}px` }}>
                        {post?.comments?.map((comment) => {
                            return (
                                <div className="comment">
                                    <div className="image" style={comment ? {
                                        backgroundImage: `url(${comment.user.image})`,
                                        backgroundPosition: 'center',
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                    } : null} onClick={() => history.push(`/profile/${post.user.id}`)}>

                                    </div>

                                    <div className="right">
                                        <div className="content">
                                            <p className="name">{comment?.user?.username}</p>
                                            <p className="text">{comment?.text}</p>
                                        </div>
                                        <span>{moment.utc(comment?.date).local().startOf('seconds').fromNow()}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div> */}

                    <div className="add-comment">
                        <div className="container">
                            <div className="image" style={currentUser ? {
                                backgroundImage: `url(${ip+currentUser.image})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                            } : null}>

                            </div>

                            <div className="right">
                                <form action="" onSubmit={addComment}>
                                    <div className="content">
                                        <textarea placeholder={`Comment as ${currentUser.username}`} value={commentText} onChange={handleCommentTextareaChange}></textarea>
                                    </div>
                                    <div className="bottom">
                                        <button type="submit"><RiSendPlaneFill /></button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default BlogDetail