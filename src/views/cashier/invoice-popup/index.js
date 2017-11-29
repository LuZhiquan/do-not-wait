/**
* @author shelly
* @description 开发票弹窗界面
* @date 2017-05-19
**/
import React from 'react';
import { Modal, message } from 'antd';
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
      invoicePrice: '0',
      memo: '' //备注
    };
  }
  handleOk = () => {
    let cashierStore = this.props.cashierStore;

    let invoiceInfo = {
      invoiceCode: this.state.invoiceNum,
      departName: this.state.invoiceUnit,
      invoiceAmount: this.state.invoiceAmount,
      memo: this.state.memo
    };

    if (this.state.invoiceAmount > 0) {
      this.props.handleClose && this.props.handleClose();
      cashierStore.getInvoice('', invoiceInfo);
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
                value={this.state.invoiceAmount}
                onChange={e => {
                  let inputVal = e.target.value;
                  if (/^\d*\.{0,1}\d*$/.test(inputVal)) {
                    if (/\d*\.\d{3}/.test(inputVal)) {
                      message.destroy();
                      message.info('只能输入两位小数');
                    } else {
                      if (
                        /^(0{2})/.test(inputVal) ||
                        /^(0{1}[1-9]+)/.test(inputVal)
                      ) {
                        inputVal = inputVal * 1 + '';
                      }
                      this.setState({ invoiceAmount: inputVal });
                    }
                  }
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
