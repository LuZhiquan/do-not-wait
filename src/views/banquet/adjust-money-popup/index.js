/**
* @author gm
* @description 取消预订原因弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { Modal, Menu, Icon, Dropdown } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import CommonKeyboardNum from 'components/common-keyboard-num';
import { message } from 'antd';

import './adjust_money.less';

message.config({
  top: 300
});

@inject('banquetCreateStore')
@observer
class AdjustMoney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      money: '',
      reason: '',
      current: -1,
      amountList: ['增加费用', '减少费用'],
      amountIndex: 0
    };

    let { banquetCreateStore } = this.props;
    banquetCreateStore.getAdjustReason();
  }

  handleOk = () => {
    let { banquetCreateStore, bookingID } = this.props;

    let reason, adjustType, adjustAmount;
    if (this.state.current >= 0) {
      reason = banquetCreateStore.adjustReasons[this.state.current];
    } else {
      reason = this.state.reason;
    }

    if (this.state.amountIndex === 0) {
      adjustType = '+';
    } else {
      adjustType = '-';
    }

    if (this.state.money) {
      adjustAmount = this.state.money * 1;
    } else {
      adjustAmount = 0;
    }
    if (reason) {
      banquetCreateStore.adjustAmount(
        { bookingID, reason, adjustType, adjustAmount },
        pendingAmount => {
          if (this.props.handleOk) {
            this.props.handleOk(
              this.state.amountIndex,
              this.state.money,
              pendingAmount
            );
          }
        }
      );
    } else {
      message.destroy();
      message.warn('请选择原因', 1);
    }
  };

  handleCancel = () => {
    if (this.props.handleCancel) {
      this.props.handleCancel();
    }
  };

  render() {
    const menu = (
      <Menu
        id="adjust_menu"
        onClick={({ key }) => {
          this.setState({ amountIndex: key });
        }}
      >
        {this.state.amountList.map((item, index) => {
          return <Menu.Item key={index}>{item}</Menu.Item>;
        })}
      </Menu>
    );
    let { banquetCreateStore } = this.props;

    return (
      <div>
        <Modal
          title="调整费用输入"
          visible={true}
          maskClosable={false}
          width={900}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrapClassName="adjust-money-popup-modal"
        >
          <div className="adjust-money-container">
            <div className="adjust-left">
              <div className="top-block">
                <Dropdown overlay={menu}>
                  <div className="common-button">
                    {this.state.amountList[this.state.amountIndex]}
                    <Icon type="down" />
                  </div>
                </Dropdown>
                <input
                  type="text"
                  className="money-input"
                  value={this.state.money}
                  readOnly
                />
              </div>
              <div className="adjust-reason">
                <div className="reason-title">原因</div>
                <div className="reason-content">
                  <Scrollbars>
                    <ul>
                      {banquetCreateStore.adjustReasons.length > 0 &&
                        banquetCreateStore.adjustReasons.map(
                          (reason, index) => {
                            return (
                              <li
                                key={index}
                                className={classnames({
                                  select: index === this.state.current
                                })}
                                onClick={() => {
                                  this.setState({ current: index });
                                  this.setState({ reason: '' });
                                }}
                              >
                                {reason}
                              </li>
                            );
                          }
                        )}
                    </ul>
                  </Scrollbars>
                </div>
              </div>
              <div className="other-reason">
                <div className="other-title">其他原因</div>
                <textarea
                  value={this.state.reason}
                  onChange={e => {
                    this.setState({ reason: e.target.value });
                    this.setState({ current: -1 });
                  }}
                />
              </div>
            </div>
            <div className="adjust-right">
              <CommonKeyboardNum
                width={405}
                height={389}
                Whetherpoint={true}
                getResult={result => {
                  this.setState({ money: result });
                }}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default AdjustMoney;
