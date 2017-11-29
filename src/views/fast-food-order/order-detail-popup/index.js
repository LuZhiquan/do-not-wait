import React from 'react';
import {Modal} from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { inject, observer } from 'mobx-react';   
import { DidOrder } from 'components/order-dishes';//菜品详情主键
import'assets/styles/modal.css';
import './order_detail_popup.less';

 @inject('fastFoodOrderStore') @observer
class OrderDetailPopup extends React.Component{
     

     constructor(props){ 
        super(props);
        this.state = {  
        } 
        
      }

    //关闭按钮
    handleCancel=()=>{
      if(this.props.closebutton){
        this.props.closebutton();
      }
    }  

    fastFoodOrderStore=this.props.fastFoodOrderStore;

    render(){

      //modal的宽度
      let modalwidth; 
      if(this.fastFoodOrderStore.isOptional === 1){
        modalwidth=460;
      }else{
         modalwidth=900;
      }
      let orderHeader=this.fastFoodOrderStore.orderHeader;
      let fundDetailList=this.fastFoodOrderStore.fundDetailList;
      let orderDetailList=this.fastFoodOrderStore.orderDetailList; 
        return(
            <Modal title="订单详情" 
                visible={true} 
                maskClosable={false} 
                onCancel={this.handleCancel} 
                footer={null} 
                width={modalwidth} wrapClassName="orderdetail-popup-modal" 
              >  
              <div id="detail-main">
                  {this.fastFoodOrderStore.isOptional === 0 && 
                      <div className="state-main">
                        <div className="detail-left">
                            <div className="detail-left-one">
                              <div className="each-datil">
                                <p> <span>订单号:</span> <em>{orderHeader.orderCode}</em> </p>
                                <p> <span>餐牌号:</span>  <em>{orderHeader.sequenceNumber}</em> </p> 
                              </div> 
                              <div className="each-datil">
                                <p> <span>消费金额:</span> <em>{orderHeader.totalAmount}</em> </p>
                                <p> <span>折扣金额:</span>  <em>{orderHeader.discountAmount}</em> </p> 
                              </div>
                              <div className="each-datil">
                                <p className="hide"> <span>赠送金额:</span> <em> </em> </p>
                                <p> <span>应收金额:</span>  <em>{orderHeader.actualAmount}</em> </p> 
                              </div>
                              <div className="each-datil">
                                <p> <span>结账时间:</span> <em>{orderHeader.paidTime}</em> </p>
                                <p> <span>收银员:</span>  <em>{orderHeader.cashierName}</em> </p> 
                              </div>
                              <div className="each-remark">
                                <span>整单备注:</span>
                                <em>{orderHeader.memo}</em>
                              </div> 
                            </div> 
                            
                            {fundDetailList.length > 0 &&  <div className="detail-left-three">
                                                              <p>收款纪录</p>
                                                              {fundDetailList.map((dissh, index) => { 
                                                                  return  dissh.fundDetail.map((dis, index) => {
                                                                            let  changeType;
                                                                            if(dissh.changeType === 134){
                                                                              changeType="收款"
                                                                            }else if(dissh.changeType === 135){
                                                                                changeType="退款"
                                                                            }
                                                                            return <span>{dis.paymentName}： {changeType} {dis.changeAmount} </span>  
                                                                                    
                                                                          })  
                                                                  
                                                                          
                                                                })}
                                                            </div>
                          }
                           
                            
                        </div> 

                        <div id="detail-right">
                            <p>菜品详情</p>
                            <Scrollbars >
                                <div className="dishes-list"> 
                                    <div className="list-content">
                                      <ul>
                                               {orderDetailList.map((dishes, dishesindex) => {  
                                                    
                                                    let didOrder = [];  
                                                          didOrder.push(<DidOrder 
                                                                key={dishesindex} 
                                                                index={dishesindex+1}  
                                                                dishes={dishes}
                                                                noStatus
                                                              />);  
                                                            if(dishes.childs && dishes.childs.length) {
                                                              dishes.childs.forEach((child,childindex) => {
                                                                didOrder.push(<DidOrder 
                                                                  key={dishesindex+'-'+childindex} 
                                                                  index={-1} 
                                                                  dishes={child}
                                                                  noStatus 
                                                                />)
                                                              })
                                                            
                                                            }
                                                            return didOrder;  
                                                    
                                               })}
                                          
                                     </ul>
                                  </div>
                                </div>
                        </Scrollbars>
                        </div>
                     </div>
                  }
                  {this.fastFoodOrderStore.isOptional === 1 &&  
                      <div className="detail-left">
                            <div className="detail-left-one">
                              <div className="each-datil">
                                <p> <span>订单号:</span> <em>{orderHeader.orderCode}</em> </p>
                                <p> <span>餐牌号:</span>  <em>{orderHeader.sequenceNumber}</em> </p> 
                              </div> 
                              <div className="each-datil">
                                <p> <span>消费金额:</span> <em>{orderHeader.totalAmount}</em> </p>
                                <p> <span>折扣金额:</span>  <em>{orderHeader.discountAmount}</em> </p> 
                              </div>
                              <div className="each-datil">
                                <p className="hide"> <span>赠送金额:</span> <em></em> </p>
                                <p> <span>应收金额:</span>  <em>{orderHeader.actualAmount}</em> </p> 
                              </div>
                              <div className="each-datil">
                                <p> <span>结账时间:</span> <em>{orderHeader.paidTime}</em> </p>
                                <p> <span>收银员:</span>  <em>{orderHeader.cashierName}</em> </p> 
                              </div>
                              <div className="each-remark">
                                <span>整单备注:</span>
                                <em>{orderHeader.memo}</em>
                              </div> 
                            </div>  
                             {fundDetailList.length > 0 &&  <div className="detail-left-three">
                                                                <p>收款纪录</p> 
                                                                {fundDetailList.map((dissh, index) => { 
                                                                    return  dissh.fundDetail.map((dis, index) => {
                                                                              let  changeType;
                                                                              if(dissh.changeType === 134){
                                                                                changeType="收款"
                                                                              }else if(dissh.changeType === 135){
                                                                                  changeType="退款"
                                                                              }
                                                                              return <span>{dis.paymentName}： {changeType} {dis.changeAmount} </span> 
                                                                                      
                                                                            })    
                                                                  })}
                                                            </div>
                          }
                           
                        </div>  
                  }
                  
              </div>
        </Modal>
      )
    }
}

export default OrderDetailPopup;