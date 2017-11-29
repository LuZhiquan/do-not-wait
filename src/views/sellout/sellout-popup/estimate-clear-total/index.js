import React from 'react';
import { message } from 'antd';
import { observer, inject } from 'mobx-react';
import { browserHistory } from 'react-router'; //路径跳转
import MyScroll from 'react-custom-scrollbars'; //滚动条
import CalendarChoose from '../calendar-shoose'; //日历
import CommodityIficationPopup from '../commodity-ification-popup'; //商品分类
import ZjEstimatePopup from '../zj-estimate-popup'; //增加/减少/报损弹出层
import GqEstimatePopup from '../estimate-gq-popup'; //沽清/删除弹出层
import ImportPopup from '../import-popup'; //导入弹出层
import RightMemu from '../right-memu'; //点菜组件
import Prompt from 'components/prompt-common'; //错误提示
import { checkPermission } from 'common/utils';
import Accredit from 'components/accredit-popup'; //二次授权
import './estimate-clear-total.less';
import 'assets/styles/modal.css';

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
      <span>{sellout.productCode}</span>
      <span>{sellout.productName}</span>
      <span>{sellout.firstCategoryName}</span>
      <span>{sellout.secondCategoryName}</span>
      <span>{sellout.unitName}</span>
      <span>{optionName}</span>
      <span>{sellout.preOrderFloatQuantity}</span>
      <span>{sellout.orderedFloatQuantity}</span>
      <span>{sellout.lossFloatQuantity}</span>
      <span>{sellout.remainingFloatQuantity}</span>
      <span>{sellout.initFloatQuantity}</span>
      <span>{sellout.remainingFloatQuantity > 0 ? '在售' : '售完'}</span>
    </li>
  );
}
//沽清
@inject('selloutStore')
@observer
class EstimateClearTotal extends React.Component {
  constructor(props, context) {
    super(props, context);
    let selloutStore = this.props.selloutStore;
    this.state = {
      Commodity: '', //商品分类弹出层
      ZjEstimatePopup: '', //增加/减少/报损弹出层
      GqEstimate: '', //沽清/删除弹出层
      Menu: '', //右侧点菜组件
      returndate:
        selloutStore.fillindate === ''
          ? selloutStore.currentdate
          : selloutStore.fillindate, //回掉日期
      Import: '', //导入弹出层
      addmune: '', //控制添加商品按钮的遮罩层
      recordValue: '', //查询的文本框值
      defaultvalue: '全部',
      accreditPopup: '', //授权弹窗
      isnodl: false //默认不显示导入历史这个按钮
    };

    selloutStore.getselloutList({
      storeDay:
        selloutStore.fillindate === ''
          ? selloutStore.currentdate
          : selloutStore.fillindate
    }); //执行沽清列表action  0代表全部分类

    selloutStore.getTakeeffect(); //判断是否在营业时间
    this.props.selloutStore.beforevalue = '';
  }

  componentDidUpdate() {
    let selloutStore = this.props.selloutStore;
    let feedback = selloutStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, selloutStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, selloutStore.closeFeedback());
          break;
        case 'error':
          message.warn(feedback.msg, selloutStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, selloutStore.closeFeedback());
      }
    }
  }

  //数据选中点击事件
  clicksellout(sellout) {
    let Quantity = sellout.remainingFloatQuantity;
    this.props.selloutStore.getafterobj(sellout, Quantity); //点击的时候就获取【增加/减少/报损/沽清/删除】弹出层需要显示的字段以及确定按钮action需要的参数
    this.props.selloutStore.checkedselloutList(sellout.index); //判断是否被选中
  }

  //获取搜索的内容
  reachValue = e => {
    var value = e.target.value;
    this.props.selloutStore.beforevalue = value;
    this.setState({ recordValue: value });
  };

  //操作历史
  operatehistory = e => {
    let selloutStore = this.props.selloutStore;
    browserHistory.push('/sellout/history'); //跳转到历史页面
    selloutStore.savelastcombination('0', '', '0'); //清空商品分类选中组合
    selloutStore.saveshop = '0'; //恢复全部选项被选中
  };

  //增加沽清数量
  addsellout = () => {
    //验证二次授权
    let selloutStore = this.props.selloutStore;
    let flagt;
    selloutStore.selloutList.map((sell, index) => {
      //判断是否选中有数据
      if (sell.selected === true) {
        flagt = true;
      }
      return sell;
    });
    if (flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      let _this = this;
      let object = {
        moduleCode: 'SellClearModule',
        privilegeCode: 'AddCount',
        title: '增加沽清数量',
        toDoSomething: function() {
          _this.setState({
            ZjEstimatePopup: (
              <ZjEstimatePopup
                updateestime={() => {
                  _this.setState({ ZjEstimatePopup: '' });
                }}
                okbutton={() => {
                  _this.setState({ ZjEstimatePopup: '' });
                }}
              />
            )
          });
          selloutStore.getaddorreduce('1'); //添加状态
          selloutStore.getreasonlist(selloutStore.addorreduce); //原因列表
          _this.props.selloutStore.reasontext.reasonName = ''; //清空原因文本
          _this.props.selloutStore.issuccess = ''; //清空返回状态
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
  };

  //减少沽清数量
  reducesellout = () => {
    let selloutStore = this.props.selloutStore;
    let flagt;
    selloutStore.selloutList.map((sell, index) => {
      //判断是否选中有数据
      if (sell.selected === true) {
        flagt = true;
      }
      return sell;
    });
    if (flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      let _this = this;
      let object = {
        moduleCode: 'SellClearModule',
        privilegeCode: 'ReduceCount',
        title: '减少沽清数量',
        toDoSomething: function() {
          _this.setState({
            ZjEstimatePopup: (
              <ZjEstimatePopup
                updateestime={() => {
                  _this.setState({ ZjEstimatePopup: '' });
                }}
                okbutton={() => {
                  _this.setState({ ZjEstimatePopup: '' });
                }}
              />
            )
          });

          selloutStore.getaddorreduce('2'); //减少状态
          selloutStore.getreasonlist(selloutStore.addorreduce); //原因列表
          _this.props.selloutStore.reasontext.reasonName = ''; //清空原因文本
          _this.props.selloutStore.issuccess = ''; //清空返回状态
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
  };

  //制作报损
  makesellout = () => {
    let selloutStore = this.props.selloutStore;
    let flagt;
    selloutStore.selloutList.map((sell, index) => {
      //判断是否选中有数据
      if (sell.selected === true) {
        flagt = true;
      }
      return sell;
    });
    if (flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      let _this = this;
      let object = {
        moduleCode: 'SellClearModule',
        privilegeCode: 'MakingNewspaperLoss',
        title: '制作报损',
        toDoSomething: function() {
          _this.setState({
            ZjEstimatePopup: (
              <ZjEstimatePopup
                updateestime={() => {
                  _this.setState({ ZjEstimatePopup: '' });
                }}
                okbutton={() => {
                  _this.setState({ ZjEstimatePopup: '' });
                }}
              />
            )
          });
          selloutStore.getaddorreduce('3'); //报损状态
          selloutStore.getreasonlist(selloutStore.addorreduce); //原因列表
          _this.props.selloutStore.reasontext.reasonName = ''; //清空原因文本
          _this.props.selloutStore.issuccess = ''; //清空返回状态
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
  };

  //估清
  tosellout = () => {
    let selloutStore = this.props.selloutStore;
    let flagt;
    selloutStore.selloutList.map((sell, index) => {
      //判断是否选中有数据
      if (sell.selected === true) {
        flagt = true;
      }
      return sell;
    });
    if (flagt !== true) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      let _this = this;
      let object = {
        moduleCode: 'SellClearModule',
        privilegeCode: 'GuQing',
        title: '沽清',
        toDoSomething: function() {
          _this.setState({
            GqEstimate: (
              <GqEstimatePopup
                gqclose={() => {
                  _this.setState({ GqEstimate: '' });
                }}
                okbutton={() => {
                  _this.setState({ GqEstimate: '' });
                }}
              />
            )
          });
          selloutStore.getaddorreduce('4'); //沽清
          selloutStore.getreasonlist(selloutStore.addorreduce); //原因列表
          _this.props.selloutStore.reasontext.reasonName = ''; //清空原因文本
          _this.props.selloutStore.issuccess = ''; //清空返回状态
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
  };

  //导入历史
  importhistory = () => {
    let selloutStore = this.props.selloutStore;
    this.setState({
      Import: (
        <ImportPopup
          importclose={() => {
            this.setState({ Import: '' });
          }}
          importok={() => {
            selloutStore.implementImport(
              this.state.returndate,
              selloutStore.Importtype
            ); //执行导入action
            this.setState({ Import: '' });
          }}
        />
      )
    });
  };

  render() {
    let selloutStore = this.props.selloutStore;
    let feedback = selloutStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        selloutStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    // let typename = '全部';
    // if(selloutStore.onelevel.onelevelname !== ""){
    //     typename=selloutStore.onelevel.onelevelname;
    // }
    // if(selloutStore.commoditytype.classifyName !== ""){
    //     typename=selloutStore.commoditytype.classifyName;
    // }

    return (
      <div className="estimate-claer-history-modal">
        <div className="estimate-main">
          <div className="estimate-main-search">
            <CalendarChoose
              getResult={e => {
                //完成按钮
                this.setState({ returndate: e });
                selloutStore.getselloutList({
                  storeDay: e,
                  searchContent: ''
                });
              }}
              activeclick={e => {
                //上一个日期下一个日期触发的查询
                selloutStore.getselloutList({
                  storeDay: e,
                  searchContent: ''
                });
                this.setState({ returndate: e });

                if (selloutStore.currentdate > e) {
                  if (selloutStore.Takeeffect === true) {
                    this.setState({ isnodl: false });
                  } else {
                    this.setState({ isnodl: true });
                  }
                } else {
                  this.setState({ isnodl: false });
                }

                if (e === selloutStore.currentdate) {
                  if (selloutStore.Takeeffect === true) {
                    browserHistory.push('/sellout/after'); //生效后去到生效后的页面
                  } else {
                    selloutStore.fillindate = '';
                    selloutStore.showright = false;
                    browserHistory.push('/sellout');
                  }
                }
              }}
            />
            <div className="search-right">
              <div
                className="classification"
                onClick={() => {
                  selloutStore.getcommodityclassify();
                  this.setState({
                    Commodity: (
                      <CommodityIficationPopup
                        closebutton={() => {
                          this.setState({ Commodity: '' });
                        }}
                        okbutton={() => {
                          this.setState({
                            Commodity: '',
                            defaultvalue:
                              selloutStore.lastcombination.lastname === ''
                                ? '全部'
                                : selloutStore.lastcombination.lastname
                          });
                          selloutStore.getselloutList({
                            storeDay: this.state.returndate,
                            categoryID:
                              selloutStore.lastcombination.lastid === ''
                                ? '0'
                                : selloutStore.lastcombination.lastid,
                            searchContent: this.state.recordValue
                          });
                        }}
                      />
                    )
                  });
                }}
              >
                {this.state.defaultvalue}
                <i className="iconfont icon-Shapearrow-" />
              </div>
              <input
                type="text"
                placeholder="请输入商品编码/名称/拼音码查询"
                className="estimate-main-input"
                value={this.state.recordValue}
                onChange={this.reachValue}
              />
              <button
                className="search-box"
                onClick={() => {
                  selloutStore.getselloutList({
                    storeDay: this.state.returndate,
                    categoryID:
                      selloutStore.lastcombination.lastid === ''
                        ? '0'
                        : selloutStore.lastcombination.lastid,
                    searchContent: this.state.recordValue
                  });
                }}
              >
                <i className="iconfont icon-order_btn_search" />查询
              </button>
              {this.state.Commodity}
            </div>
          </div>
          <div className="main-block-history">
            <div className="main-block">
              <div className="estimate-list-button">
                <div className="estimate-list-top">
                  <span>序号</span>
                  <span>商品编码</span>
                  <span>商品名称</span>
                  <span>一级分类</span>
                  <span>二级分类</span>
                  <span>单位</span>
                  <span>规格</span>
                  <span>本日预定</span>
                  <span>已点数量</span>
                  <span>报损量</span>
                  <span>剩余数量</span>
                  <span>沽清数量</span>
                  <span>状态</span>
                </div>
                <div className="estimate-list">
                  <div className="estimate-scroll">
                    <MyScroll>
                      {selloutStore.selloutList.map((sellout, index) => {
                        return (
                          <SelloutLb
                            key={index}
                            selloutStore={selloutStore}
                            sellout={sellout}
                            handleClick={this.clicksellout.bind(this, sellout)}
                          />
                        );
                      })}
                      {selloutStore.selloutList.length === 0 && (
                        <div className="empty-holder">暂无数据</div>
                      )}
                    </MyScroll>
                  </div>
                </div>
                {this.state.returndate === selloutStore.currentdate && ( //日期是当前日期就显示【增加/减少/报损/沽清/删除/添加/操作历史】按钮
                  <div className="normal-button">
                    <button
                      className={
                        selloutStore.selloutList.length === 0 && 'disabled'
                      }
                      onClick={
                        selloutStore.selloutList.length > 0 && this.addsellout
                      }
                    >
                      增加沽清数量
                    </button>

                    <button
                      className={selloutStore.Quantity === 0 && 'disabled'}
                      onClick={selloutStore.Quantity > 0 && this.reducesellout}
                    >
                      减少沽清数量
                    </button>
                    <button
                      className={selloutStore.Quantity === 0 && 'disabled'}
                      onClick={selloutStore.Quantity > 0 && this.makesellout}
                    >
                      制作报损
                    </button>
                    <button
                      className={selloutStore.Quantity === 0 && 'disabled'}
                      onClick={selloutStore.Quantity > 0 && this.tosellout}
                    >
                      沽清
                    </button>
                    <button
                      onClick={() => {
                        this.setState({
                          addmune: (
                            <div>
                              <div
                                className="mask"
                                onClick={() => {
                                  this.setState({ addmune: '' });
                                }}
                              />
                              <div className="mask-conten">
                                <RightMemu
                                  whatpopup={() => {
                                    this.setState({ addmune: '' });
                                  }}
                                />
                              </div>
                            </div>
                          )
                        });
                      }}
                    >
                      添加商品
                    </button>
                    <button onClick={this.operatehistory}>操作历史</button>
                  </div>
                )}

                {this.state.isnodl === true && ( //日期小于当前日期显示【导入历史按钮】
                  <div className="history_botton">
                    <button onClick={this.importhistory}>导入历史</button>
                  </div>
                )}

                {this.state.ZjEstimatePopup}
                {this.state.GqEstimate}
                {this.state.Menu}
                {this.state.Import}
                {this.state.addmune}
                {operatePrompt}
                {this.state.accreditPopup}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EstimateClearTotal.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default EstimateClearTotal;
