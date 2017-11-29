/**
* * @author shining
  * @description  会员模块
**/
import React, { Component } from 'react';  
import { observer, inject } from 'mobx-react';  
import classnames from 'classnames';
import moment from 'moment';
import { message } from 'antd';
import CalendarPopup from 'components/calendar-popup';
import DrawMoney from '../draw-money';

import MyScroll from 'react-custom-scrollbars';
import './recharge_history.less';

message.config({
	top: 300
});

@inject('memberStore') @observer
class RechargeHistory extends Component {

	constructor(props){
		super(props); 
		this.state={
			calendarPopup:'',
			dateValue:moment().format("YYYY-MM-DD"),
			rechargeValue:'',
			currentIndex:0
		}
		let cardID = this.props.params.cardID;
		this.props.memberStore.rechargeSearch(cardID,this.state.dateValue,'');
	}

	rechargeOnChange=(e)=>{
		this.setState({rechargeValue:e.target.value});
	}
	rechargeSubmitValue=()=>{
		this.setState({currentIndex:0});
		let cardID = this.props.params.cardID
		this.props.memberStore.rechargeSearch(cardID,this.state.dateValue,this.state.rechargeValue);
	}
	  
	render() { 
		let memberStore = this.props.memberStore;

		let popupBlock;
		if(memberStore.isShowOpenTicketPopup){
			popupBlock=<DrawMoney current={this.state.currentIndex}/>
		}

		let account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : {userName: ''};
		let permissionList = account.permissionList && account.permissionList.length ? account.permissionList : [];
		let reprint = permissionList.includes('MemberModule:Reprint');
		let supplementaryInvoice = permissionList.includes('MemberModule:SupplementaryInvoice');

		return (
			<div id="reacord-deatil" >
				<div className="member-title"> 
					<i className="iconfont icon-order_btn_back" 
						onClick={()=>{
							this.context.router.goBack();
							memberStore.rechargeList='';
						}}>
					</i>充值记录查询
				</div>
          		<div className="member_top"> 
				  	 <div className="input-calendar" >
						<p 	className='normalbg' onClick={()=>{
							this.setState({calendarPopup:<CalendarPopup 
								calendarModalCancel={()=>{
									this.setState({calendarPopup:""});
								}}  
								calendarModalOk={(time)=>{
									this.setState({dateValue:time});
									this.setState({calendarPopup:""});
								}}
							/>});
							}}>
							{this.state.dateValue}
						</p>
						<i className="iconfont icon-xinzenghuiyuan_icon_rili"></i>
					</div>
					<input  
						type="text" 
						placeholder="请输入收银员进行查询" 
						value={this.state.rechargeValue} 
						onChange={this.rechargeOnChange}
					/>
					<button onClick={this.rechargeSubmitValue}>
						<i className="iconfont icon-xinzenghuiyuan_icon_sousuo"></i>查询
					</button> 
				</div>
				<div className="list-data-main">
					<ul className="list-title">
						<li>序号</li>
						<li>充值时间</li>
						<li>充值方式</li>
						<li>充值金额</li>
						<li>赠送金额</li>
						<li>充值后余额</li>
						<li>收银员</li>
						<li>开票金额</li>
						
					</ul>
					<div className="list-content">
						<MyScroll>
							{memberStore.rechargeList&&memberStore.rechargeList.length?memberStore.rechargeList.map((recharge,index)=>{
								return <div key={index} className={classnames({
									"each-data":true,
									 "select":index===this.state.currentIndex
								})} onClick={()=>{
									this.setState({currentIndex:index});
									memberStore.chargeItemClick(recharge);
								}}>
									<span>{index+1}</span>
									<span>{recharge.rechargeTime}</span>
									<span>{recharge.paymentName}</span>
									<span>{recharge.rechargeValue.toFixed(2)}</span>
									<span>{recharge.largessValue.toFixed(2)}</span>
									<span>{recharge.afterRechargeValue.toFixed(2)}</span>
									<span>{recharge.loginName}</span>
									<span>{recharge.openBill.toFixed(2)}</span>
									
								</div>
							}):<div className="empty-holder">暂无充值记录</div>}
							
						</MyScroll>
					</div>
					<div className="records-button">
						 {reprint && <button 
							className={classnames({
								"disabled":!memberStore.rechargeItem
							})} 
							onClick={()=>{
								if(memberStore.rechargeItem){
			
									memberStore.againReceipt();
			
								}
								
							}}>重印
						 </button>}
						 {supplementaryInvoice && <button 
							className={classnames({
								"disabled":!memberStore.rechargeItem
							})} 
							onClick={()=>{
								if(memberStore.rechargeItem){

									if(memberStore.rechargeItem.openBill*1===0){
										memberStore.isShowOpenTicketPopup = true;
									}else{
										message.destroy();
										message.info("已开发票,不能再开",1);
									}									
										
								}
																								
							}}>补开发票
						 </button>}
					</div>
				</div>
				{this.state.calendarPopup}
				{popupBlock}
	    	</div>
		)
	}

}

RechargeHistory.wrappedComponent.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default RechargeHistory;
