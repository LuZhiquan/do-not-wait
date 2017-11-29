import React from 'react';
import moment from 'moment';
import classnames from 'classnames';

import CalendarPopup from 'components/calendar-popup';


import './horizontal_datepicker.less';
class HorizontalDatePicker extends React.Component {

    constructor(props){
        super(props);
       
        this.state={
            currentDate:moment(),
            selectDate:this.currentDate,
            dateList:[ 
                moment(this.currentDate),
                moment(this.currentDate).add(1,'days'),
                moment(this.currentDate).add(2,'days'),
                moment(this.currentDate).add(3,'days'),
                moment(this.currentDate).add(4,'days')]                                 
        }
    }

  render() {
    return (   
    <div id="horizontal_data_picker">
        <div className="calendar" onClick={()=>{
            this.setState({calendar:<CalendarPopup minTime={new Date(moment().format("YYYY-MM-DD"))} calendarModalOk={(time)=>{
                this.setState({currentDate:moment(time)});
                this.setState({dateList:[
                    moment(time),
                    moment(time).add(1,'days'),
                    moment(time).add(2,'days'),
                    moment(time).add(3,'days'),
                    moment(time).add(4,'days')
                ]});
                this.setState({selectDate:moment(time)});

                this.setState({calendar:''});

               
                if(this.props.calendarClick){
                    this.props.calendarClick(time);
                }

            }} calendarModalCancel={()=>{
                this.setState({calendar:''});
            }}/>});
        }}>
            <i className="iconfont icon-list_calendar-"></i>
            <p>日历</p>
        </div>
        <ul className="date">
            {this.state.dateList.map((date,index)=>{

                let day;

                switch(moment(date).day()){
                    case 0:
                        day = "星期日";
                    break;
                        case 1:
                        day = "星期一";
                    break;
                        case 2:
                        day = "星期二";
                    break;
                        case 3:
                        day = "星期三";
                    break;
                        case 4:
                        day = "星期四";
                    break;
                        case 5:
                        day = "星期五";
                    break;
                    case 6:
                        day = "星期六";
                    break;
                    default:
                    break;
                }

                if(moment().format('YYYY-MM-DD')===moment(date).format('YYYY-MM-DD')){
                    day='今天';
                }else if(moment().add(1,'days').format('YYYY-MM-DD')===moment(date).format('YYYY-MM-DD')){
                    day='明天';
                }else if(moment().add(2,'days').format('YYYY-MM-DD')===moment(date).format('YYYY-MM-DD')){
                    day='后天';
                }

                return <li key={index} className={classnames({
                    "select":moment(date).format("YYYY-MM-DD")===moment(this.state.selectDate).format("YYYY-MM-DD")
                })} onClick={()=>{
                    this.setState({selectDate:date});
                    if(this.props.dateClick){
                    
                        this.props.dateClick(moment(date).format('YYYY-MM-DD'));
                    }
                }}>
                <p>{day}</p>
                <div>{moment(date).format('MM-DD')}</div>
            </li>
            })}
            
        </ul>    
         {this.state.calendar}           
    </div>
      
    );
  }
}


export default HorizontalDatePicker;