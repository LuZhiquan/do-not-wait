/**
* @author William Cui
* @description 桌台信息窗
* @date 2017-03-30
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router';
import { Menu, Dropdown, Tabs } from 'antd';
import classnames from 'classnames';

import NumberKeyboard from './number-keyboard';
import Prompt from 'components/prompt-common';
import SelectWaiterPopup from 'components/select-waiter-popup';
import Scrollbars from 'react-custom-scrollbars';
import CancelTablePopup from './cancel-table-popup';
import TurnTablePopup from './change-desk-dishes-popup';
import CancelBookingPopup from './cancel-booking-reason-popup';
import { checkPermission } from 'common/utils'; //二次验权的JS封装包
import AccreditPopup from 'components/accredit-popup'; //二次验权的弹窗
import PromptPopup from 'components/prompt-popup';
import AddOrderPopup from 'components/order-dishes/add-order-validation-popup'; //下单不成功提示弹窗

const TabPane = Tabs.TabPane;

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

@inject('appStore', 'dineStore')
@observer
class TableWindow extends Component {
  constructor(props, context) {
    super(props, context);

    this.props.dineStore.changeTableWindow('base'); //设置为默认值'base'

    //获取权限
    let permissionList = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account')).permissionList
      : [];
    let permissionObj = {};
    permissionList.forEach(permission => {
      permissionObj[permission] = true;
    });

    this.state = {
      ...permissionObj,
      numberKeyBoard: false,
      statePopup: false,
      customerNumber: '',
      transferType: 1,
      orderKey: '0',
      accreditPopup: false,
      occpiedNumberPopup: 0
    };
  }

  showNumberKeyBoard = ({ index, tableID, value }) => {
    let { dineStore } = this.props;
    this.setState({
      numberKeyBoard: (
        <NumberKeyboard
          index={index}
          value={value}
          onEnter={customerNumber => {
            if (tableID) {
              dineStore.enterCustomerNumber(tableID, customerNumber);
            } else {
              this.setState({ customerNumber });
            }
          }}
          onClose={() => {
            this.closeNumberKeyBoard();
          }}
        />
      )
    });
  };

  closeNumberKeyBoard = () => {
    this.setState({ numberKeyBoard: false });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      orderKey: '0',
      customerNumber: '',
      transferType: 1
    });

    let { dineStore } = this.props;
    if (dineStore.tableWindow !== 'bookingOpenTable') {
      this.setState({ occpiedNumberPopup: 0 });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { dineStore } = this.props;

    if (
      dineStore.tableWindow === 'bookingOpenTable' &&
      this.state.occpiedNumberPopup === 0
    ) {
      let occpiedNumber = dineStore.tableList.filter(
        table => table.tableStatus !== 606
      ).length;
      if (occpiedNumber > 0) {
        this.setState({
          occpiedNumberPopup: (
            <PromptPopup
              onOk={() => {
                dineStore.bookingExchangeTableView();
                this.setState({ occpiedNumberPopup: false });
              }}
              onCancel={() => {
                this.setState({ occpiedNumberPopup: false });
              }}
            >
              <div style={promptContStyle}>
                您预订的桌台有{occpiedNumber}个还在占用中，需要换台吗？
              </div>
            </PromptPopup>
          )
        });
      }
    }
  }

  render() {
    let { dineStore, appStore, bookingID } = this.props;
    let selectDesk,
      relateDesk,
      targetDesk,
      orderDetail,
      operateWaiter,
      waveLine,
      buttons = [],
      operateButtons = [],
      moreButtons = [],
      operate,
      moreDropDown;

    orderDetail = (
      <div className="order_detail_pic">
        <div className="desk-pic">
          <div className="empty-holder">暂无订单信息</div>
        </div>
      </div>
    );

    if (
      dineStore.selectedTableList.length &&
      dineStore.selectedTableList[0] &&
      dineStore.selectedTableList[0].tableStatus
    ) {
      let isCombin = dineStore.selectedTableList[0].combineNumber > 1;
      let selectedTable = dineStore.selectedTableList[0];

      let detailTemp = (
        <div className="order_detail">
          <Tabs
            activeKey={this.state.orderKey}
            onChange={key => {
              this.setState({
                orderKey: key
              });
            }}
            tabBarStyle={{
              display: isCombin ? 'block' : 'none'
            }}
          >
            <TabPane tab="子订单" key="0">
              <div
                className={classnames({
                  'or-detail-content': true,
                  'or-no-tab': !isCombin
                })}
              >
                {isCombin && (
                  <div className="order-one-line">
                    <span className="order-title">桌台：</span>
                    <span className="order-id">{selectedTable.tableName}</span>
                  </div>
                )}
                {!isCombin && (
                  <div className="order-one-line">
                    <span className="order-title">{isCombin && '子'}订单号：</span>
                    <span className="order-id">{selectedTable.orderCode}</span>
                  </div>
                )}
                <div className="order-normal">
                  <span className="order-title">状态：</span>
                  {(subStatus => {
                    let status;
                    switch (subStatus) {
                      case 606:
                        status = '已预订';
                        break;
                      case 827:
                        status = '未下单';
                        break;
                      case 652:
                        status = '已下单';
                        break;
                      case 728:
                        status = '已暂结';
                        break;
                      default:
                        status = '未知';
                    }
                    return status;
                  })(selectedTable.subTableStatus)}
                </div>
                <div className="order-normal">
                  <span className="order-title">{isCombin && '子'}订单金额：</span>
                  {selectedTable.subTotalAmount}元
                </div>
                <div className="order-normal">
                  <span className="order-title">就餐人数：</span>
                  {selectedTable.subPeopleNum}
                </div>
                <div className="order-normal">
                  <span className="order-title">已上菜：</span>
                  {selectedTable.subServedNum}
                </div>
                <div className="order-normal">
                  <span className="order-title">未上菜：</span>
                  {selectedTable.subUnServedNum}
                </div>
                {selectedTable.subOrderDesc && (
                  <div className="order-remarks">
                    <div className="order-title">整单备注：</div>
                    <div className="remark-content">
                      {selectedTable.subOrderDesc}
                    </div>
                  </div>
                )}
              </div>
            </TabPane>
            {isCombin && (
              <TabPane tab="总订单" key="1">
                {
                  <div className="or-detail-content">
                    <div className="order-one-line">
                      <span className="order-title">桌台：</span>
                      <span className="order-id">
                        {selectedTable.tableName},
                        {selectedTable.combineTableInfoList &&
                          !!selectedTable.combineTableInfoList.length &&
                          selectedTable.combineTableInfoList
                            .map(table => {
                              return table.tableName;
                            })
                            .join(', ')}
                      </span>
                    </div>
                    <div className="order-one-line">
                      <span className="order-title">订单号：</span>
                      <span className="order-id">
                        {selectedTable.orderCode}
                      </span>
                    </div>
                    <div className="order-normal">
                      <span className="order-title">状态：</span>
                      {(tableStatus => {
                        let status;
                        switch (tableStatus) {
                          case 606:
                            status = '已预订';
                            break;
                          case 827:
                            status = '未下单';
                            break;
                          case 652:
                            status = '已下单';
                            break;
                          case 728:
                            status = '已暂结';
                            break;
                          default:
                            status = '未知';
                        }
                        return status;
                      })(selectedTable.tableStatus)}
                    </div>
                    <div className="order-normal">
                      <span className="order-title">订单总金额：</span>
                      {selectedTable.totalAmount}
                    </div>
                    <div className="order-normal">
                      <span className="order-title">就餐人数：</span>
                      {selectedTable.peopleNum}
                    </div>
                    <div className="order-normal">
                      <span className="order-title">已上菜：</span>
                      {selectedTable.servedNum}
                    </div>
                    <div className="order-normal">
                      <span className="order-title">未上菜：</span>
                      {selectedTable.unServedNum}
                    </div>
                  </div>
                }
              </TabPane>
            )}
          </Tabs>
        </div>
      );

      switch (dineStore.selectedTableList[0].subTableStatus) {
        case 607: //空闲
          if (this.state['TableOperation:Original']) {
            operateButtons.push({ text: '开台' });
          }
          if (this.state['TableOperation:Repair']) {
            operateButtons.push({ text: '维修' });
          }
          break;
        case 606: //预订
          if (this.state['TableOperation:Original']) {
            operateButtons.push({ text: '预订开台' });
          }
          operateButtons.push({ text: '取消预订' });
          orderDetail = (
            <div className="order_detail or-no-tab">
              <div className="or-detail-content">
                <div className="order-one-line">
                  <span className="order-title">预订单号：</span>
                  <span className="order-id">{selectedTable.orderCode}</span>
                </div>
                <div className="order-normal">
                  <span className="order-title">预订人：</span>
                  {selectedTable.contact}
                </div>
                <div className="order-one-line">
                  <span className="order-title">预订人电话：</span>
                  {selectedTable.phone}
                </div>
                <div className="order-normal">
                  <span className="order-title">状态：</span>
                  {(tableStatus => {
                    let status;
                    switch (tableStatus) {
                      case 606:
                        status = '已预订';
                        break;
                      case 827:
                        status = '未下单';
                        break;
                      case 652:
                        status = '已下单';
                        break;
                      default:
                        status = '已暂结';
                    }
                    return status;
                  })(selectedTable.tableStatus)}
                </div>
                <div className="order-one-line">
                  <span className="order-title">就餐人数：</span>
                  {selectedTable.peopleNum}
                </div>
                {false && (
                  <div className="order-normal">
                    <span className="order-title">就餐时间：</span>
                    {selectedTable.arrivalTime}
                  </div>
                )}
                <div className="order-normal">
                  <span className="order-title">预订方式：</span>
                  {(bookingType => {
                    let type;
                    switch (bookingType) {
                      case 614:
                        type = '点菜预订';
                        break;
                      case 615:
                        type = '留位预订';
                        break;
                      case 616:
                        type = '普通预订';
                        break;
                      default:
                    }
                    return type;
                  })(selectedTable.bookingType)}
                </div>
                <div className="order-one-line">
                  <span className="order-title">预订时间：</span>
                  {selectedTable.bookingTime}
                </div>
                <div className="order-normal">
                  <span className="order-title">预付金额：</span>
                  {selectedTable.bookingAmount}
                </div>
                {selectedTable.subOrderDesc && (
                  <div className="order-remarks">
                    <div className="order-title">备注：</div>
                    <div className="remark-content">
                      {selectedTable.subOrderDesc}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
          break;
        case 827: //未下单
          //是否可点菜
          if (this.state['OrderModule:Order']) {
            buttons.push({
              text: '点菜'
            });
          }

          //是否可转台
          if (this.state['TableOperation:ChangeTable']) {
            buttons.push({
              text: '转台'
            });
          }

          //是否可拼台
          if (
            this.state['TableOperation:Original'] &&
            dineStore.selectedTableList[0].canSharing
          ) {
            buttons.push({
              text: '拼台'
            });
          }

          //消台
          buttons.push({
            text: '消台'
          });

          //是否可加台
          if (this.state['TableOperation:AddTable']) {
            buttons.push({
              text: '加台'
            });
          }

          //是否可联台
          if (
            this.state['TableOperation:Joint'] &&
            dineStore.selectedTableList[0].canCombine
          ) {
            buttons.push({
              text: '联台'
            });
          }

          //是否可拆台
          if (
            this.state['TableOperation:Sabotage'] &&
            dineStore.selectedTableList[0].canSplit &&
            dineStore.relationTableList.length
          ) {
            buttons.push({
              text: '拆台'
            });
          }

          if (buttons.length > 4) {
            operateButtons = buttons.slice(0, 3);
            moreButtons = buttons.slice(3);
            operateButtons.push({
              text: '更多',
              weakened: true
            });
          } else {
            operateButtons = buttons;
          }

          orderDetail = detailTemp;
          break;
        case 652: //已下单
          //是否可加菜
          if (this.state['OrderModule:Order']) {
            buttons.push({
              text: '加菜'
            });
          }

          //是否可暂结
          if (this.state['CheckoutModule:lationOFSuspense']) {
            buttons.push({
              text: '暂结'
            });
          }

          //是否可以结账
          if (this.state['CheckoutModule:Checkout']) {
            buttons.push({
              text: '结账'
            });
          }

          //是否可转台
          if (this.state['TableOperation:ChangeTable']) {
            buttons.push({
              text: '转台'
            });
          }

          //是否可加台
          if (this.state['TableOperation:AddTable']) {
            buttons.push({
              text: '加台'
            });
          }

          //是否可拼台
          if (
            this.state['TableOperation:Original'] &&
            dineStore.selectedTableList[0].canSharing
          ) {
            buttons.push({
              text: '拼台'
            });
          }

          //是否可联台
          if (
            this.state['TableOperation:Joint'] &&
            dineStore.selectedTableList[0].canCombine
          ) {
            buttons.push({
              text: '联台'
            });
          }

          //是否可拆台
          if (
            this.state['TableOperation:Sabotage'] &&
            dineStore.selectedTableList[0].canSplit &&
            dineStore.relationTableList.length
          ) {
            buttons.push({
              text: '拆台'
            });
          }

          //是否可重印小票
          if (this.state['OtherModule:Reprintsmallticket']) {
            buttons.push({
              text: '重打小票'
            });
          }

          if (buttons.length > 4) {
            operateButtons = buttons.slice(0, 3);
            moreButtons = buttons.slice(3);
            operateButtons.push({
              text: '更多',
              weakened: true
            });
          } else {
            operateButtons = buttons;
          }

          orderDetail = detailTemp;
          break;
        case 728: //暂结
          operateButtons = [
            {
              text: '取消暂结'
            }
          ];

          //是否可以结账
          if (this.state['CheckoutModule:Checkout']) {
            operateButtons.push({
              text: '结账'
            });
          }
          orderDetail = detailTemp;
          break;
        case 609: //脏台
          if (this.state['TableOperation:Clear']) {
            operateButtons = [
              {
                text: '清台'
              }
            ];
          }
          break;
        case 610: //维修
          if (this.state['TableOperation:Recovery']) {
            operateButtons = [
              {
                text: '恢复'
              }
            ];
          }
          break;
        default:
      }

      let accreditObject;

      const operateHandle = function({ key }) {
        let subOrderID = dineStore.selectedTableList[0].subOrderID;
        switch (key) {
          case '开台':
            appStore.checkBeforeDailyWorking({
              success: () => {
                dineStore.changeTableWindow('openTable');
                dineStore.resetOperateWaiter(); //重置操作服务员
              }
            });
            break;
          case '预订开台':
            appStore.checkBeforeDailyWorking({
              success: () => {
                if (dineStore.selectedTableList[0].bookingID) {
                  dineStore.bookingOpenTableView({
                    bookingID: dineStore.selectedTableList[0].bookingID
                  });
                  dineStore.resetOperateWaiter(); //重置操作服务员
                } else {
                  dineStore.showFeedback({ status: 'warn', msg: '预订信息异常!' });
                }
              }
            });
            break;
          case '取消预订':
            accreditObject = {
              moduleCode: 'ReservationModule',
              privilegeCode: 'CancelReservation',
              title: '取消预订',
              toDoSomething: () => {
                this.setState({
                  statePopup: (
                    <CancelBookingPopup
                      handelClose={() => {
                        this.setState({ statePopup: false });
                      }}
                    />
                  )
                });
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
            break;
          case '点菜':
            if (
              dineStore.selectedTableList[0].tableID &&
              dineStore.selectedTableList[0].subOrderID
            ) {
              dineStore.saveCache();
              browserHistory.push(
                '/dishes/' +
                  dineStore.selectedTableList[0].tableID +
                  '/' +
                  dineStore.selectedTableList[0].subOrderID
              );
            } else {
              dineStore.showFeedback({ status: 'warn', msg: '桌台信息异常!' });
            }
            break;
          case '加菜':
            if (
              dineStore.selectedTableList[0].tableID &&
              dineStore.selectedTableList[0].subOrderID
            ) {
              dineStore.saveCache();
              browserHistory.push(
                '/dishes/' +
                  dineStore.selectedTableList[0].tableID +
                  '/' +
                  dineStore.selectedTableList[0].subOrderID
              );
            } else {
              dineStore.showFeedback({ status: 'warn', msg: '桌台信息异常!' });
            }
            break;
          case '转台':
            dineStore.transferTableView();
            break;
          case '拼台':
            appStore.checkBeforeDailyWorking({
              success: () => {
                dineStore.changeTableWindow('shareTable');
                dineStore.resetOperateWaiter(); //重置操作服务员
              }
            });
            break;
          case '消台':
            accreditObject = {
              moduleCode: 'TableOperation',
              privilegeCode: 'CancelTable',
              title: '消台',
              toDoSomething: () => {
                let length = 0; //统计关联桌台中未下单桌台数量
                if (
                  dineStore.relationTableList &&
                  dineStore.relationTableList.length
                ) {
                  length = dineStore.relationTableList.filter(table => {
                    return table.tableStatus === 827;
                  }).length;
                }

                if (length > 0) {
                  //切换到批量消台视图
                  dineStore.cancelTableView();
                } else {
                  //单个消台
                  this.setState({
                    statePopup: (
                      <CancelTablePopup
                        handleClose={() => {
                          this.setState({ statePopup: false });
                        }}
                      />
                    )
                  });
                }
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
            break;
          case '加台':
            appStore.checkBeforeDailyWorking({
              success: () => {
                dineStore.addTableView();
              }
            });
            break;
          case '联台':
            dineStore.combineTableView();
            break;
          case '拆台':
            dineStore.splitTableView({});
            break;
          case '暂结':
            appStore.validateSettlement({
              type: 'temporarily',
              subOrderID,
              success: () => {
                dineStore.currentTableList = []; //保存当前操作桌台
                dineStore.temporarily({ subOrderID }); //直接进行暂结操作
              },
              failure: ({ feedback }) => {
                feedback.cancelClick = () => {
                  this.setState({ statePopup: false });
                };
                feedback.okClick = () => {
                  this.setState({ statePopup: false });
                };
                this.setState({ statePopup: <Prompt message={feedback} /> });
              }
            });
            break;
          case '取消暂结':
            let _this = this;
            accreditObject = {
              moduleCode: 'CheckoutModule', //结账模块
              privilegeCode: 'CancellationOfSuspense',
              title: '取消暂结',
              toDoSomething: function() {
                dineStore.cancelTemporarily({ subOrderID });
              },
              closePopup: function() {
                _this.setState({ accreditPopup: false });
              },
              failed: function() {
                _this.setState({
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
            break;
          case '结账':
            appStore.isInWorking({
              success: () => {
                var tableID = dineStore.selectedTableList[0].tableID;
                appStore.validateSettlement({
                  type: 'settlement',
                  subOrderID,
                  success: () => {
                    dineStore.currentTableList = []; //保存当前操作桌台
                    dineStore.saveCache();
                    browserHistory.push(
                      '/settlement/' + tableID + '/' + subOrderID
                    ); //直接跳到结账界面
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
              }
            });
            break;
          case '清台':
            dineStore.clearTable(
              dineStore.selectedTableList.map(table => {
                return table.tableID;
              })
            );
            break;
          case '维修':
            dineStore.repairTable();
            break;
          case '恢复':
            dineStore.recoverTable();
            break;
          case '重打小票':
            browserHistory.push(
              '/small-ticket/' + dineStore.selectedTableList[0].subOrderID
            );
            break;
          default:
        }
      };

      operate = (
        <div className="desk_operate">
          {operateButtons.map((button, index) => {
            let className = button.weakened ? 'btn-normal' : 'btn-active';
            let buttonBlock;
            if (button.text === '更多') {
              moreDropDown = (
                <Menu onClick={operateHandle.bind(this)}>
                  {moreButtons.map((moreButton, index) => {
                    return (
                      <Menu.Item key={moreButton.text}>
                        {moreButton.text}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              );
              buttonBlock = (
                <Dropdown
                  key={index}
                  overlay={moreDropDown}
                  placement="topCenter"
                  trigger={['click']}
                >
                  <div className={className}>{button.text}</div>
                </Dropdown>
              );
            } else {
              buttonBlock = (
                <div
                  key={index}
                  className={className}
                  onClick={operateHandle.bind(this, { key: button.text })}
                >
                  {button.text}
                </div>
              );
            }
            return buttonBlock;
          })}
        </div>
      );

      if (dineStore.relationTableList.length) {
        relateDesk = (
          <div className="relateDesk">
            <h5>关联桌台</h5>
            {dineStore.relationTableList.map((table, index) => {
              return (
                <div key={index} className="has-select-content">
                  <span
                    className={classnames({
                      'has-select-point': true,
                      'point-reserve': table.tableStatus === 606, //预订
                      'point-not-order': table.tableStatus === 827, //未下单
                      'point-has-order': table.tableStatus === 652, //已下单
                      'point-zanjie': table.tableStatus === 728, //暂结
                      'point-dirty': table.tableStatus === 609, //脏台
                      'point-free': table.tableStatus === 607, //空闲
                      'point-service': table.tableStatus === 610 //维修
                    })}
                  />
                  <span className="has-select-number">
                    {table.shareTableName &&
                    table.tableName !== table.shareTableName
                      ? table.tableName + '-' + table.shareTableName
                      : table.tableName}
                    ({table.customerNumber ? table.customerNumber : 0}/{table.defaultPerson})
                  </span>
                  <span className="has-select-location">{table.areaName}</span>
                  <span className="has-select-name">{table.nickName}</span>
                </div>
              );
            })}
          </div>
        );
      }

      if (dineStore.selectedTableList.length) {
        selectDesk = (
          <div className="choose_desk">
            <Scrollbars>
              <div className="hasSelectDesk">
                <h5>{dineStore.targetView ? '原桌台' : '已选桌台'}</h5>
                {dineStore.selectedTableList.length &&
                  dineStore.selectedTableList.map((table, selectedIndex) => {
                    return (
                      <div key={selectedIndex} className="has-select-content">
                        <span
                          className={classnames({
                            'has-select-point': true,
                            'point-reserve': table.subTableStatus === 606, //预订
                            'point-not-order': table.subTableStatus === 827, //未下单
                            'point-has-order': table.subTableStatus === 652, //已下单
                            'point-zanjie': table.subTableStatus === 728, //暂结
                            'point-dirty': table.subTableStatus === 609, //脏台
                            'point-free': table.subTableStatus === 607, //空闲
                            'point-service': table.subTableStatus === 610 //维修
                          })}
                        />
                        <span className="has-select-number">
                          {table.shareTableName &&
                          table.tableName !== table.shareTableName
                            ? table.tableName + '-' + table.shareTableName
                            : table.tableName}
                          ({table.customerNumber ? table.customerNumber : 0}/{table.defaultPerson})
                        </span>
                        <span className="has-select-location">
                          {table.areaName}
                        </span>
                        <span className="has-select-name">
                          {table.nickName}
                        </span>
                      </div>
                    );
                  })}
              </div>
              {relateDesk}
            </Scrollbars>
          </div>
        );
      } else {
        selectDesk = <div className="empty-holder">请选择桌台</div>;
      }

      operateWaiter = (
        <div
          className="kt-person"
          onClick={() => {
            dineStore.getWaiterList();
            this.setState({
              statePopup: (
                <SelectWaiterPopup
                  okClick={waiter => {
                    this.setState({ statePopup: false });
                  }}
                  cancelClick={e => {
                    this.setState({ statePopup: false });
                  }}
                />
              )
            });
          }}
        >
          <div>服务员</div>
          <div className="person-name">
            {dineStore.operateWaiter.userName
              ? dineStore.operateWaiter.userName
              : JSON.parse(sessionStorage.getItem('account')).waiter &&
                JSON.parse(sessionStorage.getItem('account')).userName}
            <i className="iconfont icon-home_title_arrow_right" />
          </div>
          {this.state.statePopup}
        </div>
      );

      waveLine = <div className="wave-line" />;
    }

    if (dineStore.targetTableList.length) {
      targetDesk = (
        <div className="target-container">
          <Scrollbars>
            {dineStore.targetTableList.map((table, targetIndex) => {
              return (
                <div key={targetIndex} className="has-select-content">
                  <span
                    className={classnames({
                      'has-select-point': true,
                      'point-reserve': table.subTableStatus === 606, //预订
                      'point-not-order': table.subTableStatus === 827, //未下单
                      'point-has-order': table.subTableStatus === 652, //已下单
                      'point-zanjie': table.subTableStatus === 728, //暂结
                      'point-dirty': table.subTableStatus === 609, //脏台
                      'point-free': table.subTableStatus === 607, //空闲
                      'point-service': table.subTableStatus === 610 //维修
                    })}
                  />
                  <span className="has-select-number">
                    {table.shareTableName &&
                    table.tableName !== table.shareTableName
                      ? table.tableName + '-' + table.shareTableName
                      : table.tableName}
                    ({table.customerNumber ? table.customerNumber : 0}/{table.defaultPerson})
                  </span>
                  <span className="has-select-location">{table.areaName}</span>
                  <span className="has-select-name">{table.nickName}</span>
                </div>
              );
            })}
          </Scrollbars>
        </div>
      );
    } else {
      targetDesk = <div className="empty-holder">请选择目标桌台</div>;
    }

    return (
      <div>
        {(() => {
          if (dineStore.selectedTableList.length) {
            if (dineStore.tableWindow === 'openTable') {
              //开台操作窗口
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">开台</h4>
                  <div className="kai-input-block">
                    <Scrollbars>
                      {dineStore.selectedTableList.map((table, index) => {
                        let value = table.customerNumber
                          ? table.customerNumber
                          : '';
                        let tableID = table.tableID;
                        return (
                          <div key={index} className="kt-input-num">
                            <div className="kt-name">{table.tableName}</div>
                            <div className="kt-number">
                              <span>就餐人数</span>
                              <input
                                type="text"
                                value={value}
                                onFocus={() => {
                                  this.showNumberKeyBoard({
                                    index,
                                    tableID,
                                    value
                                  });
                                }}
                                autoFocus={index === 0}
                                readOnly
                              />
                            </div>
                          </div>
                        );
                      })}
                      {operateWaiter}
                    </Scrollbars>
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.changeTableWindow('base');
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        dineStore.openTable({
                          validation: () => {
                            dineStore.showFeedback({
                              status: 'warn',
                              msg: '就餐人数不能为空！'
                            });
                          }
                        });
                      }}
                    >
                      仅开台
                    </div>
                    {this.state['OrderModule:Order'] && (
                      <div
                        className="btn-active"
                        onClick={() => {
                          dineStore.openTable({
                            validation: () => {
                              dineStore.showFeedback({
                                status: 'warn',
                                msg: '就餐人数不能为空！'
                              });
                            },
                            complete: ({ tableID, subOrderID }) => {
                              browserHistory.push(
                                '/dishes/' + tableID + '/' + subOrderID
                              );
                            }
                          });
                        }}
                      >
                        点菜
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (dineStore.tableWindow === 'bookingOpenTable') {
              //预订开台操作窗口
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">预订开台</h4>
                  <div className="kai-input-block">
                    <Scrollbars>
                      {dineStore.targetTableList.map((table, index) => {
                        let value = table.customerNumber
                          ? table.customerNumber
                          : '';
                        let tableID = table.tableID;
                        return (
                          <div key={index} className="kt-input-num">
                            <div className="kt-name">{table.tableName}</div>
                            <div className="kt-number">
                              <span>就餐人数</span>
                              <input
                                type="text"
                                value={value}
                                onFocus={() => {
                                  this.showNumberKeyBoard({
                                    index,
                                    tableID,
                                    value
                                  });
                                }}
                                autoFocus={index === 0}
                                readOnly
                              />
                            </div>
                          </div>
                        );
                      })}
                      {dineStore.targetTableList.length > 0 && operateWaiter}
                    </Scrollbars>
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        if (bookingID) {
                          browserHistory.goBack();
                        } else {
                          dineStore.refreshView();
                        }
                      }}
                    >
                      取消
                    </div>
                    {!!dineStore.tableList.filter(table => {
                      return table.tableStatus !== 606;
                    }).length && (
                      <div
                        className="btn-active"
                        onClick={() => {
                          dineStore.bookingExchangeTableView();
                        }}
                      >
                        换台
                      </div>
                    )}
                    <div
                      className="btn-active"
                      onClick={() => {
                        if (
                          dineStore.targetTableList.length &&
                          dineStore.targetTableList[0].bookingID
                        ) {
                          dineStore.bookingOpenTable({
                            validation: () => {
                              dineStore.showFeedback({
                                status: 'warn',
                                msg: '就餐人数不能为空！'
                              });
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
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '没有可开台的桌台！'
                          });
                        }
                      }}
                    >
                      仅开台
                    </div>
                    {this.state['OrderModule:Order'] && (
                      <div
                        className="btn-active"
                        onClick={() => {
                          if (
                            dineStore.targetTableList.length &&
                            dineStore.targetTableList[0].bookingID
                          ) {
                            dineStore.bookingOpenTable({
                              validation: () => {
                                dineStore.showFeedback({
                                  status: 'warn',
                                  msg: '就餐人数不能为空！'
                                });
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
                              },
                              complete: ({ tableID, subOrderID }) => {
                                browserHistory.push(
                                  '/dishes/' + tableID + '/' + subOrderID
                                );
                              }
                            });
                          } else {
                            dineStore.showFeedback({
                              status: 'warn',
                              msg: '没有可开台的桌台！'
                            });
                          }
                        }}
                      >
                        点菜
                      </div>
                    )}
                  </div>
                  {this.state.occpiedNumberPopup
                    ? this.state.occpiedNumberPopup
                    : null}
                </div>
              );
            }

            if (dineStore.tableWindow === 'bookingExchangeTable') {
              //预订换台操作窗口
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">预订换台</h4>
                  <div className="choose_desk">
                    <Scrollbars>
                      <div className="hasSelectDesk">
                        <h5>被占用桌台</h5>
                        {(() => {
                          return dineStore.occupiedTableList.map(
                            (table, index) => {
                              return (
                                <div key={index} className="has-select-content">
                                  <span
                                    className={classnames({
                                      'has-select-point': true,
                                      'point-reserve':
                                        table.tableStatus === 606, //预订
                                      'point-not-order':
                                        table.tableStatus === 827, //未下单
                                      'point-has-order':
                                        table.tableStatus === 652, //已下单
                                      'point-zanjie': table.tableStatus === 728, //暂结
                                      'point-dirty': table.tableStatus === 609, //脏台
                                      'point-free': table.tableStatus === 607, //空闲
                                      'point-service': table.tableStatus === 610 //维修
                                    })}
                                  />
                                  <span className="has-select-number">
                                    {table.shareTableName &&
                                    table.tableName !== table.shareTableName
                                      ? table.tableName +
                                        '-' +
                                        table.shareTableName
                                      : table.tableName}
                                    ({table.customerNumber
                                      ? table.customerNumber
                                      : 0}/{table.defaultPerson})
                                  </span>
                                  <span className="has-select-location">
                                    {table.areaName}
                                  </span>
                                  <span className="has-select-name">
                                    {table.nickName}
                                  </span>
                                </div>
                              );
                            }
                          );
                        })()}
                      </div>
                    </Scrollbars>
                  </div>
                  <div className="targetDesk">
                    <h5>目标桌台</h5>
                    {targetDesk}
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.returnCache();
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        if (dineStore.targetTableList.length === 0) {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '请选择桌台'
                          });
                          return;
                        }

                        dineStore.turnTableProductList({
                          bookingID: dineStore.occupiedTableList[0].bookingID,
                          tableIDs: dineStore.occupiedTableList.map(table => {
                            return table.tableID;
                          }),
                          handleTurnTable: function() {
                            this.setState({
                              statePopup: (
                                <TurnTablePopup
                                  closeHandle={() => {
                                    this.setState({ statePopup: false });
                                  }}
                                />
                              )
                            });
                          }.bind(this)
                        });
                      }}
                    >
                      确定
                    </div>
                    {this.state.statePopup}
                  </div>
                </div>
              );
            }

            if (dineStore.tableWindow === 'cancelTable') {
              //批量消台窗口
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">消台</h4>
                  {selectDesk}
                  <div className="targetDesk">
                    <h5>目标桌台</h5>
                    {targetDesk}
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.returnCache();
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        if (dineStore.targetTableList.length > 0) {
                          this.setState({
                            statePopup: (
                              <CancelTablePopup
                                handleClose={() => {
                                  this.setState({ statePopup: false });
                                }}
                              />
                            )
                          });
                        } else {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '请选择目标桌台'
                          });
                        }
                      }}
                    >
                      确定
                    </div>
                  </div>
                  {this.state.statePopup}
                </div>
              );
            }

            if (dineStore.tableWindow === 'addTable01') {
              //加台窗口一
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">加台</h4>
                  {selectDesk}
                  <div className="targetDesk">
                    <h5>目标桌台</h5>
                    {targetDesk}
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.returnCache();
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        if (dineStore.targetTableList.length) {
                          dineStore.changeTableWindow('addTable02');
                          //重置操作服务员
                          dineStore.resetOperateWaiter();
                        } else {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '请选择目标桌台!'
                          });
                        }
                      }}
                    >
                      确定
                    </div>
                  </div>
                </div>
              );
            }

            if (dineStore.tableWindow === 'addTable02') {
              //加台窗口二
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">加台</h4>
                  <div className="kai-input-block">
                    <Scrollbars>
                      <h4 className="kai-input-title">开台人数</h4>
                      {dineStore.targetTableList.map((table, index) => {
                        let value = table.customerNumber
                          ? table.customerNumber
                          : '';
                        let tableID = table.tableID;
                        return (
                          <div key={index} className="kt-input-num">
                            <div className="kt-name">{table.tableName}</div>
                            <div className="kt-number">
                              <span>就餐人数</span>
                              <input
                                type="text"
                                value={value}
                                onFocus={() => {
                                  this.showNumberKeyBoard({
                                    index,
                                    tableID,
                                    value
                                  });
                                }}
                                autoFocus={index === 0}
                                readOnly
                              />
                            </div>
                          </div>
                        );
                      })}
                      {operateWaiter}
                    </Scrollbars>
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.changeTableWindow('addTable01');
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        dineStore.addTable({
                          validation: () => {
                            dineStore.showFeedback({
                              status: 'warn',
                              msg: '就餐人数不能为空！'
                            });
                          }
                        });
                      }}
                    >
                      仅开台
                    </div>
                    {this.state['OrderModule:Order'] && (
                      <div
                        className="btn-active"
                        onClick={() => {
                          dineStore.addTable({
                            validation: () => {
                              dineStore.showFeedback({
                                status: 'warn',
                                msg: '就餐人数不能为空！'
                              });
                            },
                            complete: ({ tableID, subOrderID }) => {
                              browserHistory.push(
                                '/dishes/' + tableID + '/' + subOrderID
                              );
                            }
                          });
                        }}
                      >
                        点菜
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (dineStore.tableWindow === 'transferTable') {
              //转台窗口
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">转台</h4>
                  {selectDesk}
                  <div className="targetDesk">
                    <h5>目标桌台</h5>
                    {targetDesk}
                    {(() => {
                      if (
                        dineStore.targetTableList.length &&
                        dineStore.targetTableList[0].tableStatus !== 607
                      ) {
                        let targetTable = dineStore.targetTableList[0];
                        let tableName =
                          targetTable.shareTableName &&
                          targetTable.tableName !== targetTable.shareTableName
                            ? targetTable.tableName +
                              '-' +
                              targetTable.shareTableName
                            : targetTable.tableName;
                        return (
                          <div>
                            <div className="select-type">请选择转台方式</div>
                            <div
                              className="tai-style"
                              onClick={() => {
                                this.setState({ transferType: 3 });
                              }}
                            >
                              <h5>合台</h5>
                              <p>与{tableName}桌合并，一起结账</p>
                              <span
                                className={classnames({
                                  'has-select-dui': true,
                                  'dui-active': this.state.transferType === 3
                                })}
                              >
                                <i className="iconfont icon-kaitairen_icon_sel-" />
                              </span>
                            </div>

                            <div
                              className="tai-style"
                              onClick={() => {
                                this.setState({ transferType: 2 });
                              }}
                            >
                              <h5>拼台</h5>
                              <p>与{tableName}桌拼台，单独结账</p>
                              <span
                                className={classnames({
                                  'has-select-dui': true,
                                  'dui-active': this.state.transferType === 2
                                })}
                              >
                                <i className="iconfont icon-kaitairen_icon_sel-" />
                              </span>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.returnCache();
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        if (!dineStore.targetTableList.length) {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '请选择目标桌台！'
                          });
                          return;
                        }
                        if (
                          dineStore.targetTableList[0].tableStatus !== 607 &&
                          this.state.transferType === 1
                        ) {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '请选择转台方式！'
                          });
                          return;
                        }
                        let transferTableData = {
                          tableID: dineStore.selectedTableList[0].tableID,
                          subOrderID: dineStore.selectedTableList[0].subOrderID,
                          targetTableID: dineStore.targetTableList[0].tableID,
                          targetSubOrderID:
                            dineStore.targetTableList[0].subOrderID,
                          transferType: this.state.transferType
                        };
                        dineStore.transferTable(transferTableData);
                      }}
                    >
                      确定
                    </div>
                  </div>
                </div>
              );
            }

            if (dineStore.tableWindow === 'combineTable') {
              //联台窗口
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">联台</h4>
                  {selectDesk}
                  <div className="targetDesk">
                    <h5>目标桌台</h5>
                    {targetDesk}
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.returnCache();
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        if (dineStore.targetTableList.length) {
                          let targetTableIDs = [];
                          dineStore.targetTableList.forEach(table => {
                            targetTableIDs.push(table.tableID);
                          });
                          let combineTableData = {
                            tableID: dineStore.selectedTableList[0].tableID,
                            targetTableIDs: targetTableIDs
                          };
                          dineStore.combineTable(combineTableData);
                        } else {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '请选择目标桌台！'
                          });
                        }
                      }}
                    >
                      确定
                    </div>
                  </div>
                </div>
              );
            }

            if (dineStore.tableWindow === 'splitTable') {
              //拆台窗口
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">拆台</h4>
                  {selectDesk}
                  <div className="targetDesk">
                    <h5>目标桌台</h5>
                    {false && (
                      <div className="target-danger">
                        <span className="point-danger">!</span>下方已经列出全部与{dineStore.selectedTableList[0].tableName}相关桌台
                      </div>
                    )}
                    {targetDesk}
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.returnCache();
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        if (dineStore.targetTableList.length > 0) {
                          dineStore.splitTable();
                        } else {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '请选择目标桌台'
                          });
                        }
                      }}
                    >
                      确定
                    </div>
                  </div>
                </div>
              );
            }
            if (dineStore.tableWindow === 'shareTable') {
              //拼台窗口
              let value = this.state.customerNumber
                ? this.state.customerNumber
                : '';
              return (
                <div id="desk_info_container">
                  <h4 id="desk_info_header">拼台</h4>
                  {selectDesk}
                  <div className="kai-input-block">
                    <div className="kt-input-num">
                      <div className="kt-name">
                        {dineStore.selectedTableList[0].tableName}
                      </div>
                      <div className="kt-number">
                        <span>就餐人数</span>
                        <input
                          type="text"
                          value={value}
                          onFocus={() => {
                            this.showNumberKeyBoard({ index: 0, value });
                          }}
                          autoFocus
                          readOnly
                        />
                      </div>
                    </div>
                    {false && operateWaiter}
                  </div>
                  {waveLine}
                  <div className="desk_operate">
                    <div
                      className="btn-normal"
                      onClick={() => {
                        dineStore.changeTableWindow('base');
                      }}
                    >
                      取消
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        dineStore.shareTable({
                          customerNumber: this.state.customerNumber,
                          validation: () => {
                            dineStore.showFeedback({
                              status: 'warn',
                              msg: '就餐人数不能为空！'
                            });
                          }
                        });
                      }}
                    >
                      拼台
                    </div>
                    {this.state['OrderModule:Order'] && (
                      <div
                        className="btn-active"
                        onClick={() => {
                          dineStore.shareTable({
                            customerNumber: this.state.customerNumber,
                            validation: () => {
                              dineStore.showFeedback({
                                status: 'warn',
                                msg: '就餐人数不能为空！'
                              });
                            },
                            complete: ({ tableID, subOrderID }) => {
                              browserHistory.push(
                                '/dishes/' + tableID + '/' + subOrderID
                              );
                            }
                          });
                        }}
                      >
                        点菜
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            //基础窗口
            return (
              <div id="desk_info_container">
                <h4 id="desk_info_header">桌台信息</h4>
                {selectDesk}
                {orderDetail}
                {waveLine}
                {operate}
                {this.state.statePopup}
                {this.state.accreditPopup}
              </div>
            );
          } else {
            //空白窗口
            return (
              <div id="desk_info_container">
                <h4 id="desk_info_header">桌台信息</h4>
                <div className="no_message_box">
                  <div className="desk-pic">
                    <div className="empty-holder">请选择需要操作的桌台</div>
                  </div>
                </div>
              </div>
            );
          }
        })()}
        {this.state.numberKeyBoard ? this.state.numberKeyBoard : null}
      </div>
    );
  }
}

export default TableWindow;
