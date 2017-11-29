
/**
* @author shining
* @description 席数
* @date 2017-05-25
**/
import React from 'react';
import { Modal} from 'antd'; 
import MyScroll from '../../components/my-scrollbar/index'; 
import './seats-number.less';
import '../modal.css';
import '../iconfont/iconfont.css';


class SeatsnNumberPopup extends React.Component {
 
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
        <Modal  title="席数" 
                visible={true} 
                maskClosable={false} 
                okText='确定' cancelText='取消'
                width={920}
                wrapClassName="seats-number-modal"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
          <div className="seats-seats-main">
             <p className="seats-seats-title">
                <span>可选（8项）</span>
                <span>已选（0项）</span>
             </p>
             <div className="optional-main">
                <MyScroll width={428} height={463} hasAllSelected> 
                    <li className="optional-li">
                        <span>1</span>
                        <span>花菜炒肉</span>
                        <span>1份</span>
                        <span>¥30.00</span>
                    </li>  
                     <li className="optional-li">
                        <span>1</span>
                        <span>花菜炒肉</span>
                        <span>1份</span>
                        <span>¥30.00</span>
                    </li>  
                </MyScroll>
             </div>
             <div className="selectable-main">
               <MyScroll width={428} height={463}  delSelected sumdesk> 
                    <li className="optional-li">
                        <span>1</span>
                        <span>花菜炒肉</span>
                        <span>1份×20席</span>
                        <span> ¥30.00 </span>
                        <span><em></em> <i className="iconfont icon-shanchu"></i></span>
                    </li>
                     <li className="optional-li">
                        <span>1</span>
                        <span>花菜炒肉</span>
                        <span>1份×20席</span>
                        <span> ¥30.00 </span>
                        <span><em></em> <i className="iconfont icon-shanchu"></i></span>
                    </li>  
                </MyScroll>
             </div>
          </div> 
        </Modal>
    )
  }
}

export default SeatsnNumberPopup;