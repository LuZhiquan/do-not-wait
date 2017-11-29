/**
* @author shining
* @description 交班数据模型
* @date 2017-05-25
**/

import { observable, action } from 'mobx';
import { getJSON } from 'common/utils';
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

class ShiftStore {
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

  @observable pageNum; //菜品列表页码
  @observable WorkingList; //纪录列表

  @observable workingID; //每一条纪录表的id

  @observable sumworkingID; //每一条纪录表的id
  @observable setstate; //当前时间是否处于开班状态
  @observable judgecourse; //判断是否有开班
  @observable codestatu;
  @observable isOpenClass;

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

    this.pageNum = 1;
    this.workingID = '';
    this.sumworkingID = '';
    this.setstate = '';
    this.judgecourse = false;
    this.codestatu = 0;
    this.isOpenClass = true;
  }

  //设置切换类型
  @action
  setthisclick(obj) {
    this.thisclick = obj;
  }

  //交接班-开班
  @action
  getstartWorking = (moneyAmount, success, errors) => {
    let _this = this;
    let requireData = { moneyAmount: moneyAmount };
    getJSON({
      url: '/reception/connect/startWorking',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.isOpenClass = true;
          message.success('开班成功!');
          _this.getConnectData(); //开班成功就获取交班的信息
          // _this.isinWorking(); //判断是否开启确认交班的按钮
          success && success();
        } else {
          _this.isOpenClass = false;
          // message.warn(json.message);
          _this.codestatu = json.code;
          errors && errors();
          _this.feedback = feedback(json.message);
          // _this.getConnectData();
        }
      }
    });
  };

  //接受参数
  @action
  setparameter(json) {
    let _this = this;
    _this.connectdata = json.data;
    _this.workingMoney = json.data.workBusinessMoneyVO.workDayMoneyVO;
    _this.orderMoneyVO = json.data.workBusinessMoneyVO.orderMoneyVO;
    _this.orderMoneylist = json.data.workBusinessMoneyVO.orderMoney.map(
      orderMoney => {
        //订单收款
        return orderMoney;
      }
    );

    _this.unSubscribeMoneylist = json.data.workBusinessMoneyVO.cancelBookingMoney.map(
      cancelBookingMoney => {
        //退订
        return cancelBookingMoney;
      }
    );
    _this.memberMoneylist = json.data.workBusinessMoneyVO.memberMoney.map(
      memberMoney => {
        //会员充值
        return memberMoney;
      }
    );
    _this.bookingMoneylist = json.data.workBusinessMoneyVO.bookingMoney.map(
      bookingMoney => {
        //预收订金
        return bookingMoney;
      }
    );
  }

  //交接班接口列表
  @action
  getConnectData(special) {
    let _this = this;
    getJSON({
      url: '/reception/connect/getConnectData',
      success: function(json) {
        if (json.code === 0) {
          _this.setparameter(json);
          _this.sumworkingID = json.data.workingID;
          _this.isOpenClass = true;
        } else if (json.code === 1600) {
          _this.isOpenClass = false;
          special && special();
        } else if (json.code === 1604) {
          _this.isOpenClass = false;
          _this.feedback = feedback(json.message);
        } else {
          _this.isOpenClass = false;
          _this.connectdata = '';
          _this.workingMoney = '';
          _this.orderMoneylist = [];
          _this.unSubscribeMoneylist = [];
          _this.memberMoneylist = [];
          _this.bookingMoneylist = [];
          //  _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //获取交班
  @action
  getsaveWorking(success) {
    let _this = this;
    getJSON({
      url: '/reception/connect/saveWorking',
      success: function(json) {
        if (json.code === 0) {
          success && success(true);
          // _this.showFeedback({status: 'success', msg: "交班成功"});
          // _this.isinWorking(); //判断是否开启确认交班的按钮
          // _this.getConnectData();//开班成功就获取交班的信息
          window.location.assign('/config'); //去到登陆页面
        } else {
          success && success(false);
          //    _this.showFeedback({status: 'warn', msg: json.message});
          _this.feedback = feedback(json.message);
        }
      }
    });
  }

  //交班纪录type,searchContent,startTime,endTime
  @action
  getWorkingList({ searchContent = '', startTime = '', endTime = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/connect/getWorkingList',
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
  getConnectDataByWorkingID(workingID) {
    let _this = this;
    let requireData = { workingID: workingID };
    getJSON({
      url: '/reception/connect/getConnectDataByWorkingID',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.setparameter(json);
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //预打印getpreprint
  @action
  getpreprint(workingID) {
    let _this = this;
    let requireData = { workingID: workingID };
    getJSON({
      url: '/reception/connect/prePrint',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.showFeedback({ status: 'success', msg: '预打印成功' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //当前时间是否处于开班状态
  // @action isinWorking(success){
  //     let _this=this;
  //        getJSON({
  //         url: '/reception/connect/isInWorking',
  //         success: function(json){
  //             _this.setstate=json.code;
  //             success && success();
  //         }
  //     });
  // }

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

export default new ShiftStore();
