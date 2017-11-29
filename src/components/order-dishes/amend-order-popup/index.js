/* 订单修改弹窗 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert } from 'antd';

import SelectWaiterPopup from 'components/select-waiter-popup';

import './amend_order.css';

@inject('dineStore', 'dishesStore') @observer
class AmendOrder extends React.Component {
   constructor(props){
    super(props);
    let orderInfo = props.dishesStore.orderInfo;
    this.state={ 
      selectWaiterPopup: null,
      waiterLoginID: orderInfo.waiterLoginID,
      waiterName: orderInfo.waiterName,
      peopleNum: orderInfo.peopleNum,
      memo: orderInfo.memo.trim()
    };
  }
  handleClick=(e)=> {
    let value=e.target.innerText;
    let peopleNum = this.state.peopleNum ? this.state.peopleNum : '';
    peopleNum = peopleNum+value;
    if(peopleNum.length<3) {
      this.setState({peopleNum});
    }
  }

  handleBack=(e)=>{
    let peopleNum = String(this.state.peopleNum);
    let value = peopleNum.substr(0, peopleNum.length-1);
    this.setState({peopleNum: value});
  }

  handleOk() {
    let dishesStore = this.props.dishesStore;
    if(this.state.peopleNum>0) {
      dishesStore.updateOrderInfo({
        subOrderID: dishesStore.orderInfo.subOrderID, 
        tableID: dishesStore.orderInfo.tableID, 
        waiterLoginID: this.state.waiterLoginID, 
        peopleNum: this.state.peopleNum, 
        memo: this.state.memo
      });
      this.props.okClick && this.props.okClick();
    }else {
      dishesStore.showFeedback({status: 'validate', msg: '人数不能为0或空！'});
    }
  }

  handleCancel() {
    this.props.cancelClick && this.props.cancelClick();
  }

  selectWaiterPopup() {
    this.props.dineStore.getWaiterList();
    this.setState({
      selectWaiterPopup: <SelectWaiterPopup okClick={() => {
        let waiter = this.props.dineStore.operateWaiter;
        this.setState({
          selectWaiterPopup: null,
          waiterLoginID: waiter.loginID,
          waiterName: waiter.userName
        });
      }} cancelClick={() => {
        this.setState({selectWaiterPopup: null});
      }} />
    })
  }

  render() {
    let { dishesStore } = this.props;
    let orderInfo = dishesStore.orderInfo;
    return <Modal title="修改订单信息" 
      visible={true} 
      maskClosable={false}
      onOk={this.handleOk.bind(this)} 
      onCancel={this.handleCancel.bind(this)} 
      okText='确定' cancelText='取消'
      width={840}
      wrapClassName="amend-order-popup-modal"
    >   
      {dishesStore.feedback && dishesStore.feedback.status === 'validate' &&
       <Alert 
        message={dishesStore.feedback.msg} 
        banner 
        closable 
        onClose={() => {
          //关闭警告信息
          dishesStore.closeFeedback();
       }} />}
        <div id="amend-order">
          <div id="order-num">
            <div className="inline-block">
              <p className="left-text">订单号:</p>{orderInfo.orderCode}
            </div>
            <div className="inline-block pull-right">
              <p className="left-text">桌 台:</p>{orderInfo.tableName}
            </div>
          </div>

          <div id="person-num">
            <div className="inline-block">
              <p className="left-text">人 数:</p>
              <input value={this.state.peopleNum}  type="text" readOnly />
            </div>
            <p className="left-text inline-block">单 位: 人</p>
            <table className="table" cellSpacing="1">
              <tbody>
                <tr>
                  <td className="first-td" onClick={this.handleClick}>1</td>
                  <td onClick={this.handleClick}>2</td>
                  <td onClick={this.handleClick}>3</td>
                  <td onClick={this.handleClick}>4</td>
                  <td onClick={this.handleClick}>5</td>
                  <td rowSpan="2" className="back iconfont icon-order_btn_back" onClick={this.handleBack}></td>
                </tr>
                <tr>
                  <td className="second-td"  onClick={this.handleClick}>6</td>
                  <td onClick={this.handleClick}>7</td>
                  <td onClick={this.handleClick}>8</td>
                  <td onClick={this.handleClick}>9</td>
                  <td onClick={this.handleClick}>0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="server-name">
            <div className="inline-block">
              <p className="left-text">服务员:</p>{this.state.waiterName}
              <span className="iconfont icon-home_title_arrow_right" onClick={this.selectWaiterPopup.bind(this)}></span>
            </div>
          </div>

          <div>
            <p className="left-text">备 注:</p>
            <textarea 
              name="" 
              id="remark" 
              value={this.state.memo} 
              cols="30" 
              rows="10"
              placeholder="请输入备注，限100字内"
              onChange={(e) => {
                let memo = e.target.value.substr(0, 100);
                this.setState({memo});
              }} 
            ></textarea>
          </div>
        </div>
        {this.state.selectWaiterPopup}
    </Modal>
  }
}

export default AmendOrder;