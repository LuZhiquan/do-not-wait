/**
* @author shelly/shining
* @description 快餐订单界面
* @date 2017-07-04
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';  
import classnames from 'classnames'; 
import Scrollbars from 'react-custom-scrollbars'; 
import OrderDetailPopup from './order-detail-popup'; 
import { message} from 'antd';
import RetreatFoodPopup from './retreat-food-popup'; 
import InvoicePopup from '../fast-food-order/invoice-popup'; 
import './order.less';



// 订单列表
function OrderList({ fastFoodOrderStore, ord,handleClick}) { 
    return <div onClick={handleClick} className={ord.selected === true ? 'each-data click-data' : 'each-data'}>
				<span>{ord.index+1}</span>
				<span>{ord.createTime}</span>
				<span>{ord.orderCode}</span>
				<span>{ord.sequenceNumber}</span>
				<span>{ord.mealsName}</span>
				<span>{ord.actualAmount}</span>
				<span>{ord.oderAmount  == null ? 0 : ord.oderAmount }</span>
				<span>{ord.cashierName}</span>
				<span>{ord.paidTime}</span>
				<span>{ord.orderTypeName}</span>
				<span>{ord.orderStatusName}</span> 
			</div> 
}

@inject('fastFoodOrderStore') @observer
class FastFoodOrder extends Component {
	constructor(props){ 
		super(props);
		this.state = { 
			orderdetail:'',//订单详情	
			retreatfood:'',//退菜
			mealsIDValue:'',//请输入餐次
			orderCodeValue:'',//请输入订单查询
			InvoicePopup:''//开发票
		} 
		let fastFoodOrderStore =this.props.fastFoodOrderStore;
		fastFoodOrderStore.getQuickOrderInfoList({mealsID:'',orderCode:''});
		
	}

	componentDidUpdate() { 
        let feedback = this.fastFoodOrderStore.feedback;
        if(feedback) {
        //提示
            switch(feedback.status) {
                case 'success':
                    message.success(feedback.msg,this.fastFoodOrderStore.closeFeedback());
                    break;
                case 'warn':
                    message.warn(feedback.msg,this.fastFoodOrderStore.closeFeedback());
                    break;
                case 'error':
                    message.warn(feedback.msg,this.fastFoodOrderStore.closeFeedback());
                    break;
                default:
                    message.info(feedback.msg,this.fastFoodOrderStore.closeFeedback());
            }
        }    
    }

	fastFoodOrderStore =this.props.fastFoodOrderStore;

	//订单详情
	orderdetail=()=>{ 
		let flagt;
		this.fastFoodOrderStore.OrderList.map((ord,index)=>{//判断是否选中有数据 
			if(ord.selected === true){
				flagt=true;
			}
			return ord;
		}); 
		 
		if(flagt !== true){
			message.destroy();
			message.warn("请选中数据");     
		}else{  
			if(this.fastFoodOrderStore.isOptional === 1){
				this.fastFoodOrderStore.getQuickOrderHeader({orderID:this.fastFoodOrderStore.orderId}); 
				this.fastFoodOrderStore.getQuickFundChange({orderID:this.fastFoodOrderStore.orderId});
				
			}else{
				this.fastFoodOrderStore.getQuickOrderHeader({orderID:this.fastFoodOrderStore.orderId});
				this.fastFoodOrderStore.getQuickOrderDetailInfo({orderID:this.fastFoodOrderStore.orderId});
				this.fastFoodOrderStore.getQuickFundChange({orderID:this.fastFoodOrderStore.orderId});	
			}
            this.setState({
				orderdetail:
				<OrderDetailPopup 
					closebutton={()=>{
						this.setState({orderdetail:''});
					}}>
				</OrderDetailPopup>
			})
		 
		}   
	}


	//退菜
	clickretreat=()=>{
		let flagt;
		this.fastFoodOrderStore.OrderList.map((ord,index)=>{//判断是否选中有数据 
			if(ord.selected === true){
				flagt=true;
			}
			return ord;
		}); 
 
		if(flagt !== true){
			message.destroy();
			message.warn("请选中数据");     
		}else{
			this.fastFoodOrderStore.getReturnQuickOrderDetail({orderID:this.fastFoodOrderStore.orderId}); 
			this.fastFoodOrderStore.getRevocationFood();
			this.fastFoodOrderStore.retreatfood=true;
			this.setState({
				retreatfood:
				<RetreatFoodPopup 
					handleCancel={()=>{
						this.setState({retreatfood:''}); 
					}}
					handleOk={()=>{
						this.setState({retreatfood:''});
					}}>
				</RetreatFoodPopup>
			})
		}
		
	}

	//点击每一行
	clickfastFood=(ord)=>{ 
		this.fastFoodOrderStore.checkedQuickOrder(ord.orderId);
		this.fastFoodOrderStore.saveValue(ord);
		console.log(ord.oderAmount  == null ? 0 : ord.oderAmount )
		this.fastFoodOrderStore.oderAmount=ord.oderAmount  == null ? 0 : ord.oderAmount ;
	}


	
    mealsIDValue=(e)=>{
		var value = e.target.value;
		this.setState({mealsIDValue:value});
    }


	orderCodeValue=(e)=>{
		var value = e.target.value;
		this.setState({orderCodeValue:value});
    }

	//点击查询
	clickSelect=()=>{
		this.fastFoodOrderStore.getQuickOrderInfoList({mealsID:this.state.mealsIDValue,orderCode:this.state.orderCodeValue});
	}

	kaiFapiao=()=>{
		let flagt;
		this.fastFoodOrderStore.OrderList.map((ord,index)=>{//判断是否选中有数据 
			if(ord.selected === true){
				flagt=true;
			}
			return ord;
		}); 
		if(flagt !== true){
			message.destroy();
			message.warn("请选中数据");     
		}else{ 
			if(this.fastFoodOrderStore.oderAmount === 0){
				this.setState({
					InvoicePopup:
					<InvoicePopup 
						okbutton={()=>{
							this.setState({InvoicePopup:''});
						}}
						closebutton={()=>{
							this.setState({InvoicePopup:''});
						}}>
					</InvoicePopup>
				})
			}else{
				message.destroy();
				message.warn("此订单已经开过发票了");  
			}
			 
		}
		
	}
	

	render() {
		let fastFoodOrderStore = this.props.fastFoodOrderStore;
		let feedback = this.fastFoodOrderStore.feedback;
		return (
			<div id="fast-food-order">
				<div className="fast-food-top">
					<input type="text" placeholder="请输入餐次" onKeyUp={this.mealsIDValue}/>
					<input type="text" placeholder="请输入订单查询" onKeyUp={this.orderCodeValue}/>
					<div className="search-box" onClick={this.clickSelect}>
						<i className="iconfont icon-order_btn_search"></i>
						查询
					</div>
				</div>
				<div className="food-list">
					<ul className="list-title">
						<li>序号</li>
						<li>营业日期</li>
						<li>订单号</li>
						<li>餐牌号</li>
						<li>餐次</li>
						<li>订单金额</li>
						<li>开票金额</li>
						<li>收银员</li>
						<li>结账时间</li>
						<li>快餐类型</li>
						<li>状态</li> 
					</ul>
					<div className="list-content">
						<Scrollbars>
						 {fastFoodOrderStore.OrderList.length !== 0 ? fastFoodOrderStore.OrderList.map((ord,index) => { 
								return <OrderList key={index} 
													fastFoodOrderStore={this.fastFoodOrderStore} 
													ord={ord}  
													handleClick={this.clickfastFood.bind(this, ord)}
										/>
							}) : <div className="empty-holder">暂无数据</div> } 
							
						</Scrollbars> 
					</div> 
				</div>
				<div className="foot-botton">
					<div className="foot-main">
					<button className={classnames({
													"disabled": fastFoodOrderStore.OrderList.length === 0
												})} 
							onClick={fastFoodOrderStore.OrderList.length >0 && this.orderdetail}>订单详情</button>
					<button className={classnames({
													"disabled": fastFoodOrderStore.OrderList.length === 0
												})}  
							onClick={fastFoodOrderStore.OrderList.length >0 && this.clickretreat}>退菜</button>
					<button className={classnames({
													"disabled": fastFoodOrderStore.OrderList.length === 0
												})} 
							onClick={fastFoodOrderStore.OrderList.length >0 && this.kaiFapiao}>开发票</button>
					</div>
				</div>
				{this.state.orderdetail} 
				{fastFoodOrderStore.retreatfood && this.state.retreatfood}
				{this.state.InvoicePopup}
				{false && feedback}
			</div>
			
		)
	}

}

 

export default FastFoodOrder;
