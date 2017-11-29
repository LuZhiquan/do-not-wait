/**
* @author shelly
* @description 选择人员界面
* @date 2017-05-19
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import { Tabs, Modal  } from 'antd';
import classnames from 'classnames';

import './chosse_person_popup.less';

const TabPane = Tabs.TabPane;

@inject('messageStore') @observer
class ChoosePerson extends Component {
	constructor(props,context){
		super(props,context);
		this.state = { 
			tabPosition: 'left',
			 recordValue:''//搜索内容文本框
		}
		let messageStore=this.props.messageStore; 
		messageStore.getTransferPersonList();
	}

	//点击取消按钮
	handleCancel=()=>{  
		if(this.props.closebutton){
			this.props.closebutton();
		} 
	}

	//点击确定按钮
	handleOk=()=>{
		//执行转发的操作
		let messageStore=this.props.messageStore; 
		messageStore.gettransferMessage(messageStore.savemessageID,messageStore.saveloginID);
		if(this.props.okbutton){
			this.props.okbutton();
		}
	}

	//获取搜索的内容
    reachValue=(e)=>{
            var value = e.target.value;
            this.setState({recordValue:value});
    }
	
	render() {
	 	let messageStore=this.props.messageStore; 
		let roleList=messageStore.roleList;
		let personList=messageStore.personList; 

	    let choosePersonNameBlock = personList.map((element,index)=>{ 
			
			return  <li key={index} 
						className={classnames({
							"choose-name-btn":true,
							"selected": element.selected
						})}
						onClick={()=>{ 
								messageStore.checkedPersonList(element.loginID); 
						}}>
						{element.nickName}
					</li>
					});
	   
	   	   
        // 选择人员列表
        let chossePersonBlock;
            chossePersonBlock = roleList.map((ele,index)=>{ 
                return  <TabPane key={index} tab={
													<div onClick={()=>{ 
														messageStore.getTransferPersonListByRoleID(ele.roleID,'');
														messageStore.savesaveroleIDing(ele.roleID);
													}}>
														{ele.roleName}
													</div>
												} >
							<div className="choose-person-right">
								<ul className="choose-person-content">
									<Scrollbars>
										{choosePersonNameBlock}
									</Scrollbars>
								</ul>
							</div>
                        </TabPane>
            });   

		return (
			 <Modal title="选择人员" 
				visible={true} 
				maskClosable={false} 
				okText='确定' cancelText='取消'
				width={840} 
				wrapClassName="choose-person-popup-modal"
				onCancel={this.handleCancel}
				onOk={this.handleOk}
			 >
				<div className="search">
					<input type="text" className="search-input" placeholder="请输入员工姓名查询" onKeyUp={this.reachValue}/>
					<button className="search-btn" 
							onClick={()=>{
								messageStore.getTransferPersonListByRoleID(messageStore.saveroleID,this.state.recordValue);
							}}>
						<i className="iconfont icon-order_btn_search"></i>
						查询
					</button>
				</div>
				<Tabs defaultActiveKey="0" className="message-left" tabPosition={this.state.tabPosition}>
					{chossePersonBlock}
				</Tabs>
			</Modal>
		)

	}

}


export default ChoosePerson;