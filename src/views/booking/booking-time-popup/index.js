/**
* @author gm
* @description 预定时间弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { Modal, Tabs, Alert, message } from 'antd';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';

import Scrollbars from 'react-custom-scrollbars';
import HorizontalDatePicker from './horizontal-datepicker';

import './booking_time_popup.less';

const TabPane = Tabs.TabPane;

message.config({
  top: 300
});
@inject('bookingStore')
@observer
class BookingTimePopup extends Component {
  constructor(props) {
    super(props);
    this.props.bookingStore.getMealsInfo(moment().format('YYYY-MM-DD'));
    this.state = {
      calendar: '',
      currentTime: '',
      alertPopup: '',
      submitTime: moment().format('YYYY-MM-DD')
    };
    this.props.bookingStore.activeTimeKey = 0;
  }

  jianClick = () => {
    if (this.state.currentTime) {
      this.props.bookingStore.timeJianClick();
    } else {
      message.destroy();
      message.info('请先选择时间', 1);
    }
  };
  jiaClick = () => {
    this.props.bookingStore.timeJiaClick();
  };

  tabClick = key => {
    this.setState({ currentTime: '' });
    this.props.bookingStore.timeTabClick(key);
  };

  handleOk = () => {
    if (this.state.currentTime) {
      let bookingStore = this.props.bookingStore;

      let mstartTime = moment(bookingStore.mealsDuration.startTime).format(
        'YYYY-MM-DD'
      );
      let mendTime = moment(bookingStore.mealsDuration.endTime).format(
        'YYYY-MM-DD'
      );

      let timeCurrent = moment(this.state.currentTime).format('YYYY-MM-DD');
      let timeSubmit = moment(this.state.submitTime).format('YYYY-MM-DD');

      let sTimes = this.state.currentTime.split(' ')[1].split(':');
      let startTime =
        sTimes[0] * 60 +
        sTimes[1] * 1 +
        bookingStore.mealsDuration.segmentLength * 1;
      let eTimes = moment(bookingStore.mealsDuration.endTime)
        .format('HH:mm')
        .split(':');

      let endTime;

      if (moment(mstartTime).isSame(mendTime)) {
        endTime = eTimes[0] * 60 + eTimes[1] * 1;
      } else {
        if (moment(timeSubmit).isBefore(timeCurrent)) {
          endTime = eTimes[0] * 60 + eTimes[1] * 1;
        } else {
          endTime = (eTimes[0] * 1 + 24) * 60 + eTimes[1] * 1;
        }
      }

      if (startTime <= endTime) {
        let lastDay = moment()
          .add(30, 'days')
          .format('YYYY-MM-DD');

        let currentDay = moment(this.state.currentTime + ':00').format(
          'YYYY-MM-DD'
        );

        if (moment(currentDay).isBefore(lastDay)) {
          bookingStore.selectTimeClick(this.state.currentTime + ':00');

          if (this.props.timeClick) {
            this.props.timeClick();
          }
        } else {
          message.destroy();
          message.info('只能预订一个月之内的', 1);
        }
      } else {
        message.destroy();
        message.info('已经超出预订的餐次,请减少就餐时长', 1);
      }
    } else {
      this.setState({
        alertPopup: (
          <Alert
            message="请选择餐段"
            banner
            closable
            onClose={() => {
              this.setState({ alertPopup: '' });
            }}
          />
        )
      });
    }
  };
  handleCancel = () => {
    if (this.props.handleCancel) {
      this.props.handleCancel();
    }
  };

  render() {
    let bookingStore = this.props.bookingStore;

    return (
      <div>
        <Modal
          visible={true}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          width={600}
          closable={false}
          wrapClassName="booking-time-popup-modal"
        >
          <HorizontalDatePicker
            dateClick={date => {
              this.setState({ currentTime: '' });
              this.setState({ submitTime: date });

              bookingStore.getMealsInfo(date);
              bookingStore.activeTimeKey = 0;
            }}
            calendarClick={time => {
              this.setState({ currentTime: '' });
              bookingStore.getMealsInfo(time);

              this.setState({ submitTime: time });
              bookingStore.activeTimeKey = 0;
            }}
          />
          <div className="booking-time-container">
            <div className="time-block">
              <div className="all-time-point">
                <Tabs
                  defaultActiveKey="0"
                  activeKey={bookingStore.activeTimeKey.toString()}
                  onTabClick={key => {
                    this.tabClick(key);
                  }}
                >
                  {bookingStore.mealsInfos.map((meal, index) => {
                    let timeItem = meal.rserveTimeList.map((time, mindex) => {
                      return (
                        <li
                          key={mindex}
                          className={classnames({
                            select: time === this.state.currentTime
                          })}
                          onClick={() => {
                            //初始化时长
                            bookingStore.timeTabClick(index);

                            this.setState({ currentTime: time });
                            this.setState({ alertPopup: '' });
                          }}
                        >
                          {moment(time).format('HH:mm')}
                        </li>
                      );
                    });
                    return (
                      <TabPane tab={meal.mealName} key={index}>
                        <Scrollbars>
                          <ul className="time-lis">{timeItem}</ul>
                        </Scrollbars>
                      </TabPane>
                    );
                  })}
                </Tabs>
              </div>

              <div className="duration">
                <p>就餐时长（单位：分钟）</p>
                <div>
                  <i
                    className="iconfont icon-jian"
                    onClick={() => {
                      this.jianClick();
                    }}
                  />
                  {bookingStore.mealsDuration.segmentLength}
                  <i
                    className="iconfont icon-jia"
                    onClick={() => {
                      //约定不能超过该餐段 选中时间+时长<餐段结束时间
                      if (this.state.currentTime) {
                        let mstartTime = moment(
                          bookingStore.mealsDuration.startTime
                        ).format('YYYY-MM-DD');
                        let mendTime = moment(
                          bookingStore.mealsDuration.endTime
                        ).format('YYYY-MM-DD');

                        let timeCurrent = moment(this.state.currentTime).format(
                          'YYYY-MM-DD'
                        );
                        let timeSubmit = moment(this.state.submitTime).format(
                          'YYYY-MM-DD'
                        );

                        let sTimes = this.state.currentTime
                          .split(' ')[1]
                          .split(':');
                        let startTime =
                          sTimes[0] * 60 +
                          sTimes[1] * 1 +
                          bookingStore.mealsDuration.segmentLength * 1;
                        let eTimes = moment(bookingStore.mealsDuration.endTime)
                          .format('HH:mm')
                          .split(':');

                        let endTime;

                        if (moment(mstartTime).isSame(mendTime)) {
                          endTime = eTimes[0] * 60 + eTimes[1] * 1;
                        } else {
                          if (moment(timeSubmit).isBefore(timeCurrent)) {
                            endTime = eTimes[0] * 60 + eTimes[1] * 1;
                          } else {
                            endTime = (eTimes[0] * 1 + 24) * 60 + eTimes[1] * 1;
                          }
                        }

                        if (startTime <= endTime - 15) {
                          this.jiaClick();
                        } else {
                          message.destroy();
                          message.info('已经超出预订的餐次', 1);
                        }
                      } else {
                        message.destroy();
                        message.info('请先选择时间', 1);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {this.state.alertPopup}
          </div>
        </Modal>
      </div>
    );
  }
}

export default BookingTimePopup;
