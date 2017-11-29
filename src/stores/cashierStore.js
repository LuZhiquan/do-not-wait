/**
* @author Shelly
* @description 自选模式收银数据模型
* @date 2017-07-07
**/

import { observable, action } from 'mobx';
import { getJSON } from 'common/utils';
import { message } from 'antd';

class CashierStore {
  @observable feedback; //操作结果反馈
  @observable settleAccount; //结算金额
  @observable waitPayAccount; //待支付金额
  @observable payAccount; //支付金额
  @observable noteAccount; //找零金额
  @observable changeKey; //支付键盘上变化的金额键
  @observable payList; //支付的数据
  @observable payWindowShow; //如果payWindowShow为true，就显示支付金额窗口，否则显示结算金额窗口

  @observable cashMoney; //现金支付金额
  @observable bankMoney; //银行卡支付金额
  @observable wechatMoney; //微信支付金额
  @observable alipayMoney; //支付宝支付金额
  @observable memberMoney; //会员卡支付金额
  @observable kMoney; //K币支付金额
  @observable cashCouponMoney; //现金券支付金额
  @observable integralMoney; //积分抵现支付金额
  @observable creditMoney; //挂账金额
  @observable wechatOfflineMoney; //微信线下支付金额
  @observable alipayOfflineMoney; //支付宝线下支付金额

  @observable payAll; //已支付总额

  @observable isEnableSequece; //是否需要录入餐牌
  /********点菜金额********/
  @observable getPayment; //快餐点菜中的金额获取
  @observable totalAmount; //快餐点菜中的消费金额
  @observable payableAmount; //快餐点菜中的应收金额
  @observable waitCollectAmount; //快餐点菜中的待收金额
  @observable discountAmount; //快餐点菜中的折扣金额
  @observable giveProductAmount; //快餐点菜中的赠送金额
  @observable paidAmount; //快餐点菜中的已收金额
  @observable memCardInfoDTO; //会员卡信息
  @observable cardID; //会员卡充值所传的carID
  @observable memberItem; //会员卡信息
  @observable hasPassword; //会员卡支付时是否需要支付密码

  /********************快餐发票*************/

  constructor() {
    this.feedback = null;
    this.settleAccount = 0;
    this.waitPayAccount = this.settleAccount;
    this.payAccount = 0;
    this.noteAccount = 0;
    this.changeKey = 200;
    this.payList = [];
    this.payWindowShow = false;

    this.cashMoney = 0;
    this.bankMoney = 0;
    this.wechatMoney = 0;
    this.alipayMoney = 0;
    this.memberMoney = 0;
    this.kMoney = 0;
    this.cashCouponMoney = 0;
    this.integralMoney = 0;
    this.creditMoney = 0;
    this.wechatOfflineMoney = 0;
    this.alipayOfflineMoney = 0;

    this.payAll = 0;

    this.isEnableSequece = false;
    this.getPayment = '';
    this.totalAmount = 0;
    this.payableAmount = 0;
    this.waitCollectAmount = 0;
    this.discountAmount = 0;
    this.giveProductAmount = 0;
    this.paidAmount = 0;
    this.memCardInfoDTO = '';
    this.cardID = '';
    this.memberItem = '';
    this.hasPassword = true;
  }

  /* ************************************************************接口相关******************************************************/
  /*****************查询是否需要输入餐牌号****************/
  @action
  getEnableSequece() {
    let _this = this;
    getJSON({
      url: '/quick/order/getEnableSequece.action',
      data: {
        // enableSequece:_this.isEnableSequece,
      },
      success: function(json) {
        if (json.code === 0) {
          _this.isEnableSequece = json.data.enableSequece;
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }
  /*****************查询是否需要输入餐牌号****************/

  /*****************输入餐牌号****************/
  @action
  getInsertSequece(orderID, sequenceNumber) {
    let _this = this;
    getJSON({
      url: '/quick/order/insertSequece.action',
      data: {
        orderID: orderID,
        sequenceNumber: sequenceNumber
      },
      success: function(json) {
        if (json.code === 0) {
          message.info('支付成功');
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }
  /*****************输入餐牌号****************/

  /*****************查询会员卡信息****************/
  // @action getMemberInfol(memberCode,memberCodeType,callback){//临时接口
  //   //1代表手机号，2代表卡号，3刷卡
  //   let _this=this;
  //   getJSON({
  //     url:'/quick/discount/getMemberInfol.action',
  //     data:{
  //       memberCodeType:memberCodeType,
  //       memberCode:memberCode
  //     },
  //     success:function(json){
  //       if(json.code===0){
  //         _this.cardID=json.data.cardID;
  //         _this.memCardInfoDTO = json.data.memCardInfoDTO;
  //         // _this.getMemberItem(_this.cardID);
  //         callback();
  //       }else{
  //         message.info(json.message)
  //       }
  //     }
  //   })
  // }

  @action
  getMemberInfol(phoneNumber, cardID, cardCode, callback) {
    //手机号，卡号，档案号，回调    （以后真正要用的接口）
    let _this = this;
    getJSON({
      url: '/reception/payment/queryMemberCard.action',
      data: {
        phoneNumber: phoneNumber,
        cardSerialNo: cardCode,
        cardCode: cardID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.cardID = json.data.cardID;
          // _this.memCardInfoDTO = json.data.memCardInfoDTO;
          _this.memCardInfoDTO = json.data;
          _this.hasPassword = json.data.hasPayPassword;

          // _this.getMemberItem(_this.cardID);
          callback();
        } else {
          message.info(json.message);
        }
      }
    });
  }
  /*****************查询会员卡信息****************/
  /**************************会员卡信息***********************/
  @action
  getMemberItem(cardID, callback) {
    //会员卡支付时用的接口
    if (cardID) {
      let _this = this;
      getJSON({
        url: '/reception/member/getCardMemberInfor.action',
        data: { cardID: cardID },
        success: function(json) {
          // console.log("getCardMemberInfor",json);
          if (json.code === 0) {
            _this.memberItem = json.data;
            console.log(_this.memberItem, '111123');
            callback();
          } else {
            // message.config({top:200});
            // message.warn(json.message,1);
          }
        }
      });
    }
  }
  /**************************会员卡信息***********************/

  /*****************开发票****************/
  @action
  getInvoice(orderID, invoiceInfo) {
    let _this = this;
    getJSON({
      url: '/quick/payment/invoice.action',
      data: {
        orderID: orderID,
        invoiceInfo: JSON.stringify(invoiceInfo)
      },
      success: function(json) {
        if (json.code === 0) {
          _this.cancleDiscountList = json;
        } else {
          message.info(json.message);
        }
      }
    });
  }
  /*****************开发票****************/

  /*****************现金支付****************/
  @action
  getCashPayment(paymentMethodID, paymentAmount, orderID) {
    getJSON({
      url: '/quick/payment/cashPayment.action',
      data: {
        paymentMethodID: paymentMethodID,
        orderID: orderID,
        paymentAmount: paymentAmount
      },
      success: function(json) {
        if (json.code === 0) {
          message.info('支付成功');
          // _this.changeWaitPayAccount();//待付金额
        } else {
          message.info(json.message);
        }
      }
    });
  }
  /*****************现金支付****************/

  /*****************支付宝、微信线上支付****************/
  @action
  getOnlinePayment(
    paymentMethodID,
    paymentAmount,
    orderID,
    authCode,
    cardID,
    password,
    callback
  ) {
    //支付方式、支付金额、订单ID、微信和支付宝的支付码、回调函数
    let _this = this;
    getJSON({
      url: '/quick/payment/onlinePayment.action',
      data: {
        paymentMethodID: paymentMethodID,
        orderID: orderID,
        paymentAmount: paymentAmount,
        authCode: authCode,
        cardID: cardID,
        memberApplyPassword: password
      },
      success: function(json) {
        if (json.code === 521) {
          message.info('支付成功');
          _this.changeWaitPayAccount(); //待付金额
          callback(); //点菜支付时，只有支付成功后才清空购物车和orderID
        } else {
          message.info(json.message);
          _this.changePayAccount(parseFloat(_this.waitPayAccount)); //当在线支付失败时，要把待付金额默认为支付金额放在支付金额框中
        }
      }
    });
  }
  /*****************支付宝、微信线上支付****************/

  /*****************查询订单金额****************/
  @action
  getAmountDetail(orderID) {
    let _this = this;
    getJSON({
      url: '/quick/payment/getQuickAmountDetail.action',
      data: {
        orderID: orderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.getPayment = json.data;
          _this.totalAmount = _this.getPayment.totalAmount; //消费金额;
          _this.payableAmount = _this.getPayment.payableAmount; //应收金额;
          _this.discountAmount = _this.getPayment.discountAmount; //折扣金额
          _this.giveProductAmount = _this.getPayment.giveProductAmount; //赠送金额
          if (_this.totalAmount === null || _this.totalAmount < 0) {
            _this.totalAmount = 0;
          }
          if (_this.payableAmount === null || _this.payableAmount < 0) {
            _this.payableAmount = 0;
          }
          if (_this.discountAmount === null || _this.discountAmount < 0) {
            _this.discountAmount = 0;
          }
          _this.changeSettleAccount(_this.payableAmount); //获取结算金额，即应收金额
          _this.changePayAccount(_this.payableAmount); //获取默认支付金额，即应收金额
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }
  /*****************查询订单金额****************/

  /***********************Actiom相关***************************************** */
  //结算金额变化
  @action
  changeSettleAccount(value) {
    this.settleAccount = value;
    this.changeKey = Math.ceil(this.settleAccount / 100) * 100;
    if (this.changeKey < 200) {
      this.changeKey = 200;
    }
    this.waitPayAccount = this.settleAccount - this.payAccount;
  }
  //待支付金额变化
  @action
  changeWaitPayAccount() {
    this.waitPayAccount = this.settleAccount - this.payAll;
    if (this.waitPayAccount <= 0) {
      //当没有待支付金额的时候，要跳转到下一笔交易页面，同时清空数据
      this.clearData();
    }
  }
  //退款后待支付金额变化
  @action
  returnWaitPayAccount(value) {
    this.waitPayAccount = parseFloat(this.waitPayAccount) + parseFloat(value);
  }
  //支付金额变化
  @action
  changePayAccount(value) {
    this.payAccount = value;
  }
  //已收金额变化--即红圆里的数字变化
  @action
  changePayMoney(title) {
    if (title === '现金支付') {
      this.cashMoney = parseFloat(this.cashMoney) + parseFloat(this.payAccount);
    }
    if (title === '银行卡支付') {
      this.bankMoney = parseFloat(this.bankMoney) + parseFloat(this.payAccount);
    }
    if (title === '微信支付') {
      this.wechatMoney =
        parseFloat(this.wechatMoney) + parseFloat(this.payAccount);
    }
    if (title === '支付宝支付') {
      this.alipayMoney =
        parseFloat(this.alipayMoney) + parseFloat(this.payAccount);
    }
    if (title === '会员卡支付') {
      this.memberMoney =
        parseFloat(this.memberMoney) + parseFloat(this.payAccount);
    }
    if (title === 'K币支付') {
      this.kMoney = parseFloat(this.kMoney) + parseFloat(this.payAccount);
    }
    if (title === '挂账支付') {
      this.creditMoney =
        parseFloat(this.creditMoney) + parseFloat(this.payAccount);
    }
    if (title === '现金券支付') {
      this.cashCouponMoney =
        parseFloat(this.cashCouponMoney) + parseFloat(this.payAccount);
    }
    if (title === '积分支付') {
      this.integralMoney =
        parseFloat(this.integralMoney) + parseFloat(this.payAccount);
    }
    if (title === '微信线下支付') {
      this.wechatOfflineMoney =
        parseFloat(this.wechatOfflineMoney) + parseFloat(this.payAccount);
    }
    if (title === '支付宝线下支付') {
      this.alipayOfflineMoney =
        parseFloat(this.alipayOfflineMoney) + parseFloat(this.payAccount);
    }
    this.changePayAll();
  }

  //找零金额变化
  @action
  changeNoteAccount(value) {
    this.noteAccount = value.toFixed(2);
    if (this.noteAccount < 0) {
      this.noteAccount = 0;
    }
  }

  //支付总额
  @action
  changePayAll() {
    this.payAll =
      parseFloat(this.cashMoney) +
      parseFloat(this.bankMoney) +
      parseFloat(this.wechatMoney) +
      parseFloat(this.alipayMoney) +
      parseFloat(this.memberMoney) +
      parseFloat(this.kMoney) +
      parseFloat(this.cashCouponMoney) +
      parseFloat(this.integralMoney) +
      parseFloat(this.creditMoney) +
      parseFloat(this.wechatOfflineMoney) +
      parseFloat(this.alipayOfflineMoney);
  }

  //结账完成时，清空数据
  @action
  clearData() {
    this.settleAccount = 0;
    this.cashMoney = 0;
    this.bankMoney = 0;
    this.wechatMoney = 0;
    this.alipayMoney = 0;
    this.memberMoney = 0;
    this.kMoney = 0;
    this.cashCouponMoney = 0;
    this.integralMoney = 0;
    this.creditMoney = 0;
    this.wechatOfflineMoney = 0;
    this.alipayOfflineMoney = 0;
    this.payAll = 0;
    this.payAccount = 0;
    this.noteAccount = 0;
    this.payWindowShow = false;
    this.payList = [];
    // 点菜中的金额清空
    this.totalAmount = 0;
    this.payableAmount = 0;
    this.waitCollectAmount = 0;
    this.discountAmount = 0;
    this.giveProductAmount = 0;
    this.paidAmount = 0;
    this.cardID = '';
    this.memberItem = '';
  }
  // 主页面已收款添加数据
  @action
  addReceivableDate(item) {
    this.payList.push(item);
  }

  //显示操作反馈信息
  @action
  showFeedback({ status, msg }) {
    message.destroy();
    this.feedback = { status, msg };
  }

  //关闭桌台操作反馈信息
  @action
  closeFeedback() {
    this.feedback = null;
  }
  //清空会员信息
  @action
  clearMemberInfo() {
    this.memCardInfoDTO = '';
  }
}

export default new CashierStore();
