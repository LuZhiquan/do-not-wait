/**
 * @author shelly
 * @description 结账界面
 * @date 2017-05-16
 **/

import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { message } from 'antd';

class SettlementStore {
  @observable orderInfo; //订单信息
  @observable didOrderList; //已下单菜品列表

  @observable paymentList; //获取金额
  @observable moreShow; //更多弹窗
  @observable adjustProductShow; //调整商品折扣弹窗
  @observable categoryDiscount; //分类折按钮
  @observable memberDiscount; //会员折按钮

  @observable discountCouponShow; //折扣券
  @observable amountSituation; //结账主页面
  @observable cashPopup; //现金弹窗
  @observable promptPopupShow; //提示弹窗
  @observable accreditPopupShow; //授权弹窗
  @observable invoicePopup; //开发票弹窗

  @observable hadPayList; //上次已经收款记录
  @observable receivableDate; //结账主页面已收款数据
  @observable refundList; //结账主页退款数据
  @observable refundPopupShow; //结账主页面退款弹窗
  @observable settlementSuccess; //结账成功码
  @observable paymentSuccessCode; //在线支付成功码

  @observable tableUseInfo; //桌台信息存储

  @observable feedback; //操作结果反馈
  @observable stopSettlement; //取消暂结
  @observable paymentMethodList; //支付返回数据
  @observable authorityDiscountList; //权限折数据
  @observable orderDiscountList; //全单折数据
  @observable memberDiscountList; //会员折数据
  @observable freeServiceList; //免费服务数据
  @observable freeServiceStyle; //免费服务费后样式
  @observable serviceCharge; //收服务费数据
  @observable employeeCanReduceList; //员工可减免金额
  @observable bigDecimal; //员工最多可减免金额
  @observable reduceAmountList; //减免金额
  @observable orderFreeList; //免单
  @observable serviceAmount; //服务费金额
  @observable cancleDiscountList; //取消折扣数据
  @observable activeDisCountType; //获取结账活动
  @observable updateDiscountInfo; //更新折扣信息

  @observable amountReceived; //已收金额
  @observable waitCollectAmount; //待收金额
  @observable oddChange; //找零
  @observable invoiceAmount; //可开票金额
  @observable invoicePopupAmount; //开发票窗口中的默认金额

  @observable paymentCashAll; //点结账后要传给后台的数现金支付
  @observable paymentOfflineWechatAll; //点结账后要传给后台的线下微信支付
  @observable paymentOfflineAlipayAll; //点结账后要传给后台的线下支付宝支付
  @observable cashLish; //点结账后把所有现金的条数总结成一条
  @observable OfflineWechatLish; //点结账后把所有线下微信的条数总结成一条
  @observable OfflineAlipayLish; //点结账后把所有线下支付宝的条数总结成一条
  @observable allPayLish; //点结账后把所有支付的条数
  @observable mbtns; //结账主页面右边订单金额下面的按钮
  @observable showDiscount; //结账主页面是否显示打折信息
  @observable discountMsg; //结账主页面如果有打折，显示打折信息
  @observable disable; //打完折后，要按钮置灰
  @observable settlementBtnDisable; //结账按钮不可用
  @observable confirmPaymentStatus; //确认和取消在线支付状态
  @observable memberInfoLis; //会员卡信息
  @observable checkPermission; //二次验权
  @observable loginInfo; //登陆信息
  @observable settlementLeft; //左边的信息块
  @observable subTotalNumber; //左边的信息块总数量
  @observable subTotalAmount; //左边的信息块总价格
  @observable clicktag; //结账按钮不能重复触发
  @observable orderStatus; //暂结和取消暂结的状态码----654为暂结，651为取消暂结, 1430为调账

  constructor() {
    this.orderInfo = {};
    this.didOrderList = [];
    this.paymentList = [];
    this.moreShow = false;
    this.adjustProductShow = false;
    this.categoryDiscount = false;
    this.memberDiscount = false;
    this.discountCouponShow = false;
    this.amountSituation = '';
    this.cashPopup = false;
    this.promptPopupShow = false;
    this.accreditPopupShow = false;
    this.invoicePopup = false;
    this.hadPayList = [];
    this.receivableDate = [];
    this.refundList = [];
    this.refundPopupShow = false;
    this.settlementSuccess = {};
    this.tableUseInfo = [];
    this.feedback = null;
    this.stopSettlement = '暂结';
    this.paymentMethodList = 0;
    this.authorityDiscountList = [];
    this.orderDiscountList = [];
    this.memberDiscountList = [];
    this.freeServiceList = [];
    this.freeServiceStyle = '';
    this.serviceCharge = [];
    this.employeeCanReduceList = '';
    this.bigDecimal = '';
    this.reduceAmountList = [];
    this.orderFreeList = [];
    this.serviceAmount = 0;
    this.cancleDiscountList = [];
    this.activeDisCountType = '';
    this.updateDiscountInfo = '';
    this.amountReceived = 0;
    this.waitCollectAmount = 0;
    this.oddChange = 0;
    this.invoiceAmount = 0;
    this.paymentCashAll = [];
    this.paymentOfflineWechatAll = [];
    this.paymentOfflineAlipayAll = [];

    this.cashLish = [];
    this.OfflineWechatLish = [];
    this.OfflineAlipayLish = [];
    this.allPayLish = [];
    this.showDiscount = false;
    this.discountMsg = '';
    this.disable = false;
    this.settlementBtnDisable = false;
    this.confirmPaymentStatus = false;
    this.memberInfoLis = '';
    this.paymentSuccessCode = '';
    this.checkPermission = '';
    this.loginInfo = JSON.parse(sessionStorage.getItem('account'));
    this.settlementLeft = [];
    this.subTotalNumber = 0;
    this.subTotalAmount = 0;
    this.clicktag = 0;
    this.invoicePopupAmount = 0;
    this.orderStatus = 654;

    // this.mbtns = [{text:"权限折",selected:true},{text:"全单折",selected:false},{text:"单品折",selected:false},{text:"分类折",selected:false},
    // {text:"会员折",selected:false},{text:"免服务费",selected:false},{text:"折扣券",selected:false},{text:"减免",selected:false},{text:"免单",selected:false},{text:"更多",selected:false}];//数据写死的，勿动

    this.mbtns = [
      { text: '权限折', selected: true },
      { text: '全单折', selected: false },
      { text: '免服务费', selected: false },
      { text: '会员折', selected: false },
      { text: '减免', selected: false },
      { text: '免单', selected: false },
      { text: '更多', selected: false }
    ]; //数据写死的，勿动
  }

  /***************** 订单信息相关 action ********************/

  //获取订单信息
  @action
  getOrderInfo({ subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/order/getEditOrderInfo.option',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0 && json.data) {
          _this.orderInfo = json.data;
          //   _this.getDidOrderList(subOrderID);
          _this.getDisCountTypeName(json.data.orderID);
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /***************** 已下单相关 action ********************/

  //获取已下单列表
  @action
  getDidOrderList(subOrderID) {
    let _this = this;

    getJSON({
      url: '/reception/product/getUnderOrdersList.action',
      data: { subOrderID: subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.didOrderList = json.data;
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /***************** 已下单相关 action ********************/

  // *****************************金额情况（订单金额、收款情况）*****************************
  @action
  getAmountSituation({ subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/payment/amountSituation',
      data: {
        subOrderID: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.amountSituation = json;

          _this.showDiscount = json.hasDiscount;

          _this.amountReceived = _this.amountSituation.paidAmount; //已收金额
          _this.waitCollectAmount = _this.amountSituation.waitCollectAmount; //待收金额
          _this.oddChange = _this.amountSituation.refund; //找零
          _this.serviceAmount = _this.amountSituation.serviceFee; //服务费

          if (_this.amountSituation.payableAmount <= 0) {
            //判断已收金额是否等于0
            _this.amountSituation.payableAmount = 0;
          }
          if (_this.showDiscount) {
            //判断是否已打过折
            _this.discountMsg = json.discountMsg;
            _this.disable = true;
          }
          // _this.waitCollectAmount=parseFloat(_this.amountSituation.payableAmount)-parseFloat(_this.amountReceived);//待收金额
          if (_this.waitCollectAmount < 0) {
            _this.waitCollectAmount = 0;
          }
          if (_this.waitCollectAmount === 0) {
            _this.settlementBtnDisable = true;
          } else {
            _this.settlementBtnDisable = false;
          }
          // _this.serviceAmount=json.serviceFee;
          if (_this.amountSituation.amountIsFee) {
            //判断服务费是否已收取
            _this.freeServiceStyle = 'free-service';
            //  _this.mbtns[2].text='收服务费'
          } else {
            _this.freeServiceStyle = '';
          }
          // if(_this.amountSituation.refund){
          //     _this.oddChange=Math.abs(_this.amountSituation.refund);
          // }else{
          //      _this.oddChange=parseFloat(_this.amountReceived)-parseFloat(_this.amountSituation.payableAmount);//找零
          //     if(_this.oddChange<0){
          //         _this.oddChange=0;
          //     }
          // }

          // _this.invoiceAmount=parseFloat(_this.amountReceived)-parseFloat(_this.oddChange);//已开票金额
        }
      }
    });
  }
  // *****************************金额情况（订单金额、收款情况）*****************************

  // *****************************获取活动折扣************************
  @action
  getDisCountTypeName(orderID) {
    let _this = this;
    getJSON({
      url: '/reception/discount/getDisCountTypeName',
      data: {
        orderID: orderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.activeDisCountType = json.data;
        } else {
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************获取活动折扣************************

  // *****************************更新折扣信息************************
  @action
  getUpdateDiscountInfo(subOrderID) {
    let _this = this;
    getJSON({
      url: '/reception/discount/updateDiscountInfo',
      data: {
        subOrderIDs: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.updateDiscountInfo = json.data;
          _this.disable = false;
          _this.getAmountSituation({ subOrderID });
        } else {
          _this.disable = true;
          _this.showFeedback({ status: 'warning', msg: json.message });
          _this.amountSituation = '';
          _this.waitCollectAmount = 0;
        }
      }
    });
  }
  // *****************************更新折扣信息************************

  // **************************暂结**************************
  @action
  getTemporarily({ subOrderID }, callback) {
    let _this = this;
    getJSON({
      url: '/reception/payment/temporarily',
      data: { subOrderID: subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.temporarily = json;
          //设置暂结成功反馈
          _this.stopSettlement = '取消暂结';
          callback();
        } else {
          //设置暂结成功反馈
          message.info(json.message);
        }
      }
    });
  }
  // **************************暂结**************************

  // **************************取消暂结**************************
  @action
  cancelTemporarily({ subOrderID }, callback) {
    let _this = this;
    getJSON({
      url: '/reception/payment/cancelTemporarily',
      data: { subOrderID: subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.temporarily = json;
          //设置暂结成功反馈
          _this.stopSettlement = '暂结';
          callback();
        } else {
          //设置暂结成功反馈
          message.info(json.message);
        }
      }
    });
  }
  // **************************取消暂结**************************

  // *****************************获取支付方式************************
  @action
  getPaymentMethod() {
    let _this = this;

    /******** Mock数据模拟 *********/
    // let json = Mock.mock({
    //   "code": 0,
    //   "data|2-5": "resultList" :[{
    //         PaymentMethodID: 支付方式编号
    //         PayOrgID: 支付机构编号
    //         PaymentMethodCode: 支付方式编码
    //         PaymentName：支付方式名称
    //         VisibleName：显示名称
    //         MethodStatus：使用状态
    //         IsOnline：是否线上
    //         PaymentDescription：描述
    //         ConfigurePath：关联路径
    //         ConfigureArgs：关联参数
    //         EncryptionParameter：加密参数
    //         ReturnPath：返回路径
    //         SortNo：序号
    //         IsSync：是否同步
    //         CreatorID：创建人
    //         CreateTime：创建时间
    //         Memo：备注
    //     }],
    //   "timestamp": '1111111111',
    //   "message": '成功'
    // });

    // if(json.code === 0) {
    //   console.log(json.data);
    //    _this.paymentList = json.resultList;
    // }else {
    //   _this.operateFeedback = feedback(json.message);
    // }
    // return;
    /******** Mock数据模拟 *********/

    getJSON({
      url: '/reception/payment/getPaymentMethod',
      data: {
        // subOrderID:subOrderID,
      },
      success: function(json) {
        if (json.code === 0) {
          _this.paymentList = json.resultList;
        }
      }
    });
  }
  // *****************************获取支付方式************************

  /*****************  获取已经支付记录 ********************/

  @action
  getHadPayList({ subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/payment/getHadPayList',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          let hadPayList = [];
          json.data.forEach(item => {
            hadPayList.push({
              keyID: item.keyID,
              paymentMethodID: item.paymentMethodID,
              title: item.paymentName,
              paymentAmount: item.changeAmount,
              isCash: 0,
              isOnline: item.online,
              changeType: item.changeType,
              isShowBtn: item.dealStatus === 1293
            });
          });
          if (hadPayList.length) {
            _this.hadPayList = hadPayList;
          }
        } else {
          _this.showFeedback({ msg: json.message });
        }
      },
      error: function(json) {
        _this.showFeedback({ msg: json.message });
      }
    });
  }

  /*****************  获取已经支付记录 ********************/

  /*****************  查询支付中记录的支付状态 ********************/

  @action
  confirmOnlinePaid({ keyID }) {
    let _this = this;

    getJSON({
      url: '/reception/payment/confirmOnlinePaid',
      data: { keyID },
      success: function(json) {
        if (json.code === 0) {
          //支付成功
          _this.hadPayList = _this.hadPayList.map(item => {
            if (item.keyID === keyID) item.isShowBtn = false;
            return item;
          });
          _this.receivableDate = _this.receivableDate.map(item => {
            if (item.keyID === keyID) item.isShowBtn = false;
            return item;
          });
          _this.showFeedback({ msg: '支付成功！' });
          // if (json.data.dealStatus === 1294) {
          //   _this.hadPayList = _this.hadPayList.map(item => {
          //     if (item.keyID === keyID) item.isShowBtn = false;
          //     return item;
          //   });
          //   _this.receivableDate = _this.receivableDate.map(item => {
          //     if (item.keyID === keyID) item.isShowBtn = false;
          //     return item;
          //   });
          //   _this.showFeedback({ msg: '支付成功！' });
          // } else if (json.data.dealStatus === 1293) {
          //   //支付中
          //   _this.showFeedback({ msg: '支付中！' });
          // } else {
          //   //失败或者未支付
          //   let recordAmount;
          //   _this.hadPayList = _this.hadPayList.filter(item => {
          //     if (item.keyID === keyID) recordAmount = item.paymentAmount;
          //     return item.keyID !== keyID;
          //   });
          //   _this.receivableDate = _this.receivableDate.filter(item => {
          //     if (item.keyID === keyID) recordAmount = item.paymentAmount;
          //     return item.keyID !== keyID;
          //   });

          //   _this.amountReceived = parseFloat(
          //     _this.amountReceived - recordAmount
          //   ); //重新计算已收金额
          //   _this.waitCollectAmount = parseFloat(
          //     _this.waitCollectAmount + recordAmount
          //   ); //重新计算待收金额
          //   _this.showFeedback({ msg: '支付失败' });
          // }
        } else {
          _this.showFeedback({ msg: json.message });
        }
      },
      error: function(json) {
        _this.showFeedback({ msg: json.message });
      }
    });
  }

  /*****************  查询支付中记录的支付状态 ********************/

  // *****************************支付************************
  @action
  getOrderPayment({
    item,
    subOrderID,
    paymentMethodID,
    paidAmount,
    paymentAmount,
    isOnline,
    authCode
  }) {
    let _this = this;
    getJSON({
      url: '/reception/payment/payment',
      data: {
        subOrderID: subOrderID,
        paymentInfoList: JSON.stringify({
          paymentMethodID,
          paidAmount,
          paymentAmount,
          isOnline
        }),
        authCode: authCode
      },
      timeout: 1000 * 120,
      success: function(json) {
        if (json.code === 500) {
          _this.paymentMethodList = json.paidAmount;
          _this.getAmountSituation({ subOrderID });
          _this.addReceivableDate(item);
        } else {
          _this.showFeedback({ msg: json.message });
        }
      },
      error: function(json) {
        _this.showFeedback({ msg: json.message });
      }
    });
  }
  // *****************************支付************************

  // *****************************微信 支付宝支付************************
  @action
  getOnlinePayment(
    {
      item,
      subOrderID,
      paymentMethodID,
      paidAmount,
      paymentAmount,
      authCode,
      cardID,
      customerID,
      password
    },
    callback,
    failback
  ) {
    let _this = this;
    getJSON({
      url: '/reception/payment/onlinePayment',
      data: {
        subOrderID: subOrderID,
        // paymentInfoList:  JSON.stringify({paymentMethodID, paymentAmount}),
        authCode: authCode + '', //付款码付款码
        paymentMethodID: paymentMethodID,
        paymentAmount: paymentAmount,
        cardID: cardID,
        customerID: customerID,
        memberApplyPassword: password
      },
      timeout: 1000 * 120,
      success: function(json) {
        if (json.code === 521) {
          _this.paymentSuccessCode = json.code;
          _this.paymentMethodList = json.paidAmount;
          item.isShowBtn = false;
          // _this.getAmountSituation({subOrderID});//无须重新获取金额
          item.keyID = json.data.keyID;
          _this.addReceivableDate(item);
          _this.confirmPaymentStatus = false;
          callback();
        } else {
          if (
            json.code === 143 ||
            json.code === -1 ||
            json.code === 507 ||
            json.code === 519
          ) {
            _this.showFeedback({ msg: json.message });
          } else {
            message.destroy();
            message.info(json.message, 2);
            _this.paymentSuccessCode = json.code;
            _this.confirmPaymentStatus = true;
            item.handmade = 1; //如果手工点确定就传1给后台，否则传0；
            item.keyID = json.data.keyID;
            _this.addReceivableDate(item);
            _this.showFeedback({ msg: json.message });
            failback();
          }
        }
      },
      error: function(json) {
        _this.confirmPaymentStatus = true;
      }
    });
  }
  // *****************************微信 支付宝支付************************

  /************************* 替換支付方式********************************/
  @action
  replacePayment({ keyID, paymentMethodID, paymentName }) {
    //替換支付方式
    this.hadPayList = this.hadPayList.map(item => {
      if (item.keyID === keyID) {
        item.paymentMethodID = paymentMethodID;
        item.title = paymentName;
      }
      return item;
    });
  }

  // *****************************会员卡查询************************
  @action
  getMemberCard(phoneNumber, callback) {
    let _this = this;
    getJSON({
      url: '/reception/payment/queryMemberCard',
      data: {
        phoneNumber: phoneNumber
      },
      timeout: 1000 * 120,
      success: function(json) {
        if (json.code === 500) {
          _this.memberInfoLis = json.data;
          callback();
        } else {
          message.info(json.message);
        }
      },
      error: function(json) {}
    });
  }
  // *****************************会员卡查询************************
  // *****************************会员卡支付************************
  // @action getMemberPay({item,subOrderID,paymentMethodID,paidAmount,paymentAmount,authCode,carID,customerID}) {
  //         let _this = this;
  //         getJSON({
  //             url: '/reception/payment/queryMemberCard',
  //             data:{
  //                 subOrderID: subOrderID,
  //                 authCode:authCode+'',//付款码
  //                 paymentMethodID:paymentMethodID,
  //                 paymentAmount:paymentAmount,
  //                 carID:carID,
  //                 customerID:customerID,
  //             },
  //             timeout: 1000*120,
  //             success: function(json){
  //                 if(json.code===500){
  //                     _this.paymentMethodList = json.paidAmount;
  //                     _this.getAmountSituation({subOrderID});
  //                     _this.addReceivableDate(item)
  //                 }else{
  //                     _this.showFeedback({ msg: json.msg});
  //                 }
  //             },
  //            error:function(json){
  //                console.log("zhifubao失败1111",json.paidAmount)
  //            }
  //         });
  //     }
  // *****************************会员卡支付************************

  // *****************************结账************************
  @action
  getOrderSettlement(subOrderID, paymentInfoList, callbacck) {
    let _this = this;

    getJSON({
      url: '/reception/payment/payment',
      data: {
        subOrderID: subOrderID,
        paymentInfoList: JSON.stringify(paymentInfoList)
      },
      success: function(json) {
        if (json.code === 500) {
          _this.settlementSuccess = json;
          _this.showFeedback({ msg: '结账成功!' });
          _this.receivableDate = []; //结账成功后清空数据
          _this.paymentCashAll = []; //结账成功后清空数据
          _this.paymentOfflineAlipayAll = [];
          _this.paymentOfflineWechatAll = [];
          _this.cashLish = []; //结账成功后清空数据
          _this.OfflineWechatLish = [];
          _this.OfflineAlipayLish = [];
          _this.allPayLish = [];
          _this.clicktag = 0;
          _this.amountSituation = ''; //结账完成后，金额信息清空
          callbacck();
        } else {
          _this.showFeedback({ msg: json.message });
          _this.clicktag = 0;
        }
      }
    });
  }

  // *****************************结账************************

  // *****************************桌台参数信息************************
  @action
  getTableUseInfo({ subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/payment/tableUseInfo',
      data: {
        subOrderID: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.tableUseInfo = json;
          _this.settlementLeft = json.data;

          _this.subTotalNumber = 0;
          _this.subTotalAmount = 0;
          _this.settlementLeft.forEach((table, index) => {
            _this.subTotalNumber += table.subTotalNumber;
            _this.subTotalAmount += table.subTotalAmount;
            _this.orderStatus = table.orderStatus;
            if (_this.orderStatus === 651) {
              _this.stopSettlement = '取消暂结';
              _this.disable = true;
            } else {
              _this.stopSettlement = '暂结';
            }
          });
        } else {
          _this.settlementLeft = [];
          message.destroy();
          message.info(json.message);
        }
      },
      error: function(json) {
        _this.settlementLeft = [];
        message.destroy();
        message.info(json.message);
      }
    });
  }
  // *****************************桌台参数信息************************

  // *****************************权限折************************
  @action
  getAuthorityDiscount({ subOrderID, discountPercentage }, callback) {
    let _this = this;
    getJSON({
      url: '/reception/discount/authorityDiscount',
      data: {
        subOrderIDs: subOrderID,
        discountPercentage: discountPercentage
      },
      success: function(json) {
        if (json.code === 0) {
          _this.authorityDiscountList = json;
          _this.getAmountSituation({ subOrderID }); //重新获取金
          _this.disable = true;
          callback();
        } else {
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************权限折************************

  // *****************************全单折************************
  @action
  getOrderDiscount({ subOrderID, discountPercentage }, callback) {
    let _this = this;
    getJSON({
      url: '/reception/discount/orderDiscount',
      data: {
        subOrderIDs: subOrderID,
        discountPercentage: discountPercentage
      },
      success: function(json) {
        if (json.code === 0) {
          _this.orderDiscountList = json;
          _this.getAmountSituation({ subOrderID }); //重新获取金额
          _this.disable = true;
          callback();
        } else {
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************全单折************************

  // *****************************会员折************************
  @action
  getMemberDiscount({ subOrderID, memberCodeType, memberCode }, callback) {
    let _this = this;
    // memberCodeType为1代表手机号，2代表会员卡号，3代表刷卡
    getJSON({
      url: '/reception/discount/memberDiscount',
      data: {
        subOrderIDs: subOrderID,
        memberCodeType: memberCodeType,
        memberCode: memberCode
      },
      success: function(json) {
        if (json.code === 0) {
          _this.memberDiscountList = json;
          _this.getAmountSituation({ subOrderID }); //重新获取金额
          _this.disable = true;
          callback();
        } else {
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************会员折************************

  // *****************************免费服务************************
  @action
  getFreeServiceCharge({ subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/discount/freeServiceCharge',
      data: {
        subOrderIDs: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.freeServiceList = json;
          _this.freeServiceStyle = 'free-service';
          // _this.mbtns[5].text="收服务费";//把免服务费改成收服务费
          // _this.mbtns[2].text="收服务费";//把免服务费改成收服务费
          _this.getAmountSituation({ subOrderID }); //重新获取金额
          _this.disable = true;
        } else {
          _this.freeServiceStyle = '';
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************免费服务************************
  // *****************************收费服务************************
  @action
  getServiceCharge({ subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/discount/serviceCharge',
      data: {
        subOrderIDs: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.freeServiceStyle = '';
          _this.serviceCharge = json;
          //  _this.mbtns[5].text="免服务费";
          _this.mbtns[2].text = '免服务费';
          _this.getAmountSituation({ subOrderID }); //重新获取金额
        } else {
          _this.freeServiceStyle = 'free-service';
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************收费服务************************

  // *****************************员工可减免金额************************
  @action
  getEmployeeCanReduceAmount({ subOrderID }, callback) {
    let _this = this;
    getJSON({
      url: '/reception/discount/employeeCanReduceAmount',
      data: {
        subOrderIDs: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.employeeCanReduceList = json;
          _this.bigDecimal = json.data.bigDecimal;
          _this.getAmountSituation({ subOrderID }); //重新获取金额

          callback();
        } else {
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************员工可减免金额************************

  // *****************************减免***********************
  @action
  getReduceAmount({ subOrderID, discountAmount }) {
    let _this = this;
    getJSON({
      url: '/reception/discount/reduceAmount',
      data: {
        subOrderIDs: subOrderID,
        discountAmount: discountAmount
      },
      success: function(json) {
        if (json.code === 0) {
          _this.reduceAmountList = json;
          _this.getAmountSituation({ subOrderID }); //重新获取金额
          _this.disable = true;
        } else {
          _this.disable = false;
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************减免************************

  // *****************************免单***********************
  @action
  getOrderFree({ subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/discount/orderFree',
      data: {
        subOrderIDs: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.orderFreeList = json;
          _this.getAmountSituation({ subOrderID }); //重新获取金额
          _this.disable = true;
        } else {
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************免单************************

  // *****************************取消折扣***********************
  @action
  getCancleDiscount(subOrderID, discountType) {
    let _this = this;
    getJSON({
      url: '/reception/discount/cancleDiscount',
      data: {
        subOrderIDs: subOrderID,
        discountType: discountType
      },
      success: function(json) {
        if (json.code === 0) {
          _this.cancleDiscountList = json;
          _this.getAmountSituation({ subOrderID }); //重新获取金额
          _this.showDiscount = true;
          _this.disable = false;
        } else {
          _this.showFeedback({ status: 'warning', msg: json.message });
        }
      }
    });
  }
  // *****************************取消折扣************************

  // *****************************查询发票信息***********************
  @action
  getInvoiceInfo(subOrderID) {
    let _this = this;
    getJSON({
      url: '/reception/payment/queryInvoiceInfo',
      data: {
        subOrderID: subOrderID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.invoicePopupAmount = json.data.invoiceAmount;
          if (_this.invoicePopupAmount === null) {
            _this.invoicePopupAmount = 0;
          }
        } else {
          message.info(json.message);
        }
      }
    });
  }
  // *****************************查询发票信息************************

  // *****************************开发票***********************
  @action
  getInvoice(subOrderID, invoiceInfo, callback) {
    let _this = this;
    getJSON({
      url: '/reception/payment/invoice',
      data: {
        subOrderID: subOrderID,
        invoiceInfo: JSON.stringify(invoiceInfo)
      },
      success: function(json) {
        if (json.code === 0) {
          _this.cancleDiscountList = json;
          callback();
        } else {
          message.info(json.message);
        }
      }
    });
  }
  // *****************************开发票************************

  //点击已收款中的退
  @action
  getRefundPopup() {
    this.refundPopupShow = true;
  }

  // 主页面已收款添加数据
  @action
  addReceivableDate(item) {
    this.receivableDate.push(item);
  }
  // 主页面已收款数据点退时发生的数据变化
  @action
  Refunds(item, refundsIndex) {
    this.receivableDate = this.receivableDate.map((ele, index) => {
      if (refundsIndex === index) ele.isCash = 0;
      return ele;
    });
    this.receivableDate.push({
      title: item.title,
      paymentAmount: -1 * item.paymentAmount,
      isCash: 0,
      isOnline: false,
      isShowBtn: false,
      sendDate: item.sendDate
    });
  }

  //结账主页面订单金额下的按钮
  // 点击更多
  @action
  getMore() {
    this.moreShow = true;
  }
  // 更多弹窗关闭
  @action
  morecancleClick() {
    this.moreShow = false;
  }
  // 点击更多中的调整商品折扣
  @action
  getAdjusetProduct() {
    this.adjustProductShow = true;
  }
  // 关闭更多中的调整商品折扣
  @action
  closeAdjusetProduct() {
    this.adjustProductShow = false;
  }
  //分类折
  @action
  getCategoryDiscount() {
    this.categoryDiscount = true;
  }
  //分类折关闭
  @action
  categoryDiscountClose() {
    this.categoryDiscount = false;
  }

  // 折扣优惠券弹窗显示
  @action
  getDiscountCoupon() {
    this.discountCouponShow = true;
  }
  // 折扣优惠券弹窗关闭
  @action
  discountCouponCancle() {
    this.discountCouponShow = false;
  }

  //开发票弹窗
  @action
  getInvoicePopup() {
    this.invoicePopup = true;
  }
  @action
  closeInvoicePopup() {
    this.invoicePopup = false;
  }
  //可开票金额变化
  @action
  changeInvoiceMoney(money) {
    this.invoiceAmount = money;
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
}

export default new SettlementStore();
