import React from 'react';
import { observer, inject } from 'mobx-react';  
import classnames from 'classnames';
import { Modal, message } from 'antd';
import './viprecord.less'; 
import CommonKeyboardNum from '../common-keyboard-num';//键盘
import PromptPopup from 'components/prompt-popup';
import Loading from 'components/loading';

import SelectWaiterPopup from '../select-waiter-popup';
import WechatPay from 'components/wechat-pay-popup';


message.config({
	top: 300
});

const promptContStyle = {
  padding: '80px 20px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
}

function VipRecord({detail}){
	return 	<div className="vip-record">
			<div className="vip-icon">
				<i className="iconfont icon-huiyuandangan_icon_user-"></i>
			</div>
			<div className="vip-block">
				<div>
					<span className="bl-title">姓名：</span>
					{detail?detail.memberName:''}
				</div>
				<div className="block-top">
					<span className="bl-title">电话：</span>
					{detail?detail.mobile:''}
				</div> 
			</div>
			<div className="vip-block">
				<div>
					<span className="bl-title fen-ge">卡号：</span>
					{detail?detail.cardSerialNo:''}
				</div>
				<div className="block-top">
					<span className="bl-title fen-ge">账户余额：</span>
					{detail?detail.accountBalance.toFixed(2):''}
				</div>
				<div className="block-top">
					<span className="bl-title fen-ge">累计充值：</span>
					{detail?detail.cumulateRecharge.toFixed(2):""}
				</div>
			</div>
			<div className="vip-block">
				<div>
					<span className="bl-title fen-ge">等级：</span>
					{detail?detail.cardLevelName:''}
				</div>
				<div className="block-top">
					<span className="bl-title fen-ge">账户积分：</span>
					{detail?detail.cardCurrentBonus:''}
				</div>
				<div className="block-top">
					<span className="bl-title fen-ge">累计消费：</span>
					{detail?detail.cumulateConsume.toFixed(2):''}
				</div>
			</div>
		</div> 
}

@inject('memberStore','appStore') @observer
class Viprecord extends React.Component {
  
	constructor(props){
		super(props);
		this.state={
			result:'',
			countermanPopup:'',
			signInvoice:false,
			currentIndex:0,
			currentText:'现金',
			confirmPopup:'',
			statePopup: false,
			loading:false
		};
		this.props.memberStore.initialVip();
		
		if(this.props.cardID){
			
			let memberStore=this.props.memberStore;
			memberStore.getMemberItem(this.props.cardID);
		}
	}

	

	handleCancel=()=>{
		this.props.memberStore.initialVip();
		this.props.memberStore.cancelVipClick();
	} 

	handleOk=()=>{		
		let appStore = this.props.appStore;
		appStore.isInWorking({success:()=>{

			if(this.state.result*1>0){
				this.props.memberStore.showVipConfirm();
			}else{
				message.destroy();
				message.warn("充值金额要大于0",1);
			}
			
		}});
				
	}  
  
  render() {
		 let memberStore=this.props.memberStore;

		 let payBlock;
		 //"现金","微信","支付宝",'K币','银联卡','信用卡'
		 let payStyles=["现金","微信","支付宝"];
		 payBlock=payStyles.map((pay,index)=>{
			 return <button 
				onClick={()=>{
					this.setState({currentIndex:index});
					this.setState({currentText:pay});
				}} 
				key={index} 
				className={classnames({
					"select":index===this.state.currentIndex
				})}>
				{pay}
			 </button>
		 });

		 let confirmPopup;
		 let countermanID,countermanName,signInvoice,ruleID;

		 memberStore.operateWaiter.loginID?
		 countermanID=memberStore.operateWaiter.loginID:
		 countermanID=0;

		 memberStore.operateWaiter.userName?
		 countermanName=memberStore.operateWaiter.userName:
		 countermanName='';
		 
		 
		 if(memberStore.isShowVipConfirm){

			let depositType,depositName;
				switch(this.state.currentIndex){
					case 0:
						depositType=5;
						depositName="现金";
					break;
					case 1:
						depositType=6;
						depositName="微信";
					break;
					case 2:
						depositType=7;
						depositName="支付宝";
					break;
					// case 3:
					// 	depositType=4; 
					// 	depositName='K币';
					// break;
					// case 4:
					// 	depositType=3;
					// 	depositName='银联卡';
					// break;
					// case 5:
					// 	depositType=0;
					// 	depositName='信用卡';
					//break;
					default:
					break;
				}
				
				
				memberStore.rechargeRule.ruleID?
				ruleID=memberStore.rechargeRule.ruleID:
				ruleID=0;

				this.state.signInvoice?
				signInvoice=1:
				signInvoice=0;

				let recharge={
					customerID:memberStore.memberItem.customerID,
					cardID:memberStore.memberItem.cardID,
					deposit:this.state.result,
					present:memberStore.rechargeRule.presentAmount,
					fraction:memberStore.rechargeRule.presentBonus,
					depositType:depositType,
					depositName:depositName,
					authCode:'',
					countermanID:countermanID,
					countermanName:countermanName,
					ruleID:ruleID,
					signInvoice:signInvoice,
				}

			if(this.state.currentIndex===0){
				confirmPopup =<PromptPopup 
					onCancel={()=>{
						this.props.memberStore.cancelVipConfirm();
					}} 
					onOk={()=>{
							//"现金","微信","支付宝",'K币','银联卡','信用卡'	
					
						this.props.memberStore.submitMemberRecharge(recharge,(cardID)=>{
							this.setState({loading:<Loading/>});
							setTimeout(()=>{
								this.setState({loading:false});
								
            					memberStore.isShowVipPopup = false;
								memberStore.getMemberList();
								memberStore.getMemberItem(cardID);
							},2000)
						});						
						
					}}>
					<div 
						className="prompt" 
						style={promptContStyle}>
						<div className="delele-text">确定对会员卡({this.props.memberStore.memberItem.cardSerialNo})充值
						<span>{(this.state.result*1).toFixed(2)}元({this.state.currentText}）</span>吗？
						</div>
					</div>
				</PromptPopup>
		 	} else{
				confirmPopup=<WechatPay 
					title={depositName+"支付"}
					inputValue={this.state.result} 
					onCancel={()=>{
						if(memberStore.canClick){
							this.props.memberStore.cancelVipConfirm();
						}
						
					}} 
					onOk={(result)=>{
						
						recharge.authCode=result;

						if(memberStore.canClick){
							this.setState({loading:<Loading/>});
							this.props.memberStore.submitMemberRecharge(recharge,(cardID,success)=>{
	
								if(success){
									setTimeout(()=>{
										this.setState({loading:false});
										
										memberStore.isShowVipPopup=false;
										memberStore.getMemberList();
										memberStore.getMemberItem(cardID);
									},2000)
								}else{
									this.setState({loading:false});
									
								}	
							});		
						}
										
						
					}}
				/>
			}
				
		 }
		 
		
    return (
      <div> 
        <Modal title="会员充值" visible={true} maskClosable={false}   
            onCancel={this.handleCancel}
            onOk={this.handleOk}  
            width={865} wrapClassName="vip-popup-modal"
        >
        <div className="modal-content">
	        <div className="modal-data">
						
				<VipRecord detail={memberStore.memberItem}/>

				<div className="vip-conten">
					<p className='recharge-money'>
						<span>本次充值:</span>
						<em>￥<input type='text' 
							value={this.state.result} 
							readOnly
						/></em>
						<b 
							onClick={()=>{
								this.setState({signInvoice:!this.state.signInvoice});
							}}>
							{
								this.state.signInvoice?
								<i className="iconfont icon-icon_checkbox_sel-"></i>:
								<i className="iconfont icon-icon_checkbox_dis"></i>
							}
							开发票
						</b>
					</p>
					<p>
						<span>赠送金额:</span>
						<em>{memberStore.rechargeRule?memberStore.rechargeRule.presentAmount:''}</em>
					</p>
						<p>
						<span>赠送积分:</span>
						<em>{memberStore.rechargeRule?memberStore.rechargeRule.presentBonus:''}</em> 
					</p>
					{false && <p>
						<span>业务员:</span>
						<em>{countermanName}</em> 
						<i 
							className="iconfont icon-huiyuanguanli_icon_ziliao waiter" 
							onClick={()=>{
								this.setState({countermanPopup:<SelectWaiterPopup 
									cancelClick={()=>{
											this.setState({countermanPopup:''});
									}} 
									okClick={()=>{
											this.setState({countermanPopup:''});
									}}
								/>});
							}}>
						</i>
					</p>}
					<p>
						<span>结算方式:</span>
					</p> 

					<div className="btn-lis">
						{payBlock}
					</div>
					
				</div>
				<div className="kecord-num">
					<CommonKeyboardNum 
						width={319} 
						height={289} 
						Whetherpoint 
						getResult={(result)=>{
							this.setState({result:result});
							if(result>0){
								memberStore.getRechargeCalc(result,memberStore.memberItem.roleID);
							}else{
								memberStore.rechargeRule='';
							}
							
						}}>
					</CommonKeyboardNum>
				</div>
		      </div>		    	 
			</div>
			{this.state.loading}
			
		</Modal>
				{confirmPopup}
				{this.state.countermanPopup}
				{this.state.statePopup}
			
      </div>
    );
  }
}

export default Viprecord;