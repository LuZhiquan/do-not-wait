/**
* @author shelly
* @description 自定义菜
* @date 2017-05-23
**/
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert, Select, Checkbox } from 'antd';

import BeiZhu from '../../beizhu';

import { getJSON, digitalLimit } from 'common/utils';

import './user_defind_popup.less';

const Option = Select.Option;

@inject('dishesStore')
@observer
class UserDifineDishes extends React.Component {
  constructor(props) {
    super(props);
    this.getCategoryInfoList();
    this.getProductUnit();
    this.getProducePort();
    this.getStallWeigh();
  }

  state = {
    categoryList: [],
    unitList: [],
    portList: [],
    stallList: [],
    categoryFirstID: '',
    categorySecondID: '',
    stallID: '',
    productName: '',
    productUnit: '',
    needWeigh: false,
    expectedWeight: 0,
    price: '',
    portID: '',
    memo: ''
  };

  archiveID = JSON.parse(sessionStorage.getItem('account')).archiveID;
  tableID = this.props.tableID;
  subOrderID = this.props.subOrderID;

  //确定
  handleOk = () => {
    const { dishesStore } = this.props;
    const {
      categoryFirstID,
      categorySecondID,
      stallID,
      productName,
      productUnit,
      memo,
      price,
      needWeigh,
      expectedWeight
    } = this.state;
    if (!productName) {
      dishesStore.showFeedback({ status: 'validate', msg: '请输入名称！' });
    } else if (!categoryFirstID) {
      dishesStore.showFeedback({ status: 'validate', msg: '请选择商品分类！' });
    } else if (price <= 0) {
      dishesStore.showFeedback({ status: 'validate', msg: '请输入单价！' });
    } else {
      let unitName;
      this.state.unitList.forEach(unit => {
        if (unit.id === productUnit) unitName = unit.name;
      });

      const dishes = {
        cartRecordID: Math.floor(Math.random() * 10000000000),
        aLaCarteMethod: 684,
        quantity: 1,
        productType: 5, //临时菜
        categoryID: categorySecondID || categoryFirstID,
        stallID,
        productName,
        productUnit,
        unit: unitName,
        memo,
        price: price * 1,
        needWeigh,
        expectedWeight: needWeigh ? expectedWeight : 0
      };

      console.log(dishes);
      dishesStore.addTemporaryDishes(dishes);
      dishesStore.changeListKey({ key: 'willOrder' });
      this.props.handleClose && this.props.handleClose();
    }
  };

  //放弃
  handleCancel = () => {
    this.props.handleClose && this.props.handleClose();
  };

  //选择一级菜单
  handleCategoryFirst = value => {
    this.setState({
      categoryFirstID: value * 1,
      categorySecondID: ''
    });
  };

  //选择二级菜单
  handleCategorySecond = value => {
    this.setState({ categorySecondID: value * 1 });
  };

  //填写菜品名
  handleProductName = e => {
    this.setState({ productName: e.target.value.substr(0, 29) });
  };

  //选择单位
  handleUnit = value => {
    this.setState({ productUnit: value * 1 });
  };

  //选择是否称重
  handleNeedWeigh = e => {
    this.setState({
      needWeigh: !this.state.needWeigh,
      stallID: this.state.stallList.length
        ? this.state.stallList[0].stallID
        : ''
    });
  };

  //填写期望重量
  handleExpectedWeight = e => {
    this.setState({ expectedWeight: digitalLimit(e.target.value, 3, 2) });
  };

  //填写价格
  handlePrice = e => {
    this.setState({ price: digitalLimit(e.target.value, 5, 2) });
  };

  //选择出品口
  handlePort = value => {
    this.setState({ portID: value * 1 });
  };

  //选择称重档口
  handleStall = value => {
    this.setState({ stallID: value * 1 });
  };

  //输入备注
  handleMemo = memo => {
    this.setState({ memo });
  };

  //获取菜品分类列表
  getCategoryInfoList = () => {
    getJSON({
      url: '/reception/product/getCategoryInfoList',
      data: { tableID: this.tableID, subOrderID:  this.subOrderID},
      success: json => {
        if (json.code === 0 && json.data.length > 0) {
          this.setState({ categoryList: json.data });
        }
      }
    });
  };

  //获取单位列表
  getProductUnit = () => {
    getJSON({
      url: '/reception/product/getProductUnit',
      success: json => {
        if (json.code === 0 && json.data.length > 0) {
          this.setState({
            unitList: json.data,
            productUnit: json.data[0].id
          });
        }
      }
    });
  };

  //获取称重档口列表
  getStallWeigh = () => {
    getJSON({
      url: '/reception/product/getStallWeigh',
      data: { archiveID: this.archiveID },
      success: json => {
        if (json.code === 0 && json.data.length > 0) {
          this.setState({
            stallList: json.data
          });
        }
      }
    });
  };

  //获取出品口列表
  getProducePort = () => {
    getJSON({
      url: '/reception/product/getProducePort',
      data: { archiveID: this.archiveID },
      success: json => {
        if (json.code === 0 && json.data.length > 0) {
          this.setState({
            portList: json.data,
            portID: json.data[0].portID
          });
        }
      }
    });
  };

  render() {
    const { dishesStore } = this.props;
    const {
      categoryList,
      unitList,
      portList,
      stallList,
      categoryFirstID,
      categorySecondID,
      stallID,
      productName,
      productUnit,
      needWeigh,
      expectedWeight,
      price,
      portID,
      memo
    } = this.state;

    let categorySecondList = null;
    if (categoryFirstID) {
      categoryList.forEach(category => {
        if (
          category.categoryID === categoryFirstID &&
          category.children.length > 0
        ) {
          categorySecondList = category.children;
        }
      });
    }

    return (
      <div>
        <Modal
          title="临时菜"
          visible={true}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          width={640}
          wrapClassName="user-defind-popup-modal"
        >
          {dishesStore.feedback &&
            dishesStore.feedback.status === 'validate' && (
              <Alert
                message={dishesStore.feedback.msg}
                banner
                closable
                onClose={() => {
                  //关闭警告信息
                  dishesStore.closeFeedback();
                }}
              />
            )}
          <div className="guige">
            <div className="list">
              <p className="left-name">
                <i className="required-icon">*</i>名称
              </p>
              <div className="input-choose">
                <input
                  type="text"
                  value={productName}
                  onChange={this.handleProductName}
                />
              </div>
            </div>
            <div className="list">
              <p className="left-name">
                <i className="required-icon">*</i>商品分类
              </p>
              <div className="input-choose">
                <Select
                  value={categoryFirstID + ''}
                  style={{ width: 200 }}
                  onChange={this.handleCategoryFirst}
                >
                  {categoryList.map(category => {
                    return (
                      <Option
                        key={category.categoryID}
                        value={category.categoryID + ''}
                      >
                        {category.categoryName}
                      </Option>
                    );
                  })}
                </Select>
                <Select
                  value={categorySecondID + ''}
                  style={{ width: 200 }}
                  onChange={this.handleCategorySecond}
                  disabled={!categorySecondList}
                >
                  {categorySecondList &&
                    categorySecondList.map(category => {
                      return (
                        <Option
                          key={category.categoryID}
                          value={category.categoryID + ''}
                        >
                          {category.categoryName}
                        </Option>
                      );
                    })}
                </Select>
              </div>
            </div>
            <div className="list">
              <p className="left-name">单位</p>
              <div className="input-choose">
                <Select
                  value={productUnit + ''}
                  style={{ width: 200 }}
                  onChange={this.handleUnit}
                >
                  {unitList.map(unit => {
                    return (
                      <Option key={unit.id} value={unit.id + ''}>
                        {unit.name}
                      </Option>
                    );
                  })}
                </Select>
                <Checkbox checked={needWeigh} onChange={this.handleNeedWeigh}>
                  需要称重
                </Checkbox>
              </div>
            </div>
            {needWeigh && (
              <div className="list">
                <p className="left-name">期望重量</p>
                <div className="input-choose">
                  <input
                    type="number"
                    value={expectedWeight > 0 && expectedWeight}
                    onChange={this.handleExpectedWeight}
                  />
                </div>
              </div>
            )}
            {needWeigh && (
              <div className="list">
                <p className="left-name">称重档口</p>
                <div className="input-choose">
                  <Select
                    value={stallID + ''}
                    style={{ width: 200 }}
                    onChange={this.handleStall}
                  >
                    {stallList.map(stall => {
                      return (
                        <Option key={stall.stallID} value={stall.stallID + ''}>
                          {stall.stallName}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
            )}
            <div className="list">
              <p className="left-name">
                <i className="required-icon">*</i>单价
              </p>
              <div className="input-choose">
                <input
                  type="number"
                  value={price}
                  onChange={this.handlePrice}
                />
              </div>
            </div>
            {false && (
              <div className="list">
                <p className="left-name">出品口</p>
                <div className="input-choose">
                  <Select
                    value={portID + ''}
                    style={{ width: 200 }}
                    onChange={this.handlePort}
                  >
                    {portList.map(port => {
                      return (
                        <Option key={port.portID} value={port.portID + ''}>
                          {port.portName}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
            )}
            <div className="list">
              <p className="left-name">备注</p>
              <div className="input-choose">
                <BeiZhu memo={memo} onEntry={this.handleMemo} />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default UserDifineDishes;
