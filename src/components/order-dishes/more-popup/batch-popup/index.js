/**
* @author William Cui
* @description 批量操作界面
* @date 2017-06-06
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert } from 'antd';
import classnames from 'classnames';
import MyScroll from 'components/my-scrollbar';

import './batch_popup.less';

@inject('dishesStore')
@observer
class BatchPopup extends React.Component {
  handleCancel = () => {
    let { closeHandle } = this.props;
    closeHandle && closeHandle();
  };

  handleOk = () => {
    let { closeHandle, action, dishesStore } = this.props;

    let productList;
    if (action.actionType === 'willOrder') {
      productList = dishesStore.shoppingCart;
    } else if (action.actionType === 'didOrder') {
      productList = dishesStore.filterDidOrderList;
    }

    let checkedNumber = 0;
    if (productList && productList.length) {
      productList.forEach((product, index) => {
        if (product.checked) checkedNumber += 1;
      });
    }

    if (!checkedNumber) {
      dishesStore.showFeedback({
        status: 'validate',
        msg: `请选择要${action.actionName}的菜品！`
      });
      return;
    }

    if (action.actionType === 'willOrder') {
      //未下单
      switch (action.actionName) {
        case '删菜':
          dishesStore.deleteMultipleFromCart();
          break;
        case '等叫':
          dishesStore.socalledMultipleFromCart();
          break;
        case '取消等叫':
          dishesStore.cancelCalledMultipleFromCart();
          break;
        case '免做':
          dishesStore.changeTagMultipleFromCart({ tag: '20' });
          break;
        case '取消免做':
          dishesStore.changeTagMultipleFromCart({ tag: '20' });
          break;
        case '先做':
          dishesStore.changeTagMultipleFromCart({ tag: '21' });
          break;
        case '取消先做':
          dishesStore.changeTagMultipleFromCart({ tag: '21' });
          break;
        case '打包':
          dishesStore.changeTagMultipleFromCart({ tag: '23' });
          break;
        case '取消打包':
          dishesStore.changeTagMultipleFromCart({ tag: '23' });
          break;
        default:
      }
    } else {
      //已下单
      switch (action.actionName) {
        case '等叫':
          let socalledList = [];
          dishesStore.filterDidOrderList.forEach(product => {
            if (product.checked) {
              socalledList.push({
                detailID: product.detailID,
                recordID: product.recordID
              });
            }
          });
          dishesStore.socalled({ socalledList });
          break;
        case '叫起':
          let wakeUpList = [];
          dishesStore.filterDidOrderList.forEach(product => {
            if (product.checked) {
              wakeUpList.push({
                detailID: product.detailID,
                recordID: product.recordID
              });
            }
          });
          dishesStore.wakeUp({ wakeUpList });
          break;
        case '催菜':
          let merchantTagMappings = [];
          dishesStore.filterDidOrderList.forEach(product => {
            if (product.checked) {
              merchantTagMappings.push({
                detailID: product.detailID,
                tagIDs: '22'
              });
            }
          });
          dishesStore.markTag(merchantTagMappings);
          break;
        case '划单':
          let markOrderDetail = [];
          dishesStore.filterDidOrderList.forEach(product => {
            if (product.checked) {
              markOrderDetail.push({
                detailID: product.detailID,
                recordID: product.recordID,
                quantity: product.quantity
              });
            }
          });
          dishesStore.markOrder({ markOrderDetail });
          break;
        case '取消划单':
          let cancelMarkOrderDetail = [];
          dishesStore.filterDidOrderList.forEach(product => {
            if (product.checked) {
              cancelMarkOrderDetail.push({
                detailID: product.detailID,
                recordID: product.recordID,
                quantity: product.quantity
              });
            }
          });
          dishesStore.cancelMarkOrder({ cancelMarkOrderDetail });
          break;
        default:
      }
    }
    closeHandle && closeHandle();
  };

  handleAllSelected({ areAllSelected }) {
    let { action } = this.props;
    this.props.dishesStore.checkedAll({ action, areAllSelected });
  }

  componentWillUnmount() {
    let { dishesStore, action } = this.props;
    dishesStore.clearCheckedProduct({ action });
    dishesStore.closeFeedback();
    dishesStore.clearFilterDidOrderList();
  }

  render() {
    let { action, dishesStore } = this.props;
    let productList;
    if (action.actionType === 'willOrder') {
      productList = dishesStore.shoppingCart;
    } else if (action.actionType === 'didOrder') {
      productList = dishesStore.filterDidOrderList;
    }

    let checkedNumber = 0;
    let areAllSelected = true;
    if (productList && productList.length) {
      productList.forEach((product, index) => {
        let filterflag = true;
        switch (action.actionName) {
          case '等叫':
            filterflag = product.produceStatus !== 694;
            break;
          case '叫起':
          case '取消等叫':
            filterflag = product.produceStatus === 694;
            break;
          case '免做':
            filterflag = !product.tagIDs || product.tagIDs.indexOf('20') < 0;
            break;
          case '取消免做':
            filterflag = product.tagIDs && product.tagIDs.indexOf('20') > -1;
            break;
          case '先做':
            filterflag = !product.tagIDs || product.tagIDs.indexOf('21') < 0;
            break;
          case '取消先做':
            filterflag = product.tagIDs && product.tagIDs.indexOf('21') > -1;
            break;
          case '催菜':
            filterflag = !product.tagIDs || product.tagIDs.indexOf('22') < 0;
            break;
          case '打包':
            filterflag = !product.tagIDs || product.tagIDs.indexOf('23') < 0;
            break;
          case '取消打包':
            filterflag = product.tagIDs && product.tagIDs.indexOf('23') > -1;
            break;
          case '划单':
            filterflag =
              product.produceStatus !== 982 && //已上菜
              product.produceStatus !== 830 && //未称重
              product.produceStatus !== 694 && //等叫
              product.aLaCarteMethod !== 685 && //退菜
              (product.needWeigh || product.quantity > product.servingQuantity);
            break;
          case '取消划单':
            filterflag =
              product.produceStatus === 982 &&
              (product.combo || product.quantity === product.servingQuantity);
            break;
          default:
        }
        filterflag =
          (action.actionType === 'willOrder' && filterflag) ||
          action.actionType === 'didOrder';
        if (filterflag && !product.checked) areAllSelected = false;
        if (product.checked) checkedNumber += product.quantity;
      });
    } else {
      areAllSelected = false;
    }

    return (
      <Modal
        title={action.actionName}
        visible={true}
        maskClosable={false}
        okText="确定"
        cancelText="取消"
        width={840}
        wrapClassName="batch-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
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
        <div className="category-discount-list">
          <MyScroll
            width={798}
            height={415}
            hasAllSelected
            areAllSelected={areAllSelected}
            areSelectedNumber={checkedNumber}
            handleAllSelected={this.handleAllSelected.bind(this, {
              areAllSelected
            })}
          >
            <ul className="table-body">
              {productList && !!productList.length ? (
                productList.map((product, index) => {
                  let filterflag = true;
                  switch (action.actionName) {
                    case '等叫':
                      filterflag = product.produceStatus !== 694;
                      break;
                    case '叫起':
                    case '取消等叫':
                      filterflag = product.produceStatus === 694;
                      break;
                    case '免做':
                      filterflag =
                        !product.tagIDs || product.tagIDs.indexOf('20') < 0;
                      break;
                    case '取消免做':
                      filterflag =
                        product.tagIDs && product.tagIDs.indexOf('20') > -1;
                      break;
                    case '先做':
                      filterflag =
                        !product.tagIDs || product.tagIDs.indexOf('21') < 0;
                      break;
                    case '取消先做':
                      filterflag =
                        product.tagIDs && product.tagIDs.indexOf('21') > -1;
                      break;
                    case '催菜':
                      filterflag =
                        !product.tagIDs || product.tagIDs.indexOf('22') < 0;
                      break;
                    case '打包':
                      filterflag =
                        !product.tagIDs || product.tagIDs.indexOf('23') < 0;
                      break;
                    case '取消打包':
                      filterflag =
                        product.tagIDs && product.tagIDs.indexOf('23') > -1;
                      break;
                    case '划单':
                      filterflag =
                        product.produceStatus !== 982 && //已上菜
                        product.produceStatus !== 830 && //未称重
                        product.produceStatus !== 694 && //等叫
                        product.aLaCarteMethod !== 685 && //退菜
                        (product.needWeigh ||
                          product.quantity > product.servingQuantity);
                      break;
                    case '取消划单':
                      filterflag =
                        product.produceStatus === 982 &&
                        (product.combo ||
                          product.quantity === product.servingQuantity);
                      break;
                    default:
                  }
                  filterflag =
                    (action.actionType === 'willOrder' && filterflag) ||
                    action.actionType === 'didOrder';
                  return (
                    filterflag && (
                      <li
                        key={index}
                        onClick={() => {
                          if (action.actionType === 'willOrder') {
                            dishesStore.checkedProduct({
                              cartRecordID: product.cartRecordID
                            });
                          } else if (action.actionType === 'didOrder') {
                            dishesStore.checkedProduct({
                              detailID: product.detailID
                            });
                          }
                        }}
                      >
                        <span className="number">{index + 1}</span>
                        <span className="name">{product.productName}</span>
                        <span className="code">{product.quantity}份</span>
                        <span className="choose">
                          <i
                            className={classnames({
                              iconfont: true,
                              'icon-kaitairen_icon_sel-': true,
                              selected: product.checked
                            })}
                          />
                        </span>
                      </li>
                    )
                  );
                })
              ) : (
                <div className="empty-holder">暂无相关菜品</div>
              )}
            </ul>
          </MyScroll>
        </div>
        {false && (
          <div className="choose-length">
            已选<span>{checkedNumber}</span>项
          </div>
        )}
      </Modal>
    );
  }
}

export default BatchPopup;
