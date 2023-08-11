import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route }
    from 'react-router-dom';
import Home from './pages';
import Terminal from './pages/terminal';
import Update from './pages/update';

function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
            <Route path='/' element={<Terminal />} />
            <Route path='/update' element={<Update />} />

        </Routes>
    </Router>
);
}

export default App;
