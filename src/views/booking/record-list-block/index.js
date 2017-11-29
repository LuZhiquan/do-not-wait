/**
* @author gm
* @description 预定列表
* @date 2017-05-15
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import moment from 'moment';

import Scrollbars from 'react-custom-scrollbars';

import './record_list_block.less';

@inject('bookingStore')
@observer
class Booking extends Component {
  constructor(props) {
    super(props);

    this.state = { current: this.props.current };
  }

  render() {
    let bookingList = this.props.bookingList;
    return (
      <div className="list-content">
        <Scrollbars>
          {bookingList.map((record, index) => {
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

                  if (this.props.recordClick) {
                    this.props.recordClick(record);
                  }
                }}
              >
                <span>{index + 1}</span>
                <span>{record.customerName}</span>
                <span>{bookingTime}</span>
                <span>{record.bookingAmount}</span>
                <span>{record.tableCodes}</span>
                <span>{bookingStatus}</span>
              </div>
            );
          })}
        </Scrollbars>
      </div>
    );
  }
}

export default Booking;
