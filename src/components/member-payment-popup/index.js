/**
* @author shelly
* @description 会员卡信息
* @date 2017-06-18
**/

import React from 'react';
import {Modal, message} from 'antd';
import {inject, observer} from 'mobx-react';
import Password from 'components/password-popup'; //会员卡密码

import './member_payment_popup.less';
message.config({top: 300, duration: 1, statePopup: false});

@inject('settlementStore', 'cashierStore')@observer
class MemberPaymentPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      price: (this.props.price * 1).toFixed(2) + '',
      visible: false,
      isFirst: true
    };
  };

  // 点击确定按钮
  handleOk = () => {
    let cashierStore = this.props.cashierStore;
    if (this.state.price === '' || parseFloat(this.state.price) === 0 || this.state.price === '.') {
      message.destroy();
      message.info("请输入正确的金额");
      return;
    } 
    if (parseFloat(this.props.cardInfo.fundAmount) < parseFloat(this.state.price)) {
      message.destroy();
      message.info("余额不足");
      return;
    }
    if (this.state.price * 1 > this.props.price * 1) { //控制金额不能大于待付金额
      message.destroy();
      message.info("最多可输入" + this.props.price + "元");
      return;
    }
    if (this.props.isCashierMember) {
      if (this.props.inputValue * 1 !== this.state.price * 1) {
        message.destroy();
        message.info("请支付" + this.props.inputValue * 1 + "元")
      } else {
        cashierStore.hasPassword
        ? this.setState({statePopup: <Password
            onOk={(password) => {
            this.props.onOk(this.state.price, password);
          }}
            onCancel={() => {
            this.setState({statePopup: false})
          }}/>})
        : this.props.onOk(this.state.price, '');
      }
    } else {
      cashierStore.hasPassword
        ? this.setState({statePopup: <Password
            onOk={(password) => {
            this.props.onOk(this.state.price, password);
          }}
            onCancel={() => {
            this.setState({statePopup: false})
          }}/>})
        : this.props.onOk(this.state.price, '');
    }
  }

  // 点击数字键盘
  handleClick = (e) => {
    let value = e.target.innerHTML;
    let inputVal = this.state.price;
    if (inputVal.startsWith('.')) {
      inputVal = '0' + inputVal;
    }

    if (this.state.isFirst) {
      inputVal = '';
      this.setState({price: 0})
      this.setState({isFirst: false});
    }

    if (inputVal <= 100000000) {
      if (/\d*\.\d{2}/.test(inputVal)) { //匹配只能输入两位小数
        message.destroy();
        message.info('只能输入两位小数');
      } else {
        if (value >= 0 && value <= 9) {
          inputVal = inputVal.concat(value);
        } else if (value === '.') {
          if (!inputVal.includes(".")) {
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

    this.setState({price: inputVal});

  }

  // 点击退格
  handleBack = (e) => {
    let inputVal = this.state.price;
    inputVal = inputVal.substring(0, inputVal.length - 1);
    this.setState({price: inputVal});
  }

  render() {
    return (
      <Modal
        id="accredit-modal"
        title="会员卡"
        visible={true}
        maskClosable={false}
        okText='确定'
        cancelText='放弃'
        width={960}
        height={600}
        wrapClassName="member-payment-popup"
        onCancel={() => {
        if (this.props.onCancel) {
          this
            .props
            .onCancel();
        }
      }}
        onOk={this.handleOk}>
        <div className="left">
          <label className="info-name">会员编号</label>
          <input className="info-detail" value={this.props.cardInfo.cardID} readOnly/>
          <label className="info-name">会员名称</label>
          <input className="info-detail" value={this.props.cardInfo.memberName} readOnly/>
          <label className="info-name">卡号</label>
          <input className="info-detail" value={this.props.cardInfo.cardCode} readOnly/>
          <label className="info-name">卡类别</label>
          <input className="info-detail" value={this.props.cardInfo.roleName} readOnly/>
          <label className="info-name">有效期至</label>
          <input
            className="info-detail"
            value={this.props.cardInfo.expirationDate}
            readOnly/>
          <div className="unchange">
            <label className="info-name">卡余额</label>
            <input
              className="info-detail"
              value={this.props.cardInfo.fundAmount
              ? this.props.cardInfo.fundAmount
              : 0}
              readOnly/>
            <label className="info-name">可用积分</label>
            <input className="info-detail" value={this.props.cardInfo.totalBonus} readOnly/>
          </div>

        </div>
        <div className="right">
          <input
            type="text"
            value={this.state.price}
            className="price-input"
            placeholder="0"
            onChange={(e) => {
            this.setState({price: e.target.price});
          }}/>

          <div id="num-key">
            <ul>
              <li className="number" onClick={this.handleClick}>1</li>
              <li className="number" onClick={this.handleClick}>2</li>
              <li className="number" onClick={this.handleClick}>3</li>
              <li className="number" onClick={this.handleClick}>4</li>
              <li className="number" onClick={this.handleClick}>5</li>
              <li className="number" onClick={this.handleClick}>6</li>
              <li className="number" onClick={this.handleClick}>7</li>
              <li className="number" onClick={this.handleClick}>8</li>
              <li className="number" onClick={this.handleClick}>9</li>
              <li className="number" onClick={this.handleClick}>.</li>
              <li className="number" onClick={this.handleClick}>0</li>
              <li className="back iconfont icon-order_btn_back" onClick={this.handleBack}></li>
            </ul>
          </div>
        </div>
        {this.state.statePopup}

      </Modal>
    )
  }
}

export default MemberPaymentPopup;