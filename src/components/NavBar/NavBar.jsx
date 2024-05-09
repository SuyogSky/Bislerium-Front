import React from 'react'
import './NavBar.scss'
import { Link, useNavigate } from 'react-router-dom'
import ip from '../../ip-config/ip'
import { IoSettingsOutline } from "react-icons/io5";
import { BiLogOutCircle } from "react-icons/bi";
function NavBar() {
    const navigate = useNavigate()

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userImage = localStorage.getItem('image')
    const resolveImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${ip}${url}`;
    };

    const logout = () => {
        localStorage.clear()
        sessionStorage.clear()
        navigate('/')
    }
    return (
        <header className='nav-bar'>
            <div className="logo">
                <span className="icon">BL</span>
                <div className="text">
                    <h4>Bislerium</h4>
                    <p>Blogs PVT. LTD.</p>
                </div>
            </div>

            <ul>
                <li><Link to='/'>Home</Link></li>
                <li><Link to='/blogs'>Blogs</Link></li>
                <li><Link to='/profile'>Profile</Link></li>
            </ul>

            <div className="user">
                {user ?
                    <div className='profile-container'>
                        <div className="profile-image" style={userImage ? {
                            backgroundImage: `url(${resolveImageUrl(userImage)})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                        } : null}>

                        </div>
                        <div className="options">
                            <ul>
                                <li><IoSettingsOutline />Edit Profile</li>
                                <li onClick={logout}><BiLogOutCircle />Logout</li>
                            </ul>
                        </div>
                    </div>
                    :
                    <>
                        <button className="register" onClick={() => navigate('/register')}>Register</button>
                        <button className="login" onClick={() => navigate('/login')}>Login</button>
                    </>
                }
            </div>
        </header>
    )
}

export default NavBar