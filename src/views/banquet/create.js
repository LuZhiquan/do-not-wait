/**
* @author William Cui
* @description 宴会创建预定界面
* @date 2017-06-27
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';
import { message } from 'antd';

import TimePicker from './time-picker';
import CalendarPopup from 'components/calendar-popup';
import SelectDesk from './select-desk-popup';
import BanquetTypePopup from './banquet-type-popup';

import { Menu, Dropdown, Icon, Switch } from 'antd';
import './banquet_create.less';

message.config({
  top: 300
});

@inject('banquetCreateStore')
@observer
class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calendarPopup: '',
      selectDesk: '',
      typePopup: ''
    };

    let { location, banquetCreateStore } = this.props;
    banquetCreateStore.clearError();

    if (location.state && location.state.cart) {
      banquetCreateStore.moreGetDishes(location.state.cart);
    }

    if (location.state && location.state.from === 'modify') {
    } else {
      banquetCreateStore.getBanquetTypeList(() => {
        banquetCreateStore.currentBanquetType =
          banquetCreateStore.banquetTypeList[0];
      });
    }
  }

  //多种类型下一步
  createNextClick = () => {
    let { banquetCreateStore } = this.props;
    banquetCreateStore.moreToDishesList();
  };
  //修改下一步
  modifyNextClick = () => {
    let { banquetCreateStore, location } = this.props;

    let bookingID = location.state.bookingID;
    banquetCreateStore.modifyNextClick(bookingID);
  };

  //单种类型跳到点菜界面
  toDishes = () => {
    let { banquetCreateStore } = this.props;
    banquetCreateStore.toDishes();
  };
  //switch切换
  switchClick = () => {
    let { banquetCreateStore } = this.props;

    let isMoreType = !banquetCreateStore.isMoreType;

    banquetCreateStore.switchClick(isMoreType);
  };

  render() {
    let { banquetCreateStore, location } = this.props;

    const menu = (
      <Menu
        id="banquet_menu"
        onClick={({ key }) => {
          banquetCreateStore.typeDownClick(key);
        }}
      >
        {banquetCreateStore.banquetTypeList.length > 0 &&
          banquetCreateStore.banquetTypeList.map((type, index) => {
            return <Menu.Item key={index}>{type.typeName}</Menu.Item>;
          })}
      </Menu>
    );

    return (
      <div id="banquet_create">
        <div className="create-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              banquetCreateStore.createGoBack();
            }}
          />
          {location.state &&
          location.state.from &&
          location.state.from === 'modify'
            ? '修改预订'
            : '新建预订'}
        </div>
        <div className="create-container">
          <Scrollbars id="scroll">
            <div className="main">
              <div className="main-left">
                <div className="item">
                  <div className="xing">*</div>
                  <div className="common-title">客户姓名</div>
                  <input
                    type="text"
                    className="commom-input"
                    value={banquetCreateStore.banquetMessage.customerName}
                    onChange={e => {
                      if (e.target.value.length <= 30) {
                        //客户姓名onChange事件
                        banquetCreateStore.changeCustomer(e.target.value);
                      }
                    }}
                  />
                  {['先生', '女士'].map((gendar, index) => {
                    return (
                      <div
                        key={index}
                        className={classnames({
                          gendar: true,
                          select:
                            index ===
                            banquetCreateStore.banquetMessage.gendar - 2
                        })}
                        onClick={() => {
                          banquetCreateStore.gendarClick(index);
                        }}
                      >
                        {gendar}
                      </div>
                    );
                  })}
                  <div className="error">
                    {banquetCreateStore.error.customerError}
                  </div>
                </div>
                <div className="item">
                  <div className="xing">*</div>
                  <div className="common-title">电话号码</div>
                  <input
                    type="text"
                    className="commom-input"
                    value={banquetCreateStore.banquetMessage.phone}
                    onChange={e => {
                      if (/^\d{0,11}$/.test(e.target.value)) {
                        //电话号码onChang事件
                        banquetCreateStore.changePhone(e.target.value);
                      }
                    }}
                  />
                  <div className="error">
                    {banquetCreateStore.error.phoneError}
                  </div>
                </div>
                <div className="item">
                  <div className="xing">*</div>
                  <div className="common-title">宴会名称</div>
                  <input
                    type="text"
                    className="commom-input"
                    value={banquetCreateStore.banquetMessage.partyName}
                    onChange={e => {
                      if (e.target.value.length <= 30) {
                        banquetCreateStore.changePartyName(e.target.value);
                      }
                    }}
                  />
                  <div className="error">
                    {banquetCreateStore.error.partyNameError}
                  </div>
                </div>
                <div className="item">
                  <div className="xing">*</div>
                  <div className="common-title">宴会类型</div>
                  <Dropdown overlay={menu} trigger={['click']}>
                    <div className="common-button">
                      {banquetCreateStore.currentBanquetType &&
                        banquetCreateStore.currentBanquetType.typeName}
                      <Icon type="down" />
                    </div>
                  </Dropdown>
                </div>
                <div className="item">
                  <div className="xing">*</div>
                  <div className="common-title">宴会时间</div>
                  <div
                    className="calendar"
                    onClick={() => {
                      if (
                        !(
                          location.state &&
                          location.state.from &&
                          location.state.from === 'modify'
                        )
                      ) {
                        this.setState({
                          calendarPopup: (
                            <CalendarPopup
                              defaultTime={
                                new Date(
                                  banquetCreateStore.banquetMessage.bookingTime.split(
                                    ' '
                                  )[0]
                                )
                              }
                              calendarModalCancel={() => {
                                this.setState({ calendarPopup: '' });
                              }}
                              calendarModalOk={newDate => {
                                this.setState({ calendarPopup: '' });
                                banquetCreateStore.calendarClick(newDate);
                              }}
                            />
                          )
                        });
                      }
                    }}
                  >
                    <input
                      type="text"
                      className="commom-input"
                      value={
                        banquetCreateStore.banquetMessage.bookingTime.split(
                          ' '
                        )[0]
                      }
                      readOnly
                    />
                    <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
                  </div>
                  <TimePicker
                    hourChange={hour => {
                      banquetCreateStore.changeBookingHour(hour);
                    }}
                    minuteChange={minute => {
                      banquetCreateStore.changeBookingMinute(minute);
                    }}
                    defaultHour={
                      banquetCreateStore.banquetMessage.bookingTime
                        .split(' ')[1]
                        .split(':')[0]
                    }
                    defaultMinute={
                      banquetCreateStore.banquetMessage.bookingTime
                        .split(' ')[1]
                        .split(':')[1]
                    }
                    open={
                      !(
                        location.state &&
                        location.state.from &&
                        location.state.from === 'modify'
                      )
                    }
                  />
                </div>
                <div className="item">
                  <div className="xing">*</div>
                  <div className="common-title">开席时间</div>
                  <TimePicker
                    hourChange={hour => {
                      banquetCreateStore.changeOpenHour(hour);
                    }}
                    minuteChange={minute => {
                      banquetCreateStore.changeOpenMinute(minute);
                    }}
                    defaultHour={
                      banquetCreateStore.banquetMessage.openTime.split(':')[0]
                    }
                    defaultMinute={
                      banquetCreateStore.banquetMessage.openTime.split(':')[1]
                    }
                    open={
                      !(
                        location.state &&
                        location.state.from &&
                        location.state.from === 'modify'
                      )
                    }
                  />
                  <div className="common-title ml40">预计用时</div>
                  {location.state &&
                  location.state.from &&
                  location.state.from === 'modify' ? (
                    <input
                      type="text"
                      className="small-input ml0 bg-gray"
                      readOnly
                      value={banquetCreateStore.banquetMessage.duration}
                    />
                  ) : (
                    <input
                      type="text"
                      className="small-input ml0"
                      value={banquetCreateStore.banquetMessage.duration}
                      onChange={e => {
                        if (/^\d*\.{0,1}\d*$/.test(e.target.value)) {
                          banquetCreateStore.changeDuration(e.target.value);
                        }
                      }}
                    />
                  )}
                  <span className="hour">h</span>

                  <div className="error">
                    {banquetCreateStore.error.durationError}
                  </div>
                </div>
                <div className="item">
                  <div className="xing">*</div>
                  <div className="common-title input-search iconfont">占用桌台</div>
                  <input
                    type="text"
                    className="commom-input"
                    readOnly
                    value={
                      banquetCreateStore.selectDesk.length
                        ? '已选' + banquetCreateStore.selectDesk.length + '桌'
                        : ''
                    }
                    onClick={() => {
                      banquetCreateStore.selecDeskClick();

                      if (banquetCreateStore.banquetMessage.duration) {
                        let bookingID;
                        if (
                          location.state &&
                          location.state.from === 'modify'
                        ) {
                          bookingID = location.state.bookingID;
                        } else {
                          bookingID = '';
                        }
                        this.setState({
                          selectDesk: (
                            <SelectDesk
                              bookingID={bookingID}
                              handleCancel={() => {
                                this.setState({ selectDesk: '' });
                              }}
                              handleOk={() => {
                                if (
                                  banquetCreateStore.selectDesk.length === 0
                                ) {
                                  message.destroy();
                                  message.warn('请选择占用桌台', 1);
                                } else {
                                  this.setState({ selectDesk: '' });
                                }
                              }}
                            />
                          )
                        });
                      } else {
                        message.destroy();
                        message.warn('请先选择宴会时间和预计用时', 1);
                      }
                    }}
                  />
                  <div className="error">
                    {banquetCreateStore.error.deskError}
                  </div>
                </div>
              </div>
              <div className="main-right">
                <div className="item">
                  <div className="common-title ml12">预订说明</div>
                  <textarea
                    className="lg-textarea"
                    value={banquetCreateStore.banquetMessage.bookingMemo}
                    onChange={e => {
                      banquetCreateStore.changeBookingMemo(e.target.value);
                    }}
                  />
                </div>

                <div className="item">
                  <div className="common-title ml12">场地布置</div>
                  <input
                    type="text"
                    className="lg-input"
                    value={banquetCreateStore.banquetMessage.layoutSite}
                    onChange={e => {
                      banquetCreateStore.changeLayoutSite(e.target.value);
                    }}
                  />
                </div>
                <div className="item">
                  <div className="common-title ml12">摆台要求</div>
                  <input
                    type="text"
                    className="lg-input"
                    value={banquetCreateStore.banquetMessage.dressTable}
                    onChange={e => {
                      banquetCreateStore.changeDressTable(e.target.value);
                    }}
                  />
                </div>
                <div className="item">
                  <div className="common-title ml12">音响要求</div>
                  <input
                    type="text"
                    className="lg-input"
                    value={banquetCreateStore.banquetMessage.audio}
                    onChange={e => {
                      banquetCreateStore.changeAudio(e.target.value);
                    }}
                  />
                </div>
                <div className="item">
                  <div className="common-title ml12">临时桌数</div>
                  <input
                    type="text"
                    className="lg-input"
                    value={banquetCreateStore.banquetMessage.tempNum}
                    onChange={e => {
                      if (/^\d*$/.test(e.target.value)) {
                        banquetCreateStore.changeTempNum(e.target.value);
                      }
                    }}
                  />
                </div>
              </div>

              {location.state &&
              location.state.from &&
              location.state.from === 'modify' ? (
                <div
                  className={classnames({
                    height242: banquetCreateStore.isMoreType,
                    popover: true
                  })}
                >
                  <div className="m-po-title">
                    {banquetCreateStore.isMoreType ? (
                      <div className="po-left">
                        <div className="item ml40">
                          <div className="xing">*</div>
                          <div className="common-title ml0">预订桌数</div>
                          <input
                            type="text"
                            className="small-input bg-gray"
                            value={
                              banquetCreateStore.allBookingNum
                                ? banquetCreateStore.allBookingNum
                                : ''
                            }
                            readOnly
                          />
                        </div>
                        <div className="item ml40">
                          <div className="common-title ml0">备用桌数</div>
                          <input
                            type="text"
                            className="small-input ml0 bg-gray"
                            value={
                              banquetCreateStore.allBackUpNum
                                ? banquetCreateStore.allBackUpNum
                                : ''
                            }
                            readOnly
                          />
                        </div>
                        <div className="modify-error">
                          {banquetCreateStore.error.modifyError}
                        </div>
                      </div>
                    ) : (
                      <div className="po-left">
                        <div className="item ml40">
                          <div className="xing">*</div>
                          <div className="common-title ml0">预订桌数</div>
                          <input
                            type="text"
                            className="small-input"
                            value={banquetCreateStore.tTypes[0].bookingNum}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                banquetCreateStore.changeBookingNum(
                                  e.target.value,
                                  0
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="item ml40">
                          <div className="common-title ml0">备用桌数</div>
                          <input
                            type="text"
                            className="small-input ml0"
                            value={banquetCreateStore.tTypes[0].backupNum}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                banquetCreateStore.changeBackupNum(
                                  e.target.value,
                                  0
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="item ml40">
                          <div className="xing">*</div>
                          <div className="common-title ml0">每桌人数</div>
                          <input
                            type="text"
                            className="small-input ml0"
                            value={banquetCreateStore.tTypes[0].peopleNum}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                banquetCreateStore.changePeopleNum(
                                  e.target.value,
                                  0
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="modify-error">
                          {banquetCreateStore.error.modifyError}
                        </div>
                      </div>
                    )}
                  </div>

                  {banquetCreateStore.isMoreType && (
                    <div className="m-po-content">
                      <div className="popover-content">
                        <Scrollbars>
                          {banquetCreateStore.tTypes.map((type, typeIndex) => {
                            return (
                              <div className="popover-item" key={typeIndex}>
                                <div className="item ml40 mt20">
                                  <div className="xing">*</div>
                                  <div className="common-title ml0">类型名称</div>
                                  <input
                                    type="text"
                                    className="small-input ml0"
                                    value={
                                      banquetCreateStore.tTypes[typeIndex]
                                        .typeName
                                    }
                                    onChange={e => {
                                      banquetCreateStore.changeTypeName(
                                        e.target.value,
                                        typeIndex
                                      );
                                    }}
                                  />
                                </div>
                                <div className="item ml40 mt20">
                                  <div className="xing">*</div>
                                  <div className="common-title ml0">预订桌数</div>
                                  <input
                                    type="text"
                                    className="small-input ml0"
                                    value={
                                      banquetCreateStore.tTypes[typeIndex]
                                        .bookingNum
                                    }
                                    onChange={e => {
                                      if (/^\d*$/.test(e.target.value)) {
                                        banquetCreateStore.changeBookingNum(
                                          e.target.value,
                                          typeIndex
                                        );
                                      }
                                    }}
                                  />
                                </div>
                                <div className="item ml40 mt20">
                                  <div className="common-title ml0">备用桌数</div>
                                  <input
                                    type="text"
                                    className="small-input ml0"
                                    value={
                                      banquetCreateStore.tTypes[typeIndex]
                                        .backupNum
                                    }
                                    onChange={e => {
                                      if (/^\d*$/.test(e.target.value)) {
                                        banquetCreateStore.changeBackupNum(
                                          e.target.value,
                                          typeIndex
                                        );
                                      }
                                    }}
                                  />
                                </div>
                                <div className="item ml40 mt20">
                                  <div className="xing">*</div>
                                  <div className="common-title ml0">每桌人数</div>
                                  <input
                                    type="text"
                                    className="small-input ml0"
                                    value={
                                      banquetCreateStore.tTypes[typeIndex]
                                        .peopleNum
                                    }
                                    onChange={e => {
                                      if (/^\d*$/.test(e.target.value)) {
                                        banquetCreateStore.changePeopleNum(
                                          e.target.value,
                                          typeIndex
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </Scrollbars>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={classnames({
                    height242: banquetCreateStore.isMoreType,
                    popover: true
                  })}
                >
                  <div className="m-po-title">
                    {banquetCreateStore.isMoreType ? (
                      <div className="po-left">
                        <div className="item ml40">
                          <div className="xing">*</div>
                          <div className="common-title ml0">预订桌数</div>
                          <input
                            type="text"
                            className="small-input bg-gray"
                            value={
                              banquetCreateStore.allBookingNum
                                ? banquetCreateStore.allBookingNum
                                : ''
                            }
                            readOnly
                          />
                        </div>
                        <div className="item ml40">
                          <div className="common-title ml0">备用桌数</div>
                          <input
                            type="text"
                            className="small-input ml0 bg-gray"
                            value={
                              banquetCreateStore.allBackUpNum
                                ? banquetCreateStore.allBackUpNum
                                : ''
                            }
                            readOnly
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="po-left">
                        <div className="item ml40">
                          <div className="xing">*</div>
                          <div className="common-title ml0">预订桌数</div>
                          <input
                            type="text"
                            className="small-input"
                            value={banquetCreateStore.tTypes[0].bookingNum}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                banquetCreateStore.changeBookingNum(
                                  e.target.value,
                                  0
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="item ml40">
                          <div className="common-title ml0">备用桌数</div>
                          <input
                            type="text"
                            className="small-input ml0"
                            value={banquetCreateStore.tTypes[0].backupNum}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                banquetCreateStore.changeBackupNum(
                                  e.target.value,
                                  0
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="item ml40">
                          <div className="xing">*</div>
                          <div className="common-title ml0">每桌人数</div>
                          <input
                            type="text"
                            className="small-input ml0"
                            value={banquetCreateStore.tTypes[0].peopleNum}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                banquetCreateStore.changePeopleNum(
                                  e.target.value,
                                  0
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="single-error">
                          {banquetCreateStore.error.singleError}
                        </div>
                      </div>
                    )}

                    <div className="po-right">
                      <div className="common-title ml40">设置桌台类型</div>
                      <Switch
                        checkedChildren={'开'}
                        unCheckedChildren={'关'}
                        size="default"
                        checked={banquetCreateStore.isMoreType}
                        onChange={() => {
                          this.switchClick();
                        }}
                      />
                    </div>
                  </div>

                  {banquetCreateStore.isMoreType && (
                    <div className="m-po-content">
                      <div className="popover-content">
                        <Scrollbars>
                          {banquetCreateStore.tTypes.length > 0 &&
                            banquetCreateStore.tTypes.map((type, typeIndex) => {
                              return (
                                <div className="popover-item" key={typeIndex}>
                                  <div className="item ml40 mt20">
                                    <div className="xing">*</div>
                                    <div className="common-title ml0">类型名称</div>
                                    <input
                                      type="text"
                                      className="small-input ml0"
                                      value={
                                        banquetCreateStore.tTypes[typeIndex]
                                          .typeName
                                      }
                                      onChange={e => {
                                        banquetCreateStore.changeTypeName(
                                          e.target.value,
                                          typeIndex
                                        );
                                      }}
                                    />
                                  </div>
                                  <div className="item ml40 mt20">
                                    <div className="xing">*</div>
                                    <div className="common-title ml0">预订桌数</div>
                                    <input
                                      type="text"
                                      className="small-input ml0"
                                      value={
                                        banquetCreateStore.tTypes[typeIndex]
                                          .bookingNum
                                      }
                                      onChange={e => {
                                        if (/^\d*$/.test(e.target.value)) {
                                          banquetCreateStore.changeBookingNum(
                                            e.target.value,
                                            typeIndex
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="item ml40 mt20">
                                    <div className="common-title ml0">备用桌数</div>
                                    <input
                                      type="text"
                                      className="small-input ml0"
                                      value={
                                        banquetCreateStore.tTypes[typeIndex]
                                          .backupNum
                                      }
                                      onChange={e => {
                                        if (/^\d*$/.test(e.target.value)) {
                                          banquetCreateStore.changeBackupNum(
                                            e.target.value,
                                            typeIndex
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="item ml40 mt20">
                                    <div className="xing">*</div>
                                    <div className="common-title ml0">每桌人数</div>
                                    <input
                                      type="text"
                                      className="small-input ml0"
                                      value={
                                        banquetCreateStore.tTypes[typeIndex]
                                          .peopleNum
                                      }
                                      onChange={e => {
                                        if (/^\d*$/.test(e.target.value)) {
                                          banquetCreateStore.changePeopleNum(
                                            e.target.value,
                                            typeIndex
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                  <div
                                    className="small-btn mt20"
                                    onClick={() => {
                                      banquetCreateStore.moreDishesClick(
                                        typeIndex,
                                        type.cart
                                      );
                                    }}
                                  >
                                    {banquetCreateStore.isMoreType &&
                                    type.cart &&
                                    type.cart.shoppingCart.length > 0
                                      ? '已点' +
                                        type.cart.shoppingCart.length +
                                        '道菜'
                                      : '点菜'}
                                  </div>
                                  <div
                                    className={classnames({
                                      'small-btn': true,
                                      mt20: true,
                                      disabled: type.cart === ''
                                    })}
                                    onClick={() => {
                                      if (type.cart !== '') {
                                        this.setState({
                                          typePopup: (
                                            <BanquetTypePopup
                                              handleCancel={() => {
                                                this.setState({
                                                  typePopup: ''
                                                });
                                              }}
                                              handleOk={({
                                                typeName,
                                                bookingNum,
                                                backupNum,
                                                personNum
                                              }) => {
                                                this.setState({
                                                  typePopup: ''
                                                });
                                                banquetCreateStore.copyDishesType(
                                                  typeIndex,
                                                  typeName,
                                                  bookingNum,
                                                  backupNum,
                                                  personNum
                                                );
                                              }}
                                            />
                                          )
                                        });
                                      }
                                    }}
                                  >
                                    复制
                                  </div>
                                  <i
                                    className="iconfont icon-shanchu1 mt20"
                                    onClick={() => {
                                      banquetCreateStore.deleteTypeItem(
                                        typeIndex
                                      );
                                    }}
                                  />
                                </div>
                              );
                            })}
                        </Scrollbars>
                      </div>
                      <div className="popover-button">
                        <div
                          className="po-button"
                          onClick={() => {
                            banquetCreateStore.addTTypes();
                          }}
                        >
                          新增类型
                        </div>
                        <div className="more-type-error">
                          {banquetCreateStore.error.moreError}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Scrollbars>
          <div className="btns">
            <div
              onClick={() => {
                banquetCreateStore.createCancelClick();
              }}
            >
              取消
            </div>
            {banquetCreateStore.isMoreType
              ? !(
                  location.state &&
                  location.state.from &&
                  location.state.from === 'modify'
                ) && (
                  <div className="select" onClick={this.createNextClick}>
                    下一步
                  </div>
                )
              : !(
                  location.state &&
                  location.state.from &&
                  location.state.from === 'modify'
                ) && (
                  <div className="select" onClick={this.toDishes}>
                    点菜
                  </div>
                )}
            {location.state &&
              location.state.from &&
              location.state.from === 'modify' && (
                <div className="select" onClick={this.modifyNextClick}>
                  下一步
                </div>
              )}
          </div>
        </div>
        {this.state.calendarPopup}
        {this.state.selectDesk}
        {this.state.typePopup}
      </div>
    );
  }
}
Create.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Create;
