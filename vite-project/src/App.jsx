import Navbar from "./assets/components/Navbar.jsx"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {Link} from 'react-router-dom';
import 'react-date-range/dist/styles.css'; // main style file 
import 'react-date-range/dist/theme/default.css'; // theme css file
import Calendars from "./assets/components/Datecalendar.jsx"
import SpotPage from '../srcv1/pages/SpotPage.jsx';
import Home from '../srcv1/pages/Home.jsx';
import Navibar from "./assets/components/Navibar.jsx";


function App() {
  return (
    <BrowserRouter>
      <Navibar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spot" element={<SpotPage />} />
      </Routes>
    </BrowserRouter>

  );

  {/* <div className='Menubar'><Navbar/></div> 
      <div className="Calendar"><Calendars/></div> */}

}


export default App;
