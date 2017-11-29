/**
* @author huangjingjing
* @description 沽清
* @date 2017-05-16
**/
import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
// import Mock from 'mockjs';
import { message } from 'antd';

//格式化日期
function formatTime() {
  var year = new Date().getFullYear();
  var month = new Date().getMonth() + 1;
  if (month <= 9) {
    month = '0' + month;
  }
  var day = new Date().getDate();
  if (day <= 9) {
    day = '0' + day;
  }

  return year + '-' + month + '-' + day;
}

class SelloutStore {
  @observable operatetypeList; //获取操作人列表list
  @observable operatetype; //更改类型
  @observable commodityclassifyList; //获取商品分类list
  @observable commoditytype; //更改商品类型
  @observable selloutList; //沽清列表

  @observable pageNum; //菜品列表页码
  @observable searchCode; //搜索菜品字符
  @observable firstCategoryID; //一级菜单ID
  @observable secondCategoryID; //二级菜单ID

  @observable firstCategoryList; //一级菜单列表
  @observable secondCategoryList; //二级菜单列表
  @observable dishesList; //当前分类菜品列表

  @observable optionIDSum; //id

  @observable selloutmessageList; //沽清菜品信息列表
  @observable standard; //类型
  @observable reservenum; //预定数量
  @observable estimatenum; //沽清数量
  @observable temp; //键盘值
  @observable messageobj; //列表对象
  @observable subscript; //储存下标
  @observable menuname; //储存菜品的名字
  @observable tempnum; //临时存储数字
  @observable addorreduce; //判断添加/减少/报损/沽清/删除
  @observable addorreducename; //判断添加/减少/报损/沽清/删除(名称)
  @observable afterobj; //判断添加/减少/报损/沽清/删除(传值参数)
  @observable reasonlist; //原因列表
  @observable reasontext; //选中的原因内容
  @observable Importtype; //导入的类型
  @observable datetime; //日期

  @observable Operationhistorylist; //历史纪录集合
  @observable feedback; //操作结果反馈
  @observable currentdate; //获取当前日期

  @observable Takeeffect; //判断是否生效

  @observable savetypeid; //默认选中类型文本
  @observable saveshop; //默认选中商品分类的文本id二级的

  @observable savemenuID; //菜单ID（必填）

  @observable lastcombination;
  @observable inputIndex;
  @observable Quantity;
  @observable recordValue;
  @observable whatsellout;
  @observable fillindate;
  @observable showright;
  @observable privilegeCode;
  @observable beforevalue;

  constructor() {
    this.operatetypeList = [];

    this.operatetype = {
      TypeID: '',
      typeName: ''
    };

    this.reasontext = {};

    this.commodityclassifyList = [];

    this.commoditytype = {
      classifyID: '0', //0默认是全部分类
      classifyName: ''
    };

    this.selloutList = [];

    this.pageNum = 1;
    this.searchCode = '';
    this.firstCategoryID = '';
    this.secondCategoryID = '';

    this.firstCategoryList = [];
    this.secondCategoryList = [];
    this.dishesList = [];

    this.optionIDSum = '';
    this.selloutmessageList = [];

    this.standard = '';
    this.reservenum = '';
    this.estimatenum = '';

    this.listaa = [];
    this.temp = '';
    this.messageobj = '';
    this.subscript = '';
    this.menuname = '';
    this.tempnum = '';
    this.addorreduce = '';
    this.addorreducename = '';
    this.afterobj = {
      mappingID: '', //关联编号(必填)
      menuID: '', //商品编码(必填)
      needWeigh: '', //需要称重(必填)
      productName: '', //名称(传值显示)
      optionName: '' //规格(传值显示)
    };

    this.reasonlist = [];

    this.Importtype = '1'; //默认是全部导入
    this.datetime = formatTime(); //改变之后的日期

    this.Operationhistorylist = [];

    this.feedback = null;

    this.currentdate = formatTime(); //当前日期
    this.Takeeffect = false;
    this.savetypeid = '';
    this.saveshop = '0'; //商品分类默认是全部的  0代表全部
    this.savemenuID = '';

    //一级分类存储
    this.onelevel = {
      onelevelid: '',
      onelevelname: ''
    };

    this.lastcombination = {
      lastid: '0',
      lastname: '',
      lastkey: '0'
    };

    this.inputIndex = 0;
    this.Quantity = 0;
    this.recordValue = '';
    this.whatsellout = true;
    this.fillindate = '';
    this.showright = false;
    this.privilegeCode = '';
    this.beforevalue = '';
  }

  //设置时间
  @action
  setdatetime(value) {
    this.datetime = value;
  }

  //获取一级菜单列表
  @action
  getFirstCategoryList() {
    let _this = this;
    getJSON({
      url: '/reception/curbsale/getCategoryListForCommon.action',
      success: function(json) {
        if (json.code === 0 && json.data) {
          _this.firstCategoryID = String(json.data[0].categoryID);

          _this.firstCategoryList = json.data;

          //手动追加【全部】分类
          _this.firstCategoryList.unshift({
            categoryID: '0',
            categoryName: '全部',
            children: [
              {
                categoryID: '0',
                categoryName: '全部'
              }
            ]
          });

          _this.firstCategoryID = String(_this.firstCategoryList[0].categoryID); //默认第一级分类被选中

          //默认选中第一个一级分类
          if (_this.firstCategoryList.length) {
            _this.getSecondCategoryList(_this.firstCategoryID);
          } else {
            _this.secondCategoryList = [];
            _this.dishesList = [];
          }
        } else {
          _this.firstCategoryID = '0';
          _this.firstCategoryList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //获取二级菜单列表
  @action
  getSecondCategoryList(categoryID) {
    this.firstCategoryID = categoryID;
    this.firstCategoryList.forEach(category => {
      if (category.children && String(category.categoryID) === categoryID) {
        this.secondCategoryID =
          category.children.length && String(category.children[0].categoryID);
        this.secondCategoryList = category.children;
      }
    });

    //默认选中第一个二级分类
    if (this.secondCategoryList.length) {
      if (this.secondCategoryList.length)
        this.getDishesList({ categoryID: this.secondCategoryID });
    } else {
      //如果二级分类没有数据直接使用一级分类ID获取菜品
      this.getDishesList({ categoryID });
      // this.secondCategoryID = categoryID;
    }
  }

  //分页获取菜品列表categoryID:一级和二级分类共同的id   searchCode：搜索的文本框的值    type：分页类型
  @action
  getDishesList({ categoryID = '0', searchCode = '' }) {
    let _this = this;
    // if(searchCode){
    //   this.firstCategoryID = '0';
    //   this.firstCategoryList.forEach((category) => {
    //     if(category.children && String(category.categoryID) === '0') {
    //       this.secondCategoryID = '0';
    //       this.secondCategoryList = category.children;
    //     }
    //   });
    // }else{
    // console.log( categoryID,categoryID === '0',"*******************")
    if (String(categoryID) === '0') {
      this.secondCategoryID = this.secondCategoryID;
    } else {
      this.secondCategoryID = String(categoryID);
    }
    //   this.searchCode = '';
    // }
    getJSON({
      url: '/reception/curbsale/getProductList.action',
      data: { categoryID, searchCode },
      success: function(json) {
        if (json.code === 0) {
          _this.dishesList = json.data.map(dishes => {
            return dishes;
          });
        } else if (json.code === 4) {
          _this.dishesList = [];
        } else {
          _this.dishesList = [];
          // _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //查询沽清菜品信息和预定信息
  @action
  getselloutMessage(menuID, success) {
    let _this = this;
    let requireData = { menuID: menuID };

    getJSON({
      url: '/reception/curbsale/getProductInfoAndBookingInfo.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.messageobj = json.data;
          _this.selloutmessageList = json.data.list.map(msgobj => {
            msgobj.changevalue = false;
            msgobj.emptyvalue = false;
            return msgobj;
          });
          success && success(_this.messageobj);
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //生效前删除沽清列表的操作
  @action
  delselloutlist(mappingID) {
    let _this = this;
    let requireData = {
      mappingID: mappingID
    };

    getJSON({
      url: '/reception/curbsale/curbSaleOperationBeforeStartUp.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.getselloutList({ storeDay: _this.datetime }); //重新刷新沽清列表  0是代表全部类型的

          _this.getDishesList({
            categoryID: _this.secondCategoryID,
            searchCode: _this.recordValue
          }); //重新菜品列表
          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //按规格的时候取值
  @action
  setvalue(standard, reservenum, estimatenum) {
    this.standard = standard;
    this.reservenum = reservenum;
    this.estimatenum = estimatenum;
  }

  //添加
  @action
  addmessagevalue(curbSaleList, menuID, isAccOptionCureSale, success) {
    let _this = this;
    let requireData = {
      curbSaleList: JSON.stringify(curbSaleList),
      menuID: menuID,
      isAccOptionCureSale: isAccOptionCureSale
    };
    getJSON({
      url: '/reception/curbsale/addOrUpdateCrubSale.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          success && success();
          _this.showFeedback({ status: 'success', msg: json.message });
          _this.getselloutList({
            storeDay: _this.datetime,
            categoryID:
              _this.lastcombination.lastid === ''
                ? '0'
                : _this.lastcombination.lastid,
            searchContent: _this.beforevalue
          }); //重新刷新沽清列表
          _this.recordValue = '';
          _this.getDishesList({
            categoryID: _this.secondCategoryID,
            searchCode: _this.recordValue
          }); //重新菜品列表
          _this.inputIndex = 0;
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //加载沽清列表storeDay:日期   categoryID:商品分类ID  searchContent：搜索内容
  @action
  getselloutList({ storeDay = '', categoryID = '0', searchContent = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/curbsale/getCurbSaleList.action',
      data: { storeDay, categoryID, searchContent },
      success: function(json) {
        if (json.code === 0) {
          _this.selloutList = json.data.map((sellout, i) => {
            sellout.index = i;
            sellout.selected = false;
            return sellout;
          });
        } else if (json.code === 4) {
          _this.selloutList = [];
        } else {
          _this.selloutList = [];
          // _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //勾选中
  @action
  checkedselloutList(TypeID) {
    this.selloutList = this.selloutList.map(sellout => {
      sellout.selected = sellout.index === TypeID;
      return sellout;
    });
  }

  //清空数组
  @action
  emptylist() {
    this.selloutmessageList = [];
  }

  //加载操作类型列表
  @action
  getselectOperateType() {
    let _this = this;
    getJSON({
      url: '/reception/curbsale/queryOperationTypeList.action',
      success: function(json) {
        if (json.code === 0) {
          _this.operatetypeList = json.data.map(operate => {
            return operate;
          });
          //手动追加【全部】分类
          _this.operatetypeList.unshift({
            OperationType: '',
            CatalogName: '全部'
          });
        } else {
          _this.operatetypeList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //更改操作类型
  @action
  changeOperateType(TypeID, typeName) {
    this.operatetype = {
      TypeID: TypeID,
      typeName: typeName
    };
  }

  //加载商品分类列表
  @action
  getcommodityclassify() {
    let _this = this;

    /******** Mock数据模拟 *********/
    // let json = Mock.mock({
    //   "code": 0,
    //   "data|5-8": [{
    //     "categoryName": "@cword(2, 5)",
    //     "categoryID": '@id',
    //     'children|5-10': [{
    //       "categoryName": "@cword(2, 5)",
    //       "categoryID": '@id'
    //     }]
    //   }],
    //   "timestamp": '1111111111',
    //   "message": '成功'
    // });

    // if(json.code === 0) {
    //   _this.commodityclassifyList = json.data.map((commodity) => {
    //     return commodity;
    //   })
    // }else {
    //   _this.commodityclassifyList = [];
    //  console.log("没有更多数据");
    // }
    // return;
    /******** Mock数据模拟 *********/

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
                categoryName: '全部'
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

  //更改操作类型
  @action
  changecommodityclassify(classifyID, classifyName) {
    this.commoditytype = {
      classifyID: classifyID,
      classifyName: classifyName
    };
  }

  //判断添加/减少/报损/沽清
  @action
  getaddorreduce(value) {
    //1:添加   2：减少  3：报损  4：沽清  5：删除
    this.addorreduce = value;
    if (Number(value) === 1) {
      this.addorreducename = '增加沽清数量';
      this.privilegeCode = 'AddCount';
    } else if (Number(value) === 2) {
      this.addorreducename = '减少沽清数量';
      this.privilegeCode = 'ReduceCount';
    } else if (Number(value) === 3) {
      this.addorreducename = '制作报损';
      this.privilegeCode = 'MakingNewspaperLoss';
    } else if (Number(value) === 4) {
      this.addorreducename = '沽清';
    }
  }

  //添加/减少/报损/沽清(接受参数/设置参数)
  @action
  getafterobj(sellout, Quantity) {
    this.afterobj = {
      mappingID: sellout.mappingID, //关联编号(必填)
      menuID: sellout.menuID, //商品编码(必填)
      needWeigh: sellout.needWeigh, //需要称重(必填)
      productName: sellout.productName, //名称(传值显示)
      optionName: sellout.optionLabel //规格(传值显示)
    };
    this.Quantity = Quantity;
  }

  //添加/减少/报损 确定事件
  @action
  determinebotton(quantity, changeReason, success) {
    let _this = this;
    let requireData;
    if (quantity === '') {
      requireData = {
        mappingID: this.afterobj.mappingID, //关联编号
        menuID: this.afterobj.menuID, //商品编码
        needWeigh: this.afterobj.needWeigh, //需要称重
        changeType: this.addorreduce, //变动类别
        changeReason: changeReason //变动原因
      };
    } else {
      requireData = {
        mappingID: this.afterobj.mappingID, //关联编号
        menuID: this.afterobj.menuID, //商品编码
        needWeigh: this.afterobj.needWeigh, //需要称重
        changeType: this.addorreduce, //变动类别
        quantity: quantity, //数量
        changeReason: changeReason //变动原因
      };
    }

    getJSON({
      url: '/reception/curbsale/curbSaleOperation.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          success && success();
          _this.getselloutList({
            storeDay: _this.datetime,
            categoryID:
              _this.lastcombination.lastid === ''
                ? '0'
                : _this.lastcombination.lastid,
            searchContent: _this.beforevalue
          }); //重新刷新沽清列表
          _this.showFeedback({ status: 'success', msg: json.message });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //加载原因列表
  @action
  getreasonlist(thisType) {
    //1:添加   2：减少  3：报损  4：沽清
    let _this = this;
    let requireData = { operationType: thisType };
    getJSON({
      url: '/reception/curbsale/queryChangeReasonList.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.reasonlist = json.data.map(reason => {
            reason.selected = false;
            return reason;
          });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //选中原因列表
  @action
  selectreason(reasonID) {
    this.reasonlist = this.reasonlist.map(reason => {
      reason.selected = reason.DictionaryID === reasonID;
      return reason;
    });
  }

  //取出原因文本
  @action
  getreasontext(reasonID, reasonName) {
    this.reasontext = {
      reasonID: reasonID,
      reasonName: reasonName
    };
  }

  //设置导入的类型
  @action
  setImporttype(type) {
    this.Importtype = type;
  }

  //执行导入
  @action
  implementImport(storeDay, importType) {
    let _this = this;
    let requireData = {
      storeDay: storeDay, //沽清日期
      importType: importType //导入类型 1:全部导入  2：追加导入
    };
    getJSON({
      url: '/reception/curbsale/importCurbSaleList.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.showFeedback({ status: 'success', msg: json.message });
          _this.getselloutList({
            storeDay: _this.datetime,
            categoryID:
              _this.lastcombination.lastid === ''
                ? '0'
                : _this.lastcombination.lastid,
            searchContent: _this.beforevalue
          }); //重新刷新沽清列表
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //获取操作历史的纪录
  @action
  getOperationhistory({
    storeDay = '',
    changeType = '',
    categoryID = '0',
    searchContent = ''
  }) {
    let _this = this;

    getJSON({
      url: '/reception/curbsale/getCurbSaleHistoryList.action',
      data: { storeDay, changeType, categoryID, searchContent },
      success: function(json) {
        if (json.code === 0) {
          _this.Operationhistorylist = json.data.map(history => {
            return history;
          });
        } else if (json.code === 4) {
          _this.Operationhistorylist = [];
        } else {
          _this.Operationhistorylist = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //判断是否生效
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

  @action
  saveonelevel(onelevelid, onelevelname) {
    this.onelevel = {
      onelevelid: onelevelid,
      onelevelname: onelevelname
    };
  }

  @action
  saveclassify(categoryID, categoryName) {
    this.commoditytype = {
      classifyID: categoryID,
      classifyName: categoryName
    };
  }

  @action
  savelastcombination(lastid, lastname, lastkey) {
    this.lastcombination = {
      lastid: lastid,
      lastname: lastname,
      lastkey: lastkey
    };
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

export default new SelloutStore();
