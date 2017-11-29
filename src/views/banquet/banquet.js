/**
* @author William Cui
* @description 宴会主界面
* @date 2017-06-27
**/

import React, { Component } from 'react';
import { message } from 'antd';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router';
import Scrollbars from 'react-custom-scrollbars';
import SelectDesk from '../banquet/type-desk-popup';

import './banquet.less';

// 宴会桌态图已开台列表
function BanquetData({ banquetListStore, curdate, handleClick }) {
  let actualTime = curdate.openTime.split(' ')[1].slice(0, 5);
  return (
    <div
      onClick={handleClick}
      className={classnames({
        'each-desk': true,
        'mask select': curdate.selected,
        dirty: curdate.bookingStatus === 1253
      })}
    >
      {curdate.selected === true && (
        <i className="iconfont icon-home_icon_selected" />
      )}
      <div className="item-content">
        <div
          className={curdate.partyName.length > 5 ? 'item-small' : 'item-title'}
        >
          {curdate.partyName}
        </div>
        <div className="item-number">{curdate.actuNum}桌</div>
      </div>
      <div className="item-pins">
        <span>￥{(curdate.banqTotalAmount * 1).toFixed(2) * 1}</span>
        <em>{actualTime}</em>
      </div>
    </div>
  );
}

@inject('banquetCreateStore', 'banquetListStore', 'appStore')
@observer
class Banquet extends Component {
  constructor(props, context, handleClick) {
    super(props, context);
    this.state = {
      SelectDesk: ''
    };

    let archiveID; //档案ID
    if (sessionStorage.getItem('account')) {
      archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
    }

    this.props.banquetListStore.getCurDateOpenBookingList({
      archiveID: archiveID
    });
    this.props.banquetListStore.SummaryInfoobj = '';
  }

  banquetListStore = this.props.banquetListStore;

  componentDidMount() {
    let banquetListStore = this.props.banquetListStore;
    banquetListStore.setthisclick(1);
  }

  clickCurDate(curdate) {
    this.banquetListStore.saveCurValue(curdate);
    this.banquetListStore.checkedCurDateList(curdate.bookingID);
    this.banquetListStore.getBookingSummaryInfo({
      bookingID: this.banquetListStore.banbookingID
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

  //清台
  clickEmpty = () => {
    this.banquetListStore.clearTableInfo(this.banquetListStore.banbookingID);
  };

  render() {
    let CurDateList = this.banquetListStore.CurDateList;
    let SummaryInfoobj = this.banquetListStore.SummaryInfoobj;
    let banbookingStatus = this.banquetListStore.banbookingStatus;
    let feedback = this.banquetListStore.feedback;
    return (
      <div id="banquet">
        <div className="left_block">
          <Scrollbars>
            {CurDateList.length !== 0 ? (
              CurDateList.map((curdate, index) => {
                return (
                  <BanquetData
                    key={index}
                    banquetListStore={this.banquetListStore}
                    curdate={curdate}
                    handleClick={this.clickCurDate.bind(this, curdate)}
                  />
                );
              })
            ) : (
              <div className="empty-holder">暂无数据</div>
            )}
          </Scrollbars>
        </div>
        <div className="right_block">
          <div className="banquet_info_container">
            <h4 className="banquet_info_header">桌台信息</h4>
            {SummaryInfoobj !== '' && (
              <div className="no_message_box">
                <div className="banquet_choose_desk">
                  <Scrollbars>
                    <div className="hasSelectDesk">
                      <h5>已选桌台</h5>
                      <div className="has-select-content">
                        <span className="has-select-number">
                          {SummaryInfoobj.partyName}
                        </span>
                        <span className="has-select-location">
                          <span
                            className={classnames({
                              'has-select-point': true,
                              'point-not-order': true,
                              'point-not-dirty':
                                SummaryInfoobj.bookingStatus === 1253
                            })}
                          />
                          {SummaryInfoobj.actuNum}桌
                        </span>
                      </div>
                    </div>
                  </Scrollbars>
                </div>
                <div className="banquet_detail">
                  <Scrollbars>
                    <div className="normal-one-line">
                      <span className="normal-title"> 预定单号：</span>
                      {SummaryInfoobj.bookingID}
                    </div>
                    <div className="banquet-normal">
                      <span className="normal-title"> 宴会名称：</span>
                      {SummaryInfoobj.partyName}
                    </div>
                    <div className="banquet-normal">
                      <span className="normal-title"> 婚宴类型：</span>
                      {SummaryInfoobj.partyTypeName}
                    </div>
                    <div className="banquet-normal">
                      <span className="normal-title"> 预订桌数：</span>
                      {SummaryInfoobj.tableNum}
                    </div>
                    <div className="banquet-normal">
                      <span className="normal-title"> 备用桌数：</span>
                      {SummaryInfoobj.backupNum}
                    </div>
                    <div className="banquet-normal">
                      <span className="normal-title"> 客户姓名：</span>
                      {SummaryInfoobj.customerName}
                    </div>
                    <div className="normal-one-line">
                      <span className="normal-title"> 客户电话：</span>
                      {SummaryInfoobj.phone}
                    </div>
                    <div className="normal-one-line">
                      <span className="normal-title"> 宴会时间：</span>
                      {SummaryInfoobj.bookingTime}
                    </div>
                    <div className="normal-one-line">
                      <span className="normal-title"> 开席时间：</span>
                      {SummaryInfoobj.openTime}
                    </div>
                    <div className="normal-one-line">
                      <span className="normal-title"> 预订说明：</span>
                      <span>{SummaryInfoobj.bookingDesc}</span>
                    </div>
                  </Scrollbars>
                </div>
                {banbookingStatus === 1254 && (
                  <div className="desk_operate">
                    <div
                      className="btn-active"
                      onClick={() => {
                        this.setState({
                          SelectDesk: (
                            <SelectDesk
                              handleOk={tablenameList => {
                                if (
                                  this.banquetListStore.selectDesk.length === 0
                                ) {
                                  message.destroy();
                                  message.warn('请选择占用桌台', 1);
                                } else {
                                  browserHistory.push({
                                    pathname: '/dishes',
                                    state: {
                                      dishesType: 'banquetAdd',
                                      nextUrl: '/banquet',
                                      orderInfo: {
                                        bookingID: this.banquetListStore
                                          .orderInfo.bookingID, //宴会单号
                                        partyName: this.banquetListStore
                                          .orderInfo.partyName, //宴会名称
                                        customerName: this.banquetListStore
                                          .orderInfo.customerName, //客户姓名
                                        tableNum: this.banquetListStore
                                          .orderInfo.tableNum, //预订桌数
                                        backupNum: this.banquetListStore
                                          .orderInfo.backupNum, //备用桌数
                                        actuNum: this.banquetListStore.orderInfo
                                          .actuNum, //已开桌数
                                        openTime: this.banquetListStore
                                          .orderInfo.openTime, //开席时间
                                        tableNames: tablenameList.toString() //占用桌台
                                      }
                                    }
                                  });
                                  this.setState({ SelectDesk: '' });
                                }
                              }}
                              handleCancel={() => {
                                this.setState({ SelectDesk: '' });
                              }}
                            />
                          )
                        });
                      }}
                    >
                      加菜
                    </div>
                    <div
                      className="btn-active"
                      onClick={() => {
                        //检查  开班
                        let appStore = this.props.appStore;
                        appStore.isInWorking({
                          success: () => {
                            browserHistory.push({
                              pathname: '/banquet/settlement',
                              state: {
                                bookingID: this.banquetListStore.banbookingID
                              }
                            });
                          }
                        });
                      }}
                    >
                      结账
                    </div>
                  </div>
                )}

                {banbookingStatus === 1253 && (
                  <div className="desk_operate">
                    <div className="btn-active" onClick={this.clickEmpty}>
                      清台
                    </div>
                  </div>
                )}
              </div>
            )}

            {SummaryInfoobj === '' && <div className="empty-holder">暂无数据</div>}
          </div>
        </div>
        {this.state.SelectDesk}
      </div>
    );
  }
}

export default Banquet;
