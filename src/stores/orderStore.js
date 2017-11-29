/**
 * @author shining
 * @description 订单数据模型
 * @date 2017-5-18
 **/
import { browserHistory } from 'react-router';
import { observable, action } from 'mobx';
import { message } from 'antd';
import { getJSON } from '../common/utils';

//获取当天日期
function formatTime() {
  var year = new Date().getFullYear();
  var month = new Date().getMonth() + 1;
  if (month <= 9) {
    month = '0' + month;
  }
  var day = new Date().getDate();
  if (day <= 9) {
    day = '0' + day;
  }

  return year + '-' + month + '-' + day;
}

//获取前一天的数据
function nextdate() {
  var year = formatTime().substring(0, 4);
  var month = formatTime().substring(5, 7);
  var day = formatTime().substring(8, 10);

  var today = new Date(year, month - 1, day);
  var yesterday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24;
  var yesterday = new Date();
  yesterday.setTime(yesterday_milliseconds);

  var strYear = yesterday.getFullYear();
  var strDay = yesterday.getDate();
  var strMonth = yesterday.getMonth() + 1;
  if (strMonth < 10) {
    strMonth = '0' + strMonth;
  }
  if (strDay < 10) {
    strDay = '0' + strDay;
  }
  var strYesterday = strYear + '-' + strMonth + '-' + strDay;
  return strYesterday;
}

class OrderStore {
  @observable statuscode; //订单头部状态码
  @observable dateSign; //订单头部状态码
  @observable currentdate; //当前日期
  @observable yesterdaydate; //昨天的日期
  @observable ordermsgList; //订单列表
  @observable orderID; //储存orderID
  @observable subOrderID; //储存subOrderID
  @observable tableID; //tableID
  @observable orderdatilsList; //订单详情
  @observable msgobj; //订单对象
  @observable feedback; //操作结果反馈
  @observable subOrderlist; //菜品详情
  @observable refundList; //退订金纪录list
  @observable setdatilsid; //保存退款详情所需要的id
  @observable datilsobj; //接收退款详情对象
  @observable flagt; //判断堂食订单是否被选中
  @observable issign; //判断是否有跳转过页面
  @observable saveactualAmount; //actualAmount订单金额
  @observable fundChangeVOList; //收款纪录
  @observable oderAmount; //开票金额

  constructor() {
    this.statuscode = 654;
    this.dateSign = 1;
    this.currentdate = formatTime();
    this.yesterdaydate = nextdate();
    this.ordermsgList = [];
    this.orderdatilsList = [];
    this.orderID = '';
    this.subOrderID = '';
    this.tableID = '';
    this.msgobj = '';
    this.feedback = null;
    this.subOrderlist = [];
    this.refundList = [];
    this.setdatilsid = {
      bookingID: '',
      DealID: ''
    };
    this.datilsobj = '';
    this.flagt = false;
    this.issign = false;
    this.saveactualAmount = '';
    this.fundChangeVOList = [];
    this.oderAmount = 0;
  }

  //设置状态码
  @action
  setstatuscode(scode) {
    this.statuscode = scode;
  }

  //设置状态码
  @action
  setdateSign(scode) {
    this.dateSign = scode;
  }

  //堂食订单信息查询
  @action
  getquOrderInfo({
    orderStatus = '',
    dateSign = 0,
    mealName = '',
    tableName = '',
    orderCode = '',
    cashierName = '',
    postName = '',
    startDate = '',
    endDate = ''
  }) {
    let _this = this;

    getJSON({
      url: '/reception/order/quOrderInfo',
      data: {
        orderStatus,
        dateSign,
        mealName,
        tableName,
        orderCode,
        cashierName,
        postName,
        startDate,
        endDate
      },
      success: function(json) {
        if (json.code === 0) {
          _this.flagt = false; //默认没有被选中的数据
          _this.ordermsgList = json.data.map((msg, i) => {
            msg.index = i;
            msg.subOrderDetails.map((child, i) => {
              child.onlysign = msg.orderCode + '' + i;
              child.selected = false;
              return child;
            });
            return msg;
          });
        } else if (json.code === 4) {
          _this.ordermsgList = [];
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
          _this.ordermsgList = [];
        }
      }
    });
  }

  //勾选中
  @action
  checkedorderList(onlysign) {
    this.ordermsgList = this.ordermsgList.map(order => {
      order.subOrderDetails.map(child => {
        child.selected = child.onlysign === onlysign;
        return child;
      });
      return order;
    });
  }

  //保存orderID subOrderID tableID
  @action
  saveorderID(order) {
    this.orderID = order.orderID;
    this.subOrderID = order.subOrderID;
    this.tableID = order.tableID;
  }

  //堂食订单详情信息
  @action
  getOrderInfo({ subOrderID = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/order/getOrderInfo',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.msgobj = json.data;
          _this.subOrderlist = json.data.subOrderVOlist.map((submsg, i) => {
            return submsg;
          });
          _this.fundChangeVOList = json.data.fundChangeVOList.map(
            (submsg, i) => {
              return submsg;
            }
          );
        } else {
          _this.subOrderlist = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //开发票
  @action
  orderOpenInvoice({
    depositID = '',
    rechargeAmount = '',
    ticketNo = '',
    ticketUnit = '',
    ticketAmount = '',
    ticketMemo = ''
  }) {
    let _this = this;
    getJSON({
      url: '/reception/order/orderOpenInvoice',
      data: {
        depositID,
        rechargeAmount,
        ticketNo,
        ticketUnit,
        ticketAmount,
        ticketMemo
      },
      success: function(json) {
        if (json.code === 0) {
          _this.getquOrderInfo({
            orderStatus: _this.statuscode,
            dateSign: _this.dateSign
          });
          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //重印暂结单
  @action
  repeatPrintTempBilling({ subOrderID = '', isBill = false }) {
    let _this = this;
    let apiName = isBill
      ? 'repeatPrintTempBilling'
      : 'repeatPrintTemporaryBill';
    getJSON({
      url: `/reception/order/${apiName}`,
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          let dateSign;
          if (_this.statuscode === 651) {
            dateSign = 0;
          } else if (_this.statuscode === 68) {
            dateSign = _this.dateSign;
          }
          _this.getquOrderInfo({
            orderStatus: _this.statuscode,
            dateSign: dateSign
          });
          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //获取退订金记录列表0-不限，1-今天,2-昨天
  @action
  getRefundList({
    dateFlag = '',
    bookingCode = '',
    dealUer = '',
    refundDateStart = '',
    refundDateEnd = ''
  }) {
    let _this = this;
    getJSON({
      url: '/reception/refund/getRefundList',
      data: { dateFlag, bookingCode, dealUer, refundDateStart, refundDateEnd },
      success: function(json) {
        if (json.code === 0) {
          _this.refundList = json.data.map((msg, i) => {
            msg.index = i;
            msg.selected = false;
            return msg;
          });
        } else if (json.code === 4) {
          _this.refundList = [];
        } else {
          _this.refundList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //勾选中
  @action
  checkedclickworking(msgobjid) {
    this.refundList = this.refundList.map(msgobj => {
      msgobj.selected = msgobj.index === msgobjid;
      return msgobj;
    });
  }

  //保存退款详情所需要的id
  @action
  savebdiding(bookingID, DealID) {
    this.setdatilsid = {
      bookingID: bookingID,
      DealID: DealID
    };
  }

  //获取退款详情
  @action
  getdetailobj({ bookingID = '', DealID = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/refund/detail',
      data: { bookingID, DealID },
      success: function(json) {
        if (json.code === 0) {
          _this.datilsobj = json.data;
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //暂结action
  @action
  settemporarily({ subOrderID = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/payment/temporarily',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.showFeedback({ status: 'success', msg: json.message });
          _this.getquOrderInfo({ orderStatus: _this.statuscode }); //刷新列表
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  // 取消暂结action
  @action
  cancelTemporarily({ subOrderID = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/payment/cancelTemporarily',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.showFeedback({ status: 'success', msg: json.message });
          _this.getquOrderInfo({ orderStatus: _this.statuscode }); //刷新列表
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //堂食订单判断是否被选中
  @action
  tswhetherchecked() {
    this.ordermsgList.map(order => {
      //判断是否选中有数据
      order.subOrderDetails.map(child => {
        if (child.selected === true) {
          this.flagt = true;
        }
        return child;
      });
      return order;
    });
  }

  //设置跳转状态
  @action
  setissign() {
    this.issign = true;
  }

  //判断是否可以调账
  @action
  checkOut() {
    let _this = this;
    return new Promise((resolve, reject) => {
      getJSON({
        url: '/reception/order/isOrderCheckOut',
        data: { subOrderID: _this.subOrderID },
        success: function(json) {
          if (json.code === 0) {
            if (json.data.isOrderCheckOut) {
              _this.showFeedback({ status: 'warn', msg: json.data.msg });
            } else {
              resolve();
            }
          } else {
            _this.showFeedback({ status: 'warn', msg: json.message });
          }
        }
      });
    })
  }

  //修改订单状态为反结账
  @action
  adjustmentOrder(reason) {
    const _this = this;
    return new Promise((resolve, reject) => {
      getJSON({
        url: '/reception/order/adjustmentOrder.action',
        data: { orderID: _this.orderID,  adjustReason: reason},
        success: function(json) {
          if (json.code === 0) {
            browserHistory.push(
              '/settlement/' + _this.tableID + '/' + _this.subOrderID
            ); //直接跳到结账界面
          } else {
            _this.showFeedback({ status: 'warn', msg: json.message });
          }
        }
      });
    });
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

export default new OrderStore();
