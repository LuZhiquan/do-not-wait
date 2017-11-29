/**
* @author shelly
* @description 
* @date 2017-05-16
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { message } from 'antd';
import classnames from 'classnames';
import { WillOrderList } from 'components/order-dishes';

import './show.less';

message.config({
  top: 300,
  duration: 1
});

@inject('cashierStore', 'dishesStore')
@observer
class DoubleScreen extends Component {
  render() {
    let dishesStore = this.props.dishesStore;
    return (
      <div id="double-screen">
        <div className="account-header">
          <div className="header-left">
            <div className="merchant-img" />
            <p className="merchant-name">万州烤鱼快餐科技园店</p>
            <p>订餐电话：66557788</p>
          </div>
          <div className="header-left">
            <p>[1028]号收银员为您服务</p>
            <div className="logo">
              <img
                src={require('../../assets/images/logo.png')}
                alt="这是不用等餐饮平台logo"
              />
            </div>
            <p className="last-p">[1028]不用等餐饮管理软件</p>
          </div>
        </div>
        <div id="account_container">
          <div id="account_con_left">
            <div className="dishes-list">
              {dishesStore.shoppingCart && dishesStore.shoppingCart.length ? (
                <WillOrderList />
              ) : (
                <div className="welcome-log">
                  <img
                    src={require('../../assets/images/welcome.png')}
                    alt="这是欢迎背景"
                  />
                </div>
              )}

              <div
                className={classnames({
                  'dishes-memo': true,
                  'hide-memo': dishesStore.shoppingCart.length === 0
                })}
              >
                <h2 className="dishes-memo-title"> 整单备注</h2>
                <div className="dishes-demo-cont">
                  这里是备注这里是备注这里是备注这里是备注这里是备注
                </div>
              </div>
            </div>
            <div className="left-account">
              <div className="amount">
                <p>
                  96.00<span>消费金额</span>
                </p>
                <p>
                  12.00<span>优惠金额</span>
                </p>
                <p className="receivable">
                  84.00<span>应收金额</span>
                </p>
                <p>
                  50.00<span>已收金额</span>
                </p>
                <p className="dine-card">
                  餐牌号<span>3</span>
                </p>
              </div>
              <div className="pay-method" />
            </div>
          </div>
          <div id="account_con_right" />
        </div>
      </div>
    );
  }
}

export default DoubleScreen;
