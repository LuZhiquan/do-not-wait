/**
* @author shelly
* @description 开发票弹窗界面
* @date 2017-05-19
**/
import React from 'react';
import { Modal,message } from 'antd';
import { inject, observer } from 'mobx-react';

import './invoice_popup.less';
@inject('fastFoodOrderStore') @observer
class InvoicePopup extends React.Component {

  constructor(props){
    super(props);
    let fastFoodOrderStore=this.props.fastFoodOrderStore;
    this.state={orderPrice:fastFoodOrderStore.saveactualAmount,invoiceNum:'',invoiceUnit:'',invoicePrice:fastFoodOrderStore.saveactualAmount,remarkvalue:''};
  }

  //确定按钮
  handleOk=()=>{ 
    let invoicePrice=parseFloat(this.state.invoicePrice);
    let invoiceNum=this.state.invoiceNum.length; 
    let invoiceUnit=this.state.invoiceUnit.length;
    let remarkvalue=this.state.remarkvalue.length;
    if( invoicePrice>0){

      if(invoiceNum >100){
          message.destroy();
          message.info("发票编号长度不能超过100");
      }else if(invoiceUnit >100){
           message.destroy();
          message.info("开票单位长度不能超过100");
      }else if(remarkvalue>100){
           message.destroy();
          message.info("开票备注长度不能超过100");
      }else{
         //取值 
          let fastFoodOrderStore=this.props.fastFoodOrderStore; 
          let invoiceInfo={
            invoiceCode:this.state.invoiceNum,//发票编码
            departName:this.state.invoiceUnit,//开票单位
            invoiceAmount:this.state.invoicePrice,//发票金额
            memo:this.state.remarkvalue//开票备注
          }
          let _this=this;
          fastFoodOrderStore.orderOpenInvoice(
            fastFoodOrderStore.orderId,//订单ID
            invoiceInfo,
            function(){
              if(_this.props.okbutton){
                _this.props.okbutton();
              }
            }
          );
      }
     
 
    }else{
       message.config({
          duration: 2,
          getContainer:() => document.getElementById('invoice-message')
        });
        message.info("发票金额必须大于0");
    }
  }

  //关闭按钮
  handleCancel=()=>{
     if(this.props.closebutton){
        this.props.closebutton();
      }
  }
  render() {
    return (
      <div id="invoice-popup">
        <Modal title="开发票" 
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='取消'
            width={840}
            wrapClassName="invoice-popup-modal"
            onCancel={this.handleCancel}
            onOk={this.handleOk}
        >
          <div id="invoice-message"></div>
          <div className="btn">
            <form>
              <label>订单金额</label>
              <input type="text" className="order-amount disable" readOnly value={this.state.orderPrice} onChange={(e)=>{
                  this.setState({orderPrice:e.target.value})
              }}/><br />
              <label>发票编号</label>
              <input type="text" className="invoice-num" value={this.state.invoiceNum} onChange={(e)=>{
                  this.setState({invoiceNum:e.target.value})
              }}/><br />
              <label>开票单位</label>
              <input type="text" className="invoice-unit" value={this.state.invoiceUnit} onChange={(e)=>{
                  this.setState({invoiceUnit:e.target.value})
              }}/><br />
              <label><i>*</i>发票金额</label>
              <input type="text" className="invoice-amount" value={this.state.invoicePrice} onChange={(e)=>{
                  this.setState({invoicePrice:e.target.value})
              }}/><br />
              <label>开票备注</label>
              <textarea className="invoice-remark" value={this.state.remarkvalue} onChange={(e)=>{
                  this.setState({remarkvalue:e.target.value})
              }}></textarea>
            </form>
          </div>
        </Modal>
      </div>
    )
  }
}

export default InvoicePopup;