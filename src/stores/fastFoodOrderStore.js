/**
* @author William Cui
* @description 宴会预定数据模型
* @date 2017-06-27
**/
import { observable, action } from 'mobx';
import { getJSON } from 'common/utils';
import { message } from 'antd';

class FastFoodOrderStore {
  @observable feedback; //操作结果反馈
  @observable OrderList;
  @observable orderId; //
  @observable isOptional;
  @observable flagt;
  @observable orderHeader;
  @observable fundDetailList; //收款纪录
  @observable orderDetailList; //菜品详情
  @observable returnQuickOrderList; //退款菜品详情
  @observable refundableSum; //可退数量
  @observable retreatSum; //退菜数量
  @observable retreatPrice; //退菜金额
  @observable revocationList; //退菜原因

  @observable detailID; //菜品明细编号
  @observable quantity; //数量
  @observable floatQuantity; //小数数量

  @observable reason; //选中的原因

  @observable needreason; //要传的原因

  @observable retreatfood; //退菜弹窗可不可以弹出来

  @observable saveactualAmount;
  @observable oderAmount;

  constructor() {
    this.feedback = null;

    this.OrderList = [];
    this.orderId = '';
    this.isOptional = 0;
    this.flagt = false;
    this.orderHeader = '';
    this.fundDetailList = [];
    this.orderDetailList = [];
    this.returnQuickOrderList = [];
    this.refundableSum = 0;
    this.retreatSum = 0;
    this.retreatPrice = 0;
    this.revocationList = [];
    this.detailID = [];
    this.quantity = [];
    this.floatQuantity = [];
    this.reason = '';
    this.needreason = '';
    this.retreatfood = false;
    this.saveactualAmount = '';
    this.oderAmount = 0;
  }

  //查询宴会预订列表action
  @action
  getQuickOrderInfoList({ mealsID = '', orderCode = '' }) {
    let _this = this;
    getJSON({
      url: '/quick/order/getQuickOrderInfoList.action',
      data: { mealsID, orderCode },
      success: function(json) {
        if (json.code === 0) {
          _this.OrderList = json.data.map((ord, i) => {
            ord.index = i;
            ord.selected = false;
            return ord;
          });
        } else {
          _this.OrderList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //勾选中
  @action
  checkedQuickOrder(orderId) {
    this.OrderList = this.OrderList.map(ord => {
      ord.selected = ord.orderId === orderId;
      return ord;
    });
  }

  //保存值
  @action
  saveValue(ord) {
    this.orderId = ord.orderId;
    this.isOptional = ord.isOptional;
    this.saveactualAmount = ord.actualAmount;
  }

  //查询餐订单详细订单头
  @action
  getQuickOrderHeader({ orderID = '' }) {
    let _this = this;
    getJSON({
      url: '/quick/order/getQuickOrderHeader.action',
      data: { orderID },
      success: function(json) {
        if (json.code === 0) {
          _this.orderHeader = json.data;
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //查询订单菜品详情
  @action
  getQuickOrderDetailInfo({ orderID = '' }) {
    let _this = this;
    getJSON({
      url: '/quick/order/getQuickOrderDetailInfo.action',
      data: { orderID },
      success: function(json) {
        if (json.code === 0) {
          _this.orderDetailList = json.data.map((ord, i) => {
            return ord;
          });
        } else {
          _this.orderDetailList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //查询订单支付明细
  @action
  getQuickFundChange({ orderID = '' }) {
    let _this = this;
    getJSON({
      url: '/quick/order/getQuickFundChange.action',
      data: { orderID },
      success: function(json) {
        if (json.code === 0) {
          _this.fundDetailList = json.data.map((sord, i) => {
            return sord;
          });
        } else {
          _this.fundDetailList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //6获取退款菜品详细
  @action
  getReturnQuickOrderDetail({ orderID = '' }) {
    let _this = this;
    getJSON({
      url: '/quick/order/getReturnQuickOrderDetail.action',
      data: { orderID },
      success: function(json) {
        if (json.code === 0) {
          _this.returnQuickOrderList = json.data.map((sord, i) => {
            sord.thisnum = 1;
            sord.index = i;
            sord.selected = false;
            sord.retreatprice = sord.price;
            _this.refundableSum += sord.quantity;
            _this.retreatSum += sord.thisnum;
            _this.retreatPrice += sord.retreatprice;
            return sord;
          });
        } else {
          _this.returnQuickOrderList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //减
  @action
  reduceValue(id) {
    this.returnQuickOrderList[id].thisnum =
      this.returnQuickOrderList[id].thisnum - 1;
    this.returnQuickOrderList[id].retreatprice =
      this.returnQuickOrderList[id].thisnum *
      this.returnQuickOrderList[id].price.toFixed(2);
    this.retreatSum = 0;
    this.retreatPrice = 0;
    this.returnQuickOrderList.forEach((sord, index) => {
      this.retreatSum += sord.thisnum;
      this.retreatPrice += sord.retreatprice;
    });
  }

  //加
  @action
  addValue(id) {
    this.returnQuickOrderList[id].thisnum =
      this.returnQuickOrderList[id].thisnum + 1;
    this.returnQuickOrderList[id].retreatprice =
      this.returnQuickOrderList[id].thisnum *
      this.returnQuickOrderList[id].price.toFixed(2);
    this.retreatSum = 0;
    this.retreatPrice = 0;
    this.returnQuickOrderList.forEach((sord, index) => {
      this.retreatSum += sord.thisnum;
      this.retreatPrice += sord.retreatprice;
    });
  }

  //选中和反选
  @action
  checkWhat(index) {
    this.returnQuickOrderList = this.returnQuickOrderList.map(ord => {
      ord.selected = ord.index === index;
      return ord;
    });
  }

  //退菜原因
  @action
  getRevocationFood() {
    let _this = this;
    getJSON({
      url: '/reception/product/getRevocationFood.action',
      success: function(json) {
        if (json.code === 0) {
          _this.revocationList = json.data.map((sord, i) => {
            sord.selected = false;
            return sord;
          });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //选中退菜原因
  @action
  checkedreason(reasonID) {
    this.revocationList = this.revocationList.map(ord => {
      ord.selected = ord.reasonID === reasonID;
      return ord;
    });
  }

  @action
  setreason(reason) {
    this.reason = reason;
  }

  //清空退菜原因
  @action
  emptyreason() {
    this.revocationList = this.revocationList.map(ord => {
      ord.selected = false;
      return ord;
    });
    this.reason = '';
  }

  //清除数据
  @action
  emptyValue() {
    this.refundableSum = 0;
    this.retreatSum = 0;
    this.retreatPrice = 0;
  }

  @action
  setneedarry() {
    this.detailID = [];
    this.quantity = [];
    this.floatQuantity = [];
    this.returnQuickOrderList.forEach((sord, index) => {
      if (sord.thisnum > 0) {
        this.detailID.push(sord.detailID);
        this.quantity.push(sord.thisnum);
        this.floatQuantity.push(0);
      }
    });
  }

  //批量退菜
  @action
  doReturnQuickOrder(
    detailIDs,
    quantitys,
    floatQuantitys,
    sumReturn,
    orderID,
    memo,
    success
  ) {
    let _this = this;
    let requireData = {
      detailIDs: detailIDs,
      quantitys: quantitys,
      floatQuantitys: floatQuantitys,
      sumReturn: sumReturn,
      orderID: orderID,
      memo: memo
    };
    getJSON({
      url: '/quick/order/doReturnQuickOrder.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.OrderList.map(ord => {
            ord.selected = false;
            return ord;
          });
          _this.emptyValue();
          _this.retreatfood = false;
          success && success();
          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //开发票
  @action
  orderOpenInvoice(orderID, invoiceInfo, success) {
    let _this = this;
    getJSON({
      url: '/quick/payment/invoice.action',
      data: { orderID: orderID, invoiceInfo: JSON.stringify(invoiceInfo) },
      success: function(json) {
        if (json.code === 0) {
          success && success();
          _this.getQuickOrderInfoList({ mealsID: '', orderCode: '' });
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

export default new FastFoodOrderStore();
