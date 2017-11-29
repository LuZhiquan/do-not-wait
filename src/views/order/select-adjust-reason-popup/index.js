/**
 * @author William Cui
 * @description 调账弹窗
 * @date 2017-11-27
 **/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert } from 'antd';
import classnames from 'classnames';

import './select-adjust-reason-popup.less';

//点选普通单品弹窗
@inject('orderStore')
@observer
class AntiSettlementPopup extends React.Component {
  state = { reason: '', textarea: '' };

  //关闭按钮
  handleCancel = () => {
    this.props.onClose && this.props.onClose();
  };

  //确定按钮
  handleOK = () => {
    const { orderStore } = this.props;
    const reason = this.state.reason || this.state.textarea;
    if (reason) {
      this.props.onOK(reason);
      this.props.onClose && this.props.onClose();
    } else {
      orderStore.showFeedback({ status: 'warn', msg: '请选择调账原因！' });
    }
  };

  handleSelect = reason => {
    this.setState({ reason });
  };

  handleInputReason = e => {
    this.setState({ reason: '', textarea: e.target.value });
  };

  render() {
    return (
      <Modal
        title="调账"
        visible={true}
        maskClosable={false}
        onOk={this.handleOK}
        okText="确定"
        cancelText="放弃"
        width={840}
        wrapClassName="select-adjust-reason-popup"
        onCancel={this.handleCancel}
      >
        <div className="anti-settlement-block">
          <div className="anti-settlement-cause">
            <div className="cause-header">调账原因</div>
            <div id="anti-settlement-message" />
            <ul className="reason">
              {['收款方式有误', '客人退菜', '非常不好'].map((reason, index) => {
                return (
                  <li
                    key={index}
                    className={classnames({
                      'btn-240-44': true,
                      'btn-active': this.state.reason === reason
                    })}
                    onClick={this.handleSelect.bind(this, reason)}
                  >
                    {reason}
                  </li>
                );
              })}
            </ul>
          </div>
          <textarea
            type="text"
            placeholder="可输入调账原因"
            className="anti-settlement-remarks"
            value={this.state.textarea}
            onChange={this.handleInputReason}
          />
          {this.state.accreditpopup}
        </div>
      </Modal>
    );
  }
}
export default AntiSettlementPopup;
