import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert, Tabs } from 'antd';

import classnames from 'classnames';
import CommonKeyboard from '../common-keyboard';
import Kouwei from '../kouwei';
import BeiZhu from '../beizhu';

import './common_dishes_popup.css';

const TabPane = Tabs.TabPane;

//点选普通单品弹窗
@inject('dishesStore') @observer
class CommonDishesPopup extends Component {

  constructor(props, context) {
    super(props, context);

    let {productMessage} = props;
    this.state = {
      specificationList: productMessage.specificationList, //规格可选列表
      attributeMap: productMessage.attributeMap, //口味做法可选列表
      designers: productMessage.designers, //厨师可选列表
      optionID: undefined, //已选规格
      selectedAttributeList: undefined, //已选口味做法
      designerID: undefined, //已选厨师
      weight: undefined, //称重
      memo: undefined //备注
    }
  }


  //确定
  handleOk=()=>{
    const {
      dishesStore, 
      dishes, 
      closeHandle
    } = this.props;

    let isAdded = dishesStore.addToCart({
      isStatic: false, 
      dishes,
      productMessage: this.state
    });

    //关闭单品设置弹窗
    isAdded && closeHandle && closeHandle();
  }

  //放弃
  handleCancel=()=>{
    let {closeHandle} = this.props;
    //关闭未下单修改弹窗
    closeHandle && closeHandle();
  }

  componentWillUnmount() {
    let {dishesStore} = this.props;
    dishesStore.closeFeedback();
  }

  render() {
    const {dishesStore, dishes} = this.props;
    const { 
        specificationList, //规格可选列表
        attributeMap, //口味做法可选列表
        optionID, //已选规格
        selectedAttributeList, //已选口味做法
        memo
    } = this.state;

    let tabPaneIndex = 0; //定义tab初始化下标
    
    return <Modal 
      title={this.props.title}
      visible={true}
      maskClosable={false}
      onOk={this.handleOk}
      onCancel={this.handleCancel}
      okText='确定' 
      cancelText='放弃'
      width={840} 
      wrapClassName="common-dishes-popup-modal"
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
      <Tabs defaultActiveKey="0" onChange={this.callback}>

        {specificationList && !!specificationList.length &&
        <TabPane tab="规格" key={tabPaneIndex++}>
            <div className="guige">
            {specificationList.map(specification => {
                return <div
                key={specification.optionID}
                className={classnames({
                    'myBtn-365-38': true,
                    'btn-active': specification.optionID === optionID
                })} onClick={() => {
                    //选择规格
                    this.setState({optionID: specification.optionID});
                }}>
                {specification.price}元／{specification.optionName}
                </div>
            })}
            </div>
        </TabPane>}

        {dishes.needWeigh && 
        <TabPane tab="期望重量" key={tabPaneIndex++}>
            <div className="cheng-zhong-block">
            <div className="chengzhong-title">
                <input type='text' className='result' readOnly value={this.state.weight || ''} />
                <p className="danwei">单位：{dishes.unit}</p>
            </div>
            <CommonKeyboard getResult={(weight)=>{
                this.setState({weight});
            }}/>
            </div>
        </TabPane>}

        {attributeMap 
        && Object.keys(attributeMap).length 
        && <TabPane tab="口味做法" key={tabPaneIndex++}>
          <Kouwei
            attributeMap={attributeMap}
            selectedAttributeList={selectedAttributeList}
            memo={memo}
            onChange={({attributeMap, selectedAttributeList}) => {
                this.setState({
                    attributeMap,
                    selectedAttributeList
                });
            }}
            onEntry={(memo) => {
              this.setState({memo});
            }}
          />
        </TabPane>}

        {((specificationList && !!specificationList.length) || dishes.needWeigh)
         && (!attributeMap || !Object.keys(attributeMap).length)
         && <TabPane tab="备注" key={tabPaneIndex++}>
          <div className="dishes-memo">
            <BeiZhu memo={memo || ''} onEntry={(memo) => {
              this.setState({memo});
            }} />
          </div>
        </TabPane>}
        
      </Tabs>
    </Modal>;
  }

}



export default CommonDishesPopup;
