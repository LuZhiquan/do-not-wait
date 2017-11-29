/**
 * @author gaomeng
 * @description 添加会员弹框
 */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import CalendarPopup from 'components/calendar-popup';
import SelectWaiterPopup from '../select-waiter-popup';
import classnames from 'classnames';
import CardCode from '../card-code-popup';
import Loading from 'components/loading';

import { Modal, Menu, Dropdown, Icon, Alert } from 'antd';
import './add_member.less';

@inject('memberStore') @observer
class AddMembberPopup extends Component {

  constructor(props) {
    super(props);

    this.state = {
      calendarPopup: '',
      countermanPopup: '',
      genderIndex: 0,
      cardTypeIndex: 0,
      passportIndex: 0,
      cardcode: '',
      loading: ''
    }
  }


  componentDidMount() {
    this.props.memberStore.getCardLevels();
  }


  handleCancel = () => {
    if (this.props.cancelClick) {
      this.props.cancelClick();
    }
    this.props.memberStore.cancelClick();

  }
  handleOk = () => {

    let memberStore = this.props.memberStore;

    memberStore.submitMember((success) => {
      this.setState({ loading: <Loading /> });
      if (success) {

        setTimeout(() => {
          memberStore.isShowAddMember = false;
          memberStore.getMemberList(() => {
            if (memberStore.memberList && memberStore.memberList.length > 0) {
              memberStore.getMemberItem(memberStore.memberList[0].cardID);
              memberStore.currentMember = memberStore.memberList[0];
            }
          });
          this.setState({ loading: '' });
        }, 2000);

      } else {
        this.setState({ loading: '' });
      }
    });

    if (this.props.okClick) {
      this.props.okClick();
    }
  }

  componentWillMount() {
    let memberStore = this.props.memberStore;
    //初始化数据
    memberStore.initialize();
  }

  render() {

    let memberStore = this.props.memberStore;

    let menuBlock;
    if (memberStore.cardlevels) {
      menuBlock = memberStore.cardlevels.map((ele, index) => {
        return <Menu.Item key={index} >{ele.roleName}</Menu.Item>
      });
    }
    const menu = (
      <Menu id='add_member' onClick={(e) => {
        memberStore.menuClick(e.key);
      }}>
        {menuBlock}
      </Menu>
    );

    let gender = ['男', '女'];
    let cardType = ['电子卡', '实物卡'];
    let passportType = ['身份证', '工作证', '军人证', '其他'];

    let cardBlock;
    if (this.state.cardTypeIndex === 1) {
      cardBlock = <div className='cardBlock'>

        <div className='item-normal'>
          <div className='item-name'><i>*</i>芯片号</div>
          <div className='item-content'>
            <input
              type='text'
              value={memberStore.memberInfo.chipCode}
              placeholder='请输入芯片号'
              className='slg-input'
              readOnly
              onChange={(e) => {
                if (e.target.value.length <= 20) {
                  memberStore.chipCodeChange(e.target.value);
                }
              }}
            />
            <span>{memberStore.errorText.chipCodeError}</span>
          </div>
          <div className='get-card-code' onClick={() => {
            this.setState({
              cardcode: <CardCode handleCancel={() => {
                this.setState({ cardcode: '' });
              }} close={() => {
                this.setState({ cardcode: '' });
              }} />
            });
          }}>刷卡</div>
        </div>
        <div className='item-normal'>
          <div className='item-name'><i>*</i>卡号</div>
          <div className='item-content'>
            {memberStore.clockSerial ?
              <input
                type='text'
                value={memberStore.memberInfo.cardSerial}
                placeholder='请输入卡号'
                className='lg-input'
                readOnly
              /> :
              <input
                type='text'
                value={memberStore.memberInfo.cardSerial}
                placeholder='请输入卡号'
                className='lg-input'
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                    memberStore.cardSerialChange(e.target.value);
                  }
                }}
              />
            }

            <span>{memberStore.errorText.serialError}</span>
          </div>
        </div>
      </div>
    }
    let hasPhoneAlert;
    if (memberStore.isHasPhone) {
      hasPhoneAlert = <Alert
        message={memberStore.returnMessage}
        banner
        closable
        onClose={() => {
          memberStore.hasPhoneClose();
        }}
      />
    }

    let hasSerialAlert;
    if (memberStore.isHasSerial) {
      hasSerialAlert = <Alert
        message={memberStore.returnCardMessage}
        banner
        closable
        onClose={() => {
          memberStore.hasSerialClose();
        }}
      />
    }

    let genderIndex, passportIndex;
    switch (memberStore.memberInfo.gender) {
      case 2:
        genderIndex = 0;
        break;
      case 3:
        genderIndex = 1;
        break;
      default:
    }

    switch (memberStore.memberInfo.passportType) {
      case 224:
        passportIndex = 0;
        break;
      case 867:
        passportIndex = 1;
        break;
      case 866:
        passportIndex = 2;
        break;
      case 247:
        passportIndex = 3;
        break;
      default:
    }

    return (
      <div>
        <Modal title='新增会员'
          visible={true}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText='确定'
          cancelText='取消'
          width={920}
          wrapClassName='member-add-popup-modal'
        >
          <div className='member-add-popup'>

            <div className='main-top-left'>

              <div className='item-normal'>
                <div className='item-name'><i>*</i>手机</div>
                <div className='item-content'>
                  <input type='text'
                    value={memberStore.memberInfo.mobile}
                    placeholder='请输入手机号'
                    className='lg-input'
                    onChange={(e) => {
                      if (e.target.value.length <= 11 && /^\d*$/.test(e.target.value)) {
                        memberStore.mobileChange(e.target.value);
                      }

                    }} />
                  <span>{memberStore.errorText.mobileError}</span>
                </div>
              </div>
              <div className='item-normal'>
                <div className='item-name'><i>*</i>姓名</div>
                <div className='item-content'>
                  {
                    memberStore.returnMemberInfo && memberStore.returnMemberInfo.memberName ?

                      <input type='text'
                        value={memberStore.memberInfo.memberName}
                        readOnly
                        className='lg-input'
                      /> :
                      <input type='text'
                        value={memberStore.memberInfo.memberName}
                        placeholder='请输入姓名'
                        className='lg-input'
                        onChange={(e) => {
                          if (e.target.value.length <= 15) {
                            memberStore.memberNameChange(e.target.value);
                          }
                        }} />
                  }

                  <span>{memberStore.errorText.nameError}</span>
                </div>
              </div>
              <div className='item-btns'>
                <div className='item-name'>性别</div>
                <div className='item-content'>
                  {gender.map((gender, index) => {
                    return <input key={index}
                      type='button'
                      value={gender}
                      className={classnames({
                        'sm-btn': true,
                        'btn-active': index === genderIndex
                      })}
                      onClick={() => {

                        if (!memberStore.returnMemberInfo || (memberStore.returnMemberInfo && !memberStore.returnMemberInfo.gender)) {

                          this.setState({ genderIndex: index });
                          switch (index) {
                            case 0:
                              memberStore.genderClick(2);
                              break;
                            case 1:
                              memberStore.genderClick(3);
                              break;
                            default:
                          }
                        }
                      }}
                    />
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
                {cardType.map((type, index) => {
                  return <input
                    key={index}
                    type='button'
                    value={type}
                    className={classnames({
                      'lg-btn': true,
                      'btn-active': index === this.state.cardTypeIndex
                    })}
                    onClick={() => {
                      this.setState({ cardTypeIndex: index });
                      switch (index) {
                        case 0:
                          memberStore.cardTypeClick(864);
                          break;
                        case 1:
                          memberStore.cardTypeClick(865);
                          break;
                        default:
                          break;
                      }
                    }}
                  />
                })}
              </div>
            </div>

            <div className='item-birthday'>
              <div className='item-name'>生日</div>
              <div className='item-content'>
                <input type='text'
                  value={memberStore.memberInfo.birthday}
                  className='input-birthday'
                  readOnly
                  onClick={() => {
                    if (!memberStore.returnMemberInfo || (memberStore.returnMemberInfo && !memberStore.returnMemberInfo.birthday)) {
                      this.setState({
                        calendarPopup: <CalendarPopup
                          calendarModalOk={(time) => {
                            memberStore.calendarModalOk(time);
                            this.setState({ calendarPopup: '' });
                          }}
                          calendarModalCancel={() => {
                            this.setState({ calendarPopup: '' });
                          }}
                        />
                      });
                    }

                  }} />
                <i className='iconfont icon-xinzenghuiyuan_icon_rili'></i>
              </div>
            </div>

            {cardBlock}

            <div className='item-btns item-dropdown item-normal'>
              <div className='item-name'><i>*</i>等级</div>
              <div className='item-content'>
                {memberStore.returnCardInfo ?
                  <input type='button' value={memberStore.memberInfo.roleName} readOnly className={classnames({ 'lg-btn': true })} /> :
                  <Dropdown overlay={menu} trigger={['click']}>
                    <div className='button'>
                      {memberStore.currentCardlevel ? memberStore.currentCardlevel.roleName : ''}
                      <Icon type='down' />
                    </div>
                  </Dropdown>
                }
              </div>
            </div>
            <div className='item-normal'>
              <div className='item-name'>电子邮箱</div>
              <div className='item-content'>
                {memberStore.returnMemberInfo ?
                  <input type='text'
                    value={memberStore.memberInfo.email}
                    readOnly
                    className='lg-input'
                  /> :
                  <input type='text'
                    value={memberStore.memberInfo.email}
                    placeholder='请输入电子邮箱'
                    className='lg-input'
                    onChange={(e) => {
                      if (e.target.value.length <= 30) {
                        memberStore.emailChange(e.target.value);
                      }

                    }} />
                }

                <span>{memberStore.errorText.emailError}</span>
              </div>
            </div>

            <div className='item-btns'>
              <div className='item-name'>证件类型</div>
              <div className='item-content'>
                {passportType.map((passport, index) => {
                  return <input
                    key={index}
                    type='button'
                    value={passport}
                    className={classnames({
                      'sm-btn': true,
                      'btn-active': index === passportIndex
                    })}
                    onClick={() => {
                      if (!memberStore.returnMemberInfo || (memberStore.returnMemberInfo && !memberStore.returnMemberInfo.passportType)) {
                        this.setState({ passportIndex: index });
                        switch (index) {
                          case 0:
                            memberStore.passportTypeClick(224);
                            break;
                          case 1:
                            memberStore.passportTypeClick(867);
                            break;
                          case 2:
                            memberStore.passportTypeClick(866);
                            break;
                          case 3:
                            memberStore.passportTypeClick(247);
                            break;
                          default:
                            break;
                        }
                      }

                    }}
                  />
                })}
              </div>
            </div>

            <div className='item-normal'>
              <div className='item-name'>证件号码</div>
              <div className='item-content'>
                {memberStore.returnMemberInfo ?
                  <input type='text'
                    value={memberStore.memberInfo.passportNumber}
                    readOnly
                    className='lg-input'
                  /> :
                  <input type='text'
                    value={memberStore.memberInfo.passportNumber}
                    placeholder='请输入证件号码'
                    className='lg-input'
                    onChange={(e) => {
                      if (e.target.value.length <= 30) {
                        memberStore.passportNumberChange(e.target.value);
                      }
                    }}
                  />
                }

              </div>
            </div>
            <div className='item-business'>
              <div className='item-name'>业务员</div>
              <div className='item-content'>
                <input type='text'
                  value={memberStore.memberInfo.countermanName}
                  className='input-business'
                  readOnly
                  onClick={() => {
                    this.setState({
                      countermanPopup: <SelectWaiterPopup
                        cancelClick={() => {
                          this.setState({ countermanPopup: '' });
                        }} okClick={() => {
                          this.setState({ countermanPopup: '' });
                        }}
                      />
                    });
                  }}
                />
                <i className='iconfont icon-xinzenghuiyuan_icon_sousuo'></i>
              </div>
            </div>
            <div className='item-normal'>
              <div className='item-name'>密码 </div>
              <div className='item-content'>
                <input
                  type='password'
                  value={memberStore.memberInfo.password}
                  placeholder='请输入密码'
                  className='sm-input'
                  onChange={(e) => {
                    if (e.target.value.length <= 6 && (/^\w*$/.test(e.target.value))) {
                      memberStore.passwordChange(e.target.value);
                    }

                  }}
                />
                <input type='password'
                  value={memberStore.memberInfo.confirmPassword}
                  placeholder='确认密码'
                  className='sm-input'
                  onChange={(e) => {
                    if (e.target.value.length <= 6 && (/^\w*$/.test(e.target.value))) {
                      memberStore.confirmPasswordChange(e.target.value);
                    }

                  }}
                />
                <span>{memberStore.errorText.passwordError}</span>
              </div>
            </div>
            <div className='item-line'>
              <div className='item-name'>备注</div>
              <div className='item-content'>
                <input
                  type='text'
                  className='xl-input'
                  value={memberStore.memberInfo.memo}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      memberStore.memoChange(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            {hasPhoneAlert}
            {hasSerialAlert}
          </div>
          {this.state.loading}
        </Modal>
        {this.state.countermanPopup}
        {this.state.calendarPopup}
        {this.state.cardcode}

      </div>
    );
  }
}
export default AddMembberPopup;
