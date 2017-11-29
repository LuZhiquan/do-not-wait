/**
* @author William Cui
* @description 打印小票模型
* @date 2017-06-12
**/

import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { message } from 'antd';

class SmallTicketStore {
  @observable printlist; //数据list
  @observable printobj; //数据对象
  @observable printhistoryobj; //数据查看对象
  @observable printhistorylist; //数据查看list
  @observable feedback; //操作结果反馈
  @observable subOrderID; //保存传过来的subOrderID
  constructor() {
    this.printlist = [];
    this.printhistorylist = [];
    this.feedback = null;
    this.printobj = '';
    this.printhistoryobj = '';
    this.subOrderID = '';
  }

  //重打小票列表
  @action
  getPrintListBySubOrder({ subOrderID = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/print/getPrintListBySubOrder',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.printobj = json.data;
          _this.printlist = json.data.dataList.map((print, i) => {
            return print;
          });
        } else if (json.code === 4) {
          _this.printlist = [];
        } else {
          _this.printlist = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //重打小票
  @action
  getreprint({ recordIDs = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/print/reprint',
      data: { recordIDs },
      success: function(json) {
        if (json.code === 0) {
          _this.getPrintListBySubOrder({ subOrderID: _this.subOrderID });
          _this.showFeedback({ status: 'success', msg: '重打成功' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //重打详情
  @action
  getPrintHistory({ recordID = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/print/getPrintHistory',
      data: { recordID },
      success: function(json) {
        if (json.code === 0) {
          _this.printhistoryobj = json.data;
          _this.printhistorylist = json.data.dataList.map((print, i) => {
            return print;
          });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //保存subOrderID
  @action
  savesubOrderID(subOrderID) {
    this.subOrderID = subOrderID;
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

export default new SmallTicketStore();
