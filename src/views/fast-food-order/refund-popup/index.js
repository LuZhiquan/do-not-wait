/**
* @author shining
* @description 取消预订原因弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react'; 

import {Modal} from 'antd';   

import './refund-popup.less';

@inject('fastFoodOrderStore') @observer
class RefundPopup extends Component {

	constructor(props){
		super(props);
		this.state={}
	}

	fastFoodOrderStore=this.props.fastFoodOrderStore;
	
	handleOk=()=>{
  
		// console.log(JSON.stringify(this.fastFoodOrderStore.detailID))
		// console.log(JSON.stringify(this.fastFoodOrderStore.quantity))
		// console.log(JSON.stringify(this.fastFoodOrderStore.floatQuantity))
		// console.log(JSON.stringify(this.fastFoodOrderStore.retreatPrice))
		// console.log(JSON.stringify(this.fastFoodOrderStore.orderId))
		// console.log(JSON.stringify(this.fastFoodOrderStore.needreason)) 
		this.fastFoodOrderStore.doReturnQuickOrder(
			this.fastFoodOrderStore.detailID,
			this.fastFoodOrderStore.quantity,
			this.fastFoodOrderStore.floatQuantity,
			this.fastFoodOrderStore.retreatPrice,
			this.fastFoodOrderStore.orderId,
			this.fastFoodOrderStore.needreason,	
			function(){
				// if(this.props.handleOk){
				// 	this.props.handleOk();
				// } 
			});

	}

	handleCancel=()=>{
		if(this.props.handleCancel){
			this.props.handleCancel();
		} 
	}

	render() {
		let fastFoodOrderStore = this.props.fastFoodOrderStore;
    	return <div>
			<Modal  
                title="退款"
				visible={true} 
				maskClosable={false} 
				width={600}
				onOk={this.handleOk} 
                onCancel={this.handleCancel} 
				wrapClassName="refund-popup-modal"    
				>      
				<div className="refund-container">
					 <div className="refund-main">
					 	<p>
						 	退菜金额
							 <span><em>{fastFoodOrderStore.retreatPrice}</em>元</span>
						</p>

						<p className="each-data">现金:<span><em>{fastFoodOrderStore.retreatPrice}</em>元</span></p>
					 </div>
                  		
				</div>
				
			</Modal>
      </div>
	}

}

export default RefundPopup;
