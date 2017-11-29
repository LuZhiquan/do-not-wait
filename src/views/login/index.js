/**
* @author William Cui
* @description 这是登录界面
* @date 2017-03-27
**/

import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { message } from 'antd';

import './login.less';

@inject('appStore')
@observer
class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loginName: '',
      password: '',
      visible: true,
      position: 'loginName',
      employCode: '',
      isCard: false
    };
  }

  inputData(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  login() {
    if (this.state.loginName === '' || this.state.password === '') {
      message.destroy();
      message.info('用户名和密码不能为空');
    } else {
      let { loginName, password } = this.state;
      this.props.appStore.login({ loginName, password });
    }
  }

  componentDidUpdate() {
    let appStore = this.props.appStore;
    let _this = this;

    if (this.state.isCard) {
      document.onkeydown = function (e) {
        if (/[a-zA-Z0-9]/.test(String.fromCharCode(e.which))) {
          let employCode = _this.state.employCode + e.key;
          _this.setState({ employCode });
        } else if (e.which === 13) {
          let employCode = _this.state.employCode;
          appStore.login({ employCode });
          _this.setState({ employCode: '' });
        }
      };
    } else {
      document.onkeydown = null;
    }
  }

  componentDidMount() {
    this.textInput.focus();
  }

  componentWillUnmount() {
    document.onkeydown = null;
  }

  // 点击数字键盘
  handleClick = e => {
    let value = e.target.innerHTML;
    if (this.state.position === 'loginName') {
      let inputVal = this.state.loginName.concat(value);
      this.setState({ loginName: inputVal });
    } else {
      let inputVal = this.state.password.concat(value);
      this.setState({ password: inputVal });
    }
  };

  // 点击退格
  handleBack = e => {
    if (this.state.position === 'loginName') {
      let inputVal = this.state.loginName;
      inputVal = inputVal.substring(0, inputVal.length - 1);
      this.setState({ loginName: inputVal });
    } else {
      let inputVal = this.state.password;
      inputVal = inputVal.substring(0, inputVal.length - 1);
      this.setState({ password: inputVal });
    }
  };

  // 点击清空
  handleClear = e => {
    if (this.state.position === 'loginName') {
      let inputVal = '';
      this.setState({ loginName: inputVal });
    } else if (this.state.position === 'password') {
      let inputVal = '';
      this.setState({ password: inputVal });
    }
  };

  render() {
    return (
      <div className="login-popup-modal">
        {this.state.isCard ? (
          <div>
            <div className="login-title">不用等餐饮平台</div>
            <div className="login-card">
              <div className="content">
                <div className="ca-title">请刷卡</div>
                <input
                  type="text"
                  className="card-input"
                  value={this.state.employCode}
                />
              </div>
              <div className="btns">
                <div>退出</div>
                <div
                  onClick={() => {
                    this.setState({ isCard: false });
                  }}
                >
                  手工登录
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="login-content">
            <div className="login-title">不用等餐饮平台</div>
            <div id="login">
              <input
                type="text"
                value={this.state.loginName}
                placeholder="用户名"
                id="account-num"
                style={{ imeMode: 'disabled' }}
                onChange={e => {
                  this.setState({ loginName: e.target.value });
                  this.inputData.bind(this);
                }}
                ref={input => {
                  this.textInput = input;
                }}
                onFocus={() => {
                  this.setState({ position: 'loginName' });
                }}
              />
              <input
                type="password"
                value={this.state.password}
                placeholder="密码"
                id="password"
                style={{ imeMode: 'disabled' }}
                onChange={e => {
                  this.setState({ password: e.target.value });
                  this.inputData.bind(this);
                }}
                onClick={() => {
                  this.setState({ position: 'password' });
                }}
              />
            </div>
            <div id="num-key">
              <ul>
                <li className="number" onClick={this.handleClick}>
                  1
                </li>
                <li className="number" onClick={this.handleClick}>
                  2
                </li>
                <li className="number" onClick={this.handleClick}>
                  3
                </li>
                <li
                  className="back iconfont icon-order_btn_back"
                  onClick={this.handleBack}
                />
                <li className="number" onClick={this.handleClick}>
                  4
                </li>
                <li className="number" onClick={this.handleClick}>
                  5
                </li>
                <li className="number" onClick={this.handleClick}>
                  6
                </li>
                <li className="clear-all" onClick={this.handleClear}>
                  清空
                </li>
                <li className="number" onClick={this.handleClick}>
                  7
                </li>
                <li className="number" onClick={this.handleClick}>
                  8
                </li>
                <li className="number" onClick={this.handleClick}>
                  9
                </li>
                <li className="cancel">退出</li>
                <li className="zero" onClick={this.handleClick}>
                  0
                </li>
                <li
                  className="cancel"
                  onClick={() => {
                    this.setState({ isCard: true });
                    this.setState({ employCode: '' });
                  }}
                >
                  刷卡
                </li>
                <li className="confirm" onClick={this.login.bind(this)}>
                  确定
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Login;
