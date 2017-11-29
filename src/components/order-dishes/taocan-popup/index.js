import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs, Alert, Modal } from 'antd';
import MyScroll from '../../../components/my-scrollbar';
import VerticalTabs from 'components/vertical-tabs';
import classnames from 'classnames';

import './taocan_popup.css';

const TabPane = Tabs.TabPane;

@inject('dishesStore')
@observer
class TaocanPopup extends Component {
  constructor(props, context) {
    super(props, context);

    const { comboGroup } = props;
    this.state = {
      groupComboList: comboGroup.groupComboList,
      selectedComboMap: comboGroup.selectedComboMap
    };
  }

  //确定
  handleOk = () => {
    const { dishesStore, dishes, closeHandle, cartIndex } = this.props;

    //添加套餐到购物车
    let isAdded = dishesStore.addToCart({
      cartIndex,
      isStatic: false,
      dishes,
      comboGroup: this.state
    });

    //关闭套餐弹窗
    isAdded && closeHandle && closeHandle();
  };

  //放弃
  handleCancel = () => {
    const { closeHandle } = this.props;
    //关闭套餐弹窗
    closeHandle && closeHandle();
  };

  componentWillUnmount() {
    this.props.dishesStore.closeFeedback();
  }

  render() {
    const { dishesStore } = this.props;

    const { groupComboList, selectedComboMap } = this.state;

    return (
      <div>
        <Modal
          title={this.props.title}
          visible={true}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="放弃"
          width={840}
          wrapClassName="taocan-popup-modal"
        >
          <div className="common-block">
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
            <VerticalTabs>
              {groupComboList.map((group, index) => {
                return (
                  group.groupName && (
                    <TabPane tab={group.groupName} key={index}>
                      <MyScroll width={640} height={200}>
                        {group.groupProductList.map((product, index) => {
                          return (
                            <li
                              key={index}
                              className={classnames({
                                'taocan-item': true,
                                iconfont: true,
                                mask: product.disabled
                              })}
                              onClick={() => {
                                //选择套餐菜品
                                if (!product.disabled) {
                                  let groupName = group.groupName,
                                    mappingID = product.mappingID;

                                  let productList =
                                    selectedComboMap[groupName] || [];
                                  let _groupComboList = groupComboList;
                                  let _selectedComboMap = selectedComboMap;

                                  _groupComboList = groupComboList.map(
                                    group => {
                                      if (group.groupName === groupName) {
                                        let disabled =
                                          productList.length + 1 ===
                                          group.allowQuantity;
                                        group.groupProductList.map(product => {
                                          product.disabled = disabled;
                                          if (product.mappingID === mappingID) {
                                            productList.push(product);
                                            product.count = product.count
                                              ? product.count + 1
                                              : 1;
                                          }
                                          return product;
                                        });
                                      }
                                      return group;
                                    }
                                  );
                                  _selectedComboMap[groupName] = productList;

                                  this.setState({
                                    groupComboList: _groupComboList,
                                    selectedComboMap: _selectedComboMap
                                  });
                                }
                              }}
                            >
                              {product.count > 0 && (
                                <div className="item-number">
                                  {product.count * product.quantity}
                                </div>
                              )}
                              <div className="item-header">
                                {product.variantName}
                              </div>
                              <div className="item-price">
                                ¥{product.price}/份
                              </div>
                            </li>
                          );
                        })}
                      </MyScroll>
                    </TabPane>
                  )
                );
              })}
            </VerticalTabs>
            <div className="select-items">
              <div className="select-header">已选菜品</div>
              <MyScroll width={800} height={156}>
                {(() => {
                  if (Object.keys(selectedComboMap).length > 1) {
                    return Object.keys(selectedComboMap).map((key, index) => {
                      let productList = selectedComboMap[key];
                      return (
                        productList.length > 0 && (
                          <li key={index} className="tao-can-selected-item">
                            <div className="tao-title">{key}</div>
                            <div className="tao-content-lis">
                              {productList.map((product, index) => {
                                return (
                                  <div key={index} className="tao-content">
                                    <ul className="tao-title-line">
                                      <li className="tao-index">{index + 1}</li>
                                      <li className="tao-name">
                                        {product.variantName}
                                      </li>
                                      <li className="tao-count">
                                        {product.quantity}
                                      </li>
                                      <li className="tao-price">
                                        ￥{product.price}
                                      </li>
                                    </ul>
                                    {product.memo && (
                                      <div className="tao-remarks">
                                        {product.memo}
                                      </div>
                                    )}
                                    {(() => {
                                      if (product.groupProductList) {
                                        return (
                                          <i className="iconfont icon-suo-copy" />
                                        );
                                      } else {
                                        return (
                                          <i
                                            className="iconfont icon-shanchu1"
                                            onClick={() => {
                                              let groupName = key,
                                                mappingID = product.mappingID;

                                              let _groupComboList = groupComboList;
                                              let _selectedComboMap = selectedComboMap;

                                              let first = true;
                                              let productList = selectedComboMap[
                                                groupName
                                              ].filter((dishes, index) => {
                                                let flag = true;
                                                if (
                                                  first &&
                                                  dishes.mappingID === mappingID
                                                ) {
                                                  first = false;
                                                  flag = false;
                                                }
                                                return flag;
                                              });

                                              _groupComboList = _groupComboList.map(
                                                group => {
                                                  if (
                                                    group.groupName ===
                                                    groupName
                                                  ) {
                                                    let disabled =
                                                      productList.length - 1 ===
                                                      group.allowQuantity;
                                                    group.groupProductList.map(
                                                      product => {
                                                        product.disabled = disabled;
                                                        if (
                                                          product.mappingID ===
                                                          mappingID
                                                        ) {
                                                          product.count -= 1;
                                                        }
                                                        return product;
                                                      }
                                                    );
                                                  }
                                                  return group;
                                                }
                                              );

                                              if (productList.length)
                                                _selectedComboMap[
                                                  groupName
                                                ] = productList;
                                              else
                                                delete _selectedComboMap[
                                                  groupName
                                                ];

                                              this.setState({
                                                groupComboList: _groupComboList,
                                                selectedComboMap: _selectedComboMap
                                              });
                                            }}
                                          />
                                        );
                                      }
                                    })()}
                                  </div>
                                );
                              })}
                            </div>
                          </li>
                        )
                      );
                    });
                  } else {
                    return (
                      <li className="tao-can-selected-item empty-holder small">
                        暂无相关菜品
                      </li>
                    );
                  }
                })()}
              </MyScroll>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default TaocanPopup;
