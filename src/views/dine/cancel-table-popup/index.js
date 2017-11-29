import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert } from 'antd';
import classnames from 'classnames';

import MyScroll from 'components/my-scrollbar';

import './cancel_table_popup.css';

//消台原因弹窗
@inject('dineStore', 'dishesStore')
@observer
class CancelTableReason extends React.Component {
  state = {
    reason: '',
    memo: ''
  };

  //确定
  handleOk = () => {
    let { dineStore, handleClose } = this.props;
    let { reason, memo } = this.state;
    if (reason || memo) {
      let tableIDs = [],
        subOrderIDs = [];
      if (dineStore.targetTableList.length) {
        dineStore.targetTableList.forEach(table => {
          if (table.tableID) tableIDs.push(table.tableID);
          if (table.subOrderID) subOrderIDs.push(table.subOrderID);
        });
      } else {
        tableIDs = [dineStore.selectedTableList[0].tableID];
        subOrderIDs = [dineStore.selectedTableList[0].subOrderID];
      }
      let cancelTableData = {
        tableID: dineStore.selectedTableList[0].tableID,
        tableIDs,
        subOrderIDs,
        memo: reason || memo
      };
      dineStore.cancelTable(cancelTableData, () => {
        subOrderIDs.forEach(subOrderID => {
          this.cleanShoppingCart(subOrderID);
        });
      });

      handleClose && handleClose();
    } else {
      dineStore.showFeedback({ status: 'validate', msg: '请选择消台原因' });
    }
  };

  //取消
  handleCancel = () => {
    let { handleClose } = this.props;
    handleClose && handleClose();
  };

  componentDidMount() {
    this.props.dineStore.getCancelTableReasonList();
  }

  componentWillUnmount() {
    this.props.dineStore.clearFeedback();
  }

  //清空购物车
  cleanShoppingCart = subOrderID => {
    const { dishesStore } = this.props;
    if (localStorage.getItem(subOrderID)) {
      const { shoppingCart } = JSON.parse(localStorage.getItem(subOrderID));
      localStorage.removeItem(subOrderID); //删除购物车信息
      dishesStore.cleanShoppingCart({
        shoppingCart: shoppingCart.map(product => ({
          productID: product.productID,
          variantID: product.variantID,
          optionID: product.optionID,
          quantity:
            -1 * (product.needWeigh ? product.expectedWeight : product.quantity)
        }))
      });
    }
  };

  render() {
    let { dineStore } = this.props;
    let cancelTableReasonList = dineStore.cancelTableReasonList;
    //选厨师
    return (
      <Modal
        title="选择消台原因"
        visible={true}
        maskClosable={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText="确定"
        cancelText="取消"
        width={840}
        wrapClassName="cancel-table-popup-modal"
      >
        {dineStore.feedback &&
        dineStore.feedback.status === 'validate' && (
          <Alert
            message={dineStore.feedback.msg}
            banner
            closable
            onClose={() => {
              //关闭警告信息
              dineStore.closeFeedback();
            }}
          />
        )}
        <div className="cancel-table-reason-block">
          <div className="select-items">
            <div className="select-header">消台原因</div>
            <MyScroll width={798} height={148}>
              {cancelTableReasonList &&
                !!cancelTableReasonList.length &&
                cancelTableReasonList.map((reason, index) => {
                  return (
                    <li
                      key={reason.reasonID}
                      className={classnames({
                        'cause-btns': true,
                        'btn-active': reason.reason === this.state.reason
                      })}
                      onClick={() => {
                        this.setState({
                          memo: '',
                          reason: reason.reason
                        });
                      }}
                    >
                      {reason.reason}
                    </li>
                  );
                })}
            </MyScroll>
          </div>
          <textarea
            type="text"
            placeholder="可输入自定义消台原因, 限100字内。"
            className="cursor-input"
            value={this.state.memo}
            onChange={e => {
              let memo = e.target.value.substr(0, 100);
              this.setState({
                memo,
                reason: ''
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default CancelTableReason;
