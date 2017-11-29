/**
 * @author shining
 * @description 订单界面
 * @date 2017-05-16
 **/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars';
import CalendarPopup from 'components/calendar-popup'; //日历弹出层
import UnsubscribeRecordPopup from '../unsubscribe-record-popup'; //订单详情
import { message } from 'antd';
import './unsubscribe-record.less';

message.config({
  top: 300
});

// 退订单
function Refundlist({ orderStore, msgobj, handleClick }) {
  return (
    <div
      onClick={handleClick}
      className={
        msgobj.selected === true ? 'each-data click-data' : 'each-data'
      }
    >
      <span>{msgobj.index + 1}</span>
      <span>{msgobj.bookingCode}</span>
      <span>{msgobj.bookingAmount.toFixed(2)}</span>
      <span>{msgobj.refundAmount.toFixed(2)}</span>
      <span>{msgobj.refundRate}</span>
      <span>{msgobj.refundMethod}</span>
      <span>{msgobj.refundType}</span>
      <span>{msgobj.refundDate}</span>
      <span>{msgobj.dealUer}</span>
    </div>
  );
}

@inject('orderStore')
@observer
class UnsubscribeRecord extends Component {
  constructor(props, context, handleClick) {
    super(props, context);
    let orderStore = this.props.orderStore;
    this.state = {
      shiftdetail: '', //交班详情弹出层
      dealUer: '', //操作人
      bookingCode: '', //预定编号
      starttime: orderStore.currentdate, //开始时间历史
      endtime: orderStore.currentdate, //结束时间历史
      stime: orderStore.currentdate, //开始时间
      eime: orderStore.currentdate, //结束时间
      startcalendar: '', //开始日历组件
      endcalendar: '', //结束日历组件
      clicktype: 1 //选中的类型【1:今天  2:昨天0:历史日期】
    };
    orderStore.getRefundList({
      dateFlag: 1,
      refundDateStart: orderStore.currentdate,
      refundDateEnd: orderStore.currentdate
    });
  }

  //数据选中点击事件
  clickworking(msgobj) {
    let orderStore = this.props.orderStore;
    orderStore.checkedclickworking(msgobj.index); //是否选中
    orderStore.savebdiding(msgobj.bookingID, msgobj.DealID); //保存退款详情所需要的id
  }

  //订单详情
  clickdetail = () => {
    let orderStore = this.props.orderStore;
    let flagt;
    orderStore.refundList.map((refund, index) => {
      //判断是否选中有数据
      if (refund.selected === true) {
        flagt = true;
      }
      return refund;
    });

    if (flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      orderStore.getdetailobj({
        bookingID: orderStore.setdatilsid.bookingID,
        DealID: orderStore.setdatilsid.DealID
      });
      this.setState({
        shiftdetail: (
          <UnsubscribeRecordPopup
            closebutton={() => {
              this.setState({ shiftdetail: '' });
            }}
          />
        )
      });
    }
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

  //今天
  today = () => {
    let orderStore = this.props.orderStore;
    this.setState({
      clicktype: 1,
      stime: orderStore.currentdate,
      eime: orderStore.currentdate,
      dealUer: '', //操作人
      bookingCode: '' //预定编号
    });
    orderStore.getRefundList({
      //查询今天的action
      dateFlag: 1,
      refundDateStart: orderStore.currentdate,
      refundDateEnd: orderStore.currentdate
    });
  };

  //昨天
  Yesterday = () => {
    let orderStore = this.props.orderStore;
    this.setState({
      clicktype: 2,
      stime: orderStore.yesterdaydate,
      eime: orderStore.yesterdaydate,
      dealUer: '', //操作人
      bookingCode: '' //预定编号
    });

    orderStore.getRefundList({
      //查询昨天的action
      dateFlag: 2,
      refundDateStart: orderStore.yesterdaydate,
      refundDateEnd: orderStore.yesterdaydate
    });
  };

  //历史
  Historicaldate = () => {
    let orderStore = this.props.orderStore;
    this.setState({
      clicktype: 0,
      dealUer: '', //操作人
      bookingCode: '' //预定编号
    });
    orderStore.getRefundList({
      //查询昨天的action
      dateFlag: 0,
      refundDateStart: this.state.starttime,
      refundDateEnd: this.state.endtime
    });
  };

  //获取操作人
  dealUer = e => {
    var value = e.target.value;
    this.setState({ dealUer: value });
  };

  //获取输入预订号查询
  bookingCode = e => {
    var value = e.target.value;
    this.setState({ bookingCode: value });
  };

  //查询
  queryselect = () => {
    let orderStore = this.props.orderStore;
    let datestart; //开始日期
    let dateend; //结束日期
    if (this.state.clicktype === 1 || this.state.clicktype === 2) {
      datestart = this.state.stime;
      dateend = this.state.eime;
    }

    if (this.state.clicktype === 0) {
      datestart = this.state.starttime;
      dateend = this.state.endtime;
    }
    orderStore.getRefundList({
      dateFlag: this.state.clicktype, //日期标识
      bookingCode: this.state.bookingCode, //预订编号
      dealUer: this.state.dealUer, //操作人
      refundDateStart: datestart, //退款日期开始
      refundDateEnd: dateend //退款日期结束
    });
  };

  render() {
    let orderStore = this.props.orderStore;
    let refundList = orderStore.refundList;
    return (
      <div id="unsubscribe-record-main">
        <div className="shift-title">
          <button
            className={
              this.state.clicktype === 1 ? 'natural active-bg' : 'natural'
            }
            onClick={this.today}
          >
            今天
          </button>
          <button
            className={
              this.state.clicktype === 2 ? 'natural active-bg' : 'natural'
            }
            onClick={this.Yesterday}
          >
            昨天
          </button>
          <button
            className={
              this.state.clicktype === 0 ? 'natural active-bg' : 'natural'
            }
            onClick={this.Historicaldate}
          >
            历史日期
          </button>
          <div
            className="input-calendar"
            id={this.state.clicktype === 0 ? 'normalbg' : 'cannotbg'}
            onClick={this.state.clicktype === 0 && this.startcalendar}
          >
            <p>{this.state.starttime}</p>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
          </div>
          <span className="span-text">到</span>
          <div
            className="input-calendar"
            id={this.state.clicktype === 0 ? 'normalbg2' : 'cannotbg2'}
            onClick={this.state.clicktype === 0 && this.endcalendar}
          >
            <p>{this.state.endtime}</p>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
          </div>
          <div className="input-box">
            <input
              type="text"
              placeholder="请输入操作人"
              value={this.state.dealUer}
              onChange={this.dealUer}
            />{' '}
          </div>
          <div className="input-box">
            <input
              className="input-width"
              type="text"
              placeholder="请输入预订号查询"
              value={this.state.bookingCode}
              onChange={this.bookingCode}
            />{' '}
          </div>
          <div className="search-box" onClick={this.queryselect}>
            <i className="iconfont icon-order_btn_search" />查询
          </div>
        </div>
        <div className="records-list">
          <ul className="list-title">
            <li>序号</li>
            <li>预订单号</li>
            <li>已付订金</li>
            <li>实际退款</li>
            <li>退款比例(％)</li>
            <li>退款方式</li>
            <li>类型</li>
            <li>退款时间</li>
            <li>操作人</li>
          </ul>
          <div className="list-content">
            <MyScroll>
              {refundList.length !== 0 ? (
                refundList.map((msgobj, index) => {
                  return (
                    <Refundlist
                      key={index}
                      orderStore={orderStore}
                      msgobj={msgobj}
                      handleClick={this.clickworking.bind(this, msgobj)}
                    />
                  );
                })
              ) : (
                <div className="empty-holder">暂无数据</div>
              )}
            </MyScroll>
          </div>
        </div>
        <div className="records-button">
          <div className="button-main">
            <div className="button-datil">
              <button
                className={refundList.length === 0 ? 'disabled' : ''}
                onClick={this.clickdetail}
              >
                订单详情
              </button>
            </div>
          </div>
        </div>
        {this.state.shiftdetail}
        {this.state.startcalendar}
        {this.state.endcalendar}
      </div>
    );
  }
}
export default UnsubscribeRecord;
