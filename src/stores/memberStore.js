/**
* @author gm
* @description 会员模块
* @date 2017-03-27
**/
import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import moment from 'moment';
import { message } from 'antd';
message.config({
  top: 300
});
class memberStore {
  @observable memberInfo; //添加会员提交的数据
  @observable cardlevels; //会员卡等级
  @observable currentCardlevel; //当前会员卡等级
  @observable errorText; //错误提示

  @observable currentMember; //当前选中的会员
  @observable searchContent; //搜索的内容
  @observable memberList; //会员记录
  @observable memberItem; //一条会员记录
  @observable isShowAddMember; //是否显示添加会员
  @observable isShowAlterMember; //是否显示修改会员

  @observable waiterList; //业务员
  @observable operateWaiter; //操作业务员

  @observable isHasPhone; //会员是否存在
  @observable isHasSerial; //是否有会员卡号
  @observable cardLevelName; //会员等级名称
  @observable returnMemberInfo; //根据手机号返回的会员信息
  @observable returnMessage; //根据手机号返回的提示信息
  @observable returnCardInfo; //卡号返回的信息
  @observable returnCardMessage; //卡号返回的提示信息

  @observable clockSerial; //锁定卡号

  @observable genderIndex; //修改时性别选中
  @observable passportIndex; //修改时证件选中

  @observable alterPassword; //修改密码
  @observable alterErrorText; //修改密码错误提示
  @observable isShowAlterPassword; //是否显示修改密码弹窗

  @observable resetPassword; //重置密码
  @observable resetErrorText; //重置密码错误提示
  @observable isShowResetPassword; //是否显示重置密码弹窗

  @observable rechargeList; //充值记录列表
  @observable rechargeItem; //单条充值记录

  @observable isShowOpenTicketPopup; //重开发票弹窗

  @observable rechargeRule; //获取充值规则返回
  @observable isShowVipPopup; //是否显示显示充值弹窗
  @observable isShowVipConfirm; //是否显示充值确认弹窗

  @observable canClick; //是否可以点击按钮

  constructor() {
    this.canClick = true;
    this.searchContent = '';
    this.memberInfo = {
      memberName: '', //姓名
      mobile: '', //手机
      gender: 2, //性别
      cardType: 864, //类型
      birthday: '1993-11-12', //生日
      cardSerial: '', //卡号
      chipCode: '', //芯片号
      roleID: '', //等级
      roleName: '',
      email: '', //电子邮箱
      passportType: 224, //证件类型
      passportNumber: '', //证件号码
      countermanID: '', //业务员ID
      countermanName: '', //业务员姓名
      password: '', //密码
      confirmPassword: '', //确认密码
      memo: '' //备注
    };
    this.errorText = {
      nameError: '', //名字错误提示
      mobileError: '', //手机错误提示
      emailError: '', //电子邮箱错误提示
      serialError: '', //卡号错误提示
      chipCodeError: '', //芯片号错误提示
      passwordError: '' //密码错误提示
    };

    this.memberList = null;
    this.memberItem = null;
    this.currentMember = '';
    this.cardlevels = [];
    this.currentCardlevel = null;
    this.isShowAddMember = false;
    this.isShowAlterMember = false;
    this.cardLevelName = '';

    this.waiterList = [];
    this.operateWaiter = {
      loginID: '',
      userName: ''
    };
    this.isHasPhone = false;
    this.isHasSerial = false;

    this.genderIndex = null;
    this.passportIndex = null;
    this.returnMemberInfo = null;
    this.returnMessage = '';
    this.clockSerial = false;

    this.alterPassword = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.alterErrorText = {
      oldError: '',
      confirmError: ''
    };
    this.isShowAlterPassword = false;

    this.resetPassword = {
      newPassword: '',
      confirmPassword: ''
    };
    this.resetErrorText = '';
    this.isShowResetPassword = false;

    this.rechargeList = null;
    this.rechargeItem = null;

    this.isShowOpenTicketPopup = false;
    this.returnCardInfo = '';

    this.rechargeRule = {
      activityID: '',
      activityName: '',
      ruleID: '',
      ruleName: '',
      spentAmount: '',
      presentAmount: '',
      presentBonus: ''
    };

    this.isShowVipPopup = false;
    this.isShowVipConfirm = false;
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

  /*****************************主界面*********************************/
  //主界面搜索事件
  @action
  search(value) {
    this.searchContent = value;
  }
  //搜索按钮点击 获取会员列表
  @action
  getMemberList(callback) {
    this.memberList = null;
    this.memberItem = null;

    if (this.searchContent) {
      let _this = this;
      getJSON({
        url: '/reception/member/queryMember.action',
        data: { quValue: _this.searchContent },
        success: function(json) {
          // console.log("queryMember",json);
          if (json.code === 0) {
            _this.memberList = json.data;
            callback && callback();
          } else {
            message.destroy();
            message.warn(json.message, 1);
          }
        }
      });
    } else {
      this.memberList = null;
      this.memberItem = null;
    }
  }

  //获取会员详细信息
  @action
  getMemberItem(cardID) {
    if (cardID) {
      let _this = this;
      getJSON({
        url: '/reception/member/getCardMemberInfor.action',
        data: { cardID: cardID },
        success: function(json) {
          // console.log("getCardMemberInfor",json);
          if (json.code === 0) {
            _this.memberItem = json.data;
          } else {
            // message.config({top:200});
            // message.warn(json.message,1);
          }
        }
      });
    }
  }

  /*****************************添加会员***********************************/
  //添加会员初始化
  @action
  initialize() {
    this.memberInfo = {
      memberName: '', //姓名
      mobile: '', //手机
      gender: 2, //性别
      cardType: 864, //类型
      birthday: '1993-11-12', //生日
      cardSerial: '', //卡号
      chipCode: '', //芯片号
      roleID: '', //等级
      roleName: '',
      email: '', //电子邮箱
      passportType: 224, //证件类型
      passportNumber: '', //证件号码
      countermanID: '', //业务员ID
      countermanName: '', //业务员姓名
      password: '', //密码
      confirmPassword: '', //确认密码
      memo: '' //备注
    };

    this.errorText = {
      nameError: '', //名字错误提示
      mobileError: '', //手机错误提示
      emailError: '', //电子邮箱错误提示
      serialError: '', //卡号错误提示
      chipCodeError: '', //芯片号错误提示
      passwordError: '' //密码错误提示
    };

    this.cardlevels = [];
    this.currentCardlevel = null;
    this.isHasSerial = false;
    this.isHasPhone = false;
    this.returnMemberInfo = '';
    this.returnMessage = '';
  }

  @action
  initial() {
    this.memberItem = '';
    this.memberList = '';
    this.searchContent = '';
    this.currentMember = '';
  }

  //获取所有等级
  @action
  getCardLevels = () => {
    let _this = this;
    getJSON({
      url: '/reception/member/getMemRoleLeve.action',
      success: function(json) {
        // console.log('cardlevel:',json);
        if (json.code === 0) {
          _this.cardlevels = json.data;
          //_this.cardlevels=[{roleID:22,roleName:"普通卡"},{roleID:23,roleName:"银卡"},{roleID:24,roleName:"金卡"}]
          if (_this.cardlevels.length > 0) {
            _this.currentCardlevel = _this.cardlevels[0];
            _this.memberInfo.roleID = _this.cardlevels[0].roleID;
            _this.memberInfo.roleName = _this.cardlevels[0].roleName;
          }
        } else {
          // message.config({top:200});
          // message.warn(json.message,1);
        }
      }
    });
  };
  //点击单个下拉框
  @action
  menuClick = key => {
    this.currentCardlevel = this.cardlevels[key];
    this.memberInfo.roleID = this.cardlevels[key].roleID;
    this.memberInfo.roleName = this.cardlevels[key].roleName;
  };

  //添加界面关闭提示
  @action
  hasPhoneClose() {
    this.isHasPhone = false;
    this.memberInfo.mobile = '';
  }
  //添加界面关闭提示
  @action
  hasSerialClose() {
    this.isHasSerial = false;
    this.memberInfo.cardSerial = '';
    this.memberInfo.chipCode = '';
  }

  //会员名字onChange事件
  @action
  memberNameChange(memberName) {
    this.memberInfo.memberName = memberName;
    if (memberName) {
      this.errorText.nameError = '';
    }
  }
  //手机onChange事件
  @action
  mobileChange(mobile) {
    this.memberInfo.mobile = mobile;
    let _this = this;

    if (mobile.length === 11) {
      getJSON({
        url: '/reception/member/checkMobile.action',
        data: { mobile: mobile },
        success: function(json) {
          // console.log('checkMobile:',json);
          if (json.code === 300) {
            _this.isHasPhone = false;

            if (json.data) {
              _this.returnMemberInfo = json.data;

              if (_this.returnMemberInfo.memberName) {
                _this.memberInfo.memberName = _this.returnMemberInfo.memberName;
                _this.errorText.nameError = '';
              }
              if (_this.returnMemberInfo.gender) {
                _this.memberInfo.gender = _this.returnMemberInfo.gender;
              }
              if (_this.returnMemberInfo.email) {
                _this.memberInfo.email = _this.returnMemberInfo.email;
                _this.errorText.emailError = '';
              }
              if (_this.returnMemberInfo.birthday) {
                _this.memberInfo.birthday = moment(
                  _this.returnMemberInfo.birthday
                ).format('YYYY-MM-DD');
              }
              if (_this.returnMemberInfo.passportType) {
                _this.memberInfo.passportType =
                  _this.returnMemberInfo.passportType;
              }
              if (_this.returnMemberInfo.idcode) {
                _this.memberInfo.passportNumber = _this.returnMemberInfo.idcode;
              }
            }
          } else {
            _this.returnMessage = json.message;
            _this.returnMemberInfo = '';
            _this.isHasPhone = true;

            _this.memberInfo.memberName = '';
            _this.memberInfo.gender = 2;
            _this.memberInfo.email = '';
            _this.memberInfo.birthday = '1993-11-12';
            _this.memberInfo.passportType = 224;
            _this.memberInfo.passportNumber = '';
          }
        }
      });
    } else {
      _this.returnMessage = '';
      _this.returnMemberInfo = '';

      _this.memberInfo.memberName = '';
      _this.memberInfo.gender = 2;
      _this.memberInfo.email = '';
      _this.memberInfo.birthday = '1993-11-12';
      _this.memberInfo.passportType = 224;
      _this.memberInfo.passportNumber = '';

      _this.isHasPhone = false;
    }

    if (/^1[34578]\d{9}$/.test(mobile)) {
      this.errorText.mobileError = '';
    }
  }
  //卡号onChange事件
  @action
  cardSerialChange(cardSerial) {
    this.memberInfo.cardSerial = cardSerial;
    if (cardSerial) {
      this.errorText.serialError = '';
    }
  }

  @action
  getCardCode(chipCode) {
    let _this = this;
    getJSON({
      url: '/reception/member/checkCardCode.action',
      data: { cardSerialNo: chipCode },
      success: function(json) {
        // console.log('checkCardCode',json);
        if (json.code === 305) {
          _this.isHasSerial = false;

          console.log(json.data);
          if (json.data) {
            _this.returnCardInfo = json.data;
            _this.memberInfo.roleID = _this.returnCardInfo.roleID;
            _this.memberInfo.roleName = _this.returnCardInfo.roleName;

            if (_this.returnCardInfo.cardSerialNo) {
              _this.memberInfo.cardSerial = _this.returnCardInfo.cardSerialNo;

              _this.clockSerial = true;
            } else {
              _this.clockSerial = false;
            }

            if (_this.returnCardInfo.roleID) {
              _this.currentCardlevel.roleID = _this.returnCardInfo.roleID;
              _this.currentCardlevel.roleName = _this.returnCardInfo.roleName;
              _this.memberInfo.roleName = _this.returnCardInfo.roleName;
            }
          } else {
            _this.clockSerial = false;
            _this.memberInfo.cardSerial = '';
            _this.currentCardlevel = _this.cardlevels[0];
            _this.memberInfo.roleID = _this.currentCardlevel.roleID;
            _this.memberInfo.roleName = _this.currentCardlevel.roleName;
            _this.returnCardInfo = '';
          }
        } else {
          _this.clockSerial = false;
          _this.returnCardInfo = '';
          _this.returnCardMessage = json.message;
          _this.memberInfo.cardSerial = '';
          _this.isHasSerial = true;
          _this.currentCardlevel = _this.cardlevels[0];
          _this.memberInfo.roleID = _this.currentCardlevel.roleID;
          _this.memberInfo.roleName = _this.currentCardlevel.roleName;
          //  message.config({top:200});
          //  message.warn(json.message,1);
        }
      }
    });
    this.memberInfo.chipCode = chipCode;
    if (chipCode) {
      this.errorText.chipCodeError = '';
    }
  }

  //芯片号onChange事件
  @action
  chipCodeChange(chipCode) {
    this.memberInfo.chipCode = chipCode;
    if (chipCode) {
      this.errorText.chipCodeError = '';
    }
  }
  //邮箱onChange事件
  @action
  emailChange(email) {
    this.memberInfo.email = email;

    let isEmail = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(
      email
    );
    if (email) {
      if (isEmail) {
        this.errorText.emailError = '';
      } else {
        this.errorText.emailError = '请输入正确的电子邮箱';
      }
    } else {
      this.errorText.emailError = '';
    }
  }
  //证件号码onChange事件
  @action
  passportNumberChange(passportNumber) {
    this.memberInfo.passportNumber = passportNumber;
  }
  //密码onChange事件
  @action
  passwordChange(password) {
    this.memberInfo.password = password;

    this.errorText.passwordError = '';
  }
  //确认密码onChange事件
  @action
  confirmPasswordChange(confirmPassword) {
    this.memberInfo.confirmPassword = confirmPassword;
    this.errorText.passwordError = '';
  }
  //备注onChange事件
  @action
  memoChange(memo) {
    this.memberInfo.memo = memo;
  }
  //选择生日
  @action
  calendarModalOk(time) {
    this.memberInfo.birthday = time;
  }
  //选择性别
  @action
  genderClick(gender) {
    this.memberInfo.gender = gender;
  }
  //选择类型
  @action
  cardTypeClick(cardType) {
    //如果为电子卡 把卡号 和芯片号清空 错误信息清空
    if (cardType === 864) {
      this.memberInfo.cardSerial = '';
      this.memberInfo.chipCode = '';
      this.errorText.serialError = '';
      this.errorText.chipCodeError = '';

      this.isHasSerial = false;
    }
    this.memberInfo.cardType = cardType;
  }
  //选择证件
  @action
  passportTypeClick(passportType) {
    this.memberInfo.passportType = passportType;
  }

  //添加会员点击
  @action
  addMemberClick() {
    this.isShowAddMember = true;
  }

  //添加会员取消
  @action
  cancelClick() {
    this.initialize();
    this.isShowAddMember = false;

    this.clockSerial = false;
    this.returnCardInfo = '';
  }
  //添加会员确定
  @action
  submitMember(callback) {
    //姓名
    let isMemberName = this.memberInfo.memberName.trim();
    if (isMemberName) {
      this.errorText.nameError = '';
    } else {
      this.errorText.nameError = '请输入姓名';
    }

    //电话号码
    let isMobile = /^1[34578]\d{9}$/.test(this.memberInfo.mobile);
    if (isMobile) {
      this.errorText.mobileError = '';
    } else {
      this.errorText.mobileError = '请输入正确手机号';
    }

    let isCardSerial, isChipCode;
    if (this.memberInfo.cardType === 865) {
      if (this.memberInfo.cardSerial.trim()) {
        isCardSerial = true;
        this.errorText.serialError = '';
      } else {
        isCardSerial = false;
        this.errorText.serialError = '卡号不能为空';
      }

      if (this.memberInfo.chipCode.trim()) {
        isChipCode = true;
        this.errorText.chipCodeError = '';
      } else {
        isChipCode = false;
        this.errorText.chipCodeError = '芯片号不能为空';
      }
    } else {
      isCardSerial = true;
      isChipCode = true;
    }

    //电子邮箱
    let isEmail = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(
      this.memberInfo.email
    );
    if (this.memberInfo.email) {
      if (isEmail) {
        this.errorText.emailError = '';
      } else {
        this.errorText.emailError = '请输入正确的电子邮箱';
      }
    } else {
      this.errorText.emailError = '';
    }
    //密码
    let password = this.memberInfo.password.trim();
    let confirmPassword = this.memberInfo.confirmPassword.trim();
    let isPassword = password === confirmPassword;
    if (isPassword) {
      this.errorText.passwordError = '';
    } else {
      this.errorText.passwordError = '两次密码不一致';
    }
    let _this = this;
    if (
      isMemberName &&
      isMobile &&
      isCardSerial &&
      isChipCode &&
      (isEmail || this.memberInfo.email === '') &&
      isPassword &&
      !this.isHasPhone &&
      !this.isHasSerial
    ) {
      let password;
      if (_this.memberInfo.password !== '') {
        let forge = require('node-forge');
        let md = forge.md.md5.create();
        md.update(_this.memberInfo.password);
        password = md
          .digest()
          .toHex()
          .toUpperCase();
      } else {
        password = '';
      }

      // console.log(this.memberInfo)
      getJSON({
        url: '/reception/member/addMember.action',
        data: {
          memberName: _this.memberInfo.memberName,
          gender: _this.memberInfo.gender,
          mobile: _this.memberInfo.mobile,
          email: _this.memberInfo.email,
          birthday: _this.memberInfo.birthday,
          payPassword: password,
          countermanID: _this.memberInfo.countermanID,
          countermanName: _this.memberInfo.countermanName,
          memo: _this.memberInfo.memo,
          passportType: _this.memberInfo.passportType,
          IDCode: _this.memberInfo.passportNumber,
          cardCode: _this.memberInfo.cardSerial,
          roleID: _this.memberInfo.roleID,
          roleName: _this.memberInfo.roleName,
          cardType: _this.memberInfo.cardType,
          cardSerialNo: _this.memberInfo.chipCode
        },
        success: function(json) {
          // console.log('addMember:',json);
          if (json.code === 0) {
            callback && callback(true);
            message.destroy();
            message.success('添加会员成功', 2);
          } else {
            callback && callback(false);
            message.destroy();
            message.warn(json.message, 1);
          }
        }
      });
    }
  }

  /**********************修改会员************************/
  @action
  showAlterPopup() {
    this.isShowAlterMember = true;
  }
  //取消按钮
  @action
  cancelAlterClick() {
    this.isShowAlterMember = false;
  }
  //提交修改信息
  @action
  submitAlterMember() {
    let _this = this;
    //姓名
    let isMemberName = this.memberInfo.memberName.trim();
    if (isMemberName) {
      this.errorText.nameError = '';
    } else {
      this.errorText.nameError = '请输入姓名';
    }

    //电话号码
    let isMobile = /^1[34578]\d{9}$/.test(this.memberInfo.mobile);
    if (isMobile) {
      this.errorText.mobileError = '';
    } else {
      this.errorText.mobileError = '请输入正确手机号';
    }

    //电子邮箱
    let isEmail = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(
      this.memberInfo.email
    );
    if (this.memberInfo.email) {
      if (isEmail) {
        this.errorText.emailError = '';
      } else {
        this.errorText.emailError = '请输入正确的电子邮箱';
      }
    } else {
      this.errorText.emailError = '';
    }

    if (
      isMemberName &&
      isMobile &&
      (isEmail || this.memberInfo.email === '') &&
      !this.isHasPhone
    ) {
      // console.log("alter",this.memberInfo)
      getJSON({
        url: '/reception/member/updateMember.action',
        data: {
          memberName: _this.memberInfo.memberName,
          gender: _this.memberInfo.gender,
          mobile: _this.memberInfo.mobile,
          email: _this.memberInfo.email,
          birthday: _this.memberInfo.birthday,
          payPassword: _this.memberInfo.password,
          countermanID: _this.memberInfo.countermanID,
          countermanName: _this.memberInfo.countermanName,
          memo: _this.memberInfo.memo,
          passportType: _this.memberInfo.passportType,
          IDCode: _this.memberInfo.passportNumber,
          cardCode: _this.memberInfo.chipCode,
          roleID: _this.memberInfo.roleID,
          cardType: _this.memberInfo.cardType,
          cardSerialNo: _this.memberInfo.cardSerial,
          cardID: _this.memberItem.cardID,
          customerID: _this.memberItem.customerID
        },
        success: function(json) {
          // console.log('alterMember:',json);
          if (json.code === 0) {
            message.destroy();
            message.success('修改会员成功', 2);
            _this.isShowAlterMember = false;
            _this.initialize();
            _this.getMemberList();
            _this.getMemberItem(_this.currentMember.cardID);
          } else {
            message.destroy();
            message.warn(json.message, 1);
          }
        }
      });
    }
  }
  //获取修改会员信息
  @action
  getMemberAlterMessage() {
    let _this = this;
    getJSON({
      url: '/reception/member/getMemberInfor.action',
      data: { cardID: _this.memberItem.cardID },
      success: function(json) {
        // console.log("getAlterMember",json)
        if (json.code === 0) {
          let value = json.data;

          _this.memberInfo.memberName = value.memberName;
          _this.memberInfo.mobile = value.mobile;
          _this.memberInfo.cardType = value.cardType;
          _this.memberInfo.birthday = value.birthday;
          _this.memberInfo.cardSerial = value.cardSerialNo;
          _this.memberInfo.chipCode = value.cardCode;
          _this.memberInfo.roleID = value.roleID;
          _this.memberInfo.email = value.email;
          _this.memberInfo.passportType = value.passportType;
          _this.memberInfo.passportNumber = value.idcode;
          _this.memberInfo.countermanID = value.countermanID;
          _this.memberInfo.countermanName = value.countermanName;
          _this.memberInfo.password = '';
          _this.memberInfo.confirmPassword = '';
          _this.memberInfo.memo = value.memo;

          switch (value.passportType) {
            case 224:
              _this.passportIndex = 0;
              break;
            case 867:
              _this.passportIndex = 1;
              break;
            case 866:
              _this.passportIndex = 2;
              break;
            case 247:
              _this.passportIndex = 3;
              break;
            default:
              break;
          }
          switch (value.gender) {
            case 2:
              _this.genderIndex = 0;
              break;
            case 3:
              _this.genderIndex = 1;
              break;
            default:
              break;
          }
          _this.cardLevelName = value.cardLevelName;
        } else {
          // message.config({top:200});
          // message.warn(json.message,1);
        }
      }
    });
  }

  //加载操作人列表
  @action
  getWaiterList = (nameOrId = '') => {
    let _this = this;
    let requireData = {};
    requireData.nameOrId = nameOrId;
    getJSON({
      url: '/reception/member/getServerNameList.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.waiterList = json.data.map(waiter => {
            waiter.selected = false;
            return waiter;
          });
        } else {
          _this.waiterList = [];
          //  message.config({top:200});
          //  message.warn(json.message,1);
        }
      }
    });
  };

  //选择操作服务员
  @action
  selectOperateWaiter = loginID => {
    this.waiterList = this.waiterList.map(waiter => {
      waiter.selected = waiter.loginID === loginID;
      return waiter;
    });
  };

  //更改操作服务员
  @action
  changeOperateWaiter = (loginID, userName) => {
    this.memberInfo.countermanID = loginID;
    this.memberInfo.countermanName = userName;
    this.operateWaiter = {
      loginID: loginID,
      userName: userName
    };
  };

  //重置操作服务员
  @action
  resetOperateWaiter = () => {
    this.operateWaiter = {
      loginID: '',
      userName: this.userName
    };
  };

  @action
  initialWaiter() {
    this.operateWaiter = {
      loginID: '',
      userName: ''
    };
  }

  /**********************修改密码**********************/

  //弹出修改密码弹窗
  @action
  alterPasswordPopup() {
    this.isShowAlterPassword = true;
  }
  @action
  alterOldPassword(oldPassword) {
    this.alterPassword.oldPassword = oldPassword;
    this.alterErrorText.oldError = '';
  }
  @action
  alterNewPassword(newPassword) {
    this.alterPassword.newPassword = newPassword;

    this.alterErrorText.confirmError = '';
  }
  @action
  alterConfirmPassword(comfirmPassword) {
    this.alterPassword.confirmPassword = comfirmPassword;

    this.alterErrorText.confirmError = '';
  }
  //初始化
  @action
  alterInitial() {
    this.alterPassword = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.alterErrorText = {
      oldError: '',
      confirmError: ''
    };
  }
  //取消
  @action
  alterHandleCancel() {
    this.isShowAlterPassword = false;
    this.alterInitial();
  }
  //确定
  @action
  alterHandleOk() {
    let isPassword =
      this.alterPassword.newPassword === this.alterPassword.confirmPassword;
    if (isPassword) {
      this.alterErrorText.confirmError = '';
    } else {
      this.alterErrorText.confirmError = '两次密码不一致';
    }

    let isSuccess = !(
      this.alterPassword.oldPassword === this.alterPassword.newPassword
    ); //新旧密码要不同
    if (isSuccess) {
    } else {
      message.destroy();
      message.info('新旧密码不能相同', 1);
    }
    let _this = this;

    if (isPassword && isSuccess) {
      let oldPassword, newPassword;
      let forge = require('node-forge');

      if (_this.alterPassword.oldPassword !== '') {
        let md = forge.md.md5.create();
        md.update(_this.alterPassword.oldPassword);
        oldPassword = md
          .digest()
          .toHex()
          .toUpperCase();
      } else {
        oldPassword = '';
      }

      if (_this.alterPassword.newPassword !== '') {
        let md1 = forge.md.md5.create();
        md1.update(_this.alterPassword.newPassword);
        newPassword = md1
          .digest()
          .toHex()
          .toUpperCase();
      } else {
        newPassword = '';
      }

      getJSON({
        url: '/reception/member/updateCardPassword.action',
        data: {
          cardID: _this.memberItem.cardID,
          oldPassword: oldPassword,
          newPassword: newPassword
        },
        success: function(json) {
          if (json.code === 0) {
            _this.isShowAlterPassword = false;
            message.destroy();
            message.success('修改密码成功', 2);
          } else if (json.code === 313) {
            _this.alterErrorText.oldError = '旧密码不正确';
          } else {
            message.destroy();
            message.warn(json.message, 1);
          }
        }
      });
    }
  }

  /**************重置会员密码**************/

  @action
  showResetPassword() {
    this.isShowResetPassword = true;
  }

  @action
  resetInitial() {
    this.resetPassword = {
      newPassword: '',
      confirmPassword: ''
    };
    this.resetErrorText = '';
  }
  @action
  resetrNewPassword(newPassword) {
    this.resetPassword.newPassword = newPassword;
    this.resetErrorText = '';
  }
  @action
  resetConfirmPassword(confirmPassword) {
    this.resetPassword.confirmPassword = confirmPassword;
    this.resetErrorText = '';
  }
  @action
  resetHandleCancel() {
    this.isShowResetPassword = false;
    this.resetInitial();
  }
  @action
  resetHandleOk() {
    let isPassword =
      this.resetPassword.newPassword === this.resetPassword.confirmPassword;
    if (isPassword) {
      this.resetErrorText = '';
    } else {
      this.resetErrorText = '密码不一致';
    }

    if (isPassword) {
      let _this = this;

      let newPassword;
      if (_this.resetPassword.newPassword !== '') {
        let forge = require('node-forge');
        let md = forge.md.md5.create();
        md.update(_this.resetPassword.newPassword);
        newPassword = md
          .digest()
          .toHex()
          .toUpperCase();
      } else {
        newPassword = '';
      }

      getJSON({
        url: '/reception/member/repeatCardPassword.action',
        data: { cardID: _this.memberItem.cardID, newPassword: newPassword },
        success: function(json) {
          // console.log("reset",json);
          if (json.code === 0) {
            _this.isShowResetPassword = false;
            message.destroy();
            message.success('重置密码成功', 2);
          } else {
            message.destroy();
            message.warn(json.message, 1);
          }
        }
      });
    }
  }

  /*******************冻结******************/
  @action
  frozenMember() {
    let _this = this;
    getJSON({
      url: '/reception/member/blockedMember.action',
      data: { cardID: _this.memberItem.cardID },
      success: function(json) {
        // console.log("frozen",json);
        if (json.code === 0) {
          message.destroy();
          message.success('冻结会员成功', 2);

          _this.getMemberList();
          _this.getMemberItem(_this.currentMember.cardID);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //解冻

  @action
  unfrozenMember() {
    let _this = this;
    getJSON({
      url: '/reception/member/thawMember.action',
      data: { cardID: _this.memberItem.cardID },
      success: function(json) {
        // console.log("frozen",json);
        if (json.code === 0) {
          message.destroy();
          message.success('解冻会员成功', 2);

          _this.getMemberList();
          _this.getMemberItem(_this.currentMember.cardID);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  /********************注销*********************/
  @action
  cancelMember() {
    let _this = this;
    getJSON({
      url: '/reception/member/cancellationMember.action',
      data: { cardID: _this.memberItem.cardID },
      success: function(json) {
        // console.log("cancel",json);
        if (json.code === 0) {
          message.destroy();
          message.success('注销会员成功', 2);
          _this.getMemberList();
          _this.getMemberItem(_this.currentMember.cardID);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  /*******************充值记录***********************/

  @action
  rechargeSearch(cardID, date, searchValue) {
    let _this = this;
    getJSON({
      url: '/reception/member/queryMemberRecharge.action',
      data: { cardID: cardID, quDate: date, quValue: searchValue },
      success: function(json) {
        // console.log("queryMemberRecharge",json);
        if (json.code === 0) {
          _this.rechargeList = json.data;

          _this.rechargeItem = _this.rechargeList[0];
        } else {
          // message.config({top:200});
          // message.warn(json.message,1);
        }
      }
    });
  }

  @action
  chargeItemClick(item) {
    this.rechargeItem = item;
  }

  //重印
  @action
  againReceipt() {
    let _this = this;
    console.log(this.rechargeItem);
    getJSON({
      url: '/reception/member/repeatPrintTicket.action',
      data: {
        cardID: _this.rechargeItem.cardID,
        depositID: _this.rechargeItem.depositID
      },
      success: function(json) {
        // console.log("cancel",json);
        if (json.code === 0) {
          message.destroy();
          message.success('重印充值单成功', 2);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  @action
  drawMoneyCancel() {
    this.isShowOpenTicketPopup = false;
  }

  @action
  memberOpenTicket(submit, current) {
    let _this = this;
    getJSON({
      url: '/reception/member/memberOpenTicket.action',
      data: submit,
      success: function(json) {
        // console.log("OpenTicket",json);
        if (json.code === 0) {
          _this.isShowOpenTicketPopup = false;

          //更新开票金额
          _this.rechargeList[current].openBill = submit.ticketAmount * 1;

          message.destroy();
          message.success('补开发票成功', 2);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  /****************充值**************/
  @action
  getRechargeCalc(money, roleID) {
    let _this = this;
    getJSON({
      url: '/reception/member/getRechargeCalc.action',
      data: { rechargeAmount: money, roleID: roleID },
      success: function(json) {
        // console.log("getRechargeCalc",json);
        if (json.code === 0) {
          if (json.data) {
            _this.rechargeRule = json.data;
          }
        } else {
          // message.config({top:200});
          // message.warn(json.message,1);
        }
      }
    });
  }

  @action
  initialVip() {
    this.rechargeRule = {
      activityID: '',
      activityName: '',
      ruleID: '',
      ruleName: '',
      spentAmount: '',
      presentAmount: '',
      presentBonus: ''
    };
    this.initialWaiter();
  }

  @action
  cancelVipClick() {
    this.isShowVipPopup = false;
  }

  @action
  showVipPopup() {
    this.isShowVipPopup = true;
  }

  @action
  submitMemberRecharge(recharge, callback) {
    let _this = this;
    this.canClick = false;
    getJSON({
      url: '/reception/member/memberRecharge.action',
      data: recharge,
      timeout: 50 * 1000,
      success: function(json) {
        console.log('memberRecharge', json);
        if (json.code === 0) {
          _this.isShowVipConfirm = false;
          _this.canClick = true;

          message.destroy();
          message.success('充值成功', 2);
          _this.memberList = null;

          callback && callback(_this.currentMember.cardID, true);
          // _this.getMemberList();
          // _this.getMemberItem(_this.currentMember.cardID);
        } else {
          _this.canClick = true;
          _this.isShowVipConfirm = false;
          callback && callback(_this.currentMember.cardID, false);

          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  @action
  showVipConfirm() {
    this.isShowVipConfirm = true;
  }
  @action
  cancelVipConfirm() {
    this.isShowVipConfirm = false;
  }
}

export default new memberStore();
