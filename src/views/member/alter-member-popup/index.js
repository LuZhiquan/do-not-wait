/**
 * @author gaomeng
 * @description 修改会员弹框
 */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import CalendarPopup from 'components/calendar-popup';
import SelectWaiterPopup from '../select-waiter-popup';
import classnames from 'classnames';

import { Modal, Alert } from 'antd';
import './alert_member.less';

@inject('memberStore') @observer
class AlertMembberPopup extends Component {

  constructor(props) {
    super(props);

    this.state = {
      calendarPopup: '',
      countermanPopup: '',
      genderIndex: this.props.memberStore.genderIndex,
      passportIndex: this.props.memberStore.passportIndex
    }

    this.props.memberStore.getMemberAlterMessage();
    this.props.memberStore.isHasPhone = false;
  }

  handleCancel = () => {
    this.props.memberStore.initialize();
    this.props.memberStore.cancelAlterClick();
    if (this.props.cancelClick) {
      this.props.cancelClick();
    }
  }
  handleOk = () => {
    this.props.memberStore.submitAlterMember();
    if (this.props.okClick) {
      this.props.okClick();
    }
  }

  render() {

    let memberStore = this.props.memberStore;

    let gender = ['男', '女'];
    let passportType = ['身份证', '工作证', '军人证', '其他'];

    let type;
    if (memberStore.memberInfo.cardType === 864) {
      type = '电子卡';
    } else {
      type = '实物卡';
    }

    let cardBlock;
    if (memberStore.memberInfo.cardType === 865) {
      cardBlock = <div className='cardBlock'>
        <div className='item-normal'>
          <div className='item-name'><i>*</i>卡号</div>
          <div className='item-content'><input type='text' value={memberStore.memberInfo.cardSerial} placeholder='请输入卡号' readOnly className='lg-input' />

          </div>
        </div>
        <div className='item-normal'>
          <div className='item-name'><i>*</i>芯片号</div>
          <div className='item-content'><input type='text' value={memberStore.memberInfo.chipCode} readOnly placeholder='请输入芯片号' className='lg-input' />
          </div>
        </div>
      </div>
    }
    let hasPhoneAlert;
    if (memberStore.isHasPhone) {
      hasPhoneAlert = <Alert message='该手机号已绑定会员卡' banner closable onClose={() => {
        memberStore.hasPhoneClose();
      }} />
    }

    return (
      <div>
        <Modal title='修改会员' visible={true} maskClosable={false} closable={false}
          onOk={this.handleOk} onCancel={this.handleCancel} okText='确定' cancelText='取消'
          width={920} wrapClassName='member-alter-popup-modal'
        >
          <div className='member-alter-popup'>

            <div className='main-top-left'>
              <div className='item-normal'>
                <div className='item-name'><i>*</i>姓名</div>
                <div className='item-content'>
                  <input type='text' value={memberStore.memberInfo.memberName} placeholder='请输入姓名' className='lg-input' onChange={(e) => {

                    if (e.target.value.length <= 15) {
                      memberStore.memberNameChange(e.target.value);
                    }

                  }} />
                  <span>{memberStore.errorText.nameError}</span>
                </div>
              </div>
              <div className='item-normal'>
                <div className='item-name'><i>*</i>手机</div>
                <div className='item-content'><input type='text' value={memberStore.memberInfo.mobile} placeholder='请输入手机号' className='lg-input' onChange={(e) => {
                  memberStore.mobileChange(e.target.value);
                }} />
                  <span>{memberStore.errorText.mobileError}</span>
                </div>
              </div>
              <div className='item-btns'>
                <div className='item-name'>性别</div>
                <div className='item-content'>
                  {gender.map((gender, index) => {
                    return <input key={index} type='button' value={gender} className={classnames({
                      'sm-btn': true,
                      'btn-active': index === memberStore.genderIndex
                    })} onClick={() => {

                      switch (index) {
                        case 0:
                          memberStore.genderIndex = 0;
                          memberStore.genderClick(2);
                          break;
                        case 1:
                          memberStore.genderIndex = 1;
                          memberStore.genderClick(3);
                          break;
                        default:
                          break;
                      }
                      this.setState({ genderIndex: index });
                    }} />
                  })}
                </div>
              </div>
            </div>
            <div className='item-img'>
              <div className='item-name'>头像</div>
              <div className='item-content'>
                <i className='iconfont icon-huiyuandangan_icon_user-'></i>
              </div>
            </div>
            <div className='item-btns'>
              <div className='item-name'>类型</div>
              <div className='item-content'>
                {<input type='button' value={type} className={classnames({
                  'lg-btn': true,
                  'btn-active': true
                })} />}
              </div>
            </div>

            <div className='item-birthday'>
              <div className='item-name'>生日</div>
              <div className='item-content'>
                <input type='text' value={memberStore.memberInfo.birthday} className='input-birthday' readOnly onClick={() => {
                  this.setState({
                    calendarPopup: <CalendarPopup calendarModalOk={(time) => {
                      memberStore.calendarModalOk(time);
                      this.setState({ calendarPopup: '' });
                    }} calendarModalCancel={() => {
                      this.setState({ calendarPopup: '' });
                    }} />
                  });
                }} />
                <i className='iconfont icon-xinzenghuiyuan_icon_rili'></i>
              </div>
            </div>

            {cardBlock}

            <div className='item-btns item-dropdown'>
              <div className='item-name'>等级</div>
              <div className='item-content'>
                {<input type='button' value={memberStore.cardLevelName} readOnly className={classnames({
                  'lg-btn': true,
                  'btn-active': true
                })} />}
              </div>
            </div>
            <div className='item-normal'>
              <div className='item-name'>电子邮箱</div>
              <div className='item-content'>
                <input type='text' value={memberStore.memberInfo.email} placeholder='请输入电子邮箱' className='lg-input' onChange={(e) => {
                  memberStore.emailChange(e.target.value);
                }} />
                <span>{memberStore.errorText.emailError}</span>
              </div>
            </div>

            <div className='item-btns'>
              <div className='item-name'>证件类型</div>
              <div className='item-content'>
                {passportType.map((passport, index) => {
                  return <input key={index} type='button' value={passport} className={classnames({
                    'sm-btn': true,
                    'btn-active': index === memberStore.passportIndex
                  })} onClick={() => {
                    this.setState({ passportIndex: index });
                    switch (index) {
                      case 0:
                        memberStore.passportIndex = 0;
                        memberStore.passportTypeClick(224);
                        break;
                      case 1:
                        memberStore.passportIndex = 1;
                        memberStore.passportTypeClick(867);
                        break;
                      case 2:
                        memberStore.passportIndex = 2;
                        memberStore.passportTypeClick(866);
                        break;
                      case 3:
                        memberStore.passportIndex = 3;
                        memberStore.passportTypeClick(247);
                        break;
                      default:
                        break;
                    }
                  }} />
                })}
              </div>
            </div>

            <div className='item-normal'>
              <div className='item-name'>证件号码</div>
              <div className='item-content'>
                <input type='text' value={memberStore.memberInfo.passportNumber} placeholder='请输入证件号码' className='lg-input' onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    memberStore.passportNumberChange(e.target.value);
                  }
                }} />
              </div>
            </div>
            <div className='item-business'>
              <div className='item-name'>业务员</div>
              <div className='item-content'>
                <input type='text' value={memberStore.memberInfo.countermanName} className='input-business' readOnly onClick={() => {
                  this.setState({
                    countermanPopup: <SelectWaiterPopup cancelClick={() => {
                      this.setState({ countermanPopup: '' });
                    }} okClick={() => {
                      this.setState({ countermanPopup: '' });
                    }} />
                  });
                }} />
                <i className='iconfont icon-xinzenghuiyuan_icon_sousuo'></i>
              </div>
            </div>

            <div className='item-line'>
              <div className='item-name'>备注</div>
              <div className='item-content'><input type='text' className='xl-input' value={memberStore.memberInfo.memo} onChange={(e) => {
                if (e.target.value.length <= 100) {
                  memberStore.memoChange(e.target.value);
                }

              }} />
              </div>
            </div>
            {hasPhoneAlert}
          </div>
        </Modal>
        {this.state.countermanPopup}
        {this.state.calendarPopup}

      </div>
    );
  }
}
export default AlertMembberPopup;
