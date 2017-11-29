/**
* @author shelly
* @description 自定义菜单位选择
* @date 2017-05-23
**/
import React from 'react';
import { Modal, Alert, Tabs, Rate } from 'antd';
import classnames from 'classnames';

import './unit_popup.less';

const TabPane = Tabs.TabPane;
class UnitPopup extends React.Component {
  //确定
  handleOk = () => {};
  //放弃
  handleCancel = () => {};
  render() {
    let unitBtns = [
      { text: '例', selected: false },
      { text: '打', selected: false },
      { text: '个', selected: false },
      { text: '只', selected: false },
      { text: '位', selected: true },
      { text: '煲', selected: false },
      { text: '件', selected: false },
      { text: '杯', selected: false },
      { text: '壶', selected: false }
    ];
    let unitBtn;
    unitBtn = unitBtns.map((ele, index) => {
      return (
        <li
          className={classnames({
            'unit-btn': true,
            'btn-selected': ele.selected
          })}
        >
          {ele.text}
        </li>
      );
    });
    return (
      <div>
        <Modal
          title="自定义菜单位选择"
          visible={true}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          width={840}
          wrapClassName="unit-popup-modal"
        >
          <ul className="unit">{unitBtn}</ul>
        </Modal>
      </div>
    );
  }
}

export default UnitPopup;
