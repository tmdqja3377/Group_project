// Navibar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navibar({ isLoggedIn, setIsLoggedIn }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                setIsLoggedIn(false);
                navigate("/");
            });
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">CarryA</Link>
            </div>
            <div className="nav-buttons">
                <Link to="/spot" className="nav-button">여행지</Link>
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="nav-button logout-button">로그아웃</button>
                ) : (
                    <Link to="/login" className="nav-button login-button">로그인</Link>
                )}
            </div>
        </nav>
    );
}

export default Navibar;
