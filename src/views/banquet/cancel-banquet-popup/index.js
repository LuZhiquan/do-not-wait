/**
* @author gm
* @description 取消预订原因弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { message } from 'antd';
import { Modal } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import './cancel_banquet_popup.less';
message.config({
  top: 300
});

@inject('banquetCreateStore')
@observer
class CancelBanquetPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: -1,
      reason: '',
      backAmount: ''
    };
    let { banquetCreateStore, bookingID } = this.props;
    banquetCreateStore.getCancelReason();
    banquetCreateStore.toCancelBooking(bookingID);
  }

  handleOk = () => {
    let { banquetCreateStore, bookingID } = this.props;

    let reason;
    if (this.state.currentIndex >= 0) {
      reason = banquetCreateStore.cancelReasons[this.state.currentIndex];
    } else {
      reason = this.state.reason;
    }

    let backAmount = this.state.backAmount ? this.state.backAmount * 1 : 0;

    if (reason) {
      banquetCreateStore.cancelBanquetClick(
        bookingID,
        reason,
        backAmount,
        () => {
          if (this.props.handleOk) {
            this.props.handleOk();
          }
        }
      );
    } else {
      message.destroy();
      message.warn('请选择原因', 1);
    }
  };

  handleCancel = () => {
    if (this.props.handleCancel) {
      this.props.handleCancel();
    }
  };

  render() {
    let { banquetCreateStore } = this.props;

    let cancelMessage = banquetCreateStore.cancelMessage;

    return (
      <div>
        <Modal
          title="取消预订"
          visible={true}
          maskClosable={false}
          width={840}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrapClassName="cancel-banquet-popup-modal"
        >
          <div className="cancel-banquet-container">
            {this.props.hasPay ? (
              <div className="refund-money">
                <div className="re-title">订单总额</div>
                <div className="number">
                  {cancelMessage.banqTotalAmount &&
                    cancelMessage.banqTotalAmount}元
                </div>
                <div className="re-title ml40">已付订金</div>
                <div className="number">
                  {cancelMessage.bookingAmount && cancelMessage.bookingAmount}元
                </div>
                <div className="re-title">退订金额</div>
                <input
                  type="text"
                  className="money"
                  value={this.state.backAmount}
                  onChange={e => {
                    if (/^\d*\.{0,1}\d*$/.test(e.target.value)) {
                      this.setState({ backAmount: e.target.value });
                    }
                  }}
                />
                <div className="yuan">元</div>
              </div>
            ) : (
              <div className="refund-money">
                <div className="re-title ml10">订单总额</div>
                <div className="m-number">
                  {cancelMessage.banqTotalAmount &&
                    (cancelMessage.banqTotalAmount * 1).toFixed(2)}元，客户未付订金！
                </div>
              </div>
            )}

            <div className="reason-btns">
              <div className="reason-title">取消原因</div>
              <div className="reason-content">
                <Scrollbars>
                  <ul>
                    {banquetCreateStore.cancelReasons.length > 0 &&
                      banquetCreateStore.cancelReasons.map((reason, index) => {
                        return (
                          <li
                            key={index}
                            className={classnames({
                              select: index === this.state.currentIndex
                            })}
                            onClick={() => {
                              this.setState({ currentIndex: index });
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
            <textarea
              placeholder="请输入取消原因"
              value={this.state.reason}
              onChange={e => {
                this.setState({ reason: e.target.value });
                if (e.target.value) {
                  this.setState({ currentIndex: -1 });
                }
              }}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

export default CancelBanquetPopup;
