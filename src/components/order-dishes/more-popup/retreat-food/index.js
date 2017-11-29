/**
* @author shining
* @description 请选择桌台
* @date 2017-05-25
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Button, Alert } from 'antd';
import classnames from 'classnames';
import { getJSON } from 'common/utils';

import MyScroll from 'components/my-scrollbar';

import './retreat-food.less';
@inject('dishesStore')
@observer
class RetreaFood extends React.Component {
  state = {
    returnMemo: '',
    returnReason: '',
    closeHandle: this.props.closeHandle
  };

  //关闭按钮取消按钮
  handleCancel = () => {
    this.state.closeHandle && this.state.closeHandle();
  };

  //确定按钮
  handleOk = ({ revocationType }) => {
    let { dishesStore } = this.props;
    let { returnMemo, returnReason, closeHandle } = this.state;
    let quantitys = [],
      detailIDs = [];
    let selectedFilter = dishesStore.filterDidOrderList.filter(product => {
      if (product.checked) {
        quantitys.push(product.operateQuantity);
        detailIDs.push(product.detailID);
      }
      return product.checked;
    });
    if (!selectedFilter.length) {
      dishesStore.showFeedback({ status: 'validate', msg: '请选择要退的菜品！' });
      return;
    }
    if (!returnMemo && !returnReason) {
      dishesStore.showFeedback({ status: 'validate', msg: '请选择退菜原因！' });
      return;
    }
    dishesStore.batchReturnDishes({
      quantitys,
      detailIDs,
      memo: returnReason || returnMemo,
      revocationType
    });
    closeHandle && closeHandle();
  };

  handleAllSelected({ areAllSelected }) {
    let { action } = this.props;
    this.props.dishesStore.checkedAll({ action, areAllSelected });
  }

  componentDidMount() {
    this.getReturnReasonList();
  }

  componentWillUnmount() {
    let { dishesStore, action } = this.props;
    dishesStore.clearCheckedProduct({ action });
    dishesStore.closeFeedback();
    dishesStore.clearFilterDidOrderList();
  }

  //获取退菜原因列表
  getReturnReasonList() {
    let { dishesStore } = this.props;
    let _this = this;
    getJSON({
      url: '/reception/product/getRevocationFood',
      success: function(json) {
        if (json.code === 0) {
          _this.setState({
            returnReasonList: json.data
          });
        } else {
          //获取失败反馈
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  render() {
    let { tableName, dishesStore } = this.props;
    let { returnReasonList, returnReason } = this.state;
    let checkedNumber = 0;
    let areAllSelected = true;
    if (
      dishesStore.filterDidOrderList &&
      dishesStore.filterDidOrderList.length
    ) {
      dishesStore.filterDidOrderList.forEach((product, index) => {
        let canGive = true;
        canGive = product.aLaCarteMethod !== 686;
        if (canGive && !product.checked) areAllSelected = false;
        if (product.checked) checkedNumber += product.operateQuantity;
      });
    } else {
      areAllSelected = false;
    }

    return (
      <Modal
        title={tableName + ' 批量退菜'}
        visible={true}
        maskClosable={false}
        okText="确定"
        cancelText="取消"
        width={920}
        wrapClassName="trun-give-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          <Button
            key="back"
            size="large"
            onClick={this.handleCancel}
            className="no-cancel"
          >
            取消
          </Button>,
          <Button
            key="submit1"
            size="large"
            onClick={() => {
              this.handleOk({ revocationType: 1 });
            }}
            className="other-botton"
          >
            报损退菜
          </Button>,
          <Button
            key="submit2"
            size="large"
            onClick={this.handleOk}
            className="other-botton"
          >
            {' '}
            仅退菜
          </Button>
        ]}
      >
        {dishesStore.feedback &&
          dishesStore.feedback.status === 'validate' && (
            <Alert
              message={dishesStore.feedback.msg}
              banner
              closable
              onClose={() => {
                //关闭警告信息
                dishesStore.closeFeedback();
              }}
            />
          )}
        <div className="trun-give-main">
          <div className="food-all-main">
            <MyScroll
              width={878}
              height={173}
              hasAllSelected
              areAllSelected={areAllSelected}
              areSelectedNumber={checkedNumber}
              handleAllSelected={this.handleAllSelected.bind(this, {
                areAllSelected
              })}
            >
              {dishesStore.filterDidOrderList &&
              !!dishesStore.filterDidOrderList.length ? (
                dishesStore.filterDidOrderList.map((product, index) => {
                  return (
                    <div
                      key={product.detailID}
                      className={classnames({
                        'each-food': true,
                        iconfont: true,
                        select: product.checked,
                        mask: product.checked
                      })}
                      onClick={() => {
                        dishesStore.checkedProduct({
                          detailID: product.detailID
                        });
                      }}
                    >
                      <h3 className="table-name">
                        {product.productName}
                        {product.isCombo && <div className="taocan">套餐</div>}
                      </h3>
                      <p>可退{product.quantity}份</p>
                      {product.checked && (
                        <div className="number">
                          <i
                            className="number-jian iconfont icon-jian"
                            onClick={event => {
                              dishesStore.changeFilterQuantity({
                                type: 'minus',
                                detailID: product.detailID
                              });
                              event.stopPropagation();
                            }}
                          />
                          {product.operateQuantity}
                          <i
                            className="number-jia iconfont icon-jia"
                            onClick={event => {
                              dishesStore.changeFilterQuantity({
                                type: 'add',
                                detailID: product.detailID
                              });
                              event.stopPropagation();
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-holder small">暂无相关菜品</div>
              )}
            </MyScroll>
          </div>

          <div className="select-items">
            <div className="select-zeng-header">退菜原因</div>
            <MyScroll width={878} height={130}>
              {returnReasonList &&
                !!returnReasonList.length &&
                returnReasonList.map(reason => {
                  return (
                    <li
                      key={reason.reasonID}
                      className={classnames({
                        'cause-btns': true,
                        'btn-active': reason.reason === returnReason
                      })}
                      onClick={() => {
                        this.setState({
                          returnMemo: '',
                          returnReason: reason.reason
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
            placeholder="请输入退菜原因"
            className="cursor-input"
            value={this.state.returnMemo}
            onChange={e => {
              this.setState({
                returnMemo: e.target.value,
                returnReason: e.target.value
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default RetreaFood;
