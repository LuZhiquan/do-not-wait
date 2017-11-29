import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Menu, Icon, Dropdown, Alert } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import './change_desk_dishes_popup.less';

@inject('dineStore')
@observer
class ChangeDeskDishes extends Component {
  handleOk = () => {
    let { dineStore } = this.props;
    let mainTableIDs = [],
      viceTableIDs = [];
    let flag = true;

    dineStore.occupiedTableList.forEach(table => {
      if (table.targetTableID) {
        mainTableIDs.push(table.tableID);
        viceTableIDs.push(table.targetTableID);
      } else {
        flag = false;
      }
    });

    if (flag) {
      dineStore.tableList = [];
      dineStore.turnTable({
        bookingID: dineStore.occupiedTableList[0].bookingID,
        mainTableIDs,
        viceTableIDs
      });
      let { closeHandle } = this.props;
      closeHandle && closeHandle();
    } else {
      dineStore.showFeedback({
        status: 'validate',
        msg: '还有桌台菜品没有处理！'
      });
      return;
    }
  };

  handleCancel = () => {
    let { dineStore, closeHandle } = this.props;
    dineStore.occupiedTableList.map((table, index) => {
      dineStore.setExchangeTable({
        tableID: table.tableID,
        targetTableName: null,
        targetTableID: null
      });
      return table;
    });
    closeHandle && closeHandle();
  };

  render() {
    let { dineStore } = this.props;
    return (
      <div>
        <Modal
          title="预订换台-菜品处理"
          visible={true}
          maskClosable={false}
          okText="确定"
          cancelText="取消"
          width={700}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrapClassName="change-desk-popup-modal"
        >
          {dineStore.feedback &&
            dineStore.feedback.status === 'validate' && (
              <Alert
                message={dineStore.feedback.msg}
                banner
                closable
                onClose={() => {
                  //关闭警告信息
                  dineStore.closeFeedback();
                }}
              />
            )}
          <div className="change-desk-container">
            <div className="change-title">以下被取消的餐台已经点菜，请选择转到哪个桌台：</div>
            <div className="content">
              <Scrollbars>
                {dineStore.occupiedTableList &&
                  !!dineStore.occupiedTableList.length &&
                  dineStore.occupiedTableList.map((table, index) => {
                    return (
                      <div key={index} className="items">
                        <div className="deskName">
                          {table.tableName}（{table.dishesQuantity}个菜品）
                        </div>
                        <div className="text">处理方式：</div>
                        <Dropdown
                          overlay={
                            <Menu
                              id="my-menu"
                              onClick={ele => {
                                if (ele.key === -1) {
                                  dineStore.setExchangeTable({
                                    tableID: table.tableID,
                                    targetTableName: '重新点菜',
                                    targetTableID: -1
                                  });
                                } else {
                                  let targetTable = JSON.parse(ele.key);
                                  dineStore.setExchangeTable({
                                    tableID: table.tableID,
                                    targetTableName:
                                      '转' + targetTable.tableName,
                                    targetTableID: targetTable.tableID
                                  });
                                }
                              }}
                            >
                              {dineStore.targetTableList &&
                                dineStore.targetTableList.length &&
                                dineStore.targetTableList.map(
                                  (targetTable, index) => {
                                    return (
                                      <Menu.Item
                                        key={JSON.stringify(targetTable)}
                                      >
                                        转{targetTable.tableName}
                                      </Menu.Item>
                                    );
                                  }
                                )}
                              {<Menu.Item key={-1}>重新点菜</Menu.Item>}
                            </Menu>
                          }
                          wrapClassName="my-dropdown"
                          trigger={['click']}
                        >
                          <div className="button">
                            {table.targetTableName
                              ? table.targetTableName
                              : null}
                            <Icon type="down" />
                          </div>
                        </Dropdown>
                      </div>
                    );
                  })}
              </Scrollbars>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default ChangeDeskDishes;
