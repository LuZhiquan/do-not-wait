/**
* @author gm
* @description 支付小票弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import moment from 'moment';

import './payment_receipt_popup.less';

@inject('bookingStore')
@observer
class PayReceiptPopup extends Component {
  okClick = () => {
    if (this.props.okClick) {
      this.props.okClick();
    }
  };
  render() {
    let bookingStore = this.props.bookingStore;
    let bookingType;
    switch (bookingStore.bookingReceiptInfo &&
      bookingStore.bookingReceiptInfo.bookingType) {
      case 614:
        bookingType = '点菜预订';
        break;
      case 615:
        bookingType = '留位预订';
        break;
      case 616:
        bookingType = '普通预订';
        break;
      default:
        break;
    }

    return (
      <div>
        <Modal
          visible={true}
          maskClosable={false}
          footer={null}
          width={522}
          closable={false}
          wrapClassName="receipt-popup-modal"
        >
          <div className="receipt-container">
            <div className="receipt-title">
              {bookingStore.bookingReceiptInfo.merchantName}预订支付小票
            </div>
            <ul className="receipt-info">
              <li>
                <span className="re-title">预订单号：</span>
                {bookingStore.bookingReceiptInfo.bookingCode}
              </li>
              <li>
                <span className="re-title">电话号码：</span>
                {bookingStore.bookingReceiptInfo.phone}
              </li>
              <li>
                <span className="re-title">预 订 人：</span>
                {bookingStore.bookingReceiptInfo.contact}
              </li>
              <li>
                <span className="re-title">预订时间：</span>
                {moment(bookingStore.bookingReceiptInfo.bookingTime).format(
                  'MM-DD HH:mm'
                )}
              </li>
              <li>
                <span className="re-title">人 数：</span>
                {bookingStore.bookingReceiptInfo.peopleNum}
              </li>
              <li>
                <span className="re-title">预订桌台：</span>
                {bookingStore.bookingReceiptInfo.tableCodes}
              </li>
              <li>
                <span className="re-title">预订方式：</span>
                {bookingType}
              </li>
              <li>
                <span className="re-title">预 订 金：</span>
                {bookingStore.bookingReceiptInfo.bookingAmount}
              </li>
            </ul>
            {bookingStore.bookingReceiptInfo &&
            bookingStore.bookingReceiptInfo.bookingType !== 616 && (
              <div className="receipt-payment">
                <div className="payment">
                  <span>支付方式：</span>
                  <ul>
                    <li>{bookingStore.payMoneyMessage.paymentName}</li>
                  </ul>
                </div>
                <div className="money">
                  <span>金额：</span>
                  <ul>
                    <li>{bookingStore.payMoneyMessage.paymentAmount}</li>
                  </ul>
                </div>
              </div>
            )}
            <div className="receipt-remarks">
              <div className="remarks">
                <span className="re-title">备注：</span>
                {bookingStore.bookingReceiptInfo.memo}
              </div>
              <ul className="person">
                <li>
                  <span className="re-title">建单人：</span>
                  {bookingStore.bookingReceiptInfo.creatorName}
                </li>
                <li>
                  <span className="re-title">建单时间：</span>
                  {bookingStore.bookingReceiptInfo.createTime}
                </li>
              </ul>
            </div>
            <div className="receipt-address">
              <div>
                <span className="re-title">餐厅地址：</span>
                {bookingStore.bookingReceiptInfo.postalAddress}
              </div>
              <div>
                <span className="re-title">联系电话：</span>
                {bookingStore.bookingReceiptInfo.managerPhone}
              </div>
            </div>
            <div className="receipt-notice">
              {bookingStore.bookingReceiptInfo.bookingNeedKnow ? (
                bookingStore.bookingReceiptInfo.bookingNeedKnow
              ) : (
                ''
              )}
            </div>

            <div className="confirm-btn" onClick={this.okClick}>
              确定
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default PayReceiptPopup;
