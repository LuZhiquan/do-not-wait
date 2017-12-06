/**
* @author William Cui
* @description 桌台数据模型
* @date 2017-03-27
**/

import { observable, action } from 'mobx';
import { browserHistory } from 'react-router';
import { message } from 'antd';

import { getJSON } from 'common/utils';

function feedback(msg) {
  return {
    status: 'error',
    title: '提示',
    isOneFooter: true,
    conText: msg
  };
}

let latestListAction = null;

class DineStore {
  @observable targetView; //目标桌台视图 默认为false原始桌台视图
  @observable tableWindow; //右侧桌台信息窗口标志
  //combineTable,splitTable,shareTable
  //base,openTable,cancelTable,addTable01,addTable02,transferTable,
  @observable currentAreaID; //当前区域ID
  @observable currentStatus; //当前筛选状态
  @observable searchKey; //搜索桌台名

  @observable areaList; //区域列表

  @observable autoScroll; //是否需要滚动
  @observable tableList; //桌台列表
  @observable selectedTableList; //选中桌台列表
  @observable relationTableList; //关联桌台列表
  @observable targetTableList; //目标桌台列表
  @observable occupiedTableList; //被占用桌台列表
  @observable currentTableList; //当前操作的桌台

  @observable statusList; //状态列表

  @observable waiterList; //服务员列表
  @observable operateWaiter; //操作服务员

  @observable multipleSelected; //多选，默认为false单选
  @observable areAllTableSelected; //全选，默认为false
  @observable feedback; //操作结果反馈

  @observable untreatedDishesList; //未处理菜品列表
  @observable mealList; //餐次列表
  @observable cancelTableReasonList; //消台原因列表

  constructor() {
    this.targetView = false;
    this.tableWindow = 'base';
    this.currentAreaID = '0';
    this.currentStatus = '0';
    this.searchKey = '';

    this.areaList = [];

    this.autoScroll = false;
    this.tableList = [];
    this.selectedTableList = [];
    this.relationTableList = [];
    this.targetTableList = [];
    this.occupiedTableList = [];
    this.currentTableList = [];

    this.statusList = {};
    this.waiterList = [];
    this.operateWaiter = {
      loginID: '',
      userName: ''
    };

    this.multipleSelected = false;
    this.areAllTableSelected = false;
    this.feedback = null;

    this.untreatedDishesList = [];
    this.mealList = [];
    this.cancelTableReasonList = [];
  }

  /***************** 桌台显示列表相关 action ********************/

  //获取区域列表
  @action
  getAreaList = ({ bookingID }) => {
    let _this = this;
    // getJSON({
    //   url: '/reception/table/home.action',
    //   success: function(json) {
    const data = Array(20).fill(0).map((item, index) => {
      return { areaID: 'area' + index, areaName: '区域' + index }
    });
    const json = {code: 0, msg: 'ok', data}
    if (json.code === 0) {
      _this.areaList = json.data;
      if (bookingID) {
        _this.bookingOpenTableView({ bookingID }); //如果有bookingID，那么就是预订开台
        _this.resetOperateWaiter(); //重置操作服务员
      } else {
        _this.getTableListByStatus({}); //默认显示全部状态桌台
      }
    } else {
      //获取数据失败反馈
      _this.areaList = [];
      _this.currentAreaID = '';
      _this.statusList = {};
      _this.currentStatus = '';
      _this.showFeedback({ status: 'warn', msg: json.message });
    }
  // }
  // });
};

//根据区域ID获取桌台列表
@action
getTableList = ({ areaID, searchKey }) => {
  let _this = this;
  // getJSON({
  //   url: '/reception/table/getTableListByStatus.action',
  //   data: {
  //     areaID: areaID || this.currentAreaID,
  //     searchKey: searchKey || null,
  //     status: 0
  //   },
  //   success: function(json) {
  const data = Array(100).fill(0).map((item, index) => {
    return {
      orderID: index,
      tableStatus: 607,
      tableName: '桌台' + (index+1),
      tableID: 'table' + index,
      subOrderID: null,
      bookingID: null,
      customerNumber: 0,
      defaultPerson: 10,
      areaType: 851,
      price: 79,
      times: 60,
    }
  });
  const json = { code: 0, msg: 'ok', data }

  if (json.code === 0) {
    let statusList = {
      '0': json.data.length,
      '607': 0,
      '827': 0,
      '652': 0,
      '728': 0,
      '606': 0,
      '609': 0,
      '610': 0
    };

    json.data.forEach(table => {
      statusList[table.tableStatus] += 1;
    }); //统计桌台状态数量
    _this.statusList = statusList;

    //选中记住的桌台
    let selectedTableList;
    if (_this.currentTableList.length) {
      selectedTableList = _this.currentTableList;
    } else if (sessionStorage.getItem('selectedTableList')) {
      selectedTableList = JSON.parse(
        sessionStorage.getItem('selectedTableList')
      );
    }

    let currentStatus = Number(_this.currentStatus);
    if (!selectedTableList) _this.tableList = []; //触发桌台图自动滚动到顶部
    _this.tableList = json.data.filter(table => {
      return !currentStatus || currentStatus === table.tableStatus;
    }); //筛选选中状态的桌台

    //清空操作桌台
    _this.currentTableList = [];
    sessionStorage.removeItem('selectedTableList');

    if (selectedTableList && selectedTableList.length) {
      _this.autoScroll = true;

      let isShareTable =
        selectedTableList[0] && selectedTableList[0].isShareTable;
      if (isShareTable) {
        _this.tableList.forEach(table => {
          if (table.subOrderID === selectedTableList[0].subOrderID) {
            _this.getSelectedTable({
              tableID: table.tableID,
              subOrderID: table.subOrderID,
              tableStatus: table.tableStatus
            });
          }
        });
      } else {
        _this.tableList.forEach(table => {
          if (
            table.tableID === selectedTableList[0].tableID &&
            (!table.shareTableName ||
              table.tableName === table.shareTableName)
          ) {
            _this.getSelectedTable({
              tableID: table.tableID,
              subOrderID: table.subOrderID,
              tableStatus: table.tableStatus
            });
          }
        });
      }
    }
  } else {
    _this.tableList = [];
    _this.showFeedback({ status: 'warn', msg: json.message });
  }
  //   }
  // });
};

//根据状态筛选餐桌列表
@action
getTableListByStatus = ({ areaID, status }) => {
  this.searchKey = '';
  this.clearStore(); //清空桌台操作数据
  if (areaID) this.currentAreaID = areaID;
  if (status) this.currentStatus = status;
  if (
    (this.currentAreaID !== '0' && this.currentStatus === '607') ||
    this.currentStatus === '609' ||
    this.currentStatus === '610'
  ) {
    this.multipleSelected = true; //空闲，脏台和维修状态可以多选
  } else {
    this.multipleSelected = false; //其他都不可以多选
  }
  this.getTableList({ areaID: this.currentAreaID || '0' });

  //记住当前获取桌台列表操作
  latestListAction = {
    action: this.getTableListByStatus,
    params: { areaID, status }
  };
};

//根据桌台名称，搜索桌台列表
@action
getTableListBySearchKey = ({ searchKey }) => {
  this.searchKey = searchKey;
  this.clearStore(); //清空桌台操作数据

  this.getTableList({ searchKey });

  //记住当前获取桌台列表操作
  latestListAction = {
    action: this.getTableListBySearchKey,
    params: { searchKey }
  };
};

//获取筛选桌台列表
@action
getFilterTables = ({
    type,
  areaID = '0',
  status = '0',
  searchKey,
  bookingID,
  success
  }) => {
  if (searchKey) {
    this.searchKey = searchKey;
  } else {
    this.searchKey = '';
  }

  let url, data;

  if (this.selectedTableList[0])
    data = { tableID: this.selectedTableList[0].tableID };
  if (bookingID) data = { bookingID };
  if (type === 'canExchange') data = { areaID: '0', status: 607 };
  if (searchKey) data.searchKey = searchKey;

  switch (type) {
    case 'canTransfer':
      url = '/reception/table/getCanTransferTables'; //可转桌台列表接口
      break;
    case 'canCombine':
      url = '/reception/table/getCanCombineTables'; //可联桌台列表接口
      break;
    case 'canSplit':
      url = '/reception/table/getCanSplitTables'; //拆台桌台列表接口
      break;
    case 'canCancel':
      url = '/reception/table/getCanEliminateTables';
      break;
    case 'booking':
      url = '/reception/table/queryBookingTableList'; //预订桌台列表接口
      break;
    case 'canExchange':
      url = '/reception/table/getTableListByStatus.action'; //可换桌台列表接口
      break;
    default:
      url = '/reception/table/getCanAddTables'; //可加桌台列表接口
  }

  let _this = this;
  getJSON({
    url,
    data,
    success: function (json) {
      if (json.code === 0) {
        let tableList;
        if (bookingID) {
          tableList = json.data.tableList;
        } else {
          tableList = json.data;
        }

        _this.currentAreaID = areaID; //设置当前区域
        let currentAreaID = Number(_this.currentAreaID);
        tableList = tableList.filter(table => {
          return !currentAreaID || currentAreaID === table.areaID;
        }); //筛选选中区域的桌台

        let statusList;
        switch (type) {
          case 'canTransfer':
            statusList = {
              '0': tableList.length,
              '607': 0,
              '827': 0,
              '652': 0
            }; //可转桌台状态
            break;
          case 'canCombine':
          case 'canSplit':
            statusList = { '0': tableList.length, '827': 0, '652': 0 }; //可拆桌台状态
            break;
          case 'booking':
            _this.tableList = json.data.tableList.map(table => {
              table.duration = json.data.duration;
              table.peopleNum = json.data.peopleNum;
              if (table.tableStatus === 606) table.selected = true;
              return table;
            });

            _this.targetTableList = json.data.tableList.filter(table => {
              return table.tableStatus === 606;
            });
            _this.selectedTableList.push(_this.targetTableList[0]);
            statusList = {};
            break;
          default:
            statusList = {}; //可联桌台状态按钮
        }
        tableList.forEach(table => {
          if (statusList) {
            statusList[table.tableStatus] += 1;
          }
        }); //统计桌台状态数量
        _this.statusList = statusList;
        _this.currentStatus = status; //设置当前状态

        let currentStatus = Number(_this.currentStatus);

        _this.tableList = []; //触发桌态图滚动条自动滚回顶部
        _this.tableList = tableList.filter(table => {
          _this.targetTableList.forEach(targetTable => {
            if (table.tableID === targetTable.tableID) table.selected = true;
          });
          return !currentStatus || currentStatus === table.tableStatus;
        }); //筛选选中状态的桌台
        success && success();
      } else if (json.code === 4) {
        _this.tableList = [];
      } else {
        _this.tableList = [];
        _this.showFeedback({ status: 'warn', msg: json.message });
      }
    }
  });
};

/***************** 桌台显示列表相关 action ********************/

/***************** 桌台选择相关 action ********************/

//选中桌台获取桌台信息
@action
getSelectedTable = ({ tableID, tableStatus, subOrderID, bookingID }) => {
  // console.log('tableID, subOrderID: ',tableID, subOrderID);
  if (bookingID && tableStatus !== 606) {
    this.showFeedback({ status: 'warn', msg: '不能选择被占用桌台开台，您可以选择换台' });
    return;
  }

  let requireData = { tableID, tableStatus };
  if (subOrderID) requireData.subOrderID = subOrderID;

  let _this = this;
  getJSON({
    url: '/reception/table/getShowTable',
    data: requireData,
    success: function (json) {
      if (json.code === 0) {
        let tempTableList = _this.targetView
          ? _this.targetTableList
          : _this.selectedTableList;

        let selectedTable = json.data;
        if (
          selectedTable.shareTableName &&
          selectedTable.tableName !== selectedTable.shareTableName
        ) {
          selectedTable.isShareTable = true;
        }
        if (_this.multipleSelected) {
          //多选
          let flag = true;
          tempTableList.forEach(table => {
            if (table.tableID === tableID) flag = false;
          });
          if (flag) tempTableList[tempTableList.length] = selectedTable;
        } else {
          //单选
          tempTableList[0] = selectedTable;
        }

        if (!_this.targetView) {
          //原始桌台视图下，如果有关联桌台赋值relationTableList列表,
          _this.relationTableList =
            selectedTable.combineTableInfoList &&
              selectedTable.combineTableInfoList.length
              ? selectedTable.combineTableInfoList
              : [];
        }

        //更新桌台选中状态
        _this.tableList = _this.tableList.map(table => {
          if (_this.multipleSelected) {
            if (subOrderID) {
              if (
                table.tableID === tableID &&
                table.subOrderID === subOrderID
              )
                table.selected = true;
            } else {
              if (table.tableID === tableID) table.selected = true;
            }
          } else {
            if (subOrderID) {
              table.selected =
                table.tableID === tableID && table.subOrderID === subOrderID;
            } else {
              table.selected = table.tableID === tableID;
            }
          }
          return table;
        });
      } else {
        _this.relationTableList = [];
        _this.showFeedback({ status: 'warn', msg: json.message });
      }
    }
  });
};

//删除选择桌台
@action
delSelectedTable = tableID => {
  let tempTableList = this.targetView
    ? this.targetTableList
    : this.selectedTableList;
  tempTableList = tempTableList.filter(table => {
    return table.tableID !== tableID;
  });
  if (this.targetView) this.targetTableList = tempTableList;
  else this.selectedTableList = tempTableList;

  //更新桌台选中状态
  this.tableList = this.tableList.map(table => {
    if (table.tableID === tableID) table.selected = false;
    return table;
  });
};

//全选桌台
@action
selectAllTables = () => {
  //只有在多选模式下才可以全选
  if (this.multipleSelected) {
    this.areAllTableSelected = !this.areAllTableSelected;
    this.tableList = this.tableList.map(table => {
      table.selected = this.areAllTableSelected;
      return table;
    });
  }
};

/***************** 桌台选择相关 action ********************/

/***************** 桌台视图相关 action ********************/

//清除视图状态
@action
clearStore = () => {
  this.targetView = false;
  this.tableWindow = 'base';

  this.selectedTableList = [];
  this.relationTableList = [];
  this.targetTableList = [];

  this.waiterList = [];
  this.operateWaiter = {
    loginID: '',
    userName: ''
  };

  this.multipleSelected = false;
  this.areAllTableSelected = false;
  this.feedback = null;
};

//返回缓存状态
@action
returnCache = () => {
  let dineCache = JSON.parse(sessionStorage.dineStore);
  Object.keys(dineCache).forEach(key => {
    this[key] = dineCache[key];
  });
  sessionStorage.removeItem('dineStore');
};

//保存当前状态到缓存sessionStorage
@action
saveCache = () => {
  sessionStorage.setItem('dineStore', JSON.stringify(this));
};

//显示操作反馈信息
@action
showFeedback({ status, msg }) {
  message.destroy();
  this.feedback = { status, msg };
}

//关闭桌台操作反馈信息
@action
closeFeedback = () => {
  this.feedback = null;
};

//改变桌台信息窗口视图
@action
changeTableWindow(operateWindow) {
  this.tableWindow = operateWindow;
}

//刷新桌台视图
@action
refreshView() {
  if (latestListAction) {
    let params = latestListAction.params;
    latestListAction.action(params);
  } else {
    this.getAreaList({});
  }
}

/***************** 桌台视图相关 action ********************/

/***************** 开台相关 action ********************/

//开台
@action
openTable = ({ validation, complete, checkDayEnd }) => {
  let tableIDs = [];
  let numbers = [];
  this.selectedTableList.forEach(table => {
    table.tableID && tableIDs.push(table.tableID);
    table.customerNumber && numbers.push(table.customerNumber);
  });
  if (tableIDs.length === numbers.length) {
    let openTableData = {
      'tableIDs[]': tableIDs,
      'customerNumbers[]': numbers
    };
    //如果选择了操作服务员就追加loginID
    if (this.operateWaiter.loginID)
      openTableData.loginID = this.operateWaiter.loginID;
    let _this = this;
    getJSON({
      url: '/reception/table/openTable.action',
      data: openTableData,
      success: function (json) {
        //保存当前操作桌台
        _this.currentTableList = _this.selectedTableList;
        if (json.code === 0) {
          //开台成功回调
          if (complete) {
            complete({
              tableID: _this.selectedTableList[0].tableID,
              subOrderID: json.data
            });
          } else {
            //刷新桌台视图
            _this.refreshView();
            //设置开台成功反馈
            _this.showFeedback({ status: 'success', msg: '开台成功!' });
          }
        } else if (json.code === 215) {
          //没有餐次
          _this.getMealList({ areaID: _this.selectedTableList[0].areaID }); //获取餐次列表
        } else {
          //开台失败反馈
          _this.feedback = feedback(json.message);
        }
      }
    });
  } else {
    validation && validation();
  }
};

//输入用餐人数
@action
enterCustomerNumber = (tableID, customerNumber) => {
  let enterTables = this.targetView
    ? this.targetTableList
    : this.selectedTableList;
  enterTables.map(table => {
    if (table.tableID === tableID) table.customerNumber = customerNumber;
    return table;
  });
};

//加载操作人列表
@action
getWaiterList = (nameOrID = null) => {
  let _this = this;
  let requireData = {};
  if (nameOrID) requireData.nameOrID = nameOrID;
  getJSON({
    url: '/reception/table/getOriginalList.action',
    data: requireData,
    success: function (json) {
      if (json.code === 0) {
        _this.waiterList = json.data.map(waiter => {
          waiter.selected = false;
          return waiter;
        });
      } else {
        _this.waiterList = [];
        // _this.showFeedback({status: 'warn', msg: json.message});
      }
    }
  });
};

//选择操作服务员
@action
selectOperateWaiter = loginID => {
  this.waiterList = this.waiterList.map(waiter => {
    waiter.selected = waiter.loginID === loginID;
    return waiter;
  });
};

//更改操作服务员
@action
changeOperateWaiter = (loginID, userName) => {
  this.operateWaiter = {
    loginID: loginID,
    userName: userName
  };
};

//重置操作服务员
@action
resetOperateWaiter = () => {
  this.operateWaiter = {
    loginID: '',
    userName: this.userName
  };
};

//获取餐次列表
@action
getMealList = ({ areaID }) => {
  let _this = this;
  //获取餐次列表
  getJSON({
    url: '/reception/table/getMealsInfoList',
    data: { areaID },
    success: function (json) {
      if (json.code === 0) {
        _this.mealList = json.data;
      } else if (json.code === 4) {
        _this.showFeedback({ status: 'warn', msg: '没有找到餐次数据' });
      } else {
        //获取餐次失败反馈
        _this.showFeedback({ status: 'warn', msg: json.message });
      }
    }
  });
};

//关闭选择餐次弹窗
@action
clearMealList = () => {
  this.mealList = [];
};

/***************** 开台相关 action ********************/

/***************** 预订相关 action ********************/

//切换到预订开台视图
@action
bookingOpenTableView = ({ bookingID }) => {
  // this.saveCache();
  this.tableList = [];
  this.selectedTableList = [];
  this.currentTableList = this.selectedTableList;

  this.targetView = true; //切换为目标视图
  this.tableWindow = 'bookingOpenTable';

  if (bookingID) {
    this.getFilterTables({ type: 'booking', bookingID }); //筛选出所有该客户预订的桌台
  } else {
    this.currentAreaID = String(this.selectedTableList[0].areaID);
  }
  this.multipleSelected = true;
};

//预订开台
@action
bookingOpenTable = ({ complete, validation, checkDayEnd, failure }) => {
  let tableIDs = [];
  let customerNumbers = [];
  let loginID;
  let bookingID = this.targetTableList[0].bookingID;
  this.targetTableList.forEach(table => {
    table.tableID && tableIDs.push(table.tableID);
    table.customerNumber && customerNumbers.push(table.customerNumber);
  });
  if (tableIDs.length === customerNumbers.length) {
    //如果选择了操作服务员就追加loginID
    if (this.operateWaiter.loginID) loginID = this.operateWaiter.loginID;
    let requireData = {
      bookingID,
      'tableIDs[]': tableIDs,
      'customerNumbers[]': customerNumbers
    };
    if (loginID) requireData.loginID = loginID;

    let _this = this;
    getJSON({
      url: '/reception/table/bookingOpenTable',
      data: requireData,
      success: function (json) {
        //保存当前操作桌台
        _this.selectedTableList[0].tableID = tableIDs[0];
        _this.currentTableList = _this.selectedTableList;
        _this.currentAreaID = String(_this.currentTableList[0].areaID) || '0';
        _this.currentStatus = '0';
        if (json.code === 0) {
          browserHistory.replace('/dine');
          if (complete) {
            _this.selectedTableList[0].subOrderID = Number(json.data); //设置选中桌台的subOrderID
            complete({
              tableID: _this.selectedTableList[0].tableID,
              subOrderID: json.data
            }); //预订开台成功回调
          } else {
            _this.currentTableList[0].subOrderID = Number(json.data); //设置选中桌台的subOrderID
            _this.refreshView(); //刷新桌台视图
            _this.showFeedback({ status: 'success', msg: '预订开台成功！' }); //预订开台成功反馈
          }
        } else if (json.code === -1) {
          let data = JSON.parse(json.message);
          failure && failure(data);
        } else {
          //预订开台失败反馈
          _this.feedback = feedback(json.message);
        }
      }
    });
  } else {
    validation && validation();
  }
};

//切换到预订换台视图
@action
bookingExchangeTableView = () => {
  this.saveCache();

  this.targetView = true; //切换为目标视图
  this.tableWindow = 'bookingExchangeTable';
  if (this.selectedTableList.length && this.selectedTableList[0]) {
    this.currentAreaID = String(this.selectedTableList[0].areaID);
  }
  this.occupiedTableList = this.tableList.filter(table => {
    return table.tableStatus !== 606;
  });
  this.targetTableList = [];
  this.getFilterTables({ type: 'canExchange' }); //筛选出可换桌台
  this.statusList = {}; //清空筛选条件
  this.multipleSelected = true;
};

//查询被占用桌台的菜品数量
@action
turnTableProductList({ bookingID, tableIDs, handleTurnTable }) {
  let _this = this;
  getJSON({
    url: '/reception/table/turnTableProductList',
    data: { bookingID, 'tableIDs[]': tableIDs },
    success: function (json) {
      if (json.code === 0) {
        var occupiedTable = {},
          turnTableFlag = false;
        json.data.forEach(table => {
          if (table.quantity) turnTableFlag = true;
          occupiedTable[table.tableID] = table.quantity;
        });
        _this.occupiedTableList = _this.occupiedTableList.map(
          (table, index) => {
            if (occupiedTable[table.tableID])
              table.dishesQuantity = occupiedTable[table.tableID];
            if (_this.targetTableList[index]) {
              table.targetTableName =
                '转' + _this.targetTableList[index].tableName;
              table.targetTableID = _this.targetTableList[index].tableID;
            }
            return table;
          }
        );
        if (turnTableFlag) {
          //需要换台
          handleTurnTable();
        } else {
          _this.tableList = [];
          let mainTableIDs = [],
            viceTableIDs = [];
          _this.occupiedTableList.forEach((table, index) => {
            let viceTableID = _this.targetTableList[index]
              ? _this.targetTableList[index].tableID
              : -1;
            mainTableIDs.push(table.tableID);
            viceTableIDs.push(viceTableID);
          });
          _this.turnTable({
            bookingID: _this.occupiedTableList[0].bookingID,
            mainTableIDs,
            viceTableIDs
          });
        }
      } else {
        //查询失败反馈
        _this.showFeedback({ status: 'warn', msg: json.message });
      }
    }
  });
}

//预订换台
@action
turnTable({ bookingID, mainTableIDs, viceTableIDs }) {
  let _this = this;
  let chooseTableIDs = [];
  this.targetTableList.forEach((table, index) => {
    chooseTableIDs.push(table.tableID);
  });
  getJSON({
    url: '/reception/table/turnTable',
    data: {
      bookingID,
      'mainTableIDs[]': mainTableIDs,
      'viceTableIDs[]': viceTableIDs,
      'chooseTableIDs[]': chooseTableIDs
    },
    success: function (json) {
      if (json.code === 0) {
        //回到预订开台视图
        _this.bookingOpenTableView({ bookingID });
      } else {
        //换台失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
}

//取消预订
@action
cancelBooking({ bookingID, memo, refundAmount }) {
  let _this = this;
  getJSON({
    url: '/order/reserve/cancelBooking.action',
    data: { bookingID, memo, refundAmount },
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //取消预订成功反馈
        _this.showFeedback({ status: 'success', msg: '取消预订成功!' });
      } else {
        //取消预订失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
}

//预订换菜
@action
setExchangeTable({ tableID, targetTableName, targetTableID }) {
  this.occupiedTableList = this.occupiedTableList.map(table => {
    if (table.tableID === tableID) {
      table.targetTableID = targetTableID;
      table.targetTableName = targetTableName;
    }
    return table;
  });
}

/***************** 预订相关 action ********************/

/***************** 加台相关 action ********************/

//切换到加台视图
@action
addTableView = () => {
  this.saveCache();

  this.getFilterTables({ type: 'canAdd' }); //获取全部空闲桌台
  this.targetView = true; //切换为目标视图
  this.statusList = {}; //清空筛选条件
  this.tableWindow = 'addTable01';
  this.multipleSelected = true;
};

//加台
@action
addTable = ({ validation, complete, checkDayEnd }) => {
  let tableIDs = [];
  let numbers = [];
  this.targetTableList.forEach((table, index) => {
    table.tableID && tableIDs.push(table.tableID);
    table.customerNumber && numbers.push(table.customerNumber);
  });
  if (tableIDs.length === numbers.length) {
    let addTableData = {
      mainTableID: this.selectedTableList[0].tableID,
      'viceTableIDs[]': tableIDs,
      'customerNumbers[]': numbers
    };
    //如果选择了操作服务员就追加loginID
    if (this.operateWaiter.loginID)
      addTableData.loginID = this.operateWaiter.loginID;
    let _this = this;
    getJSON({
      url: '/reception/table/addTable.action',
      data: addTableData,
      success: function (json) {
        _this.currentTableList = _this.selectedTableList; //保存当前操作桌台
        if (json.code === 0) {
          if (complete) {
            complete({
              tableID: _this.targetTableList[0].tableID,
              subOrderID: json.data
            }); //加台成功回调
          } else {
            _this.refreshView(); //刷新桌台视图
            _this.showFeedback({ status: 'success', msg: '加台成功!' }); //设置加台成功反馈
          }
        } else {
          _this.feedback = feedback(json.message); //加台失败反馈
        }
      }
    });
  } else {
    validation && validation();
  }
};

/***************** 加台相关 action ********************/

/***************** 消台相关 action ********************/

//切换到批量消台视图
@action
cancelTableView = () => {
  this.saveCache();

  this.getFilterTables({
    type: 'canCancel'
  }); //筛选出关联桌台

  this.targetView = true; //切换为目标视图
  this.tableWindow = 'cancelTable';
  this.relationTableList = [];
  this.targetTableList[0] = this.selectedTableList[0];
  this.multipleSelected = true;
};

//获取消台原因
@action
getCancelTableReasonList = () => {
  let _this = this;
  getJSON({
    url: '/reception/table/getEliminateTableReason',
    success: function (json) {
      if (json.code === 0) {
        _this.cancelTableReasonList = json.data;
      } else {
        //获取失败反馈
        _this.showFeedback({ status: 'warn', msg: json.message });
      }
    }
  });
};

//消台
@action
cancelTable = (cancelTableData, success) => {
  let _this = this;
  getJSON({
    url: '/reception/table/eliminateTable',
    data: cancelTableData,
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        success && success();
        //刷新桌台视图
        _this.refreshView();
        //设置消台成功反馈
        _this.showFeedback({ status: 'success', msg: '消台成功!' });
      } else {
        //消台失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

/***************** 消台相关 action ********************/

/***************** 转台相关 action ********************/

//切换到转台视图
@action
transferTableView = () => {
  this.saveCache();

  this.getFilterTables({ type: 'canTransfer' }); //筛选出可转桌台
  this.targetView = true; //切换为目标视图
  this.tableWindow = 'transferTable';
};

//转台
@action
transferTable = transferTableData => {
  let _this = this;
  getJSON({
    url: '/reception/table/transferTable',
    data: transferTableData,
    success: function (json) {
      if (json.code === 0) {
        _this.currentTableList = _this.targetTableList; //保存当前操作桌台
        _this.currentTableList[0].subOrderID = Number(json.data);

        latestListAction.params = {
          areaID: String(_this.currentTableList[0].areaID),
          status: String(_this.selectedTableList[0].subTableStatus)
        }; //设置返回的区域和状态

        //刷新桌台视图
        _this.refreshView();
        //设置转台成功反馈
        _this.showFeedback({ status: 'success', msg: '转台成功!' });
      } else {
        _this.currentTableList = _this.selectedTableList; //保存当前操作桌台
        //转台失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

/***************** 转台相关 action ********************/

/***************** 联台相关 action ********************/

//切换到联台视图
@action
combineTableView = () => {
  this.saveCache();

  this.getFilterTables({ type: 'canCombine' }); //筛选出可联桌台
  this.targetView = true; //切换为目标视图
  this.tableWindow = 'combineTable';
  this.multipleSelected = true;
};

//联台
@action
combineTable = combineTableData => {
  let _this = this;
  getJSON({
    url: '/reception/table/combineTables',
    data: combineTableData,
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //设置联台成功反馈
        _this.showFeedback({ status: 'success', msg: '联台成功!' });
      } else {
        //联台失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

/***************** 联台相关 action ********************/

/***************** 拆台相关 action ********************/

//切换到拆台视图
@action
splitTableView = ({ status }) => {
  this.saveCache();

  this.getFilterTables({
    type: 'canSplit'
  }); //筛选出关联桌台

  this.targetView = true; //切换为目标视图
  this.tableWindow = 'splitTable';

  this.relationTableList = [];
  this.targetTableList[0] = this.selectedTableList[0];
  this.multipleSelected = true;
};

//拆台
@action
splitTable = () => {
  let _this = this;
  getJSON({
    url: '/reception/table/splitTables',
    data: {
      targetTableIDs: this.targetTableList.map(table => {
        return table.tableID;
      })
    },
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //设置拆台成功反馈
        _this.showFeedback({ status: 'success', msg: '拆台成功!' });
      } else {
        //拆台失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

/***************** 拆台相关 action ********************/

/***************** 拼台相关 action ********************/

//拼台
@action
shareTable = ({ customerNumber, validation, complete, checkDayEnd }) => {
  if (customerNumber) {
    let shareTableData = {
      tableID: this.selectedTableList[0].tableID,
      customerNumber: customerNumber
    };
    //如果选择了操作服务员就追加loginID
    if (this.operateWaiter.loginID)
      shareTableData.loginID = this.operateWaiter.loginID;
    let _this = this;
    getJSON({
      url: '/reception/table/shareTable',
      data: shareTableData,
      success: function (json) {
        //保存当前操作桌台
        _this.currentTableList = _this.selectedTableList;
        if (json.code === 0) {
          //拼台成功回调
          if (complete) {
            complete({
              tableID: _this.selectedTableList[0].tableID,
              subOrderID: json.data
            });
            _this.selectedTableList[0].subOrderID = Number(json.data); //设置选中桌台的subOrderID
            _this.selectedTableList[0].isShareTable = true;
          } else {
            _this.currentTableList[0].subOrderID = Number(json.data); //设置选中桌台的subOrderID
            _this.currentTableList[0].isShareTable = true;
            //刷新桌台视图
            _this.refreshView();
            //设置拼台成功反馈
            _this.showFeedback({ status: 'success', msg: '拼台成功!' });
          }
        } else {
          //拼台失败反馈
          _this.feedback = feedback(json.message);
        }
      }
    });
  } else {
    validation && validation();
  }
};

/***************** 拼台相关 action ********************/

/***************** 清台相关 action ********************/

//清台
@action
clearTable = tableIDs => {
  let _this = this;
  getJSON({
    url: '/reception/table/clearTableBatch',
    data: { tableIDs },
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //设置清台成功反馈
        _this.showFeedback({ status: 'success', msg: '清台成功!' });
      } else {
        //清台失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

/***************** 清台相关 action ********************/

/***************** 暂结,结账相关 action ********************/

//暂结
@action
temporarily = ({ subOrderID }) => {
  let _this = this;

  getJSON({
    url: '/reception/payment/temporarily',
    data: { subOrderID },
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //设置暂结成功反馈
        _this.showFeedback({ status: 'success', msg: '暂结成功!' });
      } else {
        //暂结失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

//取消暂结
@action
cancelTemporarily = ({ subOrderID }) => {
  let _this = this;
  getJSON({
    url: '/reception/payment/cancelTemporarily',
    data: { subOrderID },
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //设置暂结成功反馈
        _this.showFeedback({ status: 'success', msg: '取消暂结成功!' });
      } else {
        //暂结失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

/*****************  维修，恢复相关 action ********************/

//维修桌台
@action
repairTable = () => {
  let _this = this;

  getJSON({
    url: '/reception/table/repairTable',
    data: {
      tableIDs: this.selectedTableList.map(table => {
        return table.tableID;
      })
    },
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //设置维修成功反馈
        _this.showFeedback({ status: 'success', msg: '维修成功!' });
      } else {
        //设置维修失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

//恢复桌台
@action
recoverTable = () => {
  let _this = this;

  getJSON({
    url: '/reception/table/recoverTable',
    data: {
      tableIDs: this.selectedTableList.map(table => {
        return table.tableID;
      })
    },
    success: function (json) {
      //保存当前操作桌台
      _this.currentTableList = _this.selectedTableList;
      if (json.code === 0) {
        //刷新桌台视图
        _this.refreshView();
        //设置恢复成功反馈
        _this.showFeedback({ status: 'success', msg: '恢复成功!' });
      } else {
        //恢复失败反馈
        _this.feedback = feedback(json.message);
      }
    }
  });
};

/*****************  维修，恢复相关 action ********************/

//清除视图数据
@action
clearView() {
  this.tableWindow = 'base';
  this.tableList = [];
  this.relationTableList = [];
  this.statusList = {};
}

//清除提示信息
@action
clearFeedback() {
  this.feedback = null;
}

//取消自动滚动到选中桌台位置
@action
disabledAutoScroll() {
  this.autoScroll = false;
}
}

export default new DineStore();
