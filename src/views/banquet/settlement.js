/**
* @author Shelly
* @description 宴会预定点菜界面
* @date 2017-06-27
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import AdjustMoney from './adjust-money-popup';
import DiscountPricePopup from './discount-price-popup';
import classnames from 'classnames';
import { browserHistory } from 'react-router';
import { message } from 'antd';
import InvoicePopup from './invoice-popup'; //开发票弹窗
import CashPopup from './cash-popup';
import PromptPopup from 'components/prompt-popup';
import WechatPay from 'components/wechat-pay-popup';
import { BanquetDidOrderList } from 'components/order-dishes';
import Loading from 'components/loading';
import { checkPermission } from 'common/utils';
import Accredit from 'components/accredit-popup'; //二次授权
// import MemberPay from 'components/member-discount-popup';

import './settlement.less';
message.config({
  top: 300
});

const promptContStyle = {
  padding: '80px 20px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

@inject('banquetCreateStore', 'dishesStore')
@observer
class Pay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adjustPopup: '',
      discountPopup: '',
      adjustDir: '', //0 加收费用  1 减少费用
      discountAmount: 0,
      adjustAmount: 0,
      payPopup: '',
      hasGetMoney: 0, //已经受到的金额
      payItems: [],
      confirmPopup: '',
      invoicePopup: '',
      pendingAmount: '',
      accreditPopup: '', //授权弹窗
      loading: ''
    };
  }

  componentDidMount() {
    let { banquetCreateStore, dishesStore, location } = this.props;

    let bookingID = location.state.bookingID;

    banquetCreateStore.getPaymentMethod();

    dishesStore.getDidOrderList(bookingID);

    banquetCreateStore.getSettlememtDetail(
      bookingID,
      (pendingAmount, discountAmount, adjustAmount, hasPayMoney) => {
        this.setState({ pendingAmount: pendingAmount });
        this.setState({ discountAmount: discountAmount });
        this.setState({ adjustAmount: adjustAmount });
        this.setState({ hasGetMoney: hasPayMoney });
      }
    );
  }

  payItemClick = (
    paymentMethodID,
    pendingAmount,
    hasGetMoney,
    bookingAmount
  ) => {
    let { banquetCreateStore, location } = this.props;

    let defaultMoney;
    if (pendingAmount - hasGetMoney - bookingAmount > 0) {
      defaultMoney = (pendingAmount - hasGetMoney - bookingAmount).toFixed(2);
    } else {
      defaultMoney = 0;
    }
    switch (paymentMethodID) {
      case 5:
        this.setState({
          payPopup: (
            <CashPopup
              defaultMoney={defaultMoney + ''}
              title="现金支付"
              onOk={amount => {
                let hasGetMoney = this.state.hasGetMoney;
                this.setState({ hasGetMoney: amount * 1 + hasGetMoney * 1 });
                this.setState({ payPopup: '' });

                let aMount = (amount * 1).toFixed(2);
                let payItems = this.state.payItems;
                payItems.push({
                  paymentMethodID: paymentMethodID,
                  settleAmount: aMount,
                  paymentName: '现金',
                  isShowBtn: true
                });
                this.setState({ payItems: payItems });
              }}
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
            />
          )
        });
        break;
      case 6:
        this.setState({
          payPopup: (
            <WechatPay
              inputValue={defaultMoney + ''}
              title="微信扫码"
              onOk={code => {
                //location.state.bookingID
                banquetCreateStore.onlinePayment(
                  {
                    bookingID: location.state.bookingID,
                    authCode: code,
                    paymentAmount: defaultMoney,
                    paymentMethod: paymentMethodID
                  },
                  isShowBtn => {
                    this.setState({ payPopup: '' });
                    let payItems = this.state.payItems;
                    payItems.push({
                      paymentMethodID: paymentMethodID,
                      settleAmount: defaultMoney,
                      paymentName: '微信线上',
                      isShowBtn: isShowBtn
                    });
                    this.setState({ payItems: payItems });
                  }
                );
              }}
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
            />
          )
        });
        break;
      case 7:
        this.setState({
          payPopup: (
            <WechatPay
              inputValue={defaultMoney + ''}
              title="支付宝扫码"
              onOk={code => {
                banquetCreateStore.onlinePayment(
                  {
                    bookingID: location.state.bookingID,
                    authCode: code,
                    paymentAmount: defaultMoney,
                    paymentMethod: paymentMethodID
                  },
                  isShowBtn => {
                    this.setState({ payPopup: '' });
                    let payItems = this.state.payItems;
                    payItems.push({
                      paymentMethodID: paymentMethodID,
                      settleAmount: defaultMoney,
                      paymentName: '支付宝线上',
                      isShowBtn: isShowBtn
                    });
                    this.setState({ payItems: payItems });
                  }
                );
              }}
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
            />
          )
        });
        break;
      case 8:
        // this.setState({payPopup:<MemberPay
        //     title="会员卡支付"
        //     onOk={(amount)=>{

        //     }}
        //     onCancel={()=>{
        //         this.setState({payPopup:''});
        //     }}
        // />});
        break;
      case 11:
        this.setState({
          payPopup: (
            <CashPopup
              defaultMoney={defaultMoney + ''}
              title="微信线下支付"
              onOk={amount => {
                let hasGetMoney = this.state.hasGetMoney;
                this.setState({ hasGetMoney: amount * 1 + hasGetMoney * 1 });
                this.setState({ payPopup: '' });

                let payItems = this.state.payItems;
                let aMount = (amount * 1).toFixed(2);
                payItems.push({
                  paymentMethodID: paymentMethodID,
                  settleAmount: aMount,
                  paymentName: '微信线下',
                  isShowBtn: true
                });
                this.setState({ payItems: payItems });
              }}
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
            />
          )
        });
        break;
      case 12:
        this.setState({
          payPopup: (
            <CashPopup
              defaultMoney={defaultMoney + ''}
              title="支付宝线下支付"
              onOk={amount => {
                let hasGetMoney = this.state.hasGetMoney;
                this.setState({ hasGetMoney: amount * 1 + hasGetMoney * 1 });
                this.setState({ payPopup: '' });

                let payItems = this.state.payItems;
                let aMount = (amount * 1).toFixed(2);
                payItems.push({
                  paymentMethodID: paymentMethodID,
                  settleAmount: aMount,
                  paymentName: '支付宝线下',
                  isShowBtn: true
                });
                this.setState({ payItems: payItems });
              }}
              onCancel={() => {
                this.setState({ payPopup: '' });
              }}
            />
          )
        });
        break;
      default:
    }
  };

  render() {
    let { banquetCreateStore, location } = this.props;

    let { pendingAmount } = this.state;

    let settlementInfo = banquetCreateStore.settlementInfo;
    let tableTypes,
      costDetail,
      mainInfo,
      tabkeys = [],
      isOverBookingNum = false;

    let banqTotalAmount,
      additionAmount,
      addProdAmount,
      bookingAmount = 0; //菜金额  ，加收费用，加菜金额， 应收金额

    let direction = '';
    if (this.state.adjustDir === 0) {
      direction = '+';
    } else if (this.state.adjustDir === 1) {
      direction = '-';
    } else {
      direction = '';
    }

    if (settlementInfo) {
      tableTypes = settlementInfo.tableTypes;
      if (tableTypes) {
        tableTypes.forEach((table, index) => {
          tabkeys.push('' + index);
        });
      }

      costDetail = settlementInfo.costDetail;
      if (costDetail) {
        banqTotalAmount = costDetail.ActualAmount
          ? costDetail.ActualAmount.toFixed(2)
          : 0;
        additionAmount = costDetail.AdditionAmount
          ? costDetail.AdditionAmount.toFixed(2)
          : 0;
        addProdAmount = costDetail.AddProdAmountf
          ? costDetail.AddProdAmountf.toFixed(2)
          : 0;
      }

      // if(this.state.adjustDir*1===0){
      //     actualAmount = banqTotalAmount*1+additionAmount*1+addProdAmount*1-this.state.discountAmount +this.state.adjustAmount*1;

      // }else if(this.state.adjustDir*1===1){
      //     actualAmount = banqTotalAmount*1+additionAmount*1+addProdAmount*1-this.state.discountAmount - this.state.adjustAmount*1;

      // }else{
      //     actualAmount = banqTotalAmount*1+additionAmount*1+addProdAmount*1-this.state.discountAmount ;
      // }

      mainInfo = settlementInfo.mainInfo;
      if (mainInfo) {
        if (
          mainInfo.BookingNum * 1 + mainInfo.backupNum * 1 <
          mainInfo.actuNum
        ) {
          isOverBookingNum = true;
        } else {
          isOverBookingNum = false;
        }

        bookingAmount = mainInfo.bookingAmount;
      }
    }
    return (
      <div className="banquet-pay">
        <div className="dishes-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              //返回预定界面
              this.context.router.goBack();
            }}
          />结账
        </div>
        <div className="content-wrap">
          <div className="dishes-block">
            <div className="info">
              <div className="code">
                <span className="in-title">宴会单号</span>
                <span className="in-text">
                  {mainInfo && mainInfo.bookingID}
                </span>
              </div>
              <div className="item">
                <span className="in-title">宴会名称</span>
                <span className="in-text strong">
                  {mainInfo && mainInfo.partyName}
                </span>
              </div>
              <div className="item pl20">
                <span className="in-title">客户姓名</span>
                <span className="in-text">
                  {mainInfo && mainInfo.customerName}
                </span>
              </div>
              <div className="item">
                <span className="in-title">预订桌数</span>
                <span className="in-text">
                  {mainInfo && mainInfo.tableNum}桌
                </span>
              </div>
              <div className="item pl20">
                <span className="in-title">备用桌数</span>
                <span className="in-text">
                  {mainInfo && mainInfo.backupNum}桌
                </span>
              </div>
              <div className="item">
                <span className="in-title">已开桌数</span>
                <span className="in-text">
                  {mainInfo && mainInfo.actuNum}桌{isOverBookingNum && <em>(超过预订总桌)</em>}
                </span>
              </div>
              <div className="item pl20">
                <span className="in-title">开席时间</span>
                <span className="in-text">
                  {mainInfo && mainInfo.openTime.split(' ')[1]}
                </span>
              </div>
            </div>

            {<BanquetDidOrderList bookingID={location.state.bookingID} />}
          </div>
          <div className="money-block">
            <div className="order-money">
              <div className="mo-title">订单金额</div>
              <div className="mo-content">
                <div>
                  <span>宴会菜金：</span>
                  <span className="mo-text">{banqTotalAmount}</span>
                </div>
                <div>
                  <span>加收费用： </span>
                  <span className="mo-text">{additionAmount}</span>
                </div>
                <div>
                  <span>加菜金额：</span>
                  <span className="mo-text">{addProdAmount}</span>
                </div>
                <div>
                  <span>加菜折扣：</span>
                  <span className="mo-text">
                    {this.state.discountAmount > 0 && '-'}
                    {this.state.discountAmount}
                  </span>
                </div>
                <div>
                  <span>调整费：</span>
                  <span className="mo-text">
                    {direction}
                    {this.state.adjustAmount}
                  </span>
                </div>
                <div>
                  <span>应收：</span>
                  <span className="mo-text red">
                    {(1 * pendingAmount).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mo-btns">
                <div
                  className={classnames({
                    disabled: addProdAmount === 0
                  })}
                  onClick={() => {
                    if (addProdAmount > 0) {
                      //验证二次授权
                      let _this = this;
                      let object = {
                        moduleCode: 'DinnerParty',
                        privilegeCode: 'Discountonvegetables',
                        title: '加菜打折',
                        toDoSomething: function() {
                          _this.setState({
                            discountPopup: (
                              <DiscountPricePopup
                                title="加菜折扣"
                                addDishAmount={addProdAmount}
                                onOk={price => {
                                  _this.setState({ discountAmount: price });

                                  let bookingID = location.state.bookingID;
                                  let discountAmount = '-' + price;

                                  banquetCreateStore.discountAmount(
                                    { bookingID, discountAmount },
                                    pendingAmount => {
                                      _this.setState({
                                        pendingAmount: pendingAmount
                                      });
                                    }
                                  );

                                  _this.setState({ discountPopup: '' });
                                }}
                                onCancel={() => {
                                  _this.setState({ discountPopup: '' });
                                }}
                              />
                            )
                          });
                        },
                        closePopup: function() {
                          _this.setState({ accreditPopup: '' });
                        },
                        failed: function() {
                          _this.setState({
                            accreditPopup: (
                              <Accredit
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
                    }
                  }}
                >
                  加菜打折
                </div>
                <div
                  onClick={() => {
                    //验证二次授权
                    let _this = this;
                    let object = {
                      moduleCode: 'DinnerParty',
                      privilegeCode: 'Adjustmentexpenses',
                      title: '调整费用',
                      toDoSomething: function() {
                        _this.setState({
                          adjustPopup: (
                            <AdjustMoney
                              bookingID={location.state.bookingID}
                              handleOk={(
                                adjustDir,
                                adjustAmount,
                                pendingAmount
                              ) => {
                                _this.setState({ adjustDir: adjustDir * 1 });
                                _this.setState({ adjustAmount: adjustAmount });
                                _this.setState({ adjustPopup: '' });

                                _this.setState({
                                  pendingAmount: pendingAmount
                                });
                              }}
                              handleCancel={() => {
                                _this.setState({ adjustPopup: '' });
                              }}
                            />
                          )
                        });
                      },
                      closePopup: function() {
                        _this.setState({ accreditPopup: '' });
                      },
                      failed: function() {
                        _this.setState({
                          accreditPopup: (
                            <Accredit
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
                  }}
                >
                  调整费用
                </div>
              </div>
            </div>
            <div className="get-money">
              <div className="mo-title">收款情况</div>
              <div className="mo-content">
                <div>
                  <span>已收：</span>
                  <span className="mo-text">{this.state.hasGetMoney}</span>
                </div>
                <div>
                  <span>订金： </span>
                  <span className="mo-text">{bookingAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span>待收：</span>
                  <span className="mo-text red">
                    {pendingAmount - this.state.hasGetMoney - bookingAmount <
                    0 ? (
                      0
                    ) : (
                      (pendingAmount -
                        this.state.hasGetMoney -
                        bookingAmount).toFixed(2)
                    )}
                  </span>
                </div>
                <div>
                  <span>找零：</span>
                  <span className="mo-text">
                    {this.state.hasGetMoney > pendingAmount - bookingAmount ? (
                      this.state.hasGetMoney + bookingAmount - pendingAmount
                    ) : (
                      0
                    )}
                  </span>
                </div>
                <div>
                  <span>开票金额：</span>
                  <span className="mo-text">
                    {(1 * pendingAmount).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="money-list">
                <div className="li-title">已收款</div>
                <div className="items">
                  <Scrollbars>
                    {this.state.payItems.length > 0 &&
                      this.state.payItems.map((pay, index) => {
                        let block;
                        if (
                          pay.paymentMethodID === 5 ||
                          pay.paymentMethodID === 11 ||
                          pay.paymentMethodID === 12
                        ) {
                          block = (
                            <i
                              onClick={() => {
                                this.setState({
                                  confirmPopup: (
                                    <PromptPopup
                                      onCancel={() => {
                                        this.setState({ confirmPopup: '' });
                                      }}
                                      onOk={() => {
                                        this.setState({ confirmPopup: '' });

                                        let money = this.state.payItems[index]
                                          .settleAmount;
                                        let hasGetMoney = this.state
                                          .hasGetMoney;
                                        this.setState({
                                          hasGetMoney: hasGetMoney - money
                                        });

                                        let payItems = this.state.payItems;
                                        payItems.splice(index, 1);
                                        this.setState({ payItems: payItems });
                                      }}
                                    >
                                      <div
                                        className="prompt"
                                        style={promptContStyle}
                                      >
                                        <span className="delele-text">
                                          删除收款吗?
                                        </span>
                                      </div>
                                    </PromptPopup>
                                  )
                                });
                              }}
                              className="iconfont icon-shanchu1"
                            />
                          );
                        } else if (
                          pay.paymentMethodID === 6 ||
                          pay.paymentMethodID === 7
                        ) {
                          if (pay.isShowBtn) {
                            block = (
                              <div className="btn">
                                <span
                                  onClick={() => {
                                    this.setState({
                                      confirmPopup: (
                                        <PromptPopup
                                          onCancel={() => {
                                            this.setState({ confirmPopup: '' });
                                          }}
                                          onOk={() => {
                                            this.setState({ confirmPopup: '' });

                                            let hasGetMoney = this.state
                                              .hasGetMoney;
                                            let money =
                                              this.state.payItems[index]
                                                .settleAmount * 1;
                                            this.setState({
                                              hasGetMoney:
                                                hasGetMoney * 1 + money
                                            });

                                            let payItems = this.state.payItems;
                                            payItems[index].isShowBtn = false;
                                            this.setState({
                                              payItems: payItems
                                            });

                                            banquetCreateStore.doAffirmPaySettle(
                                              {
                                                bookingID:
                                                  location.state.bookingID,
                                                paymentAmount: money,
                                                paymentMethodID:
                                                  pay.paymentMethodID
                                              }
                                            );
                                          }}
                                        >
                                          <div
                                            className="prompt"
                                            style={promptContStyle}
                                          >
                                            <span className="delele-text">
                                              确定收款吗?
                                            </span>
                                          </div>
                                        </PromptPopup>
                                      )
                                    });
                                  }}
                                >
                                  确定
                                </span>
                                <span
                                  onClick={() => {
                                    this.setState({
                                      confirmPopup: (
                                        <PromptPopup
                                          onCancel={() => {
                                            this.setState({ confirmPopup: '' });
                                          }}
                                          onOk={() => {
                                            this.setState({ confirmPopup: '' });
                                            let payItems = this.state.payItems;
                                            payItems.splice(index, 1);
                                            this.setState({
                                              payItems: payItems
                                            });
                                          }}
                                        >
                                          <div
                                            className="prompt"
                                            style={promptContStyle}
                                          >
                                            <span className="delele-text">
                                              取消收款吗?
                                            </span>
                                          </div>
                                        </PromptPopup>
                                      )
                                    });
                                  }}
                                >
                                  取消
                                </span>
                              </div>
                            );
                          } else {
                            block = null;
                          }
                        }
                        return (
                          <div className="item" key={index}>
                            <span>{index + 1}</span>
                            <span>{pay.paymentName}</span>
                            <span>{pay.settleAmount}</span>
                            {block}
                          </div>
                        );
                      })}
                  </Scrollbars>
                </div>
              </div>
              <div className="pay-type">
                {banquetCreateStore.paymentMethod.map((payItem, index) => {
                  let block;
                  switch (payItem.paymentMethodID) {
                    case 5:
                      block = (
                        <div
                          key={index}
                          className="payment-frame pay-yellow iconfont"
                          onClick={() => {
                            this.payItemClick(
                              payItem.paymentMethodID,
                              pendingAmount,
                              this.state.hasGetMoney,
                              bookingAmount
                            );
                          }}
                        >
                          <i className="iconfont icon-xianjin" />
                          <span>现金</span>
                        </div>
                      );
                      break;
                    case 6:
                      block = (
                        <div
                          key={index}
                          className="payment-frame pay-green"
                          onClick={() => {
                            this.payItemClick(
                              payItem.paymentMethodID,
                              pendingAmount,
                              this.state.hasGetMoney,
                              bookingAmount
                            );
                          }}
                        >
                          <i className="iconfont icon-weixinzhifu" />
                          <em>线上</em>
                          <span>微信</span>
                        </div>
                      );
                      break;
                    case 7:
                      block = (
                        <div
                          key={index}
                          className="payment-frame pay-blue"
                          onClick={() => {
                            this.payItemClick(
                              payItem.paymentMethodID,
                              pendingAmount,
                              this.state.hasGetMoney,
                              bookingAmount
                            );
                          }}
                        >
                          <i className="iconfont icon-umidd17" />
                          <em>线上</em>
                          <span>支付宝</span>
                        </div>
                      );
                      break;
                    case 8:
                      // block =  <div key={index} className="payment-frame pay-purple" onClick={()=>{
                      //      this.payItemClick(payItem.paymentMethodID,actualAmount,this.state.hasGetMoney);
                      // }}>
                      //     <i className="iconfont icon-huiyuanqia"></i>
                      //     <span>会员卡</span>
                      // </div>
                      break;
                    case 11:
                      block = (
                        <div
                          key={index}
                          className="payment-frame pay-green"
                          onClick={() => {
                            this.payItemClick(
                              payItem.paymentMethodID,
                              pendingAmount,
                              this.state.hasGetMoney,
                              bookingAmount
                            );
                          }}
                        >
                          <i className="iconfont icon-weixinzhifu" />
                          <span>微信</span>
                        </div>
                      );
                      break;
                    case 12:
                      block = (
                        <div
                          key={index}
                          className="payment-frame pay-blue"
                          onClick={() => {
                            this.payItemClick(
                              payItem.paymentMethodID,
                              pendingAmount,
                              this.state.hasGetMoney,
                              bookingAmount
                            );
                          }}
                        >
                          <i className="iconfont icon-umidd17" />
                          <span>支付宝</span>
                        </div>
                      );
                      break;
                    default:
                  }
                  return block;
                })}
              </div>
            </div>
            <div className="money-btns">
              <div
                onClick={() => {
                  if (
                    this.state.hasGetMoney + bookingAmount ===
                    pendingAmount
                  ) {
                    this.setState({
                      invoicePopup: (
                        <InvoicePopup
                          invoiceAmount={pendingAmount}
                          orderAmount={pendingAmount}
                          handleOk={invoiceInfo => {
                            this.setState({ invoicePopup: '' });
                            let bookingID = location.state.bookingID;
                            banquetCreateStore.invoice(
                              { bookingID, invoiceInfo },
                              () => {
                                this.setState({ invoicePopup: '' });
                              }
                            );
                          }}
                          handleClose={() => {
                            this.setState({ invoicePopup: '' });
                          }}
                        />
                      )
                    });
                  } else {
                    message.destroy();
                    message.warn('支付完成才能开发票', 1);
                  }
                }}
              >
                开发票
              </div>
              <div
                onClick={() => {
                  let payItems = this.state.payItems;
                  let isConfirm = true;
                  let paymentMethodIDs = [],
                    settleAmounts = [];
                  payItems.forEach((item, index) => {
                    if (
                      (item.paymentMethodID === 6 && item.isShowBtn === true) ||
                      (item.paymentMethodID === 7 && item.isShowBtn === true)
                    ) {
                      isConfirm = false;
                      return;
                    }
                    paymentMethodIDs.push(item.paymentMethodID);
                    settleAmounts.push(item.settleAmount);
                  });
                  if (isConfirm) {
                    if (
                      this.state.hasGetMoney * 1 + bookingAmount * 1 <
                      pendingAmount
                    ) {
                      message.destroy();
                      message.warn('还未完成收款', 1);
                    } else {
                      let bookingID = location.state.bookingID;
                      let acountPay = pendingAmount - bookingAmount;
                      let discountAmount = this.state.discountAmount;
                      this.setState({ loading: true });

                      banquetCreateStore.doSettle(
                        {
                          bookingID,
                          paymentMethodIDs,
                          settleAmounts,
                          acountPay,
                          discountAmount
                        },
                        (success, msg) => {
                          if (success) {
                            setTimeout(() => {
                              this.setState({ loading: '' });
                              message.destroy();
                              message.success(msg, 1);
                              browserHistory.push('/banquet');
                            }, 2000);
                          } else {
                            this.setState({ loading: '' });
                            message.destroy();
                            message.success(msg, 1);
                          }
                        }
                      );
                    }
                  } else {
                    message.destroy();
                    message.warn('还存在待确认的收款', 1);
                  }
                }}
              >
                结账
              </div>
            </div>
          </div>
        </div>
        {this.state.loading && <Loading />}
        {this.state.adjustPopup}
        {this.state.discountPopup}
        {this.state.payPopup}
        {this.state.confirmPopup}
        {this.state.invoicePopup}
        {this.state.accreditPopup}
      </div>
    );
  }
}

Pay.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};
export default Pay;
