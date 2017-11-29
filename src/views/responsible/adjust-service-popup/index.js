/**
* @author Shelly
* @description 调整服务内容
* @date 2017-05-26
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, message } from 'antd';
import classnames from 'classnames';
import Scrollbars from 'react-custom-scrollbars';

import './adjust_service_popup.less';
message.config({
	top: 300,
	duration: 1
});
@inject('responsibleStore') @observer
class AdjustService extends React.Component {
  constructor(props){
    super(props);
    this.state={
      inputReason:'',//手动输入的原因
    }
  }
  //应用当前桌
  handleCurrentTableOk=()=>{
      let responsibleStore=this.props.responsibleStore;
      let adjustDate=[];
      if(responsibleStore.responsibleRightInfo.serviceID&&responsibleStore.responsibleRightInfo.reasonID){
        if(responsibleStore.responsibleRightInfo.reasonID[0]||this.state.inputReason!==''){
          adjustDate={
            tableID:this.props.tableID,//桌台ID
            tableName:this.props.tableName,//桌台名称
            tableCode:this.props.tableCode,//桌台编码
            dutyVOList:[
              {loginID:this.props.loginID,//员工登陆ID
              areaID:responsibleStore.firstCategoryID,//区域ID
              mealsID:responsibleStore.secondCategoryID ,//餐次ID
              serviceAnswerTypeList:responsibleStore.responsibleRightInfo.serviceID,//服务内容ID
              changeReason:responsibleStore.responsibleRightInfo.reasonID[0],//调整原因ID
              dealDesc:this.state.inputReason},//输入的原因
            ],
        }
        responsibleStore.getAdjustServiceContent(adjustDate,1);
        this.props.onOk();
         responsibleStore.responsibleRightInfo.reasonID[0]='';
      }else{
         message.warning("请选择或输入原因");
      }
         
    }else{
       message.warning("请选择要调整的服务和原因");
    }
     
  };

//应用所有桌
  handleAllTableOk=()=>{
    let responsibleStore=this.props.responsibleStore;
    let adjustDate={};
     if(responsibleStore.responsibleRightInfo.serviceID&&responsibleStore.responsibleRightInfo.reasonID){
        if(responsibleStore.responsibleRightInfo.reasonID[0]||this.state.inputReason!==''){
          adjustDate={
            tableID:this.props.tableID,//桌台ID
            tableName:this.props.tableName,//桌台名称
            tableCode:this.props.tableCode,//桌台编码
            dutyVOList:[
              {loginID:this.props.loginID,//员工登陆ID
              areaID:responsibleStore.firstCategoryID,//区域ID
              mealsID:responsibleStore.secondCategoryID ,//餐次ID
              serviceAnswerTypeList:responsibleStore.responsibleRightInfo.serviceID,//服务内容ID
              changeReason:responsibleStore.responsibleRightInfo.reasonID[0],//调整原因ID
              dealDesc:this.state.inputReason},//输入的原因
            ],
        }
        responsibleStore.getAdjustServiceContent(adjustDate,2);
        this.props.onOk();
        responsibleStore.responsibleRightInfo.reasonID[0]='';
      }else{
         message.warning("请选择或输入原因");
      }
         
    }else{
      message.warning("请选择要调整的服务和原因");
    }
     
  }

  handleCancel=()=>{
     this.props.onCancel();
  }
  render() {
    let responsibleStore = this.props.responsibleStore;
    let userService;//服务内容
    let userReason;//调整原因
    userService=responsibleStore.serviceLis.map((service,sindex)=>{
      return <li key={sindex} className={
          classnames({
            "responsible-btn":true,
            "selected-btn":service.select,
          })
        } onClick={()=>{
          service.select=!service.select;
          responsibleStore.responsibleRightInfo.service=responsibleStore.serviceLis.filter((service,sindex)=>{//过滤出选中的服务内容
            return service.select===true;
          });
          responsibleStore.responsibleRightInfo.serviceContent=responsibleStore.responsibleRightInfo.service.map((service)=>{
            return service.serviceAnswerTypeName;
          })
          responsibleStore.responsibleRightInfo.serviceID=responsibleStore.responsibleRightInfo.service.map((service)=>{
            return service.serviceAnswerTypeID;
          })
          // responsibleStore.allUsers[responsibleStore.userChooseID].chooseService=responsibleStore.responsibleRightInfo.serviceContent;//员工列表中已有的服务内容
          // responsibleStore.allUsers[responsibleStore.userChooseID].chooseServiceID=responsibleStore.responsibleRightInfo.serviceID;//员工列表中已有的服务内容ID
        }}>{service.serviceAnswerTypeName}
      </li>});
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
        responsibleStore.responsibleRightInfo.reason=responsibleStore.reasonLis.filter((reason,rindex)=>{//过滤出选中的原因
            return responsibleStore.currentReasonID===reason.reasonID;
        });
        responsibleStore.responsibleRightInfo.reasonID= responsibleStore.responsibleRightInfo.reason.map((reason)=>{
            return reason.reasonID;
        })
        // responsibleStore.allUsers[responsibleStore.userChooseID].chooseReason=responsibleStore.responsibleRightInfo.reasonID;//员工列表中已选的原因
      }}>{reason.reason}
    </li>})
    return (
        <Modal title={this.props.title+"的服务内容"}
            visible={true} 
            maskClosable={false} 
            footer={null}
            okText='确定' cancelText='取消'
            width={1100}
            wrapClassName="adjust-service-popup-modal"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
         	<div className="responsible-container">
            <div className="adjust-service">
              <div className="responsible-person-box">
                <div className="service-content">
                  <div className="title">服务内容</div>
                  <ul className="service-scroll">
                    <Scrollbars>
                      {userService}
                    </Scrollbars>
                  </ul>
                </div>
                <div className="adjust-reason">
                  <div className="title">调整原因</div>
                  <ul>
                    {userReason}
                  </ul>
                  <textarea placeholder="请输入桌台负责人调整原因" onChange={(e)=>{
                    responsibleStore.currentReasonID='';
                    responsibleStore.responsibleRightInfo.reasonID=[];
                    let val;
                    val = e.target.value; 
                    if (val.length > 100) {  
                      val=(val.substring(0, 100)); 
                    }  
                   this.setState({inputReason: val})
             }} value={this.state.inputReason}></textarea>
                </div>
            </div>  
            <div className="bottom-btn">
              <button className="cancel" onClick={()=>{
               responsibleStore.currentReasonID='';
                this.props.onCancel();
              }}>取消</button>
              <button onClick={this.handleCurrentTableOk}>应用当前负责桌台</button>
              <button onClick={this.handleAllTableOk}>应用所有负责桌台</button>
            </div>
					</div>  
         
				</div>
      </Modal>
    )
  }
}

export default AdjustService;