/**
* @author shelly
* @description 快餐自选的金额结算组件
* @date 2017-05-10
**/

import React from 'react';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';

import './cashier-calculate.less';

@inject('cashierStore')
@observer
class CashierCalculate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { price: props.cashierStore.settleAccount + '' };
  }
  componentWillMount() {
    this.props.cashierStore.changeSettleAccount(0);
  }
  componentWillReceiveProps(nextProps) {
    this.state = { price: nextProps.cashierStore.settleAccount * 1 + '' };
  }
  // 点击数字键盘
  handleClick = e => {
    let cashierStore = this.props.cashierStore;
    let value = e.target.innerHTML;
    let inputVal = this.state.price;
    if (inputVal <= 100000000) {
      if (/\d*\.\d{2}/.test(inputVal)) {
        message.destroy();
        message.info('只能输入两位小数');
      } else {
        if (value >= 0 && value <= 9) {
          inputVal = inputVal.concat(value);
        } else if (value === '.') {
          if (!inputVal.includes('.')) {
            inputVal = inputVal.concat(value);
          }
        }
        if (/^(0{2})/.test(inputVal) || /^(0{1}[1-9]+)/.test(inputVal)) {
          inputVal = inputVal * 1 + '';
        }
      }
    } else {
      message.destroy();
      message.info('已达到最大值');
    }
    this.setState({ price: inputVal });
    cashierStore.changeSettleAccount(inputVal);
  };

  // 点击退格
  handleBack = e => {
    let inputVal = this.state.price;
    inputVal = inputVal.substring(0, inputVal.length - 1);
    this.setState({ price: inputVal });
  };

  render() {
    return (
      <div id="cash-popup" className="cashier-calculate">
        <div className="num-amount">
          <p className="enter-amount">
            请输入结算金额
            <input
              type="text"
              value={this.state.price}
              className="price-input"
              placeholder="0"
              readOnly
            />
          </p>
          <p className="odd-change">
            <strong>找零金额</strong>(只有现金才找零)
            <input
              type="text"
              value={this.state.oddChange}
              placeholder="0"
              readOnly
            />
          </p>
        </div>
        <div id="num-key">
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
            <li className="clear-all">取消</li>
            <li className="number" onClick={this.handleClick}>
              7
            </li>
            <li className="number" onClick={this.handleClick}>
              8
            </li>
            <li className="number" onClick={this.handleClick}>
              9
            </li>
            <li className="cancle" />
            <li className="number" onClick={this.handleClick}>
              0
            </li>
            <li className="number" onClick={this.handleClick}>
              .
            </li>
            <li className="return" onClick={this.handleClick}>
              00
            </li>

            <li
              className="confirm"
              onClick={() => {
                if (this.props.onOk) {
                  if (
                    parseFloat(this.state.price) === 0 ||
                    this.state.price === ''
                  ) {
                    message.destroy();
                    message.info('请输入金额');
                  } else {
                    this.props.onOk(this.state.price);
                  }
                }
              }}
            >
              确<br />定
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default CashierCalculate;
