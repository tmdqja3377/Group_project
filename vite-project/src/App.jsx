import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import 'react-date-range/dist/styles.css'; // calendar main style
import 'react-date-range/dist/theme/default.css'; // calendar theme css
import LocationListPage from './pages/LocationListPage.jsx';
import Home from './pages/Home.jsx';
import Login from "./pages/LoginPage.jsx"
import CartPage from "./pages/CartPage.jsx"
import MyPage from './pages/MyPage.jsx';
import AIPromptPage from './pages/AIPromptPage.jsx';



function App() {
  const [setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={ <MyPage />} />
        <Route path="/location" element={<LocationListPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Cart" element={<CartPage />} />
        <Route path="/chatbot" element={<AIPromptPage />} />
      </Routes>
    </BrowserRouter>
    

  );

}


export default App;
