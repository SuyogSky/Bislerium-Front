import React, { useState } from "react";
import './RegisterBlogger.scss';
import { useNavigate } from 'react-router-dom';
import ImagePlaceholder from '../../../assets/Images/image.jpg'
// Assuming swal.fire is already correctly defined and imported
import ip from '../../../ip-config/ip'
import swal from "sweetalert2";
import NavBar from '../../../components/NavBar/NavBar'
const RegisterBlogger = () => {
    const navigate = useNavigate();

    const [userName, setUserName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [confirmPassword, setConfirmPassword] = useState()
    const [image, setImage] = useState()

    const [displayImage, setDisplayImage] = useState(ImagePlaceholder)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setDisplayImage(event.target.result);
            };

            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (userName && email && password && confirmPassword && image) {
            if (password == confirmPassword) {
                const formdata = new FormData();
                formdata.append('UserName', userName);
                formdata.append('Email', email);
                formdata.append('Password', password);
                formdata.append('ConfirmPassword', confirmPassword);
                formdata.append('Role', 'Blogger');
                if (image) {
                    formdata.append('ImageFile', image);
                    console.log(userName, email, password, confirmPassword, image)
                }

                try {
                    const response = await fetch(`${ip}/api/Account/register/`, {
                        method: 'POST',
                        body: formdata,
                    });
                    console.log("The Response is: ", response.body)
                    if (response.ok) {
                        swal.fire({
                            title: "Registration Successful",
                            icon: "success",
                            toast: true,
                            timer: 3000,
                            position: "top-right",
                            timerProgressBar: true,
                            showConfirmButton: false,
                            showCloseButton: true,
                        });
                        navigate('/login')
                    } else {
                        const error = await response.json();
                        console.log("The Error is: ", error);
                        if (error.errors) {
                            swal.fire({
                                title: "Please enter valid email.",
                                icon: "error",
                                toast: true,
                                timer: 3000,
                                position: "top-right",
                                timerProgressBar: true,
                                showConfirmButton: false,
                                showCloseButton: true,
                            });
                        }
                        if (error.err[0].description) {
                                swal.fire({
                                    title: error.err[0].description,
                                    icon: "error",
                                    toast: true,
                                    timer: 3000,
                                    position: "top-right",
                                    timerProgressBar: true,
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                });
                        }
                        else if(error.err){
                            swal.fire({
                                title: error.err,
                                icon: "error",
                                toast: true,
                                timer: 3000,
                                position: "top-right",
                                timerProgressBar: true,
                                showConfirmButton: false,
                                showCloseButton: true,
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            else {
                swal.fire({
                    title: "Confirm password didn't matched.",
                    icon: "warning",
                    toast: true,
                    timer: 3000,
                    position: "top-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    showCloseButton: true,
                });
            }
        }
        else {
            swal.fire({
                title: "Please fill all the fields.",
                icon: "warning",
                toast: true,
                timer: 3000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: true,
            });
        }
    };


    return (
        <>
            <NavBar />
            <section className="register-blogger">
            <form onSubmit={handleSubmit} noValidate>
                <h2>Register</h2>

                <div className="profile">
                    <label htmlFor="profile-image">
                        <div className="image" style={displayImage ? {
                            backgroundImage: `url(${displayImage})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                        } : null}>

                        </div>
                    </label>
                    <input type="file" accept="image/*" id="profile-image" onChange={handleImageUpload} />
                </div>

                <div className="username">
                    <label htmlFor="username">Username <span>*</span></label>
                    <input type="text" name="username" id="username" onChange={(e) => setUserName(e.target.value)} />
                </div>

                <div className="email">
                    <label htmlFor="email">Email <span>*</span></label>
                    <input type="email" name="email" id="email" onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="password">
                    <label htmlFor="password">Password <span>*</span></label>
                    <input type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div className="confirm-password">
                    <label htmlFor="confirm-password">Confirm Password <span>*</span></label>
                    <input type="password" id="confirm-password" name="confirmPassword" onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>

                <button type="submit">Register</button>
                <p className="link">Already have an account? <span onClick={() => navigate('/login')}>Login</span></p>
            </form>
        </section>
        </>
    );
};

export default RegisterBlogger;
