/**
* @author gm
* @description 预定界面
* @date 2017-05-15
**/
import React, { Component } from 'react';
import { Link } from 'react-router';
import { inject, observer } from 'mobx-react';
import { message } from 'antd';
import moment from 'moment';
import Scrollbars from 'react-custom-scrollbars';
import CalendarPopup from 'components/calendar-popup';
import classnames from 'classnames';

import CustomerDetailBolck from './customer-detail-block';

import './booking_search.less';

@inject('bookingStore')
@observer
class BookingSearch extends Component {
  constructor(props) {
    super(props);
    this.props.bookingStore.initialReordItem(); //初始化recordItem和recordDetail和客情档案

    this.state = {
      stateAnimate: false,
      sourceAnimate: false,
      typeAnimate: false,
      personAnimate: false,
      timeAnimate: false,
      periodAnimate: false,
      calendarPopup: '',
      startTime: moment().format('YYYY-MM-DD'),
      endTime: moment().format('YYYY-MM-DD'),
      searchContent: '',
      status: '',
      source: '',
      type: '',
      person: '',
      time: '',
      period: '',
      current: 0,
      timeItem: ''
    };

    this.props.bookingStore.getQueryCondition();
    let search = {
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      search: ''
    };
    this.props.bookingStore.recordSearch(search);
  }

  handleOkClick = () => {
    this.setState({ current: 0 });
    let search = {
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      search: this.state.searchContent
    };
    this.setState({ status: '' });
    this.setState({ source: '' });
    this.setState({ type: '' });
    this.setState({ person: '' });
    this.setState({ time: '' });
    this.setState({ timeItem: '' });

    this.props.bookingStore.recordSearch(search);
  };

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

  render() {
    let bookingStore = this.props.bookingStore;

    return (
      <div id="booking_search">
        <div
          className={classnames({
            mask:
              this.state.stateAnimate ||
              this.state.sourceAnimate ||
              this.state.typeAnimate ||
              this.state.personAnimate ||
              this.state.timeAnimate ||
              this.state.periodAnimate
          })}
        >
          <div
            className={classnames({
              'slider-status': true,
              'slide-out': this.state.stateAnimate,
              'slide-in': !this.state.stateAnimate
            })}
          >
            <Scrollbars>
              <ul className="slide-list">
                {bookingStore.queryCondition.reservaManage &&
                  bookingStore.queryCondition.reservaManage.map(
                    (item, index) => {
                      return (
                        <li
                          className={classnames({
                            select: item.value === this.state.status
                          })}
                          key={item.value}
                          onClick={() => {
                            this.setState({ current: 0 });
                            bookingStore.btnItemClick(
                              this.state.startTime,
                              this.state.endTime,
                              this.state.searchContent,
                              item.value,
                              this.state.source,
                              this.state.type,
                              this.state.timeItem
                            );
                            this.setState({ stateAnimate: false });
                            this.setState({ status: item.value });
                          }}
                        >
                          {item.name}
                        </li>
                      );
                    }
                  )}
              </ul>
            </Scrollbars>
          </div>
          <div
            className={classnames({
              'slider-source': true,
              'slide-out': this.state.sourceAnimate,
              'slide-in': !this.state.sourceAnimate
            })}
          >
            <Scrollbars>
              <ul className="slide-list">
                {bookingStore.queryCondition.bookingChannel &&
                  bookingStore.queryCondition.bookingChannel.map(
                    (item, index) => {
                      return (
                        <li
                          className={classnames({
                            select: item.value === this.state.source
                          })}
                          key={item.value}
                          onClick={() => {
                            this.setState({ current: 0 });
                            bookingStore.btnItemClick(
                              this.state.startTime,
                              this.state.endTime,
                              this.state.searchContent,
                              this.state.status,
                              item.value,
                              this.state.type,
                              this.state.timeItem
                            );
                            this.setState({ sourceAnimate: false });
                            this.setState({ source: item.value });
                          }}
                        >
                          {item.name}
                        </li>
                      );
                    }
                  )}
              </ul>
            </Scrollbars>
          </div>
          <div
            className={classnames({
              'slider-type': true,
              'slide-out': this.state.typeAnimate,
              'slide-in': !this.state.typeAnimate
            })}
          >
            <Scrollbars>
              <ul className="slide-list">
                {bookingStore.queryCondition.bookingType &&
                  bookingStore.queryCondition.bookingType.map((item, index) => {
                    return (
                      <li
                        className={classnames({
                          select: item.value === this.state.type
                        })}
                        key={item.value}
                        onClick={() => {
                          this.setState({ current: 0 });
                          bookingStore.btnItemClick(
                            this.state.startTime,
                            this.state.endTime,
                            this.state.searchContent,
                            this.state.status,
                            this.state.source,
                            item.value,
                            this.state.timeItem
                          );
                          this.setState({ typeAnimate: false });
                          this.setState({ type: item.value });
                        }}
                      >
                        {item.name}
                      </li>
                    );
                  })}
              </ul>
            </Scrollbars>
          </div>
          {false && (
            <div
              className={classnames({
                'slider-person': true,
                'slide-out': this.state.personAnimate,
                'slide-in': !this.state.personAnimate
              })}
            >
              <Scrollbars>
                <ul className="slide-list" />
              </Scrollbars>
            </div>
          )}
          <div
            className={classnames({
              'slider-meal': true,
              'slide-out': this.state.timeAnimate,
              'slide-in': !this.state.timeAnimate
            })}
          >
            <Scrollbars>
              <ul className="slide-list">
                {bookingStore.queryCondition.mealsInfoList &&
                  bookingStore.queryCondition.mealsInfoList.map(
                    (item, index) => {
                      return (
                        <li
                          className={classnames({
                            select: item.mealsID === this.state.time
                          })}
                          key={index}
                          onClick={() => {
                            this.setState({ current: 0 });
                            bookingStore.btnItemClick(
                              this.state.startTime,
                              this.state.endTime,
                              this.state.searchContent,
                              this.state.status,
                              this.state.source,
                              this.state.type,
                              item
                            );
                            this.setState({ timeAnimate: false });
                            this.setState({ time: item.mealsID });
                            this.setState({ timeItem: item });
                          }}
                        >
                          {item.mealName}
                        </li>
                      );
                    }
                  )}
              </ul>
            </Scrollbars>
          </div>
          {false && (
            <div
              className={classnames({
                'slider-time': true,
                'slide-out': this.state.periodAnimate,
                'slide-in': !this.state.periodAnimate
              })}
            >
              <Scrollbars>
                <ul className="slide-list" />
              </Scrollbars>
            </div>
          )}
        </div>
        <div className="date-block">
          <Link to="/booking">返回列表</Link>
          <div
            className={classnames({
              select: this.state.stateAnimate
            })}
            onClick={() => {
              let state = !this.state.stateAnimate;
              this.setState({ stateAnimate: state });
              this.setState({ sourceAnimate: false });
              this.setState({ typeAnimate: false });
              this.setState({ personAnimate: false });
              this.setState({ timeAnimate: false });
              this.setState({ periodAnimate: false });
            }}
          >
            预订状态{' '}
            <i
              className={classnames({
                iconfont: true,
                'icon-home_title_arrow_left': this.state.stateAnimate,
                'icon-home_title_arrow_right': !this.state.stateAnimate
              })}
            />
          </div>
          <div
            className={classnames({
              select: this.state.sourceAnimate
            })}
            onClick={() => {
              let state = !this.state.sourceAnimate;
              this.setState({ sourceAnimate: state });

              this.setState({ stateAnimate: false });
              this.setState({ typeAnimate: false });
              this.setState({ personAnimate: false });
              this.setState({ timeAnimate: false });
              this.setState({ periodAnimate: false });
            }}
          >
            预订来源{' '}
            <i
              className={classnames({
                iconfont: true,
                'icon-home_title_arrow_left': this.state.sourceAnimate,
                'icon-home_title_arrow_right': !this.state.sourceAnimate
              })}
            />
          </div>
          <div
            className={classnames({
              select: this.state.typeAnimate
            })}
            onClick={() => {
              let state = !this.state.typeAnimate;
              this.setState({ typeAnimate: state });

              this.setState({ stateAnimate: false });
              this.setState({ sourceAnimate: false });
              this.setState({ personAnimate: false });
              this.setState({ timeAnimate: false });
              this.setState({ periodAnimate: false });
            }}
          >
            预订方式{' '}
            <i
              className={classnames({
                iconfont: true,
                'icon-home_title_arrow_left': this.state.typeAnimate,
                'icon-home_title_arrow_right': !this.state.typeAnimate
              })}
            />
          </div>
          {false && (
            <div
              className={classnames({
                select: this.state.personAnimate
              })}
              onClick={() => {
                let state = !this.state.personAnimate;
                this.setState({ personAnimate: state });

                this.setState({ stateAnimate: false });
                this.setState({ typeAnimate: false });
                this.setState({ sourceAnimate: false });
                this.setState({ timeAnimate: false });
                this.setState({ periodAnimate: false });
              }}
            >
              宴会类型{' '}
              <i
                className={classnames({
                  iconfont: true,
                  'icon-home_title_arrow_left': this.state.personAnimate,
                  'icon-home_title_arrow_right': !this.state.personAnimate
                })}
              />
            </div>
          )}
          <div
            className={classnames({
              select: this.state.timeAnimate
            })}
            onClick={() => {
              let state = !this.state.timeAnimate;
              this.setState({ timeAnimate: state });

              this.setState({ stateAnimate: false });
              this.setState({ typeAnimate: false });
              this.setState({ sourceAnimate: false });
              this.setState({ personAnimate: false });
              this.setState({ periodAnimate: false });
            }}
          >
            餐次{' '}
            <i
              className={classnames({
                iconfont: true,
                'icon-home_title_arrow_left': this.state.timeAnimate,
                'icon-home_title_arrow_right': !this.state.timeAnimate
              })}
            />
          </div>
          {false && (
            <div
              className={classnames({
                select: this.state.periodAnimate
              })}
              onClick={() => {
                let state = !this.state.periodAnimate;
                this.setState({ periodAnimate: state });

                this.setState({ stateAnimate: false });
                this.setState({ typeAnimate: false });
                this.setState({ sourceAnimate: false });
                this.setState({ personAnimate: false });
                this.setState({ timeAnimate: false });
              }}
            >
              餐段{' '}
              <i
                className={classnames({
                  iconfont: true,
                  'icon-home_title_arrow_left': this.state.periodAnimate,
                  'icon-home_title_arrow_right': !this.state.periodAnimate
                })}
              />
            </div>
          )}
        </div>
        <div className="booking-list-block">
          <div className="search-top">
            <input
              type="text"
              className="date-input"
              value={this.state.startTime}
              onClick={() => {
                this.setState({
                  calendarPopup: (
                    <CalendarPopup
                      calendarModalCancel={() => {
                        this.setState({ calendarPopup: '' });
                      }}
                      calendarModalOk={time => {
                        this.setState({ startTime: time });
                        this.setState({ calendarPopup: '' });
                      }}
                    />
                  )
                });
              }}
              readOnly
            />
            <div>至</div>
            <input
              type="text"
              className="date-input"
              value={this.state.endTime}
              onClick={() => {
                this.setState({
                  calendarPopup: (
                    <CalendarPopup
                      calendarModalCancel={() => {
                        this.setState({ calendarPopup: '' });
                      }}
                      calendarModalOk={time => {
                        this.setState({ endTime: time });
                        this.setState({ calendarPopup: '' });
                      }}
                    />
                  )
                });
              }}
              readOnly
            />
            <input
              type="text"
              className="search"
              placeholder="客人、电话、桌台"
              value={this.state.searchContent}
              onChange={e => {
                this.setState({ searchContent: e.target.value });
              }}
            />
            <div
              className="button"
              onClick={() => {
                this.handleOkClick();
              }}
            >
              <i className="iconfont icon-order_btn_search" />搜索
            </div>
          </div>
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
              {bookingStore.searchRecords &&
              bookingStore.searchRecords.length > 0 ? (
                bookingStore.searchRecords.map((record, index) => {
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
        </div>
        <div className="info-block">
          {bookingStore.searchRecords &&
          bookingStore.searchRecords.length > 0 ? (
            <CustomerDetailBolck
              recordDetail={bookingStore.recordDetail}
              isClose={true}
            />
          ) : (
            <div className="empty-holder">暂无预订详情</div>
          )}
        </div>

        {this.state.calendarPopup}
      </div>
    );
  }
}

export default BookingSearch;
