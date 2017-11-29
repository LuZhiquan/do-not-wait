/**
* @author WilliamCui
* @description 取消预订原因弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { Modal, Alert } from 'antd';

import Scrollbars from 'react-custom-scrollbars';
import { getJSON } from 'common/utils';

import './cancel_booking_reason_popup.less';

@inject('dineStore')
@observer
class CancelBookingReasonPopup extends Component {
  state = {
    reason: '',
    memo: '',
    reasonObj: null,
    bookingAmount: 0,
    refundAmount: 0
  };

  handleOk = () => {
    let { dineStore, handelClose } = this.props;
    let { reason, memo, refundAmount } = this.state;
    if (reason || memo) {
      let requireData = {
        bookingID: dineStore.selectedTableList[0].bookingID,
        memo: reason || memo
      };
      if (
        dineStore.selectedTableList[0].bookingType !== 616 &&
        dineStore.selectedTableList[0].bookingStatus === 618
      ) {
        requireData.refundAmount = refundAmount;
      }
      dineStore.cancelBooking(requireData);
    } else {
      dineStore.showFeedback({ status: 'validate', msg: '请输入或选择取消预订原因' });
      return;
    }
    handelClose && handelClose();
  };

  handleCancel = () => {
    let { handelClose } = this.props;
    handelClose && handelClose();
  };

  //获取取消预订原因列表
  getCancelBookingReasonList() {
    let { dineStore } = this.props;
    let _this = this;
    getJSON({
      url: '/order/reserve/queryRefundScale.action',
      data: { bookingID: dineStore.selectedTableList[0].bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.setState({ reasonObj: json.data });
        } else {
          //获取失败反馈
          dineStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //查询退定金
  queryRefundAmount() {
    let { dineStore } = this.props;
    let _this = this;
    getJSON({
      url: '/order/reserve/queryRefundAmount.action',
      data: { bookingID: dineStore.selectedTableList[0].bookingID },
      success: function(json) {
        if (json.code === 0) {
          _this.setState({
            bookingAmount: json.data.bookingAmount,
            refundAmount: json.data.refundAmount
          });
        } else {
          dineStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  componentDidMount() {
    let { dineStore } = this.props;
    this.getCancelBookingReasonList();
    if (
      dineStore.selectedTableList[0].bookingType !== 616 &&
      dineStore.selectedTableList[0].bookingStatus === 618
    ) {
      this.queryRefundAmount();
    }
  }

  render() {
    let { dineStore } = this.props;
    let { reasonObj } = this.state;
    return (
      <Modal
        title="取消预订"
        visible={true}
        maskClosable={false}
        width={676}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        wrapClassName="cancel-booking-reason-popup-modal"
      >
        {dineStore.feedback &&
        dineStore.feedback.status === 'validate' && (
          <Alert
            message={dineStore.feedback.msg}
            banner
            closable
            onClose={() => {
              //关闭警告信息
              dineStore.closeFeedback();
            }}
          />
        )}
        <div className="cancel-booking-reason-container">
          {dineStore.selectedTableList[0].bookingType !== 616 &&
          dineStore.selectedTableList[0].bookingStatus === 618 && (
            <div className="refund-money-block">
              <div className="refund-item">
                <div>已付定金</div>
                <input
                  type="text"
                  value={this.state.bookingAmount}
                  readOnly
                  className="bg-gray"
                />
              </div>
              <div className="refund-item">
                <div>实退订金</div>
                <input
                  type="text"
                  value={this.state.refundAmount && this.state.refundAmount}
                  onChange={e => {
                    if (/^\d*\.{0,1}\d*$/.test(e.target.value)) {
                      this.setState({ refundAmount: e.target.value });
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
              placeholder="请选择／输入取消预订原因, 限100字内"
              value={this.state.memo}
              onChange={e => {
                let memo = e.target.value.substr(0, 100);
                this.setState({
                  reason: '',
                  memo: memo
                });
              }}
            />
          </div>

          <div className="reason-btns">
            <Scrollbars>
              <ul>
                {reasonObj &&
                  reasonObj.cause &&
                  !!reasonObj.cause.length &&
                  reasonObj.cause.map((reason, index) => {
                    return (
                      <li
                        className={classnames({
                          'btn-item': true,
                          select: reason === this.state.reason
                        })}
                        key={index}
                        onClick={() => {
                          this.setState({
                            reason,
                            memo: ''
                          });
                        }}
                      >
                        {reason}
                      </li>
                    );
                  })}
              </ul>
            </Scrollbars>
          </div>
          {false && <div className="notice">{reasonObj && reasonObj.msg}</div>}
        </div>
      </Modal>
    );
  }
}

export default CancelBookingReasonPopup;
