/**
* * @author shining
  * @description  会员模块
**/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';  
import { browserHistory } from 'react-router';
import MyScroll from 'react-custom-scrollbars';
import classnames from 'classnames';
import { message } from 'antd';
import AddMembberPopup from './add-member-popup';
import AlertMembberPopup from './alter-member-popup';
import Viprecord from './viprecord-popup';
import AlterPassword from './alter-password-popup';
import ResetPassword from './reset-password-popup';
import PromptPopup from 'components/prompt-popup'

import { checkPermission } from 'common/utils';
import Accredit from 'components/accredit-popup';

import './member.less';
message.config({
	top: 300
});

const promptContStyle = {
  padding: '80px 20px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
}

function MemberDetail({detail}){

	let account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : {userName: ''};
	let permissionList = account.permissionList && account.permissionList.length ? account.permissionList : [];
	let queryRecharge = permissionList.includes('MemberModule:QueryRecharge');  //充值记录权限

	return <div className="member-datiel">
		<MyScroll>
			<p> 
				<span>姓名</span>
				<em>{detail.memberName}</em> 
			</p>
			<p> 
				<span>手机</span>
				<em>{detail.mobile}</em> 
			</p>
			<p> 
				<span>电子邮箱</span>
				<em className='my-email'>{detail.email}</em> 
			</p>
			<p> 
				<span>卡号</span>
				<em>{detail.cardCode}</em> 
			</p>
			<p> 
				<span>等级</span>
				<em>{detail.cardLevelName}</em> 
			</p>

			<p> 
				<span>业务员</span>
				<em>{detail.countermanName}</em> 
			</p>
			<p> 
				<span>有效期至</span>
				<em>{detail.validDate.split(' ')[0]}</em> 
			</p>
			<p className="last-money">
				<span>余额</span>
				<em>{detail.accountBalance.toFixed(2)}</em>
			</p>
			<p>
				<span>可用积分</span>
				<em>{detail.cardCurrentBonus}</em>
			</p>
			<p>
				<span>累计充值</span>
				<em>{detail.cumulateRecharge.toFixed(2)}
				
				{queryRecharge && <span className='recharge-history' 
				onClick={()=>{					
					browserHistory.push("/member/history/"+ detail.cardID);					
				}}>充值记录</span>}</em>
			</p>
			<p>
				<span>状态</span>
				<em>{detail.cardStatusName}</em>
			</p>
		</MyScroll>
	</div>
}

@inject('memberStore') @observer
class Member extends Component {

	constructor(props){
		super(props); 
		
		let memberStore=this.props.memberStore;
		let mindex = 0;
		if(memberStore.memberList&&memberStore.memberList.length>0){
			memberStore.memberList.forEach((member,index)=>{
				if(member.cardID===memberStore.currentMember.cardID){
					mindex= index;
				}
			});
		}
		this.state={
			currentMember:mindex,
			alterPopup:'',
			rechargePopup:'',
			alterPasswordPopup:'',
			frozenMember:'',
			cancelMember:'',
			accreditPopup:'',
			clickSearch:false

		}
	}

	render() { 
		 let memberStore=this.props.memberStore;
		 let addMemberBlock,alterMemberBlock,alterPasswordPopup,resetPasswordPopup,vipPopup;

		 if(memberStore.isShowAddMember){
			 addMemberBlock=<AddMembberPopup okClick={()=>{
				 this.setState({currentMember:0});
				// memberStore.getMemberItem(memberStore.currentMember.cardID);
			 }}/>
		 }

		 if(memberStore.isShowAlterMember){
			 alterMemberBlock=<AlertMembberPopup okClick={()=>{
				//修改预订。。。。。
			 }}/>
		 }
		 if(memberStore.isShowAlterPassword){
			alterPasswordPopup=<AlterPassword/>;
		 }

		 if(memberStore.isShowResetPassword){
			 resetPasswordPopup=<ResetPassword/>
		 }
		 if(memberStore.isShowVipPopup){
			 vipPopup=<Viprecord/>;
		 }

		 let frozenBlock;

		 if(memberStore.memberItem){
				if(memberStore.memberItem.cardStatus===721){
					frozenBlock=<button className={classnames({
							"disabled":!memberStore.memberItem||memberStore.memberItem.cardStatus!==721
						})} onClick={()=>{

						if(memberStore.memberItem&&memberStore.memberItem.cardStatus===721){
							let _this= this;
							let object = {
								moduleCode:"MemberModule",
								privilegeCode:"Frozen",
								title:'冻结',
								toDoSomething:function(){
									if(memberStore.memberItem&&memberStore.memberItem.cardStatus===721){
										_this.setState({frozenMember:<PromptPopup 
											onCancel={()=>{
												_this.setState({frozenMember:''});
											}} 
											onOk={()=>{
												_this.setState({frozenMember:''});
												memberStore.frozenMember();	
											}}>
											<div className="prompt" style={promptContStyle}> 
												<span className="delele-text">确定冻结会员卡{memberStore.memberItem.cardSerialNo}吗？</span>
											</div> 
										</PromptPopup>});							
									}								
								},
								closePopup:function(){
									_this.setState({accreditPopup:''})
								},		
								failed:function(){
									_this.setState({accreditPopup:<Accredit 
									module={{ 
										title:object.title, 
										moduleCode:object.moduleCode, 
										privilegeCode:object.privilegeCode 
									}} 
									onOk={()=>{
										object.closePopup();
										object.toDoSomething();
									}} 
									onCancel={()=>{
										object.closePopup();
									}}/>});
								}
							}
							checkPermission(object);

						}						
							
					}}>冻结</button>
				}else if(memberStore.memberItem.cardStatus===724){
					frozenBlock=<button className={classnames({
							"disabled":!memberStore.memberItem
						})} onClick={()=>{
							if(memberStore.memberItem&&memberStore.memberItem.cardStatus===724){
								let _this= this;
								let object = {
									moduleCode:"MemberModule",
									privilegeCode:"Thaw",
									title:'解冻',
									toDoSomething:function(){
										_this.setState({frozenMember:<PromptPopup 
										onCancel={()=>{
											_this.setState({frozenMember:''});
										}} onOk={()=>{
											_this.setState({frozenMember:''});
											memberStore.unfrozenMember();
											
										}}>
											<div className="prompt" style={promptContStyle}> 
												<span className="delele-text">确定解冻会员卡{memberStore.memberItem.cardSerialNo}吗？</span>
											</div> 
										</PromptPopup>});	
															
									},
									closePopup:function(){
										_this.setState({accreditPopup:''})
									},		
									failed:function(){
										_this.setState({accreditPopup:<Accredit 
										module={{ 
											title:object.title, 
											moduleCode:object.moduleCode, 
											privilegeCode:object.privilegeCode 
										}} 
										onOk={()=>{
											object.closePopup();
											object.toDoSomething();
										}} 
										onCancel={()=>{
											object.closePopup();
										}}/>});
									}
								}
								checkPermission(object);
														
							}
					}}>解冻</button>
				}else{
					frozenBlock=<button className={classnames({
					"disabled":true
					})}>冻结</button>
				}
		 }else{
			frozenBlock=<button className={classnames({
					"disabled":true
				})}>冻结</button>
		 }

		let account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : {userName: ''};
		let permissionList = account.permissionList && account.permissionList.length ? account.permissionList : [];
		let addmembers = permissionList.includes('MemberModule:Addmembers');//添加会员
		let changePassword = permissionList.includes('MemberModule:ChangePassword');//修改密码
		let recharge = permissionList.includes('MemberModule:Recharge');//充值权限

		 
		return (
			<div id="member_container" >
          		<div className="member_top"> 
					<input  type="text" 
						placeholder="请输入姓名/手机号/卡号查询" 
						value={memberStore.searchContent} 
						onChange={(e)=>{
							memberStore.search(e.target.value);
						}}
					/>
					<button onClick={()=>{

						
						this.setState({currentMember:0});
						this.setState({clickSearch:true});
						memberStore.getMemberList(()=>{
							if(memberStore.memberList&&memberStore.memberList.length>0){
								memberStore.getMemberItem(memberStore.memberList[0].cardID);
								memberStore.currentMember = memberStore.memberList[0];
							}
						});
						
						
					}}><i className="iconfont icon-xinzenghuiyuan_icon_sousuo"></i>查询</button>
					{addmembers && <button onClick={()=>{

						memberStore.addMemberClick();
							
					}}><i className="iconfont icon-huiyuanguanli_icon_xinzenghuiyuaneps"></i>新增会员</button>}
				</div>
				<div className="member-list">
					<MyScroll>
					{memberStore.memberList&&memberStore.memberList.length ? memberStore.memberList.map((member,index)=>{
						return <div key={index} className={classnames({
							"each-member":true,
							 "select":index===this.state.currentMember
						})} onClick={()=>{

							memberStore.currentMember = member;
							this.setState({currentMember:index});
							memberStore.getMemberItem(member.cardID);
							
						}}>
							<span>{member.cardSerialNo}</span>
							<span>{member.roleName}</span>
							<span>{member.memberName}</span>
							<span>{member.memberMobile}</span>
							{false&&<span>余额：<em>{member.realAmount}</em></span>}
						</div> 
					}) : <div className="empty-holder">{this.state.clickSearch?"未找到相关数据":"请查询"}</div>}						
					</MyScroll>
				</div>
				{memberStore.memberList&&memberStore.memberList.length>0&&<div className="member-button">
					{recharge && <button className={classnames({
						"disabled":!memberStore.memberItem||memberStore.memberItem.cardStatus!==721
					})} onClick={()=>{

						if(memberStore.memberItem&&memberStore.memberItem.cardStatus===721){
							memberStore.showVipPopup();
						}
						
					}}>充值</button>}
					{false&&<button className={classnames({
						"disabled":!memberStore.memberItem||memberStore.memberItem.cardStatus!==721
					})} onClick={()=>{

						if(memberStore.memberItem&&memberStore.memberItem.cardStatus===721){
							memberStore.showAlterPopup();
						}

					}}>修改资料</button>}
					{changePassword && <button  className={classnames({
						"disabled":!memberStore.memberItem||memberStore.memberItem.cardStatus!==721
					})} onClick={()=>{	

						if(memberStore.memberItem&&memberStore.memberItem.cardStatus===721){
							
							memberStore.alterPasswordPopup();
							
						}								
					}}>修改密码</button>}
					<button className={classnames({
						"disabled":!memberStore.memberItem||memberStore.memberItem.cardStatus!==721
					})} onClick={()=>{
			
						if(memberStore.memberItem&&memberStore.memberItem.cardStatus===721){
							let _this= this;
							let object = {
								moduleCode:"MemberModule",
								privilegeCode:"ReSetPassword",
								title:'重置密码',
								toDoSomething:function(){
									if(memberStore.memberItem&&memberStore.memberItem.cardStatus===721){
										memberStore.showResetPassword();
									}
																		
								},
								closePopup:function(){
									_this.setState({accreditPopup:''})
								},		
								failed:function(){
									
									_this.setState({accreditPopup:<Accredit module={{ 
										title:object.title, 
										moduleCode:object.moduleCode, 
										privilegeCode:object.privilegeCode 
									}} 
									onOk={()=>{
										object.closePopup();
										object.toDoSomething();
									}} 
									onCancel={()=>{
										object.closePopup();
									}}/>});
								}
							}
							checkPermission(object);

						}
						
												
					}}>重置密码</button> 
					{frozenBlock}
					<button className={classnames({
						"disabled":!memberStore.memberItem||memberStore.memberItem.cardStatus===722
					})} onClick={()=>{

						if(memberStore.memberItem&&memberStore.memberItem.cardStatus!==722){
							let _this= this;
							let object = {
								moduleCode:"MemberModule",
								privilegeCode:"Cancellation",
								title:'注销',
								toDoSomething:function(){

									if(memberStore.memberItem&&memberStore.memberItem.cardStatus!==722){
										_this.setState({cancelMember:<PromptPopup 
											onCancel={()=>{
												_this.setState({cancelMember:""});
											}} 
											onOk={()=>{
												_this.setState({cancelMember:""});
												memberStore.cancelMember();
												
											}}>
											<div className="prompt" style={promptContStyle}>
												<span className="delele-text">确定注销会员卡{memberStore.memberItem.cardSerialNo}吗？</span>
												<div className="my-delete-text">
													（本金余额{memberStore.memberItem.accountBalance.toFixed(2)}，积分{memberStore.memberItem.cardCurrentBonus}）
												</div>
											</div>
										</PromptPopup>});							
									}
								},
								closePopup:function(){
									_this.setState({accreditPopup:''})
								},		
								failed:function(){
									
									_this.setState({accreditPopup:<Accredit 
										module={{ 
											title:object.title, 
											moduleCode:object.moduleCode, 
											privilegeCode:object.privilegeCode 
										}} 
										onOk={()=>{
											object.closePopup();
											object.toDoSomething();
										}} 
										onCancel={()=>{
											object.closePopup();
										}}
									/>});
								}
							}
							checkPermission(object);
							
						}						
						
					}}>注销</button>
				</div>}

				{
					memberStore.memberItem?
					<MemberDetail detail={memberStore.memberItem}/>:
					<div className="member-datiel">
						<div className="empty-holder">暂无会员资料</div>
					</div>
				}
				
				{addMemberBlock}
				{alterMemberBlock}
				{alterPasswordPopup}
				{resetPasswordPopup}
				{this.state.frozenMember}
				{this.state.cancelMember}
				{vipPopup}
				{this.state.rechargePopup}
				{this.state.accreditPopup}
				
	    	</div>
		)
	}

}

export default Member;
