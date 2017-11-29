/**
* @author shelly
* @description 自定义菜分类选择
* @date 2017-05-23
**/
import React from 'react';
import { Modal, Alert, Tabs, Rate } from 'antd';
import classnames from 'classnames';

import './user-defind-classify.less';

const TabPane = Tabs.TabPane;
class UserDifindClassify extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tabPosition: 'left' };
  }

  //确定
  handleOk = () => {};
  //放弃
  handleCancel = () => {};

  render() {
    //分类数据
    let classifyLis = [
      {
        classifyTitle: '主食',
        classifyContent: [
          { text: '肉类', selecte: false },
          { text: '类', selecte: false },
          { text: '鱼', selecte: true },
          { text: '欢乐豆', selecte: false },
          { text: '苦瓜', selecte: false },
          { text: '肉类', selecte: false }
        ]
      },
      {
        classifyTitle: '热菜',
        classifyContent: [
          { text: '肉类', selecte: false },
          { text: '类', selecte: false },
          { text: '鱼', selecte: false },
          { text: '欢乐豆', selecte: true },
          { text: '苦瓜', selecte: false },
          { text: '肉类', selecte: false }
        ]
      },
      {
        classifyTitle: '凉菜',
        classifyContent: [
          { text: '肉类', selecte: false },
          { text: '类', selecte: false },
          { text: '鱼', selecte: true },
          { text: '欢乐豆', selecte: false },
          { text: '苦瓜', selecte: false },
          { text: '肉类', selecte: false }
        ]
      },
      {
        classifyTitle: '面食',
        classifyContent: [
          { text: '肉类', selecte: false },
          { text: '类', selecte: false },
          { text: '鱼', selecte: false },
          { text: '欢乐豆', selecte: false },
          { text: '苦瓜', selecte: false },
          { text: '肉类', selecte: true }
        ]
      }
    ];

    //分类列表
    let classifyBlock;
    classifyBlock = classifyLis.map((ele, index) => {
      let classifyContentBlock = ele.classifyContent.map((element, index) => {
        return (
          <li
            key={index}
            className={classnames({
              'classify-btn': true,
              'btn-selected': element.selecte
            })}
          >
            {element.text}
          </li>
        );
      });
      return (
        <TabPane tab={ele.classifyTitle} key={index}>
          <div>
            <ul className="table-body">{classifyContentBlock}</ul>
          </div>
        </TabPane>
      );
    });

    return (
      <div>
        <Modal
          title="自定义菜分类选择"
          visible={true}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          width={840}
          wrapClassName="user-defind-classify-modal"
        >
          <Tabs className="classify-left" tabPosition={this.state.tabPosition}>
            {classifyBlock}
          </Tabs>
        </Modal>
      </div>
    );
  }
}

export default UserDifindClassify;
