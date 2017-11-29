/**
* @author shelly
* @description 开发票弹窗界面
* @date 2017-05-19
**/
import React from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';

import './invoice_popup.less';
@inject('settlementStore', 'cashierStore')
@observer
class InvoicePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderPrice: '0',
      invoiceNum: '',
      invoiceUnit: '',
      invoiceAmount: this.props.settlementStore.invoicePopupAmount,
      memo: '' //备注
    };
  }
  handleOk = () => {
    let settlementStore = this.props.settlementStore;
    let cashierStore = this.props.cashierStore;

    let invoiceInfo = {
      invoiceCode: this.state.invoiceNum,
      departName: this.state.invoiceUnit,
      invoiceAmount: this.state.invoiceAmount * 1,
      memo: this.state.memo
    };

    if (this.state.invoiceAmount > 0) {
      this.props.handleClose && this.props.handleClose();
      if (this.props.optional) {
        //如果optional存在，就调用快餐中的开发票接口，否则调用结账中的开发票接口
        cashierStore.getInvoice('', invoiceInfo);
      } else {
        settlementStore.getInvoice(this.props.subOrderID, invoiceInfo, () => {
          settlementStore.changeInvoiceMoney(this.state.invoiceAmount * 1);
          settlementStore.getInvoiceInfo(this.props.subOrderID);
        });
      }
    } else {
      settlementStore.showFeedback({ status: 'info', msg: '发票金额必须大于0' });
    }
  };
  handleCancel = () => {
    this.props.handleClose && this.props.handleClose();
  };
  render() {
    return (
      <div id="invoice-popup">
        <Modal
          title="开发票"
          visible={true}
          maskClosable={false}
          okText="确定"
          cancelText="取消"
          width={840}
          wrapClassName="invoice-popup-modal"
          onCancel={this.handleCancel}
          onOk={this.handleOk}
        >
          <div id="invoice-message" />
          <div className="btn">
            <form>
              <label>订单金额</label>
              <input
                type="text"
                className="order-amount"
                value={this.props.orderAmount.toFixed(2)}
                readOnly
              />
              <br />
              <label>发票编号</label>
              <input
                type="text"
                className="invoice-num"
                value={this.state.invoiceNum}
                onChange={e => {
                  this.setState({ invoiceNum: e.target.value });
                }}
              />
              <br />
              <label>开票单位</label>
              <input
                type="text"
                className="invoice-unit"
                value={this.state.invoiceUnit}
                onChange={e => {
                  this.setState({ invoiceUnit: e.target.value });
                }}
              />
              <br />
              <label>发票金额</label>
              <input
                type="number"
                className="invoice-amount"
                value={this.state.invoiceAmount}
                onChange={e => {
                  this.setState({ invoiceAmount: e.target.value });
                }}
              />
              <br />
              <label>开票备注</label>
              <textarea
                className="invoice-remark"
                value={this.state.memo}
                onChange={e => {
                  this.setState({ memo: e.target.value });
                }}
              />
            </form>
          </div>
        </Modal>
      </div>
    );
  }
}

export default InvoicePopup;
