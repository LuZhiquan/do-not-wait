
/**
* @author shelly
* @description 分类折弹窗界面
* @date 2017-05-14
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import classnames from 'classnames';

import MyScroll from 'components/my-scrollbar';

import './category_discount_popup.less';
@inject('settlementStore') @observer
class PromptPopup extends React.Component {
 
  state={current:-1}
  handleCancel=()=>{
    this.props.settlementStore.categoryDiscountClose();
  }
  render() {
      //分类折列表数据
      let categoryDisData=
        [
            {number:"1",code:"0001",name:"建行信用卡8折",selected:false},
            {number:"2",code:"0002",name:"建行信用卡8折",selected:false},
            {number:"3",code:"0003",name:"建行信用卡8折",selected:false},
            {number:"4",code:"0004",name:"建行信用卡8折",selected:false},
            {number:"5",code:"0005",name:"建行信用卡8折",selected:false},
            {number:"1",code:"0001",name:"建行信用卡8折",selected:false},
            {number:"2",code:"0002",name:"建行信用卡8折",selected:false},
            {number:"3",code:"0003",name:"建行信用卡8折",selected:false},
            {number:"4",code:"0004",name:"建行信用卡8折",selected:false},
            {number:"5",code:"0005",name:"建行信用卡8折",selected:false},
        ]
      
        //分类折列表
      let categoryDisList;
          categoryDisList = categoryDisData.map((element,index)=>{
            return <li key={index} onClick={()=>{
                      this.setState({current:index})
                    }}
                     className={classnames({
                      "active":index===this.state.current
                    })}
                    >
                      <span className="number">{element.number}</span>
                      <span className="code">{element.code}</span>
                      <span className="name">{element.name}</span>
                  </li>                
          });  
    return (
      <div id="category-discount">
        <Modal title="分类折" 
            visible={true} 
            maskClosable={false} 
            okText='确定' cancelText='取消'
            width={840}
            wrapClassName="category-discount-modal"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
          <div className="category-discount-list">
            <ul className="table-head">
              <li className="number">序号</li>
              <li className="code">方案编码</li>
              <li className="name">方案名称</li>
            </ul>
            <MyScroll width={798} height={415}>
              <ul className="table-body">
                {categoryDisList}
              </ul>
            </MyScroll>
          </div>
        </Modal>
      </div>
    )
  }
}

export default PromptPopup;