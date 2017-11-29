/**
* @author shelly
* @description 快餐自选的支付金额组件
* @date 2017-05-10
**/

import React from 'react';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';

import './cashier_calculate_payment.less';

@inject('cashierStore')
@observer
class CashierCalculate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      price: (this.props.price * 1).toFixed(2) + '',
      isFirst: true
    };
  }

  componentWillMount() {
    let cashierStore = this.props.cashierStore;
    cashierStore.changePayAccount(this.state.price);
  }
  componentWillReceiveProps(nextProps) {
    this.state = { price: nextProps.price + '' };
  }
  // 点击数字键盘
  handleClick = e => {
    let cashierStore = this.props.cashierStore;
    let value = e.target.innerHTML;
    let inputVal = this.state.price;
    if (inputVal.startsWith('.')) {
      inputVal = '0' + inputVal;
    }

    if (this.state.isFirst) {
      inputVal = '';
      this.setState({ price: 0 });
      this.setState({ isFirst: false });
    }

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
    cashierStore.changePayAccount(inputVal);
    cashierStore.changeNoteAccount(inputVal - cashierStore.settleAccount);
  };
  //点击带有￥的键盘
  handleAmountClick = e => {
    let cashierStore = this.props.cashierStore;
    let value = e.target.innerHTML.replace(/[^0-9]/gi, '');

    this.setState({ price: value });
    cashierStore.changePayAccount(value);
    cashierStore.changeNoteAccount(value - cashierStore.settleAccount);
  };

  // 点击退格
  handleBack = e => {
    let cashierStore = this.props.cashierStore;
    let inputVal = this.state.price;
    inputVal = inputVal.substring(0, inputVal.length - 1);
    this.setState({ price: inputVal });
    cashierStore.changePayAccount(inputVal);
    cashierStore.changeNoteAccount(inputVal - cashierStore.settleAccount);
  };

  render() {
    let cashierStore = this.props.cashierStore;
    return (
      <div id="cash-popup" className="cashier-calculate">
        <div
          className={classnames({
            'pay-amount': true,
            'not-show': !cashierStore.payWindowShow
          })}
        >
          结算金额 <span>{cashierStore.settleAccount * 1}</span>
        </div>
        <div className="num-amount">
          <p className="enter-amount">
            请输入支付金额
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
              value={parseFloat(cashierStore.noteAccount).toFixed(2)}
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
            <li
              className="cancel"
              onClick={() => {
                if (this.props.onCancel) {
                  this.props.onCancel();
                }
              }}
            >
              取消
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
            <li className="number">
              <span>￥</span>
              {cashierStore.changeKey}{' '}
              <p onClick={this.handleAmountClick}>{cashierStore.changeKey}</p>
            </li>
            <li className="number" onClick={this.handleClick}>
              0
            </li>
            <li className="number" onClick={this.handleClick}>
              .
            </li>
            <li className="number">
              <span>￥</span>50 <p onClick={this.handleAmountClick}>50</p>
            </li>
            <li className="number">
              <span>￥</span>100<p onClick={this.handleAmountClick}>100</p>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default CashierCalculate;
