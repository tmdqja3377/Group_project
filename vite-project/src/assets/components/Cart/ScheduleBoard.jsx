import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DropDay from './DropDay.jsx';

const ScheduleBoard = () => {
  const days = ['1일차', '2일차', '3일차'];

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        {days.map((day, index) => (
          <DropDay key={index} day={day} />
        ))}
      </div>
    </DndProvider>
  );
};

export default ScheduleBoard;
