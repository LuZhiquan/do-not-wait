/**
* @author William Cui
* @description 批量转赠
* @date 2017-06-07
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert, Tabs } from 'antd';
import classnames from 'classnames';

import MyScroll from 'components/my-scrollbar';
import VerticalTabs from 'components/vertical-tabs'; //竖向滚动条
import { getJSON, getStrSize } from 'common/utils';
import AddOrderPopup from 'components/order-dishes/add-order-validation-popup'; //下单不成功提示弹窗

import './turn-give.less';

const TabPane = Tabs.TabPane;

@inject('dishesStore')
@observer
class TrunGivePopup extends React.Component {
  state = {
    usingTableList: [],
    tableID: '',
    tableName: '',
    subOrderID: '',
    statePopup: false
  };

  //关闭按钮取消按钮
  handleCancel = () => {
    let { closeHandle } = this.props;
    closeHandle && closeHandle();
  };

  //确定按钮
  handleOk = () => {
    let { closeHandle, dishesStore, action } = this.props;
    let { tableID, tableName, subOrderID } = this.state;

    let type = action.actionType === 'willOrder' ? '赠' : '菜';

    if (action.actionName === '复制菜') {
      type = '复制';
    } else {
      type = '转' + type;
    }

    let checkedNumber = 0;
    let productList,
      detailIDs = [],
      quantitys = [];
    if (action.actionType === 'willOrder') {
      productList = dishesStore.shoppingCart;
    } else if (action.actionType === 'didOrder') {
      productList = dishesStore.filterDidOrderList;
    }
    productList.forEach((product, index) => {
      if (product.checked) {
        checkedNumber += 1;
        detailIDs.push(product.detailID);
        quantitys.push(product.operateQuantity);
      }
    });
    if (!checkedNumber) {
      dishesStore.showFeedback({ status: 'validate', msg: `请选择要${type}的菜品！` });
      return;
    }
    if (!tableID) {
      dishesStore.showFeedback({ status: 'validate', msg: `请选择要${type}的桌台！` });
      return;
    }

    if (action.actionType === 'willOrder') {
      dishesStore.turnGiveMultipleFromCart({ tableID, tableName }); //未下单批量转赠
      closeHandle && closeHandle();
    } else {
      if (action.actionName === '复制菜') {
        //复制菜
        let copyProducts = [];
        dishesStore.filterDidOrderList.forEach(product => {
          if (product.checked) {
            copyProducts.push({
              orderDetailID: product.detailID,
              quantity: product.operateQuantity
            });
          }
        });
        dishesStore.copyProduct({
          subOrderID: this.props.subOrderID,
          targetTableID: tableID,
          targetSubOrderID: subOrderID,
          copyProducts,
          failure: data => {
            this.setState({
              statePopup: (
                <AddOrderPopup
                  data={data}
                  handleClose={() => {
                    this.setState({ statePopup: false });
                  }}
                />
              )
            });
          },
          complete: () => {
            closeHandle && closeHandle();
          }
        });
      } else {
        dishesStore.batchTransferProduct({
          //已下单批量转菜
          detailIDs,
          quantitys,
          subOrderID
        });
        closeHandle && closeHandle();
      }
    }
  };

  handleAllSelected({ areAllSelected }) {
    let { action } = this.props;
    this.props.dishesStore.checkedAll({ action, areAllSelected });
  }

  //获取已下单或者正在使用的桌台列表
  getUsingTableList(tableName) {
    let { dishesStore } = this.props;
    let tableID = JSON.parse(sessionStorage.getItem('selectedTableList'))[0]
      .tableID;
    let subOrderID = JSON.parse(sessionStorage.getItem('selectedTableList'))[0]
      .subOrderID;
    let _this = this;
    getJSON({
      url: '/reception/product/searchTables',
      data: { tableID, tableName, subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.setState({ usingTableList: json.data });
        } else {
          dishesStore.showFeedback({
            status: 'warn',
            msg: json.message
          });
        }
      }
    });
  }

  componentDidMount() {
    this.getUsingTableList();
  }

  componentWillUnmount() {
    let { dishesStore, action } = this.props;
    dishesStore.clearCheckedProduct({ action });
    dishesStore.closeFeedback();
    dishesStore.clearFilterDidOrderList();
  }

  render() {
    let { action, dishesStore } = this.props;

    let { usingTableList, tableID } = this.state;

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
        let canGive = true;
        canGive = product.aLaCarteMethod !== 686;
        let quantity =
          action.actionType === 'willOrder'
            ? product.quantity
            : product.operateQuantity;
        if (canGive && !product.checked) areAllSelected = false;
        if (product.checked) checkedNumber += quantity;
      });
    } else {
      areAllSelected = false;
    }

    let title;
    if (action.actionName === '复制菜') {
      title = action.actionName;
    } else {
      title = action.actionType === 'willOrder' ? '赠' : '菜';
      title = '转' + title;
    }

    let quantityWord = `可${action.actionType === 'willOrder' ? '赠' : '转'}`;

    return (
      <Modal
        title={title}
        visible={true}
        maskClosable={false}
        okText="确定"
        cancelText="取消"
        width={920}
        wrapClassName="trun-give-modal"
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
              {productList && !!productList.length ? (
                productList.map((product, index) => {
                  // let canGive = product.aLaCarteMethod !== 686;
                  return (
                    <div
                      key={index}
                      className={classnames({
                        'each-food': true,
                        iconfont: true,
                        select: product.checked,
                        mask: product.checked
                      })}
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
                      <h3 className="table-name">
                        {product.productName}
                        {product.productType === 1 && (
                          <div className="taocan">套餐</div>
                        )}
                      </h3>
                      <p>
                        {action.actionName === '复制菜' ? '已点' : quantityWord}
                        {product.quantity}份
                      </p>
                      {product.checked &&
                        action.actionType === 'didOrder' && (
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
          <div className="zhuan-content">
            <div className="zhuan-content-search">
              <input
                type="text"
                placeholder="请输入桌台名称进行查询"
                onKeyUp={e => {
                  this.getUsingTableList(e.target.value);
                }}
              />
              <i className="iconfont icon-order_btn_search" />
            </div>
            {usingTableList && !!Object.keys(usingTableList).length ? (
              <VerticalTabs>
                {Object.keys(usingTableList).map((key, index) => {
                  return (
                    <TabPane tab={key} key={index}>
                      <MyScroll height={222} hasAllSelected={false}>
                        {!!usingTableList[key].length &&
                          usingTableList[key].map((table, index) => {
                            let tableName =
                              table.shareTableName &&
                              table.tableName !== table.shareTableName
                                ? table.tableName + '-' + table.shareTableName
                                : table.tableName;
                            return (
                              <li
                                key={index}
                                className={classnames({
                                  'zhuan-cai-item': true,
                                  iconfont: true,
                                  mask: false,
                                  select:
                                    table.tableID === tableID &&
                                    this.state.tableName === tableName
                                })}
                                onClick={() => {
                                  this.setState({
                                    tableID: table.tableID,
                                    tableName,
                                    subOrderID: table.subOrderID
                                  });
                                }}
                              >
                                <h3
                                  className={classnames({
                                    'table-name': true,
                                    small: getStrSize(tableName) > 9
                                  })}
                                >
                                  {tableName}
                                </h3>
                                <p>
                                  {table.customerNumber}/{table.defaultPerson}
                                </p>
                              </li>
                            );
                          })}
                      </MyScroll>
                    </TabPane>
                  );
                })}
              </VerticalTabs>
            ) : (
              <div className="empty-holder">暂无相关桌台</div>
            )}
          </div>
        </div>
        {this.state.statePopup}
      </Modal>
    );
  }
}

export default TrunGivePopup;
