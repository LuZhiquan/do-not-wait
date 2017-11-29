/**
* @author shelly
* @description 会员支付密码弹窗
* @date 2017-08-14
**/

import React from 'react';
import { Modal, message } from 'antd';
import { inject, observer } from 'mobx-react';


import './password_popup.css';

@inject('settlementStore') @observer
class CashPopup extends React.Component {
  constructor(props){
    super(props);
    this.state={
      price:'',
      isConfirm: false,
    };
  };
// 点击数字键盘
 handleClick=(e)=> {
    let value=e.target.innerHTML;
    let inputVal=this.state.price;
    inputVal = inputVal.concat(value);
    this.setState({price:inputVal});
  }

// 点击退格
  handleBack=(e)=>{
      let inputVal=this.state.price;
      inputVal=inputVal.substring(0,inputVal.length-1);
      this.setState({price:inputVal});
  }

  render() {
    let forge = require('node-forge');
    let md = forge.md.md5.create();
    return (
      <div id="password-popup">
        <Modal title="会员卡密码"
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='放弃'
            width={510}
            height={546} 
            footer={null}
            wrapClassName="password-popup-modal"
            onCancel={()=>{
            if(this.props.onCancel){
                  this.props.onCancel();
                }
            }}
        >
          <input type="password" value={this.state.price} className="price-input" placeholder="请输入会员卡密码"  onChange={(e)=>{
              this.setState({price:e.target.price});
          }}  readOnly />
          <div id="num-key">
            <ul>
              <li className="number" onClick={this.handleClick}>1</li>
              <li className="number" onClick={this.handleClick}>2</li>
              <li className="number" onClick={this.handleClick}>3</li>
              <li className="back iconfont icon-order_btn_back" onClick={this.handleBack}></li>
              <li className="number" onClick={this.handleClick}>4</li>
              <li className="number" onClick={this.handleClick}>5</li>
              <li className="number" onClick={this.handleClick}>6</li>
              <li className="clear-all" onClick={()=>{
                   if(this.props.onCancel){
                        this.props.onCancel();
                      }
              }}>取消</li>
              <li className="number" onClick={this.handleClick}>7</li>
              <li className="number" onClick={this.handleClick}>8</li>
              <li className="number" onClick={this.handleClick}>9</li>
              <li className="cancle"></li>
              <li className="number" onClick={this.handleClick}>0</li>
              <li className="number" onClick={this.handleClick}>00</li>
              <li className="number" onClick={this.handleClick}>.</li>
              <li className="confirm" onClick={()=>{
                if(!this.state.isConfirm && this.props.onOk){

                  //防止多次点击
                  this.setState({
                    isConfirm: true
                  });

                  if(parseFloat(this.state.price)===0 || this.state.price===""){
                    message.destroy();
                    message.info("密码不能为空",2);
                  }else{
                    md.update(this.state.price)
                    let password=md.digest().toHex();
                    this.props.onOk(password.toUpperCase());
                  }
                  
                  //防止多次点击
                  setTimeout(() => {
                    this.setState({
                      isConfirm: false
                    })
                  }, 1000);
                  
                }
              }}
              >确定</li>
            </ul>
          </div>
        </Modal>
      </div>
    )
  }
}

export default CashPopup;