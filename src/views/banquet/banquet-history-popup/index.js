import React from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import './banquet-history-popup.less';

@inject('banquetCreateStore', 'banquetListStore')
@observer
class BanquetHistoryPopup extends React.Component {
  //关闭按钮事件
  handleCancel = () => {
    if (this.props.closepopup) {
      this.props.closepopup();
    }
  };

  //确定按钮事件
  handleOk = () => {
    if (this.props.okpopup) {
      this.props.okpopup();
    }
  };

  banquetListStore = this.props.banquetListStore;
  render() {
    let historyList = this.banquetListStore.historyList;
    return (
      <div>
        <Modal
          title="预订修改查询"
          visible={true}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={840}
          wrapClassName="banquet-history-popup-modal"
        >
          <div className="banquet-history-main">
            <Scrollbars>
              <div className="each-main">
                {(() => {
                  if (historyList.length > 0) {
                    return historyList.map((his, index) => {
                      return (
                        <div className="each-data" key={index}>
                          <p className="each-p">
                            <span>
                              <em>修改时间</em>
                              {his.updateTime}
                            </span>
                            <span>
                              <em>修改人</em>
                              {his.modifier}
                            </span>
                            <span>
                              <em>修改原因</em>
                              {his.Memo}
                            </span>
                          </p>
                          <div className="before-after">
                            <p className="show-p">
                              <span>
                                {' '}
                                <i>修改前</i>{' '}
                              </span>
                              <span>
                                <em>预订桌数</em>
                                {his.BeforeNo === null ? 0 : his.BeforeNo}桌
                              </span>
                              <span>
                                <em>备用桌数</em>
                                {his.BeforeBackupNum === null ? (
                                  0
                                ) : (
                                  his.BeforeBackupNum
                                )}桌
                              </span>
                              <span>
                                <em>订单总额</em>
                                {his.BeforeAmount === null ? (
                                  0
                                ) : (
                                  his.BeforeAmount
                                )}元
                              </span>
                              <span>
                                <em>已收订金</em>
                                {his.BeforeBookedAmount === null ? (
                                  0
                                ) : (
                                  his.BeforeBookedAmount
                                )}元
                              </span>
                            </p>
                            <p className="show-p">
                              <span>
                                {' '}
                                <i>修改后</i>{' '}
                              </span>
                              <span>
                                <em>预订桌数</em>
                                {his.AfterNo === null ? 0 : his.AfterNo}桌
                              </span>
                              <span>
                                <em>备用桌数</em>
                                {his.AfterBackupNum === null ? (
                                  0
                                ) : (
                                  his.AfterBackupNum
                                )}桌
                              </span>
                              <span>
                                <em>订单总额</em>
                                {his.AfterAmount === null ? (
                                  0
                                ) : (
                                  his.AfterAmount
                                )}元
                              </span>
                              <span>
                                <em>已收订金</em>
                                {his.AfterBookChangeAmount === null ? (
                                  0
                                ) : (
                                  his.AfterBookChangeAmount
                                )}元
                              </span>
                            </p>
                          </div>
                          <div className="money-div">
                            <span>
                              <em>加收费用</em>
                              {his.AdditionAmount === null ? (
                                0
                              ) : (
                                his.AdditionAmount
                              )}元
                            </span>
                            <span>
                              <em>追加订金</em>
                              {his.BookChangedAmount === null ? (
                                0
                              ) : (
                                his.BookChangedAmount
                              )}元
                            </span>
                          </div>
                        </div>
                      );
                    });
                  }
                })()}
                {historyList.length === 0 && (
                  <div className="empty-holder">暂无数据</div>
                )}
              </div>
            </Scrollbars>
          </div>
        </Modal>
      </div>
    );
  }
}

export default BanquetHistoryPopup;
