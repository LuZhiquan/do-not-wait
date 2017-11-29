/**
* @author Shelly
* @description 调整原因备注-即移除桌台负责人
* @date 2017-05-26
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, message } from 'antd';
import classnames from 'classnames';

import './adjust_reason_popup.less';
message.config({
	top: 300,
	duration: 1
});
@inject('responsibleStore') @observer
class AdjustReason extends React.Component {

  constructor(props){
    super(props);
    this.state={
      inputReason:'',//手动输入的原因
    }
  }

  handleOk=()=>{
   
      //要输出的信息
      let responsibleStore = this.props.responsibleStore;
      let addDate={};
      if(responsibleStore.removeTableInfo){
         if(responsibleStore.removeTableInfo.removeReasonID || this.state.inputReason!==''){
          addDate={
            tableID:this.props.tableID,//桌台ID
            tableName:this.props.tableName,//桌台名称
            tableCode:this.props.tableCode,//桌台编码
            dutyVOList:[
              {loginID:this.props.loginID,//员工ID
              areaID:responsibleStore.firstCategoryID,//区域ID
              mealsID:responsibleStore.secondCategoryID ,//餐次ID
              areaName:this.props.areaName,//区域名称
              mealName:this.props.mealName,//餐次名称
              serviceAnswerTypeList:this.props.serviceAnswerTypeList,//服务内容ID
              changeReason:responsibleStore.removeTableInfo.removeReasonID,//调整原因ID
              dealDesc:this.state.inputReason},//输入的原因
            ],
        }
          responsibleStore.getRemoveTableManagerInfo(addDate);
          this.props.onOk();
        }else{
          message.warning("请选择或输入原因");
        }
      }
  }
  handleCancel=()=>{
    this.props.onCancel();
  }
  render() {
    let responsibleStore=this.props.responsibleStore;
    let userReason;//调整原因
    userReason=responsibleStore.reasonLis.map((reason,rindex)=>{
      return <li key={rindex} className={
        classnames({
          "responsible-btn":true,
          "selected-btn":responsibleStore.currentReasonID===reason.reasonID?true:false,
        })
      } onClick={()=>{
        this.setState({inputReason:''});
        if(responsibleStore.currentReasonID!==reason.reasonID){
          responsibleStore.currentReasonID=reason.reasonID;
        }else{
          responsibleStore.currentReasonID='';
        }
        if(responsibleStore.removeTableInfo){
          responsibleStore.removeTableInfo.removeReasonID=responsibleStore.currentReasonID;//选择原因ID
        }

      }}>{reason.reason}
    </li>})
  
   
    return (
        <Modal title="调整原因备注" 
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='取消'
            width={1100}
            wrapClassName="adjust-reason-popup-modal"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
         	<div className="responsible-container">
            <div className="adjust-service">
              <div className="responsible-person-box">
                <div className="adjust-reason">
                  <textarea placeholder="请输入桌台负责人调整原因" onChange={(e)=>{
                    responsibleStore.currentReasonID='';
                    if(responsibleStore.removeTableInfo){
                      responsibleStore.removeTableInfo.removeReasonID='';
                    }
                    
                    let val;
                    val = e.target.value; 
                    if (val.length > 100) {  
                      val=(val.substring(0, 100));  
                    }  
                    this.setState({inputReason:val});
                    
                  }} value={this.state.inputReason}></textarea>
                  <ul>
                    {userReason}
                  </ul>
                 
                </div>
            </div> 
					</div>  
         
				</div>
      </Modal>
    )
  }
}

export default AdjustReason;