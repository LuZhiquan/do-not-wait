/**
* @author Shelly
* @description 选择岗位
* @date 2017-05-26
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import classnames from 'classnames';

import './choose_post_popup.less';

@inject('responsibleStore') @observer
class ChoosePost extends React.Component {
  constructor(props){
    super(props);
    this.state=this.props.responsibleStore.changePost;
  }
 //点击确定按钮
  handleOk=()=>{
    this.props.responsibleStore.changePostOperate(this.state.roleID, this.state.roleName);
    this.props.responsibleStore.closeChoosePost();
    this.props.onOk();
  }
  handleCancel=()=>{
      this.props.responsibleStore.closeChoosePost();
      this.props.onCancel();
  }
  render() {
    let responsibleStore=this.props.responsibleStore;
    let roleList=responsibleStore.roleList; 
    // 服务内容数据
    let postBlock;
      if(roleList.length) {
          postBlock = roleList.map((ele,index) => { 
            return <li key={ele.roleID}  className={classnames({
                "choost-btn":true,
                'seleceted-btn':responsibleStore.savetypeid === ele.roleID ? true : false
            })}  
              onClick={()=>{ 
                responsibleStore.savetypeid=ele.roleID;
                this.setState({
                roleID: ele.roleID,
                roleName: ele.roleName
                });
            }}> 
                {ele.roleName }
            </li>
          });
      }


   
    return (
        <Modal title="选择岗位" 
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='取消'
            width={840}
            wrapClassName="choose-post-popup-modal"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
         	<div className="responsible-container">
            <ul className="btn-wrap">
              {postBlock}
            </ul>
				  </div>
        </Modal>
    )
  }
}

export default ChoosePost;