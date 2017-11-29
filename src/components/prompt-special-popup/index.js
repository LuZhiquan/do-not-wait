/* 提示弹窗 */
import React from 'react';
import {Modal} from 'antd';
import { inject, observer } from 'mobx-react';

import './prompt_special_popup.less';

@inject('settlementStore') @observer
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
      footer={null}
      width={this.props.width || 510}
      wrapClassName="prompt-special-popup-modal"
      onCancel={(e)=>{ 
        this.props.onCancel && this.props.onCancel();
      }}
      
    >
    <div className="prompt" > 
          <div className="delele-text"> 
              {this.props.showconten}
          </div> 

           <div className="bottom-btn">
              <button className="btn" onClick={()=>{ 
                 this.props.cancelOpen && this.props.cancelOpen();
              }}>{cancelText}</button>
              <button className="btn selected" onClick={()=>{
              this.props.onOk && this.props.onOk(); 
            }}>{okText}</button> 
          </div>
      </div>
      
    </Modal>
  }
}

export default PromptPopup;