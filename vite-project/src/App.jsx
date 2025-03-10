import Navbar from "./assets/components/Navbar.jsx"

import 'react-date-range/dist/styles.css'; // main style file 
import 'react-date-range/dist/theme/default.css'; // theme css file
import Calendars from "./assets/components/Datecalendar.jsx"

function App() {
  return (
    <div className="App">
      <div className='Menubar'><Navbar/></div> 
      <div className="Calendar"><Calendars/></div>
    </div>
  );
}


export default App;
