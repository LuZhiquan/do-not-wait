/**
* @author shelly
* @description 消息中心界面
* @date 2017-05-19
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import { Tabs,message,Badge  } from 'antd';
import { browserHistory } from 'react-router'; //路径跳转 
import ChoosePerson from './chosse-person-popup';
import Prompt from 'components/prompt-common';//错误提示
import PromptPopup from 'components/prompt-popup';
import OpenClassPopup from '../app/open-class-popup';//开班
import classnames from 'classnames';  

import'assets/styles/modal.css';
import './message.less';

const TabPane = Tabs.TabPane;

message.config({
	top: 300 
});

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
}
 

@inject('appStore','messageStore') @observer
class Message extends Component {
	constructor(props,context){
		super(props,context);
		this.state = { 
			tabPosition: 'left',
			chooseperson:'',
			statePopup:'',
			
		}
		let messageStore=this.props.messageStore; 
		messageStore.getMessageList(0,0); 
		messageStore.getTakeeffect();
	}

	componentDidUpdate() {
        let messageStore=this.props.messageStore;  
        let feedback = messageStore.feedback; 
        if(feedback) {
        //提示
            switch(feedback.status) {
                case 'success':
                    message.success(feedback.msg,messageStore.closeFeedback());
                    break;
                case 'warn':
                    message.warn(feedback.msg,messageStore.closeFeedback());
                    break;
                case 'error':
                    message.warn(feedback.msg,messageStore.closeFeedback());
                    break;
                default:
                    message.info(feedback.msg,messageStore.closeFeedback());
            }
        }    
    }
 

	//未处理消息
	unprocessedmessage=()=>{
		let messageStore=this.props.messageStore; 
		messageStore.saveclickbutton(0); 
		messageStore.getMessageList(messageStore.settingID,0); 

	}


	//全部消息
	allmessages=()=>{ 
		 
		let messageStore=this.props.messageStore;  
		messageStore.saveclickbutton(1); 
		messageStore.getMessageList(messageStore.settingID,1); 
	}

	//完成
	finish = ({businessStatus,sMSID}) =>{ 
		let messageStore=this.props.messageStore;  
		messageStore.getupdateMessage(sMSID,businessStatus); 

	}


	checkOpenClass({type}) {
		this.setState({
		statePopup: <PromptPopup 
			okText="去开班" 
			cancelText="知道了"
			onOk={() => { 
			this.setState({
				statePopup: <OpenClassPopup 
					closeCancel={()=>{
						this.setState({statePopup: ''}); 
					}}
					okCancel={()=>{
						this.setState({statePopup: ''}); 
					}}
				>
				</OpenClassPopup>
			})
			}}
			onCancel={() => {
			this.setState({statePopup: ''});
			}}
		>
			<div style={promptContStyle}>开班后才能{type==='temporarily' ? '暂结' : '结账'}</div>
		</PromptPopup>
		})
	}

	//打开
	openurl=({catalogID,subOrderID,tableID})=>{
         let messageStore=this.props.messageStore;  
		 let appStore=this.props.appStore; 
		  switch(catalogID) { 
			case 2: //餐中服务 
				messageStore.getOrderStatus({subOrderID:subOrderID});   
				break; 
			case 4: //自助结账 
				appStore.isInWorking({
					success: () => {
						appStore.validateSettlement({
							subOrderID:subOrderID,
							success:()=>{  
								browserHistory.push('/settlement/'+tableID+'/'+subOrderID); //打开结账页面 
							},
							checkOpenClass: this.checkOpenClass.bind(this, {type: 'settlement'}),
							failure:({feedback})=>{
								this.setState({statePopup:<Prompt message={feedback} />});
								feedback.cancelClick=()=>{
									this.setState({statePopup:''});
								}
								feedback.okClick=()=>{
									this.setState({statePopup:''});
								}  
							}
						})
					}
				})
					 
				break;
			case 5: //预定监控
				browserHistory.push('/booking'); //打开预订单详情界面
				break; 
			case 6: //预定取消
				browserHistory.push('/booking'); //打开预订单详情界面
				break; 
			case 7: //预定超时
				browserHistory.push('/booking'); //打开预订单详情界面
				break; 
			case 8: //出品超时间
				browserHistory.push('/order'); //打开订单页面
				break;  
			case 44: //沽清相关 
				if(messageStore.Takeeffect){
					browserHistory.push('/sellout/after'); //沽清相关后
				}else{
					browserHistory.push('/sellout'); //沽清相关前	
				}
				break;    
			default:
			}
	}

 


	render() {
		let account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : {userName: ''};
        let permissionList = account.permissionList && account.permissionList.length ? account.permissionList : [];
		let Handle = permissionList.includes('MessageCenter:Handle');//处理
		let Forward = permissionList.includes('MessageCenter:Forward');//转发
		let messageStore = this.props.messageStore; 
		let messageCountList = messageStore.messageCountList; 
		let messageList = messageStore.messageList;  
		let feedback = messageStore.feedback;
		let operatePrompt;
		if(feedback && feedback.status === 'error') {
			//错误提示
			feedback.okClick = () =>{
			if(feedback.confirmClick) feedback.confirmClick();
			feedback.cancelClick();
			}
			feedback.cancelClick = () =>{
			messageStore.closeFeedback();
			}
			operatePrompt = <Prompt message={feedback} />
		}

		//列表
		let messageContentBlock = messageList.length === 0 ?<div className="empty-holder">暂无数据</div> :  messageList.map((element,i)=>{ 
									
									return  <li key={i}>
												<span  className="num">{element.index +1}</span>
												<span  className="time">{element.createTime}</span>
												<span  className="messageType">{element.settingDesc}</span>
												<span  className="table-num">{element.tableName}</span>
												<span   className={classnames({
															"spanleft":element.sMSContent > 15, 
														})}>{element.sMSContent}</span>
												<span  className="processor">{element.nickName}</span>
												<span  className="status">{element.statusDesc}</span>
												<span  className="operate">
													{element.dictionaryID === 675 && <button onClick={this.finish.bind(this,{businessStatus:677,sMSID:element.messageID})}>完成</button>} 
													{(element.dictionaryID === 676 && Handle) && <button onClick={this.finish.bind(this,{businessStatus:675,sMSID:element.messageID})}>受理</button>}
													{(Forward && (element.dictionaryID === 676 ||element.dictionaryID === 675)) &&
														<button 
																onClick={()=>{
																	messageStore.savemessageIDing( element.messageID); 	
																	this.setState({chooseperson:
																				<ChoosePerson 
																						closebutton={()=>{
																							this.setState({chooseperson:''})
																						}}
																						okbutton={()=>{
																							this.setState({chooseperson:''})
																						}}>
																				</ChoosePerson>
																				}) 
																}}>转发
														</button>	
													}
													
													{(element.catalogID === 2 || 
													  element.catalogID === 4 || 
													  element.catalogID === 5 || 
													  element.catalogID === 6 || 
													  element.catalogID === 7 || 
													  element.catalogID === 8 || 
													  element.catalogID === 44)  && 	<button 
																						onClick={
																							this.openurl.bind(
																								this,
																								{catalogID:element.catalogID,
																								subOrderID:element.subOrderID,
																								tableID:element.tableID})}
																						>打开
																					</button>
												    } 
												
												</span>
											</li>
										}); 

        //   消息列表
        let messageBlock;
            messageBlock = messageCountList.map((ele,i)=>{  
                   return  <TabPane key={i}  
									 tab={
										<div onClick={()=>{ 
												messageStore.saveclickbutton(0);
												messageStore.getMessageList(ele.settingID,0);
												messageStore.settingIDing(ele.settingID);
											}}>
											{ele.settingDesc} 
											
											 <Badge count={ele.num} />
										</div>
									}>
							<div className="message-right">
								<div className="message-right-top">
									<button className={messageStore.clickbutton === 0 ? 'selected' : ''} onClick={this.unprocessedmessage}>未处理消息</button>
									<button className={messageStore.clickbutton === 1 ? 'selected' : ''} onClick={this.allmessages}>全部消息</button>
								</div>
								<div className="message-right-content">
									<ul className="table-head">
										<li className="num">序号</li>
										<li className="time">时间</li>
										<li className="messageType">消息类型</li>
										<li className="table-num">桌台</li>
										<li className="message-content">消息内容</li>
										<li className="processor">处理人</li>
										<li className="status">状态</li>
										<li className="operate">操作</li>
									</ul>
									<ul className="table-body">
										<Scrollbars> 
											{messageContentBlock}
										</Scrollbars>
											
									</ul>
								</div>
							</div>
                        </TabPane>
            });           


		return (
			<div id="message" className="clearfix">
				<div className="title">
					<i className="iconfont icon-order_btn_back" onClick={() => {
						//返回桌台界面
						this.context.router.goBack();
					}}></i>
					消息中心
				</div>
				<Tabs defaultActiveKey="0" className="message-left" tabPosition={this.state.tabPosition}>
					{messageBlock}
				</Tabs>
				{this.state.chooseperson}
				{operatePrompt}
				{this.state.statePopup}
			</div>
		)

	}

}
/**************** 消息中心主容器组件 *****************/

Message.wrappedComponent.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default Message;