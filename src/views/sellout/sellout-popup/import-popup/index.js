import React from 'react';
import { Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import './import-popup.less';

//导入
@inject('selloutStore')
@observer
class ImportPopup extends React.Component {
  state = {
    ischeck: 'iconfont icon-icon_checkbox_sel',
    nocheck: 'iconfont icon-yuan'
  };

  //取消事件
  handleCancel = () => {
    if (this.props.importclose) {
      this.props.importclose();
    }
  };

  //确定事件
  handleOk = () => {
    if (this.props.importok) {
      this.props.importok();
    }
  };
  //全部导入
  oncheckedqb = () => {
    this.setState({
      ischeck: 'iconfont icon-icon_checkbox_sel',
      nocheck: 'iconfont icon-yuan'
    });
    this.props.selloutStore.setImporttype(1);
  };
  //追加导入
  oncheckedzj = () => {
    this.setState({
      ischeck: 'iconfont icon-yuan',
      nocheck: 'iconfont icon-icon_checkbox_sel'
    });
    this.props.selloutStore.setImporttype(2);
  };
  render() {
    return (
      <div>
        <Modal
          title="导入"
          visible={true}
          closable={false}
          maskClosable={false}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={600}
          wrapClassName="import-popup-modal"
        >
          <div className="import-conten">
            <p>
              {' '}
              <i
                className={this.state.ischeck}
                onClick={this.oncheckedqb}
              />{' '}
              <span>全部导入</span> <em>会替换今天已有的沽清设置</em>
            </p>
            <p>
              {' '}
              <i
                className={this.state.nocheck}
                onClick={this.oncheckedzj}
              />{' '}
              <span>追加导入</span> <em>只导入今天没有设置的商品</em>
            </p>
          </div>
        </Modal>
      </div>
    );
  }
}

export default ImportPopup;
