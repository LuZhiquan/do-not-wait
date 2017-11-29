/* 离线服务器配置 */
import React from 'react';
import { observer, inject } from 'mobx-react';
import { message } from 'antd';
import classnames from 'classnames';

import PromptPopup from 'components/prompt-popup';
import { getJSON } from 'common/utils';

import './config.css';
const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

@inject('appStore')
@observer
class Config extends React.Component {
  constructor(props) {
    super(props);

    this.getReadyCashers();
  }

  state = {
    visibled: true,
    company: '',
    casherID: '',
    casherList: [],
    hasUpdate: false,
    statePopup: false
  };

  handleClick = () => {};

  //获取可选的收银机
  getReadyCashers = () => {
    const _this = this;
    getJSON({
      url: '/reception/config/getReadyCashers',
      success: function(json) {
        if (json.code === 0) {
          const company = json.data.company;
          const casherList = json.data.cashers;
          const hasUpdate = json.data.hasUpdate;
          _this.setState({
            company,
            casherList,
            hasUpdate
          });
        } else {
          //获取数据失败反馈
          message.destroy();
          message.error(json.message);
        }
      }
    });
  };

  //选择收银机
  selectCasher = ({ casherID }) => {
    const _this = this;
    getJSON({
      url: '/reception/config/selectCasher',
      data: { casherID },
      success: function(json) {
        if (json.code === 0) {
          _this.context.router.push('/');
        } else {
          //获取数据失败反馈
          message.destroy();
          message.error(json.message);
        }
      }
    });
  };

  update = isUpdate => {
    getJSON({
      url: '/version/isUpdate',
      data: { isUpdate },
      success: function(json) {
        if (json.code === 0) {
          message.success('进入更新...');
        } else {
          //获取数据失败反馈
          message.destroy();
          message.error(json.message);
        }
      }
    });
  };

  handleClose = () => {
    this.setState({
      hasUpdate: false
    });
  };

  handleCanle = () => {
    this.setState({ visibled: true });
    this.setState({ pass: true });
  };

  render() {
    let { company, casherID, casherList } = this.state;
    let block = (
      <button className="only-one-btn" onClick={this.handleClick}>
        下一步
      </button>
    );
    let wrap;
    if (this.state.pass) {
      block = (
        <div className="two-btn-wrap">
          <button className="two-btn" onClick={this.handleCanle}>
            取消
          </button>
          <button
            className="two-btn btn-active"
            onClick={this.handleNextBtn}
            style={{ marginLeft: 70 }}
          >
            下一步
          </button>
        </div>
      );
    } else {
      block = (
        <button className="only-one-btn" onClick={this.handleClick}>
          下一步
        </button>
      );
    }

    if (this.state.visibled) {
      wrap = (
        <div className="wrap">
          <div className="content">
            <p className="restaurant-name">{company}</p>
          </div>
          <div className="area-choose">
            {!!casherList.length &&
              casherList.map(casher => {
                return (
                  <div
                    key={casher.casherID}
                    className={classnames({
                      'myBtn-165-70': true,
                      'btn-active': casher.casherID === casherID
                    })}
                    onClick={() => {
                      this.setState({
                        casherID: casher.casherID
                      });
                    }}
                  >
                    {casher.casherName}
                  </div>
                );
              })}
          </div>
          <div className="two-btn-wrap">
            {false && (
              <button className="two-btn" onClick={this.handleReset}>
                服务器重设
              </button>
            )}
            <button
              className="two-btn btn-active"
              onClick={() => {
                if (casherID) {
                  this.selectCasher({ casherID });
                } else {
                  message.destroy();
                  message.info('请选择收银机！');
                }
              }}
            >
              下一步
            </button>
          </div>
        </div>
      );
    } else {
      wrap = (
        <div className="wrap">
          <div className="content">
            <p>IP</p>
            <div className="ip-num">
              <input
                type="number"
                vlaue={this.state.ip1}
                onChange={e => {
                  this.setState({ ip1: e.target.value });
                }}
              />
              <span>—</span>
              <input
                type="number"
                vlaue={this.state.ip2}
                onChange={e => {
                  this.setState({ ip2: e.target.value });
                }}
              />
              <span>—</span>
              <input
                type="number"
                vlaue={this.state.ip3}
                onChange={e => {
                  this.setState({ ip3: e.target.value });
                }}
              />
              <span>—</span>
              <input
                type="number"
                vlaue={this.state.ip4}
                onChange={e => {
                  this.setState({ ip4: e.target.value });
                }}
              />
            </div>
          </div>
          <div className="content">
            <p>端口</p>
            <div className="port-num">
              <input
                type="text"
                vlaue={this.state.port}
                onChange={e => {
                  console.log(e.target.value);
                  this.setState({ port: e.target.value });
                }}
              />
            </div>
          </div>
          {block}
        </div>
      );
    }
    return (
      <div id="ipSet">
        <div className="title">选择收银机</div>
        <div id="alert-message" />
        {wrap}
        {this.state.hasUpdate && (
          <PromptPopup
            onOk={() => {
              this.handleClose();
              this.update(true);
            }}
            onCancel={() => {
              this.handleClose();
              this.update(false);
            }}
          >
            <div style={promptContStyle}>有新的版本，是否有要更新？</div>
          </PromptPopup>
        )}
      </div>
    );
  }
}

Config.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Config;
