/**
* @author Shelly
* @description 点菜模式收银数据模型
* @date 2017-07-03
**/

import { observable, action } from 'mobx';
import { getJSON } from 'common/utils';
import { message } from 'antd';

class DishesCashierStore {
  @observable orderType; //堂食还是外带---1235代表堂食，1236代表外带
  @observable orderID; //下单产生的orderID

  constructor() {
    this.orderType = 1236; //默认外带
    this.orderID = '';
  }

  /******************************* 接口相关************************************/
  /******	添加商品到订单（点菜下单）*******/
  @action
  getQuickOrder(
    orderType,
    shoppingCartAndPayAndDiscountInfo,
    orderDesc,
    password,
    callback
  ) {
    /*orderType=订单类型(即是外带还是堂食),shoppingCart=购物车数据,orderDesc=备注,orderID=订单ID(如果是下单orderID不填，如果是加菜orderID为必填)*/
    let _this = this;
    getJSON({
      url: '/quick/order/addQuickOrderAndPay.action',
      method: 'POST',
      data: {
        orderType: orderType,
        shoppingCartAndPayAndDiscountInfo: JSON.stringify(
          shoppingCartAndPayAndDiscountInfo
        ),
        orderDesc: orderDesc,
        memberApplyPassword: password
      },
      success: function(json) {
        if (json.code === 0 && json.data) {
          _this.orderID = json.data.orderID;
          callback();
        } else {
          message.info(json.message);
        }
      }
    });
  }
  /******	添加商品到订单（点菜下单）*******/

  /***********************Action相关***************************************** */

  //堂食还是外事
  @action
  changeOrderType(value) {
    this.orderType = value;
  }
  //清空orderID
  @action
  changeOrderID() {
    this.orderID = '';
  }
}

export default new DishesCashierStore();
