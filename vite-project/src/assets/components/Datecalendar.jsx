// ���� �� ��ó : https://doqtqu.tistory.com/126
// https://hypeserver.github.io/react-date-range/

import { DateRange } from 'react-date-range';
import { Component } from 'react';
class CalendarComponent extends Component {
  constructor(props) {
    super(props); // React.Component�� ������ �޼ҵ带 ���� ����
    this.state = { // �� ������Ʈ�� state ����
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    };
  };

  

  onRangeChange = (ranges) => {
    console.log(ranges); // native Date object
    this.setState({
      startDate:ranges['selection'].startDate,
      endDate:ranges['selection'].endDate,
      key:ranges['selection'].key,
    });
  }
  render(){
    return (
      <div>
        <DateRange
          editableDateInputs={true}
          onChange={this.onRangeChange}
          moveRangeOnFirstSelection={false}
          ranges={[this.state]}
          months={2}
          direction="horizontal"/>
        {/* <br/>
        <div>Start Date : {this.state.startDate.toString()}</div>
        <br/>
        <div>End Date : {this.state.endDate.toString()}</div> */}
      </div>
    )
  }
}
export default CalendarComponent;