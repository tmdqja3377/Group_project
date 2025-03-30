import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-date-range/dist/styles.css'; // main style file 
import 'react-date-range/dist/theme/default.css'; // theme css file
import Calendars from "./assets/components/Datecalendar.jsx"
import SpotPage from './pages/SpotPage.jsx';
import Home from './pages/Home.jsx';
import Navibar from "./assets/components/Navibar.jsx";
import Login from "./pages/LoginPage.jsx"
import Map from "./pages/map.jsx"




function App() {
  return (
    <BrowserRouter>
      {/* <Navibar/> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spot" element={<SpotPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </BrowserRouter>
    

  );

  {/* <div className='Menubar'><Navbar/></div> 
      <div className="Calendar"><Calendars/></div> */}

}


export default App;
