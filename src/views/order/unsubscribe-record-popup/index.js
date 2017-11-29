/**
* @author shining
* @description 退定金订单详情页面
* @date 2017-05-19
**/
import React from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';

import './unsubscribe-record-popup.less';
@inject('orderStore') @observer
class   UnsubscribeRecordPopup extends React.Component {
 

  //关闭
  handleCancel=()=>{
    if(this.props.closebutton){
      this.props.closebutton();
    }
  }

  
  render() {
    let orderStore=this.props.orderStore;
    let datilsobj=orderStore.datilsobj;
    return (
      <div id="unsubscribe-record-popup">
        <Modal title="退订金详情" 
            visible={true} 
            maskClosable={false} 
            footer={null}
            width={840}
            wrapClassName="unsubscribe-record-popup"
            onCancel={this.handleCancel} 
        >
        <div className="unsubscribe-record-main">
          <div className="unsubscribe-left">
            <p><span>预订单号:</span><em>{datilsobj.bookingCode}</em></p>
            <p><span>预订人:</span><em>{datilsobj.bookingUser}</em></p>
            <p><span>订单应收:</span><em>{datilsobj.payedAmount}</em></p>
            <p><span>已付订金:</span><em>{datilsobj.bookingAmount}</em></p>
            <p><span>实际退款:</span><em>{datilsobj.refundAmount}</em></p> 
          </div>
           <div className="unsubscribe-right">
              <p><span>退款方式:</span><em>{datilsobj.refundMethod}</em></p>
              <p><span>退款比例:</span><em>{datilsobj.refundRate}%</em></p>
              <p><span>退款时间:</span><em>{datilsobj.refundDate}</em></p>
              <p><span>操作人:</span><em>{datilsobj.dealUer}</em></p>
              <p><span>退款类型:</span><em>{datilsobj.refundType}</em></p> 
           </div>
        </div>
           
        </Modal>
      </div>
    )
  }
}

export default UnsubscribeRecordPopup;