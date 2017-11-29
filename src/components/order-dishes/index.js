import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs, Collapse } from 'antd';
import classnames from 'classnames';
import Scrollbars from 'react-custom-scrollbars';

import { getJSON } from 'common/utils';
import TaocanPopup from './taocan-popup';
import CommonPopup from './common-dishes-popup';
import PromptPopup from 'components/prompt-popup';
import WillOrderPopup from 'components/order-dishes/not-order-popup';
import DidOrderPopup from 'components/order-dishes/ok-order-popup';
import MarkOrderPopup from 'components/order-dishes/mark-order-popup';

import './order-dishes.less';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

/**************** 未下单组件 *****************/
function WillOrder({
  index,
  parents,
  isSpellChild,
  dishesStore,
  dishes,
  modifyWillOrder,
  editComboGroup,
  exchangeDishes
}) {
  let productName = dishes.optionName
    ? dishes.productName + '(' + dishes.optionName + ')'
    : dishes.productName;
  let isSpellDishes = dishes.productMode === 1377;
  return (
    <li
      className={classnames({
        'will-order': true,
        select: dishesStore && dishes.selected
      })}
      onClick={modifyWillOrder}
    >
      <div className="row-one">
        {dishesStore && dishesStore.dishesStage === 'spell' && isSpellChild ? (
          <span
            className="yichu"
            onClick={e => {
              e.stopPropagation();
              dishesStore.moveDishesFromSpellToCart(dishes);
            }}
          >
            移出
          </span>
        ) : (
          <span className="serial">{index > -1 && index + 1}</span>
        )}
        <span className="name">
          {dishes.tagIDs &&
            dishes.tagIDs.split(',').map(id => {
              let tag;
              switch (id) {
                case '20': //免做
                  tag = (
                    <span key={id} className="mianzuo">
                      免
                    </span>
                  );
                  break;
                case '21': //加急
                  tag = (
                    <span key={id} className="xian">
                      先
                    </span>
                  );
                  break;
                case '22': //催菜
                  tag = (
                    <span key={id} className="cui">
                      催
                    </span>
                  );
                  break;
                case '23': //打包
                  tag = (
                    <span key={id} className="dabao">
                      打包
                    </span>
                  );
                  break;
                default:
              }
              return tag;
            })}
          {productName ? productName : dishes.variantName}
          {dishesStore &&
            !!dishes.editCombo && (
              <i
                className="iconfont icon-huiyuanguanli_icon_ziliao"
                onClick={event => {
                  editComboGroup();
                  event.stopPropagation();
                }}
              />
            )}
        </span>
        <span className="number">
          {dishesStore &&
            (index > -1 ||
              (isSpellChild &&
                parents.aLaCarteMethod !== 686 &&
                parents.aLaCarteMethod !== 998)) &&
            !(
              dishesStore &&
              dishesStore.dishesStage === 'spell' &&
              isSpellDishes &&
              dishes.quantity === 1
            ) &&
            dishes.aLaCarteMethod !== 686 && (
              <i
                className="number-jian iconfont icon-jian"
                onClick={event => {
                  if (isSpellDishes) {
                    //拼菜
                    //减少菜品数量
                    const list = dishes.assortedDishesList.map(dishes => {
                      return {
                        productID: dishes.productID,
                        variantID: dishes.variantID,
                        optionID: dishes.optionID,
                        quantity: -1 * dishes.quantity
                      };
                    });
                    dishesStore
                      .updateShoppingCartForAssortedDishes(list)
                      .then(() => {
                        dishesStore.changeProductquantity(
                          'minus',
                          dishes.menuID,
                          dishes.cartRecordID
                        );
                      });
                  } else {
                    //减少菜品数量
                    dishesStore
                      .updateShoppingCart({
                        productID: dishes.productID,
                        variantID: dishes.variantID,
                        optionID: dishes.optionID,
                        changeQuantity: isSpellChild
                          ? -1 * parents.quantity
                          : -1,
                        remaining: dishes.remaining
                      })
                      .then(() => {
                        dishesStore.changeProductquantity(
                          'minus',
                          dishes.menuID,
                          dishes.cartRecordID
                        );
                      });
                  }

                  event.stopPropagation();
                }}
              />
            )}
          {dishes.expectedWeight ? dishes.expectedWeight : dishes.quantity}
          {dishesStore &&
            (index > -1 ||
              (isSpellChild &&
                parents.aLaCarteMethod !== 686 &&
                parents.aLaCarteMethod !== 998)) &&
            !dishes.needWeigh &&
            dishes.aLaCarteMethod !== 686 && (
              <i
                className="number-jia iconfont icon-jia"
                onClick={event => {
                  if (isSpellDishes) {
                    //拼菜
                    //减少菜品数量
                    const list = dishes.assortedDishesList.map(dishes => {
                      return {
                        productID: dishes.productID,
                        variantID: dishes.variantID,
                        optionID: dishes.optionID,
                        quantity: dishes.quantity
                      };
                    });

                    dishesStore
                      .updateShoppingCartForAssortedDishes(list)
                      .then(() => {
                        dishesStore.changeProductquantity(
                          'add',
                          dishes.menuID,
                          dishes.cartRecordID
                        );
                      });
                  } else {
                    //增加菜品数量
                    dishesStore
                      .updateShoppingCart({
                        productID: dishes.productID,
                        variantID: dishes.variantID,
                        optionID: dishes.optionID,
                        changeQuantity: isSpellChild ? parents.quantity : 1,
                        remaining: dishes.remaining
                      })
                      .then(() => {
                        dishesStore.changeProductquantity(
                          'add',
                          dishes.menuID,
                          dishes.cartRecordID
                        );
                      });
                  }
                  event.stopPropagation();
                }}
              />
            )}
        </span>
        {!dishes.isAddPrice &&
          dishes.price > -1 && (
            <span
              className={classnames({
                price: dishes.aLaCarteMethod !== 686,
                'price-del': dishes.aLaCarteMethod === 686
              })}
            >
              ￥{Number(
                (dishes.needWeigh ? dishes.expectedWeight : dishes.quantity) *
                  dishes.price
              ).toFixed(2)}
            </span>
          )}
        {dishes.isAddPrice &&
          dishes.price > 0 && (
            <span
              className={classnames({
                price: dishes.aLaCarteMethod !== 686,
                'price-del': dishes.aLaCarteMethod === 686
              })}
            >
              +￥{Number(dishes.quantity * dishes.price).toFixed(2)}
            </span>
          )}
        {false &&
          dishesStore &&
          dishesStore.dishesType === 'banquet' &&
          index === -1 && (
            <span
              className="huancai"
              onClick={e => {
                e.stopPropagation();
                dishesStore.setExchangeDishes(dishes);
                exchangeDishes && exchangeDishes();
              }}
            >
              换菜
            </span>
          )}
      </div>
      <div className="row-two">
        {dishes.designerID && (
          <div className="taste">
            <span className="matter">
              <span className="chushi">厨</span>
              {dishes.designerName}
            </span>
            {dishes.designerPrice > 0 && (
              <span
                className={classnames({
                  price: dishes.aLaCarteMethod !== 686,
                  'price-del': dishes.aLaCarteMethod === 686
                })}
              >
                +￥{Number(dishes.quantity * dishes.designerPrice).toFixed(2)}
              </span>
            )}
          </div>
        )}
        {dishes.attributeList &&
          !!dishes.attributeList.length &&
          dishes.attributeList.map(attribute => {
            //口味做法加价显示
            return (
              !!attribute.addedPrice && (
                <div key={attribute.valueID} className="taste">
                  <span className="matter">{attribute.attributeName}</span>
                  <span
                    className={classnames({
                      price: dishes.aLaCarteMethod !== 686,
                      'price-del': dishes.aLaCarteMethod === 686
                    })}
                  >
                    +￥{Number(dishes.quantity * attribute.addedPrice).toFixed(
                      2
                    )}
                  </span>
                </div>
              )
            );
          })}
        {dishes.attributeList &&
          !!dishes.attributeList.length &&
          dishes.attributeList
            .filter(attribute => {
              //口味做法显示
              return !attribute.addedPrice;
            })
            .map((attribute, index) => {
              return (
                !attribute.addedPrice && (
                  <span key={attribute.valueID} className="matter">
                    {index !== 0 ? ', ' : ''}
                    {attribute.attributeName}
                  </span>
                )
              );
            })}
        {!!dishes.memo && <span className="remark">备注：{dishes.memo}</span>}
        <div className="zeng-block">
          {(() => {
            let tag;
            switch (dishes.aLaCarteMethod) {
              case 685: //退菜
                tag = <span className="tui">退</span>;
                break;
              case 686: //赠菜
                tag = (
                  <span>
                    <span className="zeng">赠</span>
                    <span className="tagMemo">{dishes.mappingDesc}</span>
                  </span>
                );
                break;
              case 998: //转赠
                tag = (
                  <span>
                    <span className="zhuanzeng">转赠</span>
                    <span className="tagMemo">赠送给{dishes.tableName}台</span>
                  </span>
                );
                break;
              default:
            }
            return tag;
          })()}
        </div>
      </div>
      {dishes.produceStatus === 694 && (
        <div className="row-three">
          <div className="huadan-block">
            {(() => {
              let statusTag;
              switch (dishes.produceStatus) {
                case 694:
                  statusTag = <span className="dengjiao">等叫</span>;
                  break;
                case 830:
                  statusTag = <span className="weichengzhong">未称重</span>;
                  break;
                case 693:
                  statusTag = <span className="zhizuo">制作中</span>;
                  break;
                case 981:
                  statusTag = <span className="chupin">已出品</span>;
                  break;
                case 982:
                  statusTag = <span className="shangcai">已上菜</span>;
                  break;
                case 698:
                  statusTag = <span className="chaoshi">超时</span>;
                  break;
                default:
              }
              return statusTag;
            })()}
          </div>
        </div>
      )}
    </li>
  );
}
/**************** 未下单组件 *****************/

/**************** 已下单组件 *****************/
function DidOrder({
  index,
  dishesStore,
  dishes,
  noStatus,
  modifyDidOrder,
  markOrderHandle,
  cancelMarkOrderHandle
}) {
  return (
    <li
      className={classnames({
        select: dishes.selected
      })}
      onClick={() => {
        modifyDidOrder && modifyDidOrder(dishes);
      }}
    >
      <div className="row-one">
        <span className="serial">{index > 0 && index}</span>
        <span className="name">
          {dishes.tagIDs &&
            dishes.tagIDs.split(',').map(id => {
              let tag;
              switch (id) {
                case '20': //免做
                  tag = (
                    <span key={id} className="mianzuo">
                      免
                    </span>
                  );
                  break;
                case '21': //加急
                  tag = (
                    <span key={id} className="xian">
                      先
                    </span>
                  );
                  break;
                case '22': //催菜
                  tag = (
                    <span key={id} className="cui">
                      催
                    </span>
                  );
                  break;
                case '23': //打包
                  tag = (
                    <span key={id} className="dabao">
                      打包
                    </span>
                  );
                  break;
                default:
              }
              return tag;
            })}
          {dishes.productName +
            (dishes.optionName ? '(' + dishes.optionName + ')' : '')}
        </span>
        <span className="number">
          {(() => {
            if (dishes.needWeigh) {
              return dishes.floatQuantity;
            } else {
              return dishes.quantity;
            }
          })()}
        </span>
        <span
          className={classnames({
            price: dishes.aLaCarteMethod !== 686,
            'price-del': dishes.aLaCarteMethod === 686
          })}
        >
          {(function() {
            if (index === -1) {
              return '￥' + Number(dishes.comboDetaPrice).toFixed(2);
            } else if (dishes.price !== undefined) {
              return '￥' + Number(dishes.price).toFixed(2);
            } else if (dishes.totalAmount !== undefined) {
              return '￥' + Number(dishes.totalAmount).toFixed(2);
            }
          })()}
        </span>
      </div>
      <div className="row-two">
        {!!dishes.valueNames && (
          <div className="taste">
            <span className="matter">{dishes.valueNames}</span>
          </div>
        )}
        {!!dishes.memo && <span className="remark">备注：{dishes.memo}</span>}
        <div className="zeng-block">
          {(() => {
            let tag;
            switch (dishes.aLaCarteMethod) {
              case 685: //退菜
                tag = (
                  <span>
                    <span className="tui">退</span>
                    <span className="tagMemo">{dishes.mappingDesc}</span>
                  </span>
                );
                break;
              case 686: //赠菜
                tag = (
                  <span>
                    <span className="zeng">赠</span>
                    <span className="tagMemo">{dishes.mappingDesc}</span>
                  </span>
                );
                break;
              case 996: //转菜
                tag = <span className="zhuan">转</span>;
                break;
              case 997: //换菜
                tag = <span className="huan">换</span>;
                break;
              case 998: //转赠
                tag = <span className="zhuanzeng">转赠</span>;
                break;
              default:
            }
            return tag;
          })()}
          {false && <span>[老板朋友]</span>}
        </div>
      </div>
      <div className="row-three">
        <div className="huadan-block">
          {!noStatus &&
            dishes.aLaCarteMethod !== 685 &&
            (() => {
              let statusTag;
              switch (dishes.produceStatus) {
                case 694:
                  statusTag = <span className="dengjiao">等叫</span>;
                  break;
                case 830:
                  statusTag = <span className="weichengzhong">未称重</span>;
                  break;
                case 984:
                  statusTag = <span className="daichengzhong">待称重</span>;
                  break;
                case 985:
                  statusTag = <span className="yichengzhong">已称重</span>;
                  break;
                case 986:
                  statusTag = <span className="daiqueren">待确认</span>;
                  break;
                case 693:
                  statusTag = <span className="zhizuo">制作中</span>;
                  break;
                case 981:
                  statusTag = <span className="chupin">已出品</span>;
                  break;
                case 982:
                  statusTag = <span className="shangcai">已上菜</span>;
                  break;
                case 698:
                  statusTag = <span className="chaoshi">超时</span>;
                  break;
                default:
              }
              return statusTag;
            })()}
          {!!dishes.servingQuantity &&
            dishes.produceStatus !== 982 &&
            `已上菜${dishes.servingQuantity}${dishes.unit}`}
          {markOrderHandle &&
          (dishes.produceStatus === 693 || //制作中
            dishes.produceStatus === 981) && //已出品
          dishes.aLaCarteMethod !== 685 && //退菜
          (dishes.needWeigh || dishes.quantity > dishes.servingQuantity) && ( //非称重上菜数量小于点菜数量
              <span
                className="huadan"
                onClick={event => {
                  markOrderHandle();
                  event.stopPropagation();
                }}
              >
                划单
              </span>
            )}
          {false &&
            cancelMarkOrderHandle &&
            (dishes.produceStatus === 982 ||
              (dishes.combo && dishes.quantity === dishes.servingQuantity)) && (
              <span
                className="huadan"
                onClick={event => {
                  cancelMarkOrderHandle();
                  event.stopPropagation();
                }}
              >
                取消划单
              </span>
            )}
        </div>
      </div>
    </li>
  );
}
/**************** 已下单组件 *****************/

/**************** 购物车容器 *****************/
@inject('dishesStore')
@observer
class WillOrderList extends Component {
  state = {
    statePopup: false
  };

  //修改未下单菜品
  modifyWillOrder({ dishes, cartIndex, parents, isSpellChild }) {
    const { dishesStore } = this.props;
    const { cartRecordID } = dishes;

    //选中未下单状态
    this.props.dishesStore.selectWillOrder({ cartIndex, cartRecordID });

    if (
      dishesStore.dishesStage === 'spell' &&
      !dishes.productMode &&
      !isSpellChild
    ) {
      if (dishes.designerID) {
        this.spellTipHandle({ dishes, initialSpell: false });
      } else {
        //拼菜模式下，购物车单品移入拼菜
        dishesStore.moveDishesFromCartToSpell(dishes);
      }
    } else {
      this.setState({
        statePopup: (
          <WillOrderPopup
            {...{ dishes, cartIndex, parents, isSpellChild }}
            closeHandle={this.closeStatePopup.bind(this)}
            spellTipHandle={this.spellTipHandle.bind(this, { dishes })}
          />
        )
      });
    }
  }

  //编辑套餐详情
  editComboGroup({ dishes, cartIndex }) {
    let { dishesStore } = this.props;
    let comboGroup = dishesStore.comboGroupMap[dishes.cartRecordID];
    this.setState({
      statePopup: (
        <TaocanPopup
          title={dishes.productName}
          cartIndex={cartIndex}
          dishes={dishes}
          comboGroup={comboGroup}
          closeHandle={this.closeStatePopup.bind(this)}
        />
      )
    });
  }

  exchangeDishes() {
    let { exchangeDishes } = this.props;
    exchangeDishes && exchangeDishes();
  }

  //关闭其他弹窗
  closeStatePopup() {
    this.setState({
      statePopup: false
    });
  }

  spellTipHandle({ dishes, initialSpell = true }) {
    let { dishesStore } = this.props;
    this.setState({
      statePopup: (
        <PromptPopup
          onOk={() => {
            this.setState({ statePopup: false });

            //在放入拼菜之前清空厨师和厨房状态
            dishesStore.updateProductToCart({
              cartRecordID: dishes.cartRecordID,
              tagIDs: '',
              produceStatus: dishes.needWeigh ? 830 : 693,
              designerID: '',
              designerName: '',
              designerPrice: 0
            });

            if (initialSpell) {
              //初始化拼菜
              dishesStore.openSpellStage();
              dishesStore.initSpellList({ dishes, needFilter: true });
            } else {
              //购物车单品移入拼菜
              dishesStore.moveDishesFromCartToSpell(dishes);
            }
          }}
          onCancel={() => {
            this.setState({ statePopup: false });
          }}
        >
          <div style={promptContStyle}>
            拼菜将取消【{dishes.productName}】厨师选择，是否继续？
          </div>
        </PromptPopup>
      )
    });
  }

  componentDidUpdate() {
    const { dishesStore } = this.props;
    //购物车自动滚动到刚点菜品处
    if (dishesStore.shoppingCart.length && dishesStore.cartIndex > -1) {
      let scrollIndex = -1;
      dishesStore.shoppingCart.forEach((product, index) => {
        if (index <= dishesStore.cartIndex) {
          scrollIndex += 1;
          if (index < dishesStore.cartIndex) {
            if (product.comboList && product.comboList.length) {
              product.comboList.forEach(dishes => {
                scrollIndex += 1;
              });
            }
          }
        }
      });
      let shoppingCart = document.getElementById('shoppingCart');
      let selectDishes = shoppingCart.getElementsByClassName('will-order')[
        scrollIndex
      ];
      let scrollTop =
        selectDishes.getBoundingClientRect().top -
        shoppingCart.getBoundingClientRect().top;
      this.shoppingCart.scrollTop(scrollTop);
      dishesStore.clearCartIndex(); //清空购物车选中菜品下标
    }
  }

  render() {
    const { dishesStore } = this.props;
    return (
      <div className="order-list">
        <div className="list-title">
          <span>序号</span>
          <span>名称(规格)</span>
          <span>数量</span>
          <span>金额</span>
        </div>
        <div className="list-content">
          <Scrollbars
            ref={shoppingCart => {
              this.shoppingCart = shoppingCart;
            }}
          >
            <ul id="shoppingCart">
              {dishesStore.shoppingCart && dishesStore.shoppingCart.length ? (
                dishesStore.shoppingCart.map((dishes, index) => {
                  let willOrder = [];
                  willOrder.push(
                    <WillOrder
                      key={index}
                      index={index}
                      dishesStore={dishesStore}
                      dishes={dishes}
                      modifyWillOrder={this.modifyWillOrder.bind(this, {
                        dishes,
                        cartIndex: index
                      })}
                      editComboGroup={this.editComboGroup.bind(this, {
                        dishes,
                        cartIndex: index
                      })}
                    />
                  );

                  const childs = dishes.comboList || dishes.assortedDishesList;
                  const isSpellChild = dishes.productMode === 1377;

                  if (childs && childs.length) {
                    childs.forEach(child => {
                      willOrder.push(
                        <WillOrder
                          key={child.cartRecordID}
                          index={-1}
                          parents={dishes}
                          isSpellChild={isSpellChild}
                          dishesStore={dishesStore}
                          dishes={child}
                          modifyWillOrder={this.modifyWillOrder.bind(this, {
                            dishes: child,
                            cartIndex: index,
                            parents: dishes,
                            isSpellChild
                          })}
                          exchangeDishes={this.exchangeDishes.bind(this)}
                        />
                      );
                    });
                  }
                  return willOrder;
                })
              ) : (
                <div className="empty-holder">请点菜</div>
              )}
            </ul>
          </Scrollbars>
        </div>
        <div className="list-all">
          <div>
            {' '}
            总数：<span>{dishesStore.shoppingCartTotal.totalQuantity}</span>
          </div>
          <div>
            总金额：<span>
              {Number(dishesStore.shoppingCartTotal.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
        {this.state.statePopup}
      </div>
    );
  }
}
/**************** 购物车容器 *****************/

/**************** 已下单容器 *****************/
@inject('dishesStore')
@observer
class DidOrderList extends Component {
  state = {
    statePopup: false
  };

  //划单
  markOrderHandle(dishes) {
    let { dishesStore } = this.props;
    let { detailID, recordID, quantity } = dishes;

    if (quantity > 1) {
      //数量大于1时弹框输入数量
      this.setState({
        statePopup: (
          <MarkOrderPopup
            dishes={dishes}
            okClick={() => {
              //确定划单
              this.closeStatePopup();
            }}
            cancelClick={() => {
              //取消划单
              this.closeStatePopup();
            }}
          />
        )
      });
    } else {
      //划单二次确认
      this.setState({
        statePopup: (
          <PromptPopup
            onOk={() => {
              //等于1时直接划单
              dishesStore.markOrder({
                markOrderDetail: [
                  {
                    detailID,
                    recordID,
                    quantity: 1
                  }
                ]
              });
              this.setState({ statePopup: false });
            }}
            onCancel={() => {
              this.setState({ statePopup: false });
            }}
          >
            <div style={promptContStyle}>
              确定划单【<strong style={{ padding: '5px', color: '#F00' }}>
                {dishes.productName}
              </strong>】1份？
            </div>
          </PromptPopup>
        )
      });
    }
  }

  //取消划单
  cancelMarkOrderHandle(dishes) {
    let { detailID, recordID, quantity } = dishes;

    if (quantity > 1) {
      //数量大于1时弹框输入数量
      this.setState({
        statePopup: (
          <MarkOrderPopup
            dishes={dishes}
            cancel
            okClick={() => {
              //确定划单
              this.closeStatePopup();
            }}
            cancelClick={() => {
              //取消划单
              this.closeStatePopup();
            }}
          />
        )
      });
    } else {
      //等于1时直接取消划单
      this.props.dishesStore.cancelMarkOrder({
        cancelMarkOrderDetail: [
          {
            detailID,
            recordID,
            quantity: 1
          }
        ]
      });
    }
  }

  //修改已下单菜品
  modifyDidOrder(dishes) {
    let { detailID, recordID } = dishes;
    this.props.dishesStore.selectDidOrder({ detailID, recordID });

    if (
      dishes.aLaCarteMethod !== 685 &&
      !dishes.recordID &&
      (dishes.canRetAlreadyNum > 0 || dishes.canRetNotNum > 0)
    ) {
      this.setState({
        statePopup: (
          <DidOrderPopup
            dishes={dishes}
            okClick={() => {
              //确认修改
              this.closeStatePopup();
            }}
            cancelClick={() => {
              //取消修改
              this.closeStatePopup();
            }}
          />
        )
      });
    }
  }

  //关闭其他弹窗
  closeStatePopup() {
    this.setState({
      statePopup: false
    });
  }

  render() {
    const { dishesStore } = this.props;
    return (
      <div className="order-list">
        <div className="list-title">
          <span>序号</span>
          <span>名称(规格)</span>
          <span>数量</span>
          <span>金额</span>
        </div>
        <div className="list-content">
          <Scrollbars>
            <ul>
              {dishesStore.didOrderList &&
              dishesStore.didOrderList.orderProductList &&
              dishesStore.didOrderList.orderProductList.length ? (
                dishesStore.didOrderList.orderProductList.map(
                  (dishes, dishesIndex) => {
                    let didOrder = [];
                    didOrder.push(
                      <DidOrder
                        key={dishesIndex}
                        index={dishesIndex + 1}
                        dishesStore={dishesStore}
                        dishes={dishes}
                        modifyDidOrder={this.modifyDidOrder.bind(this, dishes)}
                        markOrderHandle={this.markOrderHandle.bind(
                          this,
                          dishes
                        )}
                        cancelMarkOrderHandle={this.cancelMarkOrderHandle.bind(
                          this,
                          dishes
                        )}
                      />
                    );
                    if (dishes.childs && dishes.childs.length) {
                      dishes.childs.forEach((child, childIndex) => {
                        didOrder.push(
                          <DidOrder
                            key={dishesIndex + '-' + childIndex}
                            index={-1}
                            dishesStore={dishesStore}
                            dishes={child}
                            modifyDidOrder={this.modifyDidOrder.bind(
                              this,
                              child
                            )}
                            markOrderHandle={this.markOrderHandle.bind(
                              this,
                              child
                            )}
                            cancelMarkOrderHandle={this.cancelMarkOrderHandle.bind(
                              this,
                              child
                            )}
                          />
                        );
                      });
                    }
                    return didOrder;
                  }
                )
              ) : (
                <div className="empty-holder">还没有下单哦！</div>
              )}
            </ul>
          </Scrollbars>
        </div>
        <div className="list-all">
          <div>
            总数：<span>{dishesStore.didOrderList.subTotalNumber}</span>
          </div>
          <div>
            总金额：<span>
              {Number(dishesStore.didOrderList.subTotalAmount).toFixed(2)}
            </span>
          </div>
        </div>
        {this.state.statePopup}
      </div>
    );
  }
}
/**************** 已下单容器 *****************/

/**************** 菜品组件 *****************/
function Dishes({ dishesStore, dishes, handleClick }) {
  let remainingQuantity = dishes.remainingFloatQuantity; //剩余数量
  let remaining = dishes.curbSale && remainingQuantity; //是否要显示剩余数量
  let isSellout = !!dishes.curbSale && remainingQuantity === 0; //是否要显示沽清状态
  return (
    <li
      onClick={() => {
        if (
          dishes.menuStatus !== 846 &&
          (!isSellout || dishesStore.dishesType === 'booking')
        ) {
          handleClick();
        }
      }}
    >
      <div className="dishes-info">
        <div
          className={
            dishes.productName.length > 5 ? 'title-small' : 'title-big'
          }
        >
          {dishes.productName}
        </div>
        <div className="marks">
          {dishes.tagIDs &&
            dishes.tagIDs.length &&
            dishes.tagIDs.split(',').map(type => {
              let tag;
              switch (type) {
                case '1':
                  tag = (
                    <span key={type} className="tuijian">
                      推荐
                    </span>
                  );
                  break;
                case '2':
                  tag = (
                    <span key={type} className="jingdian">
                      经典
                    </span>
                  );
                  break;
                case '3':
                  tag = (
                    <span key={type} className="rexiao">
                      热销
                    </span>
                  );
                  break;
                default:
              }
              return tag;
            })}
        </div>
        {!!remaining && (
          <span className="content">
            <i className="iconfont icon-order_icon_prompt" />
            余{remaining}
            {dishes.unit}
          </span>
        )}
        {dishes.productType === 1 && <div className="taocan">套餐</div>}
      </div>
      <div className="dishes-price">
        ¥{Number(dishes.price).toFixed(2)}/{dishes.unit}
      </div>
      {!!dishes.quantity && <div className="number">{dishes.quantity}</div>}
      {dishes.menuStatus === 846 && (
        <div className="tingshou">
          <i className="iconfont icon-order_icon_tingshou" />
        </div>
      )}
      {isSellout &&
        dishesStore.dishesType !== 'booking' && (
          <div className="tingshou">
            <i className="iconfont icon-order_icon_guqing" />
          </div>
        )}
    </li>
  );
}
/**************** 菜品组件 *****************/

/**************** 菜品分类和类别容器 *****************/
@inject('dishesStore')
@observer
class DishesContainer extends Component {
  state = {
    statePopup: false
  };

  //选择菜品
  clickDishes({ dishesStore, dishes }) {
    if (dishes.productType === 1) {
      //套餐
      //如果是换菜模式则提示选择单品
      if (dishesStore.exchangeDishes) {
        dishesStore.showFeedback({ status: 'warn', msg: '请选择单品进行换菜！' });
        return;
      }
      this.getComboGroupList({
        //获取菜品信息
        productID: dishes.productID,
        complete: comboGroupData => {
          const { dishesStore } = this.props;
          const { groupComboList, basicComboList } = comboGroupData;
          let selectedComboMap = {};
          selectedComboMap['头盘'] = basicComboList;

          let comboGroup = {
            groupComboList,
            selectedComboMap
          };

          if (!groupComboList.length && Object.keys(selectedComboMap).length) {
            //固定套餐直接加入购物车
            dishesStore.addToCart({
              isStatic: false,
              dishes,
              comboGroup,
              isFixedGroupCombo: true
            });
          } else {
            //任选套餐弹窗选择套餐明细
            this.setState({
              statePopup: (
                <TaocanPopup
                  title={dishes.productName}
                  dishes={dishes}
                  comboGroup={comboGroup}
                  closeHandle={this.closeStatePopup.bind(this)}
                />
              )
            });
          }
        }
      });
    } else if (dishes.productType === 2) {
      //单品
      this.getProductMessage({
        //获取菜品信息
        menuID: dishes.menuID || dishes.MenuID,
        complete: productMessage => {
          let { dishesStore } = this.props;
          let { specificationList, attributeMap } = productMessage;
          let needSetting =
            (specificationList && specificationList.length) ||
            (attributeMap && Object.keys(attributeMap).length) ||
            dishes.needWeigh;
          if (needSetting) {
            //需要弹窗设置规格，称重和口味做法
            this.setState({
              statePopup: (
                <CommonPopup
                  title={dishes.productName}
                  dishes={dishes}
                  productMessage={productMessage}
                  closeHandle={this.closeStatePopup.bind(this)}
                />
              )
            });
          } else {
            dishesStore.addToCart({
              isStatic: false,
              dishes,
              productMessage: productMessage
            });
          }
        }
      });
    }
  }

  //获取菜品配置信息
  getProductMessage({ menuID, complete }) {
    let { dishesStore } = this.props;
    getJSON({
      url: '/reception/product/getProductMessage',
      data: { menuID },
      success: function(json) {
        if (json.code === 0) {
          complete && complete(json.data);
        } else {
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  getComboGroupList({ productID, complete }) {
    let { dishesStore } = this.props;
    getJSON({
      url: '/reception/product/getComboGroupInfo',
      data: { productID },
      success: function(json) {
        if (json.code === 0) {
          complete && complete(json.data);
        } else {
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //关闭其他弹窗
  closeStatePopup() {
    this.setState({
      statePopup: false
    });
  }

  render() {
    const { dishesStore } = this.props;
    return (
      <div id="dishes_con_right">
        <div className="dishes-category">
          <Tabs
            activeKey={dishesStore.firstCategoryID}
            onTabClick={categoryID => {
              dishesStore.getSecondCategoryList({
                dishesType: this.props.dishesType,
                firstCategoryID: categoryID
              });
            }}
          >
            {dishesStore.firstCategoryList.map(category => {
              return (
                <TabPane
                  tab={category.categoryName}
                  key={category.categoryID}
                />
              );
            })}
          </Tabs>
        </div>

        <div className="dishes-nav">
          <div className="nav-tabs">
            <Tabs
              activeKey={dishesStore.secondCategoryID}
              onTabClick={categoryID => {
                dishesStore.getDishesList({
                  dishesType: this.props.dishesType,
                  categoryID
                });
              }}
            >
              {dishesStore.secondCategoryList.map(category => {
                return (
                  <TabPane
                    tab={category.categoryName}
                    key={category.categoryID}
                  />
                );
              })}
            </Tabs>
          </div>
          <div className="nav-search">
            <input
              type="text"
              placeholder="搜索菜品"
              value={dishesStore.searchCode}
              onChange={e => {
                dishesStore.getDishesList({
                  dishesType: this.props.dishesType,
                  searchCode: e.target.value
                });
              }}
            />
            <i className="iconfont icon-order_btn_search" />
          </div>
        </div>

        <Scrollbars>
          <ul className="dishes-list">
            {dishesStore.dishesList.length ? (
              dishesStore.dishesList
                .concat(Array(10).fill(0))
                .map((dishes, index) => {
                  return dishes ? (
                    (dishesStore.dishesStage === 'normal' ||
                      (dishesStore.dishesStage === 'spell' &&
                        dishes.productType === 2)) && (
                      <Dishes
                        key={index}
                        dishesStore={dishesStore}
                        dishes={dishes}
                        handleClick={this.clickDishes.bind(this, {
                          dishesStore,
                          dishes
                        })}
                      />
                    )
                  ) : (
                    <li key={index} />
                  );
                })
            ) : (
              <div className="empty-holder">暂无菜品！</div>
            )}
          </ul>
        </Scrollbars>
        {false && (
          <div className="dishes-pagination">
            <div
              className={classnames({ active: dishesStore.pageNum > 1 })}
              onClick={() => {
                if (dishesStore.pageNum > 1)
                  dishesStore.getDishesList({ type: 'prev' });
              }}
            >
              上一页
            </div>
            <div
              className={classnames({
                active: dishesStore.pageNum < dishesStore.pages
              })}
              onClick={() => {
                if (dishesStore.pageNum < dishesStore.pages)
                  dishesStore.getDishesList({ type: 'next' });
              }}
            >
              下一页
            </div>
          </div>
        )}
        {this.props.children}
        {this.state.statePopup}
      </div>
    );
  }
}
/**************** 菜品分类和类别容器 *****************/

/************************宴会已下单组件**************************/
@inject('dishesStore')
@observer
class BanquetDidOrderList extends Component {
  render() {
    let { didOrderList } = this.props.dishesStore;
    let addDish, typeList, totalCount, totalAmount; //加菜  点菜类型,总数，总金额
    if (didOrderList) {
      addDish = didOrderList.addDish;
      typeList = didOrderList.typeList;
      totalCount = didOrderList.totalCount;
      totalAmount = didOrderList.totalAmount;
    }
    return (
      <div className="banquet-has-order">
        <div className="qu-list">
          <Scrollbars>
            <div className="order-details-right-main">
              <Collapse bordered={false}>
                {typeList &&
                  typeList.map((type, index) => {
                    let comLength = type.comboList ? type.comboList.length : 0;

                    return (
                      <Panel
                        key={index}
                        header={
                          <div className="show-content">
                            <div className="content-title">
                              <em>{type.typeName}</em>
                              <span>每桌 ¥{type.amount}</span>
                              <span>共{type.tables}桌</span>
                              <span>金额：¥{type.total}元</span>
                            </div>
                          </div>
                        }
                      >
                        {type.comboList &&
                          type.comboList.length > 0 &&
                          type.comboList.map((comb, combIndex) => {
                            return (
                              <div className="order-submenu" key={combIndex}>
                                <div className="order-main">
                                  <div className="order-title">
                                    <span>{combIndex + 1}</span>
                                    <span>
                                      {' '}
                                      <i>套</i>
                                      {comb.comboName}
                                    </span>
                                    <span>
                                      {comb.comboNum}X{comb.comboTableNum}席
                                    </span>
                                  </div>
                                </div>
                                {comb.dishList &&
                                  comb.dishList.length > 0 &&
                                  comb.dishList.map((item, itemIndex) => {
                                    return (
                                      <div
                                        className="each-order"
                                        key={itemIndex}
                                      >
                                        <p className="order-p">
                                          <span>
                                            {item.dishName}
                                            {item.dishSize
                                              ? `(${item.dishSize})`
                                              : ''}
                                          </span>
                                          <span>
                                            {item.num}X{item.tables}席
                                          </span>
                                        </p>
                                        {item.valueNames && (
                                          <em>做法：{item.valueNames}</em>
                                        )}
                                        {item.memo && <em>备注：{item.memo}</em>}
                                      </div>
                                    );
                                  })}
                              </div>
                            );
                          })}
                        {type.dishList &&
                          type.dishList.length > 0 &&
                          type.dishList.map((dish, dishIndex) => {
                            return (
                              <div className="order-submenu" key={dishIndex}>
                                <div className="order-main">
                                  <div className="order-title">
                                    <span>{comLength + dishIndex + 1}</span>
                                    <span>
                                      {dish.dishName}
                                      {dish.dishSize
                                        ? '(' + dish.dishSize + ')'
                                        : ''}
                                    </span>
                                    <span>
                                      {dish.num}X{dish.tables}席
                                    </span>
                                  </div>
                                  <div>
                                    {dish.valueNames && (
                                      <p>做法:{dish.valueNames}</p>
                                    )}
                                    {dish.memo && <p>备注:{dish.memo}</p>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </Panel>
                    );
                  })}
              </Collapse>

              <Collapse bordered={false} defaultActiveKey={['0']}>
                <Panel
                  disabled
                  header={
                    <div className="show-content">
                      <div className="content-title">
                        <em>加菜清单</em>
                      </div>
                    </div>
                  }
                >
                  {addDish &&
                    addDish.comboList &&
                    addDish.comboList.length > 0 &&
                    addDish.comboList.map((comb, combIndex) => {
                      return (
                        <div className="order-submenu" key={combIndex}>
                          <div className="order-main">
                            <div className="order-title">
                              <span>{combIndex + 1}</span>
                              <span>
                                {' '}
                                <i>套</i>
                                {comb.comboName}
                              </span>
                              <span>
                                {comb.comboNum}X{comb.comboTableNum}席
                              </span>
                              <span>￥{Number(comb.comboPrice).toFixed(2)}</span>
                            </div>
                            <p className="desk-list">桌台：{comb.tableNames}</p>
                          </div>

                          {comb.dishList &&
                            comb.dishList.length > 0 &&
                            comb.dishList.map((item, itemIndex) => {
                              return (
                                <div className="each-order" key={itemIndex}>
                                  <p className="order-p">
                                    <span>
                                      {item.dishName}
                                      {item.dishSize
                                        ? '(' + item.dishSize + ')'
                                        : ''}
                                    </span>
                                  </p>
                                  {item.valueNames && (
                                    <em>做法：{item.valueNames}</em>
                                  )}
                                  {item.memo && <em>备注：{item.memo}</em>}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  {addDish &&
                    addDish.dishList &&
                    addDish.dishList.length > 0 &&
                    addDish.dishList.map((dish, dishIndex) => {
                      return (
                        <div className="order-submenu" key={dishIndex}>
                          <div className="order-main">
                            <div className="order-title">
                              <span>
                                {(addDish.comboList
                                  ? addDish.comboList.length
                                  : 0) +
                                  dishIndex +
                                  1}
                              </span>
                              <span>
                                {dish.dishName}
                                {dish.dishSize ? '(' + dish.dishSize + ')' : ''}
                              </span>
                              <span>
                                {dish.num}X{dish.tables}席
                              </span>
                              <span>￥{dish.amount}</span>
                            </div>
                            <div>
                              {dish.valueNames && <p>做法:{dish.valueNames}</p>}
                              {dish.memo && <p>备注:{dish.memo}</p>}
                              <p className="desk-list">桌台：{dish.tableNames}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </Panel>
              </Collapse>
            </div>
          </Scrollbars>
        </div>
        <div className="total">
          <div>
            <span>总数：</span>
            <span>{totalCount && totalCount}</span>
          </div>
          <div>
            <span>总金额：</span>
            <span>{Number(totalAmount && 1 * totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
}
/**************************************************/

export {
  DishesContainer,
  Dishes,
  WillOrder,
  WillOrderList,
  DidOrder,
  DidOrderList,
  BanquetDidOrderList
};
