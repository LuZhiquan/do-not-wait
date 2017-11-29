
/**
 * @auhor	gaomeng
 * @param	null
 * @time 2017-3-21
 * @desription 独立的时钟组件，同步本地时间
 * @example  2017-03-21 09:12
 * @return null
 *
 */

import React from 'react';
import './clock.css';
import { getNowTime } from 'common/utils';

class Clock extends React.Component {
  constructor(props, context) {

    super(props, context);

    this.state = {
      time: getNowTime()
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      time: getNowTime()
    });
  }

  render() {

    return <span className="clock-style">{this.state.time}</span>

  }
}

export default Clock;
