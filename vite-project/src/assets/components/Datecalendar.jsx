// ���� �� ��ó : https://doqtqu.tistory.com/126
// https://hypeserver.github.io/react-date-range/

import { DateRange } from 'react-date-range';
import { Component } from 'react';

class CalendarComponent extends Component {
  render() {
    const { startDate, endDate, onRangeChange } = this.props;

    return (
      <div>
        <DateRange
          editableDateInputs={true}
          onChange={onRangeChange}
          moveRangeOnFirstSelection={false}
          ranges={[{
            startDate: startDate,
            endDate: endDate,
            key: 'selection'
          }]}
          months={2}
          direction="horizontal"
        />
      </div>
    );
  }
}


export default CalendarComponent;