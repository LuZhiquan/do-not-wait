/**
* @author Shelly
* @description 宴会预定点菜界面
* @date 2017-06-27
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router'; //路径跳转
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';

import './dishes.less';
@inject('banquetCreateStore')
@observer
class Dishes extends Component {
  constructor(props) {
    super(props);

    let { location } = this.props;
    let mysaveData = JSON.parse(location.state.saveData);

    if (mysaveData.isMoreType) {
      //多种点菜   跳转  以及修改菜品
      let { cart, saveData } = location.state;
      let mSaveData = JSON.parse(saveData);
      let allMoney = 0;
      let mtTypes = mSaveData.tTypes;
      if (cart) {
        //如果修改完成再跳过来
        let mCart = JSON.parse(cart);
        let shoppingCart = mCart.shoppingCart.map((item, index) => {
          item.serveOrder = index + 1;
          return item;
        });
        mCart.shoppingCart = shoppingCart;
        let currentIndex = location.state.currentIndex;
        mtTypes[currentIndex].cart = mCart;
      } else {
        //从创建界面跳过来
        mtTypes = mtTypes.map((type, index) => {
          type.cart.shoppingCart.forEach((item, dindex) => {
            item.serveOrder = dindex + 1;
          });
          return type;
        });
      }

      mtTypes = mtTypes.map((type, index) => {
        let cart = type.cart;

        type.amount = cart.totalAmount;
        type.actualAmount = cart.totalAmount;
        type.totalAmount = type.actualAmount * type.bookingNum;

        allMoney += type.totalAmount;
        return type;
      });
      mSaveData.tTypes = mtTypes;

      this.state = {
        allMoney: allMoney,
        currentBanquetType: mSaveData.currentBanquetType,
        isMoreType: mSaveData.isMoreType,
        selectDesk: mSaveData.selectDesk,
        banquetMessage: mSaveData.banquetMessage,
        tTypes: mSaveData.tTypes
      };
    } else {
      //单种点菜跳转   修改菜品
      let { cart, saveData } = location.state;

      let mSaveData = JSON.parse(saveData);
      let mCart = JSON.parse(cart);
      let mtTypes = mSaveData.tTypes;

      //给购物车添加序号
      let shoppingCart = mCart.shoppingCart.map((item, index) => {
        item.serveOrder = index + 1;
        return item;
      });

      mCart.shoppingCart = shoppingCart;

      //根据购物车 算出 单桌 总价 以及 现价和原价

      let { totalAmount } = mCart;
      mtTypes[0].amount = totalAmount;
      mtTypes[0].actualAmount = totalAmount;
      mtTypes[0].totalAmount = (mtTypes[0].actualAmount *
        mtTypes[0].bookingNum).toFixed(2);

      mtTypes[0].cart = mCart;
      mSaveData.tTypes = mtTypes;

      //console.log(mtTypes)

      this.state = {
        currentBanquetType: mSaveData.currentBanquetType,
        isMoreType: mSaveData.isMoreType,
        selectDesk: mSaveData.selectDesk,
        banquetMessage: mSaveData.banquetMessage,
        tTypes: mSaveData.tTypes
      };
    }
  }

  //改变菜品上菜序号
  changeServeOrder = (serveOrder, typeIndex, itemIndex) => {
    let tTypes = this.state.tTypes;
    tTypes[typeIndex].cart.shoppingCart[itemIndex].serveOrder = serveOrder;

    this.setState({ tTypes: tTypes });
  };
  //改变每桌现价
  changeActualAmount = (actualAmount, typeIndex) => {
    let tTypes = this.state.tTypes;

    let allMoney = this.state.allMoney * 1;
    allMoney = 0;

    tTypes[typeIndex].actualAmount = actualAmount;
    tTypes[typeIndex].totalAmount = actualAmount * tTypes[typeIndex].bookingNum;

    tTypes.forEach((type, index) => {
      allMoney += type.totalAmount * 1;
    });
    this.setState({ allMoney: allMoney });
    this.setState({ tTypes: tTypes });
  };
  //修改菜品
  modifyDishes = (cart, typeIndex) => {
    let { banquetMessage, tTypes } = this.state;
    this.setState({ currentIndex: typeIndex });
    let obj = {
      currentBanquetType: this.state.currentBanquetType,
      isMoreType: this.state.isMoreType,
      selectDesk: this.state.selectDesk,
      banquetMessage: this.state.banquetMessage,
      tTypes: this.state.tTypes
    };

    browserHistory.push({
      pathname: '/dishes',
      state: {
        dishesType: 'banquet',
        orderInfo: {
          partyName: banquetMessage.partyName,
          customerName: banquetMessage.customerName,
          tableNum: tTypes[typeIndex].bookingNum,
          backupNum: tTypes[typeIndex].backupNum,
          peopleNum: tTypes[typeIndex].peopleNum,
          currentIndex: typeIndex,
          saveData: JSON.stringify(obj)
        },
        nextUrl: '/banquet/dishes',
        cart: JSON.stringify(cart)
      }
    });
  };

  //取消
  dishesCancelClick = () => {
    let { banquetCreateStore } = this.props;
    banquetCreateStore.clearMessage();
    browserHistory.push('/banquet/records');
  };

  //确定
  dishesOkClick = () => {
    let obj = {
      currentBanquetType: this.state.currentBanquetType,
      isMoreType: this.state.isMoreType,
      selectDesk: this.state.selectDesk,
      banquetMessage: this.state.banquetMessage,
      tTypes: this.state.tTypes
    };
    browserHistory.push({
      pathname: '/banquet/create-beposit',
      state: {
        saveData: JSON.stringify(obj)
      }
    });
  };

  render() {
    let { allMoney, tTypes } = this.state;

    return (
      <div className="banquet-dishes">
        <div className="dishes-title">
          {false && (
            <i
              className="iconfont icon-order_btn_back"
              onClick={() => {
                //返回预定界面
                this.context.router.goBack();
              }}
            />
          )}
          宴会预订
        </div>
        {this.state.isMoreType && (
          <div className="total-amount">
            订单总金额<strong>{allMoney.toFixed(2)}元</strong>
          </div>
        )}
        <div
          className={classnames({
            'content-wrap': true,
            'top-106': this.state.isMoreType
          })}
        >
          <Scrollbars>
            {tTypes.length > 0 &&
              tTypes.map((type, typeIndex) => {
                return (
                  <div key={typeIndex}>
                    <div className="title-info">
                      {type.typeName && (
                        <span className="banquet-name">{type.typeName}:</span>
                      )}
                      <span>
                        每桌原价<em>{type.amount && type.amount}</em>元
                      </span>
                      <span>
                        每桌现价
                        <input
                          type="text"
                          value={type.actualAmount && type.actualAmount}
                          onChange={e => {
                            if (/^\d*\.{0,1}\d*$/.test(e.target.value)) {
                              this.changeActualAmount(
                                e.target.value,
                                typeIndex
                              );
                            }
                          }}
                        />元
                      </span>
                      <span>
                        席数<em>{type.bookingNum}</em>桌
                      </span>
                      <span>
                        金额<em>
                          {type.totalAmount &&
                            (type.totalAmount * 1).toFixed(2)}
                        </em>元
                      </span>
                      <button
                        className="dishes-btn"
                        onClick={() => {
                          this.modifyDishes(type.cart, typeIndex);
                        }}
                      >
                        修改菜品
                      </button>
                    </div>
                    <div className="banquet-list">
                      <div className="banquet-list-left">
                        <ul className="left-title">
                          <li className="code">序号</li>
                          <li className="name">菜品名称</li>
                          <li className="standard">规格</li>
                          <li className="method">口味/做法/备注</li>
                          <li className="unit">单位</li>
                          <li className="num">数量</li>
                          <li className="price">原单价</li>
                        </ul>
                        <div className="scroll-area">
                          <Scrollbars>
                            {type.cart &&
                              type.cart.shoppingCart.map((item, itemIndex) => {
                                return (
                                  <div className="each-list" key={itemIndex}>
                                    <span className="code">
                                      <input
                                        type="text"
                                        value={item.serveOrder}
                                        className="selected"
                                        onChange={e => {
                                          if (/^\d*$/.test(e.target.value)) {
                                            this.changeServeOrder(
                                              e.target.value,
                                              typeIndex,
                                              itemIndex
                                            );
                                          }
                                        }}
                                      />
                                    </span>
                                    <span className="name">
                                      {item.productName}
                                    </span>
                                    <span className="standard">
                                      {item.optionName && item.optionName}
                                    </span>
                                    <span className="method">
                                      {item.attributeList &&
                                        item.attributeList[0].attributeName}
                                    </span>
                                    <span className="unit">{item.unit}</span>
                                    <span className="num">{item.quantity}</span>
                                    <span className="unit">{item.price}</span>
                                  </div>
                                );
                              })}
                          </Scrollbars>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </Scrollbars>
          <div className="bottom-btn">
            <button className="btn" onClick={this.dishesCancelClick}>
              取消
            </button>
            <button className="btn selected" onClick={this.dishesOkClick}>
              确定
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Dishes.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};
export default Dishes;
