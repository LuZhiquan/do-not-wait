/**
* @author William Cui
* @description 消息中心数据模型
* @date 2017-5-18
**/

import { observable, action } from 'mobx';
import { browserHistory } from 'react-router';
import { getJSON } from '../common/utils';
import { message } from 'antd';

class MessageStore {
  @observable messageCountList; //左边列表
  @observable messageList; //右边列表
  @observable settingID; //存储id
  @observable roleList; //选择人员左边列表
  @observable personList; //选择人员右边列表
  @observable saveroleID; //选择人员的id一级
  @observable saveloginID; //选择人员的id二级
  @observable savemessageID; //messageID
  @observable feedback; //操作结果反馈
  @observable clickbutton; //未处理的还是全部消息
  @observable Takeeffect; //判断是否生效

  constructor() {
    this.messageCountList = [];
    this.messageList = [];
    this.roleList = [];
    this.personList = [];

    this.settingID = 0;
    this.saveroleID = 0;
    this.saveloginID = '';
    this.savemessageID = '';
    this.feedback = null;
    this.clickbutton = 0; //默认是未处理的
    this.Takeeffect = '';
  }

  //获取消息列表
  @action
  getMessageList(settingID, showType) {
    let _this = this;
    let requireData = { settingID: settingID, showType: showType };
    getJSON({
      url: '/reception/message/getMessageList',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.messageCountList = json.data.messageCountList.messageCountList.map(
            (msg, i) => {
              return msg;
            }
          );
          _this.messageList = json.data.messageList.map((msg, i) => {
            msg.index = i;
            return msg;
          });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //设置id值
  @action
  settingIDing(settingID) {
    this.settingID = settingID;
  }

  //设置id值
  @action
  savesaveroleIDing(roleID) {
    this.saveroleID = roleID;
  }

  //设置id值
  @action
  savemessageIDing(msgid) {
    this.savemessageID = msgid;
  }

  //设置id值
  @action
  saveclickbutton(clickid) {
    this.clickbutton = clickid;
  }
  //获取消息列表
  @action
  getTransferPersonList() {
    let _this = this;
    getJSON({
      url: '/reception/message/getTransferPersonList',
      success: function(json) {
        if (json.code === 0) {
          _this.roleList = json.data.roleList.map((role, i) => {
            return role;
          });
          _this.personList = json.data.personList.map((person, i) => {
            person.selected = false;
            return person;
          });
        } else {
        }
      }
    });
  }

  //获取消息列表二级
  @action
  getTransferPersonListByRoleID(roleID, searchContent) {
    let _this = this;
    let requireData;
    if (searchContent === '') {
      requireData = { roleID: roleID };
    } else {
      requireData = { roleID: roleID, searchContent: searchContent };
    }
    getJSON({
      url: '/reception/message/getTransferPersonListByRoleID',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.personList = json.data.personList.map((person, i) => {
            person.selected = false;
            return person;
          });
        } else {
        }
      }
    });
  }

  //勾选中
  @action
  checkedPersonList(loginID) {
    this.saveloginID = loginID;
    this.personList = this.personList.map(person => {
      console.log(person.loginID === loginID);
      person.selected = person.loginID === loginID;
      return person;
    });
  }

  //实现消息转发
  @action
  gettransferMessage(sMSID, targetID) {
    let _this = this;
    let requireData = { sMSID: sMSID, targetID: targetID };
    getJSON({
      url: '/reception/message/transferMessage',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.getMessageList(_this.settingID, _this.clickbutton);
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //修改状态
  @action
  getupdateMessage(sMSID, businessStatus) {
    let _this = this;
    let requireData = { sMSID: sMSID, businessStatus: businessStatus };
    getJSON({
      url: '/reception/message/updateMessage',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.showFeedback({ status: 'success', msg: json.message });
          _this.getMessageList(_this.settingID, _this.clickbutton);
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //判断是否生效跳转到沽清前还是后
  @action
  getTakeeffect() {
    let _this = this;
    getJSON({
      url: '/reception/curbsale/isReachBusinessHours.action',
      success: function(json) {
        if (json.code === 0) {
          _this.Takeeffect = json.data.isReachBusinessHours;
        }
      }
    });
  }

  //(收银机 特殊业务接口)消息跳转根据子订单ID获得桌台状态
  @action
  getOrderStatus({ subOrderID = '' }) {
    getJSON({
      url: '/reception/message/getOrderStatus',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0) {
          browserHistory.push(
            '/order/' + json.data.orderCode + '/' + json.data.orderStatus + ''
          ); //打开订单界面
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

export default new MessageStore();
