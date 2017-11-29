import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Alert } from 'antd';
import classnames from 'classnames';
import MyScroll from 'react-custom-scrollbars';

import './select_meal_popup.css';

@inject('dineStore')
@observer
class SelectMealsPopup extends Component {
  state = {
    mealsID: ''
  };

  handleOk = e => {
    let { dineStore } = this.props;
    if (this.state.mealsID) {
      let tableIDs = [];
      let numbers = [];
      dineStore.selectedTableList.forEach(table => {
        table.tableID && tableIDs.push(table.tableID);
        table.customerNumber && numbers.push(table.customerNumber);
      });
      let openTableData = {
        'tableIDs[]': tableIDs,
        'customerNumbers[]': numbers,
        mealsID: this.state.mealsID
      };
      dineStore.openTable(openTableData);
      dineStore.clearMealList();
    } else {
      dineStore.showFeedback({ status: 'validate', msg: '请选择餐次！' });
    }
  };

  handleCancel = e => {
    this.props.dineStore.clearMealList();
  };

  render() {
    let { dineStore } = this.props;
    return (
      <Modal
        title="请选择餐次"
        visible={true}
        maskClosable={false}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText="确定"
        cancelText="取消"
        width={510}
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
        <div className="choose_meals">
          <MyScroll>
            {dineStore.mealList && dineStore.mealList.length ? (
              <ul className="meals-list">
                {dineStore.mealList.map((meals, index) => {
                  return (
                    <li
                      key={meals.mealsID}
                      className={classnames({
                        selected: meals.mealsID === this.state.mealsID
                      })}
                      onClick={() => {
                        this.setState({ mealsID: meals.mealsID });
                      }}
                    >
                      {meals.mealName}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-holder">暂无相关桌台</div>
            )}
          </MyScroll>
        </div>
      </Modal>
    );
  }
}

export default SelectMealsPopup;
