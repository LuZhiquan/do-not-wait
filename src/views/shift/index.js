/**
* @author shining
* @description 交班顶层容器
* @date 2017-05-25
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router';
import './shift-left.less';

@inject('shiftStore') @observer
class Shift extends Component {

  shiftStore = this.props.shiftStore;

  shiftclick = () => {
    this.shiftStore.setthisclick(1);
  }

  shiftrecondclick = () => {
    this.shiftStore.setthisclick(2);
  }

  render() {
    return <div id="shift-index">
      <div className="shift-left">
        <Link to="/shift" className={this.shiftStore.thisclick === 1 ? 'select' : ''} onClick={this.shiftclick}>交班</Link>
        <Link to="/shift/records" className={this.shiftStore.thisclick === 2 ? 'select' : ''} onClick={this.shiftrecondclick}>交班记录</Link>
      </div>
      <div className="shift-right">
        {this.props.children}
      </div>
    </div>
  }

}

export default Shift;