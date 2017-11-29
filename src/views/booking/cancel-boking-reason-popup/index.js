/**
* @author gm
* @description 取消预订原因弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';

import { Modal, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import './cancel_booking_reason_popup.less';

message.config({
  top: 300,
  duration: 1
});
@inject('bookingStore')
@observer
class CancelBookingReasonPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reason: '',
      current: -1,
      amount: ''
    };
    let bookingStore = this.props.bookingStore;
    bookingStore.cancelRefundAmount = '';
  }

  componentDidMount() {
    let bookingStore = this.props.bookingStore;
    if (bookingStore.recordItem) {
      bookingStore.queryRefundScale(bookingStore.recordItem.bookingID);
      bookingStore.queryRefundAmount(bookingStore.recordItem.bookingID);
    }
    let refundAmount = 0;
    if (bookingStore.cancelRefundAmount) {
      refundAmount = bookingStore.cancelRefundAmount.refundAmount;
    }
    this.setState({ amount: refundAmount });
  }

  handleOk = () => {
    let bookingStore = this.props.bookingStore;
    let reason;
    if (this.state.current >= 0) {
      reason = bookingStore.cancelReasons.cause[this.state.current];
    } else {
      reason = this.state.reason;
    }

    if (reason) {
      if (this.props.okClick) {
        this.props.okClick();
      }
      bookingStore.cancelBookingOk(
        reason,
        bookingStore.recordItem.bookingID,
        this.state.amount
      );
    } else {
      message.destroy();
      message.warn('原因不能为空');
    }
  };

  handleCancel = () => {
    if (this.props.cancelClick) {
      this.props.cancelClick();
    }
  };

  reasonOnChange = e => {
    if (e.target.value.length <= 100) {
      this.setState({ reason: e.target.value });
    }

    if (e.target.value) {
      this.setState({ current: -1 });
    }
  };

  render() {
    let bookingStore = this.props.bookingStore;

    return (
      <div>
        <Modal
          title="取消预订"
          visible={true}
          maskClosable={false}
          footer={null}
          width={676}
          onCancel={this.handleCancel}
          wrapClassName="cancel-booking-reason-popup-modal"
        >
          <div className="cancel-booking-reason-container">
            {bookingStore.recordItem.bookingType !== 616 &&
            bookingStore.recordItem.bookingStatus === 618 && (
              <div className="refund-money-block">
                <div className="refund-item">
                  <div>已付定金</div>
                  <input
                    type="text"
                    value={
                      bookingStore.cancelRefundAmount &&
                      bookingStore.cancelRefundAmount.bookingAmount
                    }
                    readOnly
                    className="bg-gray"
                  />
                </div>
                <div className="refund-item">
                  <div>实退订金</div>
                  <input
                    type="text"
                    value={this.state.amount}
                    onChange={e => {
                      let value = e.target.value;
                      if (
                        /^\d*\.{0,1}\d{0,2}$/.test(value) &&
                        value >= 0 &&
                        value < 1000000000
                      ) {
                        this.setState({ amount: value });
                      }
                    }}
                  />
                </div>
              </div>
            )}
            <div className="reason-input">
              <div>取消原因</div>
              <textarea
                type="text"
                placeholder="请选择／输入取消预订原因"
                value={this.state.reason}
                onChange={this.reasonOnChange}
              />
            </div>

            <div className="reason-btns">
              <Scrollbars>
                <ul>
                  {bookingStore.cancelReasons &&
                    bookingStore.cancelReasons.cause.map((reason, index) => {
                      return (
                        <li
                          className={classnames({
                            'btn-item': true,
                            select: index === this.state.current
                          })}
                          key={index}
                          onClick={() => {
                            this.setState({ current: index });
                            this.setState({ reason: '' });
                          }}
                        >
                          {reason}
                        </li>
                      );
                    })}
                </ul>
              </Scrollbars>
            </div>
          </div>
          <div className="cancel-booking-reason-btns">
            <div onClick={this.handleCancel}>取消</div>
            <div onClick={this.handleOk}>确定</div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default CancelBookingReasonPopup;
