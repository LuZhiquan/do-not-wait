/**
* @author shining
* @description 日结
* @date 2017-05-25
**/
import React from 'react';
import { message } from 'antd';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router';
import './dayend-left.less';

message.config({
  top: 300
});

//日结
@inject('dayEndStore')
@observer
class DayEnd extends React.Component {
  shiftclick = () => {
    let dayEndStore = this.props.dayEndStore;
    dayEndStore.setthisclick(1);
    this.context.router.replace('/day-end');
  };

  shiftrecondclick = () => {
    let dayEndStore = this.props.dayEndStore;
    dayEndStore.setthisclick(2);
    this.context.router.replace('/day-end/records');
  };

  render() {
    let dayEndStore = this.props.dayEndStore;
    return (
      <div className="datend-main">
        <div className="datend-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              this.context.router.goBack();
            }}
          />{' '}
          日结
        </div>
        <div id="datend-index">
          <div className="shift-left">
            <Link
              className={dayEndStore.thisclick === 1 ? 'select' : ''}
              onClick={this.shiftclick}
            >
              日结
            </Link>
            <Link
              className={dayEndStore.thisclick === 2 ? 'select' : ''}
              onClick={this.shiftrecondclick}
            >
              日结记录
            </Link>
          </div>
          <div className="shift-right">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

DayEnd.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default DayEnd;
