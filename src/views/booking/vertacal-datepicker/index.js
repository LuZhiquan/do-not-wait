import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { message } from 'antd';

import './vertical-datapicker.less';

message.config({
  top: 300
});
class VerticalDatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: moment(),
      selectDate: this.currentDate,
      dateList: [
        moment(this.currentDate),
        moment(this.currentDate).add(1, 'days'),
        moment(this.currentDate).add(2, 'days'),
        moment(this.currentDate).add(3, 'days'),
        moment(this.currentDate).add(4, 'days'),
        moment(this.currentDate).add(5, 'days'),
        moment(this.currentDate).add(6, 'days')
      ]
    };
  }
  componentWillReceiveProps(props) {
    if (props.currentTime !== this.props.currentTime) {
      this.setState({ currentDate: moment(props.currentTime) });
      this.setState({ selectDate: moment(props.currentTime) });
      this.setState({
        dateList: [
          moment(props.currentTime),
          moment(props.currentTime).add(1, 'days'),
          moment(props.currentTime).add(2, 'days'),
          moment(props.currentTime).add(3, 'days'),
          moment(props.currentTime).add(4, 'days'),
          moment(props.currentTime).add(5, 'days'),
          moment(props.currentTime).add(6, 'days')
        ]
      });
    }
  }

  preClick = () => {
    let current = moment().format('YYYY-MM-DD');
    let dateList0 = this.state.dateList[0].format('YYYY-MM-DD');

    let current7Days = moment()
      .add(7, 'days')
      .format('YYYY-MM-DD');

    if (moment(dateList0).isAfter(current7Days)) {
      this.setState({
        dateList: [
          moment(dateList0).subtract(7, 'days'),
          moment(dateList0).subtract(6, 'days'),
          moment(dateList0).subtract(5, 'days'),
          moment(dateList0).subtract(4, 'days'),
          moment(dateList0).subtract(3, 'days'),
          moment(dateList0).subtract(2, 'days'),
          moment(dateList0).subtract(1, 'days')
        ]
      });
    } else if (moment(dateList0).isSame(current7Days)) {
      this.setState({
        dateList: [
          moment(dateList0).subtract(7, 'days'),
          moment(dateList0).subtract(6, 'days'),
          moment(dateList0).subtract(5, 'days'),
          moment(dateList0).subtract(4, 'days'),
          moment(dateList0).subtract(3, 'days'),
          moment(dateList0).subtract(2, 'days'),
          moment(dateList0).subtract(1, 'days')
        ]
      });
    } else if (moment(dateList0).isBetween(current, current7Days)) {
      this.setState({
        dateList: [
          moment(),
          moment().add(1, 'days'),
          moment().add(2, 'days'),
          moment().add(3, 'days'),
          moment().add(4, 'days'),
          moment().add(5, 'days'),
          moment().add(6, 'days')
        ]
      });
    } else {
      message.destroy();
      message.info('日期不能小于今天。查询历史订单请到预订查询', 2);
    }
  };
  todayClick = () => {
    this.setState({ currentDate: moment() });
    this.setState({ selectDate: moment() });
    this.setState({
      dateList: [
        moment(),
        moment().add(1, 'days'),
        moment().add(2, 'days'),
        moment().add(3, 'days'),
        moment().add(4, 'days'),
        moment().add(5, 'days'),
        moment().add(6, 'days')
      ]
    });

    if (this.props.todayClick) {
      this.props.todayClick(moment());
    }
  };

  nextClick = () => {
    let date6 = this.state.dateList[6].format('YYYY-MM-DD');

    this.setState({
      dateList: [
        moment(date6).add(1, 'days'),
        moment(date6).add(2, 'days'),
        moment(date6).add(3, 'days'),
        moment(date6).add(4, 'days'),
        moment(date6).add(5, 'days'),
        moment(date6).add(6, 'days'),
        moment(date6).add(7, 'days')
      ]
    });
  };

  render() {
    return (
      <div id="vertical_date_picker">
        <div className="pre-week" onClick={this.preClick}>
          前一周
        </div>
        <div className="today" onClick={this.todayClick}>
          今天
        </div>
        <ul className="day-list">
          {this.state.dateList.map((date, index) => {
            let day;

            switch (moment(date).day()) {
              case 0:
                day = '星期日';
                break;
              case 1:
                day = '星期一';
                break;
              case 2:
                day = '星期二';
                break;
              case 3:
                day = '星期三';
                break;
              case 4:
                day = '星期四';
                break;
              case 5:
                day = '星期五';
                break;
              case 6:
                day = '星期六';
                break;
              default:
                break;
            }
            return (
              <li
                key={index}
                onClick={() => {
                  if (
                    !moment(moment(date).format('YYYY-MM-DD')).isBefore(
                      moment().format('YYYY-MM-DD')
                    )
                  ) {
                    this.setState({ selectDate: date });

                    if (this.props.dateClick) {
                      this.props.dateClick(date);
                    }
                  } else {
                    message.destroy();
                    message.info('日期不能小于今天。查询历史订单请到预订查询', 2, () => {});
                  }
                }}
                className={classnames({
                  select:
                    moment(date).format('YYYY-MM-DD') ===
                    moment(this.state.selectDate).format('YYYY-MM-DD'),
                  disable: moment(moment(date).format('YYYY-MM-DD')).isBefore(
                    moment().format('YYYY-MM-DD')
                  )
                })}
              >
                <p>{day}</p>
                <div>{moment(date).format('MM-DD')}</div>
              </li>
            );
          })}
        </ul>
        <div className="next-week" onClick={this.nextClick}>
          后一周
        </div>
      </div>
    );
  }
}

export default VerticalDatePicker;
