/**
* @author shelly
* @description 调整商品折扣
* @date 2017-06-7
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';


import './adjust_product_discount.less';
@inject('settlementStore') @observer
class AdjustProuductDiscount extends React.Component {
 state={
    discount:0,//折扣值
  }

  handleOk=()=>{
   this.props.settlementStore.moreokClick();
  }
  handleCancel=()=>{
   
     this.props.settlementStore.closeAdjusetProduct();
  }
  render() {
    return (
        <Modal title="调整商品折扣" 
            visible={true} 
            closable={true}
            maskClosable={false}
            width={900}
            wrapClassName="adjust-product-discount-modal"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
          <div className="discount-content">
            <ul className="discount-title">
              <li>序号</li>
              <li>商品</li>
              <li>数量</li>
              <li>原价</li>
              <li>原价扣</li>
              <li>原价后金额</li>
              <li>原价扣金额</li>
              <li>现折扣</li>
              <li>现折扣金额</li>
              <li>操作</li>
            </ul>
            <ul className="discount-body">
              <li>
                <span>1</span>
                <span>红酒</span>
                <span>2</span>
                <span>100</span>
                <span>9折</span>
                <span>180</span>
                <span>20.00</span>
                <span><input value={this.state.discount} onChange={(e)=>{
                   this.setState({discount:e.target.value})
                }} className="discount"/></span>
                <span><input value="20.00" className="discount-amount"/></span>
                <span className="recover-discount"></span>
              </li>
              <li>
                <span>1</span>
                <span>红酒</span>
                <span>2</span>
                <span>100</span>
                <span>9折</span>
                <span>180</span>
                <span>20.00</span>
                <span><input value="9折" className="discount"/></span>
                <span><input value="20.00" className="discount-amount"/></span>
                <span className="recover-discount">恢复原价折扣</span>
              </li>
            </ul>
          </div>
           <div className="bottom-detail">
              <span>原价折扣金额：<i>26.00</i></span>
              <span>现折扣金额：<i>24.00</i></span>
              <span className="balance">差额：<i>2.00</i></span>
            </div>
        </Modal>
    )
  }
}

export default AdjustProuductDiscount;