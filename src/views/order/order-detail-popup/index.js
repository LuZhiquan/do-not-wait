import React from 'react';
import {Modal} from 'antd'; 
import Scrollbars from 'react-custom-scrollbars';
import { inject, observer } from 'mobx-react';   
import { DidOrder } from 'components/order-dishes';//菜品详情主键
import'assets/styles/modal.css';
import './order_detail_popup.less';


@inject('orderStore') @observer
class OrderDetailPopup extends React.Component{
     

    //关闭按钮
    handleCancel=()=>{
      if(this.props.closebutton){
        this.props.closebutton();
      }
    }  

    render(){
       let orderStore=this.props.orderStore; 
       let msgobj=orderStore.msgobj;
       let subOrderlist=orderStore.subOrderlist; 
     
       let fundChangeVOList=orderStore.fundChangeVOList;  
        return(
            <Modal title="订单详情" 
                visible={true} 
                maskClosable={false} 
                onCancel={this.handleCancel} 
                footer={null} 
                width={900} wrapClassName="orderdetail-popup-modal" 
              >  
              <div id="detail-main">
                  <div className="detail-left">
                      <div className="detail-left-one">
                        <div className="each-datil">
                          <p> <span>订单号:</span> <em>{msgobj.orderCode}</em> </p>
                          <p> <span>桌台:</span>  <em>{msgobj.tableName}</em> </p> 
                        </div> 
                        <div className="each-datil">
                          <p> <span>开台时间:</span> <em>{msgobj.createTime}</em> </p>
                          <p> <span>开台人:</span>  <em>{msgobj.createName}</em> </p> 
                        </div>
                        <div className="each-datil">
                          <p> <span>人数:</span> <em>{msgobj.customerNumber}</em> </p> 
                        </div>
                        <div className="each-remark">
                          <span>整单备注:</span>
                          <em>{msgobj.subOrderDesc}</em>
                        </div>
                        <div className="each-remark">
                          <span>关联桌台:</span>
                          <em>{msgobj.combineMemo}</em>
                        </div>

                      </div>
                      <div className="detail-left-two">
                         <div className="each-datil">
                            <p> <span>消费金额:</span> <em>{msgobj.totalAmount}</em> </p>
                            <p> <span>赠菜金额:</span>  <em>{msgobj.largess}</em> </p> 
                         </div>
                         <div className="each-datil">
                            <p> <span>折扣金额:</span> <em>{msgobj.discount}</em> </p>
                            <p> <span>服务费:</span>  <em style={{textDecoration: msgobj.amountIsFee ? 'line-through' : 'none'}}>{msgobj.serverAmount}</em> </p> 
                         </div>
                          <div className="each-datil">
                            <p> <span>减免金额:</span> <em>{msgobj.derateAmount}</em> </p>
                            <p> <span>减免人:</span>  <em>{msgobj.deratePeople}</em> </p> 
                         </div>
                          <div className="each-datil">
                            <p> <span>抹零金额:</span> <em>{msgobj.noChange}</em> </p>
                            <p> <span>应收:</span>  <em>{msgobj.actualAmount}</em> </p> 
                         </div>
                      </div>
                      
                      {fundChangeVOList.length > 0 
                        &&  <div className="detail-left-three">
                        <p>收款纪录</p>
                        {fundChangeVOList.map((dishes, index) => { 
                          let  changeType;
                          if(dishes.changeType === 134){
                            changeType="收款"
                          }else if(dishes.changeType === 135){
                              changeType="退款"
                          }
                          return <span>{dishes.paymentName}： {changeType} {dishes.changeAmount} </span>       
                        })}
                      </div>}
                  </div> 
                  <div id="detail-right">
                  <p>菜品详情</p> 
                  <Scrollbars >
                   <div className="dishes-list"> 
                      <div className="list-content">
                        <ul>
                          {subOrderlist.map((dis, index) => { 
                            let didOrder = [];  
                            didOrder.push(<div className="many-table-info">
                                            <div className="table-num">{dis.tableName}</div>
                                            <div className="order-num">订单号:{dis.orderCode}</div>
                                          </div>)
                            dis.foodlist.forEach(((dishes, dishindex) => {//左边菜品列表 
                                  didOrder.push(<DidOrder 
                                        key={dishindex} 
                                        index={dishindex+1}  
                                        dishes={dishes}
                                        noStatus
                                      />);  
                                    if(dishes.childs && dishes.childs.length) {
                                      dishes.childs.forEach((child ,childindex)=> {
                                        didOrder.push(<DidOrder 
                                          key={dishindex+'-'+childindex} 
                                          index={-1} 
                                          dishes={child}
                                          noStatus 
                                        />)
                                      })
                                      
                                    };
                                    /**2017-9-30 by FXL */
                                    if(dishes.assortedDishesList && dishes.assortedDishesList.length) {
                                      dishes.assortedDishesList.forEach((spell ,spellIndex)=> {
                                        didOrder.push(<DidOrder 
                                            key={dishindex+'-'+spellIndex} 
                                            index={-2} 
                                            dishes={spell}
                                            noStatus 
                                        />)
                                      })
                                      
                                    }
                                   /**2017-9-30 by FXL */
                                }))
                              return didOrder; 
                            })}
                        </ul>
                      </div>
                    </div>
                    </Scrollbars>
                  </div> 
                  
              </div>
        </Modal>
      )
    }
}

export default OrderDetailPopup;