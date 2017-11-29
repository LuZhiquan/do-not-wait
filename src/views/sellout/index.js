import React from 'react';
import { Tabs, message } from 'antd';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { browserHistory } from 'react-router';
import MyScroll from 'react-custom-scrollbars'; //横向滚动条
import CalendarChoose from './sellout-popup/calendar-shoose'; //日历
import UpdateEstimatePopup from './sellout-popup/update-estimate-popup'; //修改沽清数量
import RightMemu from './sellout-popup/right-memu'; //右侧菜品组件
import Prompt from 'components/prompt-common'; //错误提示
import './estimate-clear-popup.less';
const TabPane = Tabs.TabPane;

message.config({
  top: 300
});

// 沽清列表组件
function SelloutLb({ selloutStore, sellout, handleClick }) {
  let optionName;
  if (
    sellout.allOptionNameList !== null &&
    sellout.allOptionNameList.length > 0
  ) {
    optionName = sellout.allOptionNameList.map((sord, index) => {
      return <em key={index}>{sord}</em>;
    });
  } else {
    optionName = sellout.optionName;
  }

  return (
    <li
      onClick={handleClick}
      className={
        sellout.selected === true ? 'each-data click-data' : 'each-data'
      }
    >
      <span>{sellout.index + 1}</span>
      <span>{sellout.productName}</span>
      <span>{optionName}</span>
      <span>{sellout.unitName}</span>
      <span>{sellout.preOrderFloatQuantity}</span>
      <span>{sellout.initFloatQuantity}</span>
    </li>
  );
}

//沽清
@inject('selloutStore')
@observer
class EstimateClearPopup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      UpdateEstimate: '', //修改沽清弹窗
      recordValue: '', //搜索内容文本框
      menuID: '', //打开修改层需要的menuid
      productType: '', //打开修改层需要的productType
      needWeigh: '', //打开修改层需要的needWeigh
      quantity: '', //打开修改层需要的quantity
      bookingSum: '', //打开修改层需要的bookingSum
      mappingID: '', //打开修改层需要的mappingID
      currentdate: this.props.selloutStore.currentdate //当前日期
    };
    this.props.selloutStore.beforevalue = '';
  }

  selloutStore = this.props.selloutStore;

  componentDidMount() {
    this.selloutStore.getselloutList({
      storeDay: this.selloutStore.currentdate
    }); //执行查询沽清列表  0是代表查询全部的
    this.selloutStore.getTakeeffect(); //判断是否生效
  }

  componentDidUpdate() {
    let feedback = this.selloutStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, this.selloutStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, this.selloutStore.closeFeedback());
          break;
        case 'error':
          message.warn(feedback.msg, this.selloutStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, this.selloutStore.closeFeedback());
      }
    }
  }

  //数据选中点击事件
  clicksellout(sellout) {
    this.setState({
      menuID: sellout.menuID,
      productType: sellout.productType,
      needWeigh: sellout.needWeigh,
      quantity: sellout.initFloatQuantity,
      bookingSum: sellout.preOrderQuantity,
      mappingID: sellout.mappingID
    });

    this.props.selloutStore.savemenuID = sellout.menuID; //储存修改的时候需要的 menuID
    this.props.selloutStore.menuname = sellout.productName;
    this.props.selloutStore.optionIDSum = sellout.optionIDSum > 0 ? 1 : 0;
    this.props.selloutStore.checkedselloutList(sellout.index); //是否选中
  }

  //获取搜索的内容
  reachValue = e => {
    var value = e.target.value;
    this.selloutStore.beforevalue = value;
    this.setState({ recordValue: value });
  };

  render() {
    let feedback = this.selloutStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        this.selloutStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    return (
      <div className="estimate-claer-modal">
        <div className="estimate-title">沽清</div>
        <i
          className="iconfont icon-order_btn_back"
          onClick={() => {
            this.context.router.goBack();
          }}
        />
        <div className="estimate-clear-main">
          <Tabs defaultActiveKey="0">
            <TabPane tab="按日沽清" key="0" className="estimate-clear-tab">
              <div className="estimate-left">
                <div className="estimate-left-search">
                  <CalendarChoose
                    getResult={e => {
                      //完成按钮
                      this.selloutStore.getselloutList({
                        storeDay: e
                      });
                    }}
                    activeclick={e => {
                      //上一个日期下一个日期触发的查询

                      // this.selloutStore.getselloutList({
                      //     storeDay:e
                      // });

                      if (e < this.state.currentdate) {
                        browserHistory.push('/sellout/after'); //生效后去到生效后的页面
                        this.selloutStore.fillindate = e;
                        this.selloutStore.showright = true;
                      } else if (e === this.state.currentdate) {
                        if (this.selloutStore.Takeeffect === true) {
                          browserHistory.push('/sellout/after'); //生效后去到生效后的页面
                        } else {
                          browserHistory.push('/sellout');
                        }
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="请输入商品编码/名称/拼音码查询"
                    className="estimate-left-input"
                    value={this.state.recordValue}
                    onChange={this.reachValue}
                  />
                  <button
                    className="search-box"
                    onClick={() => {
                      if (this.selloutStore.Takeeffect === true) {
                        //判断是否选中有数据
                        browserHistory.push('/sellout/after'); //生效后去到生效后的页面
                      } else if (this.selloutStore.Takeeffect === false) {
                        this.selloutStore.getselloutList({
                          storeDay: this.selloutStore.datetime,
                          searchContent: this.state.recordValue
                        }); //执行查询沽清列表的action
                      }
                    }}
                  >
                    <i className="iconfont icon-order_btn_search" />查询
                  </button>
                </div>
                <div className="main-block">
                  <div className="estimate-list-button">
                    <div className="estimate-list-top">
                      <span>序号</span>
                      <span>商品名称</span>
                      <span>规格</span>
                      <span>单位</span>
                      <span>本日预定</span>
                      <span>沽清数量</span>
                    </div>
                    <div className="estimate-list">
                      <div className="estimate-scroll">
                        <MyScroll>
                          {this.selloutStore.selloutList.length !== 0 ? (
                            this.selloutStore.selloutList.map(
                              (sellout, index) => {
                                return (
                                  <SelloutLb
                                    key={index}
                                    selloutStore={this.selloutStore}
                                    sellout={sellout}
                                    handleClick={this.clicksellout.bind(
                                      this,
                                      sellout
                                    )}
                                  />
                                );
                              }
                            )
                          ) : (
                            <div className="empty-holder">暂无数据</div>
                          )}
                        </MyScroll>
                      </div>
                    </div>
                    <div className="estimate-button">
                      <button
                        className={classnames({
                          'revised-quantity': true,
                          disabled: this.selloutStore.selloutList.length === 0
                        })}
                        onClick={() => {
                          if (this.selloutStore.selloutList.length !== 0) {
                            let flagt;
                            this.selloutStore.selloutList.map(
                              (sellout, index) => {
                                //判断是否选中有数据
                                if (sellout.selected === true) {
                                  flagt = true;
                                }
                                return sellout;
                              }
                            );

                            if (this.selloutStore.Takeeffect === true) {
                              //判断是否生效
                              browserHistory.push('/sellout/after'); //生效后去到生效后的页面
                            } else if (this.selloutStore.Takeeffect === false) {
                              if (flagt !== true) {
                                message.destroy();
                                message.warn('请选中数据');
                              } else {
                                let _this = this;
                                this.props.selloutStore.getselloutMessage(
                                  this.state.menuID,
                                  function(messageobj) {
                                    if (messageobj.accOptionCureSale === true) {
                                      _this.props.selloutStore.optionIDSum =
                                        messageobj.optionIDSum > 0 ? 1 : 0;
                                    } else if (
                                      messageobj.accOptionCureSale === false
                                    ) {
                                      _this.props.selloutStore.optionIDSum = 2;
                                    }

                                    _this.setState({
                                      UpdateEstimate: (
                                        <UpdateEstimatePopup
                                          updateestime={() => {
                                            //打开修改沽清数量的弹出层
                                            _this.props.selloutStore.emptylist();
                                            _this.setState({
                                              UpdateEstimate: ''
                                            });
                                          }}
                                          okdateestime={() => {
                                            _this.setState({
                                              UpdateEstimate: ''
                                            });
                                            _this.props.selloutStore.emptylist();
                                          }}
                                        />
                                      )
                                    });
                                  }
                                );
                              }
                            }
                          }
                        }}
                      >
                        修改沽清数量
                      </button>
                      <button
                        className={classnames({
                          'estimate-delete': true,
                          disabled: this.selloutStore.selloutList.length === 0
                        })}
                        onClick={() => {
                          if (this.selloutStore.selloutList.length !== 0) {
                            let flagt;
                            this.selloutStore.selloutList.map(
                              (sellout, index) => {
                                //判断是否选中有数据
                                if (sellout.selected === true) {
                                  flagt = true;
                                }
                                return sellout;
                              }
                            );

                            if (this.selloutStore.Takeeffect === true) {
                              //判断是否生效
                              browserHistory.push('/sellout/after'); //生效后去到生效后的页面
                            } else if (this.selloutStore.Takeeffect === false) {
                              if (flagt !== true) {
                                message.destroy();
                                message.warn('请选中数据');
                              } else {
                                this.props.selloutStore.delselloutlist(
                                  this.state.mappingID
                                ); //执行删除的action 12代表是删除
                              }
                            }
                          }
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="estimate-right">
                <RightMemu> </RightMemu>
              </div>
              {this.state.UpdateEstimate}
            </TabPane>
            <TabPane tab="按总沽清" key="1" className="estimate-clear-tab" />
          </Tabs>
        </div>
        {operatePrompt}
      </div>
    );
  }
}

EstimateClearPopup.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default EstimateClearPopup;
