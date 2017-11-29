/**
* @author shining
* @description 日结详情
* @date 2017-05-26
**/
import React from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars';
import './day-end-popup.less';

@inject('dayEndStore')
@observer
class DayEndPopup extends React.Component {
  //取消关闭的按钮
  handleCancel = () => {
    if (this.props.closebutton) {
      this.props.closebutton();
    }
  };

  render() {
    let dayEndStore = this.props.dayEndStore;
    let connectdata = dayEndStore.connectdata;
    let workingMoney = dayEndStore.workingMoney;
    console.log(workingMoney);
    let orderMoneyVO = dayEndStore.orderMoneyVO;
    let orderMoneylist = dayEndStore.orderMoneylist; //订单还款
    let unSubscribeMoneylist = dayEndStore.unSubscribeMoneylist; //退订
    let memberMoneylist = dayEndStore.memberMoneylist; //会员充值
    let bookingMoneylist = dayEndStore.bookingMoneylist; //预收订金
    return (
      <div>
        <Modal
          title="日结详情"
          visible={true}
          onCancel={this.handleCancel}
          footer={null}
          width={900}
          wrapClassName="day-end-popup-modal"
        >
          <div className="shift-title">
            <span>
              <em>营业日:</em>
              {connectdata.businessDate}
            </span>
            <span>
              <em>日结人:</em>
              {connectdata.creatorName}
            </span>
            <span>
              <em>日结设备:</em>
              {connectdata.deviceCode}
            </span>
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
                    <span className="dashed" />
                    <span>微信：{workingMoney.wxAmount}</span>
                  </p>
                  <p>
                    <span>预收订金：{workingMoney.bookingInComeAmount}</span>
                    <span className="dashed" />
                    <span>支付宝：{workingMoney.aliAmount}</span>
                  </p>
                  <p>
                    <span>退还订金：{workingMoney.returnBookingAmount}</span>
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
                    <span>订单数:{orderMoneyVO.orderNum}</span>
                    <span>折扣金额:{orderMoneyVO.discountAmount}</span>
                    <span>订单金额：{orderMoneyVO.orderPayAmount}</span>
                  </p>
                  <p>
                    <span>人数:{orderMoneyVO.peopleNum}</span>
                    <span>减免金额:{orderMoneyVO.jianmianAmount}</span>
                  </p>
                  <p>
                    <span>消费金额:{orderMoneyVO.orderAmount}</span>
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
                        {' '}
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
                                {orderMoney.payMethodName}:{orderMoney.amount}
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
                                {member.payMethodName}:{member.amount} {lempnum}
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
                        预收<br />订金
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
                                {bookingMoney.payMethodName}:{bookingMoney.amount}
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
                                  {unSubscribeMoney.payMethodName}:{unSubscribeMoney.amount}
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
              </div>
            </MyScroll>
          </div>
        </Modal>
      </div>
    );
  }
}

export default DayEndPopup;
