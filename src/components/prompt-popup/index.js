/* 提示弹窗 */
import React from 'react';
import {Modal} from 'antd';

import './prompt_popup.less';

class PromptPopup extends React.Component {

  render() {
    let cancelText;
    let okText;
    let titletext;
    if(this.props.cancelText){
      cancelText=this.props.cancelText; 
    }else{
       cancelText="取消";
    }

    if(this.props.okText){
      okText=this.props.okText; 
    }else{
      okText="确定";
    }


    if(this.props.thistitle){
      titletext=this.props.thistitle; 
    }else{
       titletext="提示";
    }


    return <Modal 
      title={titletext}
      visible={true} 
      maskClosable={false} 
      okText={okText}　 
      cancelText={cancelText}
      width={this.props.width || 510}
      wrapClassName="prompt-popup-modal"
      onCancel={(e)=>{ 
        this.props.onCancel && this.props.onCancel();
      }}
      onOk={()=>{
        this.props.onOk && this.props.onOk(); 
      }}
    >
      {this.props.children}
    </Modal>
  }
}

export default PromptPopup;