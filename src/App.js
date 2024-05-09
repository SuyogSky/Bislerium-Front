import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegisterBlogger from './views/UserAuthentication/RegisterBlogger/RegisterBlogger'
import Login from './views/UserAuthentication/Login/Login';
import ViewBlogs from './views/Blogs/ViewBlogs/ViewBlogs';
import Profile from './views/Profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/blogs' element={<ViewBlogs />} />

        <Route path='/register' element={<RegisterBlogger />} />
        <Route path='/login' element={<Login />} />

        <Route path='/profile' element={<Profile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
