import React from 'react';
import { observer, inject } from 'mobx-react';  
import { Modal } from 'antd';
import './reset_password_popup.less'; 


@inject('memberStore') @observer
class ResetPassword extends React.Component {
    constructor(props){
        super(props);
        this.props.memberStore.resetInitial();
    }

	handleCancel=()=>{
	 	if(this.props.cancelClick){
            this.props.cancelClick();
        }	
        this.props.memberStore.resetHandleCancel();	
	} 

	handleOk=()=>{
		if(this.props.okClick){
            this.props.okClick();
        }
        this.props.memberStore.resetHandleOk();	
       
	}  
  
  render() {
      let memberStore = this.props.memberStore;

    return (
      <div> 
        <Modal 
            title="重置密码" 
            visible={true} 
            maskClosable={false}   
            onCancel={this.handleCancel} 
            closable={false}
            onOk={this.handleOk}  
            width={500} 
            wrapClassName="reset-password-popup-modal"
        >
            <div className="reset-password-container">
                <div>
                    <span className="re-title">新密码</span>
                    <input 
                        type="password" 
                        value={memberStore.resetPassword.newPassword} 
                        onChange={(e)=>{
                             if(e.target.value.length<=6&&(/^\w*$/.test(e.target.value))){
                                 memberStore.resetrNewPassword(e.target.value);
                             }
                           
                        }}
                    />
                </div>
                <div>
                    <span className="re-title">新密码确认</span>
                    <input 
                        type="password" 
                        value={memberStore.resetPassword.confirmPassword} 
                        onChange={(e)=>{
                            if(e.target.value.length<=6&&(/^\w*$/.test(e.target.value))){
                                memberStore.resetConfirmPassword(e.target.value);
                            }
                            
                        }}
                    />
                    <span className="error">{memberStore.resetErrorText}</span>
                </div> 
            </div>
        </Modal>
      </div>
    );
  }
}

export default ResetPassword;