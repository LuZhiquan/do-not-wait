/**
* @author shelly
* @description 自定义菜规格选择
* @date 2017-05-23
**/
import React from 'react';
import { Modal, Alert, Tabs, Rate } from 'antd';
import classnames from 'classnames';

import './specification_popup.less';

const TabPane = Tabs.TabPane;
class SpecificationPopup extends React.Component {


 state={myValue:'',myValue1:'',myValue2:''}
  //确定
  handleOk=()=>{

  }
  //放弃
  handleCancel=()=>{

  }
  render() {
     
    return (
       <div>
          <Modal title="自定义菜规格选择"
              visible={true}
              maskClosable={false}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              okText='确定' cancelText='取消'
              width={840} wrapClassName="specification-popup-modal"
            >
                <div className="specification">
                    <div className="spec-btn">20元/小份</div>
                    <div className="spec-btn">30元/中份</div>
                    <div className="spec-btn btn-selected">40元/大份</div>
                   
                </div>
          </Modal>

       </div>
    );
  }
}



export default SpecificationPopup;
