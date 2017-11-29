/**
* @author shelly
* @description 选择人员界面
* @date 2017-05-19
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {  Modal  } from 'antd';

import './message_recover.less';

@inject('messageStore') @observer
class MessageRecover extends Component {
	handleCancel=()=>{
		this.props.messageStore.closeMessageRecoverPopup();
	}
	handleOk=()=>{
		this.props.messageStore.closeMessageRecoverPopup();
	}
	render() {
		return (
			 <Modal title="消息恢复" 
				visible={true} 
				maskClosable={false} 
				okText='确定' cancelText='取消'
				width={600}
				wrapClassName="message-recover-popup-modal"
				onCancel={this.handleCancel}
				onOk={this.handleOk}
			>
				<div className="text">确定要恢复消息吗？</div>
			</Modal>
		)

	}

}


export default MessageRecover;