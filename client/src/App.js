import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route }
    from 'react-router-dom';
import Home from './pages';
import Terminal from './pages/terminal';
import Update from './pages/update';
import Settings from './pages/settings';

function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
            <Route path='/' element={<Terminal />} />
            <Route path='/update' element={<Update />} />
            <Route path='/settings' element={<Settings/>} />
        </Routes>
    </Router>
);
}

export default App;
