/**
* @author shining
* @description 取消预订原因弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames'; 

import {Modal,message} from 'antd';  
import Scrollbars from 'react-custom-scrollbars';
import RefundPopup from '../../fast-food-order/refund-popup'; 

import './retreat-food-popup.less';

 

@inject('fastFoodOrderStore') @observer
class RetreatFoodPopup extends Component {

	constructor(props){
		super(props);
		this.state={
			refund:'',
			reasonValue:''//变动原因
		}
		

	}	

	 

	fastFoodOrderStore =this.props.fastFoodOrderStore
	handleOk=()=>{
		 
		// if(this.props.handleOk){
        //     this.props.handleOk();
        // }

		//菜品明细编号,数量,小数数量
		this.fastFoodOrderStore.setneedarry();

		if(this.fastFoodOrderStore.detailID.length === 0){
			message.destroy();
			message.warn("请选择要退的菜品");   
			return; 
		}else if(this.state.reasonValue === "" && this.fastFoodOrderStore.reason.trim() === ""){
			message.destroy();
			message.warn("请选择原因");   
			return; 
		}else if(this.state.reasonValue !== "" && this.state.reasonValue.length>100){
			message.destroy();
			message.warn("输入的原因不能超过100个字"); 
       		return; 
		}else{
			//退菜原因
			this.fastFoodOrderStore.needreason = this.fastFoodOrderStore.reason === "" ? this.state.reasonValue : this.fastFoodOrderStore.reason;
			this.setState({
				refund:
				<RefundPopup 
					handleOk={()=>{
						this.setState({refund:''});
					}}
					handleCancel={()=>{
						this.setState({refund:''});
					}}>
				</RefundPopup>
			});

		
		}

 
		
		
	}

	 

	handleCancel=()=>{
		if(this.props.handleCancel){
			this.props.handleCancel();
		}
		this.fastFoodOrderStore.emptyValue();
	}


	 


	//获取变动原因
	reachValue=(e)=>{ 
		if(this.state.reasonValue.length>1){
			this.fastFoodOrderStore.emptyreason(); 
		}
		var value = e.target.value;
		this.setState({reasonValue:value}) 
		
	}

	 

	 
	render() {
		let returnQuickOrderList= this.fastFoodOrderStore.returnQuickOrderList;
		let revocationList=this.fastFoodOrderStore.revocationList;
		 
    	return <div>
			<Modal  
                title="退菜"
				visible={true} 
				maskClosable={false} 
				width={840}
				onOk={this.handleOk} 
                onCancel={this.handleCancel} 
				wrapClassName="retreat-food-popup-modal"    
				>      
				<div className="retreat-food-container">
					 
                    <div className="food-list">
						<ul>
							<li>退菜菜品</li>
							<li>可退数量</li>
							<li>单价</li>
							<li>退菜数量</li>
							<li>退菜金额</li>
							<li>报损</li>
						</ul>
						<div className="data-list">
							<Scrollbars>
							 {returnQuickOrderList.length !== 0 ? returnQuickOrderList.map((ord,index) => { 
									return <div  className="each-data" key={index}>
												<span>{ord.productName}</span>
												<span>{ord.quantity}</span>
												<span>{ord.price}</span>
												<span>
													<i className="number-jian iconfont icon-jian" 
														onClick={()=>{
															if(ord.thisnum > 0){
																this.fastFoodOrderStore.reduceValue(ord.index);	
															} 
														}}></i> 
													<em>{ord.thisnum}</em>
													<i className="number-jia iconfont icon-jia" 
														onClick={()=>{ 
															if(ord.thisnum<ord.quantity){
																this.fastFoodOrderStore.addValue(ord.index);
																	
															}
														}}>
													</i>
												</span>
												<span>{ord.retreatprice}</span>
												<span><i className={
															classnames({
															"iconfont icon-icon_checkbox_sel":true,
															"iconfont icon-icon_checkbox_sel bgi":ord.select,
															})
														}
													  
													onClick={()=>{
														ord.select=!ord.select; 
														this.fastFoodOrderStore.checkWhat(ord.index); 
													}}></i></span>
											</div>  
									 
									 
								}) : <div className="empty-holder" style={{top:"59%"}}>暂无数据</div> } 

								
								 
							</Scrollbars>
						</div>
						<div className="sum-price">
							<span>合计</span>
							<span>{this.fastFoodOrderStore.refundableSum.toFixed(2)}</span>
							<span></span>
							<span>{this.fastFoodOrderStore.retreatSum.toFixed(2)}</span>
							<span>{this.fastFoodOrderStore.retreatPrice.toFixed(2)}</span>
							<span></span>
						</div>
					</div>
					<div className="reason-btns">
						<div className="reason-title">退菜原因</div>
						<div className="reason-content">
							<Scrollbars>
								<ul>
									{revocationList.length !==0 ? 
										revocationList.map((ord,index) => { 
											return <li key={index}
														className={classnames({
															"select":ord.selected
														})}
														onClick={()=>{ 
															 
															this.fastFoodOrderStore.checkedreason(ord.reasonID); 
															this.fastFoodOrderStore.setreason(ord.reason); 
															this.setState({reasonValue:''}) 
														}}
														>{ord.reason}
													</li> 
										})
										: <div className="empty-holder">暂无数据</div> }
											
									 							
								</ul>
							</Scrollbars>
						</div>
						
					</div>	
                    <textarea placeholder="可输入退菜原因" onChange={this.reachValue} value={this.state.reasonValue}  > 
                    </textarea>				
				</div>
				
			</Modal>
			{this.state.refund}
      </div>
	}

}

export default RetreatFoodPopup;
