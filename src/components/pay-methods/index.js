/**
* @author Shelly
* @description 支付方式
* @date 2017-6-4
**/
import React from 'react';

import { inject, observer } from 'mobx-react';
import { message } from 'antd';
import classnames from 'classnames';

import Wechat from 'components/wechat-pay-popup/'; //微信支付弹窗
import MemberPay from 'components/member-discount-popup'; //会员卡支付弹窗
import CouponPay from 'components/discount-coupon-popup'; //现金券支付
import EnterCard from 'components/enter-card'; //输入餐牌号
import MemberInfo from 'components/member-payment-popup/'; //会员信息弹窗

message.config({
  top: 300,
  duration: 1
});

/**************** 支付方式组件 *****************/
function PayMent({ payMent, clickHandle, cashierStore }) {
  return (
    <div
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
        'pay-cilaccolour':
          payMent.paymentName === '代金券' ||
          payMent.paymentName === '积分折现' ||
          payMent.paymentName === 'K币' ||
          payMent.paymentName === '挂账'
      })}
    >
      {payMent.paymentMethodID === 5 && cashierStore.cashMoney > 0 ? (
        <p className="num">{cashierStore.cashMoney}</p>
      ) : (
        ''
      )}
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
    </div>
  );
}
/**************** 支付方式组件 *****************/

@inject('cashierStore', 'settlementStore', 'dishesCashierStore', 'dishesStore')
@observer
class PayMethod extends React.Component {
  constructor(props, context) {
    super(props, context);
    props.settlementStore.getPaymentMethod();
  }
  state = {
    statePopup: false,
    cardID: ''
  };

  //判断是否需要输入餐牌
  enableSequece = (title, payment, value, password) => {
    let cashierStore = this.props.cashierStore;
    let dishesCashierStore = this.props.dishesCashierStore;
    if (this.props.optional) {
      //判断是自选快餐还是点菜快餐，如果optional存在就是自选，那就不需要输入餐牌
      this.payMethod(title, payment, value, password);
    } else {
      if (cashierStore.isEnableSequece) {
        //判断是否需要输入餐牌
        this.setState({
          statePopup: (
            <EnterCard
              onOk={carNum => {
                cashierStore.getInsertSequece(
                  dishesCashierStore.orderID,
                  carNum
                );
                this.payMethod(title, payment, value, password);
                this.closeStatePopup();
              }}
              onCancel={() => {
                this.closeStatePopup();
              }}
            />
          )
        });
      } else {
        this.payMethod(title, payment, value, password);
      }
    }
  };

  // 支付宝支付 && 微信支付
  alipayMethod = (title, payment, autoCode, password) => {
    if (this.props.optional && this.props.payAmount * 1 === 0) {
      message.destroy();
      message.info('你无需支付金额');
    } else {
      this.setState({
        statePopup: (
          <Wechat
            title={title}
            inputValue={this.props.payAmount}
            waitAmount={this.props.value}
            onOk={autoCode => {
              //inputValue为支付金额  waitAmount为待支付金额
              this.enableSequece(title, payment, autoCode, '');
              this.closeStatePopup();
            }}
            onCancel={() => {
              this.closeStatePopup();
            }}
          />
        )
      });
    }
  };

  // 会员卡支付&&积分抵现
  memberMethod = (title, payment) => {
    let cashierStore = this.props.cashierStore;
    if (this.props.optional && this.props.payAmount * 1 === 0) {
      message.destroy();
      message.info('你无需支付金额');
    } else {
      this.setState({
        statePopup: (
          <MemberPay
            title={title}
            inputValue={this.props.payAmount}
            waitAmount={this.props.value}
            onOk={(phone, cardID, cardCode) => {
              cashierStore.getMemberInfol(phone, cardID, cardCode, () => {
                this.setState({
                  statePopup: (
                    <MemberInfo
                      cardInfo={cashierStore.memCardInfoDTO}
                      price={this.props.value}
                      inputValue={this.props.payAmount}
                      isCashierMember={true}
                      isSnack={this.props.isSnack}
                      onOk={(value, password) => {
                        this.enableSequece(title, payment, phone, password);
                      }}
                      onCancel={() => {
                        this.closeStatePopup();
                      }}
                    />
                  )
                });
              });
            }}
            onCancel={() => {
              this.closeStatePopup();
            }}
          />
        )
      });
    }
  };
  // 现金支付
  cashMethod = (title, payment) => {
    if (this.props.optional && this.props.payAmount * 1 === 0) {
      message.destroy();
      message.info('你无需支付金额');
    } else {
      this.payMethod(title, payment);
    }
    // let cashierStore=this.props.cashierStore;
    // if(cashierStore.cashMoney>0){
    //     if(parseFloat(this.props.payAmount)===0 || this.props.payAmount===''){
    //             message.info("支付金额不能为零");
    //     }else{
    //         this.setState({
    //         statePopup: <MorePay title={title} payAmount={this.props.payAmount} onOk={()=>{
    //             //确定
    //                 this.payMethod(title,payment);
    //                 this.closeStatePopup();
    //             }}  onCancel={() => {
    //             //取消
    //                 this.closeStatePopup();
    //             }}/>
    //         });
    //     }
    // }else{
    //     cashierStore.payList=[];//每次进来的时候清空现金支付的数据
    //         this.payMethod(title,payment);
    //         let item={
    //         paymentAmount: this.props.payAmount,
    //         isOnline:false
    //         }
    //         cashierStore.addReceivableDate(item);
    // }
  };
  // 线下微信和线下支付宝
  offline = (title, payment) => {
    if (this.props.optional && this.props.payAmount * 1 === 0) {
      message.destroy();
      message.info('你无需支付金额');
    } else {
      this.payMethod(title, payment);
    }
  };
  // 银行卡支付
  bankMethod = title => {
    this.enableSequece(title);
  };
  // 代金券支付
  couponMethod = title => {
    this.setState({
      statePopup: (
        <CouponPay
          title={title}
          onOk={() => {
            this.closeStatePopup();
            this.enableSequece(title);
          }}
          onCancel={() => {
            this.closeStatePopup();
          }}
        />
      )
    });
  };
  //关闭其他弹窗
  closeStatePopup() {
    this.setState({
      statePopup: false
    });
  }

  // 支付提示语
  messageHint() {
    message.info('请一次性支付');
  }
  // 结账完成后清空数据
  clearAllData() {
    let cashierStore = this.props.cashierStore;
    let dishesCashierStore = this.props.dishesCashierStore;
    let dishesStore = this.props.dishesStore;
    dishesStore.clearShoppingCart(); //清空购物车
    dishesCashierStore.changeOrderID(); //清空orderID
    cashierStore.clearData();
    cashierStore.changeSettleAccount(0);
  }
  /********点菜快餐中的线下支付***************/
  dishOfflinePay(payment) {
    let shoppingCartAndPayAndDiscountInfo;
    let dishesStore = this.props.dishesStore;
    let dishesCashierStore = this.props.dishesCashierStore;
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
        cardID: '',
        customerID: '',
        authCode: '',
        paymentAmount: dishesStore.shoppingCartTotal.totalAmount,
        paymentMethodID: payment
      },
      quickOrderDetailList: dishesStore.shoppingCart
    };
    dishesCashierStore.getQuickOrder(
      dishesCashierStore.orderType,
      shoppingCartAndPayAndDiscountInfo,
      this.props.memo,
      '',
      () => {
        //刷新菜品列表
        dishesStore.getDishesList({});
        this.clearAllData();
      }
    );
  }

  /********点菜快餐中的线上支付***************/
  dishOnlinePay(payment, autoCode, password) {
    let shoppingCartAndPayAndDiscountInfo;
    let dishesStore = this.props.dishesStore;
    let cashierStore = this.props.cashierStore;
    let dishesCashierStore = this.props.dishesCashierStore;
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
        customerID: '',
        authCode: autoCode,
        paymentAmount: dishesStore.shoppingCartTotal.totalAmount,
        paymentMethodID: payment
      },
      quickOrderDetailList: dishesStore.shoppingCart
    };
    dishesCashierStore.getQuickOrder(
      dishesCashierStore.orderType,
      shoppingCartAndPayAndDiscountInfo,
      this.props.memo,
      password,
      () => {
        //刷新菜品列表
        dishesStore.getDishesList({});
        this.clearAllData();
      }
    );
  }
  // 支付方式
  payMethod = (title, payment, autoCode, password) => {
    let cashierStore = this.props.cashierStore;
    let dishesStore = this.props.dishesStore;
    let dishesCashierStore = this.props.dishesCashierStore;
    if (cashierStore.payAll >= cashierStore.settleAccount) {
      //如果支付总额大于应收金额
      if (payment === 5 || payment === 11 || payment === 12) {
        //线下
        if (this.props.dishesPay) {
          if (dishesStore.shoppingCartTotal.totalAmount * 1 === 0) {
            //当支付金额为0时只能选择现金支付
            if (payment !== 5) {
              message.destroy();
              message.info('请选择现金支付');
            } else {
              this.dishOfflinePay(payment);
            }
          } else {
            this.dishOfflinePay(payment);
          }
        } else {
          cashierStore.changePayMoney(title);
          cashierStore.changePayAccount(
            parseFloat(cashierStore.settleAccount) -
              parseFloat(cashierStore.payAll)
          ); //默认的支付金额=结算金额-已收金额
          cashierStore.getCashPayment(
            payment,
            parseFloat(this.props.payAmount),
            dishesCashierStore.orderID
          ); //支付方式/支付金额/订单ID
          cashierStore.changeWaitPayAccount(); //待付金额
          this.clearAllData();
        }

        // cashierStore.getCashPayment(payment,parseFloat(this.props.payAmount),dishesCashierStore.orderID);//支付方式/支付金额/订单ID
      } else {
        if (this.props.dishesPay) {
          // if(dishesStore.shoppingCartTotal.totalAmount*1 === 0){
          //     message.destroy();
          //     message.info("请选择现金支付");
          //     return;
          // }else{
          //     this.dishOnlinePay(payment,autoCode,password);
          // }
          this.dishOnlinePay(payment, autoCode, password);
        } else {
          cashierStore.changePayAccount(
            parseFloat(cashierStore.settleAccount) -
              parseFloat(cashierStore.payAll)
          ); //默认的支付金额=结算金额-已收金额
          cashierStore.getOnlinePayment(
            payment,
            parseFloat(this.props.payAmount),
            dishesCashierStore.orderID,
            autoCode,
            cashierStore.cardID,
            password,
            () => {
              //支付方式/支付金额/订单ID/autoCode/会员卡号/密码/回调
              cashierStore.changePayMoney(title);
              this.clearAllData();
            }
          );
        }
      }
    } else {
      // cashierStore.changePayMoney(title);
      // cashierStore.changePayAccount(parseFloat(cashierStore.settleAccount)-parseFloat(cashierStore.payAll));//默认的支付金额=结算金额-已收金额
      if (payment === 5 || payment === 11 || payment === 12) {
        //线下
        if (this.props.dishesPay) {
          this.dishOfflinePay(payment);
        } else {
          cashierStore.changePayMoney(title);
          cashierStore.changePayAccount(
            parseFloat(cashierStore.settleAccount) -
              parseFloat(cashierStore.payAll)
          ); //默认的支付金额=结算金额-已收金额
          cashierStore.getCashPayment(
            payment,
            parseFloat(this.props.payAmount),
            dishesCashierStore.orderID
          ); //支付方式/支付金额/订单ID
          cashierStore.changeWaitPayAccount(); //待付金额
          this.clearAllData();
        }
      } else {
        if (this.props.dishesPay) {
          this.dishOnlinePay(payment, autoCode, password);
        } else {
          cashierStore.changePayAccount(
            parseFloat(cashierStore.settleAccount) -
              parseFloat(cashierStore.payAll)
          ); //默认的支付金额=结算金额-已收金额
          cashierStore.getOnlinePayment(
            payment,
            parseFloat(this.props.payAmount),
            dishesCashierStore.orderID,
            autoCode,
            cashierStore.cardID,
            password,
            () => {
              //支付方式/支付金额/订单ID/autoCode/会员卡号/回调
              cashierStore.changePayMoney(title);
              this.clearAllData();
            }
          );
        }
      }
      if (cashierStore.waitPayAccount <= 0) {
        dishesStore.clearShoppingCart(); //清空购物车
        dishesCashierStore.changeOrderID(); //清空orderID
      }
    }
  };

  //增加付款
  addPayMent = (payment, autoCode) => {
    let cashierStore = this.props.cashierStore;
    let dishesStore = this.props.dishesStore;
    console.log(cashierStore.payAccount, '支付');
    console.log(dishesStore.shoppingCartTotal.totalAmount);
    if (this.props.dishesPay) {
      //如果点菜快餐中支付金额为0，就只能用现金支付
      if (dishesStore.shoppingCartTotal.totalAmount * 1 === 0) {
        if (payment.paymentMethodID !== 5) {
          message.destroy();
          message.info('请选择现金支付');
          return;
        }
      }
    }

    if (
      cashierStore.payAccount < cashierStore.waitPayAccount ||
      cashierStore.payAccount < dishesStore.shoppingCartTotal.totalAmount
    ) {
      //支付金额要大于待付金额才会往下走
      message.destroy();
      message.info('支付金额不能小于应收金额');
    } else {
      //会员卡支付
      if (payment.paymentMethodID === 8) {
        if (parseFloat(this.props.payAmount) === parseFloat(this.props.value)) {
          this.memberMethod('会员卡支付', payment.paymentMethodID);
        } else {
          this.messageHint();
        }
      }
      // 微信线上支付判断
      if (payment.paymentMethodID === 6) {
        if (parseFloat(this.props.payAmount) === parseFloat(this.props.value)) {
          //除现金外其余的支付方式只能一次付清的判断
          this.alipayMethod('微信支付', payment.paymentMethodID, autoCode);
        } else {
          this.messageHint();
        }
      }

      // 支付宝线上支付判断
      if (payment.paymentMethodID === 7) {
        if (parseFloat(this.props.payAmount) === parseFloat(this.props.value)) {
          //除现金外其余的支付方式只能一次付清的判断
          this.alipayMethod('支付宝支付', payment.paymentMethodID, autoCode);
        } else {
          this.messageHint();
        }
      }
      //现金支付判断
      if (payment.paymentMethodID === 5) {
        console.log(this.props.payAmount, '111');
        if (parseFloat(this.props.payAmount) === parseFloat(this.props.value)) {
          this.cashMethod('现金支付', payment.paymentMethodID);
        } else {
          // message.info('请保持支付金额和待付金额一致')
          this.messageHint();
        }
      }
      //微信线下支付判断
      if (payment.paymentMethodID === 11) {
        console.log(
          this.props.cashierStore.payAccount,
          '支付金额------',
          this.props.cashierStore.waitPayAccount,
          '待付金额'
        );
        if (parseFloat(this.props.payAmount) === parseFloat(this.props.value)) {
          this.offline('微信线下支付', payment.paymentMethodID);
        } else {
          this.messageHint();
        }
      }
      //支付宝线下支付判断
      if (payment.paymentMethodID === 12) {
        if (parseFloat(this.props.payAmount) === parseFloat(this.props.value)) {
          this.offline('支付宝线下支付', payment.paymentMethodID);
        } else {
          // message.info('请支付'+this.props.value+'元')
          this.messageHint();
        }
      }
    }
  };

  // 支付方式暂时放存
  //  <div className="payment-frame pay-yellow paymask iconfont" onClick={()=>{
  // //    this.payMethod("现金支付");
  //     this.cashMethod("现金支付")

  // }}>
  //     {cashierStore.cashMoney>0?<p className="num">{cashierStore.cashMoney}</p>:''}
  //     <i className="iconfont icon-xianjin"></i>
  //     <span>现金</span>
  // </div>
  // <div className="payment-frame pay-green" onClick={()=>{
  //     cashierStore.getEnableSequece();
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){//除现金外其余的支付方式只能一次付清的判断
  //             this.alipayMethod("微信支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }
  // }}>
  //     {cashierStore.wechatMoney>0?<p className="num">{cashierStore.wechatMoney}</p>:'' }
  //     <i className="iconfont icon-weixinzhifu"></i>
  //     <span>微信</span>
  // </div>
  // <div className="payment-frame pay-blue" onClick={()=>{
  //     cashierStore.getEnableSequece();
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){
  //             this.alipayMethod("支付宝支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }

  // }}>
  //     {cashierStore.alipayMoney>0?<p className="num">{cashierStore.alipayMoney}</p>:'' }
  //     <i className="iconfont icon-umidd17"></i>
  //     <span>支付宝</span>
  // </div>
  // <div className="payment-frame pay-purple" onClick={()=>{
  //         cashierStore.getEnableSequece();
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){
  //             this.memberMethod("会员卡支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }
  // }}>
  //     {cashierStore.memberMoney>0?<p className="num">{cashierStore.memberMoney}</p>:'' }
  //     <i className="iconfont icon-huiyuanqia"></i>
  //     <span>会员卡</span>
  // </div>
  // <div className="payment-frame pay-azureblue" onClick={()=>{
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){
  //         this.payMethod("银行卡支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }

  // }}>
  //     {cashierStore.bankMoney>0?<p className="num">{cashierStore.bankMoney}</p>:'' }
  //     <i className="iconfont icon-yinxingqia"></i>
  //     <span>银行卡</span>
  // </div>

  // <div className="payment-frame pay-cilaccolour" onClick={()=>{
  //     cashierStore.getEnableSequece();
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){
  //         this.payMethod("K币支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }
  // }}>
  //     {cashierStore.kMoney>0?<p className="num">{cashierStore.kMoney}</p>:'' }
  //     <i className="iconfont icon-account_btn_k"></i>
  //     <span>K币</span>
  // </div>
  // <div className="payment-frame pay-cilaccolour" onClick={()=>{
  //     cashierStore.getEnableSequece();
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){
  //         this.payMethod("挂账支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }

  // }}>
  //     {cashierStore.creditMoney>0?<p className="num">{cashierStore.creditMoney}</p>:'' }
  //     <i className="iconfont icon-account_btn_guazhang"></i>
  //     <span>挂账</span>
  // </div>
  // <div className="payment-frame pay-cilaccolour" onClick={()=>{
  //     cashierStore.getEnableSequece();
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){
  //         this.couponMethod("现金券支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }

  // }}>
  //     {cashierStore.cashCouponMoney>0?<p className="num">{cashierStore.cashCouponMoney}</p>:'' }
  //     <i className="iconfont icon-xianjinquan"></i>
  //     <span>现金券</span>
  // </div>
  // <div className="payment-frame pay-cilaccolour" onClick={()=>{
  //     cashierStore.getEnableSequece();
  //     if(parseFloat(this.props.payAmount)===parseFloat(this.props.value)){
  //         this.memberMethod("积分支付");
  //     }else{
  //         message.info('请保持支付金额和待付金额一致')
  //     }

  // }}>
  //     {cashierStore.integralMoney>0?<p className="num">{cashierStore.integralMoney}</p>:'' }
  //     <i className="iconfont icon-jifen"></i>
  //     <span>积分抵现</span>
  // </div>

  render() {
    let cashierStore = this.props.cashierStore;
    let settlementStore = this.props.settlementStore;
    return (
      <div className="payment-method">
        <div>
          {settlementStore.paymentList.map((payment, index) => {
            return (
              <PayMent
                key={index}
                payMent={payment}
                cashierStore={cashierStore}
                clickHandle={() => {
                  this.addPayMent(payment);
                }}
              />
            );
          })}
        </div>
        {this.state.statePopup}
      </div>
    );
  }
}

export default PayMethod;
