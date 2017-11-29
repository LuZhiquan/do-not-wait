import React from 'react';
import { observer, inject } from 'mobx-react';  

import { Modal} from 'antd';
import './draw_money.less';

@inject('memberStore') @observer
class DrawMoney extends React.Component {

	constructor(props){
		super(props);
		this.state={
			rechargeAmount:this.props.memberStore.rechargeItem.rechargeValue,
			ticketNo:'',
			ticketUnit:'',
			ticketAmount:this.props.memberStore.rechargeItem.rechargeValue,
			ticketMemo:'',
			errorNo:'',
			errorAmount:''
		}
	}
  
	handleCancel=()=>{
		this.state={
			rechargeAmount:'',
			ticketNo:'',
			ticketUnit:'',
			ticketAmount:'',
			ticketMemo:'',
			errorNo:'',
			errorAmount:''
		}
		this.props.memberStore.drawMoneyCancel();
	}
 
	handleOk=()=>{

		if(this.state.ticketNo){
			this.setState({errorNo:""});
		}else{
			this.setState({errorNo:'发票编号不能为空'});
		}

		if(this.state.ticketAmount*1>0){
			this.setState({errorAmount:""});
		}else{
			this.setState({errorAmount:"发票金额要大于0"});
		}

		if(this.state.ticketNo&&this.state.ticketAmount*1>0){
			let submit = {
				cardID:this.props.memberStore.rechargeItem.cardID,
				depositID:this.props.memberStore.rechargeItem.depositID,
				customerID:this.props.memberStore.rechargeItem.customerID,
				rechargeAmount:this.state.rechargeAmount,
				ticketNo:this.state.ticketNo,
				ticketUnit:this.state.ticketUnit,
				ticketAmount:this.state.ticketAmount,
				ticketMemo:this.state.ticketMemo
			}
			this.props.memberStore.memberOpenTicket(submit,this.props.current);
		}

	}

  render() {
    return (
      <div> 
        <Modal 
			title="开发票" 
			visible={true} 
			maskClosable={false}   
			onCancel={this.handleCancel}  
			closable={false} 
			onOk={this.handleOk}
			width={840} 
			wrapClassName="draw-money-popup-modal"
        >
        <div id="draw-money">
			<div className="draw-main">
				<div className='drap-p'>
					<span>充值金额</span>
					<em>{this.state.rechargeAmount}</em>
				</div>
				<div className='drap-p'>
					<span>发票编号 <i>*</i></span>
					<input 
						type="text" 
						value={this.state.ticketNo} 
						onChange={(e)=>{
							if(e.target.value.length<=100){
								this.setState({ticketNo:e.target.value});
							}
							
							if(e.target.value){
								this.setState({errorNo:''});					
							}
						}}
					/>
					<div className="error">{this.state.errorNo}</div>
				</div>
				<div className='drap-p'>
					<span>开票单位</span>
					<input 
						type="text" 
						value={this.state.ticketUnit} 
						onChange={(e)=>{
							if(e.target.value.length<=100){
								this.setState({ticketUnit:e.target.value});
							}
							
						}}
					/>
				</div>
				<div className='drap-p'>
					<span>发票金额 <i>*</i></span>
					<input 
						type="text" 
						value={this.state.ticketAmount} 
						onChange={(e)=>{
							let value = e.target.value
							this.setState({errorAmount:''});
							if(/^\d*\.{0,1}\d{0,2}$/.test(value)&&value<10000000){
								
								this.setState({ticketAmount:value});																	
								
							}
						}} 
					/>
					<div className="error">{this.state.errorAmount}</div>
				</div>
				<div className='drap-p'>
					<span>开票备注</span>
					<textarea  
						value={this.state.ticketMemo} 
						onChange={(e)=>{
							if(e.target.value.length<=100){
								this.setState({ticketMemo:e.target.value});
							}
							
						}}
					/>
				</div>
			</div>
		</div>
        </Modal>
      </div>
    );
  }
}

export default DrawMoney;