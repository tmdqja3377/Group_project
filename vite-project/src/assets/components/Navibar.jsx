import React from "react";
import '../../../srcv1/Appv.css'
import { Link } from 'react-router-dom';

function Navibar() {
    return(
        <nav className="navbar">
                <div className="logo">
                    <Link to="/">
                        CarryA
                    </Link>
                </div>
                <div className="nav-buttons">
                    <Link to="/spot" className="nav-button">
                        여행지
                    </Link>
                    <Link to="/login" className="nav-button login-button">
                        로그인
                    </Link>
                </div>
            </nav>
    );
}

export default Navibar;