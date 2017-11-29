/* 会员折弹窗 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs, Modal,message } from 'antd';

import './member_discount_popup.less';

const TabPane = Tabs.TabPane;

@inject('settlementStore','cashierStore') @observer
class MenberDiscount extends React.Component {
  constructor(props){
    super(props);
    this.state={phone:'',cardNum:'',card:'',memberPayment:''}
  }

  componentDidMount() {
      this.nameInput.focus();
  }
  
  callback=(key)=> {
    // console.log(key);
    if(key==='1'){
      this.setState({position:'phone'});
    }
    if(key==='2'){
       this.setState({position:'cardNum'});
      
    }
    if(key==='3'){
       this.setState({position:'card'});
    }
  }
  // 点击数字键盘
  handleClick=(e)=>{
    let value=e.target.innerHTML;
    if(this.state.position==='phone'){
      let newValue=this.state.phone.concat(value);
      this.setState({phone:newValue});
    }
    if(this.state.position==='cardNum'){
      let newValue=this.state.cardNum.concat(value);
      this.setState({cardNum:newValue});
    }
    if(this.state.position==='card'){
      let newValue=this.state.card.concat(value);
      this.setState({card:newValue});
    }
  }

  // 点击退格
  handleBack=(e)=>{
    if(this.state.position==='phone'){
      let newValue=this.state.phone;
      newValue=newValue.substring(0,newValue.length-1);
      this.setState({phone:newValue})
    }
    if(this.state.position==='cardNum'){
      let newValue=this.state.cardNum;
      newValue=newValue.substring(0,newValue.length-1);
      this.setState({cardNum:newValue})
    }
    if(this.state.position==='card'){
      let newValue=this.state.card;
      newValue=newValue.substring(0,newValue.length-1);
      this.setState({card:newValue})
    }
  }

  handleCancel=()=>{
      if(this.props.onCancel){
        this.props.onCancel();
      }
      this.props.handleClose && this.props.handleClose();
  }

  render() {
      // 验证手机号
      let isPhoneNo=function(phone) { 
            var pattern = /^1[34578]\d{9}$/; 
            return pattern.test(phone); 
      }
  
        // 数字键盘
      let keyNumber=<ul className="key-num-wrap">
            <li onClick={this.handleClick}>1</li>
            <li onClick={this.handleClick}>2</li>
            <li onClick={this.handleClick}>3</li>
            <li onClick={this.handleClick}>4</li>
            <li onClick={this.handleClick}>5</li>
            <li onClick={this.handleClick}>6</li>
            <li onClick={this.handleClick}>7</li>
            <li onClick={this.handleClick}>8</li>
            <li onClick={this.handleClick}>9</li>
            <li className="zero" onClick={this.handleClick}>0</li>
            <li className="back iconfont icon-order_btn_back" onClick={this.handleBack}></li>
          </ul>


    return (
      <div id="category-discount">
        <Modal title={this.props.title} 
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='取消'
            footer={null}
            width={500}
            wrapClassName="member-discount-modal"
            onCancel={this.handleCancel}
        >
         <ul className="category">
              <Tabs defaultActiveKey="1" onChange={this.callback}>
                <TabPane tab="手机号" key="1">
                  <div className="change-tab">
                    <i className="iconfont icon"></i>
                  </div>
                  <div className="member-input">
                    <i className="iconfont icon-shoujihaomaicon"></i>
                    <input type="text" className="input-value" placeholder="请输入手机号" value={this.state.phone} readOnly onFocus={()=>{
                        this.setState({position:'phone'})}}
                      ref={(input) => { this.nameInput = input; }}  />
                  </div>
                 
                  {keyNumber}
                  <div className="btn">
                    <button className="cancle" onClick={this.handleCancel}>取消</button>
                    <button className="confirm selecte" onClick={()=>{
                      if(this.props.onOk){
                         if(isPhoneNo(this.state.phone)===false){
                            message.destroy();
                            message.info("请输入正确的手机号码")
                          }else{
                              if(this.props.isDiscount){//如果是true就是会员折，否则是会员支付或者是会员充值
                                 this.props.onOk(this.state.phone,1);//会员折的
                              }else{
                                  this.props.onOk(this.state.phone,'','',1);//正式的 
                              // this.props.onOk(this.state.phone,1);//临时的
                              }
                          }
                      }
                    }}>确定</button>
                  </div>
                </TabPane>
                <TabPane tab="卡号" key="2">
                  <div className="change-tab"></div>
                  <div className="member-input">
                    <i className="iconfont icon-cikh"></i>
                    <input type="text" className="input-value" placeholder="请输入卡号" value={this.state.cardNum} onFocus={()=>{
                      this.setState({position:'cardNum'});
                    }}  readOnly />
                  </div>
                  {keyNumber}
                  <div className="btn">
                    <button className="cancle" onClick={this.handleCancel}>取消</button>
                    <button className="confirm selecte" onClick={()=>{
                      if(this.props.onOk){
                          if(this.state.cardNum===''){
                            message.destroy();
                            message.info("卡号不能为空")
                          }else{
                             if(this.props.isDiscount){
                                  this.props.onOk(this.state.cardNum,2);//会员折的(调的接口和传的参数不一样)
                              }else{
                                  this.props.onOk('',this.state.cardNum,'',2);//正式的 
                               // this.props.onOk(this.state.cardNum,2);//临时的
                              }
                            this.props.handleClose && this.props.handleClose();
                          }
                      }
                    }}>确定</button>
                  </div>
                </TabPane>
                <TabPane tab="刷卡" key="3">
                  <div className="change-tab"></div>
                  <div className="member-input">
                    <i className="iconfont icon-cikh"></i>
                    <input type="text" className="input-value" placeholder="请刷卡" value={this.state.card} onFocus={()=>{
                      this.setState({position:'card'})}}  onChange={(e)=>{ this.setState({card:e.target.value})}}/>
                  </div>
                  <div className="btn">
                    <button className="cancle" onClick={this.handleCancel}>取消</button>
                    <button className="confirm selecte" onClick={()=>{
                      if(this.props.onOk){
                          if(this.state.card===''){
                            message.destroy();
                            message.info("卡号不能为空")
                          }else{
                             if(this.props.isDiscount){
                                  this.props.onOk(this.state.card,3);//会员折的(调的接口和传的参数不一样)
                              }else{
                                  this.props.onOk('','',this.state.card,3);//正式的 
                               // this.props.onOk(this.state.cardNum,2);//临时的
                              }
                            this.props.handleClose && this.props.handleClose();
                          }
                      }
                    }}>确定</button>
                  </div>
                </TabPane>
                
              </Tabs>
          </ul>
        </Modal>
      </div>
    )
  }
}

export default MenberDiscount;