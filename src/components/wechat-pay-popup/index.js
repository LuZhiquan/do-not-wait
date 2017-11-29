/**
* @author Shelly
* @description 微信扫码 
* @date 2017-6-4
**/
import React from 'react';
import { Modal } from 'antd';
import weChatImg from '../../assets/images/weixin.png';
import aliPayImg from '../../assets/images/zhifubao.png';

import './wechat_pay_popup.less';

class WechatPay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { inputValue: '' };
  }

  componentDidMount() {
    this.nameInput.focus();
  }

  render() {
    return (
      <div id="wechat-pay">
        <Modal
          title={this.props.title}
          visible={true}
          maskClosable={false}
          closable={false}
          okText="确定"
          cancelText="取消"
          width={400}
          wrapClassName="wechat-pay-modal"
          onCancel={() => {
            if (this.props.onCancel) {
              this.props.onCancel();
            }
          }}
          onOk={() => {
            if (this.props.onOk) {
              this.props.onOk(this.state.inputValue);
            }
          }}
        >
          <div>
            <div className="change-tab">
              {this.props.title.indexOf('微信') === 0 ? (
                <img src={weChatImg} alt="微信支付" />
              ) : (
                <img src={aliPayImg} alt="支付宝" />
              )}
            </div>
            <p className="wechat-text">
              <span className="gray-text">本次收款(元)</span>
              <span className="wechat-amount">
                {parseFloat(this.props.inputValue).toFixed(2)}
              </span>
            </p>
            <p className="wechat-code">
              付款码<input
                type="text"
                value={this.state.inputValue}
                onChange={e => {
                  this.setState({ inputValue: e.target.value });
                }}
                ref={input => {
                  this.nameInput = input;
                }}
              />
            </p>
          </div>
        </Modal>
      </div>
    );
  }
}

export default WechatPay;
