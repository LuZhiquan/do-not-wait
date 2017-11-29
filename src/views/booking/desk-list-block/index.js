/**
* @author gm
* @description 卓台列表
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';

import { Tabs } from 'antd';
import './desk_list_block.less';

const TabPane = Tabs.TabPane;

function DeskItem({ table, index }) {
  let leaveBlock;
  switch (table.bookingType) {
    case 614:
      leaveBlock = '点菜';
      break;
    case 615:
      leaveBlock = '留位';
      break;
    default:
      leaveBlock = '';
  }

  let bookingStatus;
  switch (table.bookingStatus) {
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
    <li key={index} className="desk-item">
      <div
        className={classnames({
          title: true,
          booked: table.bookingStatus === 618
        })}
      >
        <p
          className={classnames({
            big: table.tableName.length < 10,
            small: table.tableName.length >= 10
          })}
        >
          {table.tableName}
        </p>
        <div>
          <span className="number">{table.defaultPerson}人桌</span>
          <span className="overtime">{bookingStatus}</span>
          <span className="leave">{leaveBlock}</span>
        </div>
      </div>
      <div className="content">
        <span>{table.contact}</span>
        <span>
          {table.bookingTime && moment(table.bookingTime).format('HH:mm')}
        </span>
      </div>
    </li>
  );
}

@inject('bookingStore')
@observer
class DeskListBlock extends Component {
  constructor(props) {
    super(props);

    this.props.bookingStore.indexReserveAreaID();
  }

  render() {
    let bookingStore = this.props.bookingStore;

    return (
      <div id="desk_list_block">
        <Tabs
          defaultActiveKey="0"
          activeKey={bookingStore.indexTabKey.toString()}
          onTabClick={key => {
            bookingStore.deskTabClick(key);
          }}
        >
          {bookingStore.reserveAreaIDs.length > 0 &&
            bookingStore.reserveAreaIDs.map((area, index) => {
              return (
                <TabPane tab={area.areaName} key={index}>
                  <Scrollbars>
                    <ul className="desk-block">
                      {bookingStore.bookingTableStatus &&
                        bookingStore.bookingTableStatus
                          .concat(Array(10).fill(0))
                          .map((table, index) => {
                            return table ? (
                              <DeskItem
                                table={table}
                                index={index}
                                key={index}
                              />
                            ) : (
                              <div key={index} className="desk-item" />
                            );
                          })}
                    </ul>
                  </Scrollbars>
                </TabPane>
              );
            })}
        </Tabs>
      </div>
    );
  }
}

export default DeskListBlock;
