import React, { useState } from "react";
import './RegisterBlogger.scss';
import { useNavigate } from 'react-router-dom';

// Assuming swal.fire is already correctly defined and imported
import ip from '../../../ip-config/ip'
import swal from "sweetalert";
const RegisterBlogger = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        imageFile: null
    });
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        let formIsValid = true;

        if (!formData.username.trim()) {
            formIsValid = false;
            newErrors["username"] = "Username is required.";
        }

        if (!formData.email) {
            formIsValid = false;
            newErrors["email"] = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            formIsValid = false;
            newErrors["email"] = "Email is not valid.";
        }

        if (!formData.password) {
            formIsValid = false;
            newErrors["password"] = "Password is required.";
        }

        if (!formData.confirmPassword) {
            formIsValid = false;
            newErrors["confirmPassword"] = "Confirm password is required.";
        }

        if (formData.password !== formData.confirmPassword) {
            formIsValid = false;
            newErrors["confirmPassword"] = "Passwords do not match.";
        }


        setErrors(newErrors);
        return formIsValid;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateForm()) {
            const data = new FormData();
            data.append('UserName', formData.username);
            data.append('Email', formData.email);
            data.append('Password', formData.password);
            data.append('ConfirmPassword', formData.confirmPassword);
            data.append('Role', 'Blogger');
            if (formData.imageFile) {
                data.append('ImageFile', formData.imageFile);
            }
    
            try {
                const response = await fetch(`${ip}/api/Account/register/`, {
                    method: 'POST',
                    body: data,
                });
                console.log(response)
                if (response.ok) {
                    // swal.fire({
                    //     icon: 'success',
                    //     title: "User registered successfully."
                    // });
                    navigate('/login')
                } else {
                    const error = await response.json();
                    console.log(error);
                    if (error && error.length > 0) {
                        const errorMessage = error.map(e => e.description).join("\n");
                        // swal.fire({
                        //     icon: 'error',
                        //     title: "Error registering user.",
                        //     text: errorMessage
                        // });
                    } else {
                        // swal.fire({
                        //     icon: 'error',
                        //     title: error.detail || "Error registering user."
                        // });
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                // swal.fire({
                //     icon: 'error',
                //     title: "Network error"
                // });
            }
        } else {
            // swal.fire({
            //     icon: 'error',
            //     title: "Validation errors. Check your inputs."
            // });
        }
    };
    

    return (
        <div className="register_container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} />
                    {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>
                    {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                </div>
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                    {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
                </div>
                <div className="form-group">
                    <label>Upload Image:</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {preview && <img src={preview} alt="Preview" style={{ width: "100px", height: "100px" }} />}
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterBlogger;
