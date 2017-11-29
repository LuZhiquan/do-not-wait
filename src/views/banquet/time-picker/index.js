import React, { Component } from 'react';
import { TimePicker } from 'antd';
import moment from 'moment';

import './time_picker.less';
const format1 = 'HH';
const format2 = 'mm';

class MyTimePicker extends Component {
  hourChange = (time, timeString) => {
    if (this.props.hourChange) {
      this.props.hourChange(timeString);
    }
  };

  minuteChange = (time, timeString) => {
    if (this.props.minuteChange) {
      this.props.minuteChange(timeString);
    }
  };

  render() {
    let { defaultHour, defaultMinute, open } = this.props;

    if (open) {
      return (
        <div className="my-timer">
          <TimePicker
            className="hour-timer"
            onChange={this.hourChange}
            defaultValue={moment(defaultHour, format1)}
            format={format1}
          />
          <span className="point">：</span>
          <TimePicker
            defaultValue={moment(defaultMinute, format2)}
            format={format2}
            onChange={this.minuteChange}
          />
        </div>
      );
    } else {
      return (
        <div className="my-timer">
          <TimePicker
            className="hour-timer"
            onChange={this.hourChange}
            defaultValue={moment(defaultHour, format1)}
            format={format1}
            open={false}
          />
          <span className="point">：</span>
          <TimePicker
            defaultValue={moment(defaultMinute, format2)}
            format={format2}
            onChange={this.minuteChange}
            open={false}
          />
        </div>
      );
    }
  }
}

export default MyTimePicker;
