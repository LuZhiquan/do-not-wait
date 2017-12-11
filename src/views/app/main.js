/**
* @author William Cui
* @description 主界面容器
* @date 2017-03-27
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import MessageBox from 'components/message-box'; //全局消息提示
import PromptPopup from 'components/prompt-popup';
import OpenClassPopup from '../app/open-class-popup'; //开班

const style = {
  width: '100%',
  height: '100%'
};

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

@inject('appStore')
@observer
class Main extends Component {
  state = {
    statePopup: false
  };

  showDayEnd = () => {
    let appStore = this.props.appStore;
    appStore.hideDayEnd();

    //显示上一营业日没有日结提示框
    this.setState({
      statePopup: (
        <PromptPopup
          okText="去日结"
          cancelText="知道了"
          onOk={() => {
            this.context.router.push('/day-end');
            this.setState({ statePopup: false });
          }}
          onCancel={() => {
            this.setState({ statePopup: false });
          }}
        >
          <div style={promptContStyle}>上一营业日还没日结</div>
        </PromptPopup>
      )
    });
  };

  showOpenClass() {
    let appStore = this.props.appStore;
    appStore.hideOpenClass();

    //还没有开班提示
    this.setState({
      statePopup: (
        <PromptPopup
          okText="去开班"
          cancelText="知道了"
          onOk={() => {
            this.setState({
              statePopup: (
                <OpenClassPopup
                  closeCancel={() => {
                    this.setState({ statePopup: false });
                  }}
                  okCancel={() => {
                    this.setState({ statePopup: false });
                  }}
                />
              )
            });
          }}
          onCancel={() => {
            this.setState({ statePopup: false });
          }}
        >
          <div style={promptContStyle}>开班后才能操作</div>
        </PromptPopup>
      )
    });
  }

  componentDidMount() {
    //未登录直接跳到登录页面
    if (!sessionStorage.getItem('account')) {
      this.context.router.push('/config');
    }

    //判断是否日结
    this.props.appStore.checkBeforeDailyWorking({});
  }

  componentDidUpdate() {
    let appStore = this.props.appStore;
    if (appStore.showDayEnd) {
      this.showDayEnd();
    }
    if (appStore.showOpenClass) {
      this.showOpenClass();
    }
  }

  render() {
    const { appStore } = this.props;
    return (
      <div id="main" style={style}>
        {this.props.children}
        {this.state.statePopup}
        <MessageBox />
        {appStore.showDayEnd}
        {appStore.showOpenClass}
      </div>
    );
  }
}

Main.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Main;
