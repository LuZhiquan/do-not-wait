import React from 'react';
import { Modal, message } from 'antd';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import MyScroll from 'react-custom-scrollbars';

import Loading from 'components/loading';
import AddOrderPopup from 'components/order-dishes/add-order-validation-popup'; //下单不成功提示弹窗

import './booking-dishes-popup.less';

@inject('bookingStore')
@observer
class BookingDishesPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: this.props.bookingStore.currentDeskIndex,
      loading: ''
    };
  }

  componentDidMount() {
    let bookingStore = this.props.bookingStore;
    bookingStore.currentDesk =
      bookingStore.selectDesk[bookingStore.currentDeskIndex];
    if (this.props.cart) {
      let cart = JSON.parse(this.props.cart);
      if (bookingStore.currentDesk.cart) {
        bookingStore.selectDesk = bookingStore.selectDesk.map((ele, index) => {
          if (ele.tableID === bookingStore.currentDesk.tableID) {
            ele.cart = cart;
          }
          return ele;
        });
      } else {
        bookingStore.selectDesk = bookingStore.selectDesk.map((ele, index) => {
          ele.cart = cart;
          return ele;
        });
      }
    }
  }

  //取消事件
  handleCancel = () => {
    if (this.props.handleCancel) {
      this.props.handleCancel();
    }
    this.props.bookingStore.moreHandleCancel();
  };
  //确定事件
  handleOk = () => {
    let bookingStore = this.props.bookingStore;

    let emptyDesk = bookingStore.selectDesk.filter((desk, index) => {
      return desk.cart === '';
    });

    if (this.props.handleOk) {
      this.props.handleOk();
    }

    if (emptyDesk.length > 0) {
      message.config({
        top: 200,
        duration: 2
      });
      message.destroy();
      message.error('还有桌台没有点菜');
    } else {
      this.setState({ loading: true });
      bookingStore.payMoreSaveBooking(
        (success, msg, bookingID) => {
          this.setState({ loading: '' });

          if (success) {
            message.destroy();
            message.success(msg, 1);
            browserHistory.push('/booking/pay/' + bookingID);
          } else {
            message.destroy();
            message.warn(msg, 1);
          }
        },
        data => {
          this.setState({
            statePopup: (
              <AddOrderPopup
                data={data}
                handleClose={() => {
                  this.setState({ statePopup: false });
                  this.props.bookingStore.toBookingDishes();
                }}
              />
            ),
            loading: ''
          });
        }
      );
    }
  };
  //点菜
  dishesClick = () => {
    if (this.props.dishesClick) {
      this.props.dishesClick();
    }
    this.props.bookingStore.toBookingDishes();
  };

  render() {
    let bookingStore = this.props.bookingStore;

    return (
      <div>
        <Modal
          title="预订点菜－多台点菜"
          visible={true}
          closable={false}
          maskClosable={false}
          footer={null}
          width={840}
          wrapClassName="booking-dishes-popup"
        >
          <div className="booking-dishes-main">
            <div className="booking-dishes-left">
              <ul>
                <li>序号</li>
                <li>菜品</li>
                <li>规格</li>
                <li>单位</li>
                <li>数量</li>
                <li>做法</li>
              </ul>
              <div className="data-main">
                <MyScroll>
                  {bookingStore.currentDesk.cart &&
                    bookingStore.currentDesk.cart.shoppingCart.map(
                      (item, index) => {
                        return (
                          <div key={index} className="each-data">
                            <span>{index + 1}</span>
                            <span>{item.productName}</span>
                            <span>
                              {item.optionName ? item.optionName : ''}
                            </span>
                            <span>{item.unit}</span>
                            <span>{item.quantity}</span>
                            <span>
                              {item.attributeList &&
                                item.attributeList[0] &&
                                item.attributeList[0].attributeName}
                            </span>
                          </div>
                        );
                      }
                    )}
                </MyScroll>
              </div>
            </div>
            <div className="booking-dishes-right">
              <MyScroll>
                <span className="booking-title">选择点菜桌台</span>
                {bookingStore.selectDesk &&
                  bookingStore.selectDesk.map((desk, index) => {
                    let quantity = 0;
                    if (
                      desk.cart.shoppingCart &&
                      desk.cart.shoppingCart.length > 0
                    ) {
                      desk.cart.shoppingCart.forEach((ele, index) => {
                        quantity += ele.quantity;
                      });
                    }
                    return (
                      <div
                        key={index}
                        className={classnames({
                          'each-dishes': true,
                          select:
                            this.props.bookingStore.currentDeskIndex === index
                        })}
                        onClick={() => {
                          bookingStore.deskItemClick(index, desk);
                        }}
                      >
                        <span
                          className={classnames({
                            small: desk.tableName.length > 8
                          })}
                        >
                          {desk.tableName}
                        </span>
                        <span>{desk.defaultPerson}人桌</span>
                        <span>{quantity}道菜</span>
                      </div>
                    );
                  })}
              </MyScroll>
            </div>
          </div>
          <div className="footer">
            <div onClick={this.dishesClick}>点菜</div>
            <div onClick={this.handleOk}>点菜完成</div>
            <div onClick={this.handleCancel}>取消</div>
          </div>
          {this.state.loading && <Loading />}
        </Modal>
        {this.state.statePopup}
      </div>
    );
  }
}

export default BookingDishesPopup;
