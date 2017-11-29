/**
* @author William Cui
* @description 点菜模式收银界面
* @date 2017-07-03
**/

import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { message } from "antd";
import classnames from "classnames";

import Prompt from "components/prompt-common";
import MemoPopup from "./memo-popup";
import MorePopup from "./more-popup";
import TakeOrderPopup from "./take-order-popup";
import AddMembberPopup from "../member/add-member-popup";
import MemberDiscountPopup from "components/member-discount-popup";
import ViprecordPopup from "../member/viprecord-popup";
import SettlementLayer from "./settlement-layer";
import { DishesContainer, WillOrderList } from "components/order-dishes";
import Wechat from "components/wechat-pay-popup/"; //微信支付弹窗
import MemberPay from "components/member-discount-popup"; //会员卡支付弹窗
import CouponPay from "components/discount-coupon-popup"; //现金券支付
import EnterCard from "components/enter-card"; //输入餐牌号
import MemberInfo from "components/member-payment-popup/"; //会员信息弹窗
import TopBar from "components/top-bar"; //顶部条

import "assets/styles/index/index_top.css";
import "./dishes_cashier.less";

/**************** 支付方式组件 *****************/
function PayMent({ payMent, clickHandle, dishesStore, cashierStore }) {
  return (
    <li
      onClick={clickHandle}
      className={classnames({
        "payment-cell": true,
        "hide-cash": payMent.paymentMethodID === 5, //现金支付
        "bank-card": payMent.paymentMethodID === 88, //银行卡
        "k-currency": payMent.paymentMethodID === 88, //K币
        wechat: payMent.paymentMethodID === 6 || payMent.paymentMethodID === 11, //微信扫码 11为微信线下
        alipay: payMent.paymentMethodID === 7 || payMent.paymentMethodID === 12, //支付宝扫码 12为支付宝线下
        "pay-purple": payMent.paymentMethodID === 8, //会员卡
        "pay-cilaccolour":
          payMent.paymentName === "代金券" ||
          payMent.paymentName === "积分折现" ||
          payMent.paymentName === "K币" ||
          payMent.paymentName === "挂账"
      })}
    >
      <h2 className="payment-name">
        <i
          className={classnames({
            iconfont: true,
            "icon-weixinzhifu":
              payMent.paymentMethodID === 6 || payMent.paymentMethodID === 11,
            "icon-umidd17":
              payMent.paymentMethodID === 7 || payMent.paymentMethodID === 12,
            "icon-huiyuanqia": payMent.paymentMethodID === 8,
            // "icon-yinxingqia":payMent.paymentMethodID === 7,//银行卡
            "icon-account_btn_k": payMent.paymentMethodID === 88, //K币
            "icon-account_btn_guazhang": payMent.paymentMethodID === 88, //挂账
            "icon-xianjinquan": payMent.paymentMethodID === 88, //现金券
            "icon-jifen": payMent.paymentMethodID === 88 //积分折现
          })}
        />
        {payMent.paymentName}
      </h2>
      <div className="payment-price">
        ￥<strong>{dishesStore.shoppingCartTotal.totalAmount}</strong>
      </div>
    </li>
  );
}
/**************** 支付方式组件 *****************/
@inject(
  "appStore",
  "dishesStore",
  "memberStore",
  "dishesCashierStore",
  "settlementStore",
  "cashierStore"
)
@observer
class DishesCashier extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dishesType: 1,
      memo: "",
      showLayer: false,
      statePopup: false,
      cardID: ""
    };

    let { appStore, dishesStore } = props;
    appStore.getMealName(0);
    dishesStore.getFirstCategoryList({ dishesType: "fast-food" }); //获取菜品分类
  }

  //关闭其他弹窗
  closePopup = () => {
    this.setState({
      statePopup: false
    });
  };

  componentWillUnmount() {
    let { dishesStore } = this.props;
    dishesStore.clearShoppingCart(); //清空购物车
    dishesStore.clearCategoryList(); //清空菜品分类
    dishesStore.clearDishesList(); //清空菜品信息
  }

  componentDidUpdate() {
    let dishesStore = this.props.dishesStore;
    let feedback = dishesStore.feedback;
    if (
      feedback &&
      feedback.status !== "error" &&
      feedback.status !== "validate"
    ) {
      //提示
      switch (feedback.status) {
        case "success":
          message.success(feedback.msg, dishesStore.closeFeedback());
          break;
        case "warn":
          message.warn(feedback.msg, dishesStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, dishesStore.closeFeedback());
      }
    }
  }

  // 支付宝支付 && 微信支付
  alipayMethod = (title, payment) => {
    let dishesStore = this.props.dishesStore;
    this.setState({
      statePopup: (
        <Wechat
          title={title}
          inputValue={dishesStore.shoppingCartTotal.totalAmount}
          waitAmount={this.props.value}
          onOk={value => {
            //inputValue为支付金额  waitAmount为待支付金额
            this.closePopup();
            this.enableSequece(payment, value); //payment为支付ID，value为autoCode
          }}
          onCancel={() => {
            this.closePopup();
          }}
        />
      )
    });
  };

  // 会员卡支付&&积分抵现
  memberMethod = (title, payment) => {
    let dishesStore = this.props.dishesStore;
    let cashierStore = this.props.cashierStore;
    this.setState({
      statePopup: (
        <MemberPay
          title={title}
          inputValue={dishesStore.shoppingCartTotal.totalAmount}
          waitAmount={this.props.value}
          onOk={(phone, cardID, cardCode) => {
            // this.closePopup();
            cashierStore.getMemberInfol(phone, cardID, cardCode, () => {
              //会员信息查询成功后回调函数
              this.setState({
                statePopup: (
                  <MemberInfo
                    // cardInfo={cashierStore.memberItem}
                    cardInfo={cashierStore.memCardInfoDTO}
                    price={dishesStore.shoppingCartTotal.totalAmount} //需支付的金额
                    inputValue={dishesStore.shoppingCartTotal.totalAmount} //需支付的金额
                    isCashierMember={true}
                    onOk={(cardPay, password) => {
                      this.enableSequece(payment, cardPay, password);
                    }}
                    onCancel={() => {
                      this.closePopup();
                    }}
                  />
                )
              });
            });
          }}
          onCancel={() => {
            //取消
            this.closePopup();
          }}
        />
      )
    });
  };

  // 银行卡支付
  bankMethod = title => {
    this.enableSequece();
  };
  // 微信和支付宝线下支付
  offline = (title, payment) => {
    this.enableSequece(payment);
  };
  // 代金券支付
  couponMethod = title => {
    this.setState({
      statePopup: (
        <CouponPay
          title={title}
          onOk={() => {
            this.enableSequece();
          }}
          onCancel={() => {
            this.closePopup();
          }}
        />
      )
    });
  };
  // 结账完成后清空数据
  clearAllData() {
    let cashierStore = this.props.cashierStore;
    let dishesCashierStore = this.props.dishesCashierStore;
    let dishesStore = this.props.dishesStore;
    dishesStore.clearShoppingCart(); //清空购物车
    dishesCashierStore.changeOrderID(); //清空orderID
    cashierStore.clearData();
  }

  //判断是否需要输入餐牌
  enableSequece = (payment, value, password) => {
    let cashierStore = this.props.cashierStore;
    let dishesStore = this.props.dishesStore;
    let dishesCashierStore = this.props.dishesCashierStore;
    cashierStore.getEnableSequece();
    if (cashierStore.isEnableSequece) {
      //判断是否需要输入餐牌
      this.setState({
        statePopup: (
          <EnterCard
            onOk={value => {
              if (payment === 5 || payment === 11 || payment === 12) {
                //线下
                let shoppingCartAndPayAndDiscountInfo;
                shoppingCartAndPayAndDiscountInfo = {
                  quickDiscountInfoList: [],
                  quickAmountDetail: {
                    totalAmount: dishesStore.shoppingCartTotal.totalAmount, //消费金额
                    discountAmount: 0, //折扣金额
                    giveProductAmount: 0, //赠送金额
                    droptailAmount: 0, //抹零金额
                    payableAmount: dishesStore.shoppingCartTotal.totalAmount //应收金额
                  },
                  payInfo: {},
                  quickOrderDetailList: dishesStore.shoppingCart
                };
                dishesCashierStore.getQuickOrder(
                  dishesCashierStore.orderType,
                  shoppingCartAndPayAndDiscountInfo,
                  this.state.memo,
                  password,
                  () => {
                    //刷新菜品列表
                    dishesStore.getDishesList({});
                    this.clearAllData();
                  }
                );
                // cashierStore.getCashPayment(payment,parseFloat(dishesStore.shoppingCartTotal.totalAmount),dishesCashierStore.orderID);//支付方式/支付金额/订单ID
              }
              if (payment === 8) {
                //会员卡支付
                //  let shoppingCartAndPayAndDiscountInfo;
                // shoppingCartAndPayAndDiscountInfo={
                //     quickDiscountInfoList:[],
                //     quickAmountDetail:{
                //         totalAmount:dishesStore.shoppingCartTotal.totalAmount,//消费金额
                //         discountAmount:0,//折扣金额
                //         giveProductAmount:0,//赠送金额
                //         droptailAmount:0,//抹零金额
                //         payableAmount:dishesStore.shoppingCartTotal.totalAmount,//应收金额
                //     },
                //     payInfo:{},
                //     quickOrderDetailList:dishesStore.shoppingCart
                // }
                // dishesCashierStore.getQuickOrder(dishesCashierStore.orderType,shoppingCartAndPayAndDiscountInfo,this.state.memo,()=>{this.clearAllData();})
                cashierStore.getOnlinePayment(
                  payment,
                  parseFloat(value),
                  dishesCashierStore.orderID,
                  "",
                  cashierStore.cardID,
                  password,
                  () => {
                    //支付方式/支付金额/订单ID/扫码code
                    this.clearAllData();
                  }
                );
              }
              if (payment === 6 || payment === 7) {
                cashierStore.getOnlinePayment(
                  payment,
                  parseFloat(dishesStore.shoppingCartTotal.totalAmount),
                  dishesCashierStore.orderID,
                  value,
                  cashierStore.cardID,
                  "",
                  () => {
                    //支付方式/支付金额/订单ID/扫码code
                    this.clearAllData();
                  }
                );
              }
              this.closePopup();
            }}
            onCancel={() => {
              this.closePopup();
            }}
          />
        )
      });
    } else {
      //不需要输入餐牌
      // if(payment===8){
      //      cashierStore.getOnlinePayment(payment,parseFloat(value),dishesCashierStore.orderID,'',cashierStore.cardID,password,()=>{//支付方式/支付金额/订单ID/扫码code
      //          this.clearAllData();
      //     });
      // }
      if (payment === 5 || payment === 11 || payment === 12) {
        //线下
        let shoppingCartAndPayAndDiscountInfo;
        shoppingCartAndPayAndDiscountInfo = {
          quickDiscountInfoList: [],
          quickAmountDetail: {
            totalAmount: dishesStore.shoppingCartTotal.totalAmount, //消费金额
            discountAmount: 0, //折扣金额
            giveProductAmount: 0, //赠送金额
            droptailAmount: 0, //抹零金额
            payableAmount: dishesStore.shoppingCartTotal.totalAmount //应收金额
          },
          payInfo: {
            cardID: "",
            customerID: "",
            authCode: "",
            paymentAmount: dishesStore.shoppingCartTotal.totalAmount,
            paymentMethodID: payment
          },
          quickOrderDetailList: dishesStore.shoppingCart
        };
        dishesCashierStore.getQuickOrder(
          dishesCashierStore.orderType,
          shoppingCartAndPayAndDiscountInfo,
          this.state.memo,
          "",
          () => {
            //刷新菜品列表
            dishesStore.getDishesList({});
            this.clearAllData();
          }
        );
        // cashierStore.getCashPayment(payment,parseFloat(dishesStore.shoppingCartTotal.totalAmount),dishesCashierStore.orderID);//支付方式/支付金额/订单ID
      }
      if (payment === 6 || payment === 7 || payment === 8) {
        let shoppingCartAndPayAndDiscountInfo;
        shoppingCartAndPayAndDiscountInfo = {
          quickDiscountInfoList: [],
          quickAmountDetail: {
            totalAmount: dishesStore.shoppingCartTotal.totalAmount, //消费金额
            discountAmount: 0, //折扣金额
            giveProductAmount: 0, //赠送金额
            droptailAmount: 0, //抹零金额
            payableAmount: dishesStore.shoppingCartTotal.totalAmount //应收金额
          },
          payInfo: {
            cardID: cashierStore.cardID,
            customerID: "",
            authCode: value,
            paymentAmount: dishesStore.shoppingCartTotal.totalAmount,
            paymentMethodID: payment
          },
          quickOrderDetailList: dishesStore.shoppingCart
        };
        dishesCashierStore.getQuickOrder(
          dishesCashierStore.orderType,
          shoppingCartAndPayAndDiscountInfo,
          this.state.memo,
          password,
          () => {
            //刷新菜品列表
            dishesStore.getDishesList({});
            this.clearAllData();
          }
        );
        // cashierStore.getOnlinePayment(payment,parseFloat(dishesStore.shoppingCartTotal.totalAmount),dishesCashierStore.orderID,value,cashierStore.cardID,()=>{//支付方式/支付金额/订单ID/扫码code
        //     this.clearAllData();
        // });
      }
    }
  };

  //增加付款
  addPayMent = payment => {
    let dishesStore = this.props.dishesStore;
    // dishesCashierStore.getQuickOrder(dishesCashierStore.orderType,dishesStore.shoppingCart,this.state.memo,()=>{})
    //会员卡支付--先暂时不用
    if (dishesStore.shoppingCartTotal.totalAmount * 1 === 0) {
      if (payment.paymentMethodID !== 5) {
        message.destroy();
        message.info("请选择其他结算中的现金支付", 2);
        return;
      }
    }
    if (payment.paymentMethodID === 8) {
      this.memberMethod("会员卡支付", payment.paymentMethodID);
    }
    // 微信线上支付判断
    if (payment.paymentMethodID === 6) {
      this.alipayMethod("微信支付", payment.paymentMethodID);
    }

    // 支付宝线上支付判断
    if (payment.paymentMethodID === 7) {
      this.alipayMethod("支付宝支付", payment.paymentMethodID);
    }
    // 微信线下支付判断
    if (payment.paymentMethodID === 11) {
      this.offline("微信线下支付", payment.paymentMethodID);
    }
    // 支付宝线下支付判断
    if (payment.paymentMethodID === 12) {
      this.offline("支付宝线下支付", payment.paymentMethodID);
    }
  };

  render() {
    let {
      dishesStore,
      memberStore,
      dishesCashierStore,
      settlementStore,
      cashierStore
    } = this.props;

    let feedback = dishesStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === "error") {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        dishesStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    let isEmpty = !(
      dishesStore.shoppingCart && dishesStore.shoppingCart.length
    );

    return (
      <div>
        <div id="nav">
          <TopBar />
        </div>
        <div id="dishes_container">
          <div id="dishes_con_left">
            <div className="dishes-list">
              {dishesStore.shoppingCart.length ? (
                <WillOrderList />
              ) : (
                <div className="order-list dishes-preview">
                  <h2 className="dishes-guide">
                    <i className="iconfont icon-tishi" />请点选菜品开始新的订单！
                  </h2>
                  <div className="dishes-member">
                    <i className="iconfont icon-kuaicanshouyin_huiyu" />
                    <div className="dishes-member-operator">
                      <button
                        className="dishes-member-btn"
                        onClick={() => {
                          memberStore.addMemberClick();
                        }}
                      >
                        <i className="iconfont icon-xinzenghuiyuan" />新增会员
                      </button>
                      <button
                        className="dishes-member-btn"
                        onClick={() => {
                          this.setState({
                            statePopup: (
                              <MemberDiscountPopup
                                title="会员卡"
                                handleClose={this.closePopup}
                                onOk={(phone, cardID, cardCode) => {
                                  //正式接口
                                  // onOk={(phone,type)=>{//临时的
                                  cashierStore.getMemberInfol(
                                    phone,
                                    cardID,
                                    cardCode,
                                    () => {
                                      //正式的
                                      //  cashierStore.getMemberInfol(phone,type,()=>{//临时的
                                      this.setState({
                                        cardID: cashierStore.cardID
                                      });
                                      memberStore.showVipPopup();
                                      this.closePopup();
                                    }
                                  );
                                }}
                              />
                            )
                          });
                        }}
                      >
                        <i className="iconfont icon-chongzhi" />充值
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="dishes-memo">
                <h2 className="dishes-memo-title">
                  整单备注
                  <span
                    className="link-btn"
                    onClick={() => {
                      //编辑备注弹窗
                      this.setState({
                        statePopup: (
                          <MemoPopup
                            memo={this.state.memo}
                            handleClose={this.closePopup}
                            submitMemo={memo => {
                              this.setState({ memo });
                            }}
                          />
                        )
                      });
                    }}
                  >
                    点击编辑 &gt;
                  </span>
                </h2>
                <div className="dishes-demo-cont">{this.state.memo}</div>
              </div>
              <div className="dishes-cashier-footer clear">
                <div
                  className="btn-hollow"
                  onClick={() => {
                    if (isEmpty) {
                      //取单
                      this.setState({
                        statePopup: (
                          <TakeOrderPopup
                            handleClose={this.closePopup}
                            takeOrder={orderKey => {
                              let orderList = JSON.parse(
                                localStorage.getItem("orderList")
                              );
                              dishesStore.readShoppingCart({
                                cart: orderList[orderKey].cart
                              });
                              this.setState({ memo: orderList[orderKey].memo });

                              //从localStorage删除已取出的单
                              delete orderList[orderKey];
                              localStorage.setItem(
                                "orderList",
                                JSON.stringify(orderList)
                              );
                            }}
                          />
                        )
                      });
                    } else {
                      let orderList = localStorage.getItem("orderList")
                        ? JSON.parse(localStorage.getItem("orderList"))
                        : {};
                      if (Object.keys(orderList).length >= 10) {
                        dishesStore.showFeedback({
                          status: "warn",
                          msg: "最多挂单10单，请先清理多余的挂单！"
                        });
                        return;
                      }

                      let time = new Date();
                      let hour = time.getHours();
                      hour = hour <= 9 ? "0" + hour : hour;
                      let minute = time.getMinutes();
                      minute = minute <= 9 ? "0" + minute : minute;
                      time = hour + ":" + minute;

                      let quantity =
                        dishesStore.shoppingCartTotal.totalQuantity;
                      let price = dishesStore.shoppingCartTotal.totalAmount;
                      let memo = this.state.memo;
                      let cart = {
                        shoppingCart: dishesStore.shoppingCart,
                        productMessageMap: dishesStore.productMessageMap,
                        comboGroupMap: dishesStore.comboGroupMap
                      };

                      //挂单
                      let order = {
                        time,
                        quantity,
                        price,
                        memo,
                        cart
                      };

                      orderList[
                        Math.floor(Math.random() * 10000000000)
                      ] = order;
                      localStorage.setItem(
                        "orderList",
                        JSON.stringify(orderList)
                      );
                      dishesStore.clearShoppingCart();
                      this.setState({ memo: "" });
                    }
                  }}
                >
                  {isEmpty ? "取单" : "挂单"}
                </div>
                <div className="dishes-type">
                  {["外带", "堂食"].map((word, index) => {
                    return (
                      <div
                        key={index}
                        className={classnames({
                          "dishes-type-cell": true,
                          active: this.state.dishesType === index
                        })}
                        onClick={() => {
                          //Shelly---2017-7-13判断是堂食还是外带
                          if (word === "堂食") {
                            dishesCashierStore.changeOrderType(1235);
                          } else {
                            dishesCashierStore.changeOrderType(1236);
                          }
                          this.setState({ dishesType: index });
                        }}
                      >
                        {word}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <DishesContainer>
            <ul className="payment-bar">
              {settlementStore.paymentList.map((payment, index) => {
                return (
                  <PayMent
                    key={index}
                    payMent={payment}
                    dishesStore={dishesStore}
                    cashierStore={cashierStore}
                    clickHandle={() => {
                      this.addPayMent(payment);
                    }}
                  />
                );
              })}
              <li
                className="payment-cell other"
                onClick={() => {
                  //弹出其他结算方式层
                  // dishesCashierStore.getQuickOrder(dishesCashierStore.orderType,dishesStore.shoppingCart,this.state.memo,()=>{
                  //      cashierStore.getAmountDetail(dishesCashierStore.orderID);
                  // })
                  this.setState({ showLayer: true });
                  cashierStore.changeNoteAccount(0);
                }}
              >
                <div className="payment-text">
                  <i className="iconfont icon-qita" />其他结算
                </div>
              </li>
              <li
                className="payment-cell more"
                onClick={() => {
                  this.setState({
                    statePopup: <MorePopup handleClose={this.closePopup} />
                  });
                }}
              >
                <div className="payment-text">
                  <i className="iconfont icon-gengduo1" />更多
                </div>
              </li>
            </ul>
            <SettlementLayer
              show={this.state.showLayer}
              memo={this.state.memo}
              onClose={() => {
                this.setState({ showLayer: false });
              }}
            />
          </DishesContainer>
        </div>
        {memberStore.isShowAddMember && <AddMembberPopup />}
        {memberStore.isShowVipPopup && (
          <ViprecordPopup cardID={this.state.cardID} />
        )}
        {operatePrompt}
        {this.state.statePopup}
      </div>
    );
  }
}

DishesCashier.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default DishesCashier;
