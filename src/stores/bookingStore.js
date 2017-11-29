/**
* @author Gao Meng
* @description 预定数据模型
* @date 2017-5-15
**/

import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { browserHistory } from 'react-router';
import { message } from 'antd';
import moment from 'moment';
message.config({
  top: 300
});

class bookingStore {
  @observable feedback; //操作结果反馈
  @observable reserveAreaIDs; //查询区域
  @observable searchContent; //预定列表查询参数
  @observable bookingMessage; //提交的预定信息
  @observable tempMessage; //临时的预定信息
  @observable bookingRecords; //预定记录列表
  @observable recordItem; //一条预订记录
  @observable recordDetail; //预订单详情
  @observable customerArchives; //客情档案

  @observable searchRecords; //搜索界面预订信息

  @observable errorText; //错误提示
  @observable createCurrentTab; //创建界面选中的tab下标
  @observable secondTabKey; //创建选卓台二级菜单key值
  @observable currentDate; //主界面当前日期
  @observable indexTabKey; //台主界面预订信息tab的key值
  @observable leaveDeskMoney; //留位金

  @observable createAreaIDs; //卓台区域
  @observable createDeskMessage; //创建卓台列表
  @observable mayBookingTableList; //可预定桌台列表
  @observable mealsInfos; //获取所有餐次信息
  @observable mealsDuration; //create界面默认时长 以及每次增加的值
  @observable activeTimeKey; //选择时间当前tab下标
  @observable createRefundMeg; //创建界面退款规则
  @observable cancelReasons; //取消预订原因
  @observable cancelRefundAmount; //取消退定金查询

  @observable preferenceTables; //获取偏好卓台
  @observable bookingReceiptInfo; //创建预定成功返回的信息
  @observable isShowReceiptPopup; //预定成功弹出订单信息
  @observable createTableNames; //创建预定桌台名字
  @observable bookingTableStatus; //桌台主界面预订信息状态
  @observable queryCondition; //获取筛选条件
  @observable isMoreDishesPopup; //显示多桌点菜弹窗

  @observable refundMoneyInfo; //退定金页面信息
  @observable paymentInfo; //支付界面信息
  @observable paymentMethod; //获取所有支付方式

  @observable selectDesk; //多台点菜已经选中的桌台;
  @observable currentDesk; //多台点菜当前点菜的桌台
  @observable currentDeskIndex; //当前选中桌子下标
  @observable currentStyleIndex; //当前预订方式下标
  @observable currentGender; //当前性别下标

  @observable successBack; //请求成功
  @observable payMoneyMessage; //支付界面所有信息
  @observable payBookingID; //支付界面当前bookingID;
  @observable payHasBookingMoney; //支付界面已收钱

  constructor() {
    this.feedback = null;
    this.reserveAreaIDs = [];
    this.bookingRecords = [];
    this.createCurrentTab = 0;
    this.secondTabKey = 0;
    this.indexTabKey = 0;
    this.mealsInfos = [];
    this.mealsDuration = {
      segmentLength: 0,
      minLength: 0,
      endTime: '',
      startTime: ''
    };
    this.createAreaIDs = [];
    this.createDeskMessage = [];
    this.mayBookingTableList = [];
    this.preferenceTables = [];
    this.bookingReceiptInfo = '';
    this.isShowReceiptPopup = false;
    this.createTableNames = [];
    this.bookingTableStatus = [];
    this.currentDate = moment().format('YYYY-MM-DD');
    this.leaveDeskMoney = '';
    this.recordItem = null;
    this.recordDetail = '';
    this.queryCondition = '';
    this.customerArchives = '';
    this.cancelReasons = '';
    this.activeTimeKey = 0;
    this.cancelRefundAmount = '';

    this.refundMoneyInfo = '';
    this.searchRecords = []; //搜索界面预订信息
    this.isMoreDishesPopup = false;
    this.paymentInfo = '';
    this.paymentMethod = '';
    this.createRefundMeg = '';
    this.successBack = false;

    this.selectDesk = [];
    this.currentDesk = '';
    this.currentDeskIndex = 0;
    this.currentStyleIndex = 2;
    this.currentGender = 0;

    this.payMoneyMessage = '';
    this.payBookingID = '';
    this.payHasBookingMoney = 0;

    this.tempMessage = '';
    this.bookingMessage = {
      archiveID: '',
      areaID: '',
      peopleNum: '',
      bookingTime: '',
      bookingType: 616, //默认预定类型  614 预订点菜并支付 615 预订留位  616 普通预订
      duration: '',
      phone: '',
      contact: '',
      gender: 2,
      tableIDs: [],
      memo: ''
    };
    this.searchContent = {
      startTime: '',
      endTime: '',
      search: '',
      bookingStatus: '',
      bookingChannel: '',
      bookingType: ''
    };
    this.errorText = {
      errorPhone: '',
      errorContact: '',
      errorGendar: '',
      errorTime: '',
      errorNumber: '',
      errorDesk: ''
    };
  }

  //显示操作反馈信息
  @action
  showFeedback({ status, msg }) {
    this.feedback = { status, msg };
  }

  //关闭桌台操作反馈信息
  @action
  closeFeedback() {
    this.feedback = null;
  }

  /****************预定列表************************************/

  //index界面获取右侧卓台状态
  @action
  indexReserveAreaID() {
    //日期改变把当前tab置0

    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }
    let _this = this;
    getJSON({
      url: '/order/reserve/queryReserveAreaID.action',
      data: { archiveID: archiveID },
      success: function(json) {
        ////console.log("indexReserveAreaID",json);
        if (json.code === 0) {
          _this.reserveAreaIDs = json.data;
          _this.bookingTableStatus = _this.getBookingTableStatus(
            json.data[0].areaID,
            _this.currentDate
          );
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //主界面选择日期确定
  @action
  calendarModalOk(date) {
    this.recordItem = '';
    this.indexTabKey = 0;
    this.currentDate = date;
    this.getBookingList();
    this.indexReserveAreaID();
  }
  //主界面日期点击
  @action
  indexCurrentDate(date) {
    this.recordItem = '';
    this.indexTabKey = 0;
    this.currentDate = date;
    this.getBookingList();
    this.indexReserveAreaID();
  }
  //点击当天
  @action
  todayClick(date) {
    this.recordItem = '';
    this.indexTabKey = 0;
    this.currentDate = date;
    this.getBookingList();
    this.indexReserveAreaID();
  }
  //主界面tab点击事件
  @action
  deskTabClick(key) {
    this.indexTabKey = key;
    this.getBookingTableStatus(this.reserveAreaIDs[key].areaID);
  }
  //查询预定列表
  @action
  getBookingList() {
    let _this = this;
    //获取档案ID
    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }
    getJSON({
      url: '/order/reserve/getBookingList.action',
      data: {
        startTime: _this.currentDate + ' 00:00:00',
        endTime: _this.currentDate + ' 23:59:59',
        search: '',
        bookingStatus: '',
        bookingChannel: '',
        bookingType: '',
        archiveID: archiveID
      },
      success: function(json) {
        //console.log("getBookingList",json);
        if (json.code === 0) {
          _this.bookingRecords = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  @action
  recordItemClick(record) {
    this.customerArchives = '';
    this.recordItem = record;
    this.getBookingDetail(record.bookingID);
    this.getCustomerArchives(record.phone);
  }
  //关闭预订详情
  @action
  closeDetailClick() {
    this.recordItem = null;
  }

  //初始化主界面
  @action
  initialReordItem() {
    this.recordItem = '';
    this.recordDetail = '';
    this.customerArchives = '';
  }

  //查询预订单详情
  @action
  getBookingDetail(bookingID) {
    let _this = this;
    getJSON({
      url: '/order/reserve/getBookingDetail.action',
      data: { bookingID: bookingID },
      success: function(json) {
        //console.log("getBookingDetail",json);
        if (json.code === 0) {
          _this.recordDetail = json.data;
          //console.log("_this.recordDetail",_this.recordDetail);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //获取桌台预订信息状态信息
  @action
  getBookingTableStatus(areaID) {
    this.bookingTableStatus = [];
    let _this = this;
    getJSON({
      url: '/order/reserve/getBookingTableStatus.action',
      data: {
        areaID: areaID,
        startTime: _this.currentDate + ' 00:00:00',
        endTime: _this.currentDate + ' 23:59:59'
      },
      success: function(json) {
        //console.log("getBookingTableStatus",json);
        if (json.code === 0) {
          _this.bookingTableStatus = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //获取筛选条件
  @action
  getQueryCondition() {
    let _this = this;
    getJSON({
      url: '/order/reserve/getQueryCondition.action',
      success: function(json) {
        //console.log("getQueryCondition",json);
        if (json.code === 0) {
          _this.queryCondition = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //搜索界面点击搜索
  @action
  recordSearch(search) {
    //初始化
    this.initialReordItem();

    let _this = this;
    //获取档案ID
    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }
    getJSON({
      url: '/order/reserve/getBookingList.action',
      data: {
        startTime: search.startTime + ' 00:00:00',
        endTime: search.endTime + ' 23:59:59',
        search: search.search,
        bookingStatus: '',
        bookingChannel: '',
        bookingType: '',
        archiveID: archiveID
      },
      success: function(json) {
        //console.log("recordSearch",json);
        if (json.code === 0) {
          _this.searchRecords = json.data;
          if (_this.searchRecords.length > 0) {
            _this.recordItem = _this.searchRecords[0]; //默认选中第0条
            _this.getBookingDetail(_this.recordItem.bookingID); //初始预订单详情
            _this.getCustomerArchives(_this.recordItem.phone); //初始化客情档案
          }
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //搜索界面筛选
  @action
  btnItemClick(startTime, endTime, search, status, source, type, time) {
    //初始化
    this.initialReordItem();
    let mstartTime, mendTime;
    if (time.startTime) {
      mstartTime = ' ' + time.startTime.split(' ')[1];
      mendTime = ' ' + time.endTime.split(' ')[1];
    } else {
      mstartTime = ' 00:00:00';
      mendTime = ' 23:59:59';
    }
    let _this = this;

    //获取档案ID
    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }
    getJSON({
      url: '/order/reserve/getBookingList.action',
      data: {
        startTime: startTime + mstartTime,
        endTime: endTime + mendTime,
        search: search,
        bookingStatus: status,
        bookingChannel: source,
        bookingType: type,
        archiveID: archiveID
      },
      success: function(json) {
        //console.log("recordSearch",json);
        if (json.code === 0) {
          _this.searchRecords = json.data;
          if (_this.searchRecords.length > 0) {
            _this.recordItem = _this.searchRecords[0]; //默认选中第0条
            _this.getBookingDetail(_this.recordItem.bookingID); //初始预订单详情
            _this.getCustomerArchives(_this.recordItem.phone); //初始化客情档案
          }
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //获取客情档案
  @action
  getCustomerArchives(mobile) {
    let _this = this;
    getJSON({
      url: '/order/reserve/getMemberRecordInfo.action',
      data: { mobile: mobile },
      success: function(json) {
        //console.log("getMemberRecordInfo",json);
        if (json.code === 0) {
          _this.customerArchives = json.data;
        } else {
          //  message.config({top:200});
          //  message.warn(json.message,1);
        }
      }
    });
  }
  @action
  initialArchives() {
    this.customerArchives = '';
  }
  /********************************获取小票信息***************************/
  @action
  getReceiptMessage(bookingID) {
    let _this = this;
    getJSON({
      url: '/order/reserve/returnBookingDetail.action',
      data: { bookingID: bookingID },
      success: function(json) {
        //console.log("queryRefundScale",json);
        if (json.code === 0) {
          _this.bookingReceiptInfo = json.data;
        } else {
        }
      }
    });
  }

  /********************************取消预订******************************/
  //查询取消预订原因
  @action
  queryRefundScale(bookingID) {
    let _this = this;
    getJSON({
      url: '/order/reserve/queryRefundScale.action',
      data: { bookingID: bookingID },
      success: function(json) {
        //console.log("queryRefundScale",json);
        if (json.code === 0) {
          _this.cancelReasons = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //查询退定金
  @action
  queryRefundAmount(bookingID) {
    let _this = this;
    getJSON({
      url: '/order/reserve/queryRefundAmount.action',
      data: { bookingID: bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.cancelRefundAmount = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //取消预订
  @action
  cancelBookingOk(memo, bookingID, refundAmount) {
    let _this = this;
    getJSON({
      url: '/order/reserve/cancelBooking.action',
      data: { bookingID: bookingID, memo: memo, refundAmount: refundAmount },
      success: function(json) {
        //console.log("cancelBooking",json);
        if (json.code === 0) {
          message.destroy();
          message.success('取消预订成功', 2);

          //取消预订刷新界面
          if (_this.bookingRecords.length > 0) {
            let mIndex;
            _this.bookingRecords.forEach((record, index) => {
              if (record.bookingID === bookingID) {
                mIndex = index;
              }
            });

            // 	729 bookingStatus="已取消";
            _this.bookingRecords[mIndex].bookingStatus = 729;
          } else {
            let mIndex;
            _this.searchRecords.forEach((record, index) => {
              if (record.bookingID === bookingID) {
                mIndex = index;
              }
            });
            _this.searchRecords[mIndex].bookingStatus = 729;
          }
          _this.getBookingDetail(bookingID);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //修改预订
  @action
  alterBooking(number, remarks, bookingID) {
    let _this = this;
    getJSON({
      url: '/order/reserve/updateBooking.action',
      data: { bookingID: bookingID, peopleNum: number, memo: remarks },
      success: function(json) {
        //console.log("updateBooking",json);
        if (json.code === 0) {
          message.destroy();
          message.success('修改预订成功', 2);

          //判断是搜索界面还是主界面  刷新界面
          if (_this.bookingRecords.length > 0) {
            let mIndex;
            _this.bookingRecords.forEach((record, index) => {
              if (record.bookingID === bookingID) {
                mIndex = index;
              }
            });
            _this.bookingRecords[mIndex].peopleNum = number;
          } else {
            let mIndex;
            _this.searchRecords.forEach((record, index) => {
              if (record.bookingID === bookingID) {
                mIndex = index;
              }
            });
            _this.searchRecords[mIndex].peopleNum = number;
          }
          _this.getBookingDetail(bookingID);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //退定金获取金额
  @action
  getRefundMoney(bookingID) {
    let _this = this;
    getJSON({
      url: '/order/reserve/queryRefundInfo',
      data: { bookingID: bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.refundMoneyInfo = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //退定金提交
  @action
  submitRefundMoney(bookingID, amount) {
    //let _this=this;
    getJSON({
      url: '/order/reserve/refundBookingAmount.action',
      data: { bookingID: bookingID, amount: amount },
      success: function(json) {
        if (json.code === 0) {
          message.destroy();
          message.warn(json.message, 1);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  @action
  goToPay(bookingID) {
    browserHistory.push('/booking/pay/' + bookingID);
  }
  /******************************多台单台预订**************************************/
  //单台  多台在支付界面保存
  @action
  paySaveBooking(shoppingCart, failure) {
    let _this = this;
    let saveData = this.bookingMessage;

    saveData.shoppingCarts = [];
    saveData.shoppingCarts.push(JSON.stringify(shoppingCart));
    saveData.shoppingCarts.toString();

    getJSON({
      url: '/reception/product/addBookingOrder.action',
      method: 'POST',
      data: saveData,
      success: function(json) {
        if (json.code === 0) {
          _this.createInitialization();
          _this.payBookingID = json.data;
          _this.getBookingPaymentInfo(json.data, function() {
            browserHistory.push('/booking/pay/' + json.data);
          });
        } else if (json.code === -1) {
          let data = JSON.parse(json.message);
          failure && failure(data);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //多台点菜选择桌台
  @action
  deskItemClick(index, desk) {
    this.currentDeskIndex = index;
    //  let arr = this.selectDesk.filter((desk,index)=>{
    //     return desk.cart!=='';
    //  });
    //  if(arr.length>0){

    //  }
    this.currentDesk = desk;
  }

  //多台点菜完成
  @action
  payMoreSaveBooking(callback, failure) {
    let _this = this;
    let saveData = this.bookingMessage;

    let shoppingCart = [];
    this.selectDesk.forEach((desk, index) => {
      shoppingCart.push(JSON.stringify(desk.cart.shoppingCart));
    });
    let shoppingCarts = shoppingCart.join('/');
    saveData.shoppingCarts = shoppingCarts;

    getJSON({
      url: '/reception/product/addBookingOrder.action',
      method: 'POST',
      data: saveData,
      success: function(json) {
        if (json.code === 0) {
          _this.createInitialization();
          _this.moreHandleCancel();

          callback && callback(true, '下单成功', json.data);
        } else if (json.code === -1) {
          let data = JSON.parse(json.message);
          failure && failure(data);
        } else {
          callback && callback(false, json.message);
        }
      }
    });
  }

  //取消事件
  @action
  moreHandleCancel() {
    this.currentDesk = '';
    this.currentDeskIndex = 0;

    //清空购物车
    this.selectDesk = this.selectDesk.map((desk, index) => {
      desk.cart = '';
      return desk;
    });

    this.isMoreDishesPopup = false;
  }
  //跳到点菜界面
  @action
  toBookingDishes() {
    browserHistory.push({
      pathname: '/dishes/' + this.currentDesk.tableID,
      state: {
        dishesType: 'booking',
        orderInfo: {
          bookingName: this.tempMessage.contact,
          peopleNum: this.tempMessage.peopleNum,
          memo: this.tempMessage.memo,
          tableName: this.currentDesk.tableName,
          bookingTime: this.tempMessage.bookingTime
        },
        nextUrl: '/booking/create',
        cart: JSON.stringify(this.currentDesk.cart)
      }
    });
  }
  //支付界面返回
  @action
  payGoBack(current) {
    browserHistory.push('/booking');

    this.createInitialization();
    this.isMoreDishesPopup = false;
    //清空购物车
    this.selectDesk = this.selectDesk.map((desk, index) => {
      desk.cart = '';
      return desk;
    });
  }
  //创建界面返回按钮
  @action
  createGoBack() {
    browserHistory.push('/booking');
    this.createInitialization();
    this.isMoreDishesPopup = false;
  }

  //支付界面

  /*************************创建预订************************************/
  //查询退款规则
  @action
  queryRefundRule(bookingType) {
    let _this = this;
    getJSON({
      url: '/order/reserve/queryRefundRule.action',
      data: { bookingType: bookingType },
      success: function(json) {
        //console.log("queryRefundRule",json);
        if (json.code === 0) {
          _this.createRefundMeg = json.data.msg;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //客情档案、预订选台、预订菜品点击
  @action
  topTabClick(key) {
    this.createCurrentTab = key;
  }

  //进入预定界面初始化数据
  @action
  createInitialization() {
    this.errorText = {
      errorPhone: '',
      errorContact: '',
      errorGendar: '',
      errorTime: '',
      errorNumber: '',
      errorDesk: ''
    };
    this.bookingMessage = {
      archiveID: '',
      areaID: '',
      peopleNum: '',
      bookingTime: '',
      bookingType: 614, //默认预定类型  614 预订点菜并支付 615 预订留位  616 普通预订
      duration: '',
      phone: '',
      contact: '',
      gender: 2,
      tableIDs: [],
      memo: ''
    };
    this.createTableNames = [];
    this.createCurrentTab = 0;
    this.secondTabKey = 0;
    this.createAreaIDs = [];
    this.mayBookingTableList = [];

    this.currentStyleIndex = 2;
    this.currentGender = 0;
  }

  //电话号码onchange
  @action
  phoneOnChange(phoneValue) {
    let _this = this;

    this.bookingMessage.phone = phoneValue;
    if (/^1[34578]\d{9}$/.test(phoneValue)) {
      this.errorText.errorPhone = '';

      //根据电话号码获取用户信息
      getJSON({
        url: '/reception/member/getLoginInfoByMobile.action',
        data: { mobile: phoneValue },
        success: function(json) {
          //console.log("getLoginInfoByMobile",json);
          if (json.code === 0) {
            _this.bookingMessage.contact = json.data.nickName
              ? json.data.nickName
              : '';
            _this.bookingMessage.gender = json.data.gender
              ? json.data.gender
              : 2;
            _this.currentGender = json.data.gender - 2;
          } else {
            // message.config({top:200});
            // message.warn(json.message,1);
          }
        }
      });
      //根据电话号码获取偏好桌台
      let mobile = phoneValue;
      this.getPreferenceDinningTableList(mobile);
      //根据电话号码获取档案详情
      this.getCustomerArchives(phoneValue);
    } else {
      this.customerArchives = '';

      this.preferenceTables = [];
    }
  }

  //选择性别按钮
  @action
  gendarClick(gendar) {
    this.bookingMessage.gender = gendar;
    this.errorText.errorGendar = '';
    //    if(gendar===0){
    //      this.errorText.errorGendar="请选择性别";
    //    }else{
    //      this.errorText.errorGendar="";
    //    }
  }
  //输入人数
  @action
  numberOnChange(number) {
    this.bookingMessage.peopleNum = number;

    if (/^[0-9]+$/.test(number)) {
      this.errorText.errorNumber = '';
    }

    //获取留位预订金
    this.getReservationFee();
  }
  //选择预定方式
  @action
  styleClick(styleValue) {
    this.bookingMessage.bookingType = styleValue;

    //查询退款规则
    this.queryRefundRule(this.bookingMessage.bookingType);
    //留位预订
    this.getReservationFee();
  }
  //获取留位预订金
  @action
  getReservationFee() {
    if (
      this.bookingMessage.peopleNum !== '' &&
      this.bookingMessage.tableIDs.length > 0 &&
      this.bookingMessage.bookingType === 615
    ) {
      let archiveID;
      if (sessionStorage.getItem('account')) {
        archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
      }
      let tableNum = this.bookingMessage.tableIDs.length;
      //console.log(tableNum);
      let _this = this;
      getJSON({
        url: '/order/reserve/queryReservationFee.action',
        data: {
          archiveID: archiveID,
          peopleNum: _this.bookingMessage.peopleNum,
          tableNum: tableNum
        },
        success: function(json) {
          //console.log("queryReservationFee",json);
          if (json.code === 0) {
            _this.leaveDeskMoney = json.data.reservationFee;

            //console.log("ssssss"+ _this.leaveDeskMoney);
          } else {
            message.destroy();
            message.warn(json.message, 1);
          }
        }
      });
    }
  }
  //点击选择桌台
  @action
  selectDeskClick() {
    this.createCurrentTab = 1;
    this.secondTabKey = 0;
    this.bookingMessage.tableIDs = [];
    this.createTableNames = [];
    this.queryReserveAreaID();

    if (this.bookingMessage.bookingTime) {
      this.isShowCalendar = true;
    } else {
      this.isShowCalendar = false;
    }
  }
  //输入名字
  @action
  contactOnChange(contact) {
    this.bookingMessage.contact = contact;

    this.errorText.errorContact = '';
  }
  //备注改变
  @action
  remarksOnChange(remarks) {
    this.bookingMessage.memo = remarks;
  }
  //时间确定
  @action
  selectTimeClick(time) {
    if (time) {
      this.errorText.errorTime = '';
    } else {
      this.errorText.errorTime = '请选择预订时间';
    }
    if (
      this.bookingMessage.bookingTime &&
      this.mayBookingTableList.length > 0
    ) {
      this.queryReserveAreaID();
      this.getMayBookingTableList(0);
    }
    this.bookingMessage.bookingTime = time;

    this.bookingMessage.duration = this.mealsDuration.segmentLength;
  }

  //查询预订餐次信息
  @action
  getMealsInfo(date) {
    //获取档案ID
    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }

    let _this = this;

    //获取预定的时间
    // if(this.bookingMessage.bookingTime){
    //      reverseTime= this.bookingMessage.bookingTime.split(" ")[0].toString();
    // }else{
    //     reverseTime=moment().format('YYYY-MM-DD');
    // }

    getJSON({
      url: '/order/reserve/getMealsInfo.action',
      data: { archiveID: archiveID, reserveTime: date },
      success: function(json) {
        //console.log("getMealsInfo",json);
        if (json.code === 0) {
          _this.mealsInfos = json.data;
          _this.mealsDuration = {
            segmentLength: _this.mealsInfos[0].segmentLength,
            minLength: _this.mealsInfos[0].minLength,
            endTime: _this.mealsInfos[0].endTime,
            startTime: _this.mealsInfos[0].startTime
          };
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //餐次时长减
  @action
  timeJianClick() {
    let value = this.mealsDuration.segmentLength;
    let minLength = this.mealsDuration.minLength;
    if (value - 15 >= minLength) {
      let current = value - 15;
      this.mealsDuration.segmentLength = current;
    } else {
      message.destroy();
      message.info('预订时长不能小于标准时长' + minLength, 1);
    }
  }
  //餐次时长加
  @action
  timeJiaClick() {
    let current = this.mealsDuration.segmentLength * 1 + 15;
    this.mealsDuration.segmentLength = current;
  }
  //餐次tab切换
  @action
  timeTabClick(key) {
    this.activeTimeKey = key;
    this.mealsDuration = {
      segmentLength: this.mealsInfos[key].segmentLength,
      minLength: this.mealsInfos[key].minLength,
      endTime: this.mealsInfos[key].endTime,
      startTime: this.mealsInfos[key].startTime
    };
  }

  //查询区域
  @action
  queryReserveAreaID() {
    //获取档案ID
    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }
    let _this = this;
    getJSON({
      url: '/order/reserve/queryReserveAreaID.action',
      data: { archiveID: archiveID },
      success: function(json) {
        //console.log("queryReserveAreaID",json);
        if (json.code === 0) {
          _this.createAreaIDs = json.data;

          _this.getMayBookingTableList(0, json.data[0]);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //查询可预订的桌台
  @action
  getMayBookingTableList(key, tabContent) {
    this.mayBookingTableList = [];

    this.bookingMessage.tableIDs = [];
    this.createTableNames = [];

    this.secondTabKey = key;
    let myValue;
    if (tabContent) {
      myValue = tabContent;
    } else {
      myValue = this.createAreaIDs[0];
    }
    let _this = this;
    getJSON({
      url: '/order/reserve/getMayBookingTableList.action',
      data: {
        archiveID: myValue.archiveID,
        reserveTime: this.bookingMessage.bookingTime,
        duration: this.bookingMessage.duration,
        areaID: myValue.areaID
      },
      success: function(json) {
        //console.log("getMayBookingTableList",json);
        if (json.code === 0) {
          _this.mayBookingTableList = json.data.map(table => {
            table.select = false;
            return table;
          });
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //取消预订
  @action
  cancelCreateBooking() {
    this.createInitialization();
    browserHistory.push('/booking');
  }

  //保存预订
  @action
  submitClick(styleValue, callback, loading) {
    this.bookingMessage.bookingType = styleValue;

    let _this = this;
    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }

    this.bookingMessage.archiveID = archiveID;
    this.bookingMessage.tableIDs = this.bookingMessage.tableIDs.toString();

    //对提交的数据进行判断
    //手机号
    let isPhone = /^1[34578]\d{9}$/.test(this.bookingMessage.phone);
    if (isPhone) {
      this.errorText.errorPhone = '';
    } else {
      this.errorText.errorPhone = '请输入正确手机号';
    }

    //姓名
    let isContact = this.bookingMessage.contact;
    if (isContact) {
      this.errorText.errorContact = '';
    } else {
      this.errorText.errorContact = '请输入姓名';
    }
    // //性别
    // let isGender=this.bookingMessage.gender===1||this.bookingMessage.gender===2;
    // if(isGender){
    //      this.errorText.errorGendar="";

    // }else{
    //      this.errorText.errorGendar="请选择性别";
    // }

    //预订时间
    let isBookingTime = this.bookingMessage.bookingTime;
    if (isBookingTime) {
      this.errorText.errorTime = '';
    } else {
      this.errorText.errorTime = '请选择预订时间';
    }

    //人数
    let isPeopleNum =
      /^[0-9]+$/.test(this.bookingMessage.peopleNum) &&
      this.bookingMessage.peopleNum * 1 > 0;
    if (isPeopleNum) {
      this.errorText.errorNumber = '';
    } else {
      this.errorText.errorNumber = '请输入正确的人数';
    }
    //预订桌台
    let isTableIDs = this.bookingMessage.tableIDs;
    if (isTableIDs) {
      this.errorText.errorDesk = '';
    } else {
      this.errorText.errorDesk = '请选择预订桌台';
    }

    if (isPhone && isContact && isBookingTime && isPeopleNum && isTableIDs) {
      loading && loading();
      switch (styleValue) {
        case 614:
          //点菜预定
          if (this.selectDesk.length === 1) {
            //单台预订点菜
            this.tempMessage = this.bookingMessage;
            browserHistory.push({
              pathname: '/dishes/' + _this.bookingMessage.tableIDs,
              state: {
                dishesType: 'booking',
                orderInfo: {
                  bookingName: _this.bookingMessage.contact,
                  peopleNum: _this.bookingMessage.peopleNum,
                  memo: _this.bookingMessage.memo,
                  tableName: _this.createTableNames[0],
                  bookingTime: _this.bookingMessage.bookingTime
                },
                nextUrl: '/booking/pay'
              }
            });
          } else {
            //多台预订点菜
            this.isMoreDishesPopup = true;
            this.tempMessage = this.bookingMessage;
          }

          break;
        case 615:
          //留位预定
          getJSON({
            url: '/order/reserve/saveBooking.action',
            data: _this.bookingMessage,
            success: function(json) {
              //console.log("saveBooking",json);
              if (json.code === 0) {
                callback && callback();
                browserHistory.push('/booking/pay/' + json.data.bookingID);
                _this.createInitialization();
              } else {
                callback && callback();
                message.destroy();
                message.warn(json.message, 1);
              }
            }
          });
          break;
        //普通预定
        case 616:
          getJSON({
            url: '/order/reserve/saveBooking.action',
            data: _this.bookingMessage,
            success: function(json) {
              //console.log("saveBooking",json);
              if (json.code === 0) {
                callback && callback();

                _this.createInitialization();
                _this.isShowReceiptPopup = true;
                _this.getReceiptMessage(json.data.bookingID);
              } else {
                callback && callback();

                message.destroy();
                message.warn(json.message, 1);
              }
            }
          });
          break;
        default:
          break;
      }
    }
  }

  @action
  receiptPopupClick() {
    this.isShowReceiptPopup = false;
  }

  //跳到支付界面  获取支付界面所有信息
  @action
  getBookingPaymentInfo(bookingID, callback) {
    //console.log("bookingID",bookingID)
    let _this = this;
    getJSON({
      url: '/order/reserve/getBookingPaymentInfo.action',
      data: { bookingID: bookingID },
      success: function(json) {
        //console.log("getBookingPaymentInfo",json);
        if (json.code === 0) {
          _this.paymentInfo = json.data;
          if (callback) {
            callback();
          }
          _this.successBack = true;
          _this.payHasBookingMoney = json.data.bookingDetail.bookingAmount;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //支付提交
  @action
  payment(payBookingID, method, payMoney, code) {
    let item = {
      paymentMethodID: method.paymentMethodID,
      isOnline: method.isOnline,
      paymentAmount: payMoney,
      paymentName: method.paymentName
    };
    if (method.paymentMethodID === 5) {
      //现金
      item.isShowBtn = true; //判断是否显示确定  取消
      this.payMoneyMessage = item;

      if (this.payHasBookingMoney > 0) {
        this.paymentInfo.bookingDetail.bookingAmount =
          payMoney + this.payHasBookingMoney; //改已收钱
      } else {
        this.paymentInfo.bookingDetail.bookingAmount = payMoney; //改已收钱
      }
    } else {
      //微信 支付宝
      let _this = this;

      getJSON({
        url: '/reception/payment/onlinePayment',
        data: {
          bookingID: payBookingID,
          paymentAmount: payMoney,
          paymentMethodID: method.paymentMethodID,
          authCode: code
        },
        timeout: 120 * 1000,
        success: function(json) {
          if (json.code === 521) {
            message.destroy();
            message.success(json.message, 1);

            let myItem = item;
            item.isShowBtn = false;
            _this.payMoneyMessage = myItem;
            if (_this.payHasBookingMoney > 0) {
              _this.paymentInfo.bookingDetail.bookingAmount =
                payMoney + _this.payHasBookingMoney; //改已收钱
            } else {
              _this.paymentInfo.bookingDetail.bookingAmount = payMoney; //改已收钱
            }
            _this.paymentInfo.bookingDetail.bookingStatus = 618; //改变支付状态
          } else {
            let myItem = item;
            item.isShowBtn = true;
            _this.payMoneyMessage = myItem;
            message.destroy();
            message.warn(json.message, 1);
          }
        }
      });
    }
  }

  //微信  支付宝  单条记录
  @action
  payItemOk(totalMoney) {
    this.payMoneyMessage.isShowBtn = false;
    this.paymentInfo.bookingDetail.bookingAmount = totalMoney; //改已收钱
    this.paymentInfo.bookingDetail.bookingStatus = 618; //改变支付状态
  }
  @action
  payItemCancel() {
    this.payMoneyMessage = '';
    this.paymentInfo.bookingDetail.bookingAmount = this.payHasBookingMoney; //改已收钱
  }

  //现金删除
  @action
  cashDeleteClick() {
    this.payMoneyMessage = '';
    this.paymentInfo.bookingDetail.bookingAmount = this.payHasBookingMoney; //改已收钱
  }
  //支付界面取消
  @action
  payCancel() {
    browserHistory.push('/booking');
  }

  //支付界面确定
  @action
  payOk(handmade) {
    this.isShowReceiptPopup = true;
    let _this = this;
    if (this.payMoneyMessage) {
      let hand = handmade ? 1 : 0;
      let item = {
        paymentMethodID: this.payMoneyMessage.paymentMethodID,
        isOnline: this.payMoneyMessage.isOnline,
        paymentAmount: this.payMoneyMessage.paymentAmount,
        handmade: hand
      };
      if (
        this.payMoneyMessage.paymentMethodID === 5 ||
        (this.payMoneyMessage.paymentMethodID !== 5 &&
          this.payMoneyMessage.isShowBtn === false)
      ) {
        let paymentInfoList = [];
        paymentInfoList.push(item);
        paymentInfoList = JSON.stringify(paymentInfoList);

        getJSON({
          url: '/reception/payment/payment',
          data: {
            bookingID: _this.payBookingID,
            paymentInfoList: paymentInfoList
          },
          success: function(json) {
            if (json.code === 500) {
              // message.config({top:200});
              // message.warn(json.message,1);
              //提交数据成功获取小票信息
              _this.getReceiptMessage(_this.payBookingID);
            } else {
              message.destroy();
              message.warn(json.message, 1);
            }
          }
        });
      } else {
        message.destroy();
        message.warn('请先确定', 2);
      }
    } else {
      message.destroy();
      message.warn('请先支付', 2);
    }
  }

  //获取所有的支付方式
  @action
  getPaymentMethod() {
    let _this = this;
    getJSON({
      url: '/reception/payment/getPaymentMethod.action',
      success: function(json) {
        //console.log("getPaymentMethod",json);
        if (json.code === 0) {
          _this.paymentMethod = json.resultList;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //查询用户偏好桌
  @action
  getPreferenceDinningTableList(mobile) {
    let _this = this;
    getJSON({
      url: '/order/reserve/getPreferenceDinningTableList.action',
      data: { mobile },
      success: function(json) {
        //console.log("getPreferenceDinningTableList",json);
        if (json.code === 0) {
          _this.preferenceTables = json.data.map(item => {
            return item.tableName + '[' + item.bookingNum + '次]';
          });
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //选择预定桌台
  @action
  mayBookingItemClick() {
    if (this.bookingMessage.tableIDs) {
      this.errorText.errorDesk = '';
    } else {
      this.errorText.errorDesk = '请选择预订桌台';
    }
    this.bookingMessage.tableIDs = [];
    this.createTableNames = [];
    this.selectDesk = [];

    let selectItems = this.mayBookingTableList.filter((table, index) => {
      return table.select;
    });
    selectItems.forEach((table, index) => {
      this.selectDesk.push({
        tableID: table.tableID,
        tableName: table.tableName,
        defaultPerson: table.defaultPerson,
        cart: ''
      });

      this.bookingMessage.tableIDs.push(table.tableID);
      this.createTableNames.push(table.tableName);
    });

    //console.log("selectDesk",this.selectDesk);
    this.bookingMessage.areaID = this.mayBookingTableList[0].areaID;

    //获取留位预订金
    this.getReservationFee();
  }

  //判断是否可以预定开台
  @action
  bookingIsOpen = ({ bookingID, success }) => {
    getJSON({
      url: '/reception/table/bookingIsOpen',
      data: { bookingID },
      success: function(json) {
        if (json.code === 0) {
          success && success();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
}

export default new bookingStore();
