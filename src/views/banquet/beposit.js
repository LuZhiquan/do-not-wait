/**
* @author shining
* @description 宴会收订金
* @date 2017-06-27
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';
import { message } from 'antd';
import WechatPay from 'components/wechat-pay-popup';
import 'assets/iconfont/iconfont.css';
import './beposit.less';

@inject('banquetCreateStore', 'banquetListStore')
@observer
class BanquetPay extends Component {
  constructor(props, context, handleClick) {
    super(props, context);
    this.state = {
      clickpay: 0, //选择哪一种方式支付
      WechatPay: '' //微信支付宝弹窗
    };
  }

  banquetListStore = this.props.banquetListStore;
  //取消
  buttoncancel = () => {
    this.context.router.goBack();
  };

  componentDidUpdate() {
    let feedback = this.banquetListStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, this.banquetListStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, this.banquetListStore.closeFeedback());
          break;
        case 'error':
          message.warn(feedback.msg, this.banquetListStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, this.banquetListStore.closeFeedback());
      }
    }
  }

  payItemClick = paymentMethodID => {
    switch (paymentMethodID) {
      case 5: //现金
        this.setState({ clickpay: 5 });
        break;
      case 6: //微信线上
        this.setState({
          WechatPay: (
            <WechatPay
              title="微信"
              inputValue={
                (this.banquetListStore.paysummoney * 1).toFixed(2) * 1
              }
              onCancel={() => {
                this.setState({ WechatPay: '' });
              }}
              onOk={inputValue => {
                this.banquetListStore.banquetpay({
                  orderNumber: this.banquetListStore.bookingID,
                  orderMoney: this.banquetListStore.paysummoney,
                  paymentMethodID: this.state.clickpay,
                  authCode: inputValue,
                  success: function() {
                    this.banquetListStore.comfirmPay({
                      bookingID: this.banquetListStore.bookingID,
                      amount: this.banquetListStore.paysummoney,
                      payMethod: this.state.clickpay
                    });
                  }
                });
                // this.setState({WechatPay:''});
              }}
            />
          ),
          clickpay: 6
        });
        break;
      case 7: //支付宝线上
        this.setState({
          WechatPay: (
            <WechatPay
              title="支付宝"
              inputValue={
                (this.banquetListStore.paysummoney * 1).toFixed(2) * 1
              }
              onCancel={() => {
                this.setState({ WechatPay: '' });
              }}
              onOk={inputValue => {
                this.banquetListStore.banquetpay({
                  orderNumber: this.banquetListStore.bookingID,
                  orderMoney: this.banquetListStore.paysummoney,
                  paymentMethodID: this.state.clickpay,
                  authCode: inputValue,
                  success: function() {
                    this.banquetListStore.comfirmPay({
                      bookingID: this.banquetListStore.bookingID,
                      amount: this.banquetListStore.paysummoney,
                      payMethod: this.state.clickpay
                    });
                  }
                });
                // this.setState({WechatPay:''})
              }}
            />
          ),
          clickpay: 7
        });
        break;
      case 8: //会员
        break;
      case 11: //微信线下
        this.setState({ clickpay: 11 });
        break;
      case 12: //支付宝线下
        this.setState({ clickpay: 12 });
        break;
      default:
    }
  };

  //完成的按钮
  finishclick = () => {
    if (this.state.clickpay === 0) {
      message.destroy();
      message.warn('请选择一种支付方式');
    } else {
      if (
        this.state.clickpay === 5 ||
        this.state.clickpay === 11 ||
        this.state.clickpay === 12
      ) {
        this.banquetListStore.comfirmPay({
          bookingID: this.banquetListStore.bookingID,
          amount: this.banquetListStore.paysummoney,
          payMethod: this.state.clickpay
        });
      }
    }
  };

  banquetListStore = this.props.banquetListStore;
  banquetCreateStore = this.props.banquetCreateStore;

  render() {
    let feedback = this.banquetListStore.feedback;
    let bookingobj = this.banquetListStore.bookingobj;
    let tableNUMList = this.banquetListStore.tableNUMList;
    this.banquetListStore.paysummoney =
      (bookingobj.pendingBookAmount * 1).toFixed(2) * 1;
    let openTime;
    if (bookingobj.openTime) {
      openTime = bookingobj.openTime.split(' ')[1].slice(0, 5);
    }

    return (
      <div id="banquetpay-main">
        <div className="banquetpay-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              this.context.router.goBack();
            }}
          />
          预订收款
        </div>
        <div className="banquetpay-all-main">
          <div className="banquetpay-left-main">
            <div className="left-content">
              <div className="left-list">
                <Scrollbars>
                  <div className="left-list-main">
                    <p className="guest-information">
                      {bookingobj.customerName}{' '}
                      <i className="iconfont icon-yuding_phone_laidian" />{' '}
                      {bookingobj.phone}
                    </p>
                    <div className="details-content">
                      <span>宴会单号</span>
                      <em>{bookingobj.bookingID}</em>
                    </div>
                    <div className="details-content">
                      <span>宴会名称</span>
                      <em>{bookingobj.partyName}</em>
                      <span>宴会类型</span>
                      <em>{bookingobj.partyTypeName}</em>
                    </div>
                    <div className="details-content">
                      <span>婚宴日期</span>
                      <em>{bookingobj.bookingTime}</em>
                      <span>开席时间</span>
                      <em>{openTime}</em>
                    </div>

                    {(() => {
                      if (tableNUMList.length > 0) {
                        return tableNUMList.map((tab, index) => {
                          return (
                            <div className="order-classification" key={index}>
                              {tab.typeName !== '' && (
                                <p className="especially">{tab.typeName}</p>
                              )}
                              <div className="details-content">
                                <span>预订桌数</span>
                                <em>{tab.bookingNum}桌</em>
                                <span>备用桌数</span>
                                <em>{tab.backupNum}桌</em>
                              </div>
                              <div className="details-content">
                                <span>每桌价格</span>
                                <em>{(tab.amount * 1).toFixed(2) * 1}元</em>
                                <span>订单总额</span>
                                <em>
                                  {(tab.amount * tab.bookingNum).toFixed(2) *
                                    1}元
                                </em>
                              </div>
                            </div>
                          );
                        });
                      }
                    })()}
                    <div className="details-content">
                      <span>订单总额</span>
                      <em>
                        {(bookingobj.banqTotalAmount * 1).toFixed(2) * 1}元
                      </em>
                    </div>
                    <hr className="css-hr" />
                    <div className="details-content">
                      <span>预订说明</span>
                      <em>{bookingobj.bookingDesc}</em>
                    </div>
                    <div className="details-content">
                      <span>场地布置</span>
                      <em>{bookingobj.layoutSite}</em>
                    </div>
                    <div className="details-content">
                      <span>摆台要求</span>
                      <em>{bookingobj.dressTable}</em>
                    </div>
                    <div className="details-content">
                      <span>音响要求</span>
                      <em>{bookingobj.audio}</em>
                    </div>
                  </div>
                </Scrollbars>
              </div>
            </div>
            <div className="left-bottom">
              <button onClick={this.buttoncancel}>取消</button>
            </div>
          </div>
          <div className="banquetpay-right-main">
            <div className="right-content">
              <div className="right-list">
                <div className="show-money">
                  <p>{(bookingobj.banqTotalAmount * 1).toFixed(2) * 1}</p>
                  <span>订单总额(元)</span>
                  <p>{(bookingobj.bookingAmount * 1).toFixed(2) * 1}</p>
                  <span>已收订金(元)</span>
                  <p>{(bookingobj.pendingBookAmount * 1).toFixed(2) * 1}</p>
                  <span>本次收款(元)</span>
                </div>
                <div className="payment-method">
                  {this.banquetCreateStore.paymentMethod.map(
                    (payItem, index) => {
                      let block;
                      switch (payItem.paymentMethodID) {
                        case 5: //现金
                          block = (
                            <div
                              key={index}
                              className={classnames({
                                'payment-frame pay-yellow': true,
                                paymask: this.state.clickpay === 5
                              })}
                              onClick={() => {
                                this.payItemClick(payItem.paymentMethodID);
                              }}
                            >
                              {this.state.clickpay === 5 && (
                                <i className="iconfont icon-yes" />
                              )}
                              <i className="iconfont icon-xianjin" />
                              <span>现金</span>
                            </div>
                          );
                          break;
                        case 6: //微信线上
                          block = (
                            <div
                              key={index}
                              className={classnames({
                                'payment-frame pay-green': true
                              })}
                              onClick={() => {
                                this.payItemClick(payItem.paymentMethodID);
                              }}
                            >
                              <i className="iconfont icon-weixinzhifu" />
                              <em>线上</em>
                              <span>微信</span>
                            </div>
                          );
                          break;
                        case 7: //支付宝线上
                          block = (
                            <div
                              key={index}
                              className={classnames({
                                'payment-frame pay-blue': true
                              })}
                              onClick={() => {
                                this.payItemClick(payItem.paymentMethodID);
                              }}
                            >
                              <i className="iconfont icon-umidd17" />
                              <em>线上</em>
                              <span>支付宝</span>
                            </div>
                          );
                          break;
                        case 8: //会员卡
                          break;
                        case 11: //微信线下
                          block = (
                            <div
                              key={index}
                              className={classnames({
                                'payment-frame pay-green': true,
                                paymask: this.state.clickpay === 11
                              })}
                              onClick={() => {
                                this.payItemClick(payItem.paymentMethodID);
                              }}
                            >
                              <i className="iconfont icon-weixinzhifu" />
                              {this.state.clickpay === 11 && (
                                <i className="iconfont icon-yes" />
                              )}
                              <span>微信</span>
                            </div>
                          );
                          break;
                        case 12: //支付宝线下
                          block = (
                            <div
                              key={index}
                              className={classnames({
                                'payment-frame pay-blue': true,
                                paymask: this.state.clickpay === 12
                              })}
                              onClick={() => {
                                this.payItemClick(payItem.paymentMethodID);
                              }}
                            >
                              {this.state.clickpay === 12 && (
                                <i className="iconfont icon-yes" />
                              )}
                              <i className="iconfont icon-umidd17" />
                              <span>支付宝</span>
                            </div>
                          );
                          break;
                        default:
                      }
                      return block;
                    }
                  )}
                </div>
              </div>
            </div>
            <div className="right-bottom">
              <button onClick={this.finishclick}>完成</button>
            </div>
          </div>
        </div>
        {this.state.WechatPay}
      </div>
    );
  }
}

BanquetPay.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default BanquetPay;
