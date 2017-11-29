/**
 * @author William Cui
 * @description 选择结算方式弹窗
 * @date 2017-05-10
 **/

import React from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { getJSON } from 'common/utils';

import './replace-payment-popup.less';

/**************** 支付方式组件 *****************/
function PayMent({ payMent, clickHandle, active }) {
  return (
    <li
      onClick={clickHandle}
      className={classnames({
        'payment-frame': true,
        active: active,
        'pay-yellow': payMent.paymentMethodID === 5, //现金支付
        'pay-azureblue': payMent.paymentMethodID === 88, //银行卡
        'pay-green':
          payMent.paymentMethodID === 6 || payMent.paymentMethodID === 11, //微信扫码 11为微信线下//微信扫码
        'pay-blue':
          payMent.paymentMethodID === 7 || payMent.paymentMethodID === 12, // 12为支付宝线下//支付宝扫码
        'pay-purple': payMent.paymentMethodID === 8, //会员卡
        // 'hide-cash': payMent.paymentMethodID === 8,//会员卡
        'pay-cilaccolour':
          payMent.paymentName === '代金券' ||
          payMent.paymentName === '积分折现' ||
          payMent.paymentName === 'K币' ||
          payMent.paymentName === '挂账'
      })}
    >
      <i
        className={classnames({
          iconfont: true,
          'icon-xianjin': payMent.paymentMethodID === 5,
          'icon-weixinzhifu':
            payMent.paymentMethodID === 6 || payMent.paymentMethodID === 11,
          'icon-umidd17':
            payMent.paymentMethodID === 7 || payMent.paymentMethodID === 12,
          'icon-huiyuanqia': payMent.paymentMethodID === 8,
          'icon-yinxingqia': payMent.paymentMethodID === 88, //银行卡
          'icon-account_btn_k': payMent.paymentMethodID === 88, //K币
          'icon-account_btn_guazhang': payMent.paymentMethodID === 88, //挂账
          'icon-xianjinquan': payMent.paymentMethodID === 88, //现金券
          'icon-jifen': payMent.paymentMethodID === 88 //积分折现
        })}
      />
      {payMent.paymentMethodID === 6 ||
      payMent.paymentMethodID === 7 ||
      payMent.paymentMethodID === 8 ? (
        <em>线上</em>
      ) : (
        ''
      )}
      <span>{payMent.paymentName}</span>
    </li>
  );
}
/**************** 支付方式组件 *****************/

@inject('settlementStore')
@observer
class ReplacePaymentPopup extends React.Component {
  state = { paymentMethodID: '', paymentName: '' };
  paymentList = this.props.settlementStore.paymentList;

  handleOk = () => {
    const { paymentMethodID, paymentName } = this.state;
    this.props.onConfirm({ paymentMethodID, paymentName });
    this.props.onClose && this.props.onClose();
  };

  handleCancel = () => {
    this.props.onClose && this.props.onClose();
  };

  handleSelectPayment = (paymentMethodID, paymentName) => {
    this.setState({ paymentMethodID, paymentName });
  };

  render() {
    return (
      <Modal
        title="选择结算方式"
        visible={true}
        maskClosable={false}
        width={700}
        wrapClassName="replace-payment-popup"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <ul className="payment-method">
          {this.paymentList.map((payment, index) => {
            return (
              !payment.isOnline && (
                <PayMent
                  key={index}
                  payMent={payment}
                  clickHandle={this.handleSelectPayment.bind(
                    this,
                    payment.paymentMethodID,
                    payment.paymentName
                  )}
                  active={
                    this.state.paymentMethodID === payment.paymentMethodID
                  }
                />
              )
            );
          })}
        </ul>
      </Modal>
    );
  }
}

export default ReplacePaymentPopup;
