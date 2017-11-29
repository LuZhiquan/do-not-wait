import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';

@inject('bookingStore')
@observer
class OpenDeskPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { money: '' };
    this.props.bookingStore.getRefundMoney();
  }

  handleCancel = () => {
    if (this.props.cancelClick) {
      this.props.cancelClick();
    }
  };

  handleOk = () => {
    if (this.props.okClick) {
      this.props.okClick();
    }
  };

  render() {
    return (
      <div>
        <Modal
          visible={true}
          title="预订开台"
          maskClosable={false}
          width={670}
          closable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          wrapClassName="booking-open-desk-popup-modal"
        >
          <div className="booking-open-desk-container">
            <div className="booking-desk">
              <div className="used-desk">
                <span>被占用桌台：</span>
                <div className="item">
                  <span>A104</span>
                  <span>8人桌</span>
                </div>
                <div className="item">
                  <span>A104</span>
                  <span>8人桌</span>
                </div>
              </div>
              <div className="select-desk">
                <span>请选择其他桌台：</span>
                <div className="item">
                  <span>A104</span>
                  <span>8人桌</span>
                </div>
              </div>
            </div>
            <div className="desk-list" />
          </div>
        </Modal>
      </div>
    );
  }
}

export default OpenDeskPopup;
