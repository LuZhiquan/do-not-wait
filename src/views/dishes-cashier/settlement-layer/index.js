/**
* @author William Cui
* @description 点菜模式收银界面
* @date 2017-07-03
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { message } from 'antd';
import classnames from 'classnames';
import DishesCalculatePayment from '../dishes-calculate-payment/';
import PayMethods from 'components/pay-methods';

import AddMembberPopup from '../../member/add-member-popup/';
import MemberDiscountPopup from 'components/member-discount-popup';
import Invoice from '../../cashier/invoice-popup/';//快餐的开发票
import ViprecordPopup from '../../member/viprecord-popup';

import './settlement_layer.less';

@inject('memberStore', 'dishesCashierStore','cashierStore', 'memberStore', 'dishesStore') @observer
class SettlementLayer extends Component {

    constructor(props, context) {
        super(props, context);
        this.state={
            statePopup: false,
            cardID:'',
        };
    }

    //关闭其他弹窗
	closePopup = () => {
		this.setState({
			statePopup: false
		});
	}

    componentDidUpdate() {
		let dishesCashierStore = this.props.dishesCashierStore;
		let feedback = dishesCashierStore.feedback;
		if(feedback && feedback.status !== 'error' && feedback.status !== 'validate') {
			//提示
			switch(feedback.status) {
				case 'success':
					message.success(feedback.msg,dishesCashierStore.closeFeedback());
					break;
				case 'warn':
					message.warn(feedback.msg,dishesCashierStore.closeFeedback());
					break;
				default:
					message.info(feedback.msg,dishesCashierStore.closeFeedback());
			}
		}
  	}

/************** //方案折和积分换菜暂时屏蔽
    <li><i className="iconfont icon-baoxianfangan"></i>方案折</li>
    <li><i className="iconfont icon-jifen"></i>积分换菜</li>
****/
    render() {
        let dishesStore=this.props.dishesStore;
        let cashierStore=this.props.cashierStore;
        let memberStore=this.props.memberStore;
        // let archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
        return <div className={classnames({
            'settlement-layer': true,
            'show': this.props.show
        })}>
          <div className="layer-title">结账
                <button onClick={() => {
                    //隐藏结账划层
                    this.props.onClose();
                }}><i className="iconfont icon-order_btn_back"></i> 返回点菜</button>
            </div>
            <ul className="amount-line">
                <li className="deep-gray f18">
                    <p className="f30 fb">{parseFloat(dishesStore.shoppingCartTotal.totalAmount).toFixed(2)}</p>
                    <p>消费金额</p>
                </li>
                <li className="deep-gray f18">
                    <p className="f30 fb">{parseFloat(dishesStore.shoppingCartTotal.totalAmount).toFixed(2)}</p>
                    <p>应收金额</p>
                </li>
                <li className="deep-gray f18">
                    <p className="f30 fb red">{parseFloat(dishesStore.shoppingCartTotal.totalAmount).toFixed(2)}</p>
                    <p>待收金额</p>
                </li>
                <li className="light-gray f18">
                    <p className="f30">{parseFloat(cashierStore.discountAmount).toFixed(2)}</p>
                    <p>折扣金额</p>
                </li>
                <li className="light-gray f18">
                    <p className="f30">{parseFloat(cashierStore.giveProductAmount).toFixed(2)}</p>
                    <p>赠送金额</p>
                </li>
                <li className="light-gray f18">
                    <p className="f30">{parseFloat(cashierStore.payAll).toFixed(2)}</p>
                    <p>已收金额</p>
                </li>
            </ul>
            <div className="layer-center">
                 <DishesCalculatePayment price={dishesStore.shoppingCartTotal.totalAmount}/>
                 <ul className="center-right">
                    <li onClick={() => {
                        memberStore.addMemberClick();
                    }}><i className="iconfont icon-huiyuanguanli_icon_xinzenghuiyuaneps" ></i>新增会员</li>
                    <li onClick={() => {
                        this.setState({
                            statePopup: <MemberDiscountPopup
                               title="会员卡"
                                    handleClose={this.closePopup}
                                    onOk={(phone,cardID,cardCode)=>{//正式接口
                                    // onOk={(phone,type)=>{//临时的
                                             cashierStore.getMemberInfol(phone,cardID,cardCode,()=>{//正式的
                                            // cashierStore.getMemberInfol(phone,type,()=>{//临时的
                                            this.setState({cardID:cashierStore.cardID});
                                            memberStore.showVipPopup();
                                            this.closePopup();
                                            })
                                    }}
                            />
                        });
                    }}><i className="iconfont icon-chongzhi" ></i>充值</li>
                    
                    <li onClick={()=>{
                            this.setState({statePopup: <Invoice
                                invoiceAmount={cashierStore.payAll}
                                orderAmount={cashierStore.settleAccount}
                                handleClose={this.closePopup}
                                optional
                            />})
                        }}><i className="iconfont icon-fapiaodaikai"></i>开发票</li>
                 </ul>
            </div>
            <div className="pay-methods">
                <PayMethods value={dishesStore.shoppingCartTotal.totalAmount} isSnack={true} payAmount={dishesStore.shoppingCartTotal.totalAmount} dishesPay={true} memo={this.props.memo}/>
            </div>
            {memberStore.isShowAddMember && <AddMembberPopup  />}
            {memberStore.isShowVipPopup && <ViprecordPopup  cardID={this.state.cardID}/>}
            {this.state.statePopup}
        </div>
    }
}

export default SettlementLayer;