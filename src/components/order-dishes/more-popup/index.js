/**
* @author William Cui
* @description 更多操作
* @date 2017-06-06
**/
import React from 'react';
import { Modal, Tabs } from 'antd';

import './more_popup.less';

const TabPane = Tabs.TabPane;
class MorePopup extends React.Component {
  state = {
    activeKey: this.props.activeKey,
    actionType: '',
    actionName: ''
  };

  //确定
  handleOk = () => {
    let { closeHandle } = this.props;
    closeHandle && closeHandle();
  };

  //放弃
  handleCancel = () => {
    let { closeHandle } = this.props;
    closeHandle && closeHandle();
  };

  componentDidUpdate() {
    let { actionHandle, closeHandle } = this.props;
    let action = this.state;
    closeHandle && closeHandle();
    actionHandle && actionHandle(action);
  }

  render() {
    const willOrderMore = ['清空全部', '下单不打厨'];
    const willOrderOperate = [
      '删菜',
      '转赠',
      '等叫',
      '取消等叫',
      '先做',
      '取消先做',
      '免做',
      '取消免做',
      '打包',
      '取消打包'
    ];
    const didOrderOperate = ['退菜', '转菜', '等叫', '叫起', '催菜', '划单', '复制菜'];
    const booking = this.props.booking;
    if (!booking) willOrderMore.unshift('临时菜'); //不是预订才显示临时菜
    return (
      <Modal
        title="更多"
        visible={true}
        maskClosable={false}
        onOk={this.handleOk}
        footer={null}
        onCancel={this.handleCancel}
        okText="确定"
        cancelText="取消"
        width={840}
        wrapClassName="dishes-more-popup-modal"
      >
        <Tabs
          defaultActiveKey={this.state.activeKey}
          onChange={this.callback}
          tabBarStyle={{
            display: booking ? 'none' : 'block'
          }}
        >
          <TabPane tab="未下单操作" key="willOrder">
            <div className="guige">
              {willOrderMore.map((actionName, index) => {
                return (
                  <div
                    key={index}
                    className="more-btn-171 btn-active"
                    onClick={() => {
                      this.setState({
                        actionType: 'willOrder',
                        actionName
                      });
                    }}
                  >
                    {actionName}
                  </div>
                );
              })}
              <div className="batch-operate">
                <span className="line" />
                <span className="circle" />
                <span className="text">批量操作</span>
                <span className="circle" />
                <span className="line" />
              </div>
              <ul className="batch-btn">
                {willOrderOperate.map((actionName, index) => {
                  return (
                    <li
                      key={index}
                      className="batch-btn-171"
                      onClick={() => {
                        this.setState({
                          actionType: 'willOrder',
                          actionName
                        });
                      }}
                    >
                      {actionName}
                    </li>
                  );
                })}
              </ul>
            </div>
          </TabPane>
          <TabPane tab="已下单操作" key="didOrder">
            <div className="guige">
              <ul className="batch-btn">
                {didOrderOperate.map((actionName, index) => {
                  return (
                    <li
                      key={index}
                      className="batch-btn-171"
                      onClick={() => {
                        this.setState({
                          actionType: 'didOrder',
                          actionName
                        });
                      }}
                    >
                      {actionName}
                    </li>
                  );
                })}
              </ul>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

export default MorePopup;
