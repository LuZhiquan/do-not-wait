/**
* @author William Cui
* @description 宴会预定数据模型
* @date 2017-06-27
**/
import { observable, action } from 'mobx';
import { browserHistory } from 'react-router';
import { getJSON } from 'common/utils';
import { message } from 'antd';
import moment from 'moment';

class banquetCreateStore {
  @observable areaList; //餐厅区域
  @observable deskList; //对应区域的桌台
  @observable allDeskNumber; //所有桌台总数
  @observable selectDesk; //已选桌台

  @observable banquetTypeList; //宴会类型
  @observable currentBanquetType; //当前宴会类型
  @observable banquetMessage; //创建宴会界面信息
  @observable error; //错误提示
  @observable isMoreType; //多种还是单种类型
  @observable tTypes; //人数及购物车信息
  @observable isSelectAll; //是否全部选中

  @observable moreTypeIndex; //多种类型时当前去点菜的下标
  @observable allBookingNum; //多种类型 预定桌总数
  @observable allBackUpNum; //多种类子  备用桌台总数
  @observable allMoney; //多种类型所有钱

  @observable openTableMessage; //预定开台所有信息
  @observable updateReasons; //修改原因

  @observable cancelMessage; //取消预定所有信息
  @observable cancelReasons; //取消原因

  @observable adjustReasons; //退款原因
  @observable settlementInfo; //结账界面信息
  @observable paymentMethod; //所有支付方式

  @observable allTypeDesk; //加菜所有桌台
  @observable allTypes; //所有类型
  @observable itemTypeDesk; //单种类型桌台
  @observable selectTypeDesk; //类型选中桌台
  @observable isTypesAllSelect; //是否全部选中

  constructor() {
    this.banquetTypeList = [];
    this.currentBanquetType = null;
    this.areaList = [];
    this.deskList = [];
    this.selectDesk = [];
    this.allDeskNumber = '';
    this.isMoreType = false;
    this.isSelectAll = false;

    this.moreTypeIndex = 0;
    this.allBookingNum = 0;
    this.allBackUpNum = 0;
    this.allMoney = 0;
    this.openTableMessage = '';
    this.updateReasons = [];

    this.cancelMessage = '';
    this.cancelReasons = [];
    this.settlementInfo = '';
    this.paymentMethod = [];

    this.allTypeDesk = [];
    this.itemTypeDesk = [];
    this.selectTypeDesk = [];
    this.allTypes = [];
    this.isTypesAllSelect = false;

    this.tTypes = [
      {
        typeName: '', //类型名称
        bookingNum: '', //预定桌数
        backupNum: '', //备用桌数
        peopleNum: '', //每桌人数
        amount: '', //原价
        actualAmount: '', //现价
        totalAmount: '', //总价
        banquetComboID: '', //套餐id
        banquetComboName: '', //套餐名字
        cart: '' //购物车
      }
    ];

    this.banquetMessage = {
      customerName: '',
      gendar: 2,
      phone: '',
      partyName: '',
      typeName: '',
      bookingTime: moment()
        .add(1, 'days')
        .format('YYYY-MM-DD HH:mm:ss'),
      openTime: moment().format('HH:mm'),
      duration: '',
      bookingMemo: '',
      layoutSite: '',
      dressTable: '',
      audio: '',
      tempNum: ''
    };

    this.error = {
      customerError: '',
      phoneError: '',
      partyNameError: '',
      durationError: '',
      deskError: '',
      singleError: '',
      moreError: '',
      modifyError: ''
    };

    this.adjustReasons = [];
  }

  /*************************************加菜选择桌台******************************************/

  //获取所有类型
  @action
  getTableTypes(bookingID) {
    let _this = this;
    getJSON({
      url: '/banquet/dish/getTableTypes',
      data: { bookingID: bookingID },
      success: function(json) {
        //console.log("getTableTypes",json);
        if (json.code === 0) {
          _this.allTypes = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //获取所有桌台
  @action
  getAllTypeDesk(bookingID) {
    let _this = this;
    getJSON({
      url: '/banquet/dish/getAllTables',
      data: { bookingID: bookingID },
      success: function(json) {
        // console.log("getAllTables",json);
        if (json.code === 0) {
          _this.allTypeDesk = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //获取对应类型桌台

  @action
  getTypeTables(typeID) {
    let _this = this;
    getJSON({
      url: '/banquet/dish/getTables',
      data: { typeID: typeID },
      success: function(json) {
        // console.log("getTables",json);
        if (json.code === 0) {
          _this.itemTypeDesk = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //全选
  @action
  allSelectTypeClick() {}

  //类型点击
  @action
  deskTypeTabClick() {}

  //单条类型数据
  @action
  deskTypeItemClick() {}

  /******************************************************************************/

  //清楚错误
  @action
  clearError() {
    this.error = {
      customerError: '',
      phoneError: '',
      partyNameError: '',
      durationError: '',
      deskError: '',
      singleError: '',
      moreError: '',
      modifyError: ''
    };
  }

  //数据初始化
  @action
  clearMessage() {
    this.banquetTypeList = [];
    this.currentBanquetType = null;
    this.areaList = [];
    this.deskList = [];
    this.selectDesk = [];
    this.allDeskNumber = '';
    this.isMoreType = false;
    this.isSelectAll = false;

    this.moreTypeIndex = 0;
    this.allBookingNum = 0;
    this.allBackUpNum = 0;
    this.allMoney = 0;

    this.tTypes = [
      {
        typeName: '',
        bookingNum: '',
        backupNum: '',
        peopleNum: '',
        amount: '',
        actualAmount: '',
        totalAmount: '',
        banquetComboID: '',
        banquetComboName: '',
        cart: ''
      }
    ];

    this.banquetMessage = {
      customerName: '',
      gendar: 2,
      phone: '',
      partyName: '',
      typeName: '',
      bookingTime: moment()
        .add(1, 'days')
        .format('YYYY-MM-DD HH:mm:ss'),
      openTime: moment().format('HH:mm'),
      duration: '',
      bookingMemo: '',
      layoutSite: '',
      dressTable: '',
      audio: '',
      tempNum: ''
    };

    this.error = {
      customerError: '',
      phoneError: '',
      partyNameError: '',
      durationError: '',
      deskError: '',
      singleError: '',
      moreError: '',
      modifyError: ''
    };
  }

  //客户姓名
  @action
  changeCustomer(customerName) {
    this.error.customerError = '';
    this.banquetMessage.customerName = customerName;
  }
  //性别改变
  @action
  gendarClick(index) {
    this.banquetMessage.gendar = index + 2;
  }
  //电话号码
  @action
  changePhone(phone) {
    this.error.phoneError = '';
    this.banquetMessage.phone = phone;
  }
  //宴会名称
  @action
  changePartyName(partyName) {
    this.error.partyNameError = '';
    this.banquetMessage.partyName = partyName;
  }
  //选择日历
  @action
  calendarClick(date) {
    let time = this.banquetMessage.bookingTime.split(' ')[1];

    this.banquetMessage.bookingTime = date + ' ' + time;
  }
  //预订时间小时
  @action
  changeBookingHour(hour) {
    let time = this.banquetMessage.bookingTime.split(' ')[0];
    let picker = this.banquetMessage.bookingTime.split(' ')[1].split(':');

    this.banquetMessage.bookingTime =
      time + ' ' + hour + ':' + picker[1] + ':' + picker[2];
  }

  //预订时间分钟
  @action
  changeBookingMinute(minute) {
    let time = this.banquetMessage.bookingTime.split(' ')[0];
    let picker = this.banquetMessage.bookingTime.split(' ')[1].split(':');

    this.banquetMessage.bookingTime =
      time + ' ' + picker[0] + ':' + minute + ':' + picker[2];
  }

  //开席时间小时
  @action
  changeOpenHour(hour) {
    let picker = this.banquetMessage.openTime.split(':')[1];

    this.banquetMessage.openTime = hour + ':' + picker;
  }

  //开席时间分钟
  @action
  changeOpenMinute(minute) {
    let picker = this.banquetMessage.openTime.split(':')[0];

    this.banquetMessage.openTime = picker + ':' + minute;
  }

  //时长
  @action
  changeDuration(duration) {
    this.error.durationError = '';
    this.banquetMessage.duration = duration;
  }

  //预订说明
  @action
  changeBookingMemo(bookingMemo) {
    this.banquetMessage.bookingMemo = bookingMemo;
  }

  //场地布置
  @action
  changeLayoutSite(layoutSite) {
    this.banquetMessage.layoutSite = layoutSite;
  }

  //摆台要求
  @action
  changeDressTable(dressTable) {
    this.banquetMessage.dressTable = dressTable;
  }

  //音响要求
  @action
  changeAudio(audio) {
    this.banquetMessage.audio = audio;
  }
  //临时桌数
  @action
  changeTempNum(tempNum) {
    this.banquetMessage.tempNum = tempNum;
  }

  //宴会创建界面取消
  @action
  createCancelClick() {
    browserHistory.push('/banquet/records');
    this.clearMessage();
  }

  //switch切换
  @action
  switchClick(isMoreType) {
    this.isMoreType = isMoreType;
    this.error.singleError = '';

    this.tTypes = [
      {
        typeName: '',
        bookingNum: '',
        backupNum: '',
        peopleNum: '',
        amount: '',
        actualAmount: '',
        totalAmount: '',
        banquetComboID: '',
        banquetComboName: '',
        cart: ''
      }
    ];
  }

  //查询餐厅区域
  @action
  getBookingAreaList(bookingID) {
    let archiveID;
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }
    let _this = this;
    getJSON({
      url: '/banquet/booking/getBookingAreaList',
      data: { archiveID: archiveID },
      success: function(json) {
        //console.log("getBookingAreaList",json);
        if (json.code === 0) {
          _this.areaList = json.data;
          _this.areaList.unshift({
            areaName: '全部',
            areaID: ''
          });
          _this.getUsableBookingTableList('', '', bookingID);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //查询区域桌台
  @action
  getUsableBookingTableList(areaID, callback, bookingID) {
    this.deskList = [];

    let archiveID = '';
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }

    let _this = this;
    getJSON({
      url: '/banquet/booking/getUsableBookingTableList',
      data: {
        archiveID: archiveID,
        bookingTime: _this.banquetMessage.bookingTime,
        duration: _this.banquetMessage.duration,
        areaID: areaID,
        bookingID: bookingID
      },
      success: function(json) {
        //console.log("getUsableBookingTableList",json);
        if (json.code === 0) {
          _this.deskList = json.data.map((desk, index) => {
            desk.select = false;
            _this.selectDesk.forEach((item, mindex) => {
              if (item.tableID === desk.tableID) {
                desk.select = true;
              }
            });
            return desk;
          });
          if (areaID === '') {
            _this.allDeskNumber = _this.deskList.length;
          }

          callback && callback();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //获取宴会类型
  @action
  getBanquetTypeList(callBack) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/getBanquetTypeList',
      success: function(json) {
        if (json.code === 0) {
          _this.banquetTypeList = json.data;
          callBack && callBack();
        } else {
          message.destroy();
          message.error(json.message, 1);
        }
      }
    });
  }

  //选择宴会类型
  @action
  typeDownClick(key) {
    this.currentBanquetType = this.banquetTypeList[key];
  }

  //区域tab点击事件
  @action
  deskTabClick(key, bookingID) {
    let areaID = this.areaList[key].areaID;
    this.getUsableBookingTableList(
      areaID,
      () => {
        //判断是否全部选中
        let myDesk = this.selectDesk.filter((desk, index) => {
          return desk.areaID === areaID;
        });

        if (myDesk.length === this.deskList.length) {
          this.isSelectAll = true;
        } else {
          this.isSelectAll = false;
        }
      },
      bookingID
    );
  }

  //桌台点击事件
  @action
  deskItemClick(desk) {
    let { tableCode, tableID, areaID } = desk;
    let select = !desk.select;

    this.deskList = this.deskList.map((desk, index) => {
      if (desk.tableID === tableID) {
        desk.select = select;
      }
      return desk;
    });
    if (select) {
      this.selectDesk.push({ tableCode, tableID, areaID });
    } else {
      this.selectDesk = this.selectDesk.filter((desk, index) => {
        return desk.tableID !== tableID;
      });
    }

    let arrDesk = this.deskList.filter((desk, index) => {
      return desk.select === false;
    });

    if (arrDesk.length > 0) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  //改变预订类型
  @action
  changeTypeName(typeName, index) {
    this.error.modifyError = '';
    this.error.moreError = '';
    this.tTypes[index].typeName = typeName;
  }
  //改变预订桌数
  @action
  changeBookingNum(bookingNum, index) {
    this.error.modifyError = '';
    this.error.singleError = '';
    this.error.moreError = '';
    this.tTypes[index].bookingNum = bookingNum;

    this.allBookingNum = 0;
    if (this.isMoreType) {
      this.tTypes.forEach(type => {
        this.allBookingNum += type.bookingNum * 1;
      });
    }
  }
  //改变备用桌数
  @action
  changeBackupNum(backupNum, index) {
    this.tTypes[index].backupNum = backupNum;

    this.allBackUpNum = 0;
    if (this.isMoreType) {
      this.tTypes.forEach(type => {
        this.allBackUpNum += type.backupNum * 1;
      });
    }
  }
  //改变每桌人数
  @action
  changePeopleNum(peopleNum, index) {
    this.error.modifyError = '';
    this.error.singleError = '';
    this.error.moreError = '';
    this.tTypes[index].peopleNum = peopleNum;
  }

  //选择占用桌台
  @action
  selecDeskClick() {
    this.error.deskError = '';
  }
  //桌台选择全选
  @action
  allDeskClick(key) {
    this.isSelectAll = !this.isSelectAll;

    if (this.isSelectAll) {
      this.deskList = this.deskList.map((desk, index) => {
        desk.select = true;
        return desk;
      });
      if (key * 1 === 0) {
        this.selectDesk = [];
        this.selectDesk = this.deskList.map((desk, index) => {
          let { tableCode, tableID, areaID } = desk;
          return { tableCode, tableID, areaID };
        });
      } else {
        let areaID = this.areaList[key].areaID;
        this.selectDesk = this.selectDesk.filter((desk, index) => {
          return desk.areaID !== areaID;
        });
        this.deskList.forEach((desk, index) => {
          let { tableCode, tableID, areaID } = desk;
          this.selectDesk.push({ tableCode, tableID, areaID });
        });
      }
    } else {
      this.deskList = this.deskList.map((desk, index) => {
        desk.select = false;
        return desk;
      });
      if (key * 1 === 0) {
        this.selectDesk = [];
      } else {
        let areaID = this.areaList[key].areaID;
        this.selectDesk = this.selectDesk.filter((desk, index) => {
          return desk.areaID !== areaID;
        });
      }
    }
  }

  //添加类型
  @action
  addTTypes() {
    this.tTypes.push({
      typeName: '',
      bookingNum: '',
      backupNum: '',
      peopleNum: '',
      amount: '',
      actualAmount: '',
      totalAmount: '',
      banquetComboID: '',
      banquetComboName: '',
      cart: ''
    });
  }

  //跳转时字段检测
  checkInfoData = value => {
    let {
      customerName,
      phone,
      partyName,
      duration,
      bookingTime
    } = this.banquetMessage;

    let isCustomer = false,
      isPhone = false,
      isPartyName = false,
      isDuration = false,
      isSelectDesk = false,
      isSingleType = false,
      isMoreDeskType = true,
      isBookingTime = true;

    if (customerName) {
      this.error.customerError = '';
      isCustomer = true;
    } else {
      this.error.customerError = ' 姓名不能为空';
      isCustomer = false;
    }

    if (/^1[34578]\d{9}$/.test(phone)) {
      this.error.phoneError = '';
      isPhone = true;
    } else {
      this.error.phoneError = '请输入正确的电话号码';
      isPhone = false;
    }

    if (partyName) {
      this.error.partyNameError = '';
      isPartyName = true;
    } else {
      this.error.partyNameError = '宴会名称不能为空';
      isPartyName = false;
    }

    //如果是创建   才判断预订时间
    if (value) {
      let myTime = moment()
        .add(1, 'days')
        .format('YYYY-MM-DD');
      let myBookingTime = bookingTime.split(' ')[0];
      if (moment(myBookingTime).isBefore(myTime)) {
        message.destroy();
        message.warn('只能预订明天以及以后的', 1);
        isBookingTime = false;
      } else {
        isBookingTime = true;
      }
    }

    if (duration > 0) {
      this.error.durationError = '';
      isDuration = true;
    } else {
      this.error.durationError = '预计用时必须大于0';
      isDuration = false;
    }

    if (this.selectDesk.length > 0) {
      this.error.deskError = '';
      isSelectDesk = true;
    } else {
      this.error.deskError = '占用桌台数量要大于0';
      isSelectDesk = false;
    }

    if (!this.isMoreType) {
      //单种
      if (this.tTypes[0].bookingNum > 0 && this.tTypes[0].peopleNum > 0) {
        this.error.singleError = '';
        isSingleType = true;
      } else {
        this.error.singleError = '数量必须大于0';
        isSingleType = false;
      }
    } else {
      //多种
      this.error.moreError = '';

      if (this.tTypes.length < 2) {
        isMoreDeskType = false;
        this.error.moreError = '数量不能为空, 且至少要设置2个以上的桌台类型';
      } else {
        this.tTypes.forEach((type, index) => {
          let { typeName, bookingNum, peopleNum, cart } = type;

          if (typeName && bookingNum && peopleNum) {
            isMoreDeskType = true;
            this.error.moreError = '';
          } else {
            isMoreDeskType = false;
            this.error.moreError = '数量不能为空, 且至少要设置2个以上的桌台类型';
          }
          if (cart === '') {
            isMoreDeskType = false;
            message.destroy();
            message.info('请先点菜', 1);
          }
        });
      }
    }

    return {
      isCustomer,
      isPhone,
      isPartyName,
      isDuration,
      isSelectDesk,
      isSingleType,
      isMoreDeskType,
      isBookingTime
    };
  };
  //单种类型跳到点菜界面
  @action
  toDishes() {
    let {
      isCustomer,
      isPhone,
      isPartyName,
      isDuration,
      isSelectDesk,
      isSingleType,
      isBookingTime
    } = this.checkInfoData(1);

    if (
      isCustomer &&
      isPhone &&
      isPartyName &&
      isDuration &&
      isSelectDesk &&
      isSingleType &&
      isBookingTime
    ) {
      let object = {
        banquetMessage: this.banquetMessage,
        tTypes: this.tTypes,
        currentBanquetType: this.currentBanquetType,
        selectDesk: this.selectDesk,
        isMoreType: this.isMoreType
      };
      browserHistory.push({
        pathname: '/dishes',
        state: {
          dishesType: 'banquet',
          orderInfo: {
            partyName: this.banquetMessage.partyName,
            customerName: this.banquetMessage.customerName,
            tableNum: this.tTypes[0].bookingNum,
            backupNum: this.tTypes[0].backupNum,
            peopleNum: this.tTypes[0].peopleNum,
            saveData: JSON.stringify(object)
          },
          nextUrl: '/banquet/dishes'
        }
      });
    }
  }
  //多种类型 跳到菜品列表
  @action
  moreToDishesList() {
    this.moreTypeIndex = 0;
    let {
      isCustomer,
      isPhone,
      isPartyName,
      isDuration,
      isSelectDesk,
      isMoreDeskType,
      isBookingTime
    } = this.checkInfoData(1);

    if (
      isCustomer &&
      isPhone &&
      isPartyName &&
      isDuration &&
      isSelectDesk &&
      isMoreDeskType &&
      isBookingTime
    ) {
      let object = {
        allBookingNum: this.allBookingNum,
        allBackUpNum: this.allBackUpNum,
        allMoney: this.allMoney,
        banquetMessage: this.banquetMessage,
        tTypes: this.tTypes,
        currentBanquetType: this.currentBanquetType,
        selectDesk: this.selectDesk,
        isMoreType: this.isMoreType
      };
      browserHistory.push({
        pathname: '/banquet/dishes',
        state: {
          saveData: JSON.stringify(object)
        }
      });
    }
  }

  //多种类型删除单条记录
  @action
  deleteTypeItem(index) {
    this.tTypes.splice(index, 1);

    this.allBookingNum = 0;
    this.allBackUpNum = 0;

    if (this.isMoreType) {
      this.tTypes.forEach(type => {
        this.allBookingNum += type.bookingNum * 1;
        this.allBackUpNum += type.backupNum * 1;
      });
    }
  }
  //复制给新的类型
  @action
  copyDishesType(typeIndex, typeName, bookingNum, backupNum, personNum) {
    this.error.moreError = '';

    let object = {
      typeName: typeName,
      bookingNum: bookingNum,
      backupNum: backupNum,
      peopleNum: personNum,
      amount: this.tTypes[typeIndex].amount,
      actualAmount: this.tTypes[typeIndex].actualAmount,
      totalAmount: this.tTypes[typeIndex].totalAmount,
      banquetComboID: this.tTypes[typeIndex].banquetComboID,
      banquetComboName: this.tTypes[typeIndex].banquetComboName,
      cart: this.tTypes[typeIndex].cart
    };

    this.tTypes.push(object);

    this.allBookingNum = 0;
    this.allBackUpNum = 0;

    if (this.isMoreType) {
      this.tTypes.forEach(type => {
        this.allBookingNum += type.bookingNum * 1;
        this.allBackUpNum += type.backupNum * 1;
      });
    }
  }
  //多种类型跳到点菜界面
  @action
  moreDishesClick(index, cart) {
    this.moreTypeIndex = index;

    let { typeName, bookingNum, peopleNum } = this.tTypes[index];
    if (typeName && bookingNum && peopleNum) {
      let object = {
        banquetMessage: this.banquetMessage,
        tTypes: this.tTypes,
        currentBanquetType: this.currentBanquetType,
        selectDesk: this.selectDesk,
        isMoreType: this.isMoreType
      };
      if (cart) {
        browserHistory.push({
          pathname: '/dishes',
          state: {
            dishesType: 'banquet',
            orderInfo: {
              partyName: this.banquetMessage.partyName,
              customerName: this.banquetMessage.customerName,
              tableNum: this.tTypes[index].bookingNum,
              backupNum: this.tTypes[index].backupNum,
              peopleNum: this.tTypes[index].peopleNum,
              saveData: JSON.stringify(object)
            },
            nextUrl: '/banquet/create',
            cart: JSON.stringify(cart)
          }
        });
      } else {
        browserHistory.push({
          pathname: '/dishes',
          state: {
            dishesType: 'banquet',
            orderInfo: {
              partyName: this.banquetMessage.partyName,
              customerName: this.banquetMessage.customerName,
              tableNum: this.tTypes[index].bookingNum,
              backupNum: this.tTypes[index].backupNum,
              peopleNum: this.tTypes[index].peopleNum,
              saveData: JSON.stringify(object)
            },
            nextUrl: '/banquet/create'
          }
        });
      }
    } else {
      message.destroy();
      message.warn('请先填类型名称和数量', 2);
    }
  }

  //多种类型 获取购物车信息

  @action
  moreGetDishes(cart) {
    let myCart = JSON.parse(cart);

    let shoppingCart = myCart.shoppingCart.map((item, index) => {
      item.serveOrder = index + 1;
      return item;
    });
    myCart.shoppingCart = shoppingCart;
    this.tTypes[this.moreTypeIndex].cart = myCart;
  }

  /**********************************************添加确认界面*****************************************************/

  //新增预订
  @action
  saveBanquetBooking(data, callBack) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/saveBooking',
      method: 'POST',
      data: { requestBody: JSON.stringify(data) },
      success: function(json) {
        //console.log("saveBooking",json);
        if (json.code === 0) {
          _this.clearMessage();
          callBack && callBack(true, '新增成功');
        } else {
          callBack && callBack(false, json.message);
        }
      }
    });
  }

  //修改查询出所有信息
  @action
  getBookingUpdateInfo(bookingID, callBack) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/getBookingUpdateInfo',
      data: { bookingID: bookingID },
      success: function(json) {
        // console.log("getBookingUpdateInfo",json);
        if (json.code === 0) {
          let value = json.data;

          let openTime = moment(value.openTime).format('HH:mm');

          _this.banquetMessage.customerName = value.customerName;
          _this.banquetMessage.gendar = value.gender;
          _this.banquetMessage.phone = value.phone;
          _this.banquetMessage.partyName = value.partyName;
          _this.banquetMessage.bookingTime = value.bookingTime;
          _this.banquetMessage.openTime = openTime;
          _this.banquetMessage.duration = value.duration;
          _this.banquetMessage.bookingMemo = value.bookingDesc
            ? value.bookingDesc
            : '';
          _this.banquetMessage.layoutSite = value.layoutSite
            ? value.layoutSite
            : '';
          _this.banquetMessage.dressTable = value.dressTable
            ? value.dressTable
            : '';
          _this.banquetMessage.audio = value.audio ? value.audio : '';
          _this.banquetMessage.tempNum = value.tempNum ? value.tempNum : '';
          _this.banquetMessage.bookingAmount = value.bookingAmount;

          _this.selectDesk = value.tables;
          _this.tTypes = value.tTypes;

          if (_this.tTypes.length > 1) {
            _this.isMoreType = true;
          } else {
            _this.isMoreType = false;
          }

          let allBookingNum = 0,
            allBackUpNum = 0;

          _this.tTypes.forEach(type => {
            allBookingNum += type.bookingNum * 1;
            allBackUpNum += type.backupNum * 1;
          });

          _this.allBookingNum = allBookingNum;
          _this.allBackUpNum = allBackUpNum;

          let currentBanquetType;
          value.bTypes.forEach(type => {
            if (type.partyType === value.partyType) {
              currentBanquetType = type;
            }
          });

          _this.currentBanquetType = currentBanquetType;

          callBack && callBack();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //创建界面回退
  @action
  createGoBack() {
    browserHistory.push('/banquet/records');
    this.clearMessage();
  }

  //跳到修改界面
  @action
  modifyBanquetClick(bookingID, bookingAmount) {
    this.getBookingUpdateInfo(bookingID, () => {
      browserHistory.push({
        pathname: '/banquet/create',
        state: {
          from: 'modify',
          bookingID: bookingID,
          bookingAmount: bookingAmount
        }
      });
    });
  }

  //修改下一步
  @action
  modifyNextClick(bookingID) {
    let {
      isCustomer,
      isPhone,
      isPartyName,
      isDuration,
      isSelectDesk
    } = this.checkInfoData(0);

    let isToNext = true;
    if (this.tTypes.length > 1) {
      this.tTypes.forEach(type => {
        let { typeName, bookingNum, peopleNum } = type;
        if (typeName && bookingNum && peopleNum) {
        } else {
          isToNext = false;
          return;
        }
      });
      if (isToNext) {
        this.error.modifyError = '';
      } else {
        this.error.modifyError = '类型名称不为空，且数量必须大于0';
      }
    } else {
      if (this.tTypes[0].bookingNum && this.tTypes[0].peopleNum) {
        this.error.modifyError = '';
        isToNext = true;
      } else {
        isToNext = false;
        this.error.modifyError = '数量必须大于0';
      }
    }

    if (
      isCustomer &&
      isPhone &&
      isPartyName &&
      isDuration &&
      isSelectDesk &&
      isToNext
    ) {
      let object = {
        currentBanquetType: this.currentBanquetType,
        isMoreType: this.isMoreType,
        selectDesk: this.selectDesk,
        banquetMessage: this.banquetMessage,
        tTypes: this.tTypes,
        bookingID: bookingID
      };
      browserHistory.push({
        pathname: '/banquet/modify-beposit',
        state: {
          saveData: JSON.stringify(object)
        }
      });
    }
  }

  //修改确认
  @action
  modifyOkClick(data) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/updateBooking',
      data: { requestBody: data },
      success: function(json) {
        //console.log("updateBooking",json);
        if (json.code === 0) {
          message.destroy();
          message.success('修改成功', 1);

          browserHistory.push('/banquet/records');
          _this.clearMessage();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //修改原因查询

  @action
  getBookingUpdateReasons() {
    let _this = this;
    getJSON({
      url: '/banquet/booking/getBookingUpdateReasons',
      data: {},
      success: function(json) {
        //console.log("UpdateReasons",json);
        if (json.code === 0) {
          _this.updateReasons = json.data.cause;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //取消原因查询
  @action
  getCancelReason() {
    let _this = this;
    getJSON({
      url: '/banquet/booking/getCancelReason',
      data: {},
      success: function(json) {
        // console.log("CancelReason",json);
        if (json.code === 0) {
          _this.cancelReasons = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //取消预定查询接口
  @action
  toCancelBooking(bookingID) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/toCancelBooking',
      data: { bookingID: bookingID },
      success: function(json) {
        //console.log("CancelReason",json);
        if (json.code === 0) {
          _this.cancelMessage = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //取消预定提交
  @action
  cancelBanquetClick(bookingID, reason, backAmount, callback) {
    getJSON({
      url: '/banquet/booking/cancelBooking',
      data: {
        bookingID: bookingID,
        reason: reason,
        backAmount: backAmount
      },
      success: function(json) {
        //console.log("cancelBooking",json);
        if (json.code === 0) {
          message.destroy();
          message.success('取消预订成功', 1);

          callback && callback();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  /***************************预订开台*******************************/
  //预订开台查询接口
  @action
  toOpenTable(bookingID) {
    let _this = this;
    getJSON({
      url: '/banquet/toOpenTable',
      data: { banquetBookingID: bookingID },
      success: function(json) {
        //  console.log("toOpenTable",json);
        if (json.code === 0) {
          _this.openTableMessage = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //开台打厨
  @action
  openKitchen(bookingID, typeList, callback) {
    getJSON({
      url: '/banquet/openTableAndIssue',
      data: { banquetBookingID: bookingID, typeList: JSON.stringify(typeList) },
      success: function(json) {
        // console.log("toOpenTable",json);
        if (json.code === 0) {
          message.destroy();
          message.success('开台成功');
          callback && callback();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //开台不打厨

  @action
  openNotKitchen(bookingID, typeList, callback) {
    getJSON({
      url: '/banquet/openTable',
      data: { banquetBookingID: bookingID, typeList: JSON.stringify(typeList) },
      success: function(json) {
        // console.log("openTable",json);
        if (json.code === 0) {
          message.destroy();
          message.success('开台成功');

          callback && callback();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  /***************************结账**********************************/

  //获取菜品和头部信息
  @action
  getSettlememtDetail(bookingID, callback, checkOpenClass) {
    let _this = this;
    getJSON({
      url: '/banquet/booking/settle',
      data: { bookingID: bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.settlementInfo = json.data;
          let pendingAmount, discountAmount, adjustAmount, hasPayMoney;
          pendingAmount = _this.settlementInfo.costDetail.TotalPendingAmount;
          discountAmount = _this.settlementInfo.costDetail.DiscountAmount || 0;
          adjustAmount = _this.settlementInfo.costDetail.AdjustmentAmount || 0;
          hasPayMoney = _this.settlementInfo.costDetail.ReceiveAmount || 0;

          callback &&
            callback(pendingAmount, discountAmount, adjustAmount, hasPayMoney);
        } else if (json.code === 1600) {
          checkOpenClass && checkOpenClass();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //调整费用接口
  @action
  adjustAmount({ bookingID, adjustType, adjustAmount, reason }, callback) {
    let madjustAmount;
    if (adjustType === '+') {
      madjustAmount = adjustAmount;
    } else {
      madjustAmount = -adjustAmount;
    }
    getJSON({
      url: '/banquet/booking/adjustAmount',
      data: { bookingID, adjustAmount: madjustAmount, reason },
      success: function(json) {
        // console.log("adjustAmount",json);
        if (json.code === 0) {
          message.destroy();
          message.success('调整费用成功', 1);

          let pendingAmount = json.data.TotalPendingAmount;
          callback && callback(pendingAmount);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //退款时获取原因
  @action
  getAdjustReason() {
    let _this = this;
    getJSON({
      url: '/banquet/booking/getAdjustAmountReason',
      success: function(json) {
        // console.log("adjustReason",json);
        if (json.code === 0) {
          _this.adjustReasons = json.data;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //获取所有的支付方式
  @action
  getPaymentMethod() {
    let _this = this;
    getJSON({
      url: '/reception/payment/getPaymentMethod.action',
      success: function(json) {
        //console.log("getPaymentMethod",json);
        if (json.code === 0) {
          _this.paymentMethod = json.resultList;
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  //线上支付
  @action
  onlinePayment(
    { bookingID, paymentAmount, paymentMethod, authCode },
    callback
  ) {
    getJSON({
      url: '/banquet/payment/onlinePayment',
      timeout: 30 * 1000,
      data: {
        bookingID,
        paymentAmount: (1 * paymentAmount).toFixed(2),
        paymentMethodID: paymentMethod,
        authCode
      },
      success: function(json) {
        if (json.code === 521) {
          message.destroy();
          message.success(json.message, 1);

          callback && callback(false);
        } else {
          message.destroy();
          message.warn(json.message, 1);

          callback && callback(true);
        }
      }
    });
  }

  //线上支付确认
  @action
  doAffirmPaySettle({ bookingID, paymentAmount, paymentMethodID }) {
    getJSON({
      url: '/banquet/booking/doAffirmPaySettle',
      data: { bookingID, paymentAmount, paymentMethodID },
      success: function(json) {
        if (json.code === 0) {
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
  //结账确认接口
  @action
  doSettle(
    { bookingID, settleAmounts, paymentMethodIDs, acountPay, discountAmount },
    callBack
  ) {
    getJSON({
      url: '/banquet/booking/doSettle',
      data: {
        bookingID,
        settleAmounts: settleAmounts.toString(),
        paymentMethodIDs: paymentMethodIDs.toString(),
        accountPay: acountPay,
        discountAmount
      },
      success: function(json) {
        if (json.code === 0) {
          callBack && callBack(true, '结账成功');
        } else {
          callBack && callBack(false, json.message);
        }
      }
    });
  }

  //开发票

  @action
  invoice({ bookingID, invoiceInfo }, callBack) {
    getJSON({
      url: '/banquet/payment/invoice',
      data: { bookingID, invoiceInfo: JSON.stringify(invoiceInfo) },
      success: function(json) {
        if (json.code === 0) {
          message.destroy();
          message.success('开发票成功', 1);
          callBack && callBack();
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }

  // 折扣提交数据

  @action
  discountAmount({ bookingID, discountAmount }, callback) {
    getJSON({
      url: '/banquet/booking/discountAmount',
      data: { bookingID, discountAmount },
      success: function(json) {
        if (json.code === 0) {
          let pendingAmount = json.data.TotalPendingAmount;
          callback && callback(pendingAmount);
        } else {
          message.destroy();
          message.warn(json.message, 1);
        }
      }
    });
  }
}

export default new banquetCreateStore();
