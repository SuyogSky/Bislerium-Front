import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegisterBlogger from './views/UserAuthentication/RegisterBlogger/RegisterBlogger'
import Login from './views/UserAuthentication/Login/Login';
import ViewBlogs from './views/Blogs/ViewBlogs/ViewBlogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/blogs' element={<ViewBlogs />} />
        <Route path='/register' element={<RegisterBlogger />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
