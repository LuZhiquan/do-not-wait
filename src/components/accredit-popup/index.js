/**
* @author shelly
* @description 授权弹窗界面
* @date 2017-05-12
**/
import React from 'react';
import { Alert, Modal, message } from 'antd';

import { getJSON } from '../../common/utils';

import './accredit_popup.less'; 

class Accredit extends React.Component {
  constructor(props){
    super(props);
    this.state={
      loginName:'',
      password:'',
      warningVisible:true, 
      position:'loginName'
    };

  };

  // 点击确定按钮
  handleOk=()=>{ 
    if(this.state.loginName===''|| this.state.password===''){
      message.destroy();
      message.info("账号或密码不能为空");
    }else{
      // this.setState({visible:true})
      
      //二次验权
      let { moduleCode, privilegeCode} = this.props.module;
      if(moduleCode&&privilegeCode){

      let myData={
        loginName:this.state.loginName,
        password:this.state.password,
        moduleCode:moduleCode,
        privilegeCode:privilegeCode
      }
        let _this = this;
       getJSON({
        url: '/reception/permission/checkPermission',
        data:myData,
        success: function(json){
           
            if(json.code===0){
                //成功
                if(_this.props.onOk){
                    _this.props.onOk();
                }
            }else{
              if(json.code===1103){
                _this.setState({warningVisible:true})
              }else{
                message.destroy();
                message.info(json.message);
              }
              
              // _this.setState({warningVisible:true});
            }
        }
        });    
      }        
    }
  }

// 点击数字键盘
 handleClick=(e)=> {
    let value=e.target.innerHTML;
    if(this.state.position==='loginName'){
         let loginName=this.state.loginName.concat(value);
         this.setState({loginName:loginName});
    }else{
         let password=this.state.password.concat(value);
         this.setState({password:password});
    }
  }

// 点击退格
  handleBack=(e)=>{
    if(this.state.position==='loginName'){
      let loginName=this.state.loginName;
      loginName=loginName.substring(0,loginName.length-1);
      this.setState({loginName:loginName})
    }else{
      let password=this.state.password;
      password=password.substring(0,password.length-1);
      this.setState({password:password})
    }
  }

  // 点击清空
  handleClear=(e)=>{
    if(this.state.position==='loginName'){
      this.setState({loginName:''})
    }else if(this.state.position==='password'){
      this.setState({password:''})
    }
  }

  //点击关闭的按钮
  handleCancel=(e)=>{
    if(this.props.onCancel){
				this.props.onCancel();
		}
  }

  render() {
    let { title } = this.props.module;
   
    return (
      <div id="accredit">
        <Modal id="accredit-modal" title="授权" 
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='放弃'
            width={510}
            height={546} 
            footer={null}
            wrapClassName="accredit-popup-modal"
            onCancel={this.handleCancel}
           
        >
          <div id="login">
              {this.state.warningVisible&&<Alert message={'你没有【'+title+'】权限，请联系有权人授权！'} type="warning" showIcon className="warning" closable onClose={()=>{
                    this.setState({warningVisible:false});
              }}/>}
              <input type="text" value={this.state.loginName} placeholder="账号" id="account-num" onChange={(e)=>{
                  this.setState({loginName:e.target.value});
              }} onClick={()=>{
                  // this.setState({visible:false});
                  this.setState({position:"loginName"});
              }}/>
              <input type="password" value={this.state.password} placeholder="密码" id="password" onChange={(e)=>{
                  this.setState({password:e.target.value});
              }} onClick={()=>{
                  // this.setState({visible:false});
                  this.setState({position:"password"});
              }}/>
          </div>
          <div id="num-key">
             <div id="num-key">
            <ul>
              <li className="number" onClick={this.handleClick}>1</li>
              <li className="number" onClick={this.handleClick}>2</li>
              <li className="number" onClick={this.handleClick}>3</li>
              <li className="back iconfont icon-order_btn_back" onClick={this.handleBack}></li>
              <li className="number" onClick={this.handleClick}>4</li>
              <li className="number" onClick={this.handleClick}>5</li>
              <li className="number" onClick={this.handleClick}>6</li>
              <li className="clear-all" onClick={this.handleClear}>清空</li>
              <li className="number" onClick={this.handleClick}>7</li>
              <li className="number" onClick={this.handleClick}>8</li>
              <li className="number" onClick={this.handleClick}>9</li>
              <li className="zero" onClick={this.handleClick}>0</li>
              <li className="cancel" onClick={this.handleCancel}>取消</li>
              <li className="confirm" onClick={this.handleOk}>确定</li>
            </ul>
          </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Accredit;