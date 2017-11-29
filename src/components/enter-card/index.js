/**
* @author shelly
* @description 输入餐牌号
* @date 2017-07-5
**/

import React from 'react';
import { Modal, message } from 'antd';
import { inject, observer } from 'mobx-react';

import './enter_card.less';
message.config({
  top: 300,
  duration: 1
});

@inject('settlementStore')
@observer
class DiscountPricePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { price: '', visible: false };
  }

  // 点击确定按钮
  handleOk = () => {
    if (this.state.price === '' || this.state.price === 0) {
      message.info('请输入正确的折扣');
    } else {
      if (this.props.onOk) {
        this.props.onOk(this.state.price);
      }
    }
  };

  // 点击数字键盘
  handleClick = e => {
    let value = e.target.innerHTML;
    let inputVal = this.state.price;
    inputVal = inputVal.concat(value);
    this.setState({ price: inputVal });
  };

  // 点击退格
  handleBack = e => {
    let inputVal = this.state.price;
    inputVal = inputVal.substring(0, inputVal.length - 1);
    this.setState({ price: inputVal });
  };

  render() {
    return (
      <Modal
        id="accredit-modal"
        title={this.props.title}
        visible={true}
        maskClosable={false}
        closable={false}
        okText="确定"
        cancelText="取消"
        width={600}
        height={400}
        wrapClassName="enter-card"
        onCancel={() => {
          if (this.props.onCancel) {
            this.props.onCancel();
          }
        }}
        onOk={() => {
          if (this.props.onOk) {
            this.props.onOk(this.state.price);
          }
        }}
      >
        <input
          type="text"
          value={this.state.price}
          className="price-input"
          placeholder="请输入餐牌号"
          onChange={e => {
            this.setState({ price: e.target.price });
          }}
        />

        <div id="num-key">
          <ul>
            <li className="number" onClick={this.handleClick}>
              A
            </li>
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
              B
            </li>
            <li className="number" onClick={this.handleClick}>
              4
            </li>
            <li className="number" onClick={this.handleClick}>
              5
            </li>
            <li className="number" onClick={this.handleClick}>
              6
            </li>
            <li className="number" />
            <li className="number" onClick={this.handleClick}>
              C
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
            <li className="number confirm" onClick={this.handleClick}>
              0
            </li>
          </ul>
        </div>
      </Modal>
    );
  }
}

export default DiscountPricePopup;
