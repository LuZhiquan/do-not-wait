/**
* @author shelly
* @description 折扣券界面
* @date 2017-05-15
**/
import React from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';

import './discount_coupon_popup.less';

@inject('settlementStore') @observer
class DiscountCoupon extends React.Component {
  handleCancle=()=>{
    this.props.settlementStore.discountCouponCancle();
  }
  render() {
    return (
      <div id="discount-coupon">
        <Modal title="折扣券" 
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='取消'
            width={500}
            onCancel={this.handleCancle}
            wrapClassName="discount-coupon-modal"
        >
          <div>
            <div className="change-tab">
              <i className="iconfont icon-account_btn_bankcard"></i>
            </div>
            <input type="text" className="input-value" placeholder="请输入折扣券"/>
          </div>
        </Modal>
      </div>
    )
  }
}

export default DiscountCoupon;