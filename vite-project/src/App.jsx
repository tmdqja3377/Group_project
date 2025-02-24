import Calender, { Calendar } from 'react-calendar';
import "react-calendar/dist/Calendar.css";
import "./Apps.css"
import Navbar from "./assets/components/Navbar.jsx"


function App() {
  return (
    <div className="App">
      <div className='Menubar'><Navbar/></div> 
      {/* ºÎÆ®½ºÆ®·¦ : https://getbootstrap.com/docs/5.3/components/navbar/ */}
      <div className="Calendar"><Calendar/></div>

    </div>
  );
}


export default App;
