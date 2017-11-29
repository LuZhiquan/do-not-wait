/**
* @author Shelly
* @description 银行卡多次付款
* @date 2017-7-4
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import PromptPopup from 'components/prompt-popup'; //提示弹窗

import './more_pay.less';
@inject('cashierStore')
@observer
class MorePay extends Component {
  state = {
    promptpopup: ''
  };
  render() {
    let cashierStore = this.props.cashierStore;
    let payListBlock;
    payListBlock = cashierStore.payList.map((ele, index) => {
      return (
        <li key={index}>
          <span className="num">{index + 1}</span>
          <span className="amount">
            {cashierStore.payList[0].paymentAmount}
          </span>
          <span className="remark" />
          <span className="receiver">李芳芳[1028]</span>
          <span className="time">2017-05-01 21:19:31</span>
          <span className="del">
            <i
              className="iconfont icon-shanchu"
              onClick={() => {
                this.setState({
                  promptpopup: (
                    <PromptPopup
                      title="提示"
                      textValue={ele.paymentAmount}
                      onOk={() => {
                        //textValue为待支付金额
                        cashierStore.payList.splice(index, 1);
                        cashierStore.returnWaitPayAccount(ele.paymentAmount);
                        cashierStore.cashMoney = 0;
                        cashierStore.changePayAll(); //重新计算支付的总额
                        cashierStore.changePayAccount(
                          cashierStore.waitPayAccount
                        ); //重新设置默认支付金额
                        this.setState({ promptpopup: '' });
                      }}
                      onCancel={() => {
                        this.setState({ promptpopup: '' });
                      }}
                    >
                      <div className="prompt">
                        <p className="warning">确定删除现金收款</p>
                        <p className="delele-text">
                          删除金额<span>{ele.paymentAmount}</span>元
                        </p>
                      </div>
                    </PromptPopup>
                  )
                });
              }}
            />
          </span>
        </li>
      );
    });
    return (
      <Modal
        title="现金－删除付款"
        visible={true}
        maskClosable={false}
        // okText={'收款'+cashierStore.waitPayAccount+'元'}
        cancelText="关闭"
        okText={null}
        width={900}
        wrapClassName="more-pay"
        onOk={() => {
          if (this.props.onOk) {
            this.props.onOk();
          }
        }}
        onCancel={() => {
          if (this.props.onCancel) {
            this.props.onCancel();
          }
        }}
      >
        <div className="content-wrap">
          <div className="content">
            <div className="wait-amount">
              待收金额 ￥<span>{cashierStore.waitPayAccount}</span>
            </div>
            <div className="table-title">
              <span className="num">序号</span>
              <span className="amount">金额</span>
              <span className="remark">备注</span>
              <span className="receiver">收款人</span>
              <span className="time">收款时间</span>
              <span className="del">删除</span>
            </div>
            <div className="scroll-area">
              <Scrollbars>
                <ul className="table-list">{payListBlock}</ul>
              </Scrollbars>
            </div>
          </div>
        </div>
        {this.state.promptpopup}
      </Modal>
    );
  }
}

export default MorePay;
