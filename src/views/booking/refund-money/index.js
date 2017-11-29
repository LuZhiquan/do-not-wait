import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import './refund_money.less';

@inject('bookingStore')
@observer
class RefundMoney extends React.Component {
  constructor(props) {
    super(props);
    this.state = { money: '', message: '', refundMoney: '' };
    this.props.bookingStore.getRefundMoney(
      this.props.bookingStore.recordItem.bookingID
    );
  }

  handleCancel = () => {
    if (this.props.cancelClick) {
      this.props.cancelClick();
    }
  };

  render() {
    let bookingStore = this.props.bookingStore;

    let bookingAmount = bookingStore.refundMoneyInfo.bookingAmount;
    bookingAmount = bookingAmount ? bookingAmount : 0;
    let refundAmount = bookingStore.refundMoneyInfo.refundAmount;
    refundAmount = refundAmount ? refundAmount : 0;

    let canRefundMoney = bookingAmount - refundAmount;
    return (
      <div>
        <Modal
          visible={true}
          title="退定金"
          maskClosable={false}
          width={670}
          closable={false}
          onOk={() => {
            if (this.state.money > canRefundMoney) {
              this.setState({ message: '金额不能大于可退金' });
            } else {
              if (this.props.okClick) {
                this.props.okClick(
                  this.props.bookingStore.recordItem.bookingID,
                  this.state.money
                );
              }
            }
          }}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          wrapClassName="refund-money-popup-modal"
        >
          <div className="refund-money-booking-container">
            <div>
              <span>订金：</span>
              <input type="text" value={bookingAmount} readOnly />
            </div>
            <div>
              <span>已退金额：</span>
              <input type="text" value={refundAmount} readOnly />
            </div>
            <div>
              <span>退款金额：</span>
              <input
                type="text"
                placeholder="请输入手工退订金金额"
                value={this.state.money}
                onChange={e => {
                  if (e.target.value < canRefundMoney) {
                    this.setState({ message: '' });
                  }
                  if (/^[0-9.]*$/.test(e.target.value)) {
                    this.setState({ money: e.target.value });
                  }
                }}
              />
            </div>
            <p className="errorText">{this.state.message}</p>
          </div>
        </Modal>
      </div>
    );
  }
}

export default RefundMoney;
