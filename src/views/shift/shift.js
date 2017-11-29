/**
 * @author shining
 * @description 交班主界面
 * @date 2017-05-25
 **/

import React, { Component } from 'react';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import Prompt from 'components/prompt-common'; //错误提示
import MyScroll from 'react-custom-scrollbars';
import classnames from 'classnames';
import OpenClassPopup from '../app/open-class-popup'; //开班
import Loading from 'components/loading';

import 'assets/styles/modal.css';
import './shift.less';

message.config({
  top: 300
});

@inject('appStore', 'shiftStore')
@observer
class ShiftRecords extends Component {
  constructor(props, context) {
    super(props, context);
    let shiftStore = this.props.shiftStore;
    shiftStore.setthisclick(1);

    this.state = {
      statePopup: '', //开班
      loading: ''
    };

    let _this = this;
    this.shiftStore.getConnectData(function() {
      _this.setState({
        statePopup: (
          <OpenClassPopup
            closeCancel={() => {
              _this.setState({ statePopup: '' });
            }}
            okCancel={() => {
              _this.setState({ statePopup: '' });
            }}
          />
        )
      });
      _this.shiftStore.isOpenClass = false;
    });
  }

  shiftStore = this.props.shiftStore;

  componentDidUpdate() {
    let feedback = this.shiftStore.feedback;
    if (
      feedback &&
      feedback.status !== 'error' &&
      feedback.status !== 'validate'
    ) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, this.shiftStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, this.shiftStore.closeFeedback());
          break;

        default:
          message.info(feedback.msg, this.shiftStore.closeFeedback());
      }
    }
  }

  //确认交班
  confirmshift = () => {
    this.setState({ loading: true });
    this.shiftStore.getsaveWorking(success => {
      if (success) {
        this.setState({ loading: '' });
        this.shiftStore.isOpenClass = false;
      } else {
        this.setState({ loading: '' });
      }
    });
  };

  preprint = () => {
    this.shiftStore.getpreprint(this.shiftStore.sumworkingID);
  };

  render() {
    let account =
      sessionStorage.getItem('account') &&
      JSON.parse(sessionStorage.getItem('account'));
    let connectdata = this.shiftStore.connectdata;
    let workingMoney = this.shiftStore.workingMoney;
    let orderMoneyVO = this.shiftStore.orderMoneyVO;
    let orderMoneylist = this.shiftStore.orderMoneylist;
    let unSubscribeMoneylist = this.shiftStore.unSubscribeMoneylist;
    let memberMoneylist = this.shiftStore.memberMoneylist;
    let bookingMoneylist = this.shiftStore.bookingMoneylist;
    let feedback = this.shiftStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        this.shiftStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    //判断是不是正餐模式
    const isDinner = account.businessPattern === 1238;

    return (
      <div id="shift-main">
        <div className="shift-title">
          <div className="title-main">
            <span>
              {' '}
              {connectdata.createTime} 至 {connectdata.endTime}{' '}
            </span>
            <span>
              <em>订单餐次：</em> <i>{connectdata.mealsName}</i>
            </span>
            <span>
              <em>交班人：</em>
              {connectdata.creatorName}
            </span>
            <span>
              <em>收银机：</em>
              {connectdata.deviceCode}
            </span>
          </div>
        </div>
        <div className="shift-data">
          <MyScroll>
            <div className="each-main">
              <div className="each-list">
                <p>
                  <span className="each-title">
                    <em>
                      {' '}
                      营业<br />统计
                    </em>
                  </span>
                </p>
                <p>
                  {/*<span>收入总额：{workingMoney.inComeAmount}</span>*/}
                  <span>订单收入：{workingMoney.orderInComeAmount}</span>
                  <span className="dashed">
                    开票金额：{workingMoney.billingAmount}
                  </span>
                  <span>现金：{workingMoney.cashAmount}</span>
                </p>
                <p>
                  <span>会员充值收款：{workingMoney.memberInComeAmount}</span>
                  {/*<span>还款金额：{workingMoney.refundAmount}</span>*/}
                  <span className="dashed">
                    备用金：{workingMoney.backUpAmount}
                  </span>
                  <span>微信：{workingMoney.wxAmount}</span>
                </p>
                <p>
                  <span>
                    {isDinner &&
                      `预收订金：${
                        workingMoney.bookingInComeAmount > -1
                          ? workingMoney.bookingInComeAmount
                          : ''
                      }`}
                  </span>
                  <span className="dashed" />
                  <span>支付宝：{workingMoney.aliAmount}</span>
                </p>
                <p>
                  <span>
                    {isDinner &&
                      `退还订金：${
                        workingMoney.returnBookingAmount > -1
                          ? workingMoney.returnBookingAmount
                          : ''
                      }`}
                  </span>
                  <span className="dashed" />
                  <span>K币：{workingMoney.kbAmount}</span>
                </p>
              </div>

              <div className="each-list">
                <p>
                  <span className="each-title">
                    <em>
                      {' '}
                      订单<br />统计
                    </em>
                  </span>
                </p>
                <p>
                  <span>订单数：{orderMoneyVO.orderNum}</span>
                  <span>折扣金额：{orderMoneyVO.discountAmount}</span>
                  <span>订单金额：{orderMoneyVO.orderPayAmount}</span>
                </p>
                <p>
                  <span>人数：{orderMoneyVO.peopleNum}</span>
                  <span>减免金额：{orderMoneyVO.jianmianAmount}</span>
                </p>
                <p>
                  <span>消费金额：{orderMoneyVO.orderAmount}</span>
                  <span>服务费：{orderMoneyVO.feeAmount}</span>
                </p>
                <p>
                  <span>赠菜金额：{orderMoneyVO.zengsongAmount}</span>
                  <span>抹零：{orderMoneyVO.molingAmount}</span>
                </p>
              </div>

              <div className="each-list-child">
                <p>
                  <span className="each-title">
                    <em>
                      订单<br />收款
                    </em>
                  </span>
                </p>
                <div className="each-text-main">
                  {(() => {
                    if (orderMoneylist.length) {
                      return orderMoneylist.map((orderMoney, i) => {
                        let lempnum;
                        if (Number(orderMoney.num) !== 0) {
                          lempnum = '(' + orderMoney.num + '笔)';
                        } else {
                          lempnum = '';
                        }
                        if (orderMoney.amount !== 0) {
                          return (
                            <span key={i}>
                              {orderMoney.payMethodName}：{orderMoney.amount}{' '}
                              {lempnum}
                            </span>
                          );
                        } else {
                          return null;
                        }
                      });
                    }
                  })()}
                </div>
              </div>

              <div className="each-list-child">
                <p>
                  <span className="each-title">
                    <em>
                      {' '}
                      会员<br />充值
                    </em>
                  </span>
                </p>
                <div className="each-text-main">
                  {(() => {
                    if (memberMoneylist.length) {
                      return memberMoneylist.map((member, i) => {
                        let lempnum;
                        if (Number(member.num) !== 0) {
                          lempnum = '(' + member.num + '笔)';
                        } else {
                          lempnum = '';
                        }
                        if (member.amount !== 0) {
                          return (
                            <span key={i}>
                              {member.payMethodName}：{member.amount} {lempnum}
                            </span>
                          );
                        } else {
                          return null;
                        }
                      });
                    }
                  })()}
                </div>
              </div>

              {isDinner && (
                <div className="each-list-child">
                  <p>
                    <span className="each-title">
                      <em>
                        {' '}
                        预收<br />订金{' '}
                      </em>
                    </span>
                  </p>
                  <div className="each-text-main">
                    {(() => {
                      if (bookingMoneylist.length) {
                        return bookingMoneylist.map((bookingMoney, i) => {
                          let lempnum;
                          if (Number(bookingMoney.num) !== 0) {
                            lempnum = '(' + bookingMoney.num + '笔)';
                          } else {
                            lempnum = '';
                          }
                          if (bookingMoney.amount !== 0) {
                            return (
                              <span key={i}>
                                {bookingMoney.payMethodName}：{
                                  bookingMoney.amount
                                }{' '}
                                {lempnum}
                              </span>
                            );
                          } else {
                            return null;
                          }
                        });
                      }
                    })()}
                  </div>
                </div>
              )}

              {isDinner && (
                <div className="each-list-child">
                  <p>
                    <span className="each-title">
                      <em>退订</em>
                    </span>
                  </p>
                  <div className="each-text-main">
                    {(() => {
                      if (unSubscribeMoneylist.length) {
                        return unSubscribeMoneylist.map(
                          (unSubscribeMoney, i) => {
                            let lempnum;
                            if (Number(unSubscribeMoney.num) !== 0) {
                              lempnum = '(' + unSubscribeMoney.num + '笔)';
                            } else {
                              lempnum = '';
                            }
                            if (unSubscribeMoney.amount !== 0) {
                              return (
                                <span key={i}>
                                  {unSubscribeMoney.payMethodName}：{
                                    unSubscribeMoney.amount
                                  }{' '}
                                  {lempnum}
                                </span>
                              );
                            } else {
                              return null;
                            }
                          }
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </MyScroll>
        </div>

        <div className="shift-button">
          <button
            className={classnames({
              disabled: this.shiftStore.isOpenClass === false
            })}
            onClick={this.shiftStore.isOpenClass !== false && this.confirmshift}
          >
            确认交班
          </button>
          <button
            className={classnames({
              disabled: this.shiftStore.isOpenClass === false
            })}
            onClick={this.shiftStore.isOpenClass !== false && this.preprint}
          >
            预打印
          </button>
        </div>
        {operatePrompt}
        {this.state.statePopup}
        {this.state.loading && <Loading />}
      </div>
    );
  }
}

export default ShiftRecords;
