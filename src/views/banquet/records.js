/**
* @author William Cui
* @description 宴会预定记录界面
* @date 2017-06-27
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import { browserHistory } from 'react-router'; //路径跳转
import CalendarPopup from 'components/calendar-popup'; //日历弹出层
import { Menu, Dropdown, Icon, message } from 'antd';
import Open from './banquet-open-popup'; //宴会开台
import OrderDetailsPopup from './order-details-popup';
import BanquetHistoryPopup from './banquet-history-popup';
import CancelBanquetPopup from './cancel-banquet-popup';
import { checkPermission } from 'common/utils';
import Accredit from 'components/accredit-popup'; //二次授权

import './record.less';

message.config({
  top: 300
});

// 宴会预订列表组件
function BanquetList({ banquetListStore, banquet, handleClick }) {
  let needcolor;
  let needsize;
  switch (banquet.bookingStatus) {
    case 1250: //待收订金
      needcolor = 'yellow';
      break;
    case 1251: //已收订金
      needcolor = 'blue';
      break;
    case 1254: //已开台
      needcolor = 'purple';
      break;
    case 1253: //已结账
      needcolor = 'green';
      break;
    case 1252: //已取消
      needcolor = 'gray';
      break;
    default:
  }
  let openTime = banquet.openTime.split(' ')[1].slice(0, 5);
  return (
    <div
      onClick={handleClick}
      className={
        banquet.selected === true ? 'each-data  mask select' : 'each-data'
      }
    >
      {banquet.selected === true && (
        <i className="iconfont icon-home_icon_selected" />
      )}
      <div className="data-top">
        <p>
          <b>{banquet.index + 1}</b>
        </p>
        <p>
          <span>
            <em>客户名称</em>
            {banquet.customerName}
          </span>
          <span>
            <em>宴会时间</em>
            {banquet.bookingTime}
          </span>
        </p>
        <p>
          <span>
            <em>电话号码</em>
            {banquet.phone}
          </span>
          <span>
            <em>开席时间</em>
            {openTime}
          </span>
        </p>
        <p>
          <span>
            <em>宴会名称</em>
            {banquet.partyName}
          </span>
          <span>
            <em>订单总额</em>
            {(banquet.banqTotalAmount * 1).toFixed(2) * 1}
          </span>
        </p>
        <p>
          <span>
            <em>预订桌数</em>
            {banquet.tableNum}
          </span>
          <span>
            <em>已收订金</em>
            {(banquet.bookingAmount * 1).toFixed(2) * 1}
          </span>
        </p>
        <p>
          <i className={needcolor}>
            <span className={needsize}>{banquet.bookingStatusName}</span>{' '}
          </i>
        </p>
      </div>
      <div className="data-instructions">
        <span>预订说明</span>
        <p>{banquet.memo}</p>
      </div>
    </div>
  );
}

@inject('banquetCreateStore', 'banquetListStore', 'appStore')
@observer
class Record extends Component {
  constructor(props, context, handleClick) {
    super(props, context);
    this.state = {
      calendarpopup: '', //日历层
      starttime: this.props.banquetListStore.datetime, //开始时间
      endtime: this.props.banquetListStore.datetime, //结束时间
      operatePrompt: '', //提示框
      banquetOpen: '', //宴会开台弹窗
      orderdetails: '', //订单详情
      banquethistory: '', //修改历史
      cancelBanquet: '', //取消弹窗
      queryType: '1', //时间类型
      typetimeName: '宴会时间', //类型名称
      bookingStatus: '', //状态类型
      stateName: '全部', //状态名称
      accreditPopup: '', //授权弹窗
      searchValue: '' //搜索内容
    };
    this.props.banquetListStore.bookingStatus = 0;
  }

  componentDidMount() {
    let banquetListStore = this.props.banquetListStore;
    banquetListStore.setthisclick(2);

    //执行查询
    banquetListStore.queryBanquetOrderList({
      queryType: this.state.queryType,
      startTime: this.state.starttime,
      endTime: this.state.endtime,
      bookingStatus: this.state.bookingStatus
    });
  }

  componentDidUpdate() {
    let feedback = this.banquetListStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, this.banquetListStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, this.banquetListStore.closeFeedback());
          break;
        case 'error':
          message.warn(feedback.msg, this.banquetListStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, this.banquetListStore.closeFeedback());
      }
    }
  }

  banquetListStore = this.props.banquetListStore;

  //开始时间
  startdate = () => {
    this.setState({
      calendarpopup: (
        <CalendarPopup
          changetime={new Date(this.state.starttime)}
          calendarModalCancel={() => {
            this.setState({ calendarpopup: '' });
          }}
          calendarModalOk={newtime => {
            this.queryselect({ startTime: newtime });
            this.setState({ starttime: newtime });
            this.setState({ calendarpopup: '' });
          }}
        />
      )
    });
  };

  //结束时间
  enddate = () => {
    this.setState({
      calendarpopup: (
        <CalendarPopup
          changetime={new Date(this.state.endtime)}
          calendarModalCancel={() => {
            this.setState({ calendarpopup: '' });
          }}
          calendarModalOk={newtime => {
            this.queryselect({ endTime: newtime });
            this.setState({ endtime: newtime });
            this.setState({ calendarpopup: '' });
          }}
        />
      )
    });
  };

  //新建预订
  newreservation = () => {
    browserHistory.push({
      pathname: '/banquet/create',
      state: {}
    });
  };

  //订单详情
  orderdetail = () => {
    this.banquetListStore.whetherchecked(); //调用判断是否被选中的action
    if (this.banquetListStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      this.banquetListStore.DeatilAction({
        bookingID: this.banquetListStore.bookingID
      });

      this.setState({
        orderdetails: (
          <OrderDetailsPopup
            closepopup={() => {
              this.setState({ orderdetails: '' });
            }}
            okpopup={() => {
              this.setState({ orderdetails: '' });
            }}
          />
        )
      });
    }
  };

  //收订金
  deposit = () => {
    let appStore = this.props.appStore;
    appStore.isInWorking({
      success: () => {
        this.banquetListStore.toPayBookingAmount({
          bookingID: this.banquetListStore.bookingID
        });
        this.props.banquetCreateStore.getPaymentMethod();
        browserHistory.push('/banquet/beposit');
      }
    });
  };

  //修改历史
  updatehistory = () => {
    this.banquetListStore.whetherchecked(); //调用判断是否被选中的action
    if (this.banquetListStore.flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      this.banquetListStore.editHistory({
        bookingID: this.banquetListStore.bookingID
      });
      this.setState({
        banquethistory: (
          <BanquetHistoryPopup
            closepopup={() => {
              this.setState({ banquethistory: '' });
            }}
            okpopup={() => {
              this.setState({ banquethistory: '' });
            }}
          />
        )
      });
    }
  };

  //点击查询
  queryselect = ({
    queryType = this.state.queryType,
    startTime = this.state.starttime,
    endTime = this.state.endtime,
    bookingStatus = this.state.bookingStatus,
    queryContext = this.state.searchValue
  }) => {
    //  console.log(queryType,startTime,endTime,bookingStatus,queryContext);
    this.props.banquetListStore.queryBanquetOrderList({
      queryType: queryType,
      startTime: startTime,
      endTime: endTime,
      bookingStatus: bookingStatus,
      queryContext: queryContext,
      success:()=>{
        this.banquetListStore.flagt =false;
      }
    });
  };

  //获取搜索的内容
  reachValue = e => {
    var value = e.target.value;
    this.setState({ searchValue: value });
  };

  //数据选中点击事件
  clickbanquet(banquet) {
    this.banquetListStore.setStatus(banquet.bookingStatus);
    this.banquetListStore.checkedBanquetOrder(banquet.bookingID);
    this.banquetListStore.SaveHideValue(banquet);
  }

  render() {
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let DinnerPartyOpenTable = permissionList.includes(
      'DinnerParty:DinnerPartyOpenTable'
    ); //宴会预订开台
    let AddDinnerParty = permissionList.includes('DinnerParty:AddDinnerParty'); //新增宴会预订
    let ModifyDinnerParty = permissionList.includes(
      'DinnerParty:ModifyDinnerParty'
    ); //修改宴会预订
    let Deposit = permissionList.includes('DinnerParty:Deposit'); //收订金

    let { banquetListStore, banquetCreateStore } = this.props;
    let BanquetOrderList = banquetListStore.BanquetOrderList; //宴会预订列表
    let feedback = this.banquetListStore.feedback;

    //类型名称
    const menu = (
      <Menu
        id="recordid_menu"
        onClick={({ key }) => {
          switch (key) {
            case '1':
              this.setState({ typetimeName: '宴会时间', queryType: '1' });
              break;
            case '2':
              this.setState({ typetimeName: '预订时间', queryType: '2' });
              break;
            default:
          }
          this.queryselect({ queryType: key });
        }}
      >
        <Menu.Item key="1">宴会时间</Menu.Item>
        <Menu.Item key="2">预订时间</Menu.Item>
      </Menu>
    );

    //状态名称
    const statemenu = (
      <Menu
        id="state_menu"
        onClick={({ key }) => {
          switch (key) {
            case '0':
              this.setState({ stateName: '全部', bookingStatus: '' });
              break;
            case '1250':
              this.setState({ stateName: '待收订金', bookingStatus: '1250' });
              break;
            case '1251':
              this.setState({ stateName: '已收订金', bookingStatus: '1251' });
              break;
            case '1254':
              this.setState({ stateName: '已开台', bookingStatus: '1254' });
              break;
            case '1253':
              this.setState({ stateName: '已结账', bookingStatus: '1253' });
              break;
            case '1252':
              this.setState({ stateName: '已取消', bookingStatus: '1252' });
              break;
            default:
          }
          this.queryselect({ bookingStatus: key === '0' ? '' : key });
        }}
      >
        <Menu.Item key="0">全部</Menu.Item>
        <Menu.Item key="1250">待收订金</Menu.Item>
        <Menu.Item key="1251">已收订金</Menu.Item>
        <Menu.Item key="1254">已开台</Menu.Item>
        <Menu.Item key="1253">已结账</Menu.Item>
        <Menu.Item key="1252">已取消</Menu.Item>
      </Menu>
    );
    return (
      <div id="banquet-record">
        <div className="record-top">
          <div className="record-condition">
            <Dropdown overlay={menu} trigger={['click']}>
              <div className="common-button">
                {this.state.typetimeName}
                <Icon type="down" />
              </div>
            </Dropdown>
          </div>
          <div className="input-calendar" onClick={this.startdate}>
            <p className="normalbg">{this.state.starttime}</p>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
          </div>
          <span className="span-text">至</span>
          <div className="input-calendar" onClick={this.enddate}>
            <p className="normalbg">{this.state.endtime}</p>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
          </div>
          <span className="span-state">状态</span>
          <div className="record-condition">
            <Dropdown overlay={statemenu} trigger={['click']}>
              <div className="common-button">
                {this.state.stateName}
                <Icon type="down" />
              </div>
            </Dropdown>
          </div>
          <input
            type="text"
            placeholder="请输入客户姓名/手机号/宴会名称查询"
            onKeyUp={this.reachValue}
          />
          <div className="search-box" onClick={this.queryselect.bind(this)}>
            <i className="iconfont icon-order_btn_search" />查询
          </div>
        </div>

        <div className="records-list">
          <Scrollbars>
            <div className="records-list-main">
              {BanquetOrderList.length !== 0 ? (
                BanquetOrderList.map((banquet, index) => {
                  return (
                    <BanquetList
                      key={index}
                      banquetListStore={this.banquetListStore}
                      banquet={banquet}
                      handleClick={this.clickbanquet.bind(this, banquet)}
                    />
                  );
                })
              ) : (
                <div className="empty-holder">暂无数据</div>
              )}
            </div>
          </Scrollbars>
        </div>
        <div className="records-button">
          <div className="button-main">
            {AddDinnerParty && (
              <div className="div-button">
                <button onClick={this.newreservation}>新建预订</button>
              </div>
            )}
            <div className="div-button">
              <button
                className={BanquetOrderList.length > 0 ? '' : 'disabled'}
                onClick={BanquetOrderList.length > 0 && this.orderdetail}
              >
                订单详情
              </button>
            </div>
            <div className="div-button">
              <button onClick={this.updatehistory}>修改历史</button>
            </div>
            {ModifyDinnerParty && (
              <div className="div-button">
                <button
                  className={
                    banquetListStore.bookingStatus === 1251 ? '' : 'disabled'
                  }
                  onClick={() => {
                    if (banquetListStore.bookingStatus === 1251) {
                      banquetCreateStore.modifyBanquetClick(
                        banquetListStore.bookingID
                      );
                    }
                  }}
                >
                  修改预订
                </button>
              </div>
            )}
            <div className="div-button">
              <button
                className={
                  banquetListStore.bookingStatus === 1251 ||
                  banquetListStore.bookingStatus === 1250 ? (
                    ''
                  ) : (
                    'disabled'
                  )
                }
                onClick={() => {
                  //验证二次授权
                  let _this = this;
                  let object = {
                    moduleCode: 'DinnerParty',
                    privilegeCode: 'CancelDinnerParty',
                    title: '取消宴会预订',
                    toDoSomething: function() {
                      if (
                        banquetListStore.bookingStatus === 1251 ||
                        banquetListStore.bookingStatus === 1250
                      ) {
                        let hasPay = false;
                        if (banquetListStore.bookingStatus === 1251) {
                          hasPay = true;
                        } else {
                          hasPay = false;
                        }
                        _this.setState({
                          cancelBanquet: (
                            <CancelBanquetPopup
                              bookingID={banquetListStore.bookingID}
                              handleOk={() => {
                                _this.setState({ cancelBanquet: '' });
                                banquetListStore.queryBanquetOrderList({
                                  queryType: _this.state.queryType,
                                  startTime: _this.state.starttime,
                                  endTime: _this.state.endtime,
                                  bookingStatus: _this.state.bookingStatus
                                });
                              }}
                              handleCancel={() => {
                                _this.setState({ cancelBanquet: '' });
                              }}
                              hasPay={hasPay}
                            />
                          )
                        });
                      }
                    },
                    closePopup: function() {
                      _this.setState({ accreditPopup: '' });
                    },
                    failed: function() {
                      _this.setState({
                        accreditPopup: (
                          <Accredit
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
                }}
              >
                取消预订
              </button>
            </div>

            {Deposit && (
              <div className="div-button">
                <button
                  className={
                    banquetListStore.bookingStatus === 1250 ? '' : 'disabled'
                  }
                  onClick={
                    banquetListStore.bookingStatus === 1250 && this.deposit
                  }
                >
                  收订金
                </button>
              </div>
            )}

            {DinnerPartyOpenTable && (
              <div className="div-button">
                <button
                  className={
                    banquetListStore.bookingStatus === 1251 ||
                    banquetListStore.bookingStatus === 1254 ? (
                      ''
                    ) : (
                      'disabled'
                    )
                  }
                  onClick={() => {
                    if (
                      banquetListStore.bookingTime.split(' ')[0] >
                      banquetListStore.datetime
                    ) {
                      message.destroy();
                      message.warn('宴会开台时间未到');
                    } else {
                      let appStore = this.props.appStore;
                      appStore.checkBeforeDailyWorking({
                        success: () => {
                          if (
                            banquetListStore.bookingStatus === 1251 ||
                            banquetListStore.bookingStatus === 1254
                          ) {
                            this.setState({
                              banquetOpen: (
                                <Open
                                  okClick={() => {
                                    this.setState({ banquetOpen: '' });
                                    banquetListStore.queryBanquetOrderList({
                                      queryType: this.state.queryType,
                                      startTime: this.state.starttime,
                                      endTime: this.state.endtime,
                                      bookingStatus: this.state.bookingStatus
                                    });
                                  }}
                                  bookingID={banquetListStore.bookingID}
                                  closepopup={() => {
                                    this.setState({ banquetOpen: '' });
                                  }}
                                />
                              )
                            });
                          }
                        }
                      });
                    }
                  }}
                >
                  预订开台
                </button>
              </div>
            )}
          </div>
        </div>
        {this.state.calendarpopup}
        {this.state.operatePrompt}
        {this.state.banquetOpen}
        {this.state.orderdetails}
        {this.state.banquethistory}
        {this.state.cancelBanquet}
        {this.state.accreditPopup}
      </div>
    );
  }
}

export default Record;
