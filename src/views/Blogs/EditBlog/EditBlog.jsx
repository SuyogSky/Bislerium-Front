import React, { useState } from 'react'
import ip from '../../../ip-config/ip';
import axios from 'axios';
import swal from 'sweetalert2';
import { RxCross2 } from "react-icons/rx";
import { AiOutlineCloudUpload } from "react-icons/ai";

function EditBlog({ fetchPosts, setShowEditForm, blogId, blogTitle, blogDesc, blogImg }) {
    const userImage = localStorage.getItem('image')
    const userName = localStorage.getItem('name')

    const [title, setTitle] = useState(blogTitle)
    const [blogImage, setBlogImage] = useState()

    const [value, setValue] = useState(blogDesc);
    const adjustTextareaHeight = (textarea) => {
        const maxHeight = 300;
        textarea.style.height = 'auto'; // Reset height to auto to calculate the new height
        textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'; // Set the new height, max maxHeightpx
        if (textarea.scrollHeight > maxHeight) {
            textarea.style.overflowY = 'auto';
        }
    };

    const handlePostTextareaChange = (e) => {
        console.log(e.target.value)
        setValue(e.target.value);
        adjustTextareaHeight(e.target);
    };




    const updateBlogFields = ({ title, value }) => {
        const token = localStorage.getItem('token');
        const url = `${ip}/api/BlogPost/update/${blogId}`;
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ Title: title, Body: value })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update post');
                }
                return response.json();
            })
            .then(data => {
                const formData = new FormData();
                formData.append('ImageFile', blogImage);
                updateBlogImage(formData)
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
                setShowEditForm(false)
                swal.fire('Success!', 'Image updated successfully.', 'success')
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            updateBlogFields({ title, value })
        }
        catch (err) {
            console.log(err)
        }

        // try {
        //     const response = await axios.post(`${ip}/api/BlogPost/add/`, formData, {
        //         headers: {
        //             'Authorization': `Bearer ${localStorage.getItem('token')}`
        //         }
        //     });
        //     console.log(response)
        //     if (response.status === 201) {
        //         fetchPosts();
        //         swal.fire({
        //             title: "Post added successfully.",
        //             icon: "success",
        //             toast: true,
        //             timer: 3000,
        //             position: "top-right",
        //             timerProgressBar: true,
        //             showConfirmButton: false,
        //             showCloseButton: true,
        //         });
        //     } else {
        //         throw new Error("Failed to add post"); // This will be caught by the catch block
        //     }
        // } catch (error) {
        //     console.error("Error adding post:", error);
        //     swal.fire({
        //         icon: 'error',
        //         title: "Failed to add post."
        //     });
        // }
    };

    const [imagePreview, setImagePreview] = useState(ip + blogImg);
    const [image, setImage] = useState('')

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setBlogImage(file)
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setImagePreview(reader.result);
            };

            reader.readAsDataURL(file);
        }
    };
    const resolveImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${ip}${url}`;
    };
    return (
        // <section className="add-blog-section">
        //     <div className="form-container">
        //         <div className="header">
        //             <h2>Add a New Blog</h2>
        //             <RxCross2 onClick={resetFormAndCloseModal} />
        //         </div>
        //         <form onSubmit={handleSubmit}>
        //             <label htmlFor='title'>Title:</label>
        //             <input type="text" id='title' name="title" value={newPost.title} onChange={handleInputChange} />

        //             <label htmlFor='description'>Description:</label>
        //             <textarea name="description" id='description' value={newPost.description} onChange={handleInputChange} />

        //             <label htmlFor='post-image'>Upload Image:</label>
        //             <label htmlFor="post-image">
        //                 <div className="post-image" style={imagePreview ? {
        //                     backgroundImage: `url(${resolveImageUrl(imagePreview)})`,
        //                     backgroundPosition: 'center',
        //                     backgroundSize: 'cover',
        //                     backgroundRepeat: 'no-repeat',
        //                 } : null}>

        //                 </div>
        //                 <input type="file" onChange={handleImageChange} />
        //             </label>

        //             <button type="submit">Submit Blog</button>
        //             {formErrors.submit && <p className="error">{formErrors.submit}</p>}
        //         </form>
        //     </div>
        // </section>

        <div className="upload-post-form">
            <form action="" onSubmit={handleSubmit}>
                <div className="top">
                    <h6>Edit Post</h6>
                    <RxCross2 onClick={() => setShowEditForm(false)} />
                </div>
                <div className="user-detail">
                    <div className="image" style={userImage ? {
                        backgroundImage: `url(${ip + userImage})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                    } : null}>

                    </div>
                    <p>
                        <span className="name">{userName}</span>
                        <span className="date">{new Date().toLocaleDateString()}</span>
                    </p>
                </div>

                <div className="post-content-fields">
                    <input type="text" placeholder='Blog Title' required value={title} onChange={(e) => setTitle(e.target.value)} />
                    <textarea
                        value={value}
                        onChange={handlePostTextareaChange}
                        placeholder="Write Your Blog..."
                    />

                    <div className="image-upload">
                        <label htmlFor="post-image" className="image-field">
                            <input type="file" id="post-image" onChange={handleFileChange} />
                            {
                                imagePreview ?
                                    <img src={imagePreview} alt="" srcset="" />
                                    :
                                    <>
                                        <AiOutlineCloudUpload />
                                        <p>Upload Image</p>
                                    </>
                            }
                        </label>
                    </div>
                </div>

                <div className="btn-container">
                    <button type="submit" className="upload-btn">Post</button>
                </div>
            </form>
        </div>
    )
}

export default EditBlog