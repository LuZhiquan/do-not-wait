import React from 'react';
import { message } from 'antd';
import { observer, inject } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars'; //滚动条
import CalendarPopup from 'components/calendar-popup'; //日历弹出层
import CommodityIficationPopup from '../sellout-popup/commodity-ification-popup'; //商品分类
import OperationTypePopup from '../sellout-popup/operation-type-popup'; //操作类型
import Prompt from 'components/prompt-common'; //错误提示
import './operation-history.less';

message.config({
  top: 300
});

// 沽清历史列表组件
function Historylist({ selloutStore, history }) {
  return (
    <li className="each-history">
      <div>
        <p>{history.productName}</p>
      </div>
      <div>
        <p>
          操作类型：<span>{history.changeTypeName}</span>
        </p>
        <p>
          数量：<span>{history.changeFloatQuantity}</span>
        </p>
      </div>
      <div>
        <p>
          操作原因：<span>{history.changeReason}</span>
        </p>
      </div>
      <div>
        {history.authorizer && (
          <p>
            授权人：<span>{history.authorizer}</span>
          </p>
        )}
        {history.creator && (
          <p>
            操作人：<span>{history.creator}</span>
          </p>
        )}
      </div>
      <div>
        <p>
          操作时间：<span>{history.createTime}</span>
        </p>
      </div>
    </li>
  );
}

//沽清纪录
@inject('selloutStore')
@observer
class OperationHistoryPopup extends React.Component {
  constructor(props, context) {
    super(props, context);
    let selloutStore = this.props.selloutStore;
    this.state = {
      Calendar: '', //日历组件
      formattime: selloutStore.currentdate, //当前日期
      Commodity: '', //商品分类
      OperationType: '', //操作类型
      recordValue: '', //文本框的值
      defaultvalue: '全部'
    };

    selloutStore.getOperationhistory({
      storeDay: selloutStore.currentdate,
      changeType: selloutStore.operatetype.TypeID
    });
    selloutStore.saveshop = '0';

    //  selloutStore.operatetype.TypeID="";//默认是全部类型  清空store之前存的值
    //  selloutStore.commoditytype.classifyID="0";//默认是商品类型  清空store之前存的值
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

  onclose = () => {
    if (this.props.isclose) {
      this.props.isclose();
    }
  };

  //商品分类
  clickclass = () => {
    let selloutStore = this.props.selloutStore;
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
            selloutStore.getOperationhistory({
              storeDay: this.state.formattime,
              changeType: selloutStore.operatetype.TypeID,
              categoryID:
                selloutStore.lastcombination.lastid === ''
                  ? '0'
                  : selloutStore.lastcombination.lastid
            });
          }}
        />
      )
    });
  };

  //获取搜索的内容
  reachValue = e => {
    var value = e.target.value;
    this.setState({ recordValue: value });
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

    // let typename= '全部';
    // if(selloutStore.onelevel.onelevelname !== ""){
    //     typename=selloutStore.onelevel.onelevelname;
    // }
    // if(selloutStore.commoditytype.classifyName !== ""){
    //     typename=selloutStore.commoditytype.classifyName;
    // }

    return (
      <div className="operation-history">
        <div className="operation-history-title">沽清修改记录查询</div>
        <i
          className="iconfont icon-order_btn_back"
          onClick={() => {
            this.context.router.goBack();
            selloutStore.savelastcombination('0', '', '0'); //清空商品分类选中组合
            selloutStore.saveshop = '0'; //恢复全部选项被选中
          }}
        />
        <div className="operation-history-top">
          <div
            className="input-calendar"
            onClick={() => {
              this.setState({
                Calendar: (
                  <CalendarPopup
                    maxTime={new Date(selloutStore.currentdate)}
                    changetime={new Date(this.state.formattime)}
                    calendarModalCancel={() => {
                      this.setState({ Calendar: '' });
                    }}
                    calendarModalOk={newtime => {
                      this.setState({ formattime: newtime });
                      this.setState({ Calendar: '' });
                      selloutStore.getOperationhistory({
                        storeDay: newtime,
                        changeType: selloutStore.operatetype.TypeID,
                        categoryID:
                          selloutStore.lastcombination.lastid === ''
                            ? '0'
                            : selloutStore.lastcombination.lastid
                      });
                    }}
                  />
                )
              });
            }}
          >
            <p>{this.state.formattime}</p>
            <i className="iconfont icon-xinzenghuiyuan_icon_rili" />
          </div>
          <div
            className="div-czlx"
            onClick={() => {
              selloutStore.getselectOperateType();
              this.setState({
                OperationType: (
                  <OperationTypePopup
                    typeclose={() => {
                      this.setState({ OperationType: '' });
                    }}
                    okClick={() => {
                      selloutStore.getOperationhistory({
                        storeDay: this.state.formattime,
                        changeType: selloutStore.operatetype.TypeID,
                        categoryID:
                          selloutStore.lastcombination.lastid === ''
                            ? '0'
                            : selloutStore.lastcombination.lastid
                      });
                      this.setState({ OperationType: '' });
                    }}
                  />
                )
              });
            }}
          >
            {selloutStore.operatetype.typeName
              ? selloutStore.operatetype.typeName
              : '全部'}
            <i className="iconfont icon-Shapearrow-" />
          </div>
          <div className="div-spfl" onClick={this.clickclass}>
            {this.state.defaultvalue}
            <i className="iconfont icon-Shapearrow-" />
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="请输入商品/拼音码/原因进行查询"
            onKeyUp={this.reachValue}
          />
          <button
            className="search-button"
            onClick={() => {
              selloutStore.getOperationhistory({
                storeDay: this.state.formattime,
                changeType: selloutStore.operatetype.TypeID,
                categoryID:
                  selloutStore.lastcombination.lastid === ''
                    ? '0'
                    : selloutStore.lastcombination.lastid,
                searchContent: this.state.recordValue
              });
            }}
          >
            <i className="iconfont icon-home_icon_searchx" /> 查询
          </button>
        </div>
        <div className="operation-history-main">
          <MyScroll>
            {selloutStore.Operationhistorylist.length ? (
              selloutStore.Operationhistorylist.map((history, index) => {
                return (
                  <Historylist
                    key={index}
                    selloutStore={selloutStore}
                    history={history}
                  />
                );
              })
            ) : (
              <div className="empty-holder">暂无数据</div>
            )}
          </MyScroll>
        </div>
        {this.state.Calendar}
        {this.state.Commodity}
        {this.state.OperationType}
        {operatePrompt}
      </div>
    );
  }
}

OperationHistoryPopup.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default OperationHistoryPopup;
