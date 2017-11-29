/**
* @author shelly
* @description 会员卡查询
* @date 2017-06-18
**/

import React from 'react';
import {Modal, message } from 'antd';
import { inject, observer } from 'mobx-react';

import './member_payment_popup.less';
message.config({
	top: 300,
	duration: 1
});

@inject('settlementStore') @observer
class MemberPaymentPopup extends React.Component {
  constructor(props){
    super(props);
    this.state={price:'', visible:false};
  };

// 点击确定按钮
  handleOk=()=>{
    if(this.state.price==='' || this.state.price===0){
      message.info("请输入正确的折扣")
    }else{
      this.props.onOk(this.state.price);
    }
  }

// 点击数字键盘
 handleClick=(e)=> {
    let value=e.target.innerHTML;
    let inputVal=this.state.price;
    if(value>=0&&value<=9){
      inputVal = inputVal.concat(value);
    }else if(value==='.'){
        if(!inputVal.includes(".")){
              inputVal = inputVal.concat(value);
          }
    }
    this.setState({price:inputVal});
   
  }

// 点击退格
  handleBack=(e)=>{
      let inputVal=this.state.price;
      inputVal=inputVal.substring(0,inputVal.length-1);
      this.setState({price:inputVal});
  }

  render() {
    return (
        <Modal id="accredit-modal" title="会员卡"
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='放弃'
            width={960}
            height={600} 
            wrapClassName="member-payment-popup"
            onCancel={()=>{
              if(this.props.onCancel){
                this.props.onCancel();
              }
            }}
        >
        <div className="left">
          <label className="info-name">会员编号</label>
          <input className="info-detail" value="500"/>
          <label className="info-name">会员名称</label>
          <input className="info-detail"/>
          <label className="info-name">卡号</label>
          <input className="info-detail"/>
          <label className="info-name">卡类别</label>
          <input className="info-detail"/>
          <label className="info-name">有效期至</label>
          <input className="info-detail"/>
          <div className="unchange">
            <label className="info-name">卡余额</label>
            <input className="info-detail"/>
            <label className="info-name">可用积分</label>
            <input className="info-detail"/>
          </div>
         
        </div>
        <div className="right">
          <input type="text" value={this.state.price} className="price-input" placeholder="0"  onChange={(e)=>{
              this.setState({price:e.target.price});
          }} />
          
           
          <div id="num-key">
            <ul>
              <li className="number" onClick={this.handleClick}>1</li>
              <li className="number" onClick={this.handleClick}>2</li>
              <li className="number" onClick={this.handleClick}>3</li>
              <li className="number" onClick={this.handleClick}>4</li>
              <li className="number" onClick={this.handleClick}>5</li>
              <li className="number" onClick={this.handleClick}>6</li>
              <li className="number" onClick={this.handleClick}>7</li>
              <li className="number" onClick={this.handleClick}>8</li>
              <li className="number" onClick={this.handleClick}>9</li>
              <li className="number" onClick={this.handleClick}>.</li>
              <li className="number" onClick={this.handleClick}>0</li>
              <li className="back iconfont icon-order_btn_back" onClick={this.handleBack}></li>
            </ul>
          </div>
        </div>
         
        
         
        </Modal>
    )
  }
}

export default MemberPaymentPopup;