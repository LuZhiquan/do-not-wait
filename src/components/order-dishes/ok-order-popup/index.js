import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert, Button, Tabs } from 'antd';
import classnames from 'classnames';

import MyScroll from 'components/my-scrollbar'; //横向滚动条
import VerticalTabs from 'components/vertical-tabs'; //竖向滚动条
import ChangeNumber from 'components/change-number';
import ChangeNumberBar from '../change-number-bar';
import CommonKeyboard from '../common-keyboard';
import PromptPopup from 'components/prompt-popup';
import AccreditPopup from 'components/accredit-popup'; //授权弹出层
import AddOrderPopup from 'components/order-dishes/add-order-validation-popup'; //下单不成功提示弹窗
import { getJSON, getStrSize, checkPermission } from 'common/utils';

import './ok_order_popup.css';

const TabPane = Tabs.TabPane;
const commonFooter = ({ _this, handleOk, handleCancel }) => {
  return [
    <Button key="back" size="large" onClick={handleCancel}>
      取消
    </Button>,
    <Button
      key="submit1"
      size="large"
      onClick={handleOk}
      className="ant-btn-primary"
    >
      确定
    </Button>
  ];
};
const returnDishesFooter = ({ _this, handleOk, handleCancel }) => {
  return [
    <Button key="back" size="large" onClick={handleCancel}>
      取消
    </Button>,
    <Button
      key="submit"
      size="large"
      className="other-botton"
      onClick={e => {
        handleOk({ revocationType: 1 });
      }}
    >
      报损退菜
    </Button>,
    <Button
      key="submit2"
      size="large"
      onClick={handleOk}
      className="ant-btn-primary"
    >
      仅退菜
    </Button>
  ];
};

//未下单弹窗
@inject('dishesStore')
@observer
class OkOrderPopup extends React.Component {
  //获取权限

  state = {
    permissionList: sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account')).permissionList
      : [],
    type: this.props.dishes.recordID ? 'return' : 'add', //操作类型
    exchangeType: '0',
    floatQuantity: this.props.dishes.floatQuantity, //称重菜品数量
    weight: '', //重量
    addQuantity: 1, //加菜数量
    returnQuantity: 0, //退菜数量
    handselQuantity: 1, //赠菜数量
    transferQuantity: 1, //转菜数量
    backType: '', //退菜类型
    returnReason: '', //退菜原因
    handselReason: '', //赠菜原因
    status: '', //厨房状态
    tag: '', //催菜标签
    changeMenuID: '', //要换成的菜品ID
    specificationID: '', //要换成的规格
    transferOrderID: '', //要转菜过去的桌台订单号
    samePriceFoodList: [], //同价菜品列表
    notSamePriceFoodList: [], //不同价菜品列表
    notStandardFoodList: [], //不同规格菜品列表
    usingTableList: [], //使用桌台列表
    accreditPopup: false,
    statePopup: false
  };

  //确定
  handleOk = ({ revocationType }) => {
    let { dishesStore, dishes } = this.props;
    switch (this.state.type) {
      case 'weigh':
        //称重
        if (this.state.weight) {
          dishesStore.updateWeigh([
            {
              orderDetailID: dishes.detailID,
              quantity: dishes.quantity,
              weight: this.state.weight
            }
          ]);
        } else {
          dishesStore.showFeedback({ status: 'validate', msg: '称重不能为空或0！' });
          return;
        }
        break;
      case 'add':
        //加菜
        if (this.state.addQuantity || this.state.floatQuantity) {
          let dishesName = dishes.recordID
            ? dishes.comboName
            : dishes.productName;
          //加菜二次确认
          this.setState({
            statePopup: (
              <PromptPopup
                onOk={() => {
                  dishesStore.addDishes({
                    detailID: dishes.detailID,
                    recordID: dishes.recordID,
                    menuID: dishes.menuID,
                    quantity: this.state.addQuantity,
                    failure: data => {
                      this.setState({
                        statePopup: (
                          <AddOrderPopup
                            data={data}
                            handleClose={() => {
                              this.setState({ statePopup: false });
                            }}
                          />
                        )
                      });
                    },
                    complete: () => {
                      this.props.okClick && this.props.okClick();
                    }
                  });
                }}
                onCancel={() => {
                  this.setState({ statePopup: false });
                }}
              >
                <div className="prompt-cont">
                  确定增加【<strong style={{ padding: '5px', color: '#F00' }}>
                    {dishesName}
                  </strong>】{this.state.addQuantity}份？
                </div>
              </PromptPopup>
            )
          });
        } else {
          dishesStore.showFeedback({ status: 'validate', msg: '加菜数量必须大于0！' });
          return;
        }
        break;
      case 'return':
        //退菜
        if (this.state.returnQuantity < 1) {
          dishesStore.showFeedback({ status: 'validate', msg: '请选择退菜数量！' });
          return;
        }
        if (!this.state.returnReason && !this.state.returnMemo) {
          dishesStore.showFeedback({ status: 'validate', msg: '请选择退菜原因！' });
          return;
        }
        let object = {
          moduleCode: 'OrderModule',
          privilegeCode: 'Retreatfood',
          title: '退菜',
          toDoSomething: () => {
            dishesStore.returnDishes({
              menuID: dishes.menuID,
              quantity: this.state.returnQuantity,
              detailID: dishes.detailID,
              memo: this.state.returnReason || this.state.returnMemo,
              revocationType,
              backType: this.state.backType
            });
            this.props.okClick && this.props.okClick();
          },
          closePopup: () => {
            this.setState({ accreditPopup: false });
          },
          failed: () => {
            this.setState({
              accreditPopup: (
                <AccreditPopup
                  module={{
                    title: object.title,
                    moduleCode: object.moduleCode,
                    privilegeCode: object.privilegeCode
                  }}
                  onOk={() => {
                    object.closePopup();
                    object.toDoSomething();
                  }}
                  onCancel={() => {
                    object.closePopup();
                  }}
                />
              )
            });
          }
        };
        checkPermission(object);
        break;
      case 'handsel':
        //赠菜
        if (this.state.handselReason || this.state.handselMemo) {
          let object = {
            moduleCode: 'OrderModule',
            privilegeCode: 'PresenteDish',
            title: '赠菜',
            toDoSomething: () => {
              dishesStore.handselDishes({
                menuID: dishes.menuID,
                quantity: this.state.handselQuantity,
                detailID: dishes.detailID,
                memo: this.state.handselReason || this.state.handselMemo,
                floatQuantity: dishes.floatQuantity
              });
              this.props.okClick && this.props.okClick();
            },
            closePopup: () => {
              this.setState({ accreditPopup: '' });
            },
            failed: () => {
              this.setState({
                accreditPopup: (
                  <AccreditPopup
                    module={{
                      title: object.title,
                      moduleCode: object.moduleCode,
                      privilegeCode: object.privilegeCode
                    }}
                    onOk={() => {
                      object.closePopup();
                      object.toDoSomething();
                    }}
                    onCancel={() => {
                      object.closePopup();
                    }}
                  />
                )
              });
            }
          };
          checkPermission(object);
        } else {
          dishesStore.showFeedback({ status: 'validate', msg: '请选择赠菜原因！' });
          return;
        }
        break;
      case 'cancelHandsel':
        dishesStore.cancelHandselDishes({
          detailID: dishes.detailID
        });
        break;
      case 'status':
        //厨房状态
        if (this.state.status === '等叫') {
          dishesStore.socalled({
            socalledList: [
              {
                detailID: dishes.detailID,
                recordID: dishes.recordID
              }
            ]
          });
        } else if (this.state.status === '叫起') {
          dishesStore.wakeUp({
            wakeUpList: [
              {
                detailID: dishes.detailID,
                recordID: dishes.recordID
              }
            ]
          });
        }
        if (this.state.tag === '22') {
          let merchantTagMappings = [
            {
              detailID: dishes.detailID,
              tagIDs: '22'
            }
          ];
          if (dishes.combo) {
            merchantTagMappings.comboDetailList = [
              {
                recordID: dishes.detailID,
                tagIDs: '22'
              }
            ];
          }
          dishesStore.markTag(merchantTagMappings);
        }
        break;
      case 'exchange':
        //换菜
        switch (this.state.exchangeType) {
          case '0':
            if (this.state.changeMenuID) {
              //同价换菜
              dishesStore.exchangeSameFood({
                detailID: dishes.detailID,
                menuID: dishes.menuID,
                changeMenuID: this.state.changeMenuID
              });
            } else {
              dishesStore.showFeedback({
                status: 'validate',
                msg: '请选择要换的菜品！'
              });
              return;
            }
            break;
          case '2':
            if (this.state.specificationID) {
              //不同规格换菜
              dishesStore.exchangeNotSameOptionFood({
                detailID: dishes.detailID,
                menuID: dishes.menuID,
                specificationID: this.state.specificationID
              });
            } else {
              dishesStore.showFeedback({
                status: 'validate',
                msg: '请选择要换的规格！'
              });
              return;
            }
            break;
          default:
        }

        break;
      case 'transfer':
        //转菜
        if (this.state.transferOrderID) {
          dishesStore.exchangeFoodTable({
            detailID: dishes.detailID,
            quantity: this.state.transferQuantity,
            subOrderID: this.state.transferOrderID
          });
        } else {
          dishesStore.showFeedback({ status: 'validate', msg: '请选择要转的桌台！' });
          return;
        }
        break;
      default:
    }

    if (
      this.state.type !== 'handsel' &&
      this.state.type !== 'add' &&
      this.state.type !== 'return'
    ) {
      this.props.okClick && this.props.okClick();
    }
  };
  //放弃
  handleCancel = () => {
    this.props.cancelClick && this.props.cancelClick();
  };

  componentDidMount() {
    this.setState({
      footer: commonFooter({
        _this: this,
        handleOk: this.handleOk,
        handleCancel: this.handleCancel
      })
    });

    if (this.props.dishes.recordID) {
      this.getReturnReasonList();
    }
  }

  //获取已下单或者正在使用的桌台列表
  getUsingTableList(tableName) {
    let { dishesStore } = this.props;
    let tableID = JSON.parse(sessionStorage.getItem('selectedTableList'))[0]
      .tableID;
    let subOrderID = JSON.parse(sessionStorage.getItem('selectedTableList'))[0]
      .subOrderID;
    let _this = this;
    getJSON({
      url: '/reception/product/searchTables',
      data: { tableID, tableName, subOrderID },
      success: function(json) {
        if (json.code === 0) {
          _this.setState({ usingTableList: json.data });
        } else {
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //获取退菜原因列表
  getReturnReasonList() {
    let { dishesStore } = this.props;
    let _this = this;
    getJSON({
      url: '/reception/product/getRevocationFood',
      success: function(json) {
        if (json.code === 0) {
          _this.setState({
            returnReasonList: json.data
          });
        } else {
          //获取失败反馈
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  //获取赠菜原因列表
  getHandselReasonList() {
    let { dishesStore } = this.props;
    let _this = this;
    getJSON({
      url: '/reception/product/getPresentFood',
      success: function(json) {
        if (json.code === 0) {
          _this.setState({
            handselReasonList: json.data
          });
        } else {
          //获取失败反馈
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  getFoodList(productName) {
    let { dishesStore, dishes } = this.props;
    let _this = this;
    //获取同价菜单列表
    getJSON({
      url: '/order/food/getSamePriceFood',
      data: {
        menuID: dishes.menuID,
        productName
      },
      success: function(json) {
        if (json.code === 0) {
          _this.setState({ samePriceFoodList: json.data });
        } else {
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
    //获取不同价菜单列表
    getJSON({
      url: '/order/food/getNotSamePriceFood',
      data: {
        menuID: dishes.menuID,
        productName
      },
      success: function(json) {
        if (json.code === 0) {
          _this.setState({ notSamePriceFoodList: json.data });
        } else {
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
    //获取不同规格菜单列表
    getJSON({
      url: '/order/food/getNotStandardFood',
      data: {
        menuID: dishes.menuID
      },
      success: function(json) {
        if (json.code === 0) {
          _this.setState({ notStandardFoodList: json.data });
        } else {
          dishesStore.showFeedback({ status: 'warn', msg: json.message });
        }
      }
    });
  }

  componentWillUnmount() {
    this.props.dishesStore.closeFeedback();
  }

  render() {
    let { dishesStore, dishes } = this.props;
    let {
      permissionList,
      type,
      handselReasonList,
      handselReason,
      returnReasonList,
      returnReason,
      usingTableList,
      tableID,
      backType,
      addQuantity
    } = this.state;

    let dishesName = dishes.recordID ? dishes.comboName : dishes.productName; //菜品名称

    // let ableQuantity = dishes.quantity; //可操作数量
    let ableHandselQuantity = dishes.quantity; //可赠数量
    dishesStore.didOrderList.orderProductList &&
      dishesStore.didOrderList.orderProductList.length &&
      dishesStore.didOrderList.orderProductList.forEach(product => {
        if (product.parentID === dishes.detailID) {
          // ableQuantity += product.quantity;
          if (product.aLaCarteMethod !== 686)
            ableHandselQuantity += product.quantity;
        }
      });

    return (
      <Modal
        title={dishesName}
        visible={true}
        maskClosable={false}
        width={840}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={this.state.footer}
        wrapClassName="ok-order-popup-modal"
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
        <Tabs
          defaultActiveKey={type}
          onChange={key => {
            dishesStore.closeFeedback();
            this.setState({ type: key });

            if (key === 'return') {
              this.setState({
                footer: returnDishesFooter({
                  _this: this,
                  handleOk: this.handleOk,
                  handleCancel: this.handleCancel
                })
              });
            } else {
              this.setState({
                footer: commonFooter({
                  _this: this,
                  handleOk: this.handleOk,
                  handleCancel: this.handleCancel
                })
              });
            }
            if (key === 'exchange') {
              this.getFoodList();
            } else if (key === 'transfer') {
              this.getUsingTableList();
            } else if (key === 'handsel') {
              this.getHandselReasonList();
            } else if (key === 'return') {
              this.getReturnReasonList();
            }
          }}
        >
          {false && (
            <TabPane tab="称重" key="weigh">
              <div className="cheng-zhong-block">
                <div className="chengzhong-title">
                  <input
                    type="text"
                    className="result"
                    readOnly
                    value={this.state.weight}
                  />
                  <p className="danwei">单位：{dishes.unit}</p>
                </div>
                <CommonKeyboard
                  getResult={value => {
                    this.setState({ weight: value * 1 });
                  }}
                />
              </div>
            </TabPane>
          )}

          {!dishes.recordID && (
            <TabPane tab="加菜" key="add">
              <div className="cancle-zeng-cai-block">
                <div className="cancle-zeng-cai-title">
                  {!dishes.needWeigh && (
                    <div className="cancel-zeng-left">
                      已点<i>{dishes.quantity}</i>份
                    </div>
                  )}
                  <div className="cancel-zeng-right">
                    新增{dishes.needWeigh ? (
                      1
                    ) : (
                      <input
                        type="text"
                        value={this.state.addQuantity}
                        readOnly
                      />
                    )}份
                    {dishes.needWeigh &&
                      `,每份${dishes.floatQuantity}${dishes.unit}`}
                  </div>
                </div>
                {!dishes.needWeigh && (
                  <CommonKeyboard
                    getValue={value => {
                      addQuantity = String(addQuantity);
                      if (typeof value === 'undefined') {
                        this.setState({
                          addQuantity: addQuantity.substr(
                            0,
                            addQuantity.length - 1
                          )
                        });
                      } else {
                        if (value !== '.' && addQuantity.length < 3) {
                          this.setState({
                            addQuantity: Number(addQuantity + value)
                          });
                        }
                      }
                    }}
                  />
                )}
              </div>
            </TabPane>
          )}

          {dishes.aLaCarteMethod !== 686 && (
            <TabPane tab="退菜" key="return">
              <div className="tui-diao-block">
                <ul className="change-number-bar">
                  {['已上菜', '未上菜'].map(text => {
                    let min, max, type;
                    switch (text) {
                      case '已上菜':
                        max = dishes.canRetAlreadyNum;
                        type = 1351;
                        break;
                      case '未上菜':
                        max = dishes.canRetNotNum;
                        type = 1352;
                        break;
                      default:
                    }
                    min = max > 0 ? 1 : 0;
                    return (
                      <ChangeNumberBar
                        key={text}
                        min={min}
                        max={max}
                        backType={backType}
                        enabled={backType === type}
                        changeNumber={value => {
                          this.setState({ returnQuantity: value });
                        }}
                      >
                        <div
                          className="zhuang-left"
                          onClick={() => {
                            this.setState({
                              backType: type,
                              returnQuantity: min
                            }); //退菜方式
                          }}
                        >
                          <i
                            className={classnames({
                              'iconfont icon-yuan': true,
                              'icon-yes': backType === type
                            })}
                          />
                          {text}可退
                          <i className="red">{max}</i>份
                        </div>
                      </ChangeNumberBar>
                    );
                  })}
                </ul>
                {false && (
                  <div className="tui-scoll">
                    <MyScroll width={800} height={178} hasAllSelected>
                      <li className="tui-cai-block" onClick={e => {}}>
                        <div className="tui_name">青椒肉丝</div>
                        <div className="tui-left">
                          可退<i className="red">{this.state.number}</i>份
                        </div>
                        <div className="number">
                          <i
                            className="iconfont icon-jian"
                            onClick={this.jianClick}
                          />
                          {this.state.number}
                          <i
                            className="iconfont icon-jia"
                            onClick={this.jiaClick}
                          />
                        </div>
                      </li>
                      <li className="tui-cai-block">
                        <div className="tui_name">青椒肉丝</div>
                        <div className="tui-left">
                          可退<i className="red">{this.state.number}</i>份
                        </div>
                        <div className="number">
                          <i
                            className="iconfont icon-jian"
                            onClick={this.jianClick}
                          />
                          {this.state.number}
                          <i
                            className="iconfont icon-jia"
                            onClick={this.jiaClick}
                          />
                        </div>
                      </li>
                      <li className="tui-cai-block">
                        <div className="tui_name">青椒肉丝</div>
                        <div className="tui-left">
                          可退<i className="red">{this.state.number}</i>份
                        </div>
                        <div className="number">
                          <i
                            className="iconfont icon-jian"
                            onClick={this.jianClick}
                          />
                          {this.state.number}
                          <i
                            className="iconfont icon-jia"
                            onClick={this.jiaClick}
                          />
                        </div>
                      </li>
                      <li className="tui-cai-block">
                        <div className="tui_name">青椒肉丝</div>
                        <div className="tui-left">
                          可退<i className="red">{this.state.number}</i>份
                        </div>
                        <div className="number">
                          <i
                            className="iconfont icon-jian"
                            onClick={this.jianClick}
                          />
                          {this.state.number}
                          <i
                            className="iconfont icon-jia"
                            onClick={this.jiaClick}
                          />
                        </div>
                      </li>
                    </MyScroll>
                  </div>
                )}
                <div className="tui-scoll mar-top">
                  <div className="select-header">退菜原因</div>
                  <MyScroll width={800} height={143}>
                    {returnReasonList &&
                      !!returnReasonList.length &&
                      returnReasonList.map((reason, index) => {
                        return (
                          <li
                            key={reason.reasonID}
                            className={classnames({
                              'cause-btns': true,
                              'btn-active': reason.reason === returnReason
                            })}
                            onClick={() => {
                              this.setState({
                                returnMemo: '',
                                returnReason: reason.reason
                              });
                            }}
                          >
                            {reason.reason}
                          </li>
                        );
                      })}
                  </MyScroll>
                </div>
                <textarea
                  type="text"
                  placeholder="可输入自定义退菜原因, 限100字内"
                  className="cursor-input"
                  value={this.state.returnMemo}
                  onChange={e => {
                    let memo = e.target.value.substr(0, 100);
                    this.setState({
                      returnMemo: memo,
                      returnReason: memo
                    });
                  }}
                />
              </div>
              {this.state.accredit}
            </TabPane>
          )}

          {dishes.aLaCarteMethod !== 686 && (
            <TabPane tab="赠菜" key="handsel">
              <div className="zeng-cai-block">
                <ChangeNumber
                  min={1}
                  max={ableHandselQuantity}
                  onChange={value => {
                    this.setState({ handselQuantity: value });
                  }}
                >
                  <div className="zhuang-left">
                    可赠<i className="red">{ableHandselQuantity}</i>份
                  </div>
                </ChangeNumber>
                <div className="select-items">
                  <div className="select-zeng-header">赠菜原因</div>
                  <MyScroll width={798} height={148}>
                    {handselReasonList &&
                      !!handselReasonList.length &&
                      handselReasonList.map((reason, index) => {
                        return (
                          <li
                            key={reason.reasonID}
                            className={classnames({
                              'cause-btns': true,
                              'btn-active': reason.reason === handselReason
                            })}
                            onClick={() => {
                              this.setState({
                                handselMemo: '',
                                handselReason: reason.reason
                              });
                            }}
                          >
                            {reason.reason}
                          </li>
                        );
                      })}
                  </MyScroll>
                </div>
                <textarea
                  type="text"
                  placeholder="可输入自定义赠菜原因, 限100字内"
                  className="cursor-input"
                  value={this.state.handselMemo}
                  onChange={e => {
                    let memo = e.target.value.substr(0, 100);
                    this.setState({
                      handselMemo: memo,
                      handselReason: memo
                    });
                  }}
                />
              </div>
            </TabPane>
          )}

          {dishes.aLaCarteMethod === 686 && (
            <TabPane tab="取消赠菜" key="cancelHandsel">
              <div className="cancle-zeng-cai-block">
                <div className="cancle-zeng-cai-title">
                  {!dishes.needWeigh && (
                    <div className="cancel-zeng-left">
                      取消赠菜<i>{dishes.quantity}</i>份
                    </div>
                  )}
                </div>
              </div>
            </TabPane>
          )}

          <TabPane tab="厨房状态" key="status">
            <div className="kitchen-state">
              {dishes.produceStatus === 694 && (
                <div
                  className={classnames({
                    'myBtn-277-44': true,
                    'btn-active': this.state.status === '叫起'
                  })}
                  onClick={() => {
                    this.setState({
                      status: '叫起',
                      tag: ''
                    });
                  }}
                >
                  叫起
                </div>
              )}
              {dishes.produceStatus !== 694 && (
                <div
                  className={classnames({
                    'myBtn-277-44': true,
                    'btn-active': this.state.status === '等叫',
                    disabled:
                      dishes.produceStatus === 982 ||
                      (dishes.tagIDs &&
                        (dishes.tagIDs.indexOf('22') > -1 ||
                          dishes.tagIDs.indexOf('21') > -1))
                  })}
                  onClick={() => {
                    if (
                      dishes.produceStatus !== 982 &&
                      (!dishes.tagIDs ||
                        (dishes.tagIDs.indexOf('22') < 0 &&
                          dishes.tagIDs.indexOf('21') < 0))
                    ) {
                      this.setState({
                        status: '等叫',
                        tag: ''
                      });
                    }
                  }}
                >
                  等叫
                </div>
              )}
              <div
                className={classnames({
                  'myBtn-277-44': true,
                  'btn-active': this.state.tag === '22',
                  disabled:
                    dishes.produceStatus === 982 ||
                    (dishes.tagIDs && dishes.tagIDs.indexOf('22') > -1) //等叫,催菜和已上菜等情况下不能催菜
                })}
                onClick={() => {
                  if (
                    dishes.produceStatus !== 982 &&
                    !(dishes.tagIDs && dishes.tagIDs.indexOf('22') > -1)
                  ) {
                    this.setState({
                      status: '',
                      tag: '22'
                    }); //催菜
                  }
                }}
              >
                催菜
              </div>
            </div>
          </TabPane>

          {false && (
            <TabPane tab="换菜" key="exchange">
              <div className="zhuan-zeng-block">
                <div className="zhuan-content">
                  <div className="zhuan-content-search">
                    <input
                      type="text"
                      placeholder="请输入菜品名称进行查询"
                      onKeyUp={e => {
                        this.getFoodList(e.target.value);
                      }}
                    />
                    <i className="iconfont icon-order_btn_search" />
                  </div>
                  <VerticalTabs
                    itemClick={key => {
                      this.setState({ exchangeType: key });
                      if (key === '1') {
                        this.setState({
                          footer: [
                            <Button
                              key="back"
                              size="large"
                              onClick={this.handleCancel}
                              className="no-cancel"
                            >
                              取消
                            </Button>,
                            <Button
                              key="submit"
                              size="large"
                              className="other-botton"
                              onClick={() => {
                                //不同价按同价换菜
                                dishesStore.exchangeSamePriceFood({
                                  detailID: dishes.detailID,
                                  menuID: dishes.menuID,
                                  changeMenuID: this.state.changeMenuID
                                });
                                this.handleOk();
                              }}
                            >
                              按原价格换菜
                            </Button>,
                            <Button
                              key="submit2"
                              size="large"
                              onClick={() => {
                                //不同价按新价换菜
                                dishesStore.exchangeNotSamePriceFood({
                                  detailID: dishes.detailID,
                                  menuID: dishes.menuID,
                                  changeMenuID: this.state.changeMenuID
                                });
                                this.handleOk();
                              }}
                              className="other-botton"
                            >
                              用新价格换菜
                            </Button>
                          ]
                        });
                      } else {
                        this.setState({
                          footer: [
                            <Button
                              key="back"
                              size="large"
                              onClick={this.handleCancel}
                              className="no-cancel"
                            >
                              取消
                            </Button>,
                            <Button
                              key="submit1"
                              size="large"
                              onClick={this.handleOk}
                              className="other-botton"
                            >
                              确定
                            </Button>
                          ]
                        });
                      }
                    }}
                  >
                    <TabPane tab="同价菜" key="0">
                      <MyScroll width={638} height={292}>
                        {!!this.state.samePriceFoodList.length &&
                          this.state.samePriceFoodList.map((food, index) => {
                            return (
                              <li
                                key={index}
                                className={classnames({
                                  'zhuan-item': true,
                                  iconfont: true,
                                  mask: false,
                                  select: food.selected
                                })}
                                onClick={() => {
                                  let samePriceFoodList = this.state.samePriceFoodList.map(
                                    dishes => {
                                      dishes.selected =
                                        dishes.menuID === food.menuID;
                                      return dishes;
                                    }
                                  );
                                  this.setState({
                                    samePriceFoodList,
                                    changeMenuID: food.menuID
                                  });
                                }}
                              >
                                <div className="table-name">
                                  <p>{food.productName}</p>
                                  <p>
                                    <span className="you-hui">惠</span>{' '}
                                    <span className="tui-jian">荐</span>
                                  </p>
                                </div>
                                <div className="table-price">
                                  <span>
                                    ¥{food.price}/{food.unit}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                      </MyScroll>
                    </TabPane>
                    <TabPane tab="不同价菜" key="1">
                      <MyScroll width={638} height={292}>
                        {!!this.state.notSamePriceFoodList.length &&
                          this.state.notSamePriceFoodList.map((food, index) => {
                            return (
                              <li
                                key={index}
                                className={classnames({
                                  'zhuan-item': true,
                                  iconfont: true,
                                  mask: false,
                                  select: food.selected
                                })}
                                onClick={() => {
                                  let notSamePriceFoodList = this.state.notSamePriceFoodList.map(
                                    dishes => {
                                      dishes.selected =
                                        dishes.menuID === food.menuID;
                                      return dishes;
                                    }
                                  );
                                  this.setState({
                                    notSamePriceFoodList,
                                    changeMenuID: food.menuID
                                  });
                                }}
                              >
                                <div className="table-name ">
                                  <p>{food.productName}</p>
                                  <p>
                                    <span className="you-hui">惠</span>{' '}
                                    <span className="tui-jian">荐</span>
                                  </p>
                                </div>
                                <div className="table-price">
                                  <span>
                                    ¥{food.price}/{food.unit}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                      </MyScroll>
                    </TabPane>
                    <TabPane tab="不同规格菜" key="2">
                      <MyScroll width={638} height={292}>
                        <div className="howprice-state">
                          {!!this.state.notStandardFoodList.length &&
                            this.state.notStandardFoodList.map(
                              (food, index) => {
                                return (
                                  <div
                                    key={index}
                                    className={classnames({
                                      'myBtn-277-44': true,
                                      'btn-active': food.selected
                                    })}
                                    onClick={() => {
                                      let notStandardFoodList = this.state.notStandardFoodList.map(
                                        dishes => {
                                          dishes.selected =
                                            dishes.optionID === food.optionID;
                                          return dishes;
                                        }
                                      );
                                      this.setState({
                                        notStandardFoodList,
                                        specificationID: food.specificationID
                                      });
                                    }}
                                  >
                                    {food.price}元/{food.specificationName}
                                  </div>
                                );
                              }
                            )}
                        </div>
                      </MyScroll>
                    </TabPane>
                  </VerticalTabs>
                </div>
              </div>
            </TabPane>
          )}

          {dishes.canTurnProductNum > 0 &&
            permissionList.includes('OrderModule:Turndish') &&
            !dishes.recordID && (
              <TabPane tab="转菜" key="transfer">
                <div className="zhuan-zeng-cai-block">
                  <ChangeNumber
                    min={1}
                    max={dishes.canTurnProductNum}
                    onChange={value => {
                      this.setState({ transferQuantity: value });
                    }}
                  >
                    <div className="zhuang-left">
                      可转<i className="red">{dishes.canTurnProductNum}</i>份
                    </div>
                  </ChangeNumber>
                  <div className="zhuan-content">
                    <div className="zhuan-content-search">
                      <input
                        type="text"
                        placeholder="请输入桌台名称进行查询"
                        onKeyUp={e => {
                          this.getUsingTableList(e.target.value);
                        }}
                      />
                      <i className="iconfont icon-order_btn_search" />
                    </div>
                    {usingTableList && !!Object.keys(usingTableList).length ? (
                      <VerticalTabs>
                        {Object.keys(usingTableList).map((key, index) => {
                          return (
                            <TabPane tab={key} key={index}>
                              <MyScroll height={222} hasAllSelected={false}>
                                {!!usingTableList[key].length &&
                                  usingTableList[key].map((table, index) => {
                                    let tableName =
                                      table.shareTableName &&
                                      table.tableName !== table.shareTableName
                                        ? table.tableName +
                                          '-' +
                                          table.shareTableName
                                        : table.tableName;
                                    return (
                                      <li
                                        key={index}
                                        className={classnames({
                                          'zhuan-cai-item': true,
                                          iconfont: true,
                                          mask: false,
                                          select:
                                            table.tableID === tableID &&
                                            this.state.tableName === tableName
                                        })}
                                        onClick={() => {
                                          this.setState({
                                            tableID: table.tableID,
                                            tableName,
                                            transferOrderID: table.subOrderID
                                          });
                                        }}
                                      >
                                        <h3
                                          className={classnames({
                                            'table-name': true,
                                            small: getStrSize(tableName) > 9
                                          })}
                                        >
                                          {tableName}
                                        </h3>
                                        <p>
                                          {table.customerNumber}/{table.defaultPerson}
                                        </p>
                                      </li>
                                    );
                                  })}
                              </MyScroll>
                            </TabPane>
                          );
                        })}
                      </VerticalTabs>
                    ) : (
                      <div className="empty-holder">暂无相关桌台</div>
                    )}
                  </div>
                </div>
              </TabPane>
            )}
        </Tabs>
        {this.state.accreditPopup}
        {this.state.statePopup}
      </Modal>
    );
  }
}

export default OkOrderPopup;
