import React from 'react'
import './NavBar.scss'
import { Link, useNavigate } from 'react-router-dom'
function NavBar() {
    const navigate = useNavigate()
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
            <button className="register" onClick={() => navigate('/register')}>Register</button>
            <button className="login" onClick={() => navigate('/login')}>Login</button>
        </div>
    </header>
  )
}

export default NavBar