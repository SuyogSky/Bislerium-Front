import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Blog.scss";
import ip from "../../../../ip-config/ip";
import moment from "moment/moment";
import swal from 'sweetalert2';
import 'boxicons'
import { FaRegGrinStars } from "react-icons/fa";
import EditBlog from "../../EditBlog/EditBlog";
const Blog = ({
    blogId,
    authorName,
    authorImage,
    postImage,
    postTitle,
    description,
    popularity: initialPopularity,
    postLikeCount,
    isLiked: initialIsLiked,
    isDisliked: initialIsDisliked,
    postDislikeCount,
    date,
    commentCount = 0,
    redirectPath,
    fetchPosts,
}) => {
    const [likeCount, setLikeCount] = useState(postLikeCount);
    const [dislikeCount, setDislikeCount] = useState(postDislikeCount);
    const [liked, setLiked] = useState(initialIsLiked);
    const [disliked, setDisliked] = useState(initialIsDisliked);
    const [popularity, setPopularity] = useState(initialPopularity);
    const navigate = useNavigate();
    const currentUserName = localStorage.getItem('name');
    const UPVOTE_WEIGHT = 2;
    const DOWNVOTE_WEIGHT = -1;
    const COMMENT_WEIGHT = 1;
    const handleEdit = () => {
        // swal.fire({
        //     title: 'What would you like to edit?',
        //     showDenyButton: true,
        //     showCancelButton: true,
        //     confirmButtonText: `Image`,
        //     denyButtonText: `Title & Body`,
        // }).then((result) => {
        //     if (result.isConfirmed) {
        //         editImage();
        //     } else if (result.isDenied) {
        //         editFields();
        //     }
        // });
        setShowEditForm(true)
    };
    const editImage = () => {
        swal.fire({
            title: 'Upload new image',
            input: 'file',
            inputAttributes: {
                'accept': 'image/*',
                'aria-label': 'Upload your blog image'
            },
            showCancelButton: true,
            confirmButtonText: 'Upload',
            preConfirm: (file) => {
                if (file) {
                    const formData = new FormData();
                    formData.append('ImageFile', file);
                    updateBlogImage(formData);
                }
            }
        });
    };
    const editFields = () => {
        swal.fire({
            title: 'Edit Title and Body',
            html: '<input id="title" class="swal2-input" placeholder="Title">' +
                '<textarea id="body" class="swal2-textarea" placeholder="Body"></textarea>',
            focusConfirm: false,
            preConfirm: () => {
                const title = swal.getPopup().querySelector('#title').value;
                const body = swal.getPopup().querySelector('#body').value;
                if (!title || !body) {
                    swal.showValidationMessage(`Please enter title and body`);
                }
                return { title: title, body: body };
            },
            showCancelButton: true,
            confirmButtonText: 'Update',
        }).then((result) => {
            if (result.isConfirmed) {
                updateBlogFields(result.value);
            }
        });
    };

    const updateBlogFields = ({ title, body }) => {
        const token = localStorage.getItem('token');
        const url = `${ip}/api/BlogPost/update/${blogId}`;
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ Title: title, Body: body })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update post');
                }
                return response.json();
            })
            .then(data => {
                swal.fire('Success!', 'Post updated successfully.', 'success')
                window.location.reload();
            })
            .catch(error => {
                swal.fire({
                    icon: 'error',
                    title: 'Failed to update post',
                    text: error.toString()
                });
            });
    };

    const updateBlogImage = (formData) => {
        const token = localStorage.getItem('token');
        const url = `${ip}/api/BlogPost/update/image/${blogId}`;

        fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update image');
                }
                return response.json();
            })
            .then(data => {
                swal.fire('Success!', 'Image updated successfully.', 'success')
                window.location.reload();

            }
            )
            .catch(error => {
                console.log(error)
                swal.fire({
                    icon: 'error',
                    title: 'Failed to update image',
                    text: error.toString()
                });
            });
    };

    const handleCommentButtonClick = () => {
        navigate(`/comments/${blogId}`);
    };
    const handleDelete = async () => {
        swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                const url = `/api/BlogPost/delete/${blogId}`;

                fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then(response => {
                        console.log(response.json)
                        console.log(response.text)
                        if (!response.ok) {
                            throw new Error('Failed to delete the blog post');
                        }
                        swal.fire(
                            'Deleted!',
                            'Your post has been deleted.',
                            'success'
                        );
                        window.location.reload();

                    })
                    .catch(error => {
                        swal.fire({
                            icon: 'error',
                            title: 'Failed to delete the post',
                            text: error.toString()
                        });
                        console.error('Error deleting the post:', error);
                    });
            }
        });
    };

    const checkAuthAndAct = (action) => {
        const token = localStorage.getItem('token');
        if (!token) {
            swal.fire({
                icon: 'error',
                title: 'Please log in to perform this action.'
            });
            setTimeout(() => navigate('/login'), 1500);
        } else {
            action();
        }
    };

    const sendReactionToServer = async (reactionType) => {
        const token = localStorage.getItem('token');
        const url = `${ip}/api/BlogReaction/addblogreaction/${blogId}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${token}`
                },
                body: JSON.stringify({ userReaction: reactionType })
            });

            if (!response.ok) {
                throw new Error('Failed to post reaction');
            }
            const data = await response.text();
            return data;
        } catch (error) {
            console.error('Error posting reaction:', error);
        }
    };

    const handleLike = () => {
        checkAuthAndAct(async () => {
            let newLikeCount = liked ? likeCount - 1 : likeCount + 1;
            let newDislikeCount = disliked ? dislikeCount - 1 : dislikeCount;

            setLiked(!liked);
            if (disliked) {
                setDisliked(false);
            }
            setLikeCount(newLikeCount);
            setDislikeCount(newDislikeCount);

            await sendReactionToServer('UpVote');
            setPopularity(calculatePopularity(newLikeCount, newDislikeCount));
        });
    };

    const handleDislike = () => {
        checkAuthAndAct(async () => {
            let newDislikeCount = disliked ? dislikeCount - 1 : dislikeCount + 1;
            let newLikeCount = liked ? likeCount - 1 : likeCount;
            setDisliked(!disliked);
            if (liked) {
                setLiked(false);
            }
            setDislikeCount(newDislikeCount);
            setLikeCount(newLikeCount);
            await sendReactionToServer('DownVote');
            setPopularity(calculatePopularity(newLikeCount, newDislikeCount));
        });
    };

    const calculatePopularity = (newLikeCount, newDislikeCount) => {
        return (newLikeCount * UPVOTE_WEIGHT) +
            (newDislikeCount * DOWNVOTE_WEIGHT) +
            (commentCount * COMMENT_WEIGHT);
    };

    const resolveImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${ip}${url}`;
    };

    const [showEditForm, setShowEditForm] = useState(false)

    return (
        <>
            <div className="blog-card">
            <div className="blog-header">
                <div className="blogger-details">
                    <div className="profile-image" style={authorImage ? {
                        backgroundImage: `url(${resolveImageUrl(authorImage)})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                    } : null}>

                    </div>
                    <div className="details">
                        <span className="blogger-name">{authorName}</span>
                        <span className="blog-date"> {moment.utc(date).local().startOf('seconds').fromNow()}</span>
                    </div>
                </div>
                {currentUserName === authorName && (
                    <div className="blog_action_btns">
                        <box-icon name='edit' type='solid' color="blue" onClick={handleEdit}></box-icon>
                        <box-icon type='solid' name='trash' color="red" onClick={handleDelete}></box-icon>
                    </div>
                )}
            </div>
            <div className="blog-title">{postTitle}</div>
            <div className="blog-description">{description}</div>
            <div className="blog-image" style={postImage ? {
                backgroundImage: `url(${resolveImageUrl(postImage)})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            } : null}>

            </div>
            <div className="blog-actions">
                <button className="like-button" onClick={handleLike}>
                    <box-icon name='like' type={liked ? 'solid' : 'regular'} color={liked ? '#53A1FA' : 'rgba(0,0,0,0.4)'}></box-icon>
                    <span style={{color:`${liked?'#53A1FA':'rgba(0,0,0,0.4)'}`}}>{likeCount}</span>
                </button>
                <button className="dislike-button" onClick={handleDislike}>
                    <box-icon name='dislike' type={disliked ? 'solid' : 'regular'} color={disliked ? '#FC727E' : 'rgba(0,0,0,0.4)'}></box-icon>
                    <span style={{color:`${disliked?'#FC727E':'rgba(0,0,0,0.4)'}`}}>{dislikeCount}</span>
                </button>
                <button className="comment-button" onClick={handleCommentButtonClick} style={{color:'rgba(0,0,0,0.4)'}} >
                    <box-icon name='comment' type='regular' color='rgba(0,0,0,0.3)'></box-icon>
                    Comments&nbsp;({commentCount})
                </button>
                <button className="popularity-button">
                    {/* <box-icon name='star' type='solid' color="orange"></box-icon> */}
                    <FaRegGrinStars />
                    <span>{popularity && popularity>0?popularity:0}</span>
                </button>
            </div>
        </div>
        {showEditForm && (<EditBlog fetchPosts={fetchPosts} setShowEditForm={setShowEditForm} blogId={blogId} blogTitle={postTitle} blogDesc={description} blogImg={postImage} />)}
        </>
    );
};

export default Blog;
