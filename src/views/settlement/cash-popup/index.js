/**
 * @author shelly
 * @description 现金弹窗界面
 * @date 2017-05-10
 **/

import React from 'react';
import { Modal, message } from 'antd';
import { inject, observer } from 'mobx-react';

import './cash_popup.css';

@inject('settlementStore')
@observer
class CashPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      price: this.props.settlementStore.waitCollectAmount + '',
      isFirst: true
    };
  }
  // 点击数字键盘
  handleClick = e => {
    let value = e.target.innerHTML;
    let inputVal = this.state.price;

    if (inputVal.startsWith('.')) {
      inputVal = '0' + inputVal;
    }

    if (this.state.isFirst) {
      inputVal = '';
      this.setState({ price: 0 });
      this.setState({ isFirst: false });
    }

    if (inputVal <= 100000000) {
      if (/\d*\.\d{2}/.test(inputVal)) {
        message.destroy();
        message.info('只能输入两位小数');
      } else {
        if (value >= 0 && value <= 9) {
          inputVal = inputVal.concat(value);
        } else if (value === '.') {
          if (!inputVal.includes('.')) {
            inputVal = inputVal.concat(value);
          }
        }

        if (/^(0{2})/.test(inputVal) || /^(0{1}[1-9]+)/.test(inputVal)) {
          inputVal = inputVal * 1 + '';
        }
      }
    } else {
      message.destroy();
      message.info('已达到最大值');
    }

    this.setState({ price: inputVal });
  };

  // 点击退格
  handleBack = e => {
    let inputVal = this.state.price;
    inputVal = inputVal.substring(0, inputVal.length - 1);
    this.setState({ price: inputVal });
  };

  render() {
    return (
      <div id="cash-popup">
        <Modal
          title={this.props.title}
          visible={true}
          maskClosable={false}
          width={510}
          height={546}
          footer={null}
          wrapClassName="cash-popup-modal"
          onCancel={() => {
            if (this.props.onCancel) {
              this.props.onCancel();
            }
          }}
        >
          <input
            type="text"
            value={Number(this.state.price).toFixed(2)}
            className="price-input"
            placeholder="0"
            readOnly
          />
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
              <li
                className="clear-all"
                onClick={() => {
                  if (this.props.onCancel) {
                    this.props.onCancel();
                  }
                }}
              >
                取消
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
              <li className="cancle" />
              <li className="number" onClick={this.handleClick}>
                0
              </li>
              <li className="number" onClick={this.handleClick}>
                00
              </li>
              <li className="number" onClick={this.handleClick}>
                .
              </li>
              <li
                className="confirm"
                onClick={() => {
                  if (this.props.onOk) {
                    if (
                      parseFloat(this.state.price) === 0 ||
                      this.state.price === '' ||
                      this.state.price === '.'
                    ) {
                      message.destroy();
                      message.info('请输入金额', 2);
                    } else {
                      if (this.props.offline) {
                        //线下支付
                        if (
                          this.props.settlementStore.waitCollectAmount * 1 <
                          this.state.price * 1
                        ) {
                          message.destroy();
                          message.info(
                            '你最多只需支付' +
                              this.props.settlementStore.waitCollectAmount * 1 +
                              '元',
                            2
                          );
                        } else {
                          this.props.onOk(this.state.price);
                        }
                      } else {
                        this.props.onOk(this.state.price);
                      }
                    }
                  }
                }}
              >
                确定
              </li>
            </ul>
          </div>
        </Modal>
      </div>
    );
  }
}

export default CashPopup;
