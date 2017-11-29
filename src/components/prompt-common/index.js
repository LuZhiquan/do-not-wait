import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import './prompt_content.css';


/**
 * 需要传message
 * @param {
 * title:头部标题
 * isOneFooter: ture 知道了      false 取消  确定
 *{title:"提示",isOneFooter:false,conText:"确定清台",okClick:function(){console.log(111)},cancelClick:function(){console.log(222)}}
 * conText:中间提示框信息
 * okText:确定按钮文字
 * cancelText:取消按钮文字
 * }
 * messsage:{title:"确定提示",isOneFooter:true,conText:"清台操作成功"}
 * messsage:{title:"提示",isOneFooter:false,conText:"确定清台",okText:"确定",cancelText:"取消"}
 * messsage:{title:"提示",isOneFooter:true,conText:"A03,A04,A05"}
 *
 *
 */
class PromptCommon extends Component {

  handleCancel = (e) => {
    if(this.props.message.cancelClick){
        this.props.message.cancelClick();
    }

  }

  handleOk = ()=>{
    if(this.props.message.okClick){
        this.props.message.okClick();
    }

  }

  componentDidMount() {
    this.refs.conText.innerHTML=this.props.message.conText;
  }
  render() {
        let isFooter,footerBlock;

        if(this.props.message.isOneFooter){
            isFooter = null;
            footerBlock = <div className="Prompt_button" onClick={this.handleOk}>知道了</div>
        }else{
            isFooter = [
            <Button key="cancel" onClick={this.handleCancel}>{this.props.message.cancelText||'取消'}</Button>,
            <Button key="ok" onClick={this.handleOk}>
             {this.props.message.okText||'确定'}
            </Button>,
          ]
        }

        let whatwidth;
        if(this.props.thiswidth){
          whatwidth=this.props.thiswidth; 
        }else{
          whatwidth=600;
        }
    return <Modal title={this.props.message.title} visible={true} maskClosable={false}
          onCancel={this.handleCancel}  footer={isFooter} wrapClassName="vertical-center-modal"
          width={whatwidth}>
      <div className="Prompt_content" ref='conText'>

      </div>
      {footerBlock}
    </Modal>
  }
}

export default PromptCommon;
