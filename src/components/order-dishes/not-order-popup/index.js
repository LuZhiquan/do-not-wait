import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Alert, Tabs, Rate } from 'antd';
import classnames from 'classnames';

import CommonKeyboard from '../common-keyboard';
import MyScroll from 'components/my-scrollbar';
import VerticalTabs from 'components/vertical-tabs';
import ChangeNumber from 'components/change-number';
import Kouwei from '../kouwei';
import BeiZhu from '../beizhu';

import AccreditPopup from 'components/accredit-popup'; //授权弹出层
import { getJSON, getStrSize, checkPermission } from 'common/utils';

import './not_order_popup.css';

const TabPane = Tabs.TabPane;

//未下单弹窗
@inject('dishesStore')
@observer
class NotOrderPopup extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { dishesStore, dishes } = props;

    const productMessage =
      dishesStore.productMessageMap[dishes.cartRecordID] || {};
    let isCombo = dishes.mappingID || dishes.settingID;

    let activeKey = isCombo ? 'tag' : 'quantity';
    if (productMessage) {
      const {
        specificationList, //规格可选列表
        attributeMap, //口味做法可选列表
        designers //厨师可选列表
      } = productMessage;
      if (!isCombo) {
        activeKey = 'quantity';
      } else if (specificationList && !!specificationList.length) {
        activeKey = 'specification';
      } else if (attributeMap && Object.keys(attributeMap).length) {
        activeKey = 'attribute';
      } else if (designers && !!designers.length) {
        activeKey = 'designer';
      }
    }

    if (dishes.productType === 5 && !productMessage.weight) {
      //当是临时菜的时候设置weight
      productMessage.weight = dishes.expectedWeight;
    }

    this.state = {
      isCombo,
      permissionList: sessionStorage.getItem('account')
        ? JSON.parse(sessionStorage.getItem('account')).permissionList
        : [],
      ...productMessage,
      type: activeKey,
      memo: dishes.memo,
      handselQuantity: 1, //赠菜数量
      mappingDesc: dishes.mappingDesc, //赠菜原因
      quantity: dishes.quantity,
      designerID: dishes.designerID,
      designerName: dishes.designerName,
      designerPrice: dishes.designerPrice,
      inputType: dishes.needWeigh ? 'weight' : 'quantity',
      accreditPopup: null
    };
  }

  //确定
  handleOk = () => {
    const {
      dishesStore,
      dishes,
      parents,
      isSpellChild,
      closeHandle
    } = this.props;
    const cartRecordID = dishes.cartRecordID;
    const isSpellDishes = dishes.productMode === 1377;
    const {
      type,
      attributeMap,
      selectedAttributeList,
      memo,
      optionID,
      optionName,
      optionPrice,
      quantity,
      weight,
      designerID,
      designerName,
      designerPrice,
      tagIDs,
      produceStatus,
      handselReason,
      mappingDesc,
      handselQuantity,
      tableID,
      tableName,
      price
    } = this.state;

    switch (type) {
      case 'specification':
        //修改规格
        dishesStore.updateProductToCart({
          cartRecordID,
          optionID,
          optionName,
          optionPrice
        });
        break;
      case 'quantity':
        //修改数量
        if (!Number(quantity)) {
          dishesStore.showFeedback({
            status: 'validate',
            msg: '请输入数量！'
          });
          return;
        }
        if (dishes.needWeigh && !Number(weight)) {
          dishesStore.showFeedback({
            status: 'validate',
            msg: '请输入重量！'
          });
          return;
        }

        let changeQuantity = dishes.expectedWeight
          ? weight - dishes.expectedWeight
          : quantity - dishes.quantity;

        if (isSpellDishes) {
          //拼菜
          //减少菜品数量
          const list = dishes.assortedDishesList.map(dishes => {
            return {
              productID: dishes.productID,
              variantID: dishes.variantID,
              optionID: dishes.optionID,
              quantity: changeQuantity * dishes.quantity
            };
          });
          dishesStore.updateShoppingCartForAssortedDishes(list).then(() => {
            dishesStore.updateProductToCart({
              cartRecordID,
              quantity: Number(quantity),
              weight: Number(weight)
            });
          });
        } else {
          dishesStore
            .updateShoppingCart({
              productID: dishes.productID,
              variantID: dishes.variantID,
              optionID: dishes.optionID,
              changeQuantity: isSpellChild
                ? parents.quantity * changeQuantity
                : changeQuantity,
              remaining: dishes.remaining
            })
            .then(() => {
              dishesStore.updateProductToCart({
                cartRecordID,
                quantity: Number(quantity),
                weight: Number(weight)
              });
            });
        }
        break;
      case 'attribute':
        //修改口味做法
        dishesStore.updateProductToCart({
          cartRecordID,
          attributeMap,
          selectedAttributeList,
          memo
        });
        break;
      case 'memo':
        //修改备注
        dishesStore.updateProductToCart({
          cartRecordID,
          memo
        });
        break;
      case 'designer':
        //修改厨师
        dishesStore.updateProductToCart({
          cartRecordID,
          designerID,
          designerName,
          designerPrice
        });
        break;
      case 'tag':
        //厨房状态
        dishesStore.updateProductToCart({
          cartRecordID,
          tagIDs,
          produceStatus
        });

        //如果有套餐明细，全部需要更改
        if (dishes.comboList && dishes.comboList.length) {
          dishes.comboList.forEach(combo => {
            let cartRecordID = combo.cartRecordID;
            dishesStore.updateProductToCart({
              cartRecordID,
              tagIDs,
              produceStatus
            });
          });
        }
        break;
      case 'handsel':
        //赠菜
        if (handselReason || mappingDesc) {
          let object = {
            moduleCode: 'OrderModule',
            privilegeCode: 'PresenteDish',
            title: '赠菜',
            toDoSomething: () => {
              // let productName = dishes.optionName ? dishes.productName + '('+ dishes.optionName +')' : dishes.productName;

              //赠菜二次确认
              // this.setState({
              //     statePopup: <PromptPopup
              //         onOk={() => {

              //         }}
              //         onCancel={() => {
              //             this.setState({statePopup: false});
              //         }}
              //     >
              //         <div style={promptContStyle}>
              //             确定赠送【<strong style={{padding: '5px', color: '#F00'}}>{productName}</strong>】{handselQuantity}份？
              //         </div>
              //     </PromptPopup>
              // });

              if (dishes.quantity === handselQuantity) {
                //全部赠菜
                dishesStore.updateProductToCart({
                  cartRecordID,
                  aLaCarteMethod: 686,
                  mappingDesc: handselReason || mappingDesc
                });
              } else {
                //部分赠菜
                dishesStore.updateProductToCart({
                  cartRecordID,
                  quantity: dishes.quantity - handselQuantity
                });

                let newDishes = JSON.parse(JSON.stringify(dishes));
                newDishes.cartRecordID = Math.floor(
                  Math.random() * 10000000000
                ); //删除cartRecordID，以便重新分配
                newDishes.mappingDesc = handselReason || mappingDesc;
                newDishes.quantity = handselQuantity;
                newDishes.aLaCarteMethod = 686; //赠菜
                newDishes.originRecordID = dishes.cartRecordID; //原菜品ID

                if (newDishes.comboList) {
                  newDishes.comboList = newDishes.comboList.map(combo => {
                    combo.cartRecordID = Math.floor(
                      Math.random() * 10000000000
                    ); //删除cartRecordID，以便重新分
                    combo.quantity = handselQuantity;
                    return combo;
                  });
                }

                //复制菜品配置信息并添加到购物车
                dishesStore.cloneToCart({
                  newProduct: newDishes,
                  originProduct: dishes
                });
              }

              closeHandle && closeHandle();
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
          dishesStore.showFeedback({
            status: 'validate',
            msg: '请选择赠菜原因！'
          });
          return;
        }
        break;
      case 'cancelHandsel':
        //取消赠菜
        if (handselQuantity > dishes.quantity) {
          dishesStore.showFeedback({
            status: 'validate',
            msg: '取消数量大于可取消数量！'
          });
          return;
        }

        let originProduct;
        dishesStore.shoppingCart.forEach((cartRecord, index) => {
          if (cartRecord.cartRecordID === dishes.originRecordID) {
            originProduct = cartRecord;
          }
          if (cartRecord.comboList) {
            cartRecord.comboList.forEach((combo, index) => {
              if (combo.cartRecordID === dishes.originRecordID) {
                originProduct = combo;
              }
            });
          }
        });

        if (originProduct && originProduct.aLaCarteMethod !== 686) {
          let originQuantity = originProduct.quantity;
          //有未赠送的原菜品
          dishesStore.updateProductToCart({
            cartRecordID: originProduct.cartRecordID,
            quantity: originQuantity + handselQuantity * 1,
            memo: ''
          });
          if (dishes.quantity === handselQuantity) {
            //全部取消赠菜
            dishesStore.deleteFromCart(dishes.cartRecordID);
          } else {
            //部分取消赠菜
            dishesStore.updateProductToCart({
              cartRecordID: dishes.cartRecordID,
              quantity: dishes.quantity - handselQuantity
            });
          }
        } else {
          //没有未赠送的原菜品
          if (dishes.quantity === handselQuantity) {
            //全部取消赠菜
            dishesStore.deleteFromCart(dishes.cartRecordID);
          } else {
            //部分取消赠菜
            dishesStore.updateProductToCart({
              cartRecordID: dishes.cartRecordID,
              quantity: dishes.quantity - handselQuantity
            });
          }

          let newDishes = JSON.parse(JSON.stringify(dishes));
          newDishes.cartRecordID = Math.floor(Math.random() * 10000000000);
          newDishes.quantity = handselQuantity;
          newDishes.aLaCarteMethod = 684; //正常点菜
          newDishes.memo = '';

          //复制菜品配置信息并添加到购物车
          dishesStore.cloneToCart({
            newProduct: newDishes,
            originProduct: dishes
          });

          //修改菜品originRecordID
          dishesStore.changeOriginRecordID({
            oldOriginRecordID: dishes.originRecordID,
            newOriginRecordID: newDishes.cartRecordID
          });
        }

        break;
      case 'donated':
        //转赠
        if (tableID) {
          dishesStore.updateProductToCart({
            cartRecordID,
            tableID,
            tableName,
            aLaCarteMethod: 998 //转赠
          });
        } else {
          dishesStore.showFeedback({ status: 'validate', msg: '请选择要转的桌台！' });
          return;
        }
        break;
      case 'price':
        //临时改价
        if (price) {
          let object = {
            moduleCode: 'OrderModule',
            privilegeCode: 'ProvisionalChange',
            title: '临时改价',
            toDoSomething: () => {
              dishesStore.updateProductToCart({
                cartRecordID,
                productType: dishes.productType === 5 ? 5 : 4,
                price
              });
              if (isSpellChild) { //当是拼菜明细菜的时候要同时更新拼菜组的价格
                dishesStore.updateProductToCart({
                  cartRecordID: parents.cartRecordID,
                  price: dishesStore.countSpellPrice(parents)
                });
              }
              closeHandle && closeHandle();
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
          dishesStore.showFeedback({
            status: 'validate',
            msg: '请输入修改价格！'
          });
          return;
        }
        break;
      default:
    }

    if (type !== 'handsel' && type !== 'price') {
      //关闭未下单修改弹窗
      closeHandle && closeHandle();
    }
  };

  //放弃
  handleCancel = () => {
    let { closeHandle } = this.props;
    //关闭未下单修改弹窗
    closeHandle && closeHandle();
  };

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
          dishesStore.showFeedback({
            status: 'warn',
            msg: json.message
          });
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

  componentWillUnmount() {
    this.props.dishesStore.closeFeedback();
  }

  render() {
    const { dishesStore, dishes, isSpellChild, closeHandle, spellTipHandle } = this.props;
    const {
      isCombo,
      permissionList,
      type,
      weight,
      specificationList, //规格可选列表
      attributeMap, //口味做法可选列表
      designers, //厨师可选列表
      optionID, //已选规格
      selectedAttributeList, //已选口味做法
      handselReasonList,
      handselReason,
      handselMemo,
      memo, //备注
      tagIDs, //当前标签ID
      produceStatus, //当前状态
      designerID, //已选厨师ID
      usingTableList, //使用中的桌台列表
      tableID
    } = this.state;

    let dishesName = dishes.variantName
      ? dishes.variantName
      : dishes.productName;

    //是否是拼菜
    const isSpellDishes = dishes.productMode === 1377;

    //选厨师
    return (
      <Modal
        title={dishesName}
        visible={true}
        maskClosable={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText="确定"
        cancelText="取消"
        width={840}
        wrapClassName="not-order-popup-modal"
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

            if (key === 'donated') {
              this.getUsingTableList();
            }
            if (key === 'handsel') {
              this.getHandselReasonList();
            }

            if (key === 'spell') {
              //拼菜
              
              closeHandle && closeHandle();
              if (dishes.designerID) {
                //如果有选择厨师，要弹窗提示
                spellTipHandle();
                return;
              }

              if (isSpellDishes || isSpellChild) {
                dishesStore.openSpellStage();
                dishesStore.modifySpellList(dishes);
              } else {
                //在放入拼菜之前清空厨房状态
                dishesStore.updateProductToCart({
                  cartRecordID: dishes.cartRecordID,
                  tagIDs: '',
                  produceStatus: dishes.needWeigh ? 830 : 693
                });

                dishesStore.openSpellStage();
                dishesStore.initSpellList({ dishes, needFilter: true });
              }
            }
          }}
        >
          {!isCombo && (
            <TabPane tab={dishes.needWeigh ? '期望重量' : '数量'} key="quantity">
              <div className="cheng-zhong-block">
                {!dishes.needWeigh && (
                  <div className="shuliang-title">
                    <input
                      type="text"
                      className="result"
                      readOnly
                      value={this.state.quantity}
                    />
                    <p className="danwei">单位：{dishes.unit}</p>
                  </div>
                )}
                {dishes.needWeigh && (
                  <div className="chengzhong-title">
                    <input
                      type="text"
                      className="result quantityInput"
                      readOnly
                      value={this.state.quantity}
                    />{' '}
                    <span className="unit">份</span>
                    <span className="multiplication iconfont icon-huiyuanguanli_icon_close-" />
                    <input
                      type="text"
                      className="result weightInput"
                      readOnly
                      value={weight}
                    />{' '}
                    <span className="unit">{dishes.unit}</span>
                  </div>
                )}
                <CommonKeyboard
                  getValue={value => {
                    let { inputType, quantity, weight } = this.state;

                    quantity = String(quantity);
                    weight = String(weight);
                    if (inputType === 'quantity') {
                      if (typeof value === 'undefined') {
                        this.setState({
                          quantity: quantity.substr(0, quantity.length - 1)
                        });
                      } else {
                        if (value !== '.') {
                          this.setState({
                            quantity: (quantity + value).substr(0, 3)
                          });
                        }
                      }
                    } else {
                      if (typeof value === 'undefined') {
                        this.setState({
                          weight: weight.substr(0, weight.length - 1)
                        });
                      } else {
                        weight = weight + value;
                        let decimal = weight.split('.')[1]
                          ? weight.split('.')[1].length
                          : 0;
                        if (decimal === 0) {
                          if (value !== '.') {
                            this.setState({ weight: weight.substr(0, 3) });
                          } else {
                            this.setState({ weight });
                          }
                        } else if (decimal && decimal < 3 && value !== '.') {
                          this.setState({ weight });
                        }
                      }
                    }
                  }}
                />
              </div>
            </TabPane>
          )}

          {!isSpellDishes &&
            specificationList &&
            !!specificationList.length && (
              <TabPane tab="规格" key="specification">
                <div className="guige">
                  {specificationList.map(specification => {
                    return (
                      <div
                        key={specification.optionID}
                        className={classnames({
                          'myBtn-365-38': true,
                          'btn-active': specification.optionID === optionID
                        })}
                        onClick={() => {
                          //选择规格
                          this.setState({
                            optionID: specification.optionID,
                            optionName: specification.optionName,
                            optionPrice: specification.price
                          });
                        }}
                      >
                        {specification.price}元／{specification.optionName}
                      </div>
                    );
                  })}
                </div>
              </TabPane>
            )}

          {!isSpellDishes &&
            attributeMap &&
            Object.keys(attributeMap).length && (
              <TabPane tab="口味做法" key="attribute">
                <Kouwei
                  attributeMap={attributeMap}
                  selectedAttributeList={selectedAttributeList}
                  memo={memo}
                  onChange={({ attributeMap, selectedAttributeList }) => {
                    this.setState({
                      attributeMap,
                      selectedAttributeList
                    });
                  }}
                  onEntry={memo => {
                    this.setState({ memo });
                  }}
                />
              </TabPane>
            )}

          {!isSpellChild &&
            !isSpellDishes &&
            designers &&
            !!designers.length &&
            dishesStore.dishesType !== 'banquet' && (
              <TabPane tab="选厨师" key="designer">
                <div className="chef-block">
                  <div className="choose-chef">
                    <MyScroll width={800} height={434}>
                      {designers.map((designer, index) => {
                        return (
                          <li
                            key={index}
                            className={classnames({
                              card: true,
                              iconfont: true,
                              select: designer.designerID === designerID
                            })}
                            onClick={() => {
                              if (designer.designerID === designerID) {
                                this.setState({
                                  designerID: null,
                                  designerName: '',
                                  designerPrice: 0
                                });
                              } else {
                                this.setState({
                                  designerID: designer.designerID,
                                  designerName: designer.designerName,
                                  designerPrice: designer.produceCost
                                });
                              }
                            }}
                          >
                            <div className="chef-pic">
                              {designer.picture ? (
                                <img
                                  src={designer.picture}
                                  alt="presentation"
                                />
                              ) : (
                                <i className="iconfont icon-xuanchushi_icon_toux" />
                              )}
                            </div>
                            <h3 className="table-name">
                              {designer.designerName}
                            </h3>
                            {designer.produceCost > 0 && (
                              <p className="add-price">
                                +{designer.produceCost}元/份
                              </p>
                            )}
                            <div className="card-footer">
                              <Rate value={designer.designerLevel} disabled />
                              <div className="favour">
                                <i className="iconfont icon-xuanchushi_icon_zan-" />
                                <span>{designer.praiseNum}</span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </MyScroll>
                  </div>
                </div>
              </TabPane>
            )}

          {!isSpellChild &&
            dishesStore.dishesType !== 'banquet' && (
              <TabPane tab="厨房状态" key="tag">
                <div className="kitchen-state">
                  {['20', '21', '23', 694].map(tag => {
                    let text;
                    let tagStr = tagIDs || '';
                    switch (tag) {
                      case '20':
                        text = '免做';
                        break;
                      case '21':
                        text = '先做';
                        break;
                      case '23':
                        text = '打包';
                        break;
                      default:
                        text = '等叫';
                    }
                    return (
                      <div
                        key={tag}
                        className={classnames({
                          'myBtn-277-44': true,
                          'btn-active':
                            tagStr.indexOf(tag) > -1 ||
                            (tag === 694 && produceStatus === 694)
                        })}
                        onClick={() => {
                          if (tag === 694) {
                            //等叫
                            let status = dishes.needWeigh ? 830 : 693;
                            tagStr = tagStr
                              .split(',')
                              .filter(tagID => {
                                return tagID !== '21';
                              })
                              .join(',');

                            this.setState({
                              produceStatus:
                                produceStatus === 694 ? status : 694,
                              tagIDs: tagStr
                            });
                          } else {
                            let produceStatus = this.state.produceStatus;
                            if (tagStr.indexOf(tag) > -1) {
                              tagStr = tagStr
                                .split(',')
                                .filter(tagID => {
                                  return tagID !== tag;
                                })
                                .join(',');
                            } else {
                              tagStr = tagIDs ? tagIDs + ',' + tag : tag;
                            }
                            if (tag === '21') {
                              produceStatus = dishes.needWeigh ? 830 : 693;
                            }

                            this.setState({
                              produceStatus,
                              tagIDs: tagStr
                            });
                          }
                        }}
                      >
                        {text}
                      </div>
                    );
                  })}
                </div>
              </TabPane>
            )}

          {(!attributeMap || !Object.keys(attributeMap).length) && (
            <TabPane tab="备注" key="memo">
              <div className="dishes-memo">
                <BeiZhu
                  memo={memo || ''}
                  onEntry={memo => {
                    this.setState({ memo });
                  }}
                />
              </div>
            </TabPane>
          )}

          {!isSpellChild &&
            dishes.aLaCarteMethod !== 686 &&
            dishes.aLaCarteMethod !== 998 &&
            !isCombo &&
            dishesStore.dishesType !== 'banquet' && (
              <TabPane tab="赠菜" key="handsel">
                <div className="zeng-cai-block">
                  <ChangeNumber
                    min={1}
                    max={dishes.quantity}
                    onChange={value => {
                      this.setState({ handselQuantity: value });
                    }}
                  >
                    <div className="zhuang-left">
                      可赠<i className="red">{dishes.quantity}</i>份
                    </div>
                  </ChangeNumber>
                  <div className="select-items">
                    <div className="select-header">赠菜原因</div>
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
                    value={handselMemo}
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

          {!isSpellChild &&
            dishes.aLaCarteMethod === 686 &&
            !isCombo &&
            dishesStore.dishesType !== 'banquet' && (
              <TabPane tab="取消赠菜" key="cancelHandsel">
                <div className="cancle-zeng-cai-block">
                  <div className="cancle-zeng-cai-title">
                    {!dishes.needWeigh && (
                      <div className="cancel-zeng-left">
                        可取消<i>{dishes.quantity}</i>份
                      </div>
                    )}
                    <div className="cancel-zeng-right">
                      已选
                      <input
                        type="text"
                        value={this.state.handselQuantity}
                        readOnly
                      />份
                    </div>
                  </div>
                  <CommonKeyboard
                    getResult={value => {
                      this.setState({ handselQuantity: value * 1 });
                    }}
                  />
                </div>
              </TabPane>
            )}

          {!isSpellChild &&
            permissionList.includes('OrderModule:Donation') &&
            !isCombo &&
            dishes.aLaCarteMethod !== 686 &&
            dishes.aLaCarteMethod !== 998 &&
            dishesStore.dishesType !== 'banquet' && (
              <TabPane tab="转赠" key="donated">
                <div className="zhuan-zeng-block">
                  <div className="zhuang-zeng-block">
                    <div className="zhuang-left">
                      转赠<i className="red">{dishes.quantity}</i>份
                    </div>
                  </div>
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
                                          'zhuan-item': true,
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
                                            subOrderID: table.subOrderID
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

          {false &&
            dishesStore.dishesType !== 'banquet' && (
              <TabPane tab="取消转赠" key="cancelDonated">
                <div className="cancle-zhuan-zeng-block">
                  <ChangeNumber>
                    <div className="zhuang-left">
                      取消转赠<i className="red">1</i>份
                    </div>
                  </ChangeNumber>
                </div>
              </TabPane>
            )}

          {!isSpellDishes &&
          ((!isCombo && dishes.price) || //不是套餐明细菜有价格的时候
            (isCombo && !dishes.isAddPrice)) && ( //明细套餐有明细价格的时候
              <TabPane tab="临时改价" key="price">
                <div className="gai-jia-block">
                  <div className="chengzhong-title">
                    <input
                      type="text"
                      className="result"
                      readOnly
                      value={this.state.price || ''}
                    />
                    <p className="danwei">单位：元</p>
                  </div>
                  <CommonKeyboard
                    getResult={price => {
                      this.setState({ price });
                    }}
                  />
                </div>
              </TabPane>
            )}
          {false && dishesStore.dishesStage !== 'spell' &&
            dishes.aLaCarteMethod !== 686 &&
            dishes.aLaCarteMethod !== 998 &&
            (dishesStore.dishesType === 'normal' ||
              dishesStore.dishesType === 'booking') &&
            dishes.productType !== 1 &&
            !isCombo && <TabPane tab="拼菜" key="spell" />}
        </Tabs>
        {this.state.accreditPopup}
        {this.state.statePopup}
      </Modal>
    );
  }
}

export default NotOrderPopup;
