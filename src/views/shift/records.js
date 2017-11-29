/**
* @author shining
* @description 交班记录界面
* @date 2017-05-25
**/

import React, { Component } from 'react';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars';
import CalendarPopup from 'components/calendar-popup';//日历弹出层
import ShiftDetailsPopup from '../shift/shift-details-popup';//交班详情 
import classnames from 'classnames';
import 'assets/styles/modal.css';
import './records.less';
import 'assets/iconfont/iconfont.css';

message.config({
  top: 300
});


function Working({ shiftStore, working, handleClick }) {
  return <div onClick={handleClick} className={working.selected === true ? 'each-data click-data' : 'each-data'}>
    <span>{working.index + 1}</span>
    <span>{working.createTime}</span>
    <span>{working.workOffTime}</span>
    <span>{working.creatorName}</span>
    <span>{working.orderNum}</span>
    <span>{working.moneyAmount}</span>
    <span>{working.orderTotalAmount}</span>
    <span>{working.rechargeTotalAmount}</span>
    <span>{working.bookingTotalAmount}</span>
    <span>{working.repaymentTotalAmount}</span>
  </div>
}

@inject('shiftStore') @observer
class ShiftRecords extends Component {

  constructor(props, context, handleClick) {
    super(props, context);
    let shiftStore = this.props.shiftStore;
    shiftStore.setthisclick(2);
    this.state = {
      shiftdetail: '',//交班详情弹出层
      recordValue: '',//搜索内容
      starttime: shiftStore.currentdate,//开始时间历史
      endtime: shiftStore.currentdate,//结束时间历史
      stime: shiftStore.currentdate,//开始时间
      eime: shiftStore.currentdate,//结束时间
      startcalendar: '',//开始日历组件
      endcalendar: '',//结束日历组件
      clicktype: 1 //选中的类型【1:今天  2:昨天 3:历史日期】
    }


    shiftStore.getWorkingList({
      startTime: shiftStore.currentdate,
      endTime: shiftStore.currentdate
    });

  }


  shiftStore = this.props.shiftStore;

  //数据选中点击事件
  clickworking(working) {
    this.shiftStore.setworkingID(working.workingID);
    this.shiftStore.checkedworkingtList(working.index);//是否选中 

  }

  //交班纪录弹出层
  clickdetail = () => {
    let flagt;
    this.shiftStore.WorkingList.map((working, index) => {//判断是否选中有数据
      if (working.selected === true) {
        flagt = true;
      }
      return working;
    });
    if (flagt !== true) {
      message.destroy();
      message.warn("请选中数据");
    } else {
      this.shiftStore.getConnectDataByWorkingID(this.shiftStore.workingID);
      this.setState({
        shiftdetail:
        <ShiftDetailsPopup
          closebutton={() => {
            this.setState({ shiftdetail: '' })
          }}>
        </ShiftDetailsPopup>
      });

    }



  }
  //开始日期
  startcalendar = () => {
    this.setState({
      startcalendar:
      <CalendarPopup
        calendarModalCancel={() => {
          this.setState({ startcalendar: '' });
        }}
        calendarModalOk={(newtime) => {
          this.setState({ starttime: newtime });
          this.setState({ startcalendar: '' });
        }}>
      </CalendarPopup>
    });
  }

  //结束日期
  endcalendar = () => {
    this.setState({
      endcalendar:
      <CalendarPopup
        calendarModalCancel={() => {
          this.setState({ endcalendar: '' });
        }}
        calendarModalOk={(newtime) => {
          this.setState({ endtime: newtime });
          this.setState({ endcalendar: '' });
        }}>
      </CalendarPopup>
    });
  }

  //今天
  today = () => {
    this.setState({
      clicktype: 1,
      stime: this.shiftStore.currentdate,
      eime: this.shiftStore.currentdate,
      recordValue: ''
    });
    this.shiftStore.getWorkingList({
      startTime: this.shiftStore.currentdate,
      endTime: this.shiftStore.currentdate,
    });

  }

  //昨天
  Yesterday = () => {
    this.setState({
      clicktype: 2,
      stime: this.shiftStore.yesterdaydate,
      eime: this.shiftStore.yesterdaydate,
      recordValue: ''
    });
    this.shiftStore.getWorkingList({
      startTime: this.shiftStore.yesterdaydate,
      endTime: this.shiftStore.yesterdaydate,
    });
  }

  //历史
  Historicaldate = () => {
    this.setState({
      clicktype: 3,
      recordValue: ''
    });
    this.shiftStore.getWorkingList({
      startTime: this.state.starttime,
      endTime: this.state.endtime,
    });
  }

  //获取搜索的内容
  reachValue = (e) => {
    var value = e.target.value;
    this.setState({ recordValue: value })
  }

  //查询
  queryselect = () => {
    if (this.state.clicktype === 1 || this.state.clicktype === 2) {
      this.shiftStore.getWorkingList({
        startTime: this.state.stime,
        endTime: this.state.eime,
        searchContent: this.state.recordValue,
      });
    } else if (this.state.clicktype === 3) {
      this.shiftStore.getWorkingList({
        startTime: this.state.starttime,
        endTime: this.state.endtime,
        searchContent: this.state.recordValue,
      });
    }
  }

  //上一页
  prevpage = () => {

  }

  //下一页
  nextpage = () => {

  }

  render() {
    let WorkingList = this.shiftStore.WorkingList;
    return <div id="record-main">
      <div className="shift-title">
        <button className={this.state.clicktype === 1 ? 'natural active-bg' : 'natural'} onClick={this.today}>今天</button>
        <button className={this.state.clicktype === 2 ? 'natural active-bg' : 'natural'} onClick={this.Yesterday}>昨天</button>
        <button className={this.state.clicktype === 3 ? 'natural active-bg' : 'natural'} onClick={this.Historicaldate}>历史日期</button>
        <div className="input-calendar" id={this.state.clicktype === 3 ? 'normalbg' : 'cannotbg'} onClick={this.state.clicktype === 3 && this.startcalendar}>
          <p>
            {this.state.starttime}
          </p>
          <i className="iconfont icon-xinzenghuiyuan_icon_rili"></i>
        </div>
        <span className="span-text">到</span>
        <div className="input-calendar" id={this.state.clicktype === 3 ? 'normalbg2' : 'cannotbg2'} onClick={this.state.clicktype === 3 && this.endcalendar} >
          <p>
            {this.state.endtime}
          </p>
          <i className="iconfont icon-xinzenghuiyuan_icon_rili"></i>
        </div>
        <input type="text" placeholder="请输入交班员工" value={this.state.recordValue} onChange={this.reachValue} />
        <div className="search-box" onClick={this.queryselect}>
          <i className="iconfont icon-order_btn_search"></i>查询
				</div>
      </div>
      <div className="records-list">
        <ul className="list-title">
          <li>序号</li>
          <li>开始时间</li>
          <li>结束时间</li>
          <li>交班员工</li>
          <li>订单数</li>
          <li>备用金</li>
          <li>订单收入</li>
          <li>会员充值</li>
          <li>预收订金</li>
          <li>退订金</li>
        </ul>
        <div className="list-content">
          <MyScroll>
            {WorkingList.length !== 0 ? WorkingList.map((working, index) => {
              return <Working key={index} shiftStore={this.shiftStore} working={working} handleClick={this.clickworking.bind(this, working)} />
            }) : <div className="empty-holder">暂无数据</div>}
          </MyScroll>
        </div>
      </div>
      <div className="records-button">
        <div className="button-main">
          <div className="button-datil">
            <button className={classnames({
              "disabled": WorkingList.length === 0
            })} onClick={WorkingList.length > 0 && this.clickdetail} >交班详情</button>
          </div>
        </div>
      </div>
      {this.state.shiftdetail}
      {this.state.startcalendar}
      {this.state.endcalendar}
    </div>

  }
}

export default ShiftRecords;