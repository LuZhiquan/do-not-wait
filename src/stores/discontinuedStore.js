/**
* @author William Cui
* @description 停售数据模型
* @date 2017-06-05
**/

import { observable, action } from 'mobx';
import { getJSON } from '../common/utils';
import { message } from 'antd';

class DiscontinuedStore {
  @observable firstCategoryID; //一级菜单ID
  @observable secondCategoryID; //二级菜单ID
  @observable feedback; //操作结果反馈

  @observable firstCategoryList; //一级菜单列表
  @observable secondCategoryList; //二级菜单列表
  @observable dishesList; //当前分类菜品列表
  @observable haltsSalesList; //停售操作列表
  @observable menuIDstring; //取消停售需要的参数
  @observable flagtbj;
  @observable savesearch;
  @observable recordValue;

  constructor() {
    this.firstCategoryID = '';
    this.secondCategoryID = '';

    this.firstCategoryList = [];
    this.secondCategoryList = [];
    this.dishesList = [];
    this.feedback = null;
    this.haltsSalesList = [];
    this.menuIDstring = '';
    this.flagtbj = false;
    this.savesearch = '';
    this.recordValue = '';
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
    if (String(categoryID) === '0') {
      this.secondCategoryID = this.secondCategoryID;
    } else {
      this.secondCategoryID = String(categoryID);
    }

    //   this.searchCode = '';
    // }

    getJSON({
      url: '/reception/haltsales/getProductListFromHaltsSales.action',
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
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //haltsSalesList停售操作列表
  @action
  getHaltsSalesList({ searchCode = '' }) {
    let _this = this;
    getJSON({
      url: '/reception/haltsales/getHaltsSalesList.action',
      data: { searchCode },
      success: function(json) {
        if (json.code === 0) {
          _this.haltsSalesList = json.data.map((halts, i) => {
            halts.index = i;
            halts.selected = false;
            halts.checkedsd = false;
            return halts;
          });
        } else if (json.code === 4) {
          _this.haltsSalesList = [];
        } else {
          _this.haltsSalesList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //添加
  @action
  addHaltsSales(menuID, success) {
    let _this = this;
    getJSON({
      url: '/reception/haltsales/addHaltsSales.action',
      data: { menuID },
      success: function(json) {
        if (json.code === 0) {
          success && success();

          _this.getDishesList({
            categoryID: _this.secondCategoryID,
            searchCode: _this.savesearch
          });
          _this.getHaltsSalesList({ searchCode: _this.recordValue });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //选中
  @action
  checkeddiscontList(menuID) {
    this.haltsSalesList = this.haltsSalesList.map(discont => {
      discont.selected = discont.menuID === menuID;
      return discont;
    });
  }

  //取消停售
  @action
  batchCancleHaltsSales(menuIDs) {
    let _this = this;
    let requireData = { menuIDs: menuIDs };
    getJSON({
      url: '/reception/haltsales/batchCancleHaltsSales.action',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.flagtbj = true;
          _this.getDishesList({
            categoryID: _this.secondCategoryID,
            searchCode: _this.savesearch
          });
          _this.getHaltsSalesList({ searchCode: _this.recordValue });
          _this.menuIDstring = '';
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

export default new DiscontinuedStore();
