/**
* @author shelly
* @description 桌台负责人
* @date 2017-05-24
**/
import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { message } from 'antd';
message.config({
  top: 300,
  duration: 2
});
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
class ResponsibleStore {
  @observable addResponsible; //新增桌台负责人
  @observable adjustService; //调整服务内容
  @observable adjustReason; //调整原因
  @observable adjustHistory; //调整历史记录
  @observable choosePost; //选择岗位
  @observable currentdate; //获取当前日期
  @observable feedback; //操作结果反馈
  @observable currentAreaID; //当前区域ID
  @observable currentMealsID; //当前餐次ID
  @observable currenttableID; //当前桌台ID
  @observable tableList; //当前桌台列表，包含桌台中的负责人名称
  @observable currentStatus; //当前筛选状态
  @observable roleList; //岗位信息
  @observable savetypeid; //默认选中类型文本
  @observable tableID; //默认选中桌台
  @observable changePost; //更改岗位
  @observable serviceLis; //服务内容
  @observable currentService; //当前服务内容
  @observable reasonLis; //调整原因内容
  @observable currentReason; //当前调整原因内容
  @observable currentReasonID; //当前选中的调整原因内容
  @observable serviceLisSelect; //服务内容选中的
  @observable tableInfo; //右侧桌台信息块
  @observable TakeEffect; //点击查询时判断是否生效
  @observable allUsers; //新增桌台负责人时查询所有员工

  @observable rightNameInfo; //右边对应当前桌子的信息

  @observable userChooseID; //新增桌台负责人时选中员工列，一进去默认为-1
  @observable responsibleRightInfo; //新增桌台负责人右边对应的信息
  @observable addTableManagerInfo; //新增桌台负责人
  @observable addTableSuccessCode; //新增桌台负责人成功时的码

  @observable removeTableInfo; //移除桌台负责人
  @observable adjustTableManagerInfo; //调整桌台负责人服务内容
  @observable hasServiceContent; //已有的服务内容-调整桌台负责人
  @observable adjustHistoryLis; //查看历史记录信息
  @observable tablesNumOfArea; //根据桌台管理状态查询桌台负责人信息-全部的桌台数量
  @observable tablesNumOfNoManager; //根据桌台管理状态查询桌台负责人信息-无桌台负责人的桌台数量
  @observable tableManagerVOList; //根据桌台管理状态查询桌台负责人信息-返回的桌台负责人列表

  @observable firstCategoryID; //一级菜单ID
  @observable secondCategoryID; //二级菜单ID
  @observable areaList; //区域分类信息----一级菜单列表
  @observable mealsList; //餐次信息列表----二级菜单列表

  constructor() {
    this.addResponsible = false;
    this.adjustService = false;
    this.adjustReason = false;
    this.adjustHistory = false;
    this.choosePost = false;
    this.currentdate = formatTime(); //当前日期
    this.feedback = null;
    this.currentAreaID = '';
    this.currentMealsID = '';
    this.currenttableID = '';
    this.tableList = [];
    this.currentStatus = '';
    this.roleList = [];
    this.savetypeid = null;
    this.tableID = '0';
    this.changePost = {
      roleID: null,
      roleName: ''
    };
    this.serviceLis = [];
    this.currentService = [];
    this.reasonLis = [];
    this.currentReason = [];
    this.currentReasonID = '';
    this.serviceLisSelect = [];
    this.tableInfo = '';
    this.TakeEffect = '';
    this.allUsers = [];
    this.rightNameInfo = '';
    this.userChooseID = -1;
    this.responsibleRightInfo = {
      tableID: '',
      tableCode: '',
      tableName: '',
      dutyVOList: [
        {
          loginID: '',
          areaID: '',
          serviceAnswerTypeList: [],
          changeReason: '',
          dealDesc: ''
        }
      ]
    };
    this.addTableManagerInfo = {};
    this.addTableSuccessCode = '';
    this.addTableManagerInfo = {};
    this.removeTableInfo = {
      removeReasonID: '',
      removeReason: []
    };
    this.hasServiceContent = [];
    this.adjustHistoryLis = [];
    this.tablesNumOfArea = '';
    this.tablesNumOfNoManager = '';
    this.tableManagerVOList = [];

    this.firstCategoryID = '';
    this.secondCategoryID = '';
    this.areaList = [];
    this.mealsList = [];
  }

  /******************************查询区域分类信息*************************************************/
  // 获取一级区域
  @action
  getAreaMealsInfo(day) {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/queryAreaMealsInfo',
      success: function(json) {
        if (json.code === 0) {
          _this.areaList = json.data;
          _this.firstCategoryID = String(_this.areaList[0].areaID);
          //默认选中第一个一级分类
          if (_this.areaList.length) {
            _this.getMealsInfo(_this.firstCategoryID, day);
          } else {
            _this.mealsList = [];
            _this.tableList = [];
          }
        } else {
          //获取数据失败反馈
          _this.areaList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************查询区域分类信息*************************************************/

  /******************************查询区域对应的餐次信息*************************************************/
  // 获取二级菜单
  @action
  getMealsInfo(areaID, day) {
    let _this = this;
    _this.firstCategoryID = areaID;
    _this.areaList.forEach(area => {
      if (
        area.childList &&
        (area.areaID === parseFloat(areaID) || areaID === 'null')
      ) {
        _this.secondCategoryID =
          area.childList.length && String(area.childList[0].mealsID);
        _this.mealsList = area.childList;
      }
    });
    //默认选中第一个二级分类
    if (_this.mealsList.length)
      _this.getTableInfo(_this.secondCategoryID, areaID, day);
    _this.getManagerStatus(
      _this.firstCategoryID,
      _this.secondCategoryID,
      day,
      0,
      () => {}
    );
  }

  /******************************查询区域对应的餐次信息*************************************************/

  /******************************查询区域桌台信息*************************************************/
  @action
  getTableInfo(mealsID, areaID, day, searchValue) {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/queryAreaTableInfo',
      data: {
        mealsID: mealsID,
        dutyDay: day,
        areaID: areaID,
        searchContent: searchValue
      },
      success: function(json) {
        if (json.code === 0) {
          if (json.data) {
            _this.tableList = json.data.map(tables => {
              return tables;
            });
          } else {
            _this.tableList = [];
            message.info('未找到相关数据');
          }
        } else {
          //获取数据失败反馈
          _this.tableList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************查询区域桌台信息*************************************************/

  /******************************查询角色信息  即岗位选择*************************************************/
  @action
  getQueryRoleInfo() {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/queryRoleInfo',
      success: function(json) {
        if (json.code === 0) {
          _this.roleList = json.data;
          //手动追加【全部】选项
          _this.roleList.unshift({
            roleID: null,
            roleName: '全部'
          });
        } else {
          //获取数据失败反馈
          _this.roleList = [];
          _this.currentStatus = '';
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************查询角色信息==== 即岗位选择*************************************************/

  /******************************查询全部服务内容*************************************************/
  @action
  getQueryAllServiceItem() {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/queryAllServiceItem',
      success: function(json) {
        if (json.code === 0) {
          _this.serviceLis = json.data.map(service => {
            service.select = false;
            return service;
          });
        } else {
          //获取数据失败反馈
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************查询全部服务内容*************************************************/

  /******************************查询操作原因*************************************************/
  @action
  getQueryConfigReason(operationType) {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/queryConfigReason',
      //operationType=1-增加     operationType=2-修改     operationType=3-删除
      data: {
        operationType: operationType
      },
      success: function(json) {
        if (json.code === 0) {
          if (json.data)
            _this.reasonLis = json.data.map(reason => {
              reason.select = false;
              return reason;
            });
        } else {
          //获取数据失败反馈
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************查询操作原因*************************************************/

  /******************************新增桌台负责人时查询员工*************************************************/
  @action
  getQueryAllUsers(searchContent, roleID) {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/queryAllUsers',
      data: {
        searchContent: searchContent,
        roleID: roleID
      },
      success: function(json) {
        if (json.code === 0) {
          if (json.data) {
            _this.allUsers = json.data.map((user, index) => {
              user.chooseService = []; //选中服务内容
              user.chooseServiceID = []; //选中服务内容ID
              user.chooseReason = []; //选中调整原因
              user.chooseReasonID = []; //选中调整原因ID
              user.inputReason = ''; //输入的调整原因
              return user;
            });
          } else {
            _this.allUsers = [];
            message.info('未找到相关数据');
          }
        } else {
          //获取数据失败反馈
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************新增桌台负责人时查询员工*************************************************/
  /******************************新增桌台负责人*************************************************/
  @action
  getAddTableManagerInfo(addDate) {
    let _this = this;

    getJSON({
      url: '/reception/tableManager/addTableManagerInfo',
      data: { tableManagerVO: JSON.stringify(addDate) },
      success: function(json) {
        if (json.code === 0) {
          _this.addTableSuccessCode = json.code;
          _this.addTableManagerInfo = json.data;
          _this.getManagerStatus(
            _this.firstCategoryID,
            _this.secondCategoryID,
            _this.currentdate,
            0,
            () => {
              document.getElementById('selected-table').click();
            }
          );
          // 点击新增桌台负责人的确定按钮后，数据要清空
          _this.userChooseID = -1;
        } else {
          //获取数据失败反馈
          _this.userChooseID = -1;
          message.error(json.message);
        }
      }
    });
  }

  /******************************新增桌台负责人*************************************************/

  /******************************移除桌台负责人*************************************************/
  @action
  getRemoveTableManagerInfo(removeDate) {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/removeTableManagerInfo',
      data: { tableManagerVO: JSON.stringify(removeDate) },
      success: function(json) {
        if (json.code === 0) {
          _this.removeTableManagerInfo = json.data;
          //请求成功后清空数据
          _this.currentReasonID = '';
          _this.getManagerStatus(
            _this.firstCategoryID,
            _this.secondCategoryID,
            _this.currentdate,
            0,
            () => {
              document.getElementById('selected-table').click();
            }
          );
        } else {
          _this.currentReasonID = '';
          //获取数据失败反馈
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************移除桌台负责人*************************************************/

  /******************************调整桌台负责人的服务内容*************************************************/
  @action
  getAdjustServiceContent(adjustDate, adjustType) {
    let _this = this;
    // adjustType  1-应用当前负责桌台    2-应用所有负责桌台

    getJSON({
      url: '/reception/tableManager/adjustServiceContent',
      data: {
        tableManagerVO: JSON.stringify(adjustDate),
        adjustType: adjustType
      },
      success: function(json) {
        if (json.code === 0) {
          _this.adjustTableManagerInfo = json.data;
          //请求成功后清空数据
          _this.currentReasonID = '';
          _this.getManagerStatus(
            _this.firstCategoryID,
            _this.secondCategoryID,
            _this.currentdate,
            0,
            () => {
              document.getElementById('selected-table').click();
            }
          );
        } else {
          _this.currentReasonID = '';
          //获取数据失败反馈
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************调整桌台负责人的服务内容*************************************************/

  /******************************查看调整历史记录*************************************************/
  @action
  getTableChangeInfo(tableID, dutyDay) {
    let _this = this;
    getJSON({
      url: '/reception/tableManager/getTableChangeInfo',
      data: {
        tableID: tableID,
        dutyDay: dutyDay
      },
      success: function(json) {
        if (json.code === 0) {
          _this.adjustHistoryLis = json.data;
        } else {
          //获取数据失败反馈
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************查看调整历史记录*************************************************/

  /******************************根据桌台管理状态查询桌台负责人信息*************************************************/
  @action
  getManagerStatus(areaID, mealsID, dutyDay, status, callback) {
    let _this = this;
    // 0-显示全部；1-无桌台负责人
    getJSON({
      url: '/reception/tableManager/getTableManagerListByManagerStatus',
      data: {
        areaID: areaID,
        mealsID: mealsID,
        dutyDay: dutyDay,
        status: status
      },
      success: function(json) {
        if (json.code === 0) {
          _this.tablesNumOfArea = json.data.tablesNumOfArea;
          _this.tablesNumOfNoManager = json.data.tablesNumOfNoManager;
          _this.tableList = json.data.tableManagerVOList;
          callback();
          // document.getElementById("selected-table").click();
        } else {
          //获取数据失败反馈
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /******************************根据桌台管理状态查询桌台负责人信息*************************************************/

  /*******************************************弹窗显示相关***************************************/

  //显示调整服务弹窗
  @action
  getAdjustService() {
    this.adjustService = true;
  }

  //显示调整历史弹窗
  @action
  getAdjustHistory() {
    this.adjustHistory = true;
  }
  //显示选择岗位弹窗
  @action
  getChoosePost() {
    this.choosePost = true;
  }
  /*******************************************弹窗显示相关***************************************/

  /*******************************************弹窗关闭相关***************************************/

  //关闭调整服务弹窗
  @action
  closeAdjustService() {
    this.adjustService = false;
  }

  //关闭调整历史弹窗
  @action
  closeAdjustHistory() {
    this.adjustHistory = false;
  }
  //关闭选择岗位弹窗
  @action
  closeChoosePost() {
    this.choosePost = false;
  }
  /*******************************************弹窗关闭相关***************************************/

  //出页面时清空数据
  @action
  initialData() {
    this.tableID = '';
    this.savetypeid = null;
  }
  //更改岗位类型
  @action
  changePostOperate(roleID, roleName) {
    this.changePost = {
      roleID: roleID,
      roleName: roleName
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
}

export default new ResponsibleStore();
