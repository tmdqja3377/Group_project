import { createContext, useContext, useState } from 'react';

const ScheduleContext = createContext();

export const useSchedule = () => useContext(ScheduleContext);

export const ScheduleProvider = ({ children }) => {
  const [scheduleData, setScheduleData] = useState({
    "1일차": [],
    "2일차": [],
    "3일차": [],
  });

  return (
    <ScheduleContext.Provider value={{ scheduleData, setScheduleData }}>
      {children}
    </ScheduleContext.Provider>
  );
};
