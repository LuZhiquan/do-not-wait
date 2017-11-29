import React from 'react';
import {Modal} from 'antd';  
import './alter_booking.less';

class AlterBooking extends React.Component {


 constructor(props){
     super(props);
     this.state={number:'',remarks:'',errorText:''}
 }


 handleCancel=()=>{
    if(this.props.cancelClick){
        this.props.cancelClick();
    }
 }
 handleOk=()=>{
    if(this.state.number*1>0){
        this.setState({errorText:''});
        if(this.props.okClick){
            this.props.okClick(this.state.number,this.state.remarks);
        }
    }else{
        this.setState({errorText:'输入人数要大于0'});
    }
    
 }

  render() {
     
    return (
        <div>
			<Modal  
				visible={true} 
                title="修改预订"
				maskClosable={false} 
				width={670}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
				okText='确定' cancelText='取消'
				wrapClassName="alter-booking-popup-modal"    
				>      
				<div className="alter-booking-container">
                    <div className="peopleNum"><span>人数：</span><input type="text" value={this.state.number} onChange={(e)=>{
                        let value = e.target.value*1+'';
                        this.setState({errorText:''});
                        if(/^\d*$/.test(value)&&value<=999){
                             this.setState({number:value});
                        }
                       
                    }}/>
                    <span className="error">{this.state.errorText}</span>
                    </div>
                    <div className="remarks"><span>备注：</span> <textarea value={this.state.remarks} onChange={(e)=>{
                        if(e.target.value.length<=200){
                            this.setState({remarks:e.target.value});
                        }                       
                    }}></textarea></div>
				</div>
			</Modal>
      </div>
    );
  }
}


export default AlterBooking;