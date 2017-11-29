/* 会员折弹窗 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs, Modal } from 'antd';

import './member_discount_popup.less';

const TabPane = Tabs.TabPane;

@inject('settlementStore')
@observer
class MenberDiscount extends React.Component {
  constructor(props) {
    super(props);
    this.state = { phone: '', cardNum: '', card: '', memberPayment: '' };
  }

  callback(key) {
    console.log(key);
  }
  // 点击数字键盘
  handleClick = e => {
    let value = e.target.innerHTML;
    if (this.state.position === 'phone') {
      let newValue = this.state.phone.concat(value);
      this.setState({ phone: newValue });
    }
    if (this.state.position === 'cardNum') {
      let newValue = this.state.cardNum.concat(value);
      this.setState({ cardNum: newValue });
    }
  };

  // 点击退格
  handleBack = e => {
    if (this.state.position === 'phone') {
      let newValue = this.state.phone;
      newValue = newValue.substring(0, newValue.length - 1);
      this.setState({ phone: newValue });
    }
    if (this.state.position === 'cardNum') {
      let newValue = this.state.cardNum;
      newValue = newValue.substring(0, newValue.length - 1);
      this.setState({ cardNum: newValue });
    }
  };

  handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  render() {
    // 数字键盘
    let keyNumber = (
      <ul className="key-num-wrap">
        <li onClick={this.handleClick}>1</li>
        <li onClick={this.handleClick}>2</li>
        <li onClick={this.handleClick}>3</li>
        <li onClick={this.handleClick}>4</li>
        <li onClick={this.handleClick}>5</li>
        <li onClick={this.handleClick}>6</li>
        <li onClick={this.handleClick}>7</li>
        <li onClick={this.handleClick}>8</li>
        <li onClick={this.handleClick}>9</li>
        <li className="zero" onClick={this.handleClick}>
          0
        </li>
        <li
          className="back iconfont icon-order_btn_back"
          onClick={this.handleBack}
        />
      </ul>
    );

    return (
      <div id="category-discount">
        <Modal
          title="会员折"
          visible={true}
          maskClosable={false}
          okText="确定"
          cancelText="取消"
          footer={null}
          width={500}
          wrapClassName="member-discount-modal"
          onCancel={this.handleCancel}
        >
          <ul className="category">
            <Tabs defaultActiveKey="1" onChange={this.callback}>
              <TabPane tab="手机号" key="1">
                <div className="change-tab">
                  <i className="iconfont icon" />
                </div>
                <input
                  type="text"
                  className="input-value"
                  placeholder="请输入手机号"
                  value={this.state.phone}
                  onFocus={() => {
                    this.setState({ position: 'phone' });
                  }}
                />
                {keyNumber}
                <div className="btn">
                  <button className="cancle" onClick={this.handleCancel}>
                    取消
                  </button>
                  <button
                    className="confirm selecte"
                    onClick={() => {
                      //  settlementStore.getMemberDiscount({subOrderID: this.props.subOrderID, memberCodeType:1, memberCode:this.state.phone})
                      if (this.props.onOk) {
                        this.props.onOk(this.state.phone, 1);
                      }
                    }}
                  >
                    确定
                  </button>
                </div>
              </TabPane>
              <TabPane tab="卡号" key="2">
                <div className="change-tab" />
                <input
                  type="text"
                  className="input-value"
                  placeholder="请输入卡号"
                  value={this.state.cardNum}
                  onFocus={() => {
                    this.setState({ position: 'cardNum' });
                  }}
                />
                {keyNumber}
                <div className="btn">
                  <button className="cancle" onClick={this.handleCancel}>
                    取消
                  </button>
                  <button
                    className="confirm selecte"
                    onClick={() => {
                      if (this.props.onOk) {
                        this.props.onOk(this.state.cardNum, 2);
                      }
                      //  settlementStore.getMemberDiscount({subOrderID: this.props.subOrderID, memberCodeType:2, memberCode:this.state.cardNum})
                    }}
                  >
                    确定
                  </button>
                </div>
              </TabPane>
              <TabPane tab="刷卡" key="3">
                <div className="change-tab" />
                <input type="text" className="input-value" placeholder="请刷卡" />
                <div className="btn">
                  <button
                    className="cancle only-one-btn"
                    onClick={this.handleCancel}
                  >
                    取消
                  </button>
                </div>
              </TabPane>
            </Tabs>
          </ul>
        </Modal>
      </div>
    );
  }
}

export default MenberDiscount;
