/**
* @author gm
* @description 预定界面
* @date 2017-05-15
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { message } from 'antd';
import classnames from 'classnames';
import { browserHistory } from 'react-router';
import moment from 'moment';
import CalendarPopup from 'components/calendar-popup';

import Scrollbars from 'react-custom-scrollbars';
import DeskListBlock from './desk-list-block';
import CustomerDetailBolck from './customer-detail-block';
import VerticalDatePicker from './vertacal-datepicker';

import './booking_index.less';

message.config({
  top: 300,
  duration: 0.1
});

@inject('bookingStore')
@observer
class Booking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current: -1,
      datePopup: '',
      currentTime: moment().format('YYYY-MM-DD')
    };

    this.props.bookingStore.getBookingList();
    this.props.bookingStore.initialReordItem();
  }

  componentDidUpdate() {
    let bookingStore = this.props.bookingStore;
    let feedback = bookingStore.feedback;

    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, bookingStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, bookingStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, bookingStore.closeFeedback());
      }
    }
  }

  calendarClick = () => {
    this.setState({
      datePopup: (
        <CalendarPopup
          minTime={new Date(moment().format('YYYY-MM-DD'))}
          calendarModalCancel={() => {
            this.setState({ datePopup: '' });
          }}
          calendarModalOk={time => {
            let bookingStore = this.props.bookingStore;
            //改变当前选中日期的值
            this.setState({ current: -1 });
            bookingStore.calendarModalOk(moment(time).format('YYYY-MM-DD'));
            this.setState({ currentTime: moment(time).format('YYYY-MM-DD') });
            this.setState({ datePopup: '' });
          }}
        />
      )
    });
  };

  render() {
    let bookingStore = this.props.bookingStore;
    let rightBlock;
    if (bookingStore.recordItem) {
      rightBlock = (
        <CustomerDetailBolck
          closeClick={() => {
            this.setState({ current: -1 });
            bookingStore.closeDetailClick();
          }}
        />
      );
    } else {
      rightBlock = <DeskListBlock />;
    }

    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let addReservation = permissionList.includes(
      'ReservationModule:AddReservation'
    ); //新增预订

    return (
      <div id="booking_index">
        <div className="date-block">
          <div
            className="search-btn"
            onClick={() => {
              browserHistory.push('/booking/search');
              bookingStore.bookingRecords = [];
            }}
          >
            <i className="iconfont icon-order_btn_search" />搜索
          </div>
          <div className="data-picker">
            <VerticalDatePicker
              currentTime={this.state.currentTime}
              dateClick={date => {
                this.setState({ current: -1 });
                //改变当前选中日期的值
                bookingStore.indexCurrentDate(
                  moment(date).format('YYYY-MM-DD')
                );
              }}
              todayClick={date => {
                this.setState({ current: -1 });
                //改变当前选中日期的值
                bookingStore.todayClick(moment(date).format('YYYY-MM-DD'));
              }}
            />
          </div>
          <div className="calendar-btn" onClick={this.calendarClick}>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />日历
          </div>
        </div>

        <div className="booking-list-block">
          <ul className="list-title">
            <li>序号</li>
            <li>客人</li>
            <li>预定时间</li>
            <li>人数</li>
            <li>桌台</li>
            <li>状态</li>
          </ul>
          <div className="list-content">
            <Scrollbars>
              {bookingStore.bookingRecords &&
              bookingStore.bookingRecords.length > 0 ? (
                bookingStore.bookingRecords.map((record, index) => {
                  let bookingTime = moment(record.bookingTime).format('HH:mm');
                  let bookingStatus;
                  switch (record.bookingStatus) {
                    case 617:
                      bookingStatus = '未知';
                      break;
                    case 618:
                      bookingStatus = '成功';
                      break;
                    case 619:
                      bookingStatus = '失败';
                      break;
                    case 620:
                      bookingStatus = '已过期';
                      break;
                    case 621:
                      bookingStatus = '已删除';
                      break;
                    case 622:
                      bookingStatus = '已改期';
                      break;
                    case 729:
                      bookingStatus = '已取消';
                      break;
                    case 759:
                      bookingStatus = '预订完成';
                      break;
                    case 762:
                      bookingStatus = '排队';
                      break;
                    case 1002:
                      bookingStatus = '进行中';
                      break;
                    case 1012:
                      bookingStatus = '待支付';
                      break;
                    default:
                      break;
                  }
                  return (
                    <div
                      key={index}
                      className={classnames({
                        item: true,
                        select: index === this.state.current
                      })}
                      onClick={() => {
                        this.setState({ current: index });

                        bookingStore.recordItemClick(record);
                      }}
                    >
                      <span>{index + 1}</span>
                      <span>{record.contact}</span>
                      <span>{bookingTime}</span>
                      <span>{record.peopleNum}</span>
                      <span>{record.tableCodes}</span>
                      <span>{bookingStatus}</span>
                    </div>
                  );
                })
              ) : (
                <div className="empty-holder">暂无预订记录</div>
              )}
            </Scrollbars>
          </div>

          {addReservation && (
            <div
              className="create-btn"
              onClick={() => {
                browserHistory.push('/booking/create');
              }}
            >
              创建预订
            </div>
          )}
        </div>
        <div className="dishes-block">{rightBlock}</div>

        {this.state.datePopup}
      </div>
    );
  }
}

export default Booking;
