/**
* @author William Cui
* @description 点菜界面
* @date 2017-04-21
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs, message } from 'antd';
import classnames from 'classnames';

import Prompt from 'components/prompt-common';
import AmendOrderPopup from 'components/order-dishes/amend-order-popup';
import MorePopup from 'components/order-dishes/more-popup';
import BatchPopup from 'components/order-dishes/more-popup/batch-popup';
import TurnGive from 'components/order-dishes/more-popup/turn-give';
import RetreatFood from 'components/order-dishes/more-popup/retreat-food';
import PromptPopup from 'components/prompt-popup';
import Loading from 'components/loading'; //加载层
import TemporaryDishesPopup from 'components/order-dishes/more-popup/user-defind-popup'; //临时菜
import AddOrderPopup from 'components/order-dishes/add-order-validation-popup'; //下单不成功提示弹窗

import {
  DishesContainer,
  WillOrderList,
  DidOrderList,
  BanquetDidOrderList
} from 'components/order-dishes';

import './dishes.less';

const TabPane = Tabs.TabPane;

/**************** 点菜主容器组件 *****************/
@inject('appStore', 'dishesStore')
@observer
class Dishes extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      statePopup: false,
      showLoading: false
    };

    let { dishesStore, location, params } = props;

    this.dishesType = 'normal';
    if (location && location.state && location.state.dishesType) {
      //获取预订信息
      this.dishesType = location.state.dishesType;
      this.orderInfo = location.state.orderInfo;
      if (params && params.tableID && this.orderInfo) {
        this.orderInfo.tableID = params.tableID;
      }
      this.nextUrl = location.state.nextUrl;
      this.cart = location.state.cart ? JSON.parse(location.state.cart) : null;
    }

    if (this.dishesType === 'normal') {
      //获取订单信息
      dishesStore.getOrderInfo({
        tableID: params.tableID,
        subOrderID: params.subOrderID
      });
    } else {
      //设置预订信息
      dishesStore.setOrderInfo(this.orderInfo);
    }

    //获取菜品分类
    if (this.dishesType === 'banquet' || this.dishesType === 'banquetAdd') {
      let archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID; //档案ID
      this.props.dishesStore.getFirstCategoryList({
        dishesType: this.dishesType,
        archiveID
      });
    } else {
      this.props.dishesStore.getFirstCategoryList({
        dishesType: this.dishesType,
        tableID: params.tableID,
        bookingTime: this.orderInfo ? this.orderInfo.bookingTime : null
      });
    }

    

    //读取上一个路由传入的购物车信息
    if (this.cart) {
      this.cart =
        typeof this.cart === 'object' ? this.cart : JSON.parse(this.cart);
      dishesStore.readShoppingCart({ cart: this.cart });
    }

    //读取保存在localStorage的购物车信息
    dishesStore.readShoppingCartFromLocalStorage({
      subOrderID: params.subOrderID
    });

    if (location.state && location.state.listKey) {
      //根据上一个路由显示相应的列表
      dishesStore.changeListKey({ key: location.state.listKey });
    }
  }

  componentDidMount() {
    let { route } = this.props;
    let { router } = this.context;
    router.setRouteLeaveHook(route, this.routerWillLeave.bind(this)); //设置react-router路由离开钩子
  }

  routerWillLeave(nextLocation) {
    let { dishesStore } = this.props;
    let { router } = this.context;

    if (!nextLocation.state) nextLocation.state = { willLeave: false };
    if (dishesStore.shoppingCart.length && !nextLocation.state.willLeave) {
      this.setState({
        statePopup: (
          <PromptPopup
            onCancel={() => {
              this.closeStatePopup.call(this); //关闭当前弹窗
              nextLocation.state.willLeave = true;

              dishesStore.clearShoppingCart(); //清空购物车
              router.push(nextLocation);
            }}
            onOk={() => {
              let cart = {
                shoppingCart: dishesStore.shoppingCart,
                productMessageMap: dishesStore.productMessageMap,
                comboGroupMap: dishesStore.comboGroupMap
              };
              localStorage.setItem(
                this.props.params.subOrderID,
                JSON.stringify(cart)
              ); //保存购物车到localStorage
              this.closeStatePopup.call(this); //关闭当前弹窗
              nextLocation.state.willLeave = true;

              dishesStore.clearShoppingCart({ freed: false }); //清空购物车
              router.push(nextLocation);
            }}
          >
            <div className="prompt" style={{ padding: '80px' }}>
              <div className="delele-text">
                你已点菜{dishesStore.shoppingCart.length}份，是否保存？
              </div>
            </div>
          </PromptPopup>
        )
      });
      return false;
    } else {
      nextLocation.state.willLeave = false;
    }
  }

  componentDidUpdate() {
    let dishesStore = this.props.dishesStore;
    let feedback = dishesStore.feedback;
    if (
      feedback &&
      feedback.status !== 'error' &&
      feedback.status !== 'validate'
    ) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, dishesStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, dishesStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, dishesStore.closeFeedback());
      }
    }
  }

  //关闭其他弹窗
  closeStatePopup() {
    this.setState({
      statePopup: false
    });
  }

  //修改订单信息弹窗
  showOrderInfoPopup() {
    this.setState({
      statePopup: (
        <AmendOrderPopup
          okClick={() => {
            this.closeStatePopup();
          }}
          cancelClick={() => {
            this.closeStatePopup();
          }}
        />
      )
    });
  }

  //更多操作
  moreAction({ actionType, actionName }) {
    let { dishesStore } = this.props;

    function batchOperate() {
      //批量操作弹窗
      this.setState({
        statePopup: (
          <BatchPopup
            action={{ actionType, actionName }}
            closeHandle={this.closeStatePopup.bind(this)}
          />
        )
      });
    }
    if (actionType === 'willOrder') {
      //未下单更多操作
      switch (actionName) {
        case '拼菜':
          dishesStore.openSpellStage();
          break;
        case '临时菜':
          this.setState({
            statePopup: (
              <TemporaryDishesPopup
                tableID={this.props.params.tableID}  
                subOrderID={this.props.params.subOrderID}
                handleClose={() => {
                  this.setState({ statePopup: false });
                }}
              />
            )
          });
          break;
        case '清空全部':
          dishesStore.clearShoppingCart();
          break;
        case '下单不打厨':
          if (dishesStore.shoppingCart.length && !this.state.showLoading) {
            this.setState({ showLoading: true });
            dishesStore.addOrder({
              kitchen: 0,
              complete: () => {
                this.setState({ showLoading: false });
              },
              failure: data => {
                this.setState({
                  statePopup: (
                    <AddOrderPopup
                      data={data}
                      handleClose={() => {
                        this.setState({ statePopup: false });
                      }}
                    />
                  )
                });
              }
            });
          } else {
            dishesStore.showFeedback({ type: 'warn', msg: '请先点菜！' });
          }
          break;
        case '删菜':
        case '等叫':
        case '取消等叫':
        case '免做':
        case '取消免做':
        case '先做':
        case '取消先做':
        case '打包':
        case '取消打包':
          batchOperate.call(this);
          break;
        case '转赠':
          this.setState({
            statePopup: (
              <TurnGive
                action={{ actionType, actionName }}
                closeHandle={this.closeStatePopup.bind(this)}
              />
            )
          });
          break;
        default:
      }
    } else if (actionType === 'didOrder') {
      //已下单更多操作
      switch (actionName) {
        case '退菜':
          dishesStore.getFilterProduct({ type: 'back' });
          this.setState({
            statePopup: (
              <RetreatFood
                tableName={dishesStore.orderInfo.tableName}
                action={{ actionType, actionName }}
                closeHandle={this.closeStatePopup.bind(this)}
              />
            )
          });
          break;
        case '转菜':
          dishesStore.getFilterProduct({ type: 'transfer' });
          this.setState({
            statePopup: (
              <TurnGive
                action={{ actionType, actionName }}
                closeHandle={this.closeStatePopup.bind(this)}
              />
            )
          });
          break;
        case '等叫':
          dishesStore.getFilterProduct({
            type: 'status',
            status: 693
          });
          batchOperate.call(this);
          break;
        case '叫起':
          dishesStore.getFilterProduct({
            type: 'status',
            status: 694
          });
          batchOperate.call(this);
          break;
        case '催菜':
          dishesStore.getFilterProduct({ type: 'boiled' });
          batchOperate.call(this);
          break;
        case '划单':
          dishesStore.getFilterProduct({ type: 'markOrder' });
          batchOperate.call(this);
          break;
        case '取消划单':
          dishesStore.getFilterProduct({
            type: 'cancelMarkOrder',
            status: 982
          });
          batchOperate.call(this);
          break;
        case '复制菜':
          dishesStore.getFilterProduct({ type: 'copy' });
          this.setState({
            statePopup: (
              <TurnGive
                action={{ actionType, actionName }}
                subOrderID={this.props.params.subOrderID}
                closeHandle={this.closeStatePopup.bind(this)}
              />
            )
          });
          break;
        default:
      }
    }
  }

  componentWillUnmount() {
    let { dishesStore } = this.props;

    dishesStore.changeListKey({ key: 'willOrder' });
    dishesStore.clearOrderInfo(); //清空订单信息
    dishesStore.clearCategoryList(); //清空菜品分类
    dishesStore.clearDishesList(); //清空菜品列表
  }

  render() {
    const { appStore, dishesStore } = this.props;
    const orderInfo = dishesStore.orderInfo;
    let feedback = dishesStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        dishesStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    let permissionList = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account')).permissionList
      : [];

    const isSpellMode = dishesStore.dishesStage === 'spell';

    let activeSpell = false;
    dishesStore.shoppingCart.forEach(dishes => {
      if (dishes.productMode === 1377 && dishes.assortedDishesList.length > 1) {
        activeSpell = true;
      }
    });
    return (
      <div id="order_dishes">
        <div className="dishes_header">
          {this.dishesType === 'booking' && '预定'}
          {this.dishesType === 'banquet' && '宴会'}点菜
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              //返回桌台界面
              this.context.router.goBack();
            }}
          />
        </div>
        <div id="dishes_container">
          <div id="dishes_con_left">
            <div className="dishes-info">
              {this.dishesType === 'normal' && (
                <div className="info-title">
                  <span>{orderInfo.orderCode}</span>
                  {permissionList.includes('TableOperation:ModifyOrder') && (
                    <span
                      className="info-edit"
                      onClick={this.showOrderInfoPopup.bind(this)}
                    >
                      <i className="iconfont icon-order_btn_edit" />编辑
                    </span>
                  )}
                </div>
              )}
              {(this.dishesType === 'normal' ||
                this.dishesType === 'booking') && ( //普通点菜和预订点菜 订单信息
                <ul>
                  <li>
                    <i className="iconfont icon-order_icon_desk" />
                    {orderInfo.tableName}
                    {orderInfo.shareTableName && '-' + orderInfo.shareTableName}
                  </li>
                  <li>
                    <i className="iconfont icon-order_icon_number" />
                    {orderInfo.peopleNum}
                  </li>
                  <li>
                    <i className="iconfont icon-order_icon_waiter" />
                    {orderInfo.waiterName || orderInfo.bookingName}
                  </li>
                  {orderInfo.createTime && (
                    <li>
                      <i className="iconfont icon-oeder_icon_time" />
                      {orderInfo.createTime}
                    </li>
                  )}
                </ul>
              )}
              {this.dishesType.indexOf('banquet') > -1 && ( //宴会点菜订单信息
                <ul className="banquet-info">
                  <li>
                    宴会单号 <strong>{orderInfo.bookingID}</strong>
                  </li>
                  <li>
                    宴会名称 <strong>{orderInfo.partyName}</strong>
                  </li>
                  <li>
                    客户姓名 <strong>{orderInfo.customerName}</strong>
                  </li>
                  <li>
                    预订桌数 <strong>{orderInfo.tableNum}桌</strong>
                  </li>
                  <li>
                    备用桌数 <strong>{orderInfo.backupNum}桌</strong>
                  </li>
                  {this.dishesType === 'banquet' && (
                    <li>
                      每桌人数 <strong>{orderInfo.peopleNum}人</strong>
                    </li>
                  )}
                  {this.dishesType === 'banquetAdd' && (
                    <li>
                      已开桌数 <strong>{orderInfo.actuNum}桌</strong>
                    </li>
                  )}
                  {this.dishesType === 'banquetAdd' && (
                    <li>
                      开席时间 <strong>{orderInfo.openTime}</strong>
                    </li>
                  )}
                </ul>
              )}
              {orderInfo.memo && (
                <div className="info-remarks">整单备注：{orderInfo.memo}</div>
              )}
              {orderInfo.comTableCode && (
                <div className="relate-desk">
                  关联桌台：<span>{orderInfo.comTableCode}</span>
                </div>
              )}
            </div>
            <div className="dishes-list">
              <Tabs
                activeKey={dishesStore.listActiveKey}
                onChange={key => {
                  if (dishesStore.dishesStage === 'normal') {
                    dishesStore.changeListKey({ key });
                  }
                }}
                tabBarStyle={{
                  display:
                    this.dishesType === 'normal' ||
                    this.dishesType === 'banquetAdd'
                      ? 'block'
                      : 'none'
                }}
              >
                <TabPane tab="未下单" key="willOrder">
                  <WillOrderList
                    exchangeDishes={() => {
                      //开启换菜模式
                      this.setState({ showExchangeMask: true });
                    }}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <span
                      onClick={() => {
                        if (dishesStore.dishesStage === 'normal') {
                          dishesStore.getDidOrderList();
                        }
                      }}
                    >
                      已下单
                      <i
                        className={classnames({
                          iconfont: true,
                          'icon-shuaxin': true,
                          refresh:
                            dishesStore.listActiveKey === 'didOrder' &&
                            !dishesStore.didOrderList.orderProductList
                        })}
                      />
                    </span>
                  }
                  key="didOrder"
                >
                  {this.dishesType === 'banquetAdd' ? (
                    <BanquetDidOrderList bookingID={this.orderInfo.bookingID} />
                  ) : (
                    <DidOrderList />
                  )}
                </TabPane>
              </Tabs>
              <div className="dishes-footer">
                {!isSpellMode &&
                  this.dishesType.indexOf('banquet') > -1 && (
                    <div
                      className={classnames({
                        normal: true,
                        disabled:
                          !dishesStore.shoppingCart ||
                          !dishesStore.shoppingCart.length
                      })}
                      onClick={() => {
                        dishesStore.clearShoppingCart();
                      }}
                    >
                      清空全部
                    </div>
                  )}
                {!isSpellMode &&
                  (this.dishesType === 'normal' ||
                    this.dishesType === 'banquetAdd') && (
                    <div
                      className={classnames({
                        normal: true,
                        disabled: !dishesStore.shoppingCart.length
                      })}
                      onClick={() => {
                        //下单打厨
                        if (
                          dishesStore.shoppingCart.length &&
                          !this.state.showLoading
                        ) {
                          this.setState({ showLoading: true });
                          dishesStore.addOrder({
                            kitchen: 1,
                            complete: () => {
                              this.setState({ showLoading: false });
                            },
                            failure: data => {
                              this.setState({
                                statePopup: (
                                  <AddOrderPopup
                                    data={data}
                                    handleClose={() => {
                                      this.setState({ statePopup: false });
                                    }}
                                  />
                                )
                              });
                            }
                          });
                        }
                      }}
                    >
                      下单打厨
                    </div>
                  )}
                {!isSpellMode &&
                  this.dishesType === 'banquetAdd' && (
                    <div
                      className={classnames({
                        normal: true,
                        disabled: !dishesStore.shoppingCart.length
                      })}
                      onClick={() => {
                        //下单不打厨
                        if (
                          dishesStore.shoppingCart.length &&
                          !this.state.showLoading
                        ) {
                          this.setState({ showLoading: true });
                          dishesStore.addOrder({
                            kitchen: 0,
                            complete: () => {
                              this.setState({ showLoading: false });
                            },
                            failure: data => {
                              this.setState({
                                statePopup: (
                                  <AddOrderPopup
                                    data={data}
                                    handleClose={() => {
                                      this.setState({ statePopup: false });
                                    }}
                                  />
                                )
                              });
                            }
                          });
                        }
                      }}
                    >
                      下单不打厨
                    </div>
                  )}
                {!isSpellMode &&
                  (this.dishesType === 'normal' ||
                    this.dishesType === 'banquetAdd') && (
                    <div
                      className={classnames({
                        normal: true,
                        disabled:
                          (!dishesStore.didOrderList.orderProductList ||
                            !dishesStore.didOrderList.orderProductList
                              .length) &&
                          !dishesStore.didOrderList.totalAmount
                      })}
                      onClick={() => {
                        if (
                          (dishesStore.didOrderList.orderProductList &&
                            dishesStore.didOrderList.orderProductList.length) ||
                          dishesStore.didOrderList.totalAmount
                        ) {
                          appStore.isInWorking({
                            //验证开班
                            success: () => {
                              if (this.dishesType === 'normal') {
                                let tableID = this.props.params.tableID;
                                let subOrderID = this.props.params.subOrderID;
                                appStore.validateSettlement({
                                  //验证是否有未称重和等叫菜品
                                  type: 'settlement',
                                  subOrderID,
                                  success: () => {
                                    this.context.router.push({
                                      pathname:
                                        '/settlement/' +
                                        tableID +
                                        '/' +
                                        subOrderID,
                                      state: {
                                        prevRouter: 'dishes'
                                      }
                                    }); //直接跳到结账界面
                                  },
                                  failure: ({ feedback }) => {
                                    feedback.cancelClick = () => {
                                      this.setState({ statePopup: false });
                                    };
                                    feedback.okClick = () => {
                                      this.setState({ statePopup: false });
                                    };
                                    this.setState({
                                      statePopup: <Prompt message={feedback} />
                                    });
                                  }
                                });
                              } else if (this.dishesType === 'banquetAdd') {
                                this.context.router.push({
                                  pathname: '/banquet/settlement',
                                  state: {
                                    bookingID: this.orderInfo.bookingID
                                  }
                                });
                              }
                            }
                          });
                        }
                      }}
                    >
                      结账
                    </div>
                  )}
                {!isSpellMode &&
                  (this.dishesType === 'booking' ||
                    this.dishesType === 'banquet') && (
                    <div
                      className={classnames({
                        normal: true,
                        disabled:
                          !dishesStore.shoppingCart ||
                          !dishesStore.shoppingCart.length
                      })}
                      onClick={() => {
                        if (dishesStore.shoppingCart.length) {
                          let cart = {
                            shoppingCart: dishesStore.shoppingCart,
                            productMessageMap: dishesStore.productMessageMap,
                            comboGroupMap: dishesStore.comboGroupMap,
                            totalQuantity:
                              dishesStore.shoppingCartTotal.totalQuantity,
                            totalAmount:
                              dishesStore.shoppingCartTotal.totalAmount
                          };

                          this.context.router.push({
                            pathname: this.nextUrl,
                            state: {
                              willLeave: true,
                              currentIndex: this.orderInfo.currentIndex,
                              saveData: this.orderInfo.saveData,
                              cart: JSON.stringify(cart)
                            }
                          });

                          dishesStore.clearShoppingCart({ freed: false }); //清空购物车
                        }
                      }}
                    >
                      完成
                    </div>
                  )}
                {!isSpellMode &&
                  (this.dishesType === 'normal' ||
                    this.dishesType === 'booking') && (
                    <div
                      className="more"
                      onClick={() => {
                        //弹出更多弹窗
                        this.setState({
                          statePopup: (
                            <MorePopup
                              activeKey={dishesStore.listActiveKey}
                              closeHandle={this.closeStatePopup.bind(this)}
                              actionHandle={this.moreAction.bind(this)}
                              booking={this.dishesType === 'booking'}
                            />
                          )
                        });
                      }}
                    >
                      更多
                    </div>
                  )}
                {isSpellMode && (
                  <div
                    className={classnames({
                      normal: true,
                      disabled: !activeSpell
                    })}
                    onClick={() => {
                      if (activeSpell) {
                        dishesStore.finishSpell();
                      }
                    }}
                  >
                    完成拼菜
                  </div>
                )}
                {isSpellMode &&
                  dishesStore.shoppingCart.length === 0 && (
                    <div
                      className="normal"
                      onClick={() => {
                        dishesStore.cancelSpellStage();
                      }}
                    >
                      取消拼菜
                    </div>
                  )}
              </div>
            </div>
            <div
              className={classnames({
                'exchange-dishes-mask': true,
                show: dishesStore.exchangeDishes
              })}
            >
              <div className="exchange-dishes-tip">
                <h2>换菜</h2>
                <p>请在右边选择要更换的菜品！</p>
                <div
                  onClick={() => {
                    //取消换菜，关闭换成遮罩
                    dishesStore.delExchangeDishes();
                  }}
                >
                  取消
                </div>
              </div>
            </div>
          </div>
          <DishesContainer dishesType={this.dishesType} />
        </div>
        {this.state.statePopup}
        {operatePrompt}
        {this.state.showLoading && <Loading />}
      </div>
    );
  }
}
/**************** 点菜主容器组件 *****************/

Dishes.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Dishes;
