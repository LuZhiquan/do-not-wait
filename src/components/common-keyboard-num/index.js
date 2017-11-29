import React from 'react';
import { message } from 'antd';
import './common-keyboard-num.less';

class CommonKeyboardNum extends React.Component {
  state = { result: '' };

  itemClick = e => {
    let temp = this.state.result;
    let value = e.target.value;
    if (value) {
      if (value >= 0 && value <= 9) {
        if (temp <= 100000000) {
          var dot = temp.indexOf('.');
          if (dot !== -1) {
            var dotCnt = temp.substring(dot + 1, temp.length);
            if (dotCnt.length < 2) {
              temp = temp.concat(value);
            } else {
              message.destroy();
              message.info('只能输入两位小数');
            }
          } else {
            temp = temp.concat(value);
          }
        } else {
          message.destroy();
          message.info('已达到最大值');
        }
      } else if (value === '.') {
        if (!temp.includes('.') && temp <= 1000000) {
          temp = temp.concat(value);
        }
      }
    } else {
      temp = temp.substring(0, temp.length - 1);
    }

    if (temp.startsWith('.')) {
      temp = '0'.concat(temp);
    }

    this.setState({ result: temp });

    if (this.props.getResult) {
      if (
        temp.indexOf('0') === 0 &&
        temp.indexOf('.') !== 1 &&
        temp.length > 1
      ) {
        temp = temp.substr(1);
      }
      this.props.getResult(temp);
    }

    if (this.props.getvalue) {
      this.props.getvalue(value);
    }
  };

  render() {
    return (
      <div
        className="my-common-keybord"
        style={{ width: this.props.width, height: this.props.height }}
      >
        <div className="button-combination">
          <div className="item-main">
            <input
              type="button"
              className="btn-item"
              value="1"
              onClick={this.itemClick}
            />
            <input
              type="button"
              className="btn-item"
              value="2"
              onClick={this.itemClick}
            />
            <input
              type="button"
              className="btn-item"
              value="3"
              onClick={this.itemClick}
            />
          </div>
        </div>
        <div className="button-combination">
          <div className="item-main">
            <input
              type="button"
              className="btn-item"
              value="4"
              onClick={this.itemClick}
            />
            <input
              type="button"
              className="btn-item"
              value="5"
              onClick={this.itemClick}
            />
            <input
              type="button"
              className="btn-item"
              value="6"
              onClick={this.itemClick}
            />
          </div>
        </div>
        <div className="button-combination">
          <div className="item-main">
            <input
              type="button"
              className="btn-item"
              value="7"
              onClick={this.itemClick}
            />
            <input
              type="button"
              className="btn-item"
              value="8"
              onClick={this.itemClick}
            />
            <input
              type="button"
              className="btn-item"
              value="9"
              onClick={this.itemClick}
            />
          </div>
        </div>
        <div className="button-combination">
          <div className="item-main">
            {this.props.Whetherpoint === true && (
              <input
                type="button"
                className="btn-item"
                value="."
                onClick={this.itemClick}
              />
            )}
            <input
              type="button"
              className="btn-item"
              value="0"
              onClick={this.itemClick}
            />
            <button
              className={
                this.props.Whetherpoint === true
                  ? 'btn-item'
                  : 'btn-item newflex'
              }
              onClick={this.itemClick}
            >
              <i className="iconfont icon-order_btn_back" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CommonKeyboardNum;
