import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-date-range/dist/styles.css'; // main style file 
import 'react-date-range/dist/theme/default.css'; // theme css file
import LocationListPage from './pages/LocationListPage.jsx';
import Home from './pages/Home.jsx';
import Navbar from "./assets/components/Navbar.jsx";
import Login from "./pages/LoginPage.jsx"
import CartPage from "./pages/CartPage.jsx"
import MyPage from './pages/MyPage.jsx';




function App() {
  return (
    <BrowserRouter>
      {/* <Navibar/> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={ <MyPage />} />
        <Route path="/location" element={<LocationListPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Cart" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
    

  );

}


export default App;
