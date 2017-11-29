/**
* @author shining
* @description 交班记录界面
* @date 2017-05-25
**/

import React, { Component } from 'react';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars';
import CalendarPopup from 'components/calendar-popup'; //日历弹出层
import DayEndPopup from '../day-end/day-end-popup'; //日结详情
import classnames from 'classnames';
import './records.less';
import 'assets/styles/modal.css';

message.config({
  top: 300
});

function Working({ dayEndStore, working, handleClick }) {
  return (
    <div
      onClick={handleClick}
      className={
        working.selected === true ? 'each-data click-data' : 'each-data'
      }
    >
      <span>{working.index + 1}</span>
      <span>{working.createTime}</span>
      <span>{working.creatorName}</span>
      <span>{working.settlementMethod === 1118 ? '手动' : '自动'}</span>
      <span>{working.orderNum}</span>
      <span>{working.orderTotalAmount}</span>
      <span>{working.rechargeTotalAmount}</span>
      <span>{working.bookingTotalAmount}</span>
      <span>{working.repaymentTotalAmount}</span>
    </div>
  );
}

@inject('dayEndStore')
@observer
class DayEndRecords extends Component {
  constructor(props, context, handleClick) {
    super(props, context);
    let dayEndStore = this.props.dayEndStore;
    dayEndStore.setthisclick(2);
    this.state = {
      shiftdetail: '', //交班详情弹出层
      recordValue: '', //搜索内容
      starttime: dayEndStore.currentdate, //开始时间历史
      endtime: dayEndStore.currentdate, //结束时间历史
      stime: dayEndStore.currentdate, //开始时间
      eime: dayEndStore.currentdate, //结束时间
      startcalendar: '', //开始日历组件
      endcalendar: '', //结束日历组件
      clicktype: 1 //选中的类型【1:今天  2:昨天 3:历史日期】
    };

    dayEndStore.getWorkingList({
      startTime: dayEndStore.currentdate,
      endTime: dayEndStore.currentdate
    });
  }

  //数据选中点击事件
  clickworking(working) {
    let dayEndStore = this.props.dayEndStore;
    dayEndStore.setworkingID(working.workingID);
    dayEndStore.checkedworkingtList(working.index); //是否选中
  }

  //交班纪录弹出层
  clickdetail = () => {
    let dayEndStore = this.props.dayEndStore;
    let flagt;
    dayEndStore.WorkingList.map((working, index) => {
      //判断是否选中有数据
      if (working.selected === true) {
        flagt = true;
      }
      return working;
    });
    if (flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      dayEndStore.getConnectDataByWorkingID({
        workingID: dayEndStore.workingID
      });
      this.setState({
        shiftdetail: (
          <DayEndPopup
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
    let dayEndStore = this.props.dayEndStore;
    this.setState({
      clicktype: 1,
      stime: dayEndStore.currentdate,
      eime: dayEndStore.currentdate,
      recordValue: ''
    });
    dayEndStore.getWorkingList({
      startTime: dayEndStore.currentdate,
      endTime: dayEndStore.currentdate
    });
  };

  //昨天
  Yesterday = () => {
    let dayEndStore = this.props.dayEndStore;
    this.setState({
      clicktype: 2,
      stime: dayEndStore.yesterdaydate,
      eime: dayEndStore.yesterdaydate,
      recordValue: ''
    });
    dayEndStore.getWorkingList({
      startTime: dayEndStore.yesterdaydate,
      endTime: dayEndStore.yesterdaydate
    });
  };

  //历史
  Historicaldate = () => {
    let dayEndStore = this.props.dayEndStore;
    this.setState({
      clicktype: 3,
      recordValue: ''
    });
    dayEndStore.getWorkingList({
      startTime: this.state.starttime,
      endTime: this.state.endtime
    });
  };

  //获取搜索的内容
  reachValue = e => {
    var value = e.target.value;
    this.setState({ recordValue: value });
  };

  //查询
  queryselect = () => {
    let dayEndStore = this.props.dayEndStore;
    if (this.state.clicktype === 1 || this.state.clicktype === 2) {
      dayEndStore.getWorkingList({
        startTime: this.state.stime,
        searchContent: this.state.recordValue,
        endTime: this.state.eime
      });
    } else if (this.state.clicktype === 3) {
      dayEndStore.getWorkingList({
        startTime: this.state.starttime,
        searchContent: this.state.recordValue,
        endTime: this.state.endtime
      });
    }
  };

  //上一页
  prevpage = () => {};

  //下一页
  nextpage = () => {};

  render() {
    let dayEndStore = this.props.dayEndStore;
    let WorkingList = dayEndStore.WorkingList;
    return (
      <div id="record-day-main">
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
              this.state.clicktype === 3 ? 'natural active-bg' : 'natural'
            }
            onClick={this.Historicaldate}
          >
            历史日期
          </button>
          <div
            className="input-calendar"
            id={this.state.clicktype === 3 ? 'normalbg' : 'cannotbg'}
            onClick={this.state.clicktype === 3 && this.startcalendar}
          >
            <p>{this.state.starttime}</p>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
          </div>
          <span className="span-text">到</span>
          <div
            className="input-calendar"
            id={this.state.clicktype === 3 ? 'normalbg2' : 'cannotbg2'}
            onClick={this.state.clicktype === 3 && this.endcalendar}
          >
            <p>{this.state.endtime}</p>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
          </div>
          <input
            type="text"
            placeholder="请输入日结员工"
            value={this.state.recordValue}
            onChange={this.reachValue}
          />
          <div className="search-box" onClick={this.queryselect}>
            <i className="iconfont icon-order_btn_search" />查询
          </div>
        </div>
        <div className="records-list">
          <ul className="list-title">
            <li>序号</li>
            <li>营业日期</li>
            <li>日结员工</li>
            <li>方式</li>
            <li>订单数</li>
            <li>订单收入</li>
            <li>会员充值</li>
            <li>预收订金</li>
            <li>退订金</li>
          </ul>
          <div className="list-content">
            <MyScroll>
              {WorkingList.length !== 0 ? (
                WorkingList.map((working, index) => {
                  return (
                    <Working
                      key={index}
                      dayEndStore={dayEndStore}
                      working={working}
                      handleClick={this.clickworking.bind(this, working)}
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
                className={classnames({
                  disabled: WorkingList.length === 0
                })}
                onClick={WorkingList.length > 0 && this.clickdetail}
              >
                日结详情
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

export default DayEndRecords;
