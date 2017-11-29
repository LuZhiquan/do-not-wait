import React from 'react';
import { inject, observer } from 'mobx-react';
import { message } from 'antd';
import './common-keyboard-num.less';

@inject('selloutStore')
@observer
class CommonKeyboardNum extends React.Component {
  state = { result: '' };

  itemClick = e => {
    let temp = this.state.result;
    let value = e.target.value;

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
      }
    } else if (value === '.') {
      if (!temp.includes('.') && temp <= 1000000) {
        temp = temp.concat(value);
      }
    }

    if (temp.startsWith('.')) {
      temp = '0'.concat(temp);
    }

    this.setState({ result: temp });

    if (this.props.getResult) {
      this.props.getResult(temp);
    }
    //   if(value.startsWith('.')){
    //     value="0".concat(value);
    //   }

    if (this.props.getvalue) {
      this.props.getvalue(value);
    }
  };

  delClick = e => {
    if (this.props.getvalue) {
      this.props.getvalue(e.type);
    }

    let temp = this.state.result;
    temp = temp.substring(0, temp.length - 1);
    this.setState({ result: temp });
    if (this.props.getResult) {
      this.props.getResult(temp);
    }
  };

  render() {
    return (
      <div className="chengzhong">
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
              onClick={this.delClick}
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
