/**
* @author William Cui
* @description 签到数据模型
* @date 2017-06-05
**/

import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { message } from 'antd';

message.config({
  top: 300
});
class CheckInStore {
  @observable cardCode; //卡号

  constructor() {
    this.cardCode = '';
  }

  //手工输入清空
  @action
  handleClear() {
    this.cardCode = '';
  }
  //手工输入回退
  @action
  handleBack() {
    this.cardCode = this.cardCode.substring(0, this.cardCode.length - 1);
  }
  //手工点击数字
  @action
  handleClick(value) {
    if (this.cardCode.length < 30) {
      this.cardCode = this.cardCode.concat(value);
    }
  }

  //刷卡 onChange
  @action
  cardOnchange(value) {
    this.cardCode = value;
  }
  @action
  checkInClick() {
    let _this = this;
    getJSON({
      url: '/reception/sign/signIn',
      data: { employeeCode: _this.cardCode },
      success: function(json) {
        if (json.code === 0) {
          message.destroy();
          message.success(json.message, 1);
          _this.cardCode = '';
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  @action
  checkOutClick() {
    let _this = this;
    getJSON({
      url: '/reception/sign/signOut',
      data: { employeeCode: _this.cardCode },
      success: function(json) {
        if (json.code === 0) {
          message.destroy();
          message.success(json.message, 1);
          _this.cardCode = '';
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
}

export default new CheckInStore();
