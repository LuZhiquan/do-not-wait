/**
 * @author William Cui
 * @description 点菜数据模型
 * @date 2017-4-20
 **/
import { observable, action, computed } from 'mobx';
import { message } from 'antd';

import { getJSON } from '../common/utils';

function feedback(msg) {
  return {
    status: 'error',
    title: '提示',
    isOneFooter: true,
    conText: msg
  };
}

class DishesStore {
  @observable dishesType; //点菜类型 'normal', 'booking', 'banquet', 'cashier';
  @observable dishesStage; //点菜区的类别 'normal', 'spell'
  @observable orderInfo; //订单信息

  @observable searchCode; //搜索菜品字符
  @observable firstCategoryID; //一级菜单ID
  @observable secondCategoryID; //二级菜单ID

  @observable listActiveKey; //左边菜品列表当前激活的key
  @observable firstCategoryList; //一级菜单列表
  @observable secondCategoryList; //二级菜单列表
  @observable dishesList; //当前分类菜品列表
  @observable shoppingCart; //未下单菜品列表
  @observable didOrderList; //已下单菜品列表
  @observable shoppingStage; //未下单菜品暂存列表

  @observable productMessageMap; //购物车菜品配置对象
  @observable comboGroupMap; //购物车套餐详情对象

  @observable exchangeDishes; //需要换的菜品

  @observable feedback; //操作结果反馈
  @observable cartIndex; //购物车列表选中的菜品下标

  @observable untreatedDishesList; //未处理菜品列表
  @observable filterDidOrderList; //已下单筛选菜品列表

  constructor() {
    this.dishesType = 'normal';
    this.dishesStage = 'normal';
    this.orderInfo = {};

    this.searchCode = '';
    this.firstCategoryID = '';
    this.secondCategoryID = '';

    this.listActiveKey = 'willOrder';
    this.firstCategoryList = [];
    this.secondCategoryList = [];
    this.dishesList = [];
    this.shoppingCart = [];
    this.didOrderList = [];
    this.shoppingStage = [];

    this.productMessageMap = {};
    this.comboGroupMap = {};

    this.exchangeDishes = null;

    this.feedback = null;
    this.cartIndex = -1;

    this.untreatedDishesList = [];
  }

  /***************** 订单信息相关 action ********************/

  //获取订单信息
  @action
  getOrderInfo({ tableID, subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/order/getEditOrderInfo.option',
      data: { subOrderID },
      success: function(json) {
        if (json.code === 0 && json.data) {
          _this.orderInfo = json.data;
        } else {
          _this.orderInfo = [];
          _this.showFeedback({
            status: 'warn',
            msg: `订单信息，${json.message}`
          });
        }
      }
    });
    this.orderInfo.tableID = tableID;
    this.orderInfo.subOrderID = subOrderID;
    this.getDidOrderList(); //请求已下单列表
  }

  //获取订单信息
  @action
  setOrderInfo(orderInfo) {
    this.orderInfo = orderInfo;
    if (this.dishesType === 'banquetAdd') {
      this.getDidOrderList();
    }
  }

  //修改订单信息
  @action
  updateOrderInfo({ subOrderID, tableID, waiterLoginID, peopleNum, memo }) {
    let _this = this;
    getJSON({
      url: '/reception/order/updateOrderInfo.option',
      data: {
        subOrderID,
        tableID,
        waiterLoginID,
        peopleNum,
        memo
      },
      success: function(json) {
        if (json.code === 0) {
          //修改订单信息成功,重新获取订单信息
          _this.getOrderInfo({ tableID, subOrderID });
          _this.showFeedback({ status: 'success', msg: '修改订单信息成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //清空订单信息
  @action
  clearOrderInfo() {
    this.orderInfo = [];
  }

  /***************** 订单信息相关 action ********************/

  /***************** 菜品显示相关 action ********************/

  //改变左边菜品列表activeKey
  @action
  changeListKey({ key }) {
    this.listActiveKey = key;
  }

  //获取一级菜单列表
  @action
  getFirstCategoryList({
    dishesType,
    archiveID,
    tableID,
    booking,
    bookingTime
  }) {
    if (dishesType) this.dishesType = dishesType;
    let _this = this;

    let data, url;
    if (this.dishesType.indexOf('banquet') > -1) {
      //宴会点菜
      url = '/banquet/booking/getBookingCategoryList';
      data = { archiveID };
    } else if (this.dishesType === 'fast-food') {
      //快餐点菜
      url = '/reception/curbsale/getCategoryListForCommon';
    } else {
      //普通点菜
      url = '/reception/product/getCategoryInfoList.action';
      data = { tableID, subOrderID: this.orderInfo.subOrderID };
      if (bookingTime) {
        //预定点菜参数
        data.booking = 1;
        data.bookingTime = bookingTime;
      }
    }
    // debugger;

    getJSON({
      url,
      data,
      success: function(json) {
        if (json.code === 0 && json.data) {
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

          _this.firstCategoryID = String(_this.firstCategoryList[0].categoryID);

          //默认选中第一个一级分类
          if (_this.firstCategoryList.length) {
            _this.getSecondCategoryList({
              firstCategoryID: _this.firstCategoryID
            });
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
  getSecondCategoryList({ firstCategoryID }) {
    this.firstCategoryID = firstCategoryID;
    this.firstCategoryList.forEach(category => {
      if (
        category.children &&
        String(category.categoryID) === firstCategoryID
      ) {
        this.secondCategoryID =
          category.children.length && String(category.children[0].categoryID);
        this.secondCategoryList = category.children;
      }
    });

    if (this.secondCategoryList.length) {
      //默认选中第一个二级分类
      if (this.secondCategoryList.length) {
        this.getDishesList({
          dishesType: this.dishesType,
          categoryID: this.secondCategoryID
        });
      }
    } else {
      //如果二级分类没有数据直接使用一级分类ID获取菜品
      this.getDishesList({
        dishesType: this.dishesType,
        categoryID: firstCategoryID
      });
    }
  }

  //清空菜品分类
  @action
  clearCategoryList() {
    this.firstCategoryList = [];
  }

  //分页获取菜品列表
  @action
  getDishesList({ categoryID = '0', searchCode }) {
    let url;
    let data = this.orderInfo.tableID
      ? { tableID: this.orderInfo.tableID }
      : {};
    if (this.dishesType.indexOf('banquet') > -1) {
      //宴会点菜
      url = '/banquet/booking/getBookingProductList';
    } else if (this.dishesType === 'fast-food') {
      //快餐点菜
      url = '/quick/product/getQuickProductList.action';
    } else {
      //普通点菜
      url = '/reception/product/getProductList.action';
      data.subOrderID = this.orderInfo.subOrderID;
    }

    if (searchCode) {
      data.searchCode = searchCode;
      this.searchCode = searchCode;
      this.firstCategoryID = '0';
      this.firstCategoryList.forEach(category => {
        if (category.children && String(category.categoryID) === '0') {
          this.secondCategoryID = '0';
          this.secondCategoryList = category.children;
        }
      });
    } else {
      data.categoryID = categoryID;
      this.secondCategoryID = String(categoryID);
      this.searchCode = '';
    }
    if (this.orderInfo.bookingTime) {
      data.booking = 1;
      data.bookingTime = this.orderInfo.bookingTime;
    }

    let _this = this;
    getJSON({
      url,
      data,
      success: function(json) {
        if (json.code === 0) {
          if (_this.shoppingCart.length) {
            _this.dishesList = json.data;
            _this.mapQuantityToDishesList();
          } else {
            _this.dishesList = json.data;
          }
        } else if (json.code === 4) {
          _this.dishesList = [];
        } else {
          _this.dishesList = [];
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  @action
  mapQuantityToDishesList() {
    let cart = {};
    this.shoppingCart.forEach(product => {
      if (cart[product.menuID]) cart[product.menuID] += product.quantity;
      else cart[product.menuID] = product.quantity;

      if (product.assortedDishesList) {
        product.assortedDishesList.forEach(dishes => {
          const addQuantity = product.quantity * dishes.quantity;
          if (cart[dishes.menuID]) cart[dishes.menuID] += addQuantity;
          else cart[dishes.menuID] = addQuantity;
        });
      }
    });
    this.dishesList = this.dishesList.map(dishes => {
      dishes.quantity = cart[dishes.menuID] || 0;
      return dishes;
    });
  }

  //清空菜品分类
  @action
  clearDishesList() {
    this.dishesList = [];
  }

  /***************** 菜品显示相关 action ********************/

  /***************** 菜品信息相关 action ********************/

  //保存菜品配置信息
  @action
  setProductMessageMap({ cartRecordID, productMessage }) {
    this.productMessageMap[cartRecordID] = productMessage;
  }

  //保存套餐配置信息
  @action
  setComboGroupMap({ cartRecordID, comboGroup }) {
    this.comboGroupMap[cartRecordID] = comboGroup;
  }

  /***************** 菜品信息相关 action ********************/

  /***************** 未下单相关 action ********************/

  //读取localStorage里面购物车信息
  @action
  readShoppingCartFromLocalStorage({ subOrderID }) {
    if (localStorage.getItem(subOrderID)) {
      const { shoppingCart, productMessageMap, comboGroupMap } = JSON.parse(
        localStorage.getItem(subOrderID)
      );
      this.shoppingCart = shoppingCart; //读取保存的购物车信息
      this.productMessageMap = productMessageMap;
      this.comboGroupMap = comboGroupMap;
      localStorage.removeItem(subOrderID); //删除购物车信息
    }
  }
  //读取购物车信息
  @action
  readShoppingCart({ cart }) {
    this.shoppingCart = cart.shoppingCart;
    this.productMessageMap = cart.productMessageMap;
    this.comboGroupMap = cart.comboGroupMap;
    this.mapQuantityToDishesList();
  }

  //新增菜品到购物车
  @action
  addToCart({
    cartIndex,
    isStatic,
    dishes,
    productMessage,
    comboGroup,
    isFixedGroupCombo
  }) {
    let cartRecordID = dishes.cartRecordID;
    let product;
    let priceType;
    let comboList = []; //已选套餐列表
    let groupNameList = [];
    let addDishesFlag = true;

    let remainingQuantity = dishes.remainingFloatQuantity; //剩余数量
    let remaining = dishes.curbSale && remainingQuantity; //是否要显示剩余数量

    product = {
      cartRecordID: cartRecordID || Math.floor(Math.random() * 10000000000),
      productID: dishes.productID,
      variantID: dishes.variantID,
      produceStatus: dishes.needWeigh ? 830 : 693, //制作状态
      aLaCarteMethod: 684, //点菜方式
      menuID: dishes.menuID,
      productType: dishes.productType,
      productName: dishes.productName,
      price: dishes.price,
      quantity: 1, //数量
      unit: dishes.unit,
      remaining
    };

    if (productMessage) {
      //有规格，口味做法配置的单品
      let {
        specificationList, //规格可选列表
        optionID, //已选规格
        selectedAttributeList, //已选口味做法
        weight, //称重
        memo //备注
      } = productMessage;
      if (specificationList && specificationList.length && !optionID) {
        this.showFeedback({ status: 'validate', msg: '还没有选择菜品规格！' });
        return false;
      }
      if (dishes.needWeigh && !Number(weight)) {
        this.showFeedback({ status: 'validate', msg: '菜品还没有称重！' });
        return false;
      }

      let price = dishes.price,
        optionName;

      //菜品名称后面加规格
      if (optionID) {
        specificationList.forEach(specification => {
          if (specification.optionID === optionID) {
            price = specification.price;
            optionName = specification.optionName;
          }
        });
      }

      if (optionName) product.optionName = optionName; //规格名称
      if (price) product.price = price; //价格
      if (optionID) product.optionID = optionID; //规格ID
      if (selectedAttributeList && selectedAttributeList.length) {
        //口味和做法
        product.attributeList = selectedAttributeList;
        product.valueIDs = selectedAttributeList.map(attribute => {
          return attribute.valueID;
        });
        product.valueIDs = product.valueIDs.join(',');
      }
      if (dishes.needWeigh) product.needWeigh = dishes.needWeigh; //是否需要称重
      if (weight) product.expectedWeight = weight; //期望称重数量
      if (memo) product.memo = memo; //备注

      //如果没有称重的情况下同一个单品规格，口味做法和备注都相同，只是数量累加
      if (!dishes.needWeigh) {
        //判断要比较的菜品列表
        let dishesList = this.shoppingCart;
        if (this.dishesStage === 'spell') {
          this.shoppingCart.forEach(product => {
            if (product.assortedDishesList) {
              dishesList = product.assortedDishesList;
              return;
            }
          });
        }

        if (dishesList.length) {
          //遍历比较菜品
          dishesList.forEach((cartRecord, index) => {
            let memoFlag =
              (!cartRecord.memo && !memo) ||
              String(cartRecord.memo) === String(memo); //判断备注是否相同

            let valueIDsFlag =
              String(cartRecord.valueIDs)
                .split(',')
                .sort()
                .toString() ===
              String(product.valueIDs)
                .split(',')
                .sort()
                .toString(); //判断套餐是否相同

            if (
              cartRecord.menuID === dishes.menuID && //判断menuID是不是相同
              cartRecord.optionID === optionID && //判断规格是不是相同
              memoFlag &&
              valueIDsFlag
            ) {
              addDishesFlag = false;
              cartRecordID = cartRecord.cartRecordID;
              cartIndex = index;
            }
          });
        }
      }

      this.setProductMessageMap({
        //保存菜品配置信息
        cartRecordID: cartRecordID || product.cartRecordID,
        productMessage
      });
    }

    if (comboGroup) {
      //套餐
      let { groupComboList, selectedComboMap } = comboGroup;
      groupComboList.forEach(product => {
        if (
          (product.groupName &&
            !Object.keys(selectedComboMap).includes(product.groupName)) ||
          (product.groupName &&
            selectedComboMap[product.groupName] &&
            selectedComboMap[product.groupName].length < product.allowQuantity)
        ) {
          groupNameList.push(product.groupName);
        }
      });
      if (groupNameList.length) {
        //有分组没有选菜
        this.showFeedback({
          status: 'validate',
          msg: '有分组还没选菜： ' + groupNameList.join('，')
        });
        return false;
      } else {
        //已经选择套餐菜品
        let comboKeys = {}; //用于辅助判断是否是相同的口味做法
        priceType = isFixedGroupCombo
          ? selectedComboMap['头盘'][0].priceType
          : groupComboList[0].priceType; //价格类型 841：总价  842：明细合计
        Object.keys(selectedComboMap).forEach(key => {
          selectedComboMap[key].forEach((dishes, index) => {
            if (comboKeys[dishes.mappingID]) {
              comboList.forEach(combo => {
                if (combo.mappingID === dishes.mappingID)
                  combo.quantity += dishes.quantity;
              });
            } else {
              if (dishes.mappingID)
                comboKeys[dishes.mappingID] = dishes.mappingID;
              let combo = {
                cartRecordID: Math.floor(Math.random() * 10000000000),
                variantID: dishes.variantID, //变体ID
                variantName: dishes.variantName, //商品名称
                produceStatus: 693, //制作状态
                aLaCarteMethod: 684, //点菜方式
                quantity: dishes.quantity, //数量
                price: dishes.price,
                isAddPrice: priceType === 841
              };
              if (dishes.mappingID) combo.mappingID = dishes.mappingID; //套餐分组商品关联ID
              if (dishes.settingID) combo.settingID = dishes.settingID; //套餐头盘明细配置ID
              comboList.push(combo);
            }
          });
        });

        product.editCombo = groupComboList.length; //可否修改套餐明细
        product.comboList = comboList; //套餐列表
        if (priceType !== 841) product.price = 0; //不是总价的时候价格不显示

        if (!isFixedGroupCombo) {
          this.setComboGroupMap({
            cartRecordID: cartRecordID || product.cartRecordID,
            comboGroup
          }); //保存套餐配置信息
        }
      }

      if (isFixedGroupCombo) {
        this.shoppingCart.forEach((cartRecord, index) => {
          if (
            cartRecord.menuID === dishes.menuID &&
            cartRecord.aLaCarteMethod === 684
          ) {
            addDishesFlag = false;
            cartRecordID = cartRecord.cartRecordID;
            cartIndex = index;
          }
        });
      }
    }

    if (!productMessage && !comboGroup && this.shoppingCart.length) {
      this.shoppingCart.forEach((cartRecord, index) => {
        if (
          cartRecord.menuID === dishes.menuID &&
          cartRecord.aLaCarteMethod === 684
        ) {
          addDishesFlag = false;
          cartRecordID = cartRecord.cartRecordID;
          cartIndex = index;
        }
      });
    }

    //换菜
    if (this.exchangeDishes) {
      product.price = 0;
      if (product.attributeList) {
        product.attributeList = product.attributeList.map(attribute => {
          //口味做法显示
          if (attribute.addedPrice) attribute.addedPrice = 0;
          return attribute;
        });
      }
      this.shoppingCart = this.shoppingCart.map(dishes => {
        if (dishes.comboList) {
          dishes.comboList = dishes.comboList.map(combo => {
            if (combo.cartRecordID === this.exchangeDishes.cartRecordID) {
              combo = product;
            }
            return combo;
          });
        }
        this.delExchangeDishes();
        return dishes;
      });
      return true;
    }

    this.updateShoppingCart({
      productID: dishes.productID,
      variantID: dishes.variantID,
      optionID: product.optionID,
      changeQuantity: dishes.needWeigh ? product.expectedWeight : 1,
      remaining
    }).then(() => {
      //更新菜品到购物车
      if (dishes.cartRecordID) {
        this.editToCart({
          cartRecordID: dishes.cartRecordID,
          product
        });
      } else {
        if (addDishesFlag) {
          //添加已选菜品到购物车
          if (this.dishesStage === 'spell') {
            //拼菜模式
            let hasSpellDishes = false;

            //有拼菜组就加入拼菜
            this.shoppingCart = this.shoppingCart.map(dishes => {
              if (dishes.productMode === 1377) {
                dishes.assortedDishesList.push(product);
                dishes.price = this.countSpellPrice(dishes);
                hasSpellDishes = true;
              }
              return dishes;
            });

            //没有就初始化一个拼菜组后加入拼菜
            if (!hasSpellDishes) {
              this.initSpellList({ dishes: product });
            }
          } else {
            //正常模式
            this.shoppingCart.push(product);
          }

          this.dishesList = this.dishesList.map(dishes => {
            if (dishes.menuID === product.menuID && !isStatic) {
              if (!dishes.quantity) dishes.quantity = 1;
              else dishes.quantity += 1;
            }
            return dishes;
          });
        } else {
          //数量加一
          this.addedQuantityToCart(dishes.menuID, cartIndex, cartRecordID);
        }
      }

      if (this.listActiveKey !== 'willOrder') {
        //切换到购物车的tabView
        this.changeListKey({ key: 'willOrder' });
      }
      let selectedIndex =
        cartIndex > -1 ? cartIndex : this.shoppingCart.length - 1;
      this.selectWillOrder({
        cartIndex: selectedIndex,
        cartRecordID: cartRecordID || product.cartRecordID
      });
      this.setCartIndex(selectedIndex);
    });
    return true;
  }

  //复制菜品配置信息并添加到购物车
  @action
  cloneToCart({ newProduct, originProduct }) {
    this.shoppingCart.push(newProduct);
    this.selectWillOrder({
      cartIndex: this.shoppingCart.length - 1,
      cartRecordID: newProduct.cartRecordID
    });
    this.productMessageMap[newProduct.cartRecordID] = this.productMessageMap[
      originProduct.cartRecordID
    ];
    this.comboGroupMap[newProduct.cartRecordID] = this.comboGroupMap[
      originProduct.cartRecordID
    ];
    this.mapQuantityToDishesList();
  }

  //添加临时菜
  @action
  addTemporaryDishes(dishes) {
    this.shoppingCart.push(dishes);
  }

  //更新购物车菜品信息
  @action
  updateProductToCart({
    cartRecordID,
    optionID,
    optionName,
    optionPrice,
    weight,
    attributeMap,
    selectedAttributeList,
    designerID,
    designerName,
    designerPrice,
    tagIDs,
    mappingDesc,
    produceStatus,
    quantity,
    aLaCarteMethod,
    memo,
    tableID,
    tableName,
    productType,
    price
  }) {
    //口味和做法
    let valueIDs;
    if (selectedAttributeList && selectedAttributeList.length) {
      valueIDs = selectedAttributeList.map(attribute => {
        return attribute.valueID;
      });
    }

    function updateCartList(product) {
      product.optionID = optionID || product.optionID; //更新规格ID
      product.optionName = optionName || product.optionName; //更新规格名
      product.price = optionPrice || product.price; //更新价格
      product.quantity = quantity || product.quantity; //更新数量
      product.expectedWeight = weight || product.expectedWeight; //更新称重
      product.valueIDs = valueIDs || product.valueIDs; //更新口味做法ID
      product.attributeList = selectedAttributeList || product.attributeList; //更新口味做法列表
      product.designerID =
        designerID === undefined ? product.designerID : designerID; //更新厨师ID
      product.designerName =
        designerName === undefined ? product.designerName : designerName; //更新厨师名
      product.designerPrice =
        designerPrice === undefined ? product.designerPrice : designerPrice; //更新厨师名
      product.tagIDs = tagIDs === undefined ? product.tagIDs : tagIDs; //更新厨房状态标签
      product.produceStatus = produceStatus || product.produceStatus; //更新制作状态
      product.aLaCarteMethod = aLaCarteMethod || product.aLaCarteMethod; //更新点菜方式
      product.memo = memo === undefined ? product.memo : memo; //更新备注
      product.tableID = tableID || null; //保存要转的桌台ID
      product.tableName = tableName || null; //保存要转的桌台名称
      product.productType = productType || product.productType; //保存菜品类型
      product.mappingDesc = mappingDesc || product.mappingDesc; //赠菜原因
      product.price = price || product.price; //保存改价
    }

    let oldQuantity;
    //更新购物车菜品信息
    this.shoppingCart = this.shoppingCart.map(product => {
      if (cartRecordID === product.cartRecordID) {
        oldQuantity = product.quantity;
        updateCartList(product);
        //如果是套餐修改明显菜品的数量
        if (quantity && product.comboList && product.comboList.length) {
          product.comboList = product.comboList.map(combo => {
            combo.quantity = combo.quantity / oldQuantity * product.quantity;
            return combo;
          });
        }
      }

      const childs = product.comboList || product.assortedDishesList;
      if (childs && childs.length) {
        childs.forEach(child => {
          if (cartRecordID === child.cartRecordID) {
            updateCartList(child);
          }
        });
      }

      return product;
    });

    //更新菜品列表数量
    this.mapQuantityToDishesList();

    //更新购物车菜品配置信息
    let productMessage = this.productMessageMap[cartRecordID] || {};
    productMessage.optionID = optionID || productMessage.optionID; //更新规格
    // productMessage.quantity = quantity || productMessage.quantity; //更新数量
    productMessage.weight = weight || productMessage.weight || null; //更新称重
    productMessage.attributeMap =
      attributeMap || productMessage.attributeMap || null; // 更新口味做法map
    productMessage.selectedAttributeList =
      selectedAttributeList || productMessage.selectedAttributeList || null; //更新已选中口味做法列表
    productMessage.designerID = designerID || productMessage.designerID || null; //更新厨师
    productMessage.tagIDs =
      tagIDs === undefined ? productMessage.tagIDs : tagIDs; //更新厨房状态标签
    productMessage.produceStatus =
      produceStatus || productMessage.produceStatus || null; //更新制作状态
    this.setProductMessageMap({ cartRecordID, productMessage });
  }

  //编辑购物车菜品配置
  @action
  editToCart({ cartRecordID, product }) {
    this.shoppingCart = this.shoppingCart.map((cartRecord, index) => {
      if (cartRecord.cartRecordID === cartRecordID) {
        cartRecord = product;
      }
      return cartRecord;
    });
  }

  //从购物车删除菜品
  @action
  deleteFromCart(cartRecordID) {
    this.shoppingCart = this.shoppingCart.filter((cartRecord, index) => {
      if (cartRecord.comboList) {
        cartRecord.comboList = cartRecord.comboList.filter((combo, index) => {
          return combo.cartRecordID !== cartRecordID;
        });
      }
      return cartRecord.cartRecordID !== cartRecordID;
    });
    delete this.productMessageMap[cartRecordID];
    delete this.comboGroupMap[cartRecordID];
    this.mapQuantityToDishesList();
  }

  //添加未赠送原菜品
  @action
  changeOriginRecordID({ oldOriginRecordID, newOriginRecordID }) {
    this.shoppingCart = this.shoppingCart.map((cartRecord, index) => {
      if (cartRecord.originRecordID === oldOriginRecordID) {
        cartRecord.originRecordID = newOriginRecordID;
      }
      return cartRecord;
    });
  }

  //选择未下单菜品
  @action
  selectWillOrder({ cartIndex, cartRecordID }) {
    this.shoppingCart = this.shoppingCart.map((dishes, index) => {
      dishes.selected =
        cartIndex === index && dishes.cartRecordID === cartRecordID;

      const childs = dishes.comboList || dishes.assortedDishesList;
      if (childs && childs.length) {
        childs.map(child => {
          child.selected =
            cartIndex === index && child.cartRecordID === cartRecordID;
          return child;
        });
      }
      return dishes;
    });
  }

  //购物车菜品数量加 1
  @action
  addedQuantityToCart(menuID, cartIndex, cartRecordID) {
    this.changeProductquantity('add', menuID, cartRecordID);
    this.setCartIndex(cartIndex);
  }

  //修改购物车内菜品数量
  @action
  changeProductquantity(type, menuID, cartRecordID) {
    let finishSpellFlag = false;
    this.shoppingCart = this.shoppingCart.filter((dishes, index) => {
      if (dishes.cartRecordID === cartRecordID) {
        let oldQuantity = dishes.quantity;
        if (type === 'add') {
          dishes.quantity += 1;
        } else {
          dishes.quantity -= 1;
        }

        //如果是套餐修改明显菜品的数量
        if (dishes.comboList && dishes.comboList.length) {
          dishes.comboList = dishes.comboList.map(combo => {
            combo.quantity = combo.quantity / oldQuantity * dishes.quantity;
            return combo;
          });
        }

        dishes.selected = true;
      } else {
        dishes.selected = false;
      }

      if (dishes.quantity <= 0) {
        this.productMessageMap[cartRecordID] &&
          delete this.productMessageMap[cartRecordID];
        this.comboGroupMap[cartRecordID] &&
          delete this.comboGroupMap[cartRecordID];
      }

      if (dishes.assortedDishesList) {
        dishes.assortedDishesList = dishes.assortedDishesList.filter(
          spellDishes => {
            if (spellDishes.cartRecordID === cartRecordID) {
              if (type === 'add') {
                spellDishes.quantity += 1;
              } else {
                spellDishes.quantity -= 1;
              }
            }

            //如果拼菜数量小于等于0时，删除相应的配置信息
            if (spellDishes.quantity <= 0) {
              this.productMessageMap[cartRecordID] &&
                delete this.productMessageMap[cartRecordID];
              this.comboGroupMap[cartRecordID] &&
                delete this.comboGroupMap[cartRecordID];
            }

            return spellDishes.quantity > 0;
          }
        );

        //重新计算拼菜价格
        dishes.price = this.countSpellPrice(dishes);

        //如果拼菜没有明细菜就设置数量为0，删除拼菜
        if (dishes.assortedDishesList.length === 0) {
          dishes.quantity = 0;
          finishSpellFlag = true;
        }
      }

      return dishes.quantity > 0;
    });

    if (finishSpellFlag) {
      this.finishSpell();
    }

    this.mapQuantityToDishesList();
  }

  //更新购物车菜品数量通知后端
  @action
  updateShoppingCart({
    productID,
    variantID,
    optionID,
    changeQuantity,
    remaining
  }) {
    let _this = this;
    return new Promise((resolve, reject) => {
      if (this.dishesType !== 'normal') {
        //只有正餐点菜才锁定菜品
        resolve();
        return;
      }
      getJSON({
        url: '/reception/curbsale/updateShoppingCart',
        data: {
          productID,
          variantID,
          optionID,
          quantity: changeQuantity
        },
        success: function(json) {
          if (json.code === 0) {
            if (remaining) {
              _this.getDishesList({
                categoryID: _this.secondCategoryID,
                searchCode: _this.searchCode
              });
            }
            resolve();
          } else {
            _this.feedback = feedback(json.message);
          }
        }
      });
    });
  }

  @action
  updateShoppingCartForAssortedDishes(list) {
    let _this = this;
    return new Promise((resolve, reject) => {
      if (this.dishesType !== 'normal') {
        //只有正餐点菜才锁定菜品
        resolve();
        return;
      }
      getJSON({
        url: '/reception/curbsale/updateShoppingCartForAssortedDishes',
        data: { shoppingCart: JSON.stringify(list) },
        success: function(json) {
          if (json.code === 0) {
            _this.getDishesList({
              categoryID: _this.secondCategoryID,
              searchCode: _this.searchCode
            });
            resolve();
          } else {
            _this.feedback = feedback(json.message);
          }
        }
      });
    });
  }

  //批量清除购物车菜品通知后端
  @action
  cleanShoppingCart({ shoppingCart }) {
    let _this = this;
    return new Promise((resolve, reject) => {
      if (this.dishesType !== 'normal') {
        //只有正餐点菜才释放菜品
        resolve();
        return;
      }
      getJSON({
        url: '/reception/curbsale/cleanShoppingCart',
        data: { shoppingCart: JSON.stringify(shoppingCart) },
        success: function(json) {
          if (json.code === 0) {
            _this.getDishesList({
              categoryID: _this.secondCategoryID,
              searchCode: _this.searchCode
            });
            resolve();
          } else {
            _this.feedback = feedback(json.message);
          }
        }
      });
    });
  }

  //计算购物车总数量和总金额
  @computed
  get shoppingCartTotal() {
    let totalQuantity = 0,
      totalAmount = 0;
    this.shoppingCart &&
      this.shoppingCart.length &&
      this.shoppingCart.forEach(product => {
        if (product.aLaCarteMethod !== 686) {
          //非赠菜情况下价格累加
          if (product.needWeigh)
            totalAmount +=
              product.expectedWeight * product.quantity * product.price;
          else totalAmount += product.quantity * product.price;
        }
        if (product.comboList && product.comboList.length) {
          //套餐不累加数量，累加套餐明细菜品数量
          product.comboList.forEach(combo => {
            totalQuantity += combo.quantity;
            if (product.aLaCarteMethod !== 686 && combo.price)
              totalAmount += combo.quantity * combo.price;
          });
        } else {
          //其他直接累加菜品数量
          totalQuantity += product.quantity;
        }
        if (product.attributeList && product.attributeList.length) {
          //有口味做法的要统计口味做法的加价
          product.attributeList.forEach(attribute => {
            if (product.aLaCarteMethod !== 686 && attribute.addedPrice)
              totalAmount += product.quantity * attribute.addedPrice;
          });
        }
        if (product.designerPrice && product.aLaCarteMethod !== 686) {
          //加上厨师加价
          totalAmount += product.quantity * product.designerPrice;
        }
      });

    return { totalQuantity, totalAmount };
  }

  //下单操作
  @action
  addOrder({ bookingID, tableNames, kitchen, complete, failure }) {
    let url, data;
    if (this.dishesType === 'normal') {
      url = '/reception/product/addOrder.action';
      data = {
        subOrderID: this.orderInfo.subOrderID,
        shoppingCart: JSON.stringify(this.shoppingCart),
        kitchen
      };
    } else if (this.dishesType === 'banquetAdd') {
      url = '/banquet/dish/addDishes';
      data = {
        bookingID: this.orderInfo.bookingID,
        tableNames: this.orderInfo.tableNames,
        shoppingCart: JSON.stringify(this.shoppingCart),
        kitchen
      };
    }

    let _this = this;
    getJSON({
      url,
      method: 'POST',
      data,
      success: function(json) {
        if (json.code === 0) {
          _this.clearShoppingCart({ freed: false }); //清空购物车
          _this.getDidOrderList(); //刷新已下单列表
          _this.getDishesList({
            categoryID: _this.secondCategoryID,
            searchCode: _this.searchCode
          }); //刷新菜品列表

          //设置下单成功反馈
          _this.showFeedback({ status: 'success', msg: '下单成功!' });
          _this.listActiveKey = 'didOrder';
        } else if (json.code === -1) {
          let data = JSON.parse(json.message);
          failure && failure(data);
        } else {
          _this.feedback = feedback(json.message);
        }
        complete && complete();
      }
    });
  }

  //保存需要换的菜品
  @action
  setExchangeDishes(dishes) {
    this.exchangeDishes = dishes;
  }

  //删除需要换的菜品
  @action
  delExchangeDishes() {
    this.exchangeDishes = null;
  }

  //清空购物车
  @action
  clearShoppingCart({ freed } = { freed: true }) {
    if (freed) {
      let shoppingCart = this.shoppingCart.map(product => ({
        productID: product.productID,
        variantID: product.variantID,
        optionID: product.optionID,
        quantity:
          -1 * (product.needWeigh ? product.expectedWeight : product.quantity)
      }));
      this.cleanShoppingCart({ shoppingCart });
    }

    this.shoppingCart = [];
    this.productMessageMap = {};
    this.comboGroupMap = {};
    this.dishesList = this.dishesList.map(dishes => {
      dishes.quantity = 0;
      return dishes;
    });
  }

  /***************** 未下单相关 action ********************/

  /***************** 已下单相关 action ********************/

  //获取已下单列表
  @action
  getDidOrderList(bookingID) {
    this.didOrderList = {};

    let url, data;
    if (this.dishesType === 'banquetAdd' || bookingID) {
      url = '/banquet/dish/getDishesOrdered';
      data = { bookingID: bookingID || this.orderInfo.bookingID };
    } else {
      url = '/reception/product/getUnderOrdersList.action';
      data = { subOrderID: this.orderInfo.subOrderID };
    }

    let _this = this;
    getJSON({
      url,
      data,
      success: function(json) {
        if (json.code === 0) {
          _this.didOrderList = json.data;
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //已下单列表选中
  @action
  selectDidOrder({ detailID, recordID }) {
    this.didOrderList.orderProductList = this.didOrderList.orderProductList.map(
      dishes => {
        dishes.selected = dishes.detailID === detailID;

        if (dishes.childs && dishes.childs.length) {
          dishes.childs.map(child => {
            child.selected = child.recordID === recordID;
            return child;
          });
        }

        return dishes;
      }
    );
  }

  //清空已下单列表
  @action
  clearDidOrderList() {
    this.didOrderList = [];
  }

  //划单
  @action
  markOrder({ markOrderDetail }) {
    let _this = this;
    getJSON({
      url: '/reception/product/markOrderDetail.action',
      data: { markOrderDetail: JSON.stringify(markOrderDetail) },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '划单成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //取消划单
  @action
  cancelMarkOrder({ cancelMarkOrderDetail }) {
    let _this = this;
    getJSON({
      url: '/reception/product/cancelMarkOrderDetail.action',
      data: { cancelMarkOrderDetail: JSON.stringify(cancelMarkOrderDetail) },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '取消划单成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //称重
  @action
  updateWeigh([{ orderDetailID, quantity, weight }]) {
    let _this = this;
    getJSON({
      url: '/reception/product/updateProductWeight',
      data: {
        productWeightsData: JSON.stringify([
          { orderDetailID, quantity, weight }
        ])
      },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '称重成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //加菜
  @action
  addDishes({ detailID, recordID, menuID, quantity, failure, complete }) {
    let requireData = { quantity };
    if (detailID) requireData.detailID = detailID;
    if (recordID) requireData.recordID = recordID;
    let _this = this;
    getJSON({
      url: '/reception/product/addFood',
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '加菜成功!' });
          complete && complete();
        } else if (json.code === -1) {
          failure && failure(JSON.parse(json.message));
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
          complete && complete();
        }
      }
    });
  }
  // @action addDishes({detailID, recordID, menuID, quantity}) {
  //   let requireData = {};
  //   if(detailID) requireData.detailID = detailID;
  //   if(recordID) requireData.recordID = recordID;
  //   let _this = this;
  //   getJSON({
  //     url: '/reception/product/addFood',
  //     data: requireData,
  //     success: function(json){
  //       if(json.code === 0) {
  //         let dishes = json.data;
  //         dishes.aLaCarteMethod = 687; //加菜标签
  //         if(dishes.needWeigh) {
  //           for(let i = 0; i < quantity; i++) {
  //             //添加当前菜品到购物车
  //             dishes.cartRecordID = Math.floor(Math.random()*10000000000); //添加cartRecordID标识
  //             dishes.quantity = 1;
  //             _this.shoppingCart.push(dishes);
  //           }
  //         }else {
  //           let addDishesFlag = true;
  //           _this.shoppingCart = _this.shoppingCart.map(product => {
  //             if(detailID===product.detailID) {
  //               addDishesFlag = false;
  //               product.quantity += Number(quantity);
  //             }
  //             return product;
  //           })

  //           if(addDishesFlag) {
  //             dishes.cartRecordID = Math.floor(Math.random()*10000000000); //添加cartRecordID标识
  //             dishes.quantity = Number(quantity);
  //             if(dishes.comboList && dishes.comboList.length) {
  //               dishes.comboList = dishes.comboList.map(combo => {
  //                 combo.cartRecordID = Math.floor(Math.random()*10000000000);
  //                 combo.aLaCarteMethod = 687; //加菜标签
  //                 combo.quantity *= Number(quantity);
  //                 return combo;
  //               });
  //             }
  //             //添加当前菜品到购物车
  //             _this.shoppingCart.push(dishes);
  //           }
  //         }

  //         _this.dishesList = _this.dishesList.map(dishes => {
  //           if(dishes.menuID === menuID ) {
  //             if(!dishes.quantity) dishes.quantity=0;
  //             dishes.quantity+=Number(quantity);
  //           }
  //           return dishes;
  //         });

  //         if(_this.listActiveKey !== 'willOrder') { //切换到购物车的tabView
  //           _this.changeListKey({key: 'willOrder'});
  //         }
  //         _this.showFeedback({status: 'success', msg: '菜品已加入购物车!'});
  //       }else {
  //         _this.showFeedback({status: 'warn', msg: json.message});
  //       }
  //     }
  //   });
  // }

  //退菜
  @action
  returnDishes({ menuID, quantity, detailID, memo, revocationType, backType }) {
    let _this = this;
    getJSON({
      url: '/reception/product/revocationFood',
      data: { menuID, quantity, detailID, memo, revocationType, backType },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.getDishesList({
            categoryID: _this.secondCategoryID,
            searchCode: _this.searchCode
          }); //刷新菜品列表
          _this.showFeedback({ status: 'success', msg: '退菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //批量退菜
  @action
  batchReturnDishes({ quantitys, detailIDs, memo, revocationType }) {
    let _this = this;
    getJSON({
      url: '/reception/product/revocationFoodBatch',
      data: { quantitys, detailIDs, memo, revocationType },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.getDishesList({
            categoryID: _this.secondCategoryID,
            searchCode: _this.searchCode
          }); //刷新菜品列表
          _this.showFeedback({ status: 'success', msg: '批量退菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //赠菜
  @action
  handselDishes({ menuID, quantity, detailID, memo, floatQuantity }) {
    let _this = this;
    getJSON({
      url: '/reception/product/presentFood',
      data: { menuID, quantity, detailID, memo, floatQuantity },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '赠菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //取消赠菜
  @action
  cancelHandselDishes({ detailID }) {
    let _this = this;
    getJSON({
      url: '/reception/product/unPresentFood',
      data: { detailID },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '取消赠菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //等叫
  @action
  socalled({ socalledList }) {
    let _this = this;
    getJSON({
      url: '/reception/product/socalled',
      data: { detailInfoList: JSON.stringify(socalledList) },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '等叫成功!' });
        } else if (json.code === 317) {
          _this.showFeedback({ status: 'warn', msg: '已上菜状态不能被等叫' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //叫起
  @action
  wakeUp({ wakeUpList }) {
    let _this = this;
    getJSON({
      url: '/reception/product/wakeUp',
      data: { detailInfoList: JSON.stringify(wakeUpList) },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '叫起成功!' });
        } else if (json.code === 317) {
          _this.showFeedback({ status: 'warn', msg: '非等叫状态不能被叫起' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //给菜打tag 免做,先做,打包,催菜
  @action
  markTag(merchantTagMappings) {
    let _this = this;
    getJSON({
      url: '/reception/product/merchantProductOperation.action',
      data: { merchantTagMappings: JSON.stringify(merchantTagMappings) },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '操作成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //已下单同价换菜
  @action
  exchangeSameFood({ detailID, menuID, changeMenuID }) {
    let _this = this;
    getJSON({
      url: '/reception/product/changeSameFood',
      data: { detailID, menuID, changeMenuID },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '换菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //已下单不同价按同价换菜
  @action
  exchangeSamePriceFood({ detailID, menuID, changeMenuID }) {
    let _this = this;
    getJSON({
      url: '/reception/product/changeSamePriceFood',
      data: { detailID, menuID, changeMenuID },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '换菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //已下单不同价按新价换菜
  @action
  exchangeNotSamePriceFood({ detailID, menuID, changeMenuID }) {
    let _this = this;
    getJSON({
      url: '/reception/product/changeNotSamePriceFood',
      data: { detailID, menuID, changeMenuID },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '换菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //已下单不同规格换菜
  @action
  exchangeNotSameOptionFood({ detailID, menuID, specificationID }) {
    let _this = this;
    getJSON({
      url: '/reception/product/getNotStandardFood',
      data: { detailID, menuID, specificationID },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '换菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //转菜
  @action
  exchangeFoodTable({ detailID, quantity, subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/product/changeFoodTable',
      data: { detailID, quantity, subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '转菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //批量转菜
  @action
  batchTransferProduct({ detailIDs, quantitys, subOrderID }) {
    let _this = this;
    getJSON({
      url: '/reception/product/changeFoodTableBatch',
      data: { detailIDs, quantitys, subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.getDidOrderList(); //重新获取下单列表
          _this.showFeedback({ status: 'success', msg: '批量转菜成功!' });
        } else {
          _this.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  /***************** 已下单相关 action ********************/

  /***************** 更多相关 action ********************/

  //批量操作选择菜品
  @action
  checkedProduct({ cartRecordID, detailID }) {
    if (cartRecordID) {
      this.shoppingCart = this.shoppingCart.map((product, index) => {
        if (cartRecordID && cartRecordID === product.cartRecordID)
          product.checked = !product.checked;
        return product;
      });
    } else if (detailID) {
      this.filterDidOrderList = this.filterDidOrderList.map(
        (product, index) => {
          if (detailID && detailID === product.detailID)
            product.checked = !product.checked;
          if (product.checked) {
            product.operateQuantity = 1;
          } else {
            product.operateQuantity = 0;
          }
          return product;
        }
      );
    }
  }

  //批量操作全选
  @action
  checkedAll({ action, areAllSelected }) {
    let productList;
    if (action.actionType === 'willOrder') {
      productList = this.shoppingCart;
    } else if (action.actionType === 'didOrder') {
      productList = this.filterDidOrderList;
    }
    productList = productList.map((product, index) => {
      let filterflag = true;
      switch (action.actionName) {
        case '等叫':
          filterflag = product.produceStatus !== 694;
          break;
        case '叫起':
        case '取消等叫':
          filterflag = product.produceStatus === 694;
          break;
        case '免做':
          filterflag = !product.tagIDs || product.tagIDs.indexOf('20') < 0;
          break;
        case '取消免做':
          filterflag = product.tagIDs && product.tagIDs.indexOf('20') > -1;
          break;
        case '先做':
          filterflag = !product.tagIDs || product.tagIDs.indexOf('21') < 0;
          break;
        case '取消先做':
          filterflag = product.tagIDs && product.tagIDs.indexOf('21') > -1;
          break;
        case '催菜':
          filterflag = !product.tagIDs || product.tagIDs.indexOf('22') < 0;
          break;
        case '打包':
          filterflag = !product.tagIDs || product.tagIDs.indexOf('23') < 0;
          break;
        case '取消打包':
          filterflag = product.tagIDs && product.tagIDs.indexOf('23') > -1;
          break;
        case '划单':
          filterflag =
            product.produceStatus !== 982 && //已上菜
            product.produceStatus !== 830 && //未称重
            product.produceStatus !== 694 && //等叫
            product.aLaCarteMethod !== 685 && //退菜
            (product.needWeigh || product.quantity > product.servingQuantity);
          break;
        case '取消划单':
          filterflag =
            product.produceStatus === 982 &&
            (product.combo || product.quantity === product.servingQuantity);
          break;
        default:
      }
      filterflag =
        (action.actionType === 'willOrder' && filterflag) ||
        action.actionType === 'didOrder';
      if (filterflag) product.checked = !areAllSelected;
      return product;
    });
    if (action.actionType === 'willOrder') {
      this.shoppingCart = productList;
    } else if (action.actionType === 'didOrder') {
      this.filterDidOrderList = productList;
    }
  }

  //批量操作清空选择
  @action
  clearCheckedProduct({ action }) {
    if (action.actionType === 'willOrder') {
      this.shoppingCart = this.shoppingCart.map((product, index) => {
        product.checked = false;
        return product;
      });
    } else if (
      action.actionType === 'didOrder' &&
      this.filterDidOrderList &&
      this.filterDidOrderList.length
    ) {
      this.filterDidOrderList = this.filterDidOrderList.map(
        (product, index) => {
          product.checked = false;
          return product;
        }
      );
    }
  }

  //批量删除购物车菜品
  @action
  deleteMultipleFromCart() {
    let cart = new Map();
    let deleteCart = [];
    this.shoppingCart = this.shoppingCart.filter((product, index) => {
      if (product.checked) {
        deleteCart.push({
          productID: product.productID,
          variantID: product.variantID,
          optionID: product.optionID,
          quantity: product.needWeigh
            ? -1 * product.expectedWeight
            : -1 * product.quantity
        });
        if (cart[product.menuID]) cart[product.menuID] += product.quantity;
        else cart[product.menuID] = product.quantity;
      }
      return !product.checked;
    });

    this.mapQuantityToDishesList();

    this.cleanShoppingCart({ shoppingCart: deleteCart });
  }

  //批量等叫购物车菜品
  @action
  socalledMultipleFromCart() {
    this.shoppingCart = this.shoppingCart.map((product, index) => {
      if (product.checked) {
        let cartRecordID = product.cartRecordID;
        let produceStatus = 694;

        let tagIDs = product.tagIDs
          .split(',')
          .filter(tag => {
            return tag !== '21';
          })
          .join(',');
        this.updateProductToCart({
          cartRecordID,
          produceStatus,
          tagIDs
        });

        //如果有套餐明细，全部需要更改
        if (product.comboList && product.comboList.length) {
          product.comboList.forEach(combo => {
            let cartRecordID = combo.cartRecordID;
            let produceStatus = 694;
            let tagIDs = '';
            if (tagIDs) {
              tagIDs = combo.tagIDs
                .split(',')
                .filter(tag => {
                  return tag !== '21';
                })
                .join(',');
            }
            this.updateProductToCart({
              cartRecordID,
              produceStatus,
              tagIDs
            });
          });
        }
      }
      return product;
    });
  }

  //批量取消等叫购物车菜品
  @action
  cancelCalledMultipleFromCart() {
    this.shoppingCart = this.shoppingCart.map((product, index) => {
      if (product.checked) {
        let produceStatus = product.needWeigh ? 830 : 693;
        product.produceStatus = produceStatus;
        this.updateProductToCart({
          cartRecordID: product.cartRecordID,
          produceStatus
        });
      }
      return product;
    });
  }

  //批量修改标签购物车菜品
  @action
  changeTagMultipleFromCart({ tag }) {
    this.shoppingCart = this.shoppingCart.map((product, index) => {
      if (product.checked) {
        let produceStatus =
          tag === '21'
            ? product.needWeigh ? 830 : 693
            : product.produceStatus;
        if (product.tagIDs) {
          if (product.tagIDs.indexOf(tag) > -1) {
            //删除
            product.tagIDs = product.tagIDs
              .split(',')
              .filter(tagID => {
                return tagID !== tag;
              })
              .join(',');
          } else {
            //增加
            product.tagIDs = product.tagIDs + ',' + tag;
          }
        } else {
          //新增
          product.tagIDs = tag;
        }
        this.updateProductToCart({
          cartRecordID: product.cartRecordID,
          tagIDs: product.tagIDs,
          produceStatus
        });

        //如果有套餐明细，全部需要更改
        if (product.comboList && product.comboList.length) {
          product.comboList.forEach(combo => {
            let cartRecordID = combo.cartRecordID;
            this.updateProductToCart({
              cartRecordID,
              tagIDs: product.tagIDs,
              produceStatus
            });
          });
        }
      }
      return product;
    });
  }

  //批量转赠
  @action
  turnGiveMultipleFromCart({ tableID, tableName }) {
    this.shoppingCart.forEach((product, index) => {
      if (product.checked) {
        this.updateProductToCart({
          cartRecordID: product.cartRecordID,
          tableID,
          tableName,
          aLaCarteMethod: 998 //转赠
        });
      }
    });
  }

  //已下单可退菜品列表
  @action
  getFilterProduct({ type, status }) {
    let url;
    switch (type) {
      case 'back':
        url = 'getBackProduct';
        break;
      case 'transfer':
        url = 'getTransferProduct';
        break;
      case 'status':
      case 'cancelMarkOrder':
        url = 'getProductBySubOrderAndProStatus';
        break;
      case 'boiled':
        url = 'getProductPushBySubOrder';
        break;
      case 'markOrder':
        url = 'getCancelProduct';
        break;
      case 'copy':
        url = 'getCanCopyProducts';
        break;
      default:
    }

    let requireData = { subOrderID: this.orderInfo.subOrderID };
    if (status) requireData.productStatus = status;

    let _this = this;
    getJSON({
      url: '/reception/product/' + url,
      data: requireData,
      success: function(json) {
        if (json.code === 0) {
          _this.filterDidOrderList = json.data.map(product => {
            product.operateQuantity = 1;
            return product;
          });
        } else {
          _this.filterDidOrderList = [];
          // _this.showFeedback({status: 'warn', msg: json.message});
        }
      }
    });
  }

  //复制菜
  @action
  copyProduct({
    subOrderID,
    targetTableID,
    targetSubOrderID,
    copyProducts,
    failure,
    complete
  }) {
    let _this = this;
    getJSON({
      url: '/reception/product/copyProducts',
      data: {
        productsData: JSON.stringify({
          subOrderID,
          targetTableID,
          targetSubOrderID,
          copyProducts
        })
      },
      success: function(json) {
        if (json.code === 0) {
          complete && complete();
          _this.showFeedback({ status: 'success', msg: '复制菜成功' });
        } else if (json.code === -1) {
          failure && failure(JSON.parse(json.message));
        } else {
          complete && complete();
          _this.feedback = feedback(json.message);
        }
      }
    });
  }

  //修改已下单筛选菜品的数量
  @action
  changeFilterQuantity({ type, detailID, complete }) {
    this.filterDidOrderList = this.filterDidOrderList.map(product => {
      if (product.detailID === detailID) {
        if (type === 'minus') {
          if (product.operateQuantity > 1) product.operateQuantity -= 1;
        } else {
          if (product.operateQuantity < product.quantity)
            product.operateQuantity += 1;
        }
      }
      return product;
    });
  }

  //清空已下单筛选菜品列表
  @action
  clearFilterDidOrderList() {
    this.filterDidOrderList = [];
  }

  /***************** 更多相关 action ********************/

  /***************** 拼菜相关 action ********************/
  //打开拼菜区
  @action
  openSpellStage = () => {
    this.dishesStage = 'spell';
    this.shoppingStage = this.shoppingCart;
    this.shoppingCart = [];
  };

  //关闭拼菜区
  @action
  closeSpellStage = () => {
    this.dishesStage = 'normal';
  };

  //取消拼菜模式
  @action
  cancelSpellStage = () => {
    this.dishesStage = 'normal';
    this.shoppingCart = this.shoppingStage;
    this.shoppingStage = [];
    this.mapQuantityToDishesList();
  };

  //初始化拼菜(第一种拼菜开启方式)
  @action
  initSpellList = ({ dishes, needFilter }) => {
    if (needFilter) {
      const initSpellID = dishes.cartRecordID;
      this.shoppingCart = this.shoppingStage.filter(dishes => {
        return (
          initSpellID !== dishes.cartRecordID &&
          (dishes.productType === 2 || dishes.productType === 5) &&
          dishes.productMode !== 1377 &&
          dishes.aLaCarteMethod !== 686 &&
          dishes.aLaCarteMethod !== 998
        );
      });
    }

    //计算拼菜数量
    let spellNumber = 1;
    this.shoppingStage.forEach(product => {
      if (product.productMode === 1377) {
        spellNumber += 1;
      }
    });
    if (
      this.didOrderList &&
      this.didOrderList.orderProductList &&
      this.didOrderList.orderProductList.length
    ) {
      this.didOrderList.orderProductList.forEach(product => {
        if (product.productMode === 1377) {
          spellNumber += 1;
        }
      });
    }

    const spellDishes = {
      aLaCarteMethod: 684,
      cartRecordID: Math.floor(Math.random() * 10000000000),
      produceStatus: 693,
      productType: 3,
      productMode: 1377,
      productName: '拼菜' + spellNumber,
      quantity: 1,
      unit: '份',
      assortedDishesList: [dishes]
    };

    this.shoppingCart.push(spellDishes);

    this.shoppingCart = this.shoppingCart.map(product => {
      if (product.assortedDishesList) {
        product.price = this.countSpellPrice(product);
      }
      return product;
    });
  };

  //修改拼菜
  @action
  modifySpellList = dishes => {
    let spellRecordID;
    this.shoppingStage.forEach(product => {
      if (product.cartRecordID === dishes.cartRecordID) {
        spellRecordID = product.cartRecordID;
      }
      if (product.assortedDishesList) {
        product.assortedDishesList.forEach(spellDishes => {
          if (spellDishes.cartRecordID === dishes.cartRecordID) {
            spellRecordID = product.cartRecordID;
          }
        });
      }
    });

    this.shoppingCart = this.shoppingStage.filter(
      product =>
        (product.productType === 2 || spellRecordID === product.cartRecordID) &&
        product.aLaCarteMethod !== 686 &&
        product.aLaCarteMethod !== 998
    );
  };

  //把购物车的单品放进拼菜
  @action
  moveDishesFromCartToSpell = dishes => {
    //在放入拼菜之前清空厨房状态
    this.updateProductToCart({
      cartRecordID: dishes.cartRecordID,
      tagIDs: '',
      produceStatus: dishes.needWeigh ? 830 : 693
    });

    this.shoppingCart = this.shoppingCart.filter(product => {
      if (product.assortedDishesList) {
        product.assortedDishesList.push(dishes);
        product.price = this.countSpellPrice(product);
      }
      return product.cartRecordID !== dishes.cartRecordID;
    });
  };

  //把拼菜里面的菜放回购物车
  @action
  moveDishesFromSpellToCart = dishes => {
    this.shoppingCart.push(dishes);
    let finishFlag = false; //是否要退出拼菜
    let cartRecordID = null;
    this.shoppingCart = this.shoppingCart.filter(product => {
      if (product.assortedDishesList) {
        product.assortedDishesList = product.assortedDishesList.filter(
          spellDishes => spellDishes.cartRecordID !== dishes.cartRecordID
        );
        product.price = this.countSpellPrice(product);

        //当没有拼菜明细的时候完成拼菜模式
        finishFlag = !product.assortedDishesList.length;
        if (finishFlag) {
          cartRecordID = product.cartRecordID;
        }
        return !finishFlag;
      }
      return true;
    });

    if (finishFlag) {
      this.finishSpell();
      this.shoppingCart = this.shoppingCart.filter(product => {
        return product.cartRecordID !== cartRecordID;
      });
    }
  };

  @action
  countSpellPrice(product) {
    let spellPrice = 0;

    product.assortedDishesList.forEach(dishes => {
      const price = dishes.needWeigh
        ? dishes.expectedWeight * dishes.price
        : dishes.quantity * dishes.price;
      spellPrice += price;

      //有口味做法的要统计口味做法的加价
      if (dishes.attributeList && dishes.attributeList.length) {
        dishes.attributeList.forEach(attribute => {
          if (dishes.aLaCarteMethod !== 686 && attribute.addedPrice) {
            spellPrice += dishes.quantity * attribute.addedPrice;
          }
        });
      }
    });

    return spellPrice;
  }

  //完成拼菜
  @action
  finishSpell = () => {
    const recordIDs = this.shoppingStage.map(dishes => dishes.cartRecordID);
    let spellRecordIDs = [];
    this.shoppingCart.forEach(product => {
      if (product.assortedDishesList) {
        spellRecordIDs = product.assortedDishesList.map(
          dishes => dishes.cartRecordID
        );
      }
    });

    this.shoppingCart = this.shoppingCart.filter(
      dishes => dishes.quantity > 0 && !recordIDs.includes(dishes.cartRecordID)
    );
    this.shoppingStage = this.shoppingStage.filter(
      dishes =>
        dishes.quantity > 0 && !spellRecordIDs.includes(dishes.cartRecordID)
    );

    //合并拼菜到购物车
    this.shoppingCart = [...this.shoppingStage, ...this.shoppingCart];

    //关闭拼菜
    this.closeSpellStage();
  };
  /***************** 拼菜相关 action ********************/

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

  //设置购物车选中菜品的下标
  @action
  setCartIndex(carIndex) {
    this.cartIndex = carIndex;
  }

  //清空购物车列表选中菜品的下标
  @action
  clearCartIndex() {
    this.cartIndex = -1;
  }
}

export default new DishesStore();
