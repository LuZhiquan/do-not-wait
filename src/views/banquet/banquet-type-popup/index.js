import React from 'react';
import { Modal } from 'antd';
import './banquet-type-popup.less';

class BanquetTypePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      typeName: '',
      bookingNum: '',
      backupNum: '',
      personNum: '',
      typeError: '',
      bookingError: '',
      personError: ''
    };
  }
  //关闭按钮事件
  handleCancel = () => {
    if (this.props.handleCancel) {
      this.props.handleCancel();
    }
  };

  //确定按钮事件
  handleOk = () => {
    let { typeName, bookingNum, backupNum, personNum } = this.state;
    if (typeName === '') {
      this.setState({ typeError: '类型不能为空' });
    }

    if (bookingNum * 1 === 0 || bookingNum === '') {
      this.setState({ bookingError: '预订桌数必须大于0' });
    }
    if (personNum * 1 === 0 || personNum === '') {
      this.setState({ personError: '每桌人数必须大于0' });
    }

    if (typeName && bookingNum > 0 && personNum > 0) {
      if (this.props.handleOk) {
        this.props.handleOk({ typeName, bookingNum, backupNum, personNum });
      }
    }
  };

  render() {
    return (
      <div>
        <Modal
          title="复制菜品并新建类型"
          closable={false}
          visible={true}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={500}
          wrapClassName="banquet-type-popup-modal"
        >
          <div className="banquet-type-main">
            <div className="banquet-type-input">
              <div className="each-layout">
                <div className="xing">*</div>
                <div className="type-title">类型名称</div>
                <input
                  type="text"
                  className="type-input"
                  value={this.state.typeName}
                  onChange={e => {
                    if (e.target.value.length <= 20) {
                      this.setState({ typeName: e.target.value });
                      this.setState({ typeError: '' });
                    }
                  }}
                />
                <div className="error">{this.state.typeError}</div>
              </div>
              <div className="each-layout">
                <div className="xing">*</div>
                <div className="type-title">预订桌数</div>
                <input
                  type="text"
                  className="type-input"
                  value={this.state.bookingNum}
                  onChange={e => {
                    if (/^\d*$/.test(e.target.value)) {
                      this.setState({ bookingNum: e.target.value });
                      this.setState({ bookingError: '' });
                    }
                  }}
                />
                <div className="error">{this.state.bookingError}</div>
              </div>
              <div className="each-layout">
                <div className="type-title ml10">备用桌数</div>
                <input
                  type="text"
                  className="type-input"
                  value={this.state.backupNum}
                  onChange={e => {
                    if (/^\d*$/.test(e.target.value)) {
                      this.setState({ backupNum: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="each-layout">
                <div className="xing">*</div>
                <div className="type-title">每桌人数</div>
                <input
                  type="text"
                  className="type-input"
                  value={this.state.personNum}
                  onChange={e => {
                    if (/^\d*$/.test(e.target.value)) {
                      this.setState({ personNum: e.target.value });
                      this.setState({ personError: '' });
                    }
                  }}
                />
                <div className="error">{this.state.personError}</div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default BanquetTypePopup;
