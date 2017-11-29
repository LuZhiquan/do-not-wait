/**
* @author shelly
* @description 反结账弹窗
* @date 2017-05-18
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd'; 

// import AccreditPopup from 'components/accredit-popup';//授权弹窗

import './anti-settlement-popup.less';

//点选普通单品弹窗
@inject('orderStore') @observer
class AntiSettlementPopup extends React.Component {
    constructor(props){
        super(props);
        this.state={textarea: "",accreditPopup:""};
   };

   //关闭按钮 
   handleCanle=()=>{
       if(this.props.closebutton){
           this.props.closebutton();
       }

   }
   //确定按钮
   handleOK=()=>{
       if(this.props.okbutton){
           this.props.okbutton();
       }

   }


     
     
  render() {
    //   let orderStore=this.props.orderStore;
    return <Modal title="返结账" 
                visible={true} 
                maskClosable={false}
                onOk={this.handleOK} 
                okText='确定' cancelText='放弃'
                width={840} wrapClassName="anti-settlement-popup-modal"
                onCancel={this.handleCanle}
            >
                <div className="anti-settlement-block">
                    <div className="anti-settlement-cause">
                        <div className="cause-header">反结账原因</div>
                        <div id="anti-settlement-message"></div>
                        <ul className="reason">
                            <li className="btn-240-44 btn-active">非常不好</li>
                           
                        </ul>
                    </div>
                    <textarea type="text" placeholder="可输入自定义赠菜原因" className="anti-settlement-remarks" value={this.state.textarea} onChange={(e)=>{
                        this.setState({textarea:e.target.value});
                    }}>
                    </textarea>
                    {this.state.accreditpopup}
                </div>
        </Modal>
  }
}
export default AntiSettlementPopup;