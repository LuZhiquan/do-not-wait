/**
* @author Shelly
* @description 新增桌台负责人
* @date 2017-05-25
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';
import ChoosePost from '../choose-post-popup/'; //选择岗位

import './add_responsible_popup.less';
message.config({
	top: 300,
	duration: 1
});
 
 
@inject('responsibleStore') @observer
class AddResponsible extends React.Component {
  constructor(props){
    super(props);
    this.state={
      addResponsibleRight:'',
      rolePopup:'',//岗位选择
      current:0,
      searchValue:'',//搜索框内的内容
      inputReason:'',//手动输入的原因
    }
  }

  //获取搜索的内容
    searchValue=(e)=>{
        var value = e.target.value;
        this.setState({searchValue:value});
    }

  handleOk=()=>{
      //要输出的信息
      let responsibleStore = this.props.responsibleStore;
      let addDate={};
      let serviceID=[];
      if(responsibleStore.userChooseID!==-1){
        if(responsibleStore.allUsers[responsibleStore.userChooseID].chooseService.length){
          if(responsibleStore.allUsers[responsibleStore.userChooseID].chooseReason.length>0||this.state.inputReason!==''){
          serviceID=responsibleStore.allUsers[responsibleStore.userChooseID].chooseServiceID;
          serviceID = Array.from(new Set(serviceID));//数组去重
          addDate={
            tableID:this.props.tableID,//桌台ID
            tableName:this.props.tableName,//桌台名称
            tableCode:this.props.tableCode,//桌台编码
            dutyVOList:[
              {loginID:responsibleStore.allUsers[responsibleStore.userChooseID].loginID,//员工登陆ID
              areaID:responsibleStore.firstCategoryID,//区域ID
              mealsID:responsibleStore.secondCategoryID ,//餐次ID
              areaName:this.props.areaName,//区域名称
              mealName:this.props.mealName,//餐次名称
              serviceAnswerTypeList:serviceID,//服务内容ID
              changeReason:responsibleStore.allUsers[responsibleStore.userChooseID].chooseReason[0],//调整原因ID
              dealDesc:responsibleStore.allUsers[responsibleStore.userChooseID].inputReason},//输入的原因
            ],
          }
            responsibleStore.getAddTableManagerInfo(addDate);
            this.props.onOk();
            responsibleStore.changePostOperate(null,'全部');
            responsibleStore.savetypeid=null;
            
            
          }else{
            message.warning("请选择或输入原因");
          }
            
        }else{
          message.warning("请选择服务");
        }
      }else{
         message.warning("请选择要增加的员工");
      }
    


  }
  handleCancel=()=>{
    this.props.onCancel();
    this.props.responsibleStore.userChooseID=-1;
    this.props.responsibleStore.changePostOperate(null,'全部');
    this.props.responsibleStore.savetypeid=null;
  }
  render() {
    let responsibleStore = this.props.responsibleStore;
    let usersList;//左边员工列表
    let userService;//右边服务内容
    let userReason;//右边调整原因
   
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
             return service.serviceAnswerTypeName+' ';
            })
            responsibleStore.responsibleRightInfo.serviceID=responsibleStore.responsibleRightInfo.service.map((service)=>{
             return service.serviceAnswerTypeID;
            })
            responsibleStore.allUsers[responsibleStore.userChooseID].chooseService=responsibleStore.responsibleRightInfo.serviceContent;//员工列表中已有的服务内容
            responsibleStore.allUsers[responsibleStore.userChooseID].chooseServiceID=responsibleStore.responsibleRightInfo.serviceID;//员工列表中已有的服务内容ID
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
        responsibleStore.allUsers[responsibleStore.userChooseID].chooseReason=responsibleStore.responsibleRightInfo.reasonID;//员工列表中已选的原因
        
      }}>{reason.reason}
    </li>})
    
    usersList=responsibleStore.allUsers.map((ele,index)=>{
      return <div key={index} className={classnames({
                  'list':true,
                  'active-list':responsibleStore.userChooseID===index?true:false,
                })} onClick={()=>{
                  //要再重新循环已有服务和原因，然后赋值给右边。让右边有值 的为选中状态
                  let leftServiceContent=[];
                  let leftReasonContent=[];
                  ele.chooseService.forEach((sevrvice)=>{
                    leftServiceContent.push(sevrvice.substring(0,sevrvice.length-1))
                  })
                  ele.chooseReason.forEach((reason)=>{
                    leftReasonContent.push(reason)
                  })
                  //遍历出左边员工列表中已有的服务，然后和右边的服务进行比较，如果有匹配的就选中
                  responsibleStore.serviceLis.forEach((rService,index)=>{
                    if(leftServiceContent.includes(rService.serviceAnswerTypeName)) {
                      rService.select=true;
                      ele.chooseServiceID.push(rService.serviceAnswerTypeID);
                    }
                   else{
                        rService.select=false;
                    }
                  })
                  //遍历出左边员工列表中已有的调整原因，然后和右边的原因进行比较，如果有匹配的就选中
                  
                  responsibleStore.reasonLis.forEach((reason,index)=>{
                    if(leftReasonContent.includes(reason.reasonID)) {
                       responsibleStore.currentReasonID=reason.reasonID;
                    }
                    if(leftReasonContent.length===0){
                      responsibleStore.currentReasonID='';
                    }
                  })
                   //遍历出左边员工列表中已有的输入原因，如果有就显示在左边的手工输入框里
                    this.setState({inputReason:ele.inputReason});
                    responsibleStore.userChooseID=index;
                }}>
            <p className="name">{ele.userName}</p>
            <p className="content">服务内容：{ ele.chooseService}</p>
            <p className="sign"><i className={classnames({
              "iconfont":true,
              "icon-icon_checkbox_sel":true,
              "hasServiceContent": responsibleStore.userChooseID===index,
            })} onClick={()=>{
              ele.chooseService=[];
            }}></i></p>
        </div>
      })


 
  //右边有负责人信息块
    let rightBlock;
    if(responsibleStore.userChooseID>=0){
      rightBlock= <div className="responsible-person-box">
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
            <ul className="reason-scroll">
              <Scrollbars>
                {userReason}
              </Scrollbars>
            </ul>
          </div>
          <div className="input-reason">
             <textarea placeholder="请输入桌台负责人调整原因" onChange={(e)=>{
                  responsibleStore.currentReasonID='';
                  responsibleStore.allUsers[responsibleStore.userChooseID].chooseReason=[];
                  let val;
                  val = e.target.value; 
                  if (val.length > 100) {  
                    val=(val.substring(0, 100)); 
                  }  
                   responsibleStore.allUsers[responsibleStore.userChooseID].inputReason=val;
                   this.setState({inputReason: val})
             }} value={this.state.inputReason}></textarea>
          </div>
    </div>
    }else{
      rightBlock=<div className="no-responsible-person-box">
                  <div className="desk-pic">
                    <i className="iconfont icon-zhuotaixinxi_icon_wuzhuotai-"></i>
                  </div>
                  <div className="desk-show-msg">请选择新增桌台负责人</div>
                </div>
    }

   
    return (
      
        <Modal title={'新增'+this.props.title+'桌台负责人'}
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='取消'
            width={1100}
            wrapClassName="add-responsible-popup-modal"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
         	<div className="responsible-container">
            <div className="responsible-left">
              <div className="search-area">
                <div className="waiter-choose" onClick={()=>{
                  this.setState({rolePopup:<ChoosePost onOk={()=>{
                    this.setState({rolePopup:''});
                    responsibleStore.changePostOperate(responsibleStore.changePost.roleID, responsibleStore.changePost.roleName);
                  }} onCancel={()=>{
                     this.setState({rolePopup:''})
                  }}/>})
								responsibleStore.getQueryRoleInfo();
							}}> {responsibleStore.changePost.roleName? responsibleStore.changePost.roleName:'全部'} <i className="iconfont icon-Shapearrow-"></i></div>
                <div className="input-wrap"><input type="text" placeholder="请输入员工名称或编号进行查询" onKeyUp={this.searchValue}/></div>
                <button className="search-btn" onClick={()=>{responsibleStore.getQueryAllUsers(this.state.searchValue,responsibleStore.changePost.roleID)}}>查询</button>
              </div>
              
              <div className="list-area">
                <Scrollbars>
                   {usersList}
                </Scrollbars>
              </div>
            </div>
            <div className="responsible-right">
              {rightBlock}
					  </div>  
          </div>
          {this.state.rolePopup}
        </Modal>
    )
  }
}

export default AddResponsible;