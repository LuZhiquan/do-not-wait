/**
* @author shelly
* @description  未称重菜品弹窗界面
* @date 2017-05-09
**/
import React from 'react';
import { Modal,message, Button,Alert } from 'antd';

import MyScroll from 'components/my-scrollbar';

import './no_weight_popup.css';

class PromptPopup extends React.Component {
  render() {
    // 只有退格的数字键
    let numKey=<ul className="num-key">
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
          <li>6</li>
          <li>7</li>
          <li>8</li>
          <li>9</li>
          <li className="dot">.</li>
          <li className="zero">0</li>
          <li className="back iconfont icon-order_btn_back"></li>
        </ul>

    //未称重列表数据
      let noWeightLis=
        [
            {number:"1",name:"皖鱼",price:40,unit:"公斤",status:"未称重",weightValue:2,focus:false},
            {number:"2",name:"香蕉提子干沙拉",price:20,unit:"公斤",status:"未称重",weightValue:2,focus:false},
            {number:"3",name:"桂鱼",price:80,unit:"公斤",status:"未称重",weightValue:1,focus:false},
            {number:"4",name:"草鱼",price:40,unit:"公斤",status:"未称重",weightValue:2,focus:false},
            {number:"5",name:"泥鳅",price:100,unit:"公斤",status:"未称重",weightValue:2,focus:false},
            {number:"6",name:"皖鱼",price:40,unit:"公斤",status:"未称重",weightValue:2,focus:false}
        ]
      
        //未称重列表
      let noWeightBlock;
          noWeightBlock = noWeightLis.map((element,index)=>{
            return <li key={index} className="select">
                      <span className="number">{element.number}</span>
                      <span className="name">{element.name}</span>
                      <span className="price">¥{element.price}</span>
                      <span className="unit">{element.unit}</span>
                      <span className="status">{element.status}</span>
                      <span className="weight-value"><input value={element.weightValue} 
                        onFocus={()=>{element.focus=true}} 
                        onblur={()=>{element.focus=false}}
                      /></span>
                  </li>                 
          });   
    return (
      <div id="no-weight">
        <Modal title="未称重菜品" 
            visible={true} 
            maskClosable={false} 
            okText='继续' cancelText='放弃'
            width={1100}
            wrapClassName="no-weight-popup-modal"
        >
          <div className="no-weight-left">
            <ul className="table-head">
              <li className="number">序号</li>
              <li className="name">名称</li>
              <li className="price">单价</li>
              <li className="unit">单位</li>
              <li className="status">状态</li>
              <li className="weight-value">称重值</li>
            </ul>
            <MyScroll width={658} height={415}>
              <ul className="table-body">
                {noWeightBlock}
              </ul>
            </MyScroll>
          </div>
          <div className="no-weight-right">
            {numKey}
          </div>
        </Modal>
      </div>
    )
  }
}

export default PromptPopup;