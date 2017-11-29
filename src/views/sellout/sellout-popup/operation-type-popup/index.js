import React from 'react';
import { Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import MyScroll from 'react-custom-scrollbars'; //横向滚动条
import './operation-type-popup.less';

//选择操作类型
@inject('selloutStore')
@observer
class OperationTypePopup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this.props.selloutStore.operatetype;
  }

  handleCancel = () => {
    if (this.props.typeclose) {
      this.props.typeclose();
    }
  };

  //点击确定按钮
  handleOk = () => {
    this.props.selloutStore.changeOperateType(
      this.state.TypeID,
      this.state.typeName
    );
    if (this.props.okClick) this.props.okClick();
  };

  render() {
    let selloutStore = this.props.selloutStore;
    let operatetype = selloutStore.operatetypeList;
    return (
      <div>
        <Modal
          title="选择操作类型"
          visible={true}
          maskClosable={false}
          closable={false}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={840}
          wrapClassName="operation-type-popup"
        >
          <div className="type-conter">
            <MyScroll>
              {(() => {
                if (operatetype.length) {
                  return operatetype.map((operate, index) => {
                    return (
                      <div
                        key={operate.OperationType}
                        className={classnames({
                          'each-type-data': true,
                          'type-checked':
                            selloutStore.savetypeid === operate.OperationType
                              ? true
                              : false
                        })}
                        onClick={() => {
                          selloutStore.savetypeid = operate.OperationType;
                          this.setState({
                            TypeID: operate.OperationType,
                            typeName: operate.CatalogName
                          });
                        }}
                      >
                        {operate.CatalogName}
                      </div>
                    );
                  });
                }
              })()}
            </MyScroll>
          </div>
        </Modal>
      </div>
    );
  }
}

export default OperationTypePopup;
