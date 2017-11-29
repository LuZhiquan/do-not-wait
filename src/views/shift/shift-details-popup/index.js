
/**
* @author shining
* @description 交班详情
* @date 2017-05-26
**/
import React from 'react'; 
import { Modal } from 'antd'; 
import { inject, observer } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars';
import './shift-details-popup.less';


@inject('shiftStore') @observer
class ShiftDetailsPopup extends React.Component {

  //取消关闭的按钮
  handleCancel=()=>{
    if(this.props.closebutton){
      this.props.closebutton();
    } 
  }

  
  shiftStore=this.props.shiftStore; 
  render() {    
		let connectdata=this.shiftStore.connectdata; 
		let workingMoney=this.shiftStore.workingMoney; 
    let orderMoneyVO=this.shiftStore.orderMoneyVO;
		let orderMoneylist=this.shiftStore.orderMoneylist; //订单收款
		let unSubscribeMoneylist=this.shiftStore.unSubscribeMoneylist;//退订
		let memberMoneylist=this.shiftStore.memberMoneylist;//会员充值
		let bookingMoneylist=this.shiftStore.bookingMoneylist;//预收订金
    return (
       <div>
          <Modal title="交班详情"
              visible={true}   
              onCancel={this.handleCancel} 
              footer={null}
              width={900} wrapClassName="shift-details-popup-modal"  
            >
            <div className="shift-title">
              <span>{connectdata.createTime} 至 {connectdata.endTime} </span>
              <span><em>订单餐次：</em>{connectdata.mealsName}</span>
              <span><em>交班人：</em>{connectdata.creatorName}</span>
              <span><em>收银机：</em>{connectdata.deviceCode}</span>
            </div>

            <div className="shift-data">
                <MyScroll>
                    <div className="each-main">
                      <div className="each-list">
                          <p>
                            <span className="each-title">
                              <em> 营业<br/>统计</em>
                            </span> 
                          </p>
                         	<p>
                            {/*<span>收入总额：{workingMoney.inComeAmount}</span>*/} 
                            <span>订单收入：{workingMoney.orderInComeAmount}</span>
                            <span className="dashed">开票金额：{workingMoney.billingAmount}</span> 
                            <span>现金：{workingMoney.cashAmount}</span> 
                          </p>
                          <p>
                            <span>会员充值收款：{workingMoney.memberInComeAmount}</span>
                            {/*<span>还款金额：{workingMoney.refundAmount}</span>*/}
                            <span className="dashed">备用金：{workingMoney.backUpAmount}</span>
                            <span>微信：{workingMoney.wxAmount}</span> 
                          </p>
                          <p>
                            <span>预收订金：{workingMoney.bookingInComeAmount}</span> 
                            <span className="dashed"></span>
                            <span>支付宝：{workingMoney.aliAmount}</span> 
                          </p>
                          <p>
                            <span>退还订金：{workingMoney.returnBookingAmount}</span>
                            <span className="dashed"></span>
                            <span>K币：{workingMoney.kbAmount}</span> 
                          </p>  
                      </div>
                      <div className="each-list">
                        <p>
                          <span className="each-title">
                            <em> 订单<br/>统计</em>
                          </span> 
                        </p>
                        <p>
                          <span>订单数：{orderMoneyVO.orderNum}</span>
                          <span>折扣金额：{orderMoneyVO.discountAmount}</span>
                          <span>订单金额：{orderMoneyVO.orderPayAmount}</span> 
                        </p>
                        <p>
                          <span>人数：{orderMoneyVO.peopleNum}</span>
                          <span>减免金额：{orderMoneyVO.jianmianAmount}</span> 
                        </p>
                        <p>
                          <span>消费金额：{orderMoneyVO.orderAmount}</span>
                          <span>服务费：{orderMoneyVO.feeAmount}</span> 
                        </p>
                        <p>
                          <span>赠菜金额：{orderMoneyVO.zengsongAmount}</span>
                          <span>抹零：{orderMoneyVO.molingAmount}</span>  
                        </p>  
                      </div>
                      <div className="each-list-child">
                        <p>
                          <span className="each-title">
                            <em>订单<br/>收款</em>
                          </span> 
                        </p>
                        <div className="each-text-main">
                        {(() =>{
                          if(orderMoneylist.length) {
                            return orderMoneylist.map((orderMoney,i) => { 
                              let lempnum;
                              if(Number(orderMoney.num) !== 0){ 
                                lempnum="("+orderMoney.num+"笔)";
                              }else{
                                lempnum='';	
                              } 
                              if(orderMoney.amount !== 0){
                                 return  <span key={i}>{orderMoney.payMethodName}：{orderMoney.amount} {lempnum}</span>
                              }else{
                                return null; 
                              }  
                            });
                          }
                          })()} 
                          
                        </div> 
                      </div>
                      <div className="each-list-child">
                        <p>
                          <span className="each-title">
                            <em> 会员<br/>充值</em>
                          </span> 
                        </p>
                        <div className="each-text-main">
                        {(() =>{
                          if(memberMoneylist.length) {
                            return memberMoneylist.map((member,i) => { 
                                let lempnum;
                                if(Number(member.num) !== 0){ 
                                  lempnum="("+member.num+"笔)";
                                }else{
                                  lempnum='';	
                                } 
                                if(member.amount !== 0){
                                  return  <span key={i}>{member.payMethodName}：{member.amount} {lempnum}</span>
                                }else{
                                  return null; 
                                }  
                              
                            });
                          }
                          })()}  
                        </div> 
                      </div> 
                      <div className="each-list-child">
                        <p>
                          <span className="each-title">
                            <em> 预收<br/>订金</em>
                          </span> 
                        </p>
                        <div className="each-text-main">
                        {(() =>{
                          if(bookingMoneylist.length) {
                            return bookingMoneylist.map((bookingMoney,i) => { 
                               let lempnum;
                                if(Number(bookingMoney.num) !== 0){ 
                                  lempnum="("+bookingMoney.num+"笔)";
                                }else{
                                  lempnum='';	
                                } 
                               if(bookingMoney.amount !== 0){
                                  return  <span key={i}>{bookingMoney.payMethodName}：{bookingMoney.amount} {lempnum}</span>
                               }else{
                                return null; 
                              }  
                              
                            });
                          }
                          })()} 
                          
                        </div> 
                      </div>
                      <div className="each-list-child">
                        <p>
                          <span className="each-title">
                            <em>退订</em>
                          </span> 
                        </p>
                        <div className="each-text-main">
                        {(() =>{
                          if(unSubscribeMoneylist.length) {
                            return unSubscribeMoneylist.map((unSubscribeMoney,i) => {
                                let lempnum;
                                if(Number(unSubscribeMoney.num) !== 0){ 
                                  lempnum="("+unSubscribeMoney.num+"笔)";
                                }else{
                                  lempnum='';	
                                } 
                               if(unSubscribeMoney.amount !== 0){
                                  return  <span key={i}>{unSubscribeMoney.payMethodName}：{unSubscribeMoney.amount} {lempnum}</span>
                               } else{
                                  return null; 
                                }   
                            });
                          }
                          })()} 
                          
                        </div> 
                      </div>   
                  </div>
                </MyScroll>
              </div>

          
          </Modal> 
       </div>
    );
  }
}

export default ShiftDetailsPopup;