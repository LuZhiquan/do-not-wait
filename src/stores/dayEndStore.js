/**
* @author William Cui
* @description 日结数据模型
* @date 2017-06-05
**/

import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { message } from 'antd';
function feedback(msg) {
  return {
    status: 'error',
    title: '提示',
    isOneFooter: true,
    conText: msg
  };
}

//格式化日期
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

class DayEndStore {
  @observable thisclick; //切换哪一个被选中
  @observable currentdate; //获取当前日期
  @observable yesterdaydate; //获取昨天
  @observable connectdata; //交接班接口对象
  @observable feedback; //操作结果反馈
  @observable workingMoney; //营业统计
  @observable orderMoneyVO; //订单统计
  @observable orderMoneylist; //订单收款
  @observable unSubscribeMoneylist; //退订
  @observable memberMoneylist; //会员充值
  @observable bookingMoneylist; //预收订金
  @observable WorkingList; //纪录列表
  @observable workingID; //每一条纪录表的id
  @observable sumworkingID; //每一条纪录表的id
  @observable checkBefore; //检查上一个营业日是否日结

  constructor() {
    this.currentdate = formatTime();
    this.yesterdaydate = nextdate();
    this.thisclick = 1;
    this.connectdata = '';
    this.workingMoney = '';
    this.orderMoneyVO = '';
    this.feedback = null;

    this.orderMoneylist = [];
    this.unSubscribeMoneylist = [];
    this.memberMoneylist = [];
    this.bookingMoneylist = [];
    this.WorkingList = [];

    this.workingID = '';
    this.sumworkingID = '';
    this.checkBefore = false;
  }
  //设置切换类型
  @action
  setthisclick(obj) {
    this.thisclick = obj;
  }

  //接受参数
  @action
  setparameter(json) {
    let _this = this;
    _this.connectdata = json.data;
    let businessStatistics = json.data.workBusinessMoneyVO;
    _this.workingMoney = businessStatistics.workDayMoneyVO; //营业统计
    _this.orderMoneyVO = businessStatistics.orderMoneyVO;
    _this.orderMoneylist = businessStatistics.orderMoney.map(orderMoney => {
      //订单收款
      return orderMoney;
    });
    _this.unSubscribeMoneylist = businessStatistics.cancelBookingMoney.map(
      cancelBookingMoney => {
        //退订
        return cancelBookingMoney;
      }
    );
    _this.memberMoneylist = businessStatistics.memberMoney.map(memberMoney => {
      //会员充值
      return memberMoney;
    });
    _this.bookingMoneylist = businessStatistics.bookingMoney.map(
      bookingMoney => {
        //预收订金
        return bookingMoney;
      }
    );
  }

  //日结详情
  @action
  getConnectData() {
    let _this = this;
    getJSON({
      url: '/reception/connect/getDailyWorkingDetail',
      success: function(json) {
        if (json.code === 0) {
          _this.setparameter(json);
          _this.businessDate = json.data.businessDate;
        } else {
          // _this.feedback = feedback(json.message);
          //    _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //获取交班
  @action
  getsaveWorking(success) {
    let _this = this;
    getJSON({
      url: '/reception/connect/addDailyWorking',
      success: function(json) {
        if (json.code === 0) {
          success && success(true);

          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          success && success(false);
          _this.feedback = feedback(json.message);
        }
      }
    });
  }

  //交班纪录
  @action
  getWorkingList({ searchContent = '', startTime = '', endTime = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/connect/getDailyWorkingList',
      data: { searchContent, startTime, endTime },
      success: function(json) {
        if (json.code === 0) {
          _this.WorkingList = json.data.workingList.map((working, i) => {
            working.index = i;
            working.selected = false;
            return working;
          });
        } else if (json.code === 4) {
          _this.WorkingList = [];
        } else {
          _this.WorkingList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //判断是否勾选中
  @action
  checkedworkingtList(index) {
    this.WorkingList = this.WorkingList.map(working => {
      working.selected = working.index === index;
      return working;
    });
  }

  //设置workingID
  @action
  setworkingID(workingID) {
    this.workingID = workingID;
  }

  //交班单条纪录
  @action
  getConnectDataByWorkingID({ workingID = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/connect/getDailyWorkingDetail',
      data: { workingID },
      success: function(json) {
        if (json.code === 0) {
          _this.setparameter(json);
        } else {
          //    _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //预打印getpreprint
  @action
  getpreprint() {
    let _this = this;
    getJSON({
      url: '/reception/connect/prePrintDailyWorking',
      success: function(json) {
        if (json.code === 0) {
          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //(日结接口)检查上一个营业日是否日结
  @action
  checkBeforeDailyWorking() {
    let _this = this;
    getJSON({
      url: '/reception/connect/checkBeforeDailyWorking',
      success: function(json) {
        if (json.code === 0) {
          _this.checkBefore = json.data.isBeforeDailyEnd;
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
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

export default new DayEndStore();
