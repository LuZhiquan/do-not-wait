import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal } from 'antd';
import classnames from 'classnames';
import Scrollbars from 'react-custom-scrollbars';

import './select_waiter_popup.css';

@inject('dineStore') @observer
class SelectWaiterPopup extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = this.props.dineStore.operateWaiter;
  }

  handleOk = (e) => {
    this.props.dineStore.changeOperateWaiter(this.state.loginID, this.state.userName);
    if(this.props.okClick) this.props.okClick();
  }
  
  handleCancel = (e) => {
    if(this.props.cancelClick) this.props.cancelClick(e);
  }


  render() {
    let waiters = this.props.dineStore.waiterList;
    return <Modal title="选择服务员" visible={true} maskClosable={false} wrapClassName="vertical-center-modal"
      onOk={this.handleOk} onCancel={this.handleCancel} okText='确定' cancelText='取消'
      width={814}>
      <div className="choose_original_people">
		    	<div className="choose_select" >

		        	<input type="text" placeholder="请输入员工名称或编号进行查询" onChange={(e) => {
                this.setState({queryName: e.target.value});
              }} />
		        	<button onClick={() => {
                this.props.dineStore.getWaiterList(this.state.queryName);
              }}>查询</button>
		    	</div>
		    	<div className="choose_content">
            <Scrollbars>
              {!!waiters.length
                ? <div className="choose_content-inner">
                  {waiters.map((waiter) => {
                    return <div key={waiter.userID}
                      className={classnames({'each_data': true, 'click_selected': waiter.selected})}
                      onClick={() => {
                      this.props.dineStore.selectOperateWaiter(waiter.loginID);
                      this.setState({
                        loginID: waiter.loginID,
                        userName: waiter.loginName
                      });
                    }}>
                      <span className="original_name">{waiter.loginName}</span>
                      <span className="original_number">员工编号：{waiter.userID}</span>
                      <span className="original_department">部门：{waiter.orgName}</span>
                      <span className="original_selected"><i className="iconfont icon-icon_checkbox_sel"></i></span>
                    </div>
                  })}
                </div> 
                : 
                <div className="empty-holder">暂无相关数据</div>
              }
            </Scrollbars>
		    	</div>
		  </div>
    </Modal>
  }
}

export default SelectWaiterPopup;
