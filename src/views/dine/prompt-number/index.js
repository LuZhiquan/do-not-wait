import React, { Component } from 'react';
import { Modal } from 'antd';

import './prompt_number.css';

class PromptNumber extends Component {
  state = { result: this.props.number || '' };

  oneClick = e => {
    var temp = this.state.result;
    var value = e.target.value;
    if (value >= 0 && value <= 9) {
      temp = temp.concat(value);
    } else {
      temp = temp.substring(0, temp.length - 1);
    }

    if (temp.length < 3) {
      this.setState({ result: temp });
    }
  };
  handleOk = e => {
    if (this.props.okClick) this.props.okClick(this.state.result);
  };
  handleCancel = e => {
    if (this.props.cancelClick) this.props.cancelClick(e);
  };

  render() {
    return (
      <Modal
        title="开台人数"
        visible={true}
        maskClosable={false}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <div className="number_main">
          <h5>
            <input type="text" value={this.state.result} disabled="disabled" />
            <span> 单位：人</span>
          </h5>
          <div className="number_button">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '←'].map(key => {
              return (
                <input
                  key={key}
                  type="button"
                  className={key === '←' ? 'back-space' : ''}
                  value={key}
                  onClick={this.oneClick}
                />
              );
            })}
          </div>
        </div>
      </Modal>
    );
  }
}

export default PromptNumber;
