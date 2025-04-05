// DropDay.jsx 수정
import { useDrop } from 'react-dnd';
import DraggableItem from './DraggableItem.jsx';
import { useSchedule } from '../../context/ScheduleContext.jsx';

const DropDay = ({ day }) => {
  const { scheduleData, setScheduleData } = useSchedule();

  const [{ isOver }, drop] = useDrop({
    accept: 'SCHEDULE_ITEM',
    drop: (item) => {
      setScheduleData(prev => {
        if (prev[day].find(i => i.id === item.id)) return prev;
        return { ...prev, [day]: [...prev[day], item] };
      });
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} style={{ minWidth: '250px', minHeight: '400px', backgroundColor: isOver ? '#f0f8ff' : '#f7f7f7', border: '2px dashed #ddd', borderRadius: '12px', padding: '10px' }}>
      <h3 style={{ textAlign: 'center' }}>{day}</h3>
      {scheduleData[day].map(item => (
        <DraggableItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default DropDay;
