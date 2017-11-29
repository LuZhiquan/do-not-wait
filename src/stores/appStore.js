/**
* @author William Cui
* @description 系统账户等公用数据模型
* @date 2017-03-27
**/

import { observable, action } from 'mobx';
import { browserHistory } from 'react-router';
import { getJSON, getNowTime } from 'common/utils';
import { message } from 'antd';

message.config({
  top: 300
});

function feedback(msg) {
  return {
    status: 'error',
    title: '提示',
    isOneFooter: true,
    conText: msg
  };
}

class AppStore {
  @observable mealName; //餐次名称

  @observable showDayEnd; //是否日结
  @observable showOpenClass; //是否开班

  @observable messageCount; //未读消息数量
  @observable messageList; //未读消息列表
  @observable newTime; //消息更新时间

  @observable feedback; //操作结果反馈
  @observable ifopenclass; //判断是否关闭开班的弹窗

  constructor() {
    this.mealName = '';

    this.showDayEnd = false;
    this.showOpenClass = false;

    this.messageCount = 0;
    this.messageList = [];
    this.newTime = 0;

    this.feedback = null;
    this.ifopenclass = true;
  }
  
  //登录
  @action
  login = account => {
    getJSON({
      url: '/reception/login.action',
      data: account,
      success: function(json) {
        if (json.code === 0) {
          //如果账号是admin角色，并且没有配置权限或者权限不完整，则前端手动给配置所有权限
          if (
            json.data.roleName === 'admin' &&
            (!json.data.permissionList || json.data.permissionList.length < 74)
          ) {
            json.data.permissionList = [
              'TableOperation:Original',
              'TableOperation:ChangeTable',
              'TableOperation:AddTable',
              'TableOperation:ModifyOrder',
              'TableOperation:Joint',
              'TableOperation:Sabotage',
              'TableOperation:Clear',
              'TableOperation:CancelTable',
              'TableOperation:Repair',
              'TableOperation:Recovery',
              'Order:QueryOrder',
              'Order:Reprint',
              'ReservationModule:QueryReservation',
              'ReservationModule:AddReservation',
              'ReservationModule:ModifyReservation',
              'ReservationModule:CancelReservation',
              'DinnerParty:QueryDinnerParty',
              'DinnerParty:DinnerPartyOpenTable',
              'DinnerParty:AddDinnerParty',
              'DinnerParty:ModifyDinnerParty',
              'DinnerParty:CancelDinnerParty',
              'DinnerParty:Deposit',
              'DinnerParty:Discountonvegetables',
              'DinnerParty:Adjustmentexpenses',
              'TableManager:QueryTableManager',
              'TableManager:AddManager',
              'TableManager:Adjustservicecontent',
              'TableManager:RemoveManager',
              'MessageCenter:QueryMessage',
              'MessageCenter:Handle',
              'MessageCenter:Forward',
              'OtherModule:Pricemaintenance',
              'OtherModule:CancelStopSale',
              'OtherModule:Reprintsmallticket',
              'OtherModule:StopSale',
              'UserPrivilege:Discount',
              'SellClearModule:AddCount',
              'SellClearModule:ReduceCount',
              'SellClearModule:MakingNewspaperLoss',
              'SellClearModule:GuQing',
              'SellClearModule:Queryput',
              'DiscountModule:PrivilegeFold',
              'DiscountModule:FullSingleFold',
              'DiscountModule:SingleProductDiscount',
              'DiscountModule:FreeServiceCharge',
              'DiscountModule:Reduction',
              'DiscountModule:FreeSingle',
              'DiscountModule:AdjustCommodityDiscount',
              'DiscountModule:Membershipdiscount',
              'OrderModule:PresenteDish',
              'OrderModule:Retreatfood',
              'OrderModule:ProvisionalChange',
              'OrderModule:ModifyWeighing',
              'OrderModule:Order',
              'OrderModule:Turndish',
              'OrderModule:Donation',
              'OrderModule:Coupon',
              'MemberModule:ChangePassword',
              'MemberModule:ReSetPassword',
              'MemberModule:Frozen',
              'MemberModule:Cancellation',
              'MemberModule:QueryMember',
              'MemberModule:Addmembers',
              'MemberModule:Thaw',
              'MemberModule:Recharge',
              'MemberModule:QueryRecharge',
              'MemberModule:Reprint',
              'MemberModule:SupplementaryInvoice',
              'CheckoutModule:CancellationOfSuspense',
              'CheckoutModule:lationOFSuspense',
              'CheckoutModule:Checkout',
              'CheckoutModule:Drawabill',
              'CheckoutModule:offeracourse',
              'CheckoutModule:Shift',
              'CheckoutModule:Endofday'
            ];
          }

          let account = json.data;
          let path;
          switch (account.businessPattern) {
            case 1239: //快餐-点菜模式
              path = '/dishes-cashier';
              break;
            case 1332: //快餐-自选模式
              path = '/cashier';
              break;
            default:
              //正餐
              path = '/dine';
          }
          sessionStorage.setItem('account', JSON.stringify(account));
          browserHistory.push(path);
        } else {
          message.destroy();
          message.error(json.message);
        }
      }
    });
  };

  //获取餐次信息
  @action
  getMealName = areaID => {
    let _this = this;
    getJSON({
      url: '/reception/table/getMealName',
      data: { areaID: 0 },
      success: function(json) {
        if (json.code === 0) {
          _this.mealName = json.data.mealName;
        }
      }
    });
  };

  //退出
  @action
  logout = () => {
    sessionStorage.clear();
    window.location.assign('/config');
    getJSON({
      url: '/reception/logout.action',
      success: function(json) {
        if (json.code === 0) {
        }
      }
    });
  };

  /***************** 收银机状态相关 action ********************/

  //验证上一个营业日是否日结
  @action
  checkBeforeDailyWorking = ({ failure, success }) => {
    let _this = this;
    getJSON({
      url: '/reception/connect/checkBeforeDailyWorking',
      success: function(json) {
        if (json.code === 0) {
          success && success();
        } else {
          //获取数据失败反馈
          failure && failure();
          _this.showDayEnd = true;
        }
      }
    });
  };

  //验证当前时间是否处于开班状态
  @action
  isInWorking = ({ failure, success }) => {
    let _this = this;
    getJSON({
      url: '/reception/connect/isInWorking',
      success: function(json) {
        if (json.code === 0) {
          success && success();
        } else {
          failure && failure();
          _this.showOpenClass = true;
        }
      }
    });
  };

  /***************** 收银机状态相关 action ********************/

  //获取消息
  @action
  getMessage = () => {
    if (!sessionStorage.getItem('account')) return false;
    let _this = this;
    getJSON({
      url: '/reception/message/getNewMessageList',
      data: { newTime: this.newTime || getNowTime() },
      success: function(json) {
        if (json.code === 0) {
          let { messageList, newTime, count } = json.data;
          if (messageList && messageList.length) {
            _this.messageCount = count;
            _this.messageList = messageList;
            _this.newTime = newTime;
            setTimeout(() => {
              _this.messageList = [];
            }, 1000 * 3);
          }
        }
      }
    });
  };

  //结账前验证是否存在等叫商品和未称重商品
  @action
  validateSettlement = ({ type, subOrderID, success, failure }) => {
    getJSON({
      url: '/reception/payment/validateProduct',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          //没有未处理的菜品,成功通过
          success && success();
        } else {
          let content = json.message;
          let productNameList = [];
          if (json.resultList && json.resultList.length) {
            productNameList = json.resultList.map(product => {
              let optionName = product.optionName
                ? '(' + product.optionName + ')'
                : '';
              return product.productName + optionName;
            });
          }

          let operationName = type === 'temporarily' ? '暂结' : '结账';
          if (json.code === 503) {
            //503表示存在未称重
            content = `<div>${json.belongTableName}桌台存在以下商品未称重,不能${operationName}!</div>`;
          } else if (json.code === 504) {
            //504表示存在等叫
            content = `<div>${json.belongTableName}桌台存在以下商品等叫中,不能${operationName}!</div>`;
          }
          content += '<div>' + productNameList.join('、') + '</div>';
          failure && failure({ feedback: feedback(content) });
        }
      }
    });
  };

  /***************** 暂结，结账相关 action ********************/

  //改变日结状态
  @action
  hideDayEnd = () => {
    this.showDayEnd = false;
  };

  //改变开班状态
  @action
  hideOpenClass = () => {
    this.showOpenClass = false;
  };

  //删除当前消息列表
  @action
  clearMessageList = () => {
    this.messageList = [];
  };

  //关闭操作反馈信息
  @action
  closeFeedback = () => {
    this.feedback = null;
  };
}

export default new AppStore();
