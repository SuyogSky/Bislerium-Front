import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar';
import RegisterBlogger from './views/UserAuthentication/RegisterBlogger/RegisterBlogger'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/register' element={<RegisterBlogger />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
