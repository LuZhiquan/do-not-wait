/**
* @author William Cui
* @description 接收信息弹窗界面
* @date 2017-05-20
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { browserHistory } from 'react-router';

import './message_box.less';

@inject('appStore') @observer
class MessageBox extends Component {

	state = {
		intervalTimer: ''
	}

	handleCancel=()=>{
		let { closeHandle } = this.props;
		closeHandle && closeHandle();
	}

	componentDidMount() {
		// let { appStore } = this.props;
		// let intervalTimer = setInterval(appStore.getMessage,1000);
		// this.setState({intervalTimer});
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalTimer);
	}

	render() {
		let msg='';
		let messageCount='';
		let { appStore } = this.props;
		let show = appStore.messageList && appStore.messageList.length;
		if(appStore.messageList && appStore.messageList.length) {
			msg = appStore.messageList[0];
			messageCount = appStore.messageCount;
			messageCount = messageCount>1 ? `(${messageCount})` : '';
		}
		return <div 
			className={classnames({
				'message-box': true,
				'show': !!show
			})}
			onClick={() => {
				browserHistory.push('/message');
			}}
		>
			{!!show && `${messageCount}[${msg.settingDesc}]${msg.tableName}${msg.sMSContent}`}
			<i className="message-close iconfont icon-pop_close-" onClick={(e) => {
				e.stopPropagation();
				appStore.clearMessageList();
			}}></i>
		</div>
	}
}


export default MessageBox;