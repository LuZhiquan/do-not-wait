/**
* @author William Cui
* @description 宴会预定数据模型
* @date 2017-06-27
**/
import { observable, action } from 'mobx';
import { browserHistory } from 'react-router';
import { getJSON } from 'common/utils';
import { message } from 'antd';

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

class banquetListStore {
  @observable feedback; //操作结果反馈
  @observable thisclick; //切换哪一个被选中
  @observable datetime; //默认日期
  @observable BanquetOrderList; //宴会预订列表
  @observable bookingStatus;
  @observable flagt; //判断是否被选中
  @observable bookingID;
  @observable tableTypesList; //订单详情tableTypeslist
  @observable addProdsList; //订单详情addProdsList
  @observable mainInfoobj; //订单详情mainInfo主表
  @observable historyList; //修改历史list
  @observable costDetail; //
  @observable tradeRecords; //支付方式
  @observable addProds; //加菜清单
  @observable bookingobj; //收订金obj
  @observable tableNUMList; //收订金list
  @observable paysummoney; //收订金
  @observable CurDateList; //宴会桌态图已开台列表接口
  @observable banbookingID; //宴会桌态图bookingID
  @observable banbookingStatus; //宴会桌态图bookingStatus
  @observable SummaryInfoobj; //宴会桌态图预订单概要信息接口
  @observable openTime;
  @observable defaultValue;
  @observable bookingTime;

  //加菜====================
  @observable areaList; //餐厅区域
  @observable isSelectAll; //是否全部选中
  @observable selectDesk; //已选桌台
  @observable deskList; //对应区域的桌台
  @observable allDeskNumber; //所有桌台总数
  @observable orderInfo; //orderInfo

  constructor() {
    this.feedback = null;
    this.thisclick = 1;
    this.datetime = formatTime();
    this.BanquetOrderList = [];
    this.bookingStatus = 0;
    this.flagt = false;
    this.bookingID = '';
    this.tableTypesList = [];
    this.addProdsList = [];
    this.mainInfoobj = '';
    this.historyList = [];
    this.costDetail = '';
    this.tradeRecords = [];
    this.addProds = [];
    this.bookingobj = '';
    this.tableNUMList = [];
    this.paysummoney = 0;
    this.CurDateList = [];
    this.banbookingID = '';
    this.banbookingStatus = 0;
    this.SummaryInfoobj = '';
    this.openTime = '';

    this.areaList = [];
    this.isSelectAll = false;
    this.selectDesk = [];
    this.deskList = [];
    this.allDeskNumber = '';
    this.defaultValue = [];
    this.orderInfo = {
      bookingID: '', //宴会单号
      partyName: '', //宴会名称
      customerName: '', //客户姓名
      tableNum: '', //预订桌数
      backupNum: '', //备用桌数
      actuNum: '', //已开桌数
      openTime: '' //开席时间
    };
    this.bookingTime = '';
  }

  //设置切换类型
  @action
  setthisclick(obj) {
    this.thisclick = obj;
  }

  //查询宴会预订列表action
  @action
  queryBanquetOrderList({
    queryType = '',
    startTime = '',
    endTime = '',
    bookingStatus = '',
    queryContext = '',
    success
  }) {
    let _this = this;
    // console.log(queryType,startTime,endTime,bookingStatus,queryContext)
    getJSON({
      url: '/banquet/booking/queryBanquetOrderList.action',
      data: { queryType, startTime, endTime, bookingStatus, queryContext },
      success: function(json) {
        if (json.code === 0) {
          success && success();
          _this.BanquetOrderList = json.data.map((banquet, i) => {
            banquet.index = i;
            banquet.select = false;
            return banquet;
          });
          _this.bookingStatus = 0;
        } else {
          //  _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //勾选中
  @action
  checkedBanquetOrder(bookingID) {
    this.BanquetOrderList = this.BanquetOrderList.map(banquet => {
      banquet.selected = banquet.bookingID === bookingID;
      return banquet;
    });
  }

  //bookingStatus
  @action
  setStatus(bookingStatus) {
    this.bookingStatus = bookingStatus;
  }

  //判断有没有选中数据
  @action
  whetherchecked() {
    this.BanquetOrderList.map((banquet, index) => {
      //判断是否选中有数据
      if (banquet.selected === true) {
        this.flagt = true;
      }
      return banquet;
    });
  }

  //保存需要的隐藏值
  @action
  SaveHideValue(banquet) {
    this.bookingID = banquet.bookingID;
    this.bookingTime = banquet.bookingTime;
  }

  //获取订单详情action DeatilAction
  @action
  DeatilAction({ bookingID = '' }) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/detail.action',
      data: { bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.tableTypesList = json.data.tableTypes.map((tab, i) => {
            return tab;
          });

          _this.mainInfoobj = json.data.mainInfo;
          _this.costDetail = json.data.costDetail;
          _this.openTime = json.data.mainInfo.openTime.substring(10, 19);
          _this.tradeRecords = json.data.tradeRecords.map((tab, i) => {
            return tab;
          });

          _this.addProds = json.data.addProds.map((tab, i) => {
            return tab;
          });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //查询修改预订单记录接口
  @action
  editHistory({ bookingID = '' }) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/edit/history.action',
      data: { bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.historyList = json.data.map((his, i) => {
            return his;
          });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //预订待支付查询接口
  @action
  toPayBookingAmount({ bookingID = '' }) {
    let _this = this;
    getJSON({
      url: '/banquet/toPayBookingAmount.action',
      data: { bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.bookingobj = json.data.booking;
          _this.tableNUMList = json.data.tableTypes.map((his, i) => {
            return his;
          });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //调用订金支付接口
  @action
  banquetpay({
    orderNumber = '',
    orderMoney = '',
    paymentMethodID = '',
    authCode = '',
    applyPassword = '',
    cardID = '',
    success
  }) {
    let _this = this;
    getJSON({
      url: '/banquet/pay',
      data: {
        orderNumber,
        orderMoney,
        paymentMethodID,
        authCode,
        applyPassword,
        cardID
      },
      success: function(json) {
        if (json.code === 0) {
          success && success();
          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //确认订金已支付
  @action
  comfirmPay({ bookingID = '', amount = '', payMethod = '' }) {
    let _this = this;
    getJSON({
      url: '/banquet/comfirmPay.action',
      data: { bookingID, amount, payMethod },
      success: function(json) {
        if (json.code === 0) {
          _this.showFeedback({ status: 'success', msg: json.message });
          browserHistory.push('/banquet/records');
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //宴会桌态图已开台列表接口
  @action
  getCurDateOpenBookingList({ archiveID = '' }) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/getCurDateOpenBookingList.action',
      data: { archiveID },
      success: function(json) {
        if (json.code === 0) {
          _this.CurDateList = json.data.map((his, i) => {
            his.selected = false;
            return his;
          });
        } else {
          //  _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //保存需要的值
  @action
  saveCurValue(curdate) {
    this.banbookingID = curdate.bookingID;
    this.banbookingStatus = curdate.bookingStatus;
  }

  //勾选中
  @action
  checkedCurDateList(bookingID) {
    this.CurDateList = this.CurDateList.map(curdate => {
      curdate.selected = curdate.bookingID === bookingID;
      return curdate;
    });
  }

  //宴会桌态图预订单概要信息接口
  @action
  getBookingSummaryInfo({ bookingID = '' }) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/getBookingSummaryInfo.action',
      data: { bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.SummaryInfoobj = json.data;
          _this.orderInfo = {
            bookingID: json.data.bookingID, //宴会单号
            partyName: json.data.partyName, //宴会名称
            customerName: json.data.customerName, //客户姓名
            tableNum: json.data.tableNum, //预订桌数
            backupNum: json.data.backupNum, //备用桌数
            actuNum: json.data.actuNum, //已开桌数
            openTime: json.data.openTime //开席时间
          };
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //加菜 ==========================================================================
  //查询餐厅区域
  @action
  getBookingAreaList(bookingID) {
    let _this = this;
    getJSON({
      url: '/banquet/dish/getTableTypes',
      data: { bookingID: bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.areaList = [];
          _this.selectDesk = [];
          _this.areaList = json.data;
          _this.areaList.unshift({
            tableTypeName: '全部',
            typeID: ''
          });
          _this.getUsableBookingTableList(bookingID);
        } else if (json.code === 4) {
          _this.areaList = [];
          _this.selectDesk = [];
          _this.areaList.unshift({
            tableTypeName: '全部',
            typeID: ''
          });
          _this.getUsableBookingTableList(bookingID);
        } else {
          _this.areaList = [];
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //桌台选择全选
  @action
  allDeskClick(key) {
    this.isSelectAll = !this.isSelectAll;

    if (this.isSelectAll) {
      this.deskList = this.deskList.map((desk, index) => {
        desk.select = true;
        return desk;
      });
      if (key * 1 === 0) {
        this.selectDesk = [];
        this.selectDesk = this.deskList.map((desk, index) => {
          let { newcolumn, typeID, tableTypeName, deskname } = desk;
          return { newcolumn, typeID, tableTypeName, deskname };
        });
      } else {
        this.deskList.forEach((desk, index) => {
          let { newcolumn, typeID, tableTypeName, deskname } = desk;
          this.selectDesk.push({ newcolumn, typeID, tableTypeName, deskname });
        });
      }
    } else {
      this.deskList = this.deskList.map((desk, index) => {
        desk.select = false;
        return desk;
      });
      if (key * 1 === 0) {
        this.selectDesk = [];
      } else {
        let typeID = this.areaList[key].typeID;
        this.selectDesk = this.selectDesk.filter((desk, index) => {
          return desk.typeID !== typeID;
        });
      }
    }
  }

  //查询区域桌台
  @action
  getUsableBookingTableList(bookingID) {
    this.deskList = [];
    let _this = this;
    getJSON({
      url: '/banquet/dish/getAllTables',
      data: {
        bookingID: bookingID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.deskList = json.data.map((desk, index) => {
            desk.typeID = desk.tableTypeID;
            desk.tableTypeName = desk.tableName;
            desk.select = false;
            desk.newcolumn = desk.tableTypeID + '' + desk.tableName;
            desk.deskname = desk.tableName;
            _this.selectDesk.forEach((item, mindex) => {
              if (item.newcolumn === desk.newcolumn) {
                desk.select = true;
              }
            });
            return desk;
          });
          _this.allDeskNumber = _this.deskList.length;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //依据桌台类型展示桌台接口
  @action
  getTablesList(typeID, tableTypeName) {
    this.deskList = [];
    let _this = this;
    getJSON({
      url: '/banquet/dish/getTables',
      data: {
        typeID: typeID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.deskList = json.data.map((desk, index) => {
            desk.select = false;
            desk.typeID = desk.tableTypeID;
            desk.tableTypeName = desk.tableName;
            desk.newcolumn =
              desk.tableTypeID + '' + tableTypeName + desk.tableName;
            desk.deskname = tableTypeName + desk.tableName;
            _this.selectDesk.forEach((item, mindex) => {
              if (item.newcolumn === desk.newcolumn) {
                desk.select = true;
              }
            });
            return desk;
          });
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //桌台点击事件
  @action
  deskItemClick(desk) {
    let { newcolumn, typeID, tableTypeName, deskname } = desk;
    let select = !desk.select;

    this.deskList = this.deskList.map((desk, index) => {
      if (desk.newcolumn === newcolumn) {
        desk.select = select;
      }
      return desk;
    });

    if (select) {
      this.selectDesk.push({ newcolumn, typeID, tableTypeName, deskname });
    } else {
      this.selectDesk = this.selectDesk.filter((desk, index) => {
        return desk.newcolumn !== newcolumn;
      });
    }

    let arrDesk = this.deskList.filter((desk, index) => {
      return desk.select === false;
    });

    if (arrDesk.length > 0) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  //清台
  @action
  clearTableInfo(bookingID) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/clearTableInfo.action',
      data: { bookingID: bookingID },
      success: function(json) {
        if (json.code === 0) {
          let archiveID; //档案ID
          if (sessionStorage.getItem('account')) {
            archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
          }
          _this.getCurDateOpenBookingList({ archiveID: archiveID }); //重新刷新桌台
          _this.SummaryInfoobj = ''; //清空右边
          _this.showFeedback({ status: 'success', msg: json.message });
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

export default new banquetListStore();
