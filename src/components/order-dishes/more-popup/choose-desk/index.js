
/**
* @author shining
* @description 请选择桌台
* @date 2017-05-25
**/
import React from 'react';
import { Modal} from 'antd'; 
import MyScroll from 'react-custom-scrollbars';//滚动条 
import '../modal.css';
import '../iconfont/iconfont.css';
import './choose-desk.less';


class ChooseDeskPopup extends React.Component {
 
 //关闭按钮取消按钮
  handleCancel=()=>{
    if(this.props.closebotton){
        this.props.closebotton();
    }
  }

  //确定按钮
  handleOk=()=>{
    if(this.props.okbotton){
        this.props.okbotton();
    } 
  }
  render() { 
    return (
        <Modal  title="请选择桌台" 
                visible={true} 
                maskClosable={false} 
                okText='确定' cancelText='取消'
                width={840}
                wrapClassName="choose-desk-modal"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
            <div className="search-desk">  
                <p className="all-area">
                    全部区域  
                    <i className="iconfont icon-Shapearrow-"></i>
                </p>
                <div className="search-value">
                    <input type="text" placeholder="请输入桌台名称进行查询"/> 
                    <i className="iconfont icon-home_icon_searchx"></i>
                </div> 
            </div>
             <div className="sum-checked">
                <i className="iconfont icon-icon_checkbox_sel"></i>
                <em>全选</em>
                <span>已选7桌／共20桌</span>
            </div>
            <div className="desk-main">
                <MyScroll>
                    <div className="each-desk iconfont mask select">
                        <h3 className="table-name">A101</h3>
                         <p>0/10</p> 
                    </div> 
                </MyScroll>
            </div>
          
        </Modal>
    )
  }
}

export default ChooseDeskPopup;