/**
* @author William Cui
* @description 时价维护数据模型
* @date 2017-06-05
**/

import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { message } from 'antd';

class PriceMaintenanceStore {
  @observable commodityclassifyList; //商品分类的list
  @observable feedback; //操作结果反馈

  @observable querylist; //时间维护列表查询
  @observable curbSaleList; //全部保存按钮取参数
  @observable signb; //是否有数据改动没有保存的标记
  @observable inputIndex;
  @observable suminput; //页面总共个有几个input框
  @observable saveshop; //保存商品分类子分类
  @observable lastcombination;

  constructor() {
    this.feedback = null;

    this.commodityclassifyList = [];

    this.querylist = [];
    this.curbSaleList = [];
    this.lastcombination = {
      lastid: '0',
      lastname: '',
      lastkey: '0',
      twoleveid: ''
    };

    this.signb = 0; //默认是没有数据被修改的
    this.inputIndex = 0;
    this.suminput = 0;
    this.saveshop = '0';
  }

  //时间维护列表查询
  @action
  getquery({ categoryID = '0', searchKey = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/adjustprice/query',
      data: { categoryID, searchKey },
      success: function(json) {
        if (json.code === 0) {
          _this.suminput = 0;
          _this.querylist = json.data.map(msgobj => {
            msgobj.changevalue = false;
            msgobj.emptyvalue = false;
            _this.suminput++;
            msgobj.child = msgobj.child.map(msg => {
              _this.suminput++;
              msg.changevalue = false;
              msg.emptyvalue = false;
              return msg;
            });
            return msgobj;
          });
        } else if (json.code === 4) {
          _this.querylist = [];
        } else {
          _this.querylist = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //加载商品分类列表
  @action
  getcommodityclassify() {
    let _this = this;
    getJSON({
      url: '/reception/curbsale/getCategoryListForCommon.action',
      success: function(json) {
        if (json.code === 0) {
          _this.commodityclassifyList = json.data.map(commodity => {
            commodity.children.map(child => {
              if (child.categoryID === _this.saveshop) {
                child.selected = true;
              } else {
                child.selected = false;
              }

              return child;
            });
            return commodity;
          });

          //手动追加【全部】分类
          _this.commodityclassifyList.unshift({
            categoryID: '0',
            categoryName: '全部',
            children: [
              {
                categoryID: '0',
                categoryName: '全部',
                selected: false
              }
            ]
          });
        } else {
          _this.commodityclassifyList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //全部保存
  @action
  adjustpricepriceAdjustment(merchantMenuList, success) {
    let _this = this;
    let requireData = { merchantMenuList: JSON.stringify(merchantMenuList) };
    getJSON({
      url: '/reception/adjustprice/priceAdjustment.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          success && success(true);
          _this.showFeedback({ status: 'success', msg: json.message });
          _this.curbSaleList = []; //成功之后清空之前的传送参数
          _this.querylist = [];
          _this.signb = 0; //说明已经没有要保存的数据了
          _this.getquery({ categoryID: _this.lastcombination.lastid });
        } else {
          success && success(false);
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //选择商品分类
  @action
  selectcommodityclassify = classifyID => {
    this.commodityclassifyList = this.commodityclassifyList.map(commodity => {
      commodity.children.map(child => {
        if (child.categoryID === classifyID) {
          child.selected = !child.selected;
        } else {
          child.selected = false;
        }
        return child;
      });
      return commodity;
    });
  };

  @action
  savelastcombination(lastid, lastname, lastkey) {
    this.lastcombination = {
      lastid: lastid,
      lastname: lastname,
      lastkey: lastkey
    };
  }

  //加一
  @action
  savejia() {
    this.inputIndex += 1;
  }

  @action
  saveshao() {
    this.inputIndex -= 1;
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

export default new PriceMaintenanceStore();
