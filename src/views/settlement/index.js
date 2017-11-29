/**
 * @author shelly
 * @description 结账界面
 * @date 2017-05-16
 **/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { message } from 'antd';

import Scrollbars from 'react-custom-scrollbars';

import classnames from 'classnames';
import MorePopup from './more-popup'; //更多弹窗
import CashPopup from './cash-popup'; //现金弹窗
import CategoryDiscount from './category-discount-popup'; //分类折弹窗
import MemberDiscount from 'components/member-discount-popup'; //会员折弹窗
import MemberInfo from 'components/member-payment-popup/'; //会员信息弹窗
import RefundPopup from 'components/card-tuikuan-popup/'; //退款弹窗
import PromptPopup from 'components/prompt-popup'; //提示弹窗
import InvoicePopup from 'components/invoice-popup'; //开发票弹窗
import Wechat from 'components/wechat-pay-popup/'; //微信支付弹窗
import DiscountCoupon from './discount-coupon-popup'; //折扣券
import DiscountPrice from './discount-price-popup/'; //折扣弹窗
import AdjustProductDiscout from './adjust-product-discount/'; //调整商品折扣
import { checkPermission, formatDate, formatStamp } from 'common/utils'; //二次验权的JS封装包
import Accredit from 'components/accredit-popup'; //二次验权的弹窗
import Loading from 'components/loading'; //二次验权的弹窗
import ReplacePaymentPopup from './replace-payment-popup';

import { DidOrder } from 'components/order-dishes';

import './settlement.css';

message.config({
  top: 300,
  duration: 1
});

/**************** 支付方式组件 *****************/
function PayMent({ payMent, clickHandle }) {
  return (
    <li
      onClick={clickHandle}
      className={classnames({
        'payment-frame': true,
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

@inject('settlementStore', 'cashierStore', 'dishesStore')
@observer
class Settlement extends Component {
  constructor(props, context) {
    super(props, context);
    props.settlementStore.getUpdateDiscountInfo(this.props.params.subOrderID);
    props.settlementStore.getPaymentMethod(); //获取支付方式
    props.settlementStore.getTableUseInfo({
      subOrderID: this.props.params.subOrderID
    });
    props.settlementStore.getOrderInfo({
      subOrderID: this.props.params.subOrderID
    });
    props.settlementStore.changeInvoiceMoney(0);

    props.settlementStore.getHadPayList({
      subOrderID: this.props.params.subOrderID
    }); //获取上次已收款记录
  }
  state = {
    discountType: '',
    showDiscount: false,
    popup: '', //现金弹窗
    refundpopup: '',
    memberpopup: '', //会员折
    promptpopup: '',
    discountPricePopup: '',
    accreditPopup: '',
    waitAmount: '',
    wechat: '',
    relevanceTable: false,
    current: -1,
    alertShow: '', //折扣提示显示
    memberPayment: '', //会员卡支付
    memberInfo: '', //会员信息
    discountModule: 'DiscountModule', //模块信息
    titerTime: false, //结账的时候出现加载层
    invoice: false
  };
  componentDidMount() {
    let settlementStore = this.props.settlementStore;
    // this.props.settlementStore.getAmountSituation();
    settlementStore.receivableDate = [];
    settlementStore.cashLish = [];
    settlementStore.allPayList = [];
    settlementStore.amountReceived = 0;

    settlementStore.getInvoiceInfo(this.props.params.subOrderID); //查询已开发票

    // this.props.router.setRouteLeaveHook(this.props.route, () => {
    // 	settlementStore.tableUseInfo=[];
    // })
  }

  componentDidUpdate() {
    let settlementStore = this.props.settlementStore;
    let feedback = settlementStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, settlementStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, settlementStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, settlementStore.closeFeedback());
      }
    }
  }

  //关闭其他弹窗
  closePopup = () => {
    this.setState({
      invoice: false
    });
  };

  //计算金额----减
  minusCountAmount = ele => {
    let settlementStore = this.props.settlementStore;
    settlementStore.amountReceived =
      parseFloat(settlementStore.amountReceived) -
      parseFloat(ele.paymentAmount); //已收
    settlementStore.amountReceived = settlementStore.amountReceived.toFixed(2);
    settlementStore.waitCollectAmount =
      parseFloat(settlementStore.waitCollectAmount) +
      parseFloat(ele.paymentAmount) -
      parseFloat(settlementStore.oddChange); //待收金额
    settlementStore.waitCollectAmount = settlementStore.waitCollectAmount.toFixed(
      2
    );
    if (settlementStore.waitCollectAmount < 0) {
      settlementStore.waitCollectAmount = 0;
    }
    settlementStore.oddChange =
      parseFloat(settlementStore.amountReceived) +
      parseFloat(settlementStore.amountSituation.bookingAmount) -
      parseFloat(settlementStore.amountSituation.payableAmount); //找零
    settlementStore.oddChange = settlementStore.oddChange.toFixed(2);
    if (settlementStore.oddChange <= 0) {
      settlementStore.oddChange = 0;
    }
    if (parseFloat(settlementStore.waitCollectAmount) === 0) {
      //是否可结账
      settlementStore.settlementBtnDisable = true;
      settlementStore.disable = true;
    } else {
      settlementStore.settlementBtnDisable = false;
    }
    // settlementStore.invoiceAmount=settlementStore.amountReceived-settlementStore.oddChange;//可开票金额
  };

  //计算金额----加
  addCountAmount = ele => {
    let settlementStore = this.props.settlementStore;
    settlementStore.amountReceived =
      parseFloat(settlementStore.amountReceived) +
      parseFloat(ele.paymentAmount); //已收
    settlementStore.amountReceived = settlementStore.amountReceived.toFixed(2);
    settlementStore.waitCollectAmount =
      parseFloat(settlementStore.waitCollectAmount) -
      parseFloat(ele.paymentAmount); //待收金额
    settlementStore.waitCollectAmount = settlementStore.waitCollectAmount.toFixed(
      2
    );
    if (settlementStore.waitCollectAmount < 0) {
      settlementStore.waitCollectAmount = 0;
    }
    settlementStore.oddChange =
      parseFloat(settlementStore.amountReceived) +
      parseFloat(settlementStore.amountSituation.bookingAmount) -
      parseFloat(settlementStore.amountSituation.payableAmount); //找零
    settlementStore.oddChange = settlementStore.oddChange.toFixed(2);
    if (settlementStore.oddChange <= 0) {
      settlementStore.oddChange = 0;
    }
    if (parseFloat(settlementStore.waitCollectAmount) === 0) {
      //是否可结账
      settlementStore.settlementBtnDisable = true;
      settlementStore.disable = true;
    } else {
      settlementStore.settlementBtnDisable = false;
    }
    // settlementStore.invoiceAmount=settlementStore.amountReceived-settlementStore.oddChange;//可开票金额
  };

  //增加付款
  addPayMent = payment => {
    let settlementStore = this.props.settlementStore;
    let cashierStore = this.props.cashierStore;

    //会员卡支付--先暂时不用
    if (payment.paymentMethodID === 8) {
      this.setState({
        memberPayment: (
          <MemberDiscount
            normalSettlement={true}
            title={payment.paymentName}
            inputValue={settlementStore.waitCollectAmount}
            onOk={(phone, cardID, cardCode) => {
              cashierStore.getMemberInfol(phone, cardID, cardCode, () => {
                this.setState({
                  memberInfo: (
                    <MemberInfo
                      cardInfo={cashierStore.memCardInfoDTO}
                      price={settlementStore.waitCollectAmount}
                      onOk={(value, password) => {
                        let item = {
                          paymentMethodID: payment.paymentMethodID,
                          title: payment.paymentName,
                          paymentAmount: value,
                          isOnline: payment.isOnline
                        };
                        settlementStore.getOnlinePayment(
                          {
                            item: item,
                            authCode: '',
                            subOrderID: this.props.params.subOrderID,
                            paidAmount: settlementStore.paymentMethodList,
                            paymentMethodID: payment.paymentMethodID,
                            paymentAmount: parseFloat(value),
                            cardID: cashierStore.memCardInfoDTO.cardID,
                            customerID: cashierStore.memCardInfoDTO.customerID,
                            password: password
                          },
                          () => {
                            //成功回调
                            // settlementStore.addReceivableDate(item);
                            item.isShowBtn = false;
                            this.addCountAmount(item); //收款--已收、待收、找零、可开票金额、是否可结账
                            cashierStore.clearMemberInfo();
                            this.setState({ memberInfo: '' });
                          },
                          () => {
                            //支付失败，失败回调
                            settlementStore.confirmPaymentStatus = false;
                            settlementStore.receivableDate.splice(
                              settlementStore.receivableDate.length - 1,
                              1
                            );
                          }
                        );
                      }}
                      onCancel={() => {
                        this.setState({ memberInfo: '' });
                      }}
                    />
                  )
                });
                this.setState({ memberPayment: '' });
              });
              // settlementStore.getMemberCard(phone)

              // let item = {
              // 	paymentMethodID: payment.paymentMethodID,
              // 	title: payment.paymentName,
              // 	paymentAmount: value,
              // };
              //settlementStore.getMemberCard({item:item,authCode:value, subOrderID: this.props.params.subOrderID,paidAmount:settlementStore.paymentMethodList, paymentMethodID: payment.paymentMethodID, paymentAmount:parseFloat(settlementStore.amountSituation.waitCollectAmount)});
            }}
            onCancel={() => {
              this.setState({ memberPayment: '' });
            }}
          />
        )
      });
    }
    // 微信线上支付判断
    if (payment.paymentMethodID === 6 || payment.paymentMethodID === 7) {
      this.setState({
        wechat: (
          <Wechat
            title={payment.paymentName}
            inputValue={settlementStore.waitCollectAmount}
            onOk={value => {
              this.setState({ wechat: '' });
              let cashStatus;
              if (payment.paymentName === '现金') {
                cashStatus = 2;
              } else {
                cashStatus = 1;
              }
              let item = {
                paymentMethodID: payment.paymentMethodID,
                title: payment.paymentName,
                paymentAmount: settlementStore.waitCollectAmount,
                isCash: cashStatus,
                isOnline: payment.isOnline,
                isShowBtn: true,
                handmade: 0
              };
              settlementStore.getOnlinePayment(
                {
                  item: item,
                  authCode: value,
                  subOrderID: this.props.params.subOrderID,
                  paidAmount: settlementStore.paymentMethodList,
                  paymentMethodID: payment.paymentMethodID,
                  paymentAmount: parseFloat(settlementStore.waitCollectAmount),
                  cardID: '',
                  customerID: '',
                  password: ''
                },
                () => {
                  this.addCountAmount(item); //收款--已收、待收、找零、可开票金额、是否可结账
                },
                () => {
                  this.addCountAmount(item); //收款--已收、待收、找零、可开票金额、是否可结账
                }
              );
            }}
            onCancel={() => {
              this.setState({ wechat: '' });
            }}
          />
        )
      });
    }
    if (
      payment.paymentMethodID === 5 ||
      payment.paymentMethodID === 11 ||
      payment.paymentMethodID === 12
    ) {
      this.setState({
        popup: (
          <CashPopup
            title={payment.paymentName}
            offline={payment.paymentMethodID !== 5 ? true : false}
            onOk={value => {
              //线下支付
              let cashStatus;
              // let sendDate = 0; //发送给后台的数据
              cashStatus = 2;
              // if (value * 1 > settlementStore.waitCollectAmount * 1) {
              //   sendDate = settlementStore.waitCollectAmount;
              // } else {
              //   sendDate = value;
              // }
              let item = {
                paymentMethodID: payment.paymentMethodID,
                title: payment.paymentName,
                paymentAmount: value,
                isCash: cashStatus,
                isOnline: payment.isOnline,
                isShowBtn: false,
                // sendDate:sendDate,//2017-9-22修改
                sendDate: value
              };
              settlementStore.addReceivableDate(item);
              this.addCountAmount(item); //收款--已收、待收、找零、可开票金额、是否可结账
              this.setState({ popup: '' });
            }}
            onCancel={() => {
              this.setState({ popup: '' });
            }}
          />
        )
      });
    }
  };

  //点结账的时候根据不同情况要跳转的页面
  skipPage = () => {
    this.cleanShoppingCart();
    if (
      this.props.location.state &&
      this.props.location.state.prevRouter === 'dishes'
    ) {
      this.setState({ titerTime: true });
      let _this = this;
      _this.setState({ titerTime: false });
      _this.context.router.push('/dine'); //返回到指定页面
    } else {
      this.setState({ titerTime: true });
      let _this = this;
      _this.setState({ titerTime: false });
      _this.context.router.goBack(); //返回上一个进入的页面
    }
  };

  componentWillUnmount() {
    this.props.settlementStore.confirmPaymentStatus = false;
    this.props.settlementStore.hadPayList = [];
  }

  /**************** 支付记录组件 *****************/
  payMentRecord = ({ ele, index, settlementStore, recordsIndex }) => {
    let deletedBlock;
    if (ele.isCash === 2) {
      deletedBlock = (
        <i
          className="iconfont icon-shanchu1"
          onClick={() => {
            this.setState({
              promptpopup: (
                <PromptPopup
                  title="提示"
                  textValue={ele.paymentAmount}
                  onOk={() => {
                    settlementStore.receivableDate.splice(index, 1);
                    this.setState({ promptpopup: '' });
                    this.minusCountAmount(ele); //退款--已收、待收、找零、可开票金额、是否可结账
                  }}
                  onCancel={() => {
                    this.setState({ promptpopup: '' });
                  }}
                >
                  <div className="prompt">
                    <p className="warning">确定删除收款</p>
                    <p className="delele-text">
                      删除金额<span>{ele.paymentAmount}</span>元
                    </p>
                  </div>
                </PromptPopup>
              )
            });
          }}
        />
      );
    } else if (ele.isCash === 1) {
      deletedBlock = (
        <i
          onClick={() => {
            this.setState({
              refundpopup: (
                <RefundPopup
                  title={ele.title}
                  textValue={ele.paymentAmount}
                  onOk={value => {
                    settlementStore.getRefund({
                      paymentMethodID: ele.paymentMethodID,
                      paidAmount: settlementStore.paymentMethodList,
                      paymentAmount: parseFloat(ele.paymentAmount),
                      oddChange: parseFloat(settlementStore.oddChange)
                    });
                    settlementStore.Refunds(ele, index);
                    this.setState({ refundpopup: '' });
                  }}
                  onCancel={() => {
                    this.setState({ refundpopup: '' });
                  }}
                />
              )
            });
          }}
        >
          退
        </i>
      );
    }

    const replaceButton = (
      <div className="onlineBtn">
        {settlementStore.orderStatus === 1430 &&
          ele.changeType !== 135 && (
            <button
              onClick={() => {
                this.setState({
                  popup: (
                    <ReplacePaymentPopup
                      onClose={() => {
                        this.setState({ popup: false });
                      }}
                      onConfirm={({ paymentMethodID, paymentName }) => {
                        settlementStore.replacePayment({
                          keyID: ele.keyID,
                          paymentMethodID,
                          paymentName
                        });
                      }}
                    />
                  )
                });
              }}
            >
              替换
            </button>
          )}
      </div>
    );

    //如果是线上支付，要二次确认
    const confirmPayment = (
      <div className="onlineBtn">
        {ele.isShowBtn && (
          <button
            onClick={() => {
              this.setState({
                promptpopup: (
                  <PromptPopup
                    title="提示"
                    textValue={ele.paymentAmount}
                    onOk={() => {
                      settlementStore.confirmOnlinePaid({ keyID: ele.keyID }); //验证是否支付成功
                      this.setState({ promptpopup: false });

                      // this.setState({ promptpopup: '' });
                      // this.addCountAmount(ele);//收款--已收、待收、找零、可开票金额、是否可结账
                      // ele.isShowBtn = false;
                      settlementStore.confirmPaymentStatus = false;
                    }}
                    onCancel={() => {
                      this.setState({ promptpopup: false });
                      settlementStore.confirmPaymentStatus = false;
                    }}
                  >
                    <div className="prompt">
                      <p className="delele-text">
                        确定收款成功？<span>{ele.paymentAmount}</span>元
                      </p>
                    </div>
                  </PromptPopup>
                )
              });
            }}
          >
            确定
          </button>
        )}
        {ele.isShowBtn && (
          <button
            onClick={() => {
              this.setState({
                promptpopup: (
                  <PromptPopup
                    title="提示"
                    textValue={ele.paymentAmount}
                    onOk={() => {
                      const keyID = ele.keyID;
                      let recordAmount;
                      settlementStore.hadPayList = settlementStore.hadPayList.filter(
                        item => {
                          if (item.keyID === keyID)
                            recordAmount = item.paymentAmount;
                          return item.keyID !== keyID;
                        }
                      );
                      settlementStore.receivableDate = settlementStore.receivableDate.filter(
                        item => {
                          if (item.keyID === keyID)
                            recordAmount = item.paymentAmount;
                          return item.keyID !== keyID;
                        }
                      );
                      settlementStore.amountReceived =
                        parseFloat(settlementStore.amountReceived) -
                        parseFloat(recordAmount); //重新计算已收金额
                      settlementStore.waitCollectAmount =
                        parseFloat(settlementStore.waitCollectAmount) +
                        parseFloat(recordAmount); //重新计算待收金额
                      // settlementStore.showFeedback({ msg: '支付失败' });
                      this.setState({ promptpopup: '' });
                      // settlementStore.hadPayList.splice(index, 1);
                      // ele.isShowBtn = false;
                      settlementStore.confirmPaymentStatus = false;
                    }}
                    onCancel={() => {
                      this.setState({ promptpopup: '' });
                    }}
                  >
                    <div className="prompt">
                      <p className="delele-text">
                        确定收款失败？<span>{ele.paymentAmount}</span>元
                      </p>
                    </div>
                  </PromptPopup>
                )
              });
            }}
          >
            取消
          </button>
        )}
      </div>
    );
    return (
      <li key={index} className={ele.isCash === 2 ? 'cash' : 'normal'}>
        {ele.paymentAmount > 0 ? (
          <span>{recordsIndex}</span>
        ) : (
          <span>&nbsp;</span>
        )}
        <span>{ele.title}</span>
        <span>￥{parseFloat(ele.paymentAmount).toFixed(2)}</span>
        {deletedBlock}
        {confirmPayment}
        {replaceButton}
      </li>
    );
  };
  /**************** 支付记录组件 *****************/

  //清空购物车
  cleanShoppingCart = () => {
    const { dishesStore, params } = this.props;
    const subOrderID = params.subOrderID;
    if (localStorage.getItem(subOrderID)) {
      const { shoppingCart } = JSON.parse(localStorage.getItem(subOrderID));
      localStorage.removeItem(subOrderID); //删除购物车信息
      dishesStore.cleanShoppingCart({
        shoppingCart: shoppingCart.map(product => ({
          productID: product.productID,
          variantID: product.variantID,
          optionID: product.optionID,
          quantity:
            -1 * (product.needWeigh ? product.expectedWeight : product.quantity)
        }))
      });
    }
  };

  render() {
    let settlementStore = this.props.settlementStore;
    let feedback = settlementStore.feedback;
    let morePopup;
    let adjustProduct;
    let discountPopup;
    let categoryDiscountPopup;
    let operatePrompt;
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let LationOFSuspense = permissionList.includes(
      'CheckoutModule:lationOFSuspense'
    ); //暂结
    let Drawabill = permissionList.includes('CheckoutModule:Drawabill'); //开发票
    let Checkout = permissionList.includes('CheckoutModule:Checkout'); //结账

    //关联桌无有数据时
    // let relevanceTable;
    // if (orderInfo.comTableCode === null) {
    //   relevanceTable = <div className="relate-desk" />;
    // } else {
    //   relevanceTable = (
    //     <div className="relate-desk">
    //       关联桌台：<span>{orderInfo.comTableCode}</span>
    //     </div>
    //   );
    // }
    //折扣券弹窗显示
    if (this.props.settlementStore.discountCouponShow) {
      discountPopup = <DiscountCoupon />;
    }

    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        settlementStore.closeFeedback();
      };
      // operatePrompt = <Prompt message={feedback} />
    }

    if (settlementStore.moreShow) {
      morePopup = (
        <MorePopup
          subOrderID={this.props.params.subOrderID}
          tableID={this.props.params.tableID}
        />
      );
    }
    if (settlementStore.categoryDiscount) {
      categoryDiscountPopup = <CategoryDiscount />;
    }
    if (this.props.settlementStore.adjustProductShow) {
      adjustProduct = <AdjustProductDiscout />;
    }

    // 结账主页面右边金额下的按钮
    let btnBlock;
    btnBlock = settlementStore.mbtns.map((ele, index) => {
      return (
        <li
          key={index}
          onClick={() => {
            // ele.selected = !ele.selected;
            if (settlementStore.disable) {
              message.destroy();
              message.info('不能再进行折扣');
            } else {
              this.setState({ current: index });

              if (ele.text === '更多') {
                settlementStore.getMore();
              }
              if (ele.text === '分类折') {
                settlementStore.getCategoryDiscount();
              }
              if (ele.text === '折扣券') {
                settlementStore.getDiscountCoupon();
              }

              if (ele.text === '会员折') {
                this.setState({
                  memberpopup: (
                    <MemberDiscount
                      title={'会员折'}
                      isDiscount={true}
                      subOrderID={this.props.params.subOrderID}
                      onOk={(phone, type) => {
                        settlementStore.getMemberDiscount(
                          {
                            subOrderID: this.props.params.subOrderID,
                            memberCodeType: type,
                            memberCode: phone
                          },
                          () => {
                            this.setState({ memberpopup: '' });
                          }
                        );
                      }}
                      onCancel={() => {
                        this.setState({ memberpopup: '' });
                      }}
                    />
                  )
                });
              }
              // if(ele.text==="收服务费"){
              // 	settlementStore.getServiceCharge({subOrderID:this.props.params.subOrderID});
              // }

              if (
                ele.text === '权限折' ||
                ele.text === '全单折' ||
                ele.text === '单品折' ||
                ele.text === '减免' ||
                ele.text === '免单' ||
                ele.text === '免服务费'
              ) {
                let _this = this;
                let ChangePassword = '',
                  title = '';
                switch (ele.text) {
                  case '权限折':
                    ChangePassword = 'PrivilegeFold';
                    title = '权限折';
                    break;
                  case '全单折':
                    ChangePassword = 'FullSingleFold';
                    title = '全单折';
                    break;
                  case '单品折':
                    ChangePassword = 'SingleProductDiscount';
                    title = '单品折';
                    break;
                  case '减免':
                    ChangePassword = 'Reduction';
                    title = '减免';
                    break;
                  case '免单':
                    ChangePassword = 'FreeSingle';
                    title = '免单';
                    break;
                  case '免服务费':
                    ChangePassword = 'FreeServiceCharge';
                    title = '免服务费';
                    break;
                  default:
                    break;
                }

                let object = {
                  moduleCode: 'DiscountModule',
                  privilegeCode: ChangePassword,
                  title: title,
                  toDoSomething: function() {
                    if (ele.text === '免单') {
                      settlementStore.getOrderFree({
                        subOrderID: _this.props.params.subOrderID
                      });
                      _this.setState({ discountPricePopup: '' });
                    }
                    if (ele.text === '免服务费') {
                      settlementStore.getFreeServiceCharge({
                        subOrderID: _this.props.params.subOrderID
                      });
                      _this.setState({ discountPricePopup: '' });
                    }

                    if (ele.text === '减免') {
                      settlementStore.getEmployeeCanReduceAmount(
                        { subOrderID: _this.props.params.subOrderID },
                        () => {
                          _this.setState({
                            discountPricePopup: (
                              <DiscountPrice
                                alert={
                                  '你本次可减免金额最多为' +
                                  settlementStore.bigDecimal
                                }
                                title={ele.text}
                                onOk={value => {
                                  settlementStore.getReduceAmount({
                                    subOrderID: _this.props.params.subOrderID,
                                    discountAmount: value
                                  });
                                  settlementStore.disable = true;
                                  _this.setState({ discountPricePopup: '' });
                                }}
                                onCancel={() => {
                                  _this.setState({ discountPricePopup: '' });
                                }}
                              />
                            )
                          });
                        }
                      );
                    } else if (ele.text === '权限折' || ele.text === '全单折') {
                      _this.setState({
                        discountPricePopup: (
                          <DiscountPrice
                            alert=""
                            title={ele.text}
                            onOk={value => {
                              _this.setState({
                                promptpopup: (
                                  <PromptPopup
                                    title="提示"
                                    textValue={ele.paymentAmount}
                                    onOk={() => {
                                      if (ele.text === '权限折') {
                                        settlementStore.getAuthorityDiscount(
                                          {
                                            subOrderID:
                                              _this.props.params.subOrderID,
                                            discountPercentage: parseFloat(
                                              value
                                            )
                                          },
                                          () => {
                                            settlementStore.waitCollectAmount =
                                              settlementStore.amountReceived -
                                              settlementStore.amountSituation
                                                .payableAmount;
                                            settlementStore.oddChange =
                                              settlementStore.amountReceived -
                                              settlementStore.waitCollectAmount;
                                            _this.setState({
                                              discountPricePopup: ''
                                            });
                                          }
                                        );
                                        _this.setState({ alertShow: '' });
                                      }
                                      if (ele.text === '全单折') {
                                        settlementStore.getOrderDiscount(
                                          {
                                            subOrderID:
                                              _this.props.params.subOrderID,
                                            discountPercentage: parseFloat(
                                              value
                                            )
                                          },
                                          () => {
                                            _this.setState({
                                              discountPricePopup: ''
                                            });
                                          }
                                        );
                                        _this.setState({ alertShow: '' });
                                      }
                                      _this.setState({ promptpopup: '' });
                                      _this.setState({
                                        discountType: ele.text + value + '折'
                                      }); //显示折扣方式

                                      // this.setState({showDiscount:true});//显示取消折扣按钮
                                    }}
                                    onCancel={() => {
                                      _this.setState({ promptpopup: '' });
                                    }}
                                  >
                                    <div className="prompt">
                                      <p className="warning">
                                        确定进行{ele.text}（{value * 1}折）吗？
                                      </p>
                                    </div>
                                  </PromptPopup>
                                )
                              });
                            }}
                            onCancel={() => {
                              _this.setState({ discountPricePopup: '' });
                            }}
                          />
                        )
                      });
                    }
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
              }
            }
          }}
          className={classnames({
            active: index === this.state.current,
            disable: settlementStore.disable,
            noshow:
              ele.text === '会员折' &&
              !permissionList.includes('DiscountModule:Membershipdiscount')
          })}
        >
          {ele.text}
        </li>
      );
    });

    // 主页面已收款添加数据
    // isCash=0   什么都不显示
    // isCash=1   显示退字
    // isCash=2   显示关闭 --现金
    let hadpayBlock,
      receivableBlock,
      recordsIndex = 1;
    if (settlementStore.hadPayList.length > 0) {
      hadpayBlock = settlementStore.hadPayList.map((ele, index) => {
        return this.payMentRecord({
          ele,
          index,
          settlementStore,
          recordsIndex: recordsIndex++
        });
      });
    }
    if (settlementStore.receivableDate.length > 0) {
      receivableBlock = settlementStore.receivableDate.map((ele, index) => {
        return this.payMentRecord({
          ele,
          index,
          settlementStore,
          recordsIndex: recordsIndex++
        });
      });
    }

    // 应收金额
    let payableAmount;
    if (settlementStore.amountSituation.payableAmount <= 0) {
      payableAmount = (
        <div className="receive">
          应收：<span>0</span>
        </div>
      );
    } else {
      payableAmount = (
        <div className="receive">
          应收：<span>
            {parseFloat(settlementStore.amountSituation.payableAmount).toFixed(
              2
            )}
          </span>
        </div>
      );
    }
    // 服务费
    let freeServiceStyle;
    if (settlementStore.amountSituation.serviceFee <= 0) {
      freeServiceStyle = (
        <li>
          <span className="title">服 务 费：</span>
          <span className={settlementStore.freeServiceStyle}>0</span>
        </li>
      );
    } else {
      freeServiceStyle = (
        <li>
          <span className="title">服 务 费：</span>
          <span className={settlementStore.freeServiceStyle}>
            {parseFloat(settlementStore.serviceAmount).toFixed(2)}
          </span>
        </li>
      );
    }

    const isAdjustOrder = settlementStore.orderStatus === 1430; //是否是调账

    return (
      <div id="order_account">
        <div className="account-header">
          结账
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              //返回桌台界面
              this.context.router.goBack();
            }}
          />
        </div>
        <div id="account_container">
          <div id="account_con_left">
            <Scrollbars>
              {settlementStore.settlementLeft &&
                settlementStore.settlementLeft.map((table, index) => {
                  //左边菜品头部信
                  return (
                    <div key={index}>
                      <div className="dishes-info">
                        <div className="info-title">
                          <span>{table.tableUseInfoVO.orderCode}</span>
                        </div>
                        <ul>
                          <li>
                            <i className="iconfont icon-order_icon_desk" />
                            {table.tableUseInfoVO.tableName}
                          </li>
                          <li>
                            <i className="iconfont icon-order_icon_number" />
                            {table.tableUseInfoVO.peopleNum}
                          </li>
                          <li>
                            <i className="iconfont icon-order_icon_waiter" />
                            {table.tableUseInfoVO.waiterName}
                          </li>
                          <li>
                            <i className="iconfont icon-oeder_icon_time" />
                            {formatDate(
                              formatStamp(table.tableUseInfoVO.startTime),
                              'hh:mm'
                            )}
                          </li>
                          <li>
                            <i className="iconfont icon-account_icon_shichang" />
                            {table.tableUseInfoVO.minute}
                          </li>
                        </ul>
                        {table.tableUseInfoVO.memo ? (
                          <div className="info-remarks">
                            整单备注：{table.tableUseInfoVO.memo}
                          </div>
                        ) : (
                          <div className="info-remarks">整单备注：无</div>
                        )}
                      </div>
                      <div className="dishes-list">
                        <div className="list-title">
                          <span>序号</span>
                          <span>名称(规格)</span>
                          <span>数量</span>
                          <span>金额</span>
                        </div>
                        <div className="list-content">
                          <ul>
                            {table.orderProductList.map(
                              (dishes, dishesindex) => {
                                //左边菜品列表
                                let didOrder = [];
                                didOrder.push(
                                  <DidOrder
                                    key={dishesindex}
                                    index={dishesindex + 1}
                                    dishes={dishes}
                                  />
                                );
                                if (dishes.childs && dishes.childs.length) {
                                  dishes.childs.forEach((child, childindex) => {
                                    didOrder.push(
                                      <DidOrder
                                        key={dishesindex + '-' + childindex}
                                        index={-1}
                                        dishes={child}
                                      />
                                    );
                                  });
                                }
                                return didOrder;
                              }
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </Scrollbars>
            <div className="list-all">
              <div>
                {' '}
                总数：<span>{settlementStore.subTotalNumber}</span>
              </div>
              <div>
                总金额：<span>
                  {parseFloat(settlementStore.subTotalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div id="account_con_right">
            <div className="discount-block">
              <div className="title-block">
                <span>订单金额</span>
                <span className="title-dis-number">
                  {settlementStore.activeDisCountType}
                </span>
                <span
                  className={classnames({
                    'title-dis-number': true,
                    'title-btn-hide': !settlementStore.showDiscount
                  })}
                >
                  折扣方式：{settlementStore.discountMsg}
                </span>
                <span
                  className={classnames({
                    'title-btn': true,
                    // "title-btn-hide":!settlementStore.showDiscount,
                    'title-btn-hide': true
                  })}
                  onClick={() => {
                    settlementStore.getCancleDiscount(
                      this.props.params.subOrderID,
                      1
                    );
                  }}
                >
                  取消折扣
                </span>
              </div>
              <div className="content">
                <div className="message-block">
                  <ul className="info">
                    <li>
                      <span className="title">消费金额：</span>
                      {parseFloat(
                        settlementStore.amountSituation.totalAmount
                      ).toFixed(2)}
                    </li>
                    <li>
                      <span className="title">赠送金额：</span>
                      {parseFloat(
                        settlementStore.amountSituation.giveProductAmount
                      ).toFixed(2)}
                    </li>
                    <li>
                      <span className="title">折扣金额：</span>
                      {parseFloat(
                        settlementStore.amountSituation.discountAmount
                      ).toFixed(2)}
                    </li>
                    {freeServiceStyle}
                    <li>
                      <span className="title">减免金额：</span>
                      {parseFloat(
                        settlementStore.amountSituation.reductionAmount
                      ).toFixed(2)}
                    </li>
                    <li>
                      <span className="title">减 免 人：</span>
                      {settlementStore.amountSituation.reductionPerson}
                    </li>
                    <li>
                      <span className="title">抹零金额：</span>
                      {parseFloat(
                        settlementStore.amountSituation.droptailAmount
                      ).toFixed(2)}
                    </li>
                    <li>
                      <span className="title">兑换商品：</span>0.00
                    </li>
                  </ul>
                  {payableAmount}
                </div>

                <ul className="discount">{btnBlock}</ul>
              </div>
            </div>
            <div className="pay-block">
              <div className="title-block">
                <div className="my-title">收款情况</div>
                <ul className="money">
                  <li>
                    <span className="title">已收：</span>
                    {parseFloat(settlementStore.amountReceived).toFixed(2)}
                  </li>
                  <li>
                    <span className="title">定金：</span>
                    {parseFloat(
                      settlementStore.amountSituation.bookingAmount
                    ).toFixed(2)}
                  </li>
                  <li className="red">
                    <span className="title">待收：</span>
                    {parseFloat(settlementStore.waitCollectAmount).toFixed(2)}
                  </li>
                  <li>
                    <span className="title">找零：</span>
                    {parseFloat(settlementStore.oddChange).toFixed(2)}
                  </li>
                  <li>
                    <span className="title">已开票金额：</span>
                    {parseFloat(settlementStore.invoiceAmount).toFixed(2)}
                  </li>
                </ul>
              </div>
              <div className="has-gathering">
                <div className="gathering-title">已收款</div>
                <ul className="pay-items">
                  {hadpayBlock}
                  {receivableBlock}
                </ul>
              </div>
              <ul className="payment-method">
                {settlementStore.paymentList.map((payment, index) => {
                  return (
                    <PayMent
                      key={index}
                      payMent={payment}
                      clickHandle={() => {
                        if (
                          parseFloat(settlementStore.waitCollectAmount) === 0
                        ) {
                          //判断收款是否足够
                          message.destroy();
                          message.info('收款已足够，不需再收款');
                        } else {
                          if (settlementStore.confirmPaymentStatus) {
                            //判断在线支付是否已确定和取消
                            message.destroy();
                            message.info('请先确定或取消在线支付');
                          } else {
                            this.addPayMent(payment);
                          }
                        }
                      }}
                    />
                  );
                })}
              </ul>
            </div>
            <div className="footer">
              {!isAdjustOrder &&
                LationOFSuspense && (
                  <div
                    onClick={() => {
                      if (settlementStore.stopSettlement === '暂结') {
                        settlementStore.getTemporarily(
                          { subOrderID: this.props.params.subOrderID },
                          () => {
                            settlementStore.disable = true;
                            message.destroy();
                            message.info('暂结成功');
                          }
                        );
                      } else {
                        let _this = this;
                        let object = {
                          moduleCode: 'CheckoutModule', //结账模块
                          privilegeCode: 'CancellationOfSuspense',
                          title: '取消暂结',
                          toDoSomething: function() {
                            settlementStore.cancelTemporarily(
                              { subOrderID: _this.props.params.subOrderID },
                              () => {
                                if (
                                  settlementStore.showDiscount ||
                                  parseFloat(
                                    settlementStore.waitCollectAmount
                                  ) === 0
                                ) {
                                  settlementStore.disable = true;
                                } else {
                                  settlementStore.disable = false;
                                }
                                message.destroy();
                                message.info('恢复暂结成功');
                              }
                            );
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
                      }
                    }}
                  >
                    {settlementStore.stopSettlement}
                  </div>
                )}

              {!isAdjustOrder &&
                Drawabill && (
                  <div
                    onClick={() => {
                      //orderAmount订单金额--即应收金额；invoiceAmount开票金额
                      this.setState({
                        invoice: (
                          <InvoicePopup
                            subOrderID={this.props.params.subOrderID}
                            orderAmount={
                              settlementStore.amountSituation.payableAmount
                            }
                            invoiceAmount={settlementStore.invoiceAmount}
                            handleClose={this.closePopup}
                          />
                        )
                      });
                    }}
                  >
                    开发票
                  </div>
                )}
              {Checkout && (
                <div
                  className={classnames({
                    active: true,
                    disable: !settlementStore.settlementBtnDisable
                  })}
                  onClick={() => {
                    if (settlementStore.clicktag === 0) {
                      settlementStore.clicktag = 1;
                      if (settlementStore.waitCollectAmount > 0) {
                        message.destroy();
                        message.info('收款未完成');
                        settlementStore.clicktag = 0;
                      } else {
                        settlementStore.paymentCashAll = settlementStore.receivableDate.filter(
                          (ele, index) => {
                            //过滤现金支付
                            return ele.paymentMethodID === 5;
                          }
                        );
                        settlementStore.paymentOfflineWechatAll = settlementStore.receivableDate.filter(
                          (ele, index) => {
                            //过滤线下微信支付
                            return ele.paymentMethodID === 11;
                          }
                        );
                        settlementStore.paymentOfflineAlipayAll = settlementStore.receivableDate.filter(
                          (ele, index) => {
                            //过滤线下支付宝支付
                            return ele.paymentMethodID === 12;
                          }
                        );
                        settlementStore.allPayList = settlementStore.receivableDate.filter(
                          (ele, index) => {
                            //过滤线上支付
                            return (
                              ele.paymentMethodID === 6 ||
                              ele.paymentMethodID === 7 ||
                              ele.paymentMethodID === 8
                            );
                          }
                        );
                        if (settlementStore.allPayList.length > 0) {
                          let allPayList = [];
                          settlementStore.allPayList.map((payList, index) => {
                            allPayList.push({
                              isOnline: payList.isOnline,
                              paymentAmount: parseFloat(payList.paymentAmount),
                              paymentMethodID: payList.paymentMethodID
                            });
                            return allPayList;
                          });
                          // settlementStore.allPayList=[{isOnline:settlementStore.allPayList[0].isOnline,paymentAmount:parseFloat(settlementStore.allPayList[0].paymentAmount),paymentMethodID:settlementStore.allPayList[0].paymentMethodID}];
                        }
                        let cash = 0; //现金支付
                        let wechatOffline = 0; //线下微信支付
                        let alipayOffline = 0; //线下支付宝支付
                        settlementStore.paymentCashAll.forEach((ele, index) => {
                          cash += ele.sendDate * 1;
                        });

                        settlementStore.paymentOfflineWechatAll.forEach(
                          (ele, index) => {
                            wechatOffline += ele.sendDate * 1;
                          }
                        );
                        settlementStore.paymentOfflineAlipayAll.forEach(
                          (ele, index) => {
                            alipayOffline += ele.sendDate * 1;
                          }
                        );

                        settlementStore.allPayList = [
                          ...settlementStore.hadPayList,
                          ...settlementStore.allPayList
                        ];
                        if (settlementStore.receivableDate.length > 0) {
                          //判断存在支付数目
                          if (
                            settlementStore.paymentOfflineWechatAll.length >
                              0 ||
                            settlementStore.paymentOfflineAlipayAll.length >
                              0 ||
                            settlementStore.paymentCashAll.length > 0
                          ) {
                            if (
                              settlementStore.paymentOfflineWechatAll.length > 0
                            ) {
                              //存在线下微信支付
                              settlementStore.OfflineWechatLish.push({
                                isOnline:
                                  settlementStore.paymentOfflineWechatAll[0]
                                    .isOnline,
                                paymentAmount: wechatOffline,
                                paymentMethodID:
                                  settlementStore.paymentOfflineWechatAll[0]
                                    .paymentMethodID
                              }); //线下微信支付汇总成一条
                              settlementStore.allPayList.push(
                                settlementStore.OfflineWechatLish.pop()
                              );
                            }
                            if (
                              settlementStore.paymentOfflineAlipayAll.length > 0
                            ) {
                              //存在线下支付宝支付
                              settlementStore.OfflineAlipayLish.push({
                                isOnline:
                                  settlementStore.paymentOfflineAlipayAll[0]
                                    .isOnline,
                                paymentAmount: alipayOffline,
                                paymentMethodID:
                                  settlementStore.paymentOfflineAlipayAll[0]
                                    .paymentMethodID
                              }); //线下支付宝汇 总成一条
                              settlementStore.allPayList.push(
                                settlementStore.OfflineAlipayLish.pop()
                              );
                            }
                            if (settlementStore.paymentCashAll.length > 0) {
                              //判断存在现金支付
                              settlementStore.cashLish.push({
                                isOnline:
                                  settlementStore.paymentCashAll[0].isOnline,
                                paymentAmount: cash,
                                paymentMethodID:
                                  settlementStore.paymentCashAll[0]
                                    .paymentMethodID
                              }); //现金支付汇总成一条
                              settlementStore.allPayList.push(
                                settlementStore.cashLish.pop()
                              );
                            }
                            settlementStore.getOrderSettlement(
                              this.props.params.subOrderID,
                              settlementStore.allPayList,
                              () => {
                                this.skipPage();
                              }
                            );
                          } else {
                            //只有在线支付时
                            settlementStore.getOrderSettlement(
                              this.props.params.subOrderID,
                              settlementStore.allPayList,
                              () => {
                                this.skipPage();
                              }
                            );
                          }
                        } else {
                          settlementStore.getOrderSettlement(
                            this.props.params.subOrderID,
                            settlementStore.allPayList,
                            () => {
                              this.skipPage();
                            }
                          );
                          // if(this.props.location.state && this.props.location.state.prevRouter === 'dishes') {
                          // 	this.context.router.push('/dine');
                          // }else {
                          // 	this.context.router.goBack();
                          // }
                        }
                      }
                    }
                  }}
                >
                  {isAdjustOrder ? '确认调账' : '结账'}
                </div>
              )}
            </div>
          </div>
        </div>
        {this.state.titerTime && <Loading />}

        {morePopup}
        {adjustProduct}
        {discountPopup}
        {operatePrompt}
        {categoryDiscountPopup}
        {this.state.discountPricePopup}
        {this.state.popup}
        {this.state.wechat}
        {this.state.memberpopup}
        {this.state.memberPayment}
        {this.state.memberInfo}
        {this.state.refundpopup}
        {this.state.promptpopup}
        {this.state.accreditPopup}
        {this.state.invoice}
      </div>
    );
  }
}
/**************** 消息中心主容器组件 *****************/

Settlement.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Settlement;
