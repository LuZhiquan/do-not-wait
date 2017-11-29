/**
* @author gm
* @description 客户详情
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router';
import { Tabs, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import CustomerArchiveBlock from '../customer-archive-block';
import CancelBookingReasonPopup from '../cancel-boking-reason-popup';
import AlterBooking from '../alter-booking';
import RefundMoney from '../refund-money';

import { checkPermission } from 'common/utils';
import Accredit from 'components/accredit-popup';

import './customer_detail_block.less';
const TabPane = Tabs.TabPane;

@inject('bookingStore', 'appStore')
@observer
class CustomerDetailBolck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reasonPopup: '',
      alterPopup: '',
      refundPopup: '',
      statePopup: false,
      accreditPopup: ''
    };
  }

  componentDidUpdate() {
    let bookingStore = this.props.bookingStore;
    let feedback = bookingStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, bookingStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, bookingStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, bookingStore.closeFeedback());
      }
    }
  }

  render() {
    let bookingStore = this.props.bookingStore;

    let recordDetail = bookingStore.recordDetail.bookingDetail;

    let dishesList = bookingStore.recordDetail.tableOrderDetail;

    let bookingTypeName, bookingStatusName;
    switch (recordDetail && recordDetail.bookingType) {
      case 614:
        bookingTypeName = '预订点菜';
        break;
      case 615:
        bookingTypeName = '预订留位';
        break;
      case 616:
        bookingTypeName = '普通预订';
        break;
      default:
        break;
    }

    switch (recordDetail && recordDetail.bookingStatus) {
      case 617:
        bookingStatusName = '未知';
        break;
      case 618:
        bookingStatusName = '成功';
        break;
      case 619:
        bookingStatusName = '失败';
        break;
      case 620:
        bookingStatusName = '已过期';
        break;
      case 621:
        bookingStatusName = '已删除';
        break;
      case 622:
        bookingStatusName = '已改期';
        break;
      case 729:
        bookingStatusName = '已取消';
        break;
      case 759:
        bookingStatusName = '预订完成';
        break;
      case 762:
        bookingStatusName = '排队';
        break;
      case 1002:
        bookingStatusName = '进行中';
        break;
      case 1012:
        bookingStatusName = '待支付';
        break;
      default:
        break;
    }

    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let original = permissionList.includes('TableOperation:Original'); //预订开台
    let modifyReservation = permissionList.includes(
      'ReservationModule:ModifyReservation'
    ); //修改预订

    let btnBlock;
    switch (bookingStore.recordItem.bookingStatus) {
      case 729: //取消状态下 退订金
        if (recordDetail && recordDetail.bookingType !== 616) {
          btnBlock = (
            <div className="detail-btns">
              {false && (
                <div
                  className="item"
                  onClick={() => {
                    this.setState({
                      refundPopup: (
                        <RefundMoney
                          cancelClick={() => {
                            this.setState({ refundPopup: '' });
                          }}
                          okClick={(bookingID, money) => {
                            bookingStore.submitRefundMoney(bookingID, money);
                            this.setState({ refundPopup: '' });
                          }}
                        />
                      )
                    });
                  }}
                >
                  退订金
                </div>
              )}
            </div>
          );
        }
        break;

      case 618: //成功  状态下  修改预订   取消预订  预订开台
        btnBlock = (
          <div className="detail-btns">
            {modifyReservation && (
              <div
                className="item"
                onClick={() => {
                  this.setState({
                    alterPopup: (
                      <AlterBooking
                        cancelClick={() => {
                          this.setState({ alterPopup: '' });
                        }}
                        okClick={(number, remarks) => {
                          bookingStore.alterBooking(
                            number,
                            remarks,
                            bookingStore.recordItem.bookingID
                          );
                          this.setState({ alterPopup: '' });
                        }}
                      />
                    )
                  });
                }}
              >
                修改预订
              </div>
            )}
            <div
              className="item"
              onClick={() => {
                let _this = this;
                let object = {
                  moduleCode: 'ReservationModule',
                  privilegeCode: 'CancelReservation',
                  title: '取消预订',
                  toDoSomething: function() {
                    _this.setState({
                      reasonPopup: (
                        <CancelBookingReasonPopup
                          okClick={() => {
                            _this.setState({ reasonPopup: '' });
                          }}
                          cancelClick={() => {
                            _this.setState({ reasonPopup: '' });
                          }}
                        />
                      )
                    });
                  },
                  closePopup: function() {
                    _this.setState({ accreditPopup: '' });
                  },
                  failed: function() {
                    _this.setState({
                      accreditPopup: (
                        <Accredit
                          module={{
                            title: object.title,
                            moduleCode: object.moduleCode,
                            privilegeCode: object.privilegeCode
                          }}
                          onOk={() => {
                            object.closePopup();
                            object.toDoSomething();
                          }}
                          onCancel={() => {
                            object.closePopup();
                          }}
                        />
                      )
                    });
                  }
                };
                checkPermission(object);
              }}
            >
              取消预订
            </div>
            {original && (
              <div
                className="item"
                onClick={() => {
                  //开台拦截日结
                  let appStore = this.props.appStore;
                  appStore.checkBeforeDailyWorking({
                    success: () => {
                      //判断是否可以预定开台
                      bookingStore.bookingIsOpen({
                        bookingID: bookingStore.recordItem.bookingID,
                        success: () => {
                          browserHistory.push({
                            pathname: '/dine',
                            state: {
                              operationType: 'booking',
                              bookingID: bookingStore.recordItem.bookingID
                            }
                          });
                        }
                      });
                    }
                  });
                }}
              >
                预订开台
              </div>
            )}
          </div>
        );
        break;

      case 1012: //待支付   修改预订  取消预订
        btnBlock = (
          <div className="detail-btns">
            {modifyReservation && (
              <div
                className="item"
                onClick={() => {
                  this.setState({
                    alterPopup: (
                      <AlterBooking
                        cancelClick={() => {
                          this.setState({ alterPopup: '' });
                        }}
                        okClick={(number, remarks) => {
                          bookingStore.alterBooking(
                            number,
                            remarks,
                            bookingStore.recordItem.bookingID
                          );
                          this.setState({ alterPopup: '' });
                        }}
                      />
                    )
                  });
                }}
              >
                修改预订
              </div>
            )}
            <div
              className="item"
              onClick={() => {
                let _this = this;
                let object = {
                  moduleCode: 'ReservationModule',
                  privilegeCode: 'CancelReservation',
                  title: '取消预订',
                  toDoSomething: function() {
                    _this.setState({
                      reasonPopup: (
                        <CancelBookingReasonPopup
                          okClick={() => {
                            _this.setState({ reasonPopup: '' });
                          }}
                          cancelClick={() => {
                            _this.setState({ reasonPopup: '' });
                          }}
                        />
                      )
                    });
                  },
                  closePopup: function() {
                    _this.setState({ accreditPopup: '' });
                  },
                  failed: function() {
                    _this.setState({
                      accreditPopup: (
                        <Accredit
                          module={{
                            title: object.title,
                            moduleCode: object.moduleCode,
                            privilegeCode: object.privilegeCode
                          }}
                          onOk={() => {
                            object.closePopup();
                            object.toDoSomething();
                          }}
                          onCancel={() => {
                            object.closePopup();
                          }}
                        />
                      )
                    });
                  }
                };
                checkPermission(object);
              }}
            >
              取消预订
            </div>
            {bookingStore.recordItem.bookingChannel === 739 && (
              <div
                className="item"
                onClick={() => {
                  bookingStore.goToPay(recordDetail.bookingID);
                }}
              >
                支付
              </div>
            )}
          </div>
        );
        break;
      default:
        break;
    }

    return (
      <div id="customer_detail_block">
        <div className="detail-title">
          {!this.props.isClose && (
            <i
              className="iconfont icon-pop_close- close"
              onClick={() => {
                if (this.props.closeClick) {
                  this.props.closeClick();
                }
              }}
            />
          )}
          <i className="iconfont icon-yuding_phone_laidian" />
          <div className="person">
            <p className="name">{recordDetail && recordDetail.contact}</p>
            <p className="phone">{recordDetail && recordDetail.mobile}</p>
          </div>
        </div>
        <div className="detail-tabs">
          <Tabs defaultActiveKey="1">
            <TabPane tab="预订单详情" key="1">
              <Scrollbars>
                <div className="order-info">
                  <div className="serial">
                    {recordDetail && recordDetail.bookingCode}
                  </div>
                  <ul className="info-list">
                    <li>
                      <span className="cu-title">预订时间：</span>
                      {recordDetail && recordDetail.bookingTime}
                    </li>
                    <li>
                      <span className="cu-title">状态：</span>
                      {bookingStatusName}
                    </li>
                    <li>
                      <span className="cu-title">人 数：</span>
                      {recordDetail && recordDetail.peopleNum}
                    </li>
                    <li className="desk">
                      <span className="cu-title">预订桌台：</span>
                      {recordDetail && recordDetail.tableCodes}
                    </li>
                    <li>
                      <span className="cu-title">预订方式：</span>
                      {bookingTypeName}
                    </li>
                    <li>
                      <span className="cu-title">预付订金：</span>
                      {recordDetail &&
                        recordDetail.bookingAmount &&
                        recordDetail.bookingAmount}
                    </li>
                    <li>
                      <span className="cu-title">预订来源：</span>
                      {recordDetail && recordDetail.bookingChannelDesc}
                    </li>
                    <li>
                      <span className="cu-title">消费金额：</span>
                      {recordDetail &&
                        recordDetail.actualAmount &&
                        recordDetail.actualAmount}
                    </li>
                  </ul>
                  <div className="info-remarks">
                    <span className="cu-title">取消原因：</span>
                    {recordDetail && recordDetail.memo}
                  </div>
                  <div className="info-remarks">
                    <span className="cu-title">备注：</span>
                    {recordDetail && recordDetail.bookingDesc}
                  </div>

                  {recordDetail &&
                    recordDetail.bookingType === 614 && (
                      <div className="dishes-list">
                        {recordDetail &&
                          recordDetail.bookingType === 614 &&
                          dishesList && (
                            <Tabs defaultActiveKey="0">
                              {dishesList.map((table, index) => {
                                let item = table.orderDetail.map(
                                  (ele, mindex) => {
                                    /*********2017-9-29 by FXL************* */
                                    if (
                                      ele.assortedDishesList &&
                                      ele.assortedDishesList.length > 0
                                    ) {
                                      //存在拼菜列表
                                      let spellDish = ele.assortedDishesList.map(
                                        (spell, sindex) => {
                                          return (
                                            <div key={sindex} className="item">
                                              <span />
                                              <span>{spell.productName}</span>
                                              <span>{spell.quantity}</span>
                                              <span>{spell.amount}</span>
                                              <span>{spell.valueNames}</span>
                                            </div>
                                          );
                                        }
                                      );
                                      return (
                                        <div key={mindex}>
                                          <div className="item">
                                            <span>{mindex + 1}</span>
                                            <span>
                                              【{ele.assortedDishesList[0].assortedDishesName}】
                                            </span>
                                            <span>{ele.quantity}</span>
                                            <span />
                                            <span />
                                          </div>
                                          {spellDish}
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div key={mindex} className="item">
                                          <span>{mindex + 1}</span>
                                          <span>{ele.productName}</span>
                                          <span>{ele.quantity}</span>
                                          <span>{ele.totalAmount}</span>
                                          <span>{ele.valueNames}</span>
                                        </div>
                                      );
                                    }
                                    /*********2017-9-29 by FXL************* */
                                    // return (
                                    //   <div key={mindex} className="item">
                                    //     <span>{mindex + 1}</span>
                                    //     <span>{ele.productName}</span>
                                    //     <span>{ele.quantity}</span>
                                    //     <span>{ele.totalAmount}</span>
                                    //     <span>{ele.valueNames}</span>
                                    //   </div>
                                    // );
                                  }
                                );
                                return (
                                  <TabPane tab={table.tableName} key={index}>
                                    <div className="my-list">
                                      <div className="list-title">
                                        <span>序号</span>
                                        <span>名称</span>
                                        <span>数量</span>
                                        <span>金额</span>
                                        <span>做法</span>
                                      </div>
                                      <div className="list-content">
                                        <Scrollbars>{item}</Scrollbars>
                                      </div>
                                    </div>
                                  </TabPane>
                                );
                              })}
                            </Tabs>
                          )}
                      </div>
                    )}

                  <ul className="times-block">
                    <li>创建时间：{recordDetail && recordDetail.createTime}</li>
                    <li>创建人员：{recordDetail && recordDetail.creatorName}</li>

                    {false && (
                      <div>
                        <li>取消时间：2017-09-09 13:00:00</li>
                        <li>取消人员：黄美丽(1099)</li>
                        <li>开台时间：2017-09-09 13:00:00</li>
                        <li>开台人员：黄美丽(1099)</li>
                      </div>
                    )}
                  </ul>
                </div>
              </Scrollbars>
            </TabPane>
            <TabPane tab="客情档案" key="2">
              <CustomerArchiveBlock
                customerArchives={bookingStore.customerArchives}
              />
            </TabPane>
          </Tabs>
        </div>
        <div className="btn-block">{btnBlock}</div>
        {this.state.accreditPopup}
        {this.state.refundPopup}
        {this.state.alterPopup}
        {this.state.reasonPopup}
        {this.state.receiptPopup}
        {this.state.statePopup}
      </div>
    );
  }
}

export default CustomerDetailBolck;
