import React, { Component } from 'react';
import { Modal } from 'antd';
import './prompt_number.css';

class PromptNumber extends Component {

  state = { result:'' }

  oneClick = (e) => {

      var temp = this.state.result;
  	  var value = e.target.value;
      if(value>=0&&value<=9){
        temp = temp.concat(value);
          
      }else if(value==='.'){
         if(!temp.includes(".")){
                temp = temp.concat(value);
           }
      }else{
        temp = temp.substring(0,temp.length-1);
      }

  	this.setState({result:temp});
  }
  handleOk = (e) => {
    if(this.props.okClick) this.props.okClick(this.state.result);
  }
  handleCancel = (e) => {
    if(this.props.cancelClick) this.props.cancelClick(e);
  }

  render() {
    return (
        <Modal title="输入金额" visible={true} maskClosable={false} wrapClassName="vertical-center-modal"
          onOk={this.handleOk} onCancel={this.handleCancel} okText='确定' cancelText='取消'
          width={700}
        >
        <div className="number_main">
        	<h5>
        	 <input type="text" value={this.state.result}  disabled="disabled"/>
        	  <span> 单位：元</span>
        	</h5>
        	<div className="number_button">
        		<input type="button" value="1"   onClick={this.oneClick}/>
        		<input type="button" value="2"   onClick={this.oneClick}/>
        		<input type="button" value="3"   onClick={this.oneClick}/>
        	</div>
        	<div className="number_button">
        		<input type="button" value="4"   onClick={this.oneClick}/>
        		<input type="button" value="5"   onClick={this.oneClick}/>
        		<input type="button" value="6"   onClick={this.oneClick}/>
        	</div>
        	<div className="number_button">
        		<input type="button" value="7"   onClick={this.oneClick}/>
        		<input type="button" value="8"   onClick={this.oneClick}/>
        		<input type="button" value="9"   onClick={this.oneClick}/>
        	</div>
        	<div className="number_button">
          	<input type="button" value="0"   onClick={this.oneClick} />
        		<input type="button" value="."   onClick={this.oneClick} />
        		<input type="button" value="←"  onClick={this.oneClick}/>
        	</div>
        </div>
        </Modal>
    );
  }
}

export default PromptNumber;
