import React from 'react';
import { message } from 'antd';
import './calendar-shoose.css';
import { observer, inject } from 'mobx-react';
import CalendarPopup from 'components/calendar-popup'; //日历

message.config({
  top: 300
});

//格式化日期
function formatTime() {
  var year = new Date().getFullYear();
  var month = new Date().getMonth() + 1;
  if (month <= 9) {
    month = '0' + month;
  }
  var day = new Date().getDate();
  if (day <= 9) {
    day = '0' + day;
  }

  return year + '-' + month + '-' + day;
}

@inject('selloutStore')
@observer
class CalendarChoose extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      Calendar: '', //日历控件
      formattime:
        this.props.selloutStore.fillindate === ''
          ? formatTime()
          : this.props.selloutStore.fillindate, //获取当前时间
      foo:
        this.props.selloutStore.showright === true
          ? 'icon-right active-i'
          : 'dis-none' //控制是否可以往右边点
    };
  }

  componentDidUpdate() {}

  //前一天
  nextdate = () => {
    var year = this.state.formattime.substring(0, 4);
    var month = this.state.formattime.substring(5, 7);
    var day = this.state.formattime.substring(8, 10);
    this.getdate(year, month, day, 0);
  };

  //后一天
  lastdate = () => {
    var year = this.state.formattime.substring(0, 4);
    var month = this.state.formattime.substring(5, 7);
    var day = this.state.formattime.substring(8, 10);
    if (this.state.formattime === formatTime()) {
    } else {
      this.getdate(year, month, day, 1);
    }
  };

  getdate = (year, month, day, obj) => {
    var today = new Date(year, month - 1, day);
    var yesterday_milliseconds;
    if (obj === 0) {
      yesterday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24;
    } else if (obj === 1) {
      yesterday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24;
    }

    var yesterday = new Date();
    yesterday.setTime(yesterday_milliseconds);

    var strYear = yesterday.getFullYear();
    var strDay = yesterday.getDate();
    var strMonth = yesterday.getMonth() + 1;
    if (strMonth < 10) {
      strMonth = '0' + strMonth;
    }
    if (strDay < 10) {
      strDay = '0' + strDay;
    }
    var strYesterday = strYear + '-' + strMonth + '-' + strDay;

    this.setState({ formattime: strYesterday });

    var isestime = 'false';
    if (strYesterday < formatTime()) {
      isestime = 'true';
      this.setState({ foo: 'icon-right active-i' });
    } else {
      isestime = 'false';
      this.setState({ foo: 'dis-none' });
    }

    if (this.props.estimeok) {
      this.props.estimeok(isestime);
    }

    if (this.props.activeclick) {
      this.props.activeclick(strYesterday);
    }
  };

  render() {
    this.props.selloutStore.setdatetime(this.state.formattime); //改变后的值存在store里面提供后面使用
    return (
      <div className="estimate-left-calendar">
        <div className="icon-left active-i" onClick={this.nextdate}>
          <i className="iconfont icon-home_title_arrow_left" />
          <span className="previous-day">前一日</span>
        </div>
        <input
          type="text"
          className="calendar-input"
          value={this.state.formattime}
          readOnly
          onClick={() => {
            this.setState({
              Calendar: (
                <CalendarPopup
                  maxTime={new Date(formatTime())}
                  changetime={new Date(this.state.formattime)}
                  calendarModalCancel={() => {
                    this.setState({ Calendar: '' });
                  }}
                  calendarModalOk={newtime => {
                    this.props.selloutStore.setdatetime(newtime);
                    this.setState({ formattime: newtime });
                    this.setState({ Calendar: '' });
                    if (this.props.getResult) {
                      this.props.getResult(newtime);
                    }

                    //返回值判断是否可以继续点击
                    var isestime = 'false';
                    if (newtime < formatTime()) {
                      isestime = 'true';
                      this.setState({ foo: 'icon-right active-i' });
                    } else {
                      isestime = 'false';
                      this.setState({ foo: 'dis-none' });
                    }

                    if (this.props.estimeok) {
                      this.props.estimeok(isestime);
                    }
                  }}
                />
              )
            });
          }}
        />
        <div className={this.state.foo} onClick={this.lastdate}>
          <span className="following-day">后一日</span>
          <i className="iconfont icon-home_title_arrow_right" />
        </div>
        {this.state.Calendar}
      </div>
    );
  }
}

export default CalendarChoose;
