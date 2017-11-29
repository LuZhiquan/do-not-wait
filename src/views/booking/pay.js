/**
* @author Shelly
* @description 退定金界面
* @date 2017-05-22
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router';
import { Tabs } from 'antd';

import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';
import WechatPay from 'components/wechat-pay-popup';
// import CashPopup from 'components/cash-popup';
import PromptPopup from 'components/prompt-popup';
import PayReceiptPopup from './payment-receipt-popup';
import AddOrderPopup from 'components/order-dishes/add-order-validation-popup'; //下单不成功提示弹窗

import './booking_pay.less';

const TabPane = Tabs.TabPane;

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

@inject('bookingStore')
@observer
class PayBooking extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      receiptPopup: '',
      payPopup: '',
      confirmPopup: '',
      handmade: 0
    };

    let bookingStore = this.props.bookingStore;

    //单台预订获取购物车 再保存预订
    if (this.props.params.bookingID) {
      let payBookingID = this.props.params.bookingID;

      bookingStore.payBookingID = payBookingID;

      bookingStore.getBookingPaymentInfo(payBookingID);
    } else {
      //单桌点菜

      bookingStore.paySaveBooking(
        JSON.parse(this.props.location.state.cart).shoppingCart,
        data => {
          this.setState({
            statePopup: (
              <AddOrderPopup
                data={data}
                handleClose={() => {
                  this.setState({ statePopup: false });
                  browserHistory.push({
                    pathname: '/dishes/' + bookingStore.bookingMessage.tableIDs,
                    state: {
                      dishesType: 'booking',
                      orderInfo: {
                        bookingName: bookingStore.bookingMessage.contact,
                        peopleNum: bookingStore.bookingMessage.peopleNum,
                        memo: bookingStore.bookingMessage.memo,
                        tableName: bookingStore.createTableNames[0],
                        bookingTime: bookingStore.bookingMessage.bookingTime
                      },
                      nextUrl: '/booking/pay',
                      cart: JSON.stringify(this.props.location.state.cart)
                    }
                  });
                }}
              />
            )
          });
        }
      );
    }

    bookingStore.payMoneyMessage = '';
  }

  componentDidMount() {
    let bookingStore = this.props.bookingStore;

    bookingStore.getPaymentMethod(); //获取支付方法
  }

  payClick = (payBookingID, method, payMoney) => {
    switch (method.paymentMethodID) {
      case 6: //微信
        this.setState({
          payPopup: (
            <WechatPay
              title={'微信'}
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
              onOk={code => {
                this.setState({ payPopup: '' });
                this.props.bookingStore.payment(
                  payBookingID,
                  method,
                  payMoney,
                  code
                );
              }}
              inputValue={payMoney}
            />
          )
        });
        break;
      case 7: //支付宝
        this.setState({
          payPopup: (
            <WechatPay
              title={'支付宝'}
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
              onOk={code => {
                this.setState({ payPopup: '' });
                this.props.bookingStore.payment(
                  payBookingID,
                  method,
                  payMoney,
                  code
                );
              }}
              inputValue={payMoney}
            />
          )
        });
        break;
      case 3: //银联
        // this.setState({payPopup:<CashPopup title={"银联"} onCancel={()=>{
        // 	this.setState({payPopup:""});
        // }} onOk={(money)=>{

        // }}/>});
        break;
      case 4: //k币
        // this.setState({payPopup:<CashPopup title={"k币"} onCancel={()=>{
        // 	this.setState({payPopup:""});
        // }} onOk={(money)=>{

        // }}/>});
        break;
      case 5: //现金
        this.setState({
          payPopup: (
            <PromptPopup
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
              onOk={() => {
                this.props.bookingStore.payment(
                  payBookingID,
                  method,
                  payMoney,
                  ''
                );
                this.setState({ payPopup: '' });
              }}
            >
              <div className="prompt" style={promptContStyle}>
                <div className="delele-text">
                  确定现金支付
                  <span>{payMoney}元</span>吗？
                </div>
              </div>
            </PromptPopup>
          )
        });
        break;
      default:
        break;
    }
  };

  render() {
    let bookingStore = this.props.bookingStore;
    let paymentInfo = bookingStore.paymentInfo;
    let bookingTypeName, bookingStatusName;
    let totalMoney; //总金额
    let hasPayMoney; //已收金额
    let receiptPopup;

    if (paymentInfo) {
      hasPayMoney = paymentInfo.bookingDetail.bookingAmount;
      hasPayMoney = hasPayMoney ? hasPayMoney : 0;
    }

    if (bookingStore.isShowReceiptPopup) {
      receiptPopup = (
        <PayReceiptPopup
          okClick={() => {
            bookingStore.receiptPopupClick();
            browserHistory.push('/booking');
          }}
        />
      );
    }

    switch (paymentInfo && paymentInfo.bookingDetail.bookingType) {
      case 614:
        bookingTypeName = '点菜预订';
        totalMoney = paymentInfo.bookingDetail.totalAmount;
        break;
      case 615:
        bookingTypeName = '留位预订';
        totalMoney = paymentInfo.bookingDetail.totalAmount;
        break;
      case 616:
        bookingTypeName = '普通预订';
        break;

      default:
        break;
    }
    switch (paymentInfo && paymentInfo.bookingDetail.bookingStatus) {
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

    return (
      <div id="pay_container">
        <div className="pay-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              bookingStore.payGoBack();
            }}
          />预订支付
        </div>
        {
          <div className="pay-container">
            <div className="pay-info-block">
              <div className="info-content">
                <div className="pay-phone">
                  <i className="iconfont icon-yuding_phone_laidian" />
                  <div className="contact-person">
                    <p className="name">
                      {paymentInfo && paymentInfo.bookingDetail.contact}
                    </p>
                    <p className="phone">
                      {paymentInfo && paymentInfo.bookingDetail.mobile}
                    </p>
                  </div>
                </div>
                <div className="pay-left-content">
                  <div className="order-num">
                    {paymentInfo && paymentInfo.bookingDetail.bookingCode}
                  </div>
                  <ul className="booking-time-ul">
                    <li>
                      <span className="left-name">预订时间:</span>
                      <span className="right-content">
                        {paymentInfo && paymentInfo.bookingDetail.bookingTime}
                      </span>
                    </li>
                    <li>
                      <span className="left-name">状态:</span>
                      <span className="right-content">{bookingStatusName}</span>
                    </li>
                    <li>
                      <span className="left-name">人数:</span>
                      <span className="right-content">
                        {paymentInfo && paymentInfo.bookingDetail.peopleNum}
                      </span>
                    </li>
                    <li>
                      <span className="left-name">预订方式:</span>
                      <span className="right-content">{bookingTypeName}</span>
                    </li>
                    <li className="remark-desk">
                      <span className="left-name">预订桌台:</span>
                      <span className="right-content">
                        {paymentInfo && paymentInfo.bookingDetail.tableCodes}
                      </span>
                    </li>

                    <li className="remark">
                      <span className="left-name">备注:</span>
                      <span className="right-content">
                        {paymentInfo && paymentInfo.bookingDetail.memo}
                      </span>
                    </li>
                  </ul>
                </div>
                {paymentInfo &&
                paymentInfo.bookingDetail.bookingType === 614 && (
                  <div className="dishes-list">
                    <Tabs defaultActiveKey="0">
                      {paymentInfo &&
                        paymentInfo.bookingDetail.bookingType === 614 &&
                        paymentInfo.tableOrderDetail.map((table, index) => {
                          let item = table.orderDetail.map((ele, mindex) => {
                             /*********2017-9-30 by FXL************* */
                             if(ele.assortedDishesList && ele.assortedDishesList.length > 0){//存在拼菜列表
                              let spellDish = ele.assortedDishesList.map((spell,sindex) => {
                                return (
                                    <div key={sindex} className="item">
                                    <span></span>
                                    <span>{spell.productName}</span>
                                    <span>{spell.quantity}</span>
                                    <span>{spell.price}</span>
                                    <span>{spell.valueNames}</span>
                                    </div>
                                );
                              });
                              return (
                                <div key={mindex}>
                                    <div className="item">
                                        <span>{mindex + 1}</span>
                                        <span>【{ele.assortedDishesList[0].assortedDishesName}】</span>
                                        <span>{ele.quantity}</span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    {spellDish}
                                </div>
                              )
                             
                            }else{
                              return (
                                <div key={mindex} className="item">
                                    <span>{mindex + 1}</span>
                                    <span>{ele.productName}</span>
                                    <span>{ele.quantity}</span>
                                    <span>{ele.totalAmount}</span>
                                    <span>{ele.valueNames}</span>
                                </div>
                              )
                            }
                           /*********2017-9-30 by FXL************* */
                            // return (
                            //   <div key={mindex} className="item">
                            //     <span>{mindex + 1}</span>
                            //     <span>{ele.productName}</span>
                            //     <span>{ele.quantity}</span>
                            //     <span>{ele.totalAmount}</span>
                            //     <span>{ele.valueNames}</span>
                            //   </div>
                            // );

                          });
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
                  </div>
                )}
              </div>
            </div>

            <div className="pay-info-rihgt">
              <div className="return-account">
                <div className="account-item">
                  <span className="num">{totalMoney}</span>
                  <span className="text">应收金额</span>
                </div>
                <div className="account-item">
                  <span className="num">{hasPayMoney}</span>
                  <span className="text">已收金额</span>
                </div>
                <div className="account-item">
                  <span className="num">{totalMoney - hasPayMoney}</span>
                  <span className="text">待收金额</span>
                </div>
              </div>

              <ul className="payment-method">
                {bookingStore.payMoneyMessage && (
                  <li>
                    <span className="num">1</span>
                    <span className="method">
                      {bookingStore.payMoneyMessage.paymentName}
                    </span>
                    <span className="account">
                      {bookingStore.payMoneyMessage.paymentAmount}
                    </span>
                    {bookingStore.payMoneyMessage.paymentMethodID !== 5 &&
                    bookingStore.payMoneyMessage.isShowBtn && (
                      <span
                        onClick={() => {
                          this.setState({
                            confirmPopup: (
                              <PromptPopup
                                onCancel={() => {
                                  this.setState({ confirmPopup: '' });
                                }}
                                onOk={() => {
                                  bookingStore.payItemOk(totalMoney);
                                  this.setState({ handmade: 1 });
                                  this.setState({ confirmPopup: '' });
                                }}
                              >
                                <div className="prompt" style={promptContStyle}>
                                  <div className="delele-text">确定收款吗？</div>
                                </div>
                              </PromptPopup>
                            )
                          });
                        }}
                        className={classnames({
                          ok: bookingStore.payMoneyMessage.isShowBtn
                        })}
                      >
                        确定
                      </span>
                    )}
                    {bookingStore.payMoneyMessage.paymentMethodID !== 5 &&
                    bookingStore.payMoneyMessage.isShowBtn && (
                      <span
                        onClick={() => {
                          bookingStore.payItemCancel();
                        }}
                        className={classnames({
                          cancel: bookingStore.payMoneyMessage.isShowBtn
                        })}
                      >
                        取消
                      </span>
                    )}
                    {bookingStore.payMoneyMessage.paymentMethodID === 5 && (
                      <i
                        onClick={() => {
                          bookingStore.cashDeleteClick();
                        }}
                        className="iconfont icon-shanchu1"
                      />
                    )}
                  </li>
                )}
              </ul>
              <ul className="payment">
                {bookingStore.paymentMethod &&
                  bookingStore.paymentMethod.map((method, index) => {
                    if (
                      method.paymentMethodID === 5 ||
                      method.paymentMethodID === 6 ||
                      method.paymentMethodID === 7
                    ) {
                      return (
                        <li
                          key={index}
                          onClick={() => {
                            let payMoney = totalMoney - hasPayMoney;
                            if (payMoney > 0) {
                              let bookingStore = this.props.bookingStore;
                              //只能选一种支付方式
                              if (!bookingStore.payMoneyMessage) {
                                this.payClick(
                                  bookingStore.payBookingID,
                                  method,
                                  payMoney
                                );
                              }
                            }
                          }}
                        >
                          <i
                            className={classnames({
                              iconfont: true,
                              'icon-account_btn_vip':
                                method.paymentMethodID === '会员卡',
                              'icon-account_btn_cash':
                                method.paymentMethodID === 5,
                              'icon-account_btn_guazhang':
                                method.paymentMethodID === '银联',
                              'icon-account_btn_wechat':
                                method.paymentMethodID === 6,
                              'icon-account_btn_alipay':
                                method.paymentMethodID === 7,
                              'icon-account_btn_k':
                                method.paymentMethodID === 'K币'
                            })}
                          />
                          <p>{method.paymentName}</p>
                        </li>
                      );
                    } else {
                      return '';
                    }
                  })}
              </ul>
              <div className="info-rihgt-btns">
                <div
                  onClick={() => {
                    bookingStore.payCancel();
                  }}
                >
                  取消
                </div>
                <div
                  className={classnames({
                    select: bookingStore.payMoneyMessage !== '',
                    disabled:
                      bookingStore.payMoneyMessage === '' ||
                      (bookingStore.payMoneyMessage.paymentMethodID !== 5 &&
                        bookingStore.payMoneyMessage.isShowBtn === true)
                  })}
                  onClick={() => {
                    if (bookingStore.payMoneyMessage) {
                      if (bookingStore.payMoneyMessage.paymentMethodID === 5) {
                        bookingStore.payOk();
                      } else {
                        if (bookingStore.payMoneyMessage.isShowBtn === false) {
                          bookingStore.payOk(this.state.handmade);
                        }
                      }
                    }
                  }}
                >
                  完成
                </div>
              </div>
            </div>
          </div>
        }
        {this.state.payPopup}
        {this.state.confirmPopup}
        {receiptPopup}
        {this.state.statePopup}
      </div>
    );
  }
}

PayBooking.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default PayBooking;
