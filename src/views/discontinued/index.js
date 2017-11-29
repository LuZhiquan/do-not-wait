import React from 'react';
import { message, Table } from 'antd';
import { observer, inject } from 'mobx-react';
import MyScroll from 'react-custom-scrollbars'; //滚动条
import RightMemu from './discontinued-popup/right-memu'; //右侧菜品组件
import Prompt from 'components/prompt-common'; //错误提示
import classnames from 'classnames';
import './discontinued.less';

message.config({
  top: 300
});

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    className: 'data-title'
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    className: 'data-title'
  },
  {
    title: '单位',
    dataIndex: 'unit',
    className: 'data-title'
  },
  {
    title: '操作人',
    dataIndex: 'creatorName',
    className: 'data-title'
  },
  {
    title: '操作时间',
    dataIndex: 'createTime',
    className: 'data-title'
  }
];

//停售
@inject('discontinuedStore')
@observer
class Discontinued extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      recordValue: '', //搜索内容文本框
      showchecked: false, //默认是不显示多选按钮的
      selectedRowKeys: [],
      buttontype: 1 //控制按钮名字
    };
  }

  componentDidMount() {
    let discontinuedStore = this.props.discontinuedStore;
    discontinuedStore.getHaltsSalesList({ searchCode: '' });
  }

  componentDidUpdate() {
    let discontinuedStore = this.props.discontinuedStore;
    let feedback = discontinuedStore.feedback;
    if (feedback) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, discontinuedStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, discontinuedStore.closeFeedback());
          break;
        case 'error':
          message.warn(feedback.msg, discontinuedStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, discontinuedStore.closeFeedback());
      }
    }
  }

  //获取搜索的内容
  reachValue = e => {
    var value = e.target.value;
    this.props.discontinuedStore.recordValue = value;
    this.setState({ recordValue: value });
  };

  //查询
  queryselect = () => {
    let discontinuedStore = this.props.discontinuedStore;
    discontinuedStore.getHaltsSalesList({ searchCode: this.state.recordValue });
  };

  //批量操作
  Batchoperation = () => {
    if (this.state.buttontype === 1) {
      this.setState({ showchecked: true, buttontype: 2 });
      let discontinuedStore = this.props.discontinuedStore;
      discontinuedStore.menuIDstring = ''; //清空数组
      let haltsSalesList = discontinuedStore.haltsSalesList; //返回的数组
      haltsSalesList.map(function(obj) {
        obj.selected = false;
        return obj;
      });
    } else {
      this.setState({ showchecked: false, buttontype: 1 });
      this.setState({ selectedRowKeys: [] });
    }
  };

  //取消停售
  canceldisconbtinued = () => {
    let discontinuedStore = this.props.discontinuedStore;
    if (discontinuedStore.menuIDstring.length === 0) {
      message.destroy();
      message.warn('请选中数据');
    } else {
      discontinuedStore.batchCancleHaltsSales(discontinuedStore.menuIDstring);
      this.setState({ selectedRowKeys: [] });
    }
  };

  onSelectChange = selectedRowKeys => {
    let discontinuedStore = this.props.discontinuedStore;
    let lemp = JSON.stringify(selectedRowKeys);
    lemp = lemp.substr(1, lemp.length - 2);
    discontinuedStore.menuIDstring = lemp;
    this.setState({ selectedRowKeys });
  };

  render() {
    const { selectedRowKeys } = this.state;
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let CancelStopSale = permissionList.includes('OtherModule:CancelStopSale'); //取消停售
    let discontinuedStore = this.props.discontinuedStore;
    let haltsSalesList = discontinuedStore.haltsSalesList; //返回的数组

    let datalist = [];

    let rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };

    haltsSalesList.map(function(obj, i) {
      datalist.push({
        key: obj.menuID,
        selected: obj.selected,
        index: i + 1,
        productName: obj.productName,
        unit: obj.unit,
        creatorName: obj.creatorName,
        createTime: obj.createTime
      });
      return obj;
    });

    let feedback = discontinuedStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        discontinuedStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }
    return (
      <div className="discontinued-modal">
        <div className="estimate-title">停售</div>
        <i
          className="iconfont icon-order_btn_back"
          onClick={() => {
            this.context.router.goBack();
          }}
        />
        <div className="estimate-clear-main">
          <div className="estimate-left">
            <div className="estimate-left-search">
              <input
                type="text"
                placeholder="请输入商品编码/名称/拼音码查询"
                className="estimate-left-input"
                onKeyUp={this.reachValue}
              />
              <button className="search-box" onClick={this.queryselect}>
                <i className="iconfont icon-order_btn_search" />查询
              </button>
            </div>
            <div className="main-block">
              <div className="estimate-list-button">
                <div className="estimate-list">
                  <MyScroll>
                    <Table
                      rowSelection={
                        this.state.showchecked === true ? rowSelection : null
                      }
                      columns={columns}
                      dataSource={datalist}
                      pagination={false}
                      onRowClick={(record, index) => {
                        if (this.state.showchecked === false) {
                          discontinuedStore.checkeddiscontList(record.key);
                          discontinuedStore.menuIDstring = record.key.toString();
                        }
                      }}
                      rowClassName={(record, index) => {
                        return record.selected
                          ? 'each-data click-data'
                          : 'each-data';
                      }}
                    />

                    {datalist.length === 0 && (
                      <div className="empty-holder">暂无数据</div>
                    )}
                  </MyScroll>
                </div>
                <div className="estimate-button">
                  {CancelStopSale && (
                    <button
                      className={classnames({
                        disabled: haltsSalesList.length === 0
                      })}
                      onClick={
                        haltsSalesList.length > 0 && this.canceldisconbtinued
                      }
                    >
                      取消停售
                    </button>
                  )}

                  <button
                    className={classnames({
                      changebt: this.state.buttontype === 2
                    })}
                    onClick={this.Batchoperation}
                  >
                    {this.state.buttontype === 1 ? '批量操作' : '取消批量'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="estimate-right">
            <RightMemu> </RightMemu>
          </div>
        </div>
        {operatePrompt}
      </div>
    );
  }
}

Discontinued.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Discontinued;
