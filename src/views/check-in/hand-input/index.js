import React from 'react';
import { observer, inject } from 'mobx-react';

import './hand_input.less';

@inject('checkInStore')
@observer
class HandInput extends React.Component {
  constructor(props) {
    super(props);
    this.props.checkInStore.cardCode = '';
  }
  //点击数字
  handleClick = e => {
    this.props.checkInStore.handleClick(e.target.innerHTML);
  };
  //点击回退
  handleBack = () => {
    this.props.checkInStore.handleBack();
  };
  //点击清空
  handleClear = () => {
    this.props.checkInStore.handleClear();
  };
  //刷卡
  cardClick = () => {
    if (this.props.cardClick) {
      this.props.cardClick();
    }
  };
  //签到
  inClick = () => {
    if (this.props.inClick) {
      this.props.inClick();
    }
  };
  //签退
  outClick = () => {
    if (this.props.outClick) {
      this.props.outClick();
    }
  };
  render() {
    return (
      <div className="hand-input">
        <div className="hand-header">
          <span>请输入工号</span>
          <input
            type="text"
            value={this.props.checkInStore.cardCode}
            onChange={e => {
              this.props.checkInStore.cardCode = e.target.value;
            }}
          />
        </div>
        <ul>
          <li className="number" onClick={this.handleClick}>
            1
          </li>
          <li className="number" onClick={this.handleClick}>
            2
          </li>
          <li className="number" onClick={this.handleClick}>
            3
          </li>
          <li
            className="back iconfont icon-order_btn_back"
            onClick={this.handleBack}
          />
          <li className="number" onClick={this.handleClick}>
            4
          </li>
          <li className="number" onClick={this.handleClick}>
            5
          </li>
          <li className="number" onClick={this.handleClick}>
            6
          </li>
          <li className="clear-all" onClick={this.handleClear}>
            清空
          </li>
          <li className="number" onClick={this.handleClick}>
            7
          </li>
          <li className="number" onClick={this.handleClick}>
            8
          </li>
          <li className="number" onClick={this.handleClick}>
            9
          </li>
          <li className="cancle" onClick={this.inClick}>
            签到
          </li>
          <li className="zero" onClick={this.handleClick}>
            0
          </li>
          <li className="use-hand" onClick={this.cardClick}>
            刷卡
          </li>
          <li className="confirm" onClick={this.outClick}>
            签退
          </li>
        </ul>
      </div>
    );
  }
}

export default HandInput;
