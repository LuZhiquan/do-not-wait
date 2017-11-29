/**
 * @author shelly/shining
 * @description 订单界面
 * @date 2017-05-16
 **/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs, message } from 'antd';
import classnames from 'classnames';
import CalendarPopup from 'components/calendar-popup'; //日历弹出层
import { browserHistory } from 'react-router'; //路径跳转
import Scrollbars from 'react-custom-scrollbars';
import OrderDetailPopup from './order-detail-popup'; //订单详情弹窗
import UnsubscribeRecord from './unsubscribe-record'; //退定金记录
import InvoicePopup from './invoice-popup'; //开发票
import Prompt from 'components/prompt-common'; //错误提示
import PromptPopup from 'components/prompt-popup';
import OpenClassPopup from '../app/open-class-popup'; //开班
import SelectAdjustReasonPopup from './select-adjust-reason-popup'; //选择调账原因

import { checkPermission } from 'common/utils';
import AccreditPopup from 'components/accredit-popup'; //二次授权
import './order.less';
const TabPane = Tabs.TabPane;

message.config({
  top: 300
});

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

@inject('appStore', 'orderStore')
@observer
class Order extends Component {
  constructor(props) {
    super(props);
    let orderStore = this.props.orderStore;
    this.state = {
      tabPosition: 'left',
      invoicepopup: '', //开发票页面
      orderDetail: '', //订单详情页面
      mealtime: '', //餐次
      tabledishes: '', //桌台
      ordernumber: '', //订单号
      cashier: '', //收银员
      startcalendar: '', //开始日历弹窗
      endcalendar: '', //结束日历弹窗
      otherstarttime: orderStore.currentdate, //当前班次,今天,昨天的开始日期
      otherendtime: orderStore.currentdate, //当前班次,今天,昨天的结束日期
      starttime: orderStore.currentdate, //开始时间
      endtime: orderStore.currentdate, //结束时间
      statePopup: '',
      accreditPopup: '', //二次授权
      adjustReason: ''
    };
    let orderCode = this.props.params.orderCode;
    let orderStatus = this.props.params.orderStatus;
    if (orderCode === undefined && orderStatus === undefined) {
      // if(orderStore.issign === false){
      orderStore.getquOrderInfo({
        orderStatus: orderStore.statuscode, //默认查询消费中
        startDate: this.state.starttime,
        endDate: this.state.endtime
      });
      // }
    } else {
      if (Number(orderStatus) === 68) {
        orderStatus = 68;
      }
      orderStore.setstatuscode(Number(orderStatus));
      orderStore.getquOrderInfo({
        orderCode: orderCode,
        orderStatus: orderStatus
      });
    }
  }

  componentDidUpdate() {
    let orderStore = this.props.orderStore;
    let feedback = orderStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, orderStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, orderStore.closeFeedback());
          break;
        case 'error':
          message.warn(feedback.msg, orderStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, orderStore.closeFeedback());
      }
    }
  }

  //消费中
  consumption = () => {
    let orderStore = this.props.orderStore;
    orderStore.setstatuscode(654);
    orderStore.getquOrderInfo({
      orderStatus: orderStore.statuscode //查询消费中的数据
    });
    this.setState({
      mealtime: '', //餐次
      tabledishes: '', //桌台
      ordernumber: '', //订单号
      cashier: ''
    });
  };

  //已暂结
  provisional = () => {
    let orderStore = this.props.orderStore;
    orderStore.setstatuscode(651);
    orderStore.getquOrderInfo({
      orderStatus: orderStore.statuscode //查询已暂结的数据
    });
    this.setState({
      mealtime: '', //餐次
      tabledishes: '', //桌台
      ordernumber: '', //订单号
      cashier: ''
    });
  };

  //已结账
  checkedout = () => {
    let orderStore = this.props.orderStore;
    orderStore.setstatuscode(68);
    orderStore.getquOrderInfo({
      //查询已结账的数据
      orderStatus: orderStore.statuscode,
      dateSign: orderStore.dateSign,
      startDate: this.state.otherstarttime, //开始时间
      endDate: this.state.otherendtime //结束时间
    });
    this.setState({
      mealtime: '', //餐次
      tabledishes: '', //桌台
      ordernumber: '', //订单号
      cashier: ''
    });
  };

  //调账中
  adjustment = () => {
    let orderStore = this.props.orderStore;
    orderStore.setstatuscode(1430);
    orderStore.getquOrderInfo({
      //查询已结账的数据
      orderStatus: orderStore.statuscode,
      dateSign: orderStore.dateSign,
      startDate: this.state.otherstarttime, //开始时间
      endDate: this.state.otherendtime //结束时间
    });
    this.setState({
      mealtime: '', //餐次
      tabledishes: '', //桌台
      ordernumber: '', //订单号
      cashier: ''
    });
  };

  //已取消
  canceled = () => {
    let orderStore = this.props.orderStore;
    orderStore.setstatuscode(71);
    orderStore.getquOrderInfo({
      //查询已取消的数据
      orderStatus: orderStore.statuscode,
      dateSign: orderStore.dateSign,
      startDate: this.state.otherstarttime, //开始时间
      endDate: this.state.otherendtime //结束时间
    });
    this.setState({
      mealtime: '', //餐次
      tabledishes: '', //桌台
      ordernumber: '' //订单号
    });
  };

  //当前班次
  current = () => {
    let orderStore = this.props.orderStore;
    orderStore.setdateSign(1);
    this.setState({
      otherstarttime: orderStore.currentdate,
      otherendtime: orderStore.currentdate
    });
    orderStore.getquOrderInfo({
      //查询当前班次的数据
      orderStatus: orderStore.statuscode,
      dateSign: orderStore.dateSign,
      startDate: orderStore.currentdate, //开始时间
      endDate: orderStore.currentdate //结束时间
    });
  };

  //今天
  today = () => {
    let orderStore = this.props.orderStore;
    orderStore.setdateSign(2);
    this.setState({
      otherstarttime: orderStore.currentdate,
      otherendtime: orderStore.currentdate
    });
    orderStore.getquOrderInfo({
      //查询今天的数据
      orderStatus: orderStore.statuscode,
      dateSign: orderStore.dateSign,
      startDate: orderStore.currentdate, //开始时间
      endDate: orderStore.currentdate //结束时间
    });
  };

  //昨天
  yesterday = () => {
    let orderStore = this.props.orderStore;
    orderStore.setdateSign(3);
    this.setState({
      otherstarttime: orderStore.yesterdaydate,
      otherendtime: orderStore.yesterdaydate
    });
    orderStore.getquOrderInfo({
      //查询昨天的数据
      orderStatus: orderStore.statuscode,
      dateSign: orderStore.dateSign,
      startDate: orderStore.yesterdaydate, //开始时间
      endDate: orderStore.yesterdaydate //结束时间
    });
  };

  //历史记录
  historical = () => {
    let orderStore = this.props.orderStore;
    orderStore.setdateSign(4);
    orderStore.getquOrderInfo({
      //查询历史记录的数据
      orderStatus: orderStore.statuscode,
      dateSign: orderStore.dateSign,
      startDate: this.state.starttime, //开始时间
      endDate: this.state.endtime //结束时间
    });
  };

  //开始日期
  startcalendar = () => {
    this.setState({
      startcalendar: (
        <CalendarPopup
          changetime={new Date(this.state.starttime)}
          calendarModalCancel={() => {
            this.setState({ startcalendar: '' });
          }}
          calendarModalOk={newtime => {
            this.setState({ starttime: newtime });
            this.setState({ startcalendar: '' });
          }}
        />
      )
    });
  };

  //结束日期
  endcalendar = () => {
    this.setState({
      endcalendar: (
        <CalendarPopup
          changetime={new Date(this.state.endtime)}
          calendarModalCancel={() => {
            this.setState({ endcalendar: '' });
          }}
          calendarModalOk={newtime => {
            this.setState({ endtime: newtime });
            this.setState({ endcalendar: '' });
          }}
        />
      )
    });
  };

  //餐次文本框
  mealtime = e => {
    var value = e.target.value;
    this.setState({ mealtime: value });
  };

  //桌台文本框
  tabledishes = e => {
    var value = e.target.value;
    this.setState({ tabledishes: value });
  };

  //请输入订单号
  ordernumber = e => {
    var value = e.target.value;
    this.setState({ ordernumber: value });
  };

  //请输入收银员
  cashier = e => {
    var value = e.target.value;
    this.setState({ cashier: value });
  };

  //点击查询
  clickquery = () => {
    let orderStore = this.props.orderStore;
    if (orderStore.statuscode === 654 || orderStore.statuscode === 651) {
      orderStore.getquOrderInfo({
        orderStatus: orderStore.statuscode,
        mealName: this.state.mealtime, //餐次
        tableName: this.state.tabledishes, //桌台
        orderCode: this.state.ordernumber //订单号
      });
    } else if (orderStore.statuscode === 68 || orderStore.statuscode === 71) {
      let startDate; //开始时间
      let endDate; //结束时间
      if (
        orderStore.dateSign === 1 ||
        orderStore.dateSign === 2 ||
        orderStore.dateSign === 3
      ) {
        startDate = this.state.otherstarttime;
        endDate = this.state.otherendtime;
      } else if (orderStore.dateSign === 4) {
        startDate = this.state.starttime;
        endDate = this.state.endtime;
      }

      orderStore.getquOrderInfo({
        orderStatus: orderStore.statuscode,
        dateSign: orderStore.dateSign,
        mealName: this.state.mealtime, //餐次
        tableName: this.state.tabledishes, //桌台
        orderCode: this.state.ordernumber, //订单号
        cashierName: this.state.cashier, //收银员
        startDate: startDate, //开始时间
        endDate: endDate //结束时间
      });
    }
  };

  //数据选中点击事件
  clickorder = ({ ord, order }) => {
    let orderStore = this.props.orderStore;
    orderStore.checkedorderList(ord.onlysign); //是否选中
    orderStore.saveorderID(ord); //保存一些操作需要的id[结账的开发票需要带金额，，这个存值有点问题]
    orderStore.saveactualAmount = order.actualAmount;
    orderStore.oderAmount = order.oderAmount == null ? 0 : order.oderAmount;
  };

  //订单详情
  orderdetails = () => {
    let orderStore = this.props.orderStore;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      orderStore.getOrderInfo({ subOrderID: orderStore.subOrderID }); //获取订单详情的action
      this.setState({
        orderDetail: (
          <OrderDetailPopup
            closebutton={() => {
              this.setState({ orderDetail: '' });
            }}
          />
        )
      });
    }
  };

  checkOpenClass({ type }) {
    this.setState({
      statePopup: (
        <PromptPopup
          okText="去开班"
          cancelText="知道了"
          onOk={() => {
            this.setState({
              statePopup: (
                <OpenClassPopup
                  closeCancel={() => {
                    this.setState({ statePopup: '' });
                  }}
                  okCancel={() => {
                    this.setState({ statePopup: '' });
                  }}
                />
              )
            });
          }}
          onCancel={() => {
            this.setState({ statePopup: '' });
          }}
        >
          <div style={promptContStyle}>
            开班后才能{type === 'temporarily' ? '暂结' : '结账'}
          </div>
        </PromptPopup>
      )
    });
  }

  //调账
  accountAdjustment = () => {
    const { orderStore } = this.props;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      orderStore.setissign(); //设置跳转标志
      orderStore.checkOut().then(() => {
        this.setState({
          statePopup: (
            <SelectAdjustReasonPopup
              onClose={() => {
                this.setState({ statePopup: false });
              }}
              onOK={reason => {
                this.setState({ adjustReason: reason });
                const accreditObject = {
                  moduleCode: 'CheckoutModule',
                  privilegeCode: 'AccountAdjustment',
                  title: '调账',
                  toDoSomething: () => {
                    orderStore.adjustmentOrder(this.state.adjustReason);
                  },
                  closePopup: () => {
                    this.setState({ accreditPopup: false });
                  },
                  failed: () => {
                    this.setState({
                      accreditPopup: (
                        <AccreditPopup
                          module={{
                            title: accreditObject.title,
                            moduleCode: accreditObject.moduleCode,
                            privilegeCode: accreditObject.privilegeCode
                          }}
                          onOk={() => {
                            accreditObject.closePopup();
                            accreditObject.toDoSomething();
                          }}
                          onCancel={() => {
                            accreditObject.closePopup();
                          }}
                        />
                      )
                    });
                  }
                };
                checkPermission(accreditObject);
              }}
            />
          )
        });
      });
    }
  };

  //直接进入调账
  skipAdjustment = () => {
    const { orderStore } = this.props;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      orderStore.setissign(); //设置跳转标志
      orderStore.checkOut().then(() => {
        browserHistory.push(
          '/settlement/' + orderStore.tableID + '/' + orderStore.subOrderID
        ); //直接跳到结账界面
      });
    }
  };

  //开发票
  markmomey = () => {
    let orderStore = this.props.orderStore;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      if (orderStore.oderAmount === 0) {
        this.setState({
          invoicepopup: (
            <InvoicePopup
              closebutton={() => {
                this.setState({ invoicepopup: '' });
              }}
              okbutton={() => {
                this.setState({ invoicepopup: '' });
              }}
            />
          )
        });
      } else {
        message.destroy();
        message.warn('此订单已经开过发票了');
      }
    }
  };

  //重印暂结单
  reprintbilling = ({ isBill }) => {
    let orderStore = this.props.orderStore;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      orderStore.repeatPrintTempBilling({
        subOrderID: orderStore.subOrderID,
        isBill
      }); //调用重印暂结单的action
    }
  };

  //结账
  checkout = () => {
    let orderStore = this.props.orderStore;
    let appStore = this.props.appStore;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      appStore.validateSettlement({
        subOrderID: orderStore.subOrderID,
        success: () => {
          if (orderStore.subOrderID === '' || orderStore.subOrderID === null) {
            message.destroy();
            message.warn('订单id为空');
          } else {
            orderStore.setissign(); //设置跳转标志
            appStore.isInWorking({
              success: () => {
                browserHistory.push(
                  '/settlement/' +
                    orderStore.tableID +
                    '/' +
                    orderStore.subOrderID
                ); //跳转到结账页面
              }
            });
          }
        },
        checkOpenClass: this.checkOpenClass.bind(this, { type: 'settlement' }),
        failure: ({ feedback }) => {
          this.setState({ statePopup: <Prompt message={feedback} /> });
          feedback.cancelClick = () => {
            this.setState({ statePopup: '' });
          };
          feedback.okClick = () => {
            this.setState({ statePopup: '' });
          };
        }
      });
    }
  };

  //暂结
  temporarily = () => {
    let orderStore = this.props.orderStore;
    let appStore = this.props.appStore;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      appStore.validateSettlement({
        type: 'temporarily',
        subOrderID: orderStore.subOrderID,
        success: () => {
          if (orderStore.subOrderID === '' || orderStore.subOrderID === null) {
            message.destroy();
            message.warn('订单id为空');
          } else {
            orderStore.settemporarily({ subOrderID: orderStore.subOrderID }); //执行暂结的action
          }
        },
        checkOpenClass: this.checkOpenClass.bind(this, { type: 'temporarily' }),
        failure: ({ feedback }) => {
          this.setState({ statePopup: <Prompt message={feedback} /> });
          feedback.cancelClick = () => {
            this.setState({ statePopup: '' });
          };
          feedback.okClick = () => {
            this.setState({ statePopup: '' });
          };
        }
      });
    }
  };

  //取消暂结
  ontemporarily = () => {
    let orderStore = this.props.orderStore;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      //验证二次授权
      let _this = this;
      let object = {
        moduleCode: 'CheckoutModule',
        privilegeCode: 'CancellationOfSuspense',
        title: '取消暂结',
        toDoSomething: function() {
          orderStore.cancelTemporarily({ subOrderID: orderStore.subOrderID }); //执行取消暂结的action
        },
        closePopup: function() {
          _this.setState({ accreditPopup: '' });
        },
        failed: function() {
          _this.setState({
            accreditPopup: (
              <AccreditPopup
                module={{
                  title: object.title,
                  moduleCode: object.moduleCode,
                  privilegeCode: object.privilegeCode
                }}
                onOk={() => {
                  object.closePopup();
                  object.toDoSomething();
                }}
                onCancel={() => {
                  object.closePopup();
                }}
              />
            )
          });
        }
      };
      checkPermission(object);
    }
  };

  //更改消费
  changeconsumption = () => {
    let orderStore = this.props.orderStore;
    orderStore.tswhetherchecked(); //调用判断是否被选中的action
    if (orderStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      orderStore.setissign(); //设置跳转标志
      browserHistory.push(
        '/dishes/' + orderStore.tableID + '/' + orderStore.subOrderID + ''
      ); //跳转点菜页面
    }
  };

  render() {
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let lationOFSuspense = permissionList.includes(
      'CheckoutModule:lationOFSuspense'
    ); //暂结
    let CancellationOfSuspense = permissionList.includes(
      'CheckoutModule:CancellationOfSuspense'
    ); //取消暂结
    let Checkout = permissionList.includes('CheckoutModule:Checkout'); //结账
    let Drawabill = permissionList.includes('CheckoutModule:Drawabill'); //开发票
    let Reprint = permissionList.includes('Order:Reprint'); //重印暂结单  重印结账单
    let OrderModule = permissionList.includes('OrderModule:Order'); //更改消费

    let orderStore = this.props.orderStore;
    let ordermsgList = orderStore.ordermsgList;
    let feedback = orderStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        orderStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    return (
      <div id="content" className="clearfix">
        <Tabs className="order-left" tabPosition={this.state.tabPosition}>
          <TabPane tab="堂食订单" key="1">
            <div className="order-right">
              <div className="order-right-top">
                <button
                  className={orderStore.statuscode === 654 ? 'selected' : ''}
                  onClick={this.consumption}
                >
                  消费中
                </button>
                <button
                  className={orderStore.statuscode === 651 ? 'selected' : ''}
                  onClick={this.provisional}
                >
                  已暂结
                </button>
                <button
                  className={orderStore.statuscode === 68 ? 'selected' : ''}
                  onClick={this.checkedout}
                >
                  已结账
                </button>
                <button
                  className={orderStore.statuscode === 1430 ? 'selected' : ''}
                  onClick={this.adjustment}
                >
                  调账中
                </button>
                <button
                  className={orderStore.statuscode === 71 ? 'selected' : ''}
                  onClick={this.canceled}
                >
                  已取消
                </button>
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="请输入餐次"
                    onChange={this.mealtime}
                    value={this.state.mealtime}
                  />
                </div>
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="请输入桌台"
                    onChange={this.tabledishes}
                    value={this.state.tabledishes}
                  />
                </div>
                <div className="input-box search">
                  <input
                    type="text"
                    placeholder="请输入订单号查询"
                    onChange={this.ordernumber}
                    value={this.state.ordernumber}
                  />
                </div>
                <div className="search-box" onClick={this.clickquery}>
                  <i className="iconfont icon-order_btn_search" />
                  查询
                </div>
              </div>
              {(orderStore.statuscode === 71 ||
                orderStore.statuscode === 68) && ( //已结账  反结账 已取消
                <div className="order-newbutton">
                  <button
                    className={orderStore.dateSign === 1 ? 'selected' : ''}
                    onClick={this.current}
                  >
                    当前班次
                  </button>
                  <button
                    className={orderStore.dateSign === 2 ? 'selected' : ''}
                    onClick={this.today}
                  >
                    今天
                  </button>
                  <button
                    className={orderStore.dateSign === 3 ? 'selected' : ''}
                    onClick={this.yesterday}
                  >
                    昨天
                  </button>
                  <button
                    className={orderStore.dateSign === 4 ? 'selected' : ''}
                    onClick={this.historical}
                  >
                    历史记录
                  </button>
                  <div
                    className="input-calendar"
                    id={orderStore.dateSign === 4 ? 'normalbg' : 'cannotbg'}
                    onClick={orderStore.dateSign === 4 && this.startcalendar}
                  >
                    <p>{this.state.starttime}</p>
                    <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
                  </div>
                  <span className="span-text">到</span>
                  <div
                    className="input-calendar"
                    id={orderStore.dateSign === 4 ? 'normalbg2' : 'cannotbg2'}
                    onClick={orderStore.dateSign === 4 && this.endcalendar}
                  >
                    <p>{this.state.endtime}</p>
                    <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
                  </div>
                  <div className="input-box">
                    <input
                      type="text"
                      placeholder="请输入收银员"
                      onChange={this.cashier}
                      value={this.state.cashier}
                    />
                  </div>
                </div>
              )}

              <div className="order-consumption">
                {(orderStore.statuscode === 654 ||
                  orderStore.statuscode === 651) && ( //消费中  已暂结
                  <ul className="table-head">
                    <li>序号</li>
                    <li>订单号</li>
                    <li>订单金额</li>
                    <li>来源</li>
                    <li>餐次</li>
                    <li>桌台</li>
                    <li>人数</li>
                    <li>开台人</li>
                    <li>开单时间</li>
                  </ul>
                )}

                {(orderStore.statuscode === 68 ||
                  orderStore.statuscode === 1430) && ( //已结账 调账中
                  <ul className="table-checkout">
                    <li>序号</li>
                    <li>营业日期</li>
                    <li>订单号</li>
                    <li>订单金额</li>
                    <li>结账时间</li>
                    <li>收银员</li>
                    <li>开票金额</li>
                    <li>来源</li>
                    <li>餐次</li>
                    <li>桌台</li>
                    <li>人数</li>
                  </ul>
                )}

                {orderStore.statuscode === 71 && ( //已取消
                  <ul className="table-cancel">
                    <li>序号</li>
                    {false && <li>营业日期</li>}
                    <li>订单号</li>
                    <li>来源</li>
                    <li>取消时间</li>
                    <li>操作人</li>
                    <li>原因</li>
                    <li>餐次</li>
                    <li>桌台</li>
                    <li>人数</li>
                    <li>开台人</li>
                    <li>开单时间</li>
                  </ul>
                )}

                <ul className="table-body">
                  <Scrollbars>
                    {(orderStore.statuscode === 654 ||
                      orderStore.statuscode === 651) && //消费中  已暂结
                      ordermsgList.map((order, index) => {
                        return (
                          <div className="each-data" key={index}>
                            {(() => {
                              return order.subOrderDetails.map((ord, i) => {
                                if (i === 0) {
                                  return (
                                    <li
                                      key={i}
                                      onClick={this.clickorder.bind(this, {
                                        ord,
                                        order
                                      })}
                                      className={
                                        ord.selected === true
                                          ? 'click-data'
                                          : ''
                                      }
                                    >
                                      <span>{order.index + 1}</span>
                                      <span>{order.orderCode}</span>
                                      <span>{order.actualAmount} </span>
                                      <span>{order.orderChannelName}</span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.mealName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.tableName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.peopleNum}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.createName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.createTime}
                                      </span>
                                    </li>
                                  );
                                } else {
                                  return (
                                    <div
                                      onClick={this.clickorder.bind(this, {
                                        ord,
                                        order
                                      })}
                                      key={i}
                                      className={
                                        ord.selected === true
                                          ? 'son-child son-change'
                                          : 'son-child'
                                      }
                                    >
                                      <span> </span>
                                      <span> </span>
                                      <span> </span>
                                      <span />
                                      <span>{ord.mealName}</span>
                                      <span>{ord.tableName}</span>
                                      <span>{ord.peopleNum}</span>
                                      <span>{ord.createName}</span>
                                      <span>{ord.createTime}</span>
                                    </div>
                                  );
                                }
                              });
                            })()}
                          </div>
                        );
                      })}
                    {(orderStore.statuscode === 68 ||
                      orderStore.statuscode === 1430) && //已结账 调账中
                      ordermsgList.map((order, index) => {
                        return (
                          <div className="each-checkout" key={index}>
                            {(() => {
                              return order.subOrderDetails.map((ord, i) => {
                                if (i === 0) {
                                  return (
                                    <li
                                      key={i}
                                      onClick={this.clickorder.bind(this, {
                                        ord,
                                        order
                                      })}
                                      className={
                                        ord.selected === true
                                          ? 'click-data'
                                          : ''
                                      }
                                    >
                                      <span>{order.index + 1}</span>
                                      <span>{order.bizDate}</span>
                                      <span>{order.orderCode}</span>
                                      <span>{order.actualAmount} </span>
                                      <span>{order.accountTime}</span>
                                      <span>{order.cashier}</span>
                                      <span>
                                        {order.oderAmount == null
                                          ? 0
                                          : order.oderAmount}
                                      </span>
                                      <span>{order.orderChannelName}</span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.mealName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.tableName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.peopleNum}
                                      </span>
                                    </li>
                                  );
                                } else {
                                  return (
                                    <div
                                      onClick={this.clickorder.bind(this, {
                                        ord,
                                        order
                                      })}
                                      key={i}
                                      className={
                                        ord.selected === true
                                          ? 'son-child son-change'
                                          : 'son-child'
                                      }
                                    >
                                      <span> </span>
                                      <span> </span>
                                      <span> </span>
                                      <span />
                                      <span />
                                      <span />
                                      <span />
                                      <span />
                                      <span>{ord.mealName}</span>
                                      <span>{ord.tableName}</span>
                                      <span>{ord.peopleNum}</span>
                                    </div>
                                  );
                                }
                              });
                            })()}
                          </div>
                        );
                      })}
                    {orderStore.statuscode === 71 && //已取消
                      ordermsgList.map((order, index) => {
                        return (
                          <div className="each-cancel" key={index}>
                            {(() => {
                              return order.subOrderDetails.map((ord, i) => {
                                if (i === 0) {
                                  return (
                                    <li
                                      key={i}
                                      className={
                                        ord.selected === true
                                          ? 'click-data'
                                          : ''
                                      }
                                    >
                                      <span>{order.index + 1}</span>
                                      {false && <span>{order.bizDate}</span>}
                                      <span>{order.orderCode}</span>
                                      <span>{order.orderChannelName}</span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.cancelTime}{' '}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.operator}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.memo}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.mealName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.tableName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.peopleNum}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.createName}
                                      </span>
                                      <span
                                        className={
                                          order.subOrderDetails.length > 1 &&
                                          'specialspan'
                                        }
                                      >
                                        {ord.createTime}
                                      </span>
                                    </li>
                                  );
                                } else {
                                  return (
                                    <div
                                      key={i}
                                      className={
                                        ord.selected === true
                                          ? 'son-child son-change'
                                          : 'son-child'
                                      }
                                    >
                                      <span> </span>
                                      <span> </span>
                                      <span> </span>
                                      <span>{ord.cancelTime}</span>
                                      <span>{ord.operator}</span>
                                      <span>{ord.memo}</span>
                                      <span>{ord.mealName}</span>
                                      <span>{ord.tableName}</span>
                                      <span>{ord.peopleNum}</span>
                                      <span>{ord.createName}</span>
                                      <span>{ord.createTime}</span>
                                    </div>
                                  );
                                }
                              });
                            })()}
                          </div>
                        );
                      })}
                    {ordermsgList.length === 0 && (
                      <div className="empty-holder">暂无数据</div>
                    )}
                  </Scrollbars>
                </ul>
              </div>

              <div className="order-bottom-btn">
                {orderStore.statuscode === 654 && ( //消费中
                  <div>
                    {OrderModule && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={
                          ordermsgList.length > 0 && this.changeconsumption
                        }
                      >
                        更改消费
                      </button>
                    )}

                    {lationOFSuspense && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={ordermsgList.length > 0 && this.temporarily}
                      >
                        暂结
                      </button>
                    )}
                    {Checkout && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={ordermsgList.length > 0 && this.checkout}
                      >
                        结账
                      </button>
                    )}
                  </div>
                )}
                {orderStore.statuscode === 651 && ( //已暂结
                  <div>
                    {Checkout && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={ordermsgList.length > 0 && this.checkout}
                      >
                        结账
                      </button>
                    )}
                    {CancellationOfSuspense && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={ordermsgList.length > 0 && this.ontemporarily}
                      >
                        取消暂结
                      </button>
                    )}

                    {Reprint && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={ordermsgList.length > 0 && this.reprintbilling}
                      >
                        重印暂结单
                      </button>
                    )}
                  </div>
                )}
                {orderStore.statuscode === 68 && ( //已结账
                  <div>
                    <button
                      className={classnames({
                        disabled: ordermsgList.length === 0
                      })}
                      onClick={
                        ordermsgList.length > 0 && this.accountAdjustment
                      }
                    >
                      调账
                    </button>
                    {Reprint && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={() => {
                          if (ordermsgList.length > 0) {
                            this.reprintbilling({ isBill: true });
                          }
                        }}
                      >
                        重印结帐单
                      </button>
                    )}
                    {Drawabill && (
                      <button
                        className={classnames({
                          disabled: ordermsgList.length === 0
                        })}
                        onClick={ordermsgList.length > 0 && this.markmomey}
                      >
                        开发票
                      </button>
                    )}
                  </div>
                )}
                {orderStore.statuscode === 1430 && (
                  <button
                    className={classnames({
                      disabled: ordermsgList.length === 0
                    })}
                    onClick={ordermsgList.length > 0 && this.skipAdjustment}
                  >
                    调账
                  </button>
                )}

                {(orderStore.statuscode === 654 ||
                  orderStore.statuscode === 651 ||
                  orderStore.statuscode === 68) && ( //消费中 已暂结 已结账
                  <button
                    className={classnames({
                      disabled: ordermsgList.length === 0
                    })}
                    onClick={ordermsgList.length > 0 && this.orderdetails}
                  >
                    订单详情
                  </button>
                )}
                {Array(5)
                  .fill(0)
                  .map((item, index) => {
                    return <button key={index} />;
                  })}
                <a className="selected hide">上一页</a>
                <a className="hide">下一页</a>
              </div>
            </div>
          </TabPane>
          <TabPane tab="退订金记录" key="2">
            <div className="rest-right">
              <UnsubscribeRecord />
            </div>
          </TabPane>
        </Tabs>
        {this.state.orderDetail}
        {this.state.invoicepopup}
        {this.state.startcalendar}
        {this.state.endcalendar}
        {operatePrompt}
        {this.state.statePopup}
        {this.state.accreditPopup}
      </div>
    );
  }
}

export default Order;
