/**
* @author Shelly
* @description 自选模式收银界面
* @date 2017-07-03
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { message } from 'antd';
import CashierCalculate from './cashier-calculate';
import CashierCalculatePayment from './cashier-calculate-payment/';
import AddMembberPopup from '../member/add-member-popup'; //新增会员
import MemberDiscountPopup from 'components/member-discount-popup';
import Invoice from './invoice-popup/'; //快餐的开发票
import ViprecordPopup from '../member/viprecord-popup';

import PayMethods from 'components/pay-methods';

import './cashier.less';
message.config({
  top: 300,
  duration: 1
});

@inject('cashierStore', 'settlementStore', 'memberStore')
@observer
class Cashier extends Component {
  state = {
    statePopup: false,
    invoice: false,
    cardID: ''
  };

  //关闭其他弹窗
  closePopup = () => {
    this.setState({
      statePopup: false
    });
  };

  render() {
    let cashierStore = this.props.cashierStore;
    let memberStore = this.props.memberStore;

    return (
      <div id="container">
        <div className="cashier">
          <div className="cashier-center">
            {cashierStore.payWindowShow ? (
              <CashierCalculatePayment
                price={cashierStore.waitPayAccount}
                onCancel={() => {
                  //price为支付窗口中的默认待付金额
                  if (cashierStore.payAll > 0) {
                    message.info('已支付部分金额，如果确定要取消单据，请先删除付款');
                  } else {
                    cashierStore.payWindowShow = false;
                    cashierStore.clearData();
                  }
                }}
              />
            ) : (
              <CashierCalculate
                onOk={value => {
                  cashierStore.changeSettleAccount(value);
                  cashierStore.payWindowShow = true;
                }}
              />
            )}
            <div className="right-btn">
              <button
                onClick={() => {
                  this.setState({
                    statePopup: (
                      <Invoice
                        invoiceAmount={cashierStore.payAll}
                        orderAmount={cashierStore.settleAccount}
                        handleClose={this.closePopup}
                        optional
                      />
                    )
                  });
                }}
              >
                <i className="iconfont icon-fapiaodaikai" />开发票
              </button>
              <button
                className="dishes-member-btn"
                onClick={() => {
                  this.setState({
                    statePopup: (
                      <MemberDiscountPopup
                        title="会员卡"
                        handleClose={this.closePopup}
                        onOk={(phone, cardID, cardCode) => {
                          //正式接口
                          // onOk={(phone,type)=>{//临时的
                          cashierStore.getMemberInfol(
                            phone,
                            cardID,
                            cardCode,
                            () => {
                              //正式的
                              // cashierStore.getMemberInfol(phone,type,()=>{//临时的
                              this.setState({ cardID: cashierStore.cardID });
                              memberStore.showVipPopup();
                              this.closePopup();
                            }
                          );
                        }}
                      />
                    )
                  });
                }}
              >
                <i className="iconfont icon-chongzhi" />充值
              </button>
              <button
                className="dishes-member-btn"
                onClick={() => {
                  memberStore.addMemberClick();
                }}
              >
                <i className="iconfont icon-xinzenghuiyuan" />新增会员
              </button>
            </div>
          </div>

          <PayMethods
            className="payment-method"
            optional
            isSnack={true}
            value={cashierStore.waitPayAccount}
            payAmount={cashierStore.waitPayAccount}
          />
        </div>
        {memberStore.isShowAddMember && <AddMembberPopup />}
        {memberStore.isShowVipPopup && (
          <ViprecordPopup cardID={this.state.cardID} />
        )}
        {this.state.statePopup}
      </div>
    );
  }
}

export default Cashier;
