import React from 'react';
import { Modal, Button } from 'antd';
import classnames from 'classnames';
import Scrollbars from 'react-custom-scrollbars';

import './take_order_popup.css';

import { WillOrder } from 'components/order-dishes';

//取单弹窗
class TakeOrderPopup extends React.Component {
  orderList = localStorage.getItem('orderList') &&
    JSON.parse(localStorage.getItem('orderList')); //获取localStorage的orderList
  firstKey = this.orderList && Object.keys(this.orderList)[0]; //获取第一个挂起单的key

  state = {
    orderKey: this.firstKey, //选中单的key
    shoppingCart:
      this.orderList &&
      this.firstKey &&
      this.orderList[this.firstKey].cart.shoppingCart //选中单的菜单列表
  };

  //确定
  handleOk = () => {
    let { handleClose, takeOrder } = this.props;
    this.state.orderKey && takeOrder && takeOrder(this.state.orderKey);
    handleClose && handleClose();
  };
  //放弃
  handleCancel = () => {
    let { handleClose } = this.props;
    handleClose && handleClose();
  };

  render() {
    let { orderKey, shoppingCart } = this.state;
    return (
      <Modal
        title="取单"
        visible={true}
        maskClosable={false}
        width={900}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          <Button
            key="empty"
            className="empty-btn"
            onClick={e => {
              localStorage.removeItem('orderList');
              this.handleCancel();
            }}
          >
            清空挂单
          </Button>,
          <Button key="cancel" size="large" onClick={this.handleCancel}>
            取消
          </Button>,
          <Button
            key="confirm"
            size="large"
            onClick={this.handleOk}
            className="ant-btn-primary"
          >
            确定
          </Button>
        ]}
        wrapClassName="take-order-popup-modal"
      >
        <div className="order-container">
          <div className="order-tabs">
            {this.orderList && Object.keys(this.orderList).length ? (
              <Scrollbars>
                <ul className="order-tabs-list">
                  {Object.keys(this.orderList).map(key => {
                    let order = this.orderList[key];
                    return (
                      <li
                        key={key}
                        className={classnames({
                          clearfix: true,
                          selected: orderKey === key
                        })}
                        onClick={() => {
                          this.setState({
                            orderKey: key,
                            shoppingCart: order.cart.shoppingCart
                          });
                        }}
                      >
                        <h2 className="time">{order.time}</h2>
                        <span className="total-quantity">
                          {order.quantity}份餐品
                        </span>
                        <span className="total-price">￥{order.price}</span>
                        <i
                          className="iconfont icon-icon1460188478041 delete"
                          onClick={e => {
                            e.stopPropagation();

                            delete this.orderList[key];
                            localStorage.setItem(
                              'orderList',
                              JSON.stringify(this.orderList)
                            );

                            let orderList =
                              localStorage.getItem('orderList') &&
                              JSON.parse(localStorage.getItem('orderList'));
                            let firstKey =
                              this.orderList && Object.keys(this.orderList)[0];
                            
                            this.setState({
                              orderKey: firstKey,
                              shoppingCart:
                                orderList &&
                                firstKey &&
                                orderList[firstKey].cart.shoppingCart
                            });
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              </Scrollbars>
            ) : (
              <div className="empty-holder">请先挂单</div>
            )}
          </div>
          <div className="order-dishes dishes-list">
            {shoppingCart && !!shoppingCart.length ? (
              <Scrollbars>
                <div className="list-content">
                  <ul>
                    {shoppingCart.map((dishes, index) => {
                      let willOrder = [];
                      willOrder.push(
                        <WillOrder
                          key={index}
                          index={index}
                          dishes={dishes}
                        />
                      );
                      if (dishes.comboList && dishes.comboList.length) {
                        dishes.comboList.forEach(combo => {
                          willOrder.push(
                            <WillOrder
                              key={combo.variantID}
                              index={-1}
                              dishes={combo}
                            />
                          );
                        });
                      }
                      return willOrder;
                    })}
                  </ul>
                </div>
              </Scrollbars>
            ) : (
              <div className="empty-holder">请先挂单</div>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

export default TakeOrderPopup;
