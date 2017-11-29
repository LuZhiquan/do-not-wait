/**
* @author William Cui
* @description 桌台界面
* @date 2017-03-27
**/

import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { Tabs, message } from 'antd';

import TableWindow from './TableWindow';
import Prompt from 'components/prompt-common';
import Scrollbars from 'react-custom-scrollbars';
import SelectMealPopup from './select-meal-popup';
import keyboard from 'components/keyboard';
import { getStrSize } from 'common/utils';

import 'assets/styles/index/ting_item.css';
import 'assets/styles/rblock/desk_info_container.css';
import 'assets/styles/rblock/desk_info_footer.css';
import 'components/scroll-tabs/dine_scroll_tabs.css';

const TabPane = Tabs.TabPane;

const iconSearch = {
  top: '3px',
  right: '23px',
  cursor: 'pointer',
  height: '30px',
  lineHeight: '30px',
  color: '#9b9b9b',
  fontSize: '16px'
};

function Table({ dineStore, table }) {
  let related =
    !dineStore.targetView &&
    dineStore.selectedTableList &&
    dineStore.selectedTableList.length &&
    dineStore.selectedTableList[0].orderID &&
    table.orderID &&
    (table.tableStatus === 827 ||
      table.tableStatus === 652 ||
      table.tableStatus === 728) &&
    dineStore.selectedTableList[0].combineNumber > 1 &&
    table.orderID === dineStore.selectedTableList[0].orderID;
  let tableName =
    table.shareTableName && table.tableName !== table.shareTableName
      ? table.tableName + '-' + table.shareTableName
      : table.tableName;
  return (
    <div
      className={classnames({
        'item-basic': true,
        'item-reserve': table.tableStatus === 606, //预订
        'item-not-order': table.tableStatus === 827, //未下单
        'item-has-order': table.tableStatus === 652, //已下单
        'item-zanjie': table.tableStatus === 728, //暂结
        'item-dirty': table.tableStatus === 609, //脏台
        'item-free': table.tableStatus === 607 || table.tableStatus === 777, //空闲
        'item-service': table.tableStatus === 610, //维修
        'item-selected': table.selected,
        'item-related': related,
        'item-pintai': table.shareNumber,
        'item-occupation': table.tableStatus === 777
      })}
      onClick={() => {
        if (table.tableStatus !== 777) {
          if (dineStore.multipleSelected && table.selected) {
            //多选状态下已选中桌台取消选择
            dineStore.delSelectedTable(table.tableID);
          } else {
            //换台数量不能大于占用数量
            if (dineStore.tableWindow === 'bookingExchangeTable') {
              if (
                dineStore.targetTableList.length >=
                dineStore.occupiedTableList.length
              ) {
                dineStore.showFeedback({ status: 'warn', msg: '换台数量不能大于占用数量' });
                return;
              }
            }

            if (!table.selected) {
              //根据桌台获取桌台信息
              dineStore.getSelectedTable({
                tableID: table.tableID,
                tableStatus: table.tableStatus,
                subOrderID: table.subOrderID,
                bookingID: table.bookingID
              });
            }
          }

          //原始桌台视图下,选择桌台将重置桌台窗口
          if (!dineStore.targetView) dineStore.changeTableWindow('base');
        } else {
          dineStore.showFeedback({ status: 'warn', msg: '该桌台被占用' });
        }
      }}
    >
      <div className="item-gou">
        <i className="iconfont icon-home_icon_selected" />
      </div>
      <div className="item-link">
        <i className="iconfont icon-home_icon_link" />
      </div>
      <div className="item-suo">
        <i className="iconfont icon-home_suo" />
      </div>
      <div className="item-content">
        <div
          className={classnames({
            'item-title': true,
            'item-title-small': getStrSize(tableName) > 11
          })}
        >
          {tableName}
        </div>
        <div className="item-number">
          {table.customerNumber || 0}/{table.defaultPerson}
          {table.areaType === 850 && <span className="item-bao">包</span>}
          {typeof table.combineName === 'string' &&
          table.combineName.replace(/\s+/, '').length ? (
            <span className="item-lian">{table.combineName}</span>
          ) : null}
        </div>
      </div>
      <div className="item-pins">
        {(() => {
          if (table.price) {
            return <div className="item-price">{'￥' + table.price}</div>;
          } else if (table.times) {
            return <div className="item-time">{table.times + '分'}</div>;
          }
        })()}
      </div>
    </div>
  );
}

function StatusButton({ dineStore, status }) {
  let buttonId, circleClass, statusName, circle;
  switch (status) {
    case '606':
      buttonId = 'btn_reverse';
      circleClass = 'reserveBg';
      statusName = '预订';
      break;
    case '827':
      buttonId = 'btn_not_order';
      circleClass = 'on_orderBg';
      statusName = '未下单';
      break;
    case '652':
      buttonId = 'btn_has_order';
      circleClass = 'orderBg';
      statusName = '已下单';
      break;
    case '728':
      buttonId = 'btn_zanjie';
      circleClass = 'pauseBg';
      statusName = '暂结';
      break;
    case '609':
      buttonId = 'btn_dirty';
      circleClass = 'dirtyBg';
      statusName = '脏台';
      break;
    case '607':
      buttonId = 'btn_free';
      circleClass = 'freeBg';
      statusName = '空闲';
      break;
    case '610':
      buttonId = 'btn_service';
      circleClass = 'maintainBg';
      statusName = '维修';
      break;
    default:
      buttonId = 'btn_all';
      statusName = '全部';
  }

  if (status.key !== 0) {
    circle = (
      <span
        className={classnames({
          btn_circle: true,
          [circleClass]: true
        })}
      />
    );
  }
  return (
    <li
      id={buttonId}
      className={classnames({
        'btn-active': status === dineStore.currentStatus
      })}
      onClick={() => {
        //刷新状态按钮
        let areaID = dineStore.currentAreaID;
        switch (dineStore.tableWindow) {
          case 'transferTable':
            dineStore.getFilterTables({
              type: 'canTransfer',
              areaID,
              status
            }); //获取可转桌台列表
            break;
          case 'combineTable':
            dineStore.getFilterTables({
              type: 'canCombine',
              areaID,
              status
            }); //获取可联桌台列表
            break;
          case 'cancelTable':
            dineStore.getFilterTables({
              type: 'canCancel',
              areaID,
              status
            }); //获取可消台桌台列表
            break;
          case 'splitTable':
            dineStore.getFilterTables({
              type: 'canSplit',
              areaID,
              status
            }); //获取可拆台桌台列表
            break;
          case 'addTable01':
            dineStore.getFilterTables({
              type: 'canAdd',
              areaID,
              status
            }); //获取可加桌台列表
            break;
          case 'bookingOpenTable':
            dineStore.getFilterTables({
              type: 'booking',
              areaID,
              status
            }); //获取某客户预订桌台列表
            break;
          case 'bookingExchangeTable':
            dineStore.getFilterTables({
              type: 'canExchange',
              areaID,
              status
            }); //获取可换桌台列表
            break;
          default:
            dineStore.getTableListByStatus({ status }); //根据状态获取桌台列表
        }
      }}
    >
      {circle}
      {statusName}(<span>{dineStore.statusList[status]}</span>)
    </li>
  );
}

@inject('appStore', 'dineStore')
@observer
class Dine extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      statePopup: false
    };

    let { dineStore, location } = props;
    let bookingID = location.state ? location.state.bookingID : '';
    dineStore.getAreaList({ bookingID }); //获取区域列表
  }

  //全选
  selectAllTables() {
    this.props.dineStore.selectAllTables();
  }

  componentDidUpdate() {
    let dineStore = this.props.dineStore;
    let feedback = dineStore.feedback;
    if (
      feedback &&
      feedback.status !== 'error' &&
      feedback.status !== 'validate'
    ) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, dineStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, dineStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, dineStore.closeFeedback());
      }
    }

    //滚动条滚动到选中桌台位置
    if (dineStore.autoScroll) {
      dineStore.disabledAutoScroll();
      var selectedIndex = -1;
      dineStore.tableList.forEach((table, index) => {
        if (table.selected) {
          selectedIndex = index;
          return;
        }
      });

      let tableContainer = document.getElementById('main_middle');
      let tableContent = document.getElementById('tableContainer');
      let selectedTable = tableContainer.getElementsByClassName('item-basic')[
        selectedIndex
      ];
      if (
        selectedIndex > -1 &&
        selectedTable.getBoundingClientRect().top >
          tableContainer.getBoundingClientRect().height
      ) {
        let scrollTop =
          selectedTable.getBoundingClientRect().top -
          tableContent.getBoundingClientRect().top -
          50;
        this.tableContainer.scrollTop(scrollTop);
      }
    }
  }

  componentWillUnmount() {
    let { dineStore } = this.props;
    sessionStorage.setItem(
      'selectedTableList',
      JSON.stringify(dineStore.selectedTableList)
    ); //保存已选桌台列表到sessionStorage
    dineStore.clearView(); //清空视图
    if (sessionStorage.getItem('dineStore')) dineStore.returnCache(); //如果有操作缓存，先恢复再离开
  }

  showKeyboard = e => {
    keyboard.show({
      target: e.target,
      onChange: this.onHandleSearchTable
    });
  };

  onHandleSearchTable = ele => {
    //搜索桌台
    const value = typeof ele === 'string' ? ele : ele.target.value;
    const { dineStore } = this.props;
    let type;

    if (dineStore.tableWindow === 'base') {
      dineStore.getTableListBySearchKey({
        searchKey: value
      }); //原视图搜索
    } else {
      switch (dineStore.tableWindow) {
        case 'transferTable':
          //可转桌台列表搜索
          type = 'canTransfer';
          break;
        case 'combineTable':
          //可联桌台列表搜索
          type = 'canCombine';
          break;
        case 'cancelTable':
          //可消桌台列表搜索
          type = 'canCancel';
          break;
        case 'splitTable':
          //可拆桌台列表搜索
          type = 'canSplit';
          break;
        case 'addTable01':
          //可加桌台列表搜索
          type = 'canAdd';
          break;
        case 'bookingOpenTable':
          //某客户预订桌台列表搜索
          type = 'booking';
          break;
        case 'bookingExchangeTable':
          type = 'canExchange';
          //可换桌台列表搜索
          break;
        default:
      }

      dineStore.getFilterTables({ type, searchKey: value });
    }
  };

  render() {
    let dineStore = this.props.dineStore;
    let feedback = dineStore.feedback;
    let operatePrompt, selectMealPopup;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        dineStore.closeFeedback();
        //刷新桌台视图
        dineStore.currentTableList.length && dineStore.refreshView();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    if (dineStore.mealList && dineStore.mealList.length)
      selectMealPopup = <SelectMealPopup />;

    let bookingID = this.props.location.state
      ? this.props.location.state.bookingID
      : '';

    let statusList = [
      '0',
      '607',
      '827',
      '652',
      '728',
      '606',
      '609',
      '610'
    ].filter(status => {
      return dineStore.statusList[status] > -1;
    });

    return (
      <div id="container">
        <div id="left_block">
          <div id="main_top">
            <div className="menuNav">
              <div id="menuWrap">
                <Tabs
                  activeKey={dineStore.currentAreaID}
                  onTabClick={areaID => {
                    //切换区域
                    let status = dineStore.currentStatus;
                    switch (dineStore.tableWindow) {
                      case 'transferTable':
                        dineStore.getFilterTables({
                          type: 'canTransfer',
                          areaID,
                          status
                        }); //可转桌台列表区域气候
                        break;
                      case 'combineTable':
                        dineStore.getFilterTables({
                          type: 'canCombine',
                          areaID,
                          status
                        }); //可联桌台列表搜索
                        break;
                      case 'cancelTable':
                        dineStore.getFilterTables({
                          type: 'canCancel',
                          areaID,
                          status
                        }); //可消桌台列表搜索
                        break;
                      case 'splitTable':
                        dineStore.getFilterTables({
                          type: 'canSplit',
                          areaID,
                          status
                        }); //可拆桌台列表搜索
                        break;
                      case 'addTable01':
                        dineStore.getFilterTables({
                          type: 'canAdd',
                          areaID,
                          status
                        }); //可加桌台列表搜索
                        break;
                      case 'bookingOpenTable':
                        let { location } = this.props;
                        let bookingID =
                          (dineStore.selectedTableList.length &&
                            dineStore.selectedTableList[0] &&
                            dineStore.selectedTableList[0].bookingID) ||
                          (location.state ? location.state.bookingID : null);

                        if (bookingID) {
                          dineStore.getFilterTables({
                            type: 'booking',
                            bookingID,
                            areaID,
                            status
                          }); //某客户预订桌台列表搜索
                        } else {
                          dineStore.showFeedback({
                            status: 'warn',
                            msg: '预订信息异常！'
                          });
                        }
                        break;
                      case 'bookingExchangeTable':
                        dineStore.getFilterTables({
                          type: 'canExchange',
                          areaID,
                          status
                        }); //可换桌台列表搜索
                        break;
                      default:
                        dineStore.getTableListByStatus({ areaID }); //原视图切换
                    }
                  }}
                >
                  {dineStore.areaList &&
                    !!dineStore.areaList.length &&
                    dineStore.areaList.map((area, index) => (
                      <TabPane tab={area.areaName} key={area.areaID} />
                    ))}
                </Tabs>
              </div>
            </div>
            <div id="search" className="pr">
              <input
                type="text"
                id="enterSearch"
                placeholder="搜索桌台"
                value={dineStore.searchKey}
                onFocus={this.showKeyboard}
                onChange={this.onHandleSearchTable}
              />
              <i
                className="iconfont icon-xinzenghuiyuan_icon_sousuo pa"
                style={iconSearch}
              />
            </div>
          </div>

          <div id="main_middle">
            <Scrollbars
              ref={tableContainer => {
                this.tableContainer = tableContainer;
              }}
            >
              {dineStore.tableList.length > 0 ? (
                <div id="tableContainer">
                  {dineStore.tableList
                    .concat(Array(10).fill(0))
                    .map((table, index) => {
                      return table ? (
                        <Table
                          dineStore={dineStore}
                          table={table}
                          key={index}
                        />
                      ) : (
                        <div key={index} className="item-basic" />
                      );
                    })}
                </div>
              ) : (
                <div className="empty-holder">暂无相关桌台</div>
              )}
            </Scrollbars>
          </div>
          <div id="main_bottom">
            <ul id="btn" className="clearfix">
              {statusList.length > 0 &&
                statusList.map((status, index) => {
                  return (
                    <StatusButton
                      key={index}
                      dineStore={dineStore}
                      status={status}
                    />
                  );
                })}
            </ul>
            <div id="leftBot_right">
              {false && (
                <p
                  id="allSelected"
                  className={dineStore.areAllTableSelected ? 'selected' : null}
                  onClick={this.selectAllTables.bind(this)}
                >
                  <i className="circle" />全选
                </p>
              )}
              {false && (
                <p id="join">
                  <i className="circle selected" />拼台
                </p>
              )}
            </div>
          </div>
        </div>
        <div id="right_block">
          <TableWindow bookingID={bookingID} />
          <div id="desk_info_footer">
            {false && (
              <div className="left-block">
                <span>当前班次统计：</span>
              </div>
            )}
            {false && (
              <div className="right-block">
                <div>
                  <span>就餐人数：256人</span>
                  <span className="tai-number">翻台率：45</span>
                </div>
                <div className="all-money">营业收入：1000</div>
              </div>
            )}
          </div>
        </div>
        {this.state.statePopup}
        {operatePrompt}
        {selectMealPopup}
      </div>
    );
  }
}

Dine.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Dine;
