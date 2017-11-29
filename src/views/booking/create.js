/**
* @author gm
* @description 创建预订界面
* @date 2017-05-15
**/
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { inject, observer } from 'mobx-react';
import { Tabs, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';
import Loading from 'components/loading';

import CustomerArchiveBlock from './customer-archive-block';
import PayReceiptPopup from './payment-receipt-popup';
import BookingTimePopup from './booking-time-popup';
import BookingDishesPopup from './more-booking-dishes-popup';

import './booking_create.less';
const TabPane = Tabs.TabPane;

message.config({
  top: 300
});

@inject('bookingStore', 'appStore')
@observer
class CreateBooking extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      datePopup: '',
      loading: ''
    };

    this.props.bookingStore.initialArchives(); //初始化档案详情
    this.props.bookingStore.queryRefundRule(616); //查询退款规则 616普通预订
  }

  render() {
    let bookingStore = this.props.bookingStore;
    let receiptPopup;
    if (bookingStore.isShowReceiptPopup) {
      receiptPopup = (
        <PayReceiptPopup
          okClick={() => {
            bookingStore.receiptPopupClick();
            browserHistory.push('/booking');
          }}
        />
      );
    }

    let gendarBtnTexts = ['先生', '女士'];
    let gendarBlock = gendarBtnTexts.map((gendar, index) => {
      return (
        <span
          key={index}
          className={classnames({
            select: index === bookingStore.currentGender
          })}
          onClick={() => {
            let result;
            bookingStore.currentGender = index;

            switch (gendar) {
              case '先生':
                result = 2;
                break;
              case '女士':
                result = 3;
                break;
              default:
                break;
            }
            bookingStore.gendarClick(result);
          }}
        >
          {gendar}
        </span>
      );
    });

    let reverseStylesText = [
      '预订点菜（预点菜并支付，保留预订桌台及菜品）',
      '预订留位（支付预订桌位费用，保留预订桌台）',
      '普通预订（无需支付任何费用，过期自动作废）'
    ];

    let reverseBlock = reverseStylesText.map((reverse, index) => {
      return (
        <li key={index}>
          <span
            className="radioBtn"
            onClick={() => {
              let bookingType;
              switch (index) {
                case 0:
                  bookingType = 614;
                  break;
                case 1:
                  bookingType = 615;
                  break;
                case 2:
                  bookingType = 616;
                  break;
                default:
                  break;
              }
              if (index === 1) {
                if (
                  bookingStore.bookingMessage.peopleNum === '' ||
                  bookingStore.bookingMessage.tableIDs.length === 0
                ) {
                  message.destroy();
                  message.info('请先填基本信息', 2);
                } else {
                  this.props.bookingStore.currentStyleIndex = index;
                  bookingStore.styleClick(bookingType);
                }
              } else {
                this.props.bookingStore.currentStyleIndex = index;
                bookingStore.styleClick(bookingType);
              }
            }}
          >
            {index === this.props.bookingStore.currentStyleIndex ? (
              <i className="iconfont icon-icon_checkbox_sel" />
            ) : (
              <i className="iconfont icon-yuan" />
            )}
          </span>
          {reverse}
        </li>
      );
    });

    let confirmBtnBlock;

    switch (bookingStore.currentStyleIndex) {
      case 0:
        confirmBtnBlock = (
          <div
            className="select"
            onClick={() => {
              //拦截开班
              let appStore = this.props.appStore;
              appStore.isInWorking({
                success: () => {
                  bookingStore.submitClick(614);
                }
              });
            }}
          >
            下一步(点菜)
          </div>
        );
        break;
      case 1:
        confirmBtnBlock = (
          <div
            className="select"
            onClick={() => {
              //拦截开班
              let appStore = this.props.appStore;
              appStore.isInWorking({
                success: () => {
                  bookingStore.submitClick(
                    615,
                    () => {
                      this.setState({ loading: '' });
                    },
                    () => {
                      this.setState({ loading: <Loading /> });
                    }
                  );
                }
              });
            }}
          >
            下一步(留位金：￥{this.props.bookingStore.leaveDeskMoney})
          </div>
        );
        break;
      case 2:
        confirmBtnBlock = (
          <div
            className="select"
            onClick={() => {
              bookingStore.submitClick(
                616,
                () => {
                  this.setState({ loading: '' });
                },
                () => {
                  this.setState({ loading: <Loading /> });
                }
              );
            }}
          >
            确定预订
          </div>
        );
        break;
      default:
        break;
    }

    let state = this.props.location.state;
    this.props.location.state = null;

    let moreDishesPopup;
    if (bookingStore.isMoreDishesPopup) {
      moreDishesPopup = <BookingDishesPopup cart={state ? state.cart : ''} />;
    }

    return (
      <div id="booking_create">
        <div className="create-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              //返回预定界面
              bookingStore.createGoBack();
            }}
          />创建预订
        </div>
        <div className="create-container">
          <div className="create-info-block">
            <Scrollbars>
              <ul className="info-content">
                <li>
                  <div className="name">
                    <i>*</i>电话号码：
                  </div>
                  <input
                    type="text"
                    value={bookingStore.bookingMessage.phone}
                    onChange={e => {
                      if (
                        e.target.value.length <= 11 &&
                        /^\d*$/.test(e.target.value)
                      ) {
                        bookingStore.phoneOnChange(e.target.value);
                      }
                    }}
                  />
                  <div className="error-block">
                    {bookingStore.errorText.errorPhone}
                  </div>
                </li>
                <li>
                  <div className="name">
                    <i>*</i>预 订 人：
                  </div>
                  <input
                    type="text"
                    value={bookingStore.bookingMessage.contact}
                    onChange={e => {
                      if (e.target.value.length <= 20) {
                        bookingStore.contactOnChange(e.target.value);
                      }
                    }}
                  />
                  <div className="error-block">
                    {bookingStore.errorText.errorContact}
                  </div>
                  <div className="person-btns">
                    {gendarBlock}
                    <div className="error-gendar">
                      {bookingStore.errorText.errorGendar}
                    </div>
                  </div>
                </li>
                <li>
                  <div className="name">
                    <i>*</i>预订时间：
                  </div>
                  <input
                    type="text"
                    value={bookingStore.bookingMessage.bookingTime}
                    readOnly
                    onClick={() => {
                      this.setState({
                        datePopup: (
                          <BookingTimePopup
                            timeClick={() => {
                              this.setState({ datePopup: '' });
                            }}
                            handleCancel={() => {
                              this.setState({ datePopup: '' });
                            }}
                          />
                        )
                      });
                    }}
                  />
                  <div className="error-block">
                    {bookingStore.errorText.errorTime}
                  </div>
                </li>
                <li>
                  <div className="name">
                    <i>*</i>人数：
                  </div>
                  <input
                    type="text"
                    value={bookingStore.bookingMessage.peopleNum}
                    onChange={e => {
                      if (
                        /^\d*$/.test(e.target.value) &&
                        e.target.value <= 999
                      ) {
                        bookingStore.numberOnChange(e.target.value);
                      }
                    }}
                  />
                  <div className="error-block">
                    {bookingStore.errorText.errorNumber}
                  </div>
                </li>
                <li>
                  <div className="name">
                    <i>*</i>预订桌台：
                  </div>
                  <input
                    type="text"
                    value={bookingStore.createTableNames.toString()}
                    readOnly
                    onClick={() => {
                      //如果没选择时间  定位到选择时间
                      if (!bookingStore.bookingMessage.bookingTime) {
                        message.destroy();
                        message.info('请先选择预订时间', 1, () => {
                          this.setState({
                            datePopup: (
                              <BookingTimePopup
                                handleCancel={() => {
                                  this.setState({ datePopup: '' });
                                }}
                                timeClick={() => {
                                  this.setState({ datePopup: '' });
                                }}
                              />
                            )
                          });
                        });
                      } else {
                        //如果tableIDs长度为0
                        if (bookingStore.bookingMessage.tableIDs.length === 0) {
                          bookingStore.selectDeskClick();
                        }
                      }
                    }}
                  />
                  <div className="error-block">
                    {bookingStore.errorText.errorDesk}
                  </div>
                </li>
                <li className="remarks">
                  <div className="name">备注：</div>
                  <textarea
                    onChange={e => {
                      if (e.target.value.length <= 200) {
                        bookingStore.remarksOnChange(e.target.value);
                      }
                    }}
                    value={bookingStore.bookingMessage.memo}
                  />
                </li>
                <li className="booking-styles">
                  <div className="name">
                    <i>*</i>预订方式：
                  </div>
                  <ul>{reverseBlock}</ul>
                </li>
                <li className="message">{bookingStore.createRefundMeg}</li>
              </ul>
            </Scrollbars>
            <div className="info-btns">
              <div
                onClick={() => {
                  bookingStore.cancelCreateBooking();
                }}
              >
                取消
              </div>
              {confirmBtnBlock}
            </div>
          </div>
          <div className="create-tabs-block">
            <Tabs
              defaultActiveKey="0"
              activeKey={bookingStore.createCurrentTab.toString()}
              onTabClick={key => {
                bookingStore.topTabClick(key);
              }}
            >
              <TabPane tab="客情档案" key="0">
                <div className="archive">
                  {bookingStore.customerArchives.memberInfo ? (
                    <CustomerArchiveBlock
                      customerArchives={bookingStore.customerArchives}
                    />
                  ) : (
                    <div className="empty-holder">暂无档案</div>
                  )}
                </div>
              </TabPane>
              <TabPane tab="预订选台" key="1">
                <div className="select-desk">
                  <div className="preference">
                    <p>客人的选桌偏好：</p>
                    <div>{bookingStore.preferenceTables.toString()}</div>
                  </div>
                  <div className="content">
                    <Tabs
                      defaultActiveKey="0"
                      activeKey={bookingStore.secondTabKey.toString()}
                      onTabClick={key => {
                        bookingStore.getMayBookingTableList(
                          key,
                          bookingStore.createAreaIDs[key]
                        );
                      }}
                    >
                      {bookingStore.createAreaIDs.map((area, index) => {
                        return (
                          <TabPane tab={area.areaName} key={index}>
                            <Scrollbars>
                              <ul className="all-item">
                                {bookingStore.mayBookingTableList.map(
                                  (table, mindex) => {
                                    return (
                                      <li
                                        key={mindex}
                                        className={classnames({
                                          'desk-item': true,
                                          select: table.select,
                                          iconfont: true
                                        })}
                                        onClick={() => {
                                          let select = table.select;
                                          table.select = !select;

                                          bookingStore.mayBookingItemClick();
                                        }}
                                      >
                                        <p
                                          className={classnames({
                                            big: table.tableName.length < 10,
                                            small: table.tableName.length >= 10
                                          })}
                                        >
                                          {table.tableName}
                                        </p>
                                        <div>{table.defaultPerson}人桌</div>
                                      </li>
                                    );
                                  }
                                )}
                              </ul>
                            </Scrollbars>
                          </TabPane>
                        );
                      })}
                    </Tabs>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
        {moreDishesPopup}
        {receiptPopup}
        {this.state.datePopup}
        {this.state.loading}
      </div>
    );
  }
}

CreateBooking.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default CreateBooking;
