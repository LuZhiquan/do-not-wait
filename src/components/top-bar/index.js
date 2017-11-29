/**
* @author William Cui
* @description 顶部条
* @date 2017-08-18
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Badge } from 'antd';

import Prompt from 'components/prompt-common'; //错误提示
import Clock from 'components/clock'; //时钟
import 'assets/styles/index/index_top.css';

@inject('appStore')
@observer
class TopBar extends Component {
  render() {
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let QueryMessage = permissionList.includes('MessageCenter:QueryMessage'); //消费中心

    let { appStore } = this.props;
    let feedback = appStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        appStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    let messageCount = appStore.messageCount;

    return (
      <div id="deskTop">
        <div className="top-l-block">
          <span className="time">
            <Clock />
          </span>
          <span>{appStore.mealName}</span>
        </div>
        <div className="top-c-block">(发布时间) 2017-11-28 18:05</div>
        <div className="top-r-block">
          {QueryMessage && (
            <div
              className="top-point"
              onClick={() => {
                this.context.router.push('/message');
              }}
            >
              <i className="iconfont icon-home_xiaoxi" />
              {!!messageCount && <Badge count={messageCount} />}
            </div>
          )}
          <div>{account.userName}</div>
          <div
            onClick={() => {
              appStore.logout();
            }}
          >
            注销
          </div>
        </div>
        {operatePrompt}
      </div>
    );
  }
}

TopBar.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default TopBar;
