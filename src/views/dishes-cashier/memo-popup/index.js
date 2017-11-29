/* 提示弹窗 */
import React from 'react';
import {Modal} from 'antd';
import './prompt_popup.less';

class MemoPopup extends React.Component {

  state = {
    memo: this.props.memo
  }

  onCancel = () => {
    let { handleClose } = this.props;
    handleClose && handleClose();
  }

  onOk = () => {
    let { submitMemo, handleClose } = this.props;
    submitMemo && submitMemo(this.state.memo);
    handleClose && handleClose();
  }

  render() {
    return <Modal 
      title="整单备注"
      visible={true} 
      maskClosable={false} 
      okText="确定"　 
      cancelText="取消"
      width={600}
      wrapClassName="prompt-popup-modal"
      onCancel={this.onCancel}
      onOk={this.onOk}
    >
      <div className="dishes-memo-popup-bg">
          <textarea 
            className="dishes-demo-textarea" 
            value={this.state.memo} 
            placeholder="请输入整单备注内容"
            onChange={(e) => {
              this.setState({memo: e.target.value})
            }}
          />
      </div>
    </Modal>
  }
}

export default MemoPopup;