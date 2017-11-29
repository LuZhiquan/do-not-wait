/**
* @author shelly
* @description 开发票弹窗界面
* @date 2017-05-19
**/
import React from 'react';
import { Modal, message } from 'antd';

import './invoice_popup.less';
class InvoicePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderPrice: '0',
      invoiceNum: '',
      invoiceUnit: '',
      invoicePrice: '0',
      memo: '' //备注
    };
  }
  handleOk = () => {
    let invoiceInfo = {
      invoiceCode: this.state.invoiceNum,
      departName: this.state.invoiceUnit,
      invoiceAmount: this.props.invoiceAmount,
      memo: this.state.memo
    };

    if (this.props.invoiceAmount > 0) {
      this.props.handleOk && this.props.handleOk(invoiceInfo);
    } else {
      message.config({
        duration: 2,
        getContainer: () => document.getElementById('invoice-message')
      });
      message.info('发票金额和订单金额必须大于0');
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
                value={this.props.orderAmount}
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
                type="text"
                className="invoice-amount"
                value={this.props.invoiceAmount}
                readOnly
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
