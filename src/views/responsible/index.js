/**
* @author Shelly
* @description 桌台负责人
* @date 2017-05-24
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';

import CalendarPopup from 'components/calendar-popup'; //日历弹出层
import AddResponsible from './add-responsible-popup/'; //新增桌台负责人
import AdjustService from './adjust-service-popup/'; //调整服务内容
import AdjustReason from './adjust-reason-popup/'; //调整原因-即移除桌台负责人
import AdjustHistory from './adjust-history-popup/'; //调整历史记录
import ChoosePost from './choose-post-popup/'; //选择岗位
import Accredit from 'components/accredit-popup'; //二次验权的弹窗
import { checkPermission } from 'common/utils'; //二次验权的JS封装包

import './responsible.less';

const TabPane = Tabs.TabPane;
/**************** 桌台组件 *****************/
function Table({ responsibleStore, table, handleClick }) {
  let tableInfo; //左边单个桌子信息
  //如果桌台没有负责人的情况
  if (!table.dutyVOList) {
    tableInfo = <p className="title">{table.tableName}</p>;
  } else {
    let nameInfo = table.dutyVOList.map((name, nindex) => {
      //有桌台负责人时，桌台负责人遍历
      return (
        <div key={nindex}>
          <span className="sign-in" />
          <span className="name">{name.userName}</span>
        </div>
      );
    });
    tableInfo = (
      <div>
        <p className="title">{table.tableName}</p>
        {nameInfo}
      </div>
    );
  }
  return (
    <li
      className={classnames({
        'item-area': true,
        'responsible-item': true,
        'not-responsible-person': table.dutyVOList.length === 0
      })}
      id={responsibleStore.tableID === table.tableID ? 'selected-table' : ''}
      onClick={() => {
        handleClick();
      }}
    >
      <div>{tableInfo}</div>
    </li>
  );
}
/**************** 桌台组件 *****************/

@inject('responsibleStore')
@observer
class Responsible extends Component {
  constructor(props) {
    super(props);
    let responsibleStore = this.props.responsibleStore;
    this.state = {
      adjustService: '',
      Calendar: '', //日历组件
      formattime: responsibleStore.currentdate, //当前日期
      responsibleRightInfo: (
        <div className="no-responsible-person-box">
          <div className="desk-pic">
            <div className="empty-holder">选择桌台查看负责人信息</div>
          </div>
        </div>
      ), //右边信息块
      tableName: '', //新增桌台负责人的弹窗名称
      searchValue: '', //搜索框内的内容
      addResponsible: '', //新增桌台负责人弹窗
      removeResponsible: '', //移除桌台负责人弹窗
      adjustservice: '', //调整服务内容弹窗
      adjusthistory: '', //查看历史内容弹窗
      showNoResponsibleTable: false, //当为true时，无桌台负责人为选中状态
      accreditPopup: ''
    };
    //获取一级分类
    responsibleStore.getAreaMealsInfo(this.state.formattime);
  }
  //获取搜索的内容
  searchValue = e => {
    var value = e.target.value;
    this.setState({ searchValue: value });
  };

  //选择桌台
  clickTable(table) {
    let responsibleStore = this.props.responsibleStore;
    responsibleStore.getQueryAllServiceItem();
    responsibleStore.tableID = table.tableID;
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let AddManager = permissionList.includes('TableManager:AddManager'); //新增负责人
    if (table.dutyVOList) {
      responsibleStore.rightNameInfo = table.dutyVOList.map((name, nindex) => {
        //点击桌子，右边显示对应名字
        let serviceInfo;
        let serviceID = [];
        if (name.serviceAnswerTypeVOList) {
          serviceInfo = name.serviceAnswerTypeVOList.map((service, sindex) => {
            //每个名字对应的服务信息
            return <p key={sindex}>{service.serviceAnswerTypeName + ' '}</p>;
          });
          serviceID = name.serviceAnswerTypeVOList.map((service, sindex) => {
            //每个名字对应的服务信息id
            return service.serviceAnswerTypeID;
          });
        }
        return (
          <div className="info-content-item" key={nindex}>
            <div className="waiter-info">
              <div className="list">
                <span className="sign-in" />
                <span className="name">{name.userName}</span>
              </div>
              <div className="list">
                <span className="title">工号：</span>
                <span className="context">{name.employeeCode}</span>
              </div>
            </div>
            <div className="service-info">
              <div className="service">{serviceInfo}</div>
              <button
                className="adjust-btn"
                onClick={() => {
                  let _this = this;
                  let object = {
                    moduleCode: 'TableManager', //桌台负责人模块
                    privilegeCode: 'Adjustservicecontent',
                    title: '调整服务内容',
                    toDoSomething: function() {
                      if (
                        _this.state.formattime !== responsibleStore.currentdate
                      ) {
                        message.info('不能对历史日期的桌台进行调整');
                      } else {
                        _this.setState({
                          adjustservice: (
                            <AdjustService
                              title={name.userName}
                              onOk={() => {
                                _this.setState({ adjustservice: '' });
                              }}
                              onCancel={() => {
                                responsibleStore.hasServiceContent = [];
                                _this.setState({ adjustservice: '' });
                              }}
                              tableID={table.tableID} //桌台ID
                              tableName={table.tableName} //桌台名称
                              tableCode={table.tableCode} //桌台编码
                              loginID={name.loginID} //员工ID
                              areaID={responsibleStore.currentAreaID} //区域ID
                              mealsID={responsibleStore.currentMealsID} //餐次ID
                              serviceAnswerTypeList={serviceID} //服务内容ID
                            />
                          )
                        });
                        responsibleStore.getQueryConfigReason(2);

                        // 要循环已有服务，然后赋值给新弹出的调整服务弹窗。让已有的值为选中状态
                        // serviceID.forEach((sevrviceID)=>{
                        // 	responsibleStore.hasServiceContent.push(sevrviceID);
                        // })
                        responsibleStore.hasServiceContent = serviceID.map(
                          sevrviceID => {
                            return sevrviceID;
                          }
                        );
                        //遍历出已有的服务，然后和所有的服务进行比较，如果有匹配的就选中
                        responsibleStore.serviceLis.forEach(rService => {
                          if (
                            responsibleStore.hasServiceContent.includes(
                              rService.serviceAnswerTypeID
                            )
                          ) {
                            rService.select = true;
                          } else {
                            rService.select = false;
                          }
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
                调整服务内容
              </button>
              <button
                className="del-btn"
                onClick={() => {
                  let _this = this;
                  let object = {
                    moduleCode: 'TableManager', //桌台负责人模块
                    privilegeCode: 'RemoveManager',
                    title: '移除负责人',
                    toDoSomething: function() {
                      if (
                        _this.state.formattime !== responsibleStore.currentdate
                      ) {
                        message.info('不能对历史日期的桌台负责人进行移除');
                      } else {
                        _this.setState({
                          removeResponsible: (
                            <AdjustReason
                              onOk={() => {
                                _this.setState({ removeResponsible: '' });
                              }}
                              onCancel={() => {
                                _this.setState({ removeResponsible: '' });
                              }}
                              tableID={table.tableID} //桌台ID
                              tableName={table.tableName} //桌台名称
                              tableCode={table.tableCode} //桌台编码
                              loginID={name.loginID} //员工ID
                              areaID={responsibleStore.currentAreaID}
                              mealsID={responsibleStore.currentMealsID}
                              serviceAnswerTypeList={serviceID} //服务内容ID
                            />
                          )
                        });
                        responsibleStore.getQueryConfigReason(3);
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
                移除
              </button>
            </div>
          </div>
        );
      });
    }
    //右边桌台信息块
    if (table.dutyVOList.length === 0) {
      this.setState({
        responsibleRightInfo: (
          <div className="no-responsible-person-box">
            <div className="desk-pic">
              <div className="empty-holder">选择桌台查看负责人信息</div>
            </div>

            <div className="right-bottom">
              {AddManager && (
                <button
                  onClick={() => {
                    if (
                      this.state.formattime !== responsibleStore.currentdate
                    ) {
                      message.info('不能对历史日期的桌台进行新增');
                    } else {
                      responsibleStore.savetypeid = null;
                      this.setState({
                        addResponsible: (
                          <AddResponsible
                            title={table.tableName}
                            onOk={() => {
                              this.setState({ addResponsible: '' });
                            }}
                            onCancel={() => {
                              this.setState({ addResponsible: '' });
                            }}
                            tableID={table.tableID}
                            tableName={table.tableName}
                            tableCode={table.tableCode}
                            loginID={table.loginID}
                            areaID={responsibleStore.currentAreaID}
                            mealsID={responsibleStore.currentMealsID}
                          />
                        )
                      });
                      responsibleStore.getQueryAllServiceItem();
                      responsibleStore.getQueryAllUsers();
                      responsibleStore.getQueryConfigReason(1);
                    }
                  }}
                >
                  新增负责人
                </button>
              )}
              <button
                onClick={() => {
                  this.setState({
                    adjusthistory: (
                      <AdjustHistory
                        title={table.tableName}
                        onOk={() => {
                          this.setState({ adjusthistory: '' });
                        }}
                        onCancel={() => {
                          this.setState({ adjusthistory: '' });
                        }}
                      />
                    )
                  });
                  responsibleStore.getQueryAllServiceItem();
                  responsibleStore.getQueryAllUsers();
                  responsibleStore.getQueryConfigReason(1);
                  // responsibleStore.getAdjustHistory();
                  responsibleStore.getTableChangeInfo(
                    table.tableID,
                    this.state.formattime
                  );
                }}
              >
                查看调整历史
              </button>
            </div>
          </div>
        )
      });
    } else {
      this.setState({
        responsibleRightInfo: (
          <div className="responsible-info">
            <div className="info-title">
              <div>
                <span className="name">桌台：</span>
                <span className="info">{table.tableName}</span>
              </div>
            </div>
            <Scrollbars>
              <div className="info-content">
                {responsibleStore.rightNameInfo}
              </div>
            </Scrollbars>
            <div className="right-bottom">
              {AddManager && (
                <button
                  onClick={() => {
                    if (
                      this.state.formattime !== responsibleStore.currentdate
                    ) {
                      message.info('不能对历史日期的桌台进行新增');
                    } else {
                      this.setState({
                        addResponsible: (
                          <AddResponsible
                            title={table.tableName}
                            onOk={() => {
                              this.setState({ addResponsible: '' });
                            }}
                            onCancel={() => {
                              this.setState({ addResponsible: '' });
                            }}
                            tableID={table.tableID}
                            tableName={table.tableName}
                            tableCode={table.tableCode}
                            loginID={table.loginID}
                            areaID={responsibleStore.currentAreaID}
                            mealsID={responsibleStore.currentMealsID}
                          />
                        )
                      });
                      responsibleStore.getQueryAllServiceItem();
                      responsibleStore.getQueryAllUsers();
                      responsibleStore.getQueryConfigReason(1);
                    }
                  }}
                >
                  新增负责人
                </button>
              )}
              <button
                onClick={() => {
                  this.setState({
                    adjusthistory: (
                      <AdjustHistory
                        title={table.tableName}
                        onOk={() => {
                          this.setState({ adjusthistory: '' });
                        }}
                        onCancel={() => {
                          this.setState({ adjusthistory: '' });
                        }}
                      />
                    )
                  });
                  responsibleStore.getQueryAllServiceItem();
                  responsibleStore.getQueryAllUsers();
                  responsibleStore.getQueryConfigReason(1);
                  // responsibleStore.getAdjustHistory();
                  responsibleStore.getTableChangeInfo(
                    table.tableID,
                    this.state.formattime
                  );
                }}
              >
                查看调整历史
              </button>
            </div>
          </div>
        )
      });
    }
  }

  render() {
    let responsibleStore = this.props.responsibleStore;
    let choosepost; //岗位选择
    /*********************弹窗显示判断相关**********************/
    if (responsibleStore.choosePost) {
      choosepost = <ChoosePost />;
    }
    /*********************弹窗显示判断相关**********************/
    return (
      <div id="responsible_container">
        <div className="responsible-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              //返回预定界面
              this.context.router.goBack();
            }}
          />桌台负责人
        </div>
        <div className="responsible-container">
          <div className="responsible-left">
            <div className="search-area">
              <div className="input-wrap">
                <input
                  type="text"
                  value={this.state.formattime}
                  onClick={() => {
                    this.setState({
                      Calendar: (
                        <CalendarPopup
                          maxTime={new Date(responsibleStore.currentdate)}
                          changetime={new Date(this.state.formattime)}
                          calendarModalCancel={() => {
                            this.setState({ Calendar: '' });
                          }}
                          calendarModalOk={newtime => {
                            this.setState({ formattime: newtime });
                            this.setState({ Calendar: '' });
                          }}
                        />
                      )
                    });
                  }}
                  readOnly
                />
                <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
              </div>
              <div className="input-wrap">
                <input
                  type="text"
                  placeholder="请输入桌台号进行查询"
                  onKeyUp={this.searchValue}
                />
              </div>
              <button
                className="search-btn"
                onClick={() => {
                  responsibleStore.getTableInfo(
                    responsibleStore.secondCategoryID,
                    responsibleStore.firstCategoryID,
                    this.state.formattime,
                    this.state.searchValue
                  );
                }}
              >
                查询
              </button>
            </div>
            <div className="dishes-category">
              <Tabs
                activeKey={responsibleStore.firstCategoryID}
                onTabClick={areaID => {
                  //一级分类
                  responsibleStore.getMealsInfo(areaID, this.state.formattime);
                }}
              >
                {responsibleStore.areaList.map(area => {
                  return <TabPane tab={area.areaName} key={area.areaID} />;
                })}
              </Tabs>
            </div>
            <div className="second-nav">
              <div className="nav-tabs">
                <Tabs
                  activeKey={responsibleStore.secondCategoryID}
                  onTabClick={mealsID => {
                    //二级分类
                    responsibleStore.secondCategoryID = mealsID;
                    responsibleStore.getTableInfo(
                      mealsID,
                      responsibleStore.firstCategoryID,
                      this.state.formattime
                    ); //餐次、区域、时间
                    responsibleStore.getManagerStatus(
                      responsibleStore.firstCategoryID,
                      responsibleStore.secondCategoryID,
                      this.state.formattime,
                      0,
                      () => {}
                    );
                  }}
                >
                  {responsibleStore.mealsList.map(meal => {
                    return (
                      <TabPane
                        tab={
                          <span>
                            {meal.mealName}
                            <br />
                            <i className="time-area">
                              {meal.startTime.slice(11)} -{' '}
                              {meal.endTime.slice(11)}
                            </i>
                          </span>
                        }
                        key={meal.mealsID}
                      />
                    );
                  })}
                </Tabs>
              </div>
            </div>
            <div className="table-list-wrap">
              <Scrollbars>
                <ul className="table-list">
                  {responsibleStore.tableList &&
                    responsibleStore.tableList
                      .concat(Array(10).fill(0))
                      .map((table, index) => {
                        //桌台List
                        return table ? (
                          <Table
                            key={index}
                            responsibleStore={responsibleStore}
                            table={table}
                            handleClick={this.clickTable.bind(this, table)}
                          />
                        ) : (
                          <li key={index} className="responsible-item" />
                        );
                      })}
                </ul>
              </Scrollbars>
            </div>
            <div className="responsible-bottom">
              <button
                id="show-all"
                onClick={() => {
                  this.setState({ showNoResponsibleTable: false });
                  responsibleStore.getManagerStatus(
                    responsibleStore.firstCategoryID,
                    responsibleStore.secondCategoryID,
                    this.state.formattime,
                    0,
                    () => {}
                  );
                }}
              >
                全部显示({responsibleStore.tablesNumOfArea})
              </button>
              <button
                className={classnames({
                  'choose-btn': true,
                  'btn-noresponsible': true,
                  'active-btn': this.state.showNoResponsibleTable
                })}
                onClick={() => {
                  this.setState({ showNoResponsibleTable: true });
                  responsibleStore.getManagerStatus(
                    responsibleStore.firstCategoryID,
                    responsibleStore.secondCategoryID,
                    this.state.formattime,
                    1,
                    () => {}
                  );
                }}
              >
                <span className="not-responsible-table" />无桌台负责人({responsibleStore.tablesNumOfNoManager})
              </button>
              <button className="choose-btn btn-nosign-in">
                <span className="not-sign-in-table" />桌台无签到负责人(0)
              </button>
              <div className="sign-in-show">
                <div>
                  <span className="sign-in" />
                  <span className="name">已签到</span>
                </div>
                <div>
                  <span className="not-sign-in" />
                  <span className="name">未签到</span>
                </div>
              </div>
            </div>
          </div>
          <div className="responsible-right">
            <div className="right-title">负责人信息</div>
            {this.state.responsibleRightInfo}
          </div>
        </div>
        {this.state.addResponsible}
        {this.state.removeResponsible}
        {this.state.adjustservice}
        {this.state.adjusthistory}
        {choosepost}
        {this.state.Calendar}
        {this.state.accreditPopup}
      </div>
    );
  }
}

Responsible.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Responsible;
