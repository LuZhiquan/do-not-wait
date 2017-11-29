/**
* @author Shelly
* @description 调整历史记录
* @date 2017-05-26
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import './adjust_history_popup.less';

@inject('responsibleStore') @observer
class AdjustReason extends React.Component {

  handleOk=()=>{
   this.props.onOk();
  }
  handleCancel=()=>{
   
     this.props.onOk();
  }
  render() {
    let responsibleStore=this.props.responsibleStore;
   
   
    //调整原因
    let adjustHistoryBlock;
    if(responsibleStore.adjustHistoryLis){
       adjustHistoryBlock=responsibleStore.adjustHistoryLis.map((ele,index)=>{
        return <li key={index} className="list">
            <p className="num">{index+1}</p>
            <p className="type">{ele.changeTypeName}</p>
            <p className="object">{ele.changeObjectName}</p>
            <p className="content">{ele.serviceName}</p>
            <p className="reason">{ele.operationReason}</p>
            <p className="person">{ele.creator}</p>
            <p className="time">{ele.createTime}</p>
        </li>
      })
    }
   
    
    return (
        <Modal title={this.props.title+"桌台负责人调整历史" }
            visible={true} 
            maskClosable={false} 
            okText='关闭' cancelText='取消'
            width={1100}
            wrapClassName="adjust-history-popup-modal"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
         	<div className="responsible-container">
            <div className="table-title">
              <p className="num">NO</p>
              <p className="type">操作类型</p>
              <p className="object">调整对象</p>
              <p className="content">服务内容</p>
              <p className="reason">操作原因</p>
              <p className="person">操作人</p>
              <p className="time">操作时间</p>
					  </div> 
            <ul className="list-wrap">
              <Scrollbars>
                {adjustHistoryBlock}
              </Scrollbars>
            </ul> 
				  </div>
      </Modal>
    )
  }
}

export default AdjustReason;