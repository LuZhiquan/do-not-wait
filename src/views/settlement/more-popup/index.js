/* 更多弹窗 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import { Link } from 'react-router';

import './more_popup.less';

@inject('settlementStore')
@observer
class MorePopup extends React.Component {
  // constructor(props){
  //   super(props);
  // }
  // let settlementStore=this.props.settlementStore;
  handleOk = () => {
    this.props.settlementStore.moreokClick();
  };
  handleCancel = () => {
    this.props.settlementStore.morecancleClick();
  };

  render() {
    let url = '/dishes/' + this.props.tableID + '/' + this.props.subOrderID;
    return (
      <div id="more-popup">
        <Modal
          title="更多"
          visible={true}
          closable={true}
          maskClosable={false}
          footer={null}
          width={840}
          wrapClassName="more-popup-modal"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div className="btn">
            <Link
              className="more-btn"
              onClick={() => {
                this.context.router.push({
                  pathname: url,
                  state: {
                    listKey: 'didOrder'
                  }
                });
                this.props.settlementStore.morecancleClick();
              }}
            >
              更改消费类型
            </Link>
            {false && <button className="more-btn">调整商品折扣</button>}
            {false && <button className="more-btn">积分换菜</button>}
          </div>
        </Modal>
      </div>
    );
  }
}

MorePopup.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};
export default MorePopup;
