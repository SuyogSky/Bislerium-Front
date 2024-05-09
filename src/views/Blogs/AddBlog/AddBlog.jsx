import React, { useState } from 'react'
import ip from '../../../ip-config/ip';
import axios from 'axios';
import swal from 'sweetalert2';
import './AddBlog.scss'
import { RxCross2 } from "react-icons/rx";
import { AiOutlineCloudUpload } from "react-icons/ai";

function AddBlog({ fetchPosts, resetFormAndCloseModal }) {
    const userImage = localStorage.getItem('image')
    const userName = localStorage.getItem('name')

    const [title, setTitle] = useState()
    const [blogImage, setBlogImage] = useState()

    const [value, setValue] = useState('');
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('Title', title);
        formData.append('Body', value);
        formData.append('ImageFile', blogImage);

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
            swal.fire({
                icon: 'error',
                title: "Failed to add post."
            });
        }
    };

    const [imagePreview, setImagePreview] = useState(null);
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
                    <h6>Create Post</h6>
                    <RxCross2 onClick={resetFormAndCloseModal} />
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
                    <input type="text" placeholder='Blog Title' required onChange={(e) => setTitle(e.target.value)} />
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

export default AddBlog