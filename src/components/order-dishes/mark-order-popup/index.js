import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert } from 'antd';
import CommonKeyboard from '../common-keyboard';
import PromptPopup from 'components/prompt-popup';

import './mark_order_popup.css';

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
}

//未下单弹窗
@inject('dishesStore') @observer
class MarkOrderPopup extends React.Component {

  state = {
    quantity: 1,
    statePopup: false
  }

  //确定
  handleOk=()=>{
    let { dishesStore, dishes } = this.props;
    let quantity = this.props.cancel ? dishes.servingQuantity: (dishes.quantity-dishes.servingQuantity);
    if(this.state.quantity > quantity) {
      dishesStore.showFeedback({status: 'validate', msg: `${this.props.cancel?'取消':'划单'}数量不能大于${this.props.cancel?'可取消':'可划'}数量！`});
      return;
    }else if(this.state.quantity < 1){
      dishesStore.showFeedback({status: 'validate', msg: '请输入数量！'});
      return;
    }else {
      let {detailID, recordID} = dishes;

      let markOrderDetail = [{
				detailID,
				recordID,
				quantity: this.state.quantity
			}];

      if(this.props.cancel) {
        //取消划单
        dishesStore.cancelMarkOrder({cancelMarkOrderDetail: markOrderDetail});
      }else {
        //划单二次确认
        this.setState({
          statePopup: <PromptPopup 
            onOk={() => {
              //划单
              dishesStore.markOrder({markOrderDetail});
              this.setState({statePopup: false});
              this.props.okClick && this.props.okClick();
            }}
            onCancel={() => {
              this.setState({statePopup: false});
            }}
          >
            <div style={promptContStyle}>
              确定划单【<strong style={{padding: '5px', color: '#F00'}}>{dishes.productName}</strong>】{this.state.quantity}份？
            </div>
          </PromptPopup>
        });  
      }
      
    }
  }

  //放弃
  handleCancel=()=>{
    this.props.cancelClick && this.props.cancelClick();
  }



  render() {
    let { dishesStore, dishes } = this.props;
    return <Modal title={this.props.cancel ? "取消划单" : "划单"}
          visible={true}
          maskClosable={false}
          width={840} 
          wrapClassName="mark-order-modal"
          onOk={this.handleOk} 
          onCancel={this.handleCancel} 
          okText='确定' 
          cancelText='取消'
      >
        {dishesStore.feedback && dishesStore.feedback.status === 'validate' &&
        <Alert message={dishesStore.feedback.msg} banner closable onClose={() => {
            //关闭警告信息
            dishesStore.closeFeedback();
        }} />}
        <div className="mark-order-block">
          <div className="mark-order-title">
              {!dishes.needWeigh && <div className="mark-order-left">可{this.props.cancel&&'取消'}划单<i>{this.props.cancel ? dishes.servingQuantity: (dishes.canMarkOrderNum)}</i>份</div>}
              <div className="mark-order-right">
                  {this.props.cancel?'取消': '划'}<input type="text" value={this.state.quantity} readOnly /> 份
              </div>
          </div>
          <CommonKeyboard getResult={(value)=>{
              this.setState({quantity: value});
          }}/>
        </div>
        {this.state.statePopup}
    </Modal>
  }
}



export default MarkOrderPopup;
