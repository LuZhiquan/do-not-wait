/**
* @author gm
* @description 取消预订原因弹窗
* @date 2017-05-17
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import MyScroll from 'components/my-scrollbar';
import { Modal, Tabs } from 'antd';

import './select_desk_popup.less';
const TabPane = Tabs.TabPane;

@inject('banquetCreateStore')
@observer
class SelectDesk extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 0
    };
  }

  handleOk = () => {
    if (this.props.handleOk) {
      this.props.handleOk();
    }
  };

  handleCancel = () => {
    if (this.props.handleCancel) {
      this.props.handleCancel();
    }
  };

  componentDidMount() {
    let { banquetCreateStore, bookingID } = this.props;

    banquetCreateStore.getBookingAreaList(bookingID);
  }

  //获取对应区域桌台数
  getDeskNumber(areaID) {
    let { banquetCreateStore } = this.props;

    if (areaID === '') {
      return banquetCreateStore.selectDesk.length;
    } else {
      let arr = banquetCreateStore.selectDesk.filter((desk, index) => {
        return desk.areaID === areaID;
      });
      return arr.length;
    }
  }

  render() {
    let { banquetCreateStore } = this.props;

    return (
      <div>
        <Modal
          title="选择占用桌台"
          visible={true}
          maskClosable={false}
          width={840}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrapClassName="banquet-select-desk-modal"
        >
          <div className="banquet-select-desk-container">
            <div className="banquet-title">
              <div className="text">
                已选{banquetCreateStore.selectDesk.length}桌／共{banquetCreateStore.allDeskNumber}桌
              </div>
              <div
                className="all"
                onClick={() => {
                  banquetCreateStore.allDeskClick(this.state.key);
                }}
              >
                {banquetCreateStore.isSelectAll ? (
                  <i className="iconfont icon-icon_checkbox_sel" />
                ) : (
                  <i className="iconfont icon-yuan" />
                )}
                全选
              </div>
            </div>
            <div className="content">
              <Tabs
                tabPosition="left"
                defaultActiveKey="0"
                onTabClick={key => {
                  banquetCreateStore.deskTabClick(key, this.props.bookingID);
                  this.setState({ key: key });
                }}
              >
                {banquetCreateStore.areaList.length > 0 &&
                  banquetCreateStore.areaList.map((area, index) => {
                    return (
                      <TabPane
                        tab={
                          <span className="tab-name">
                            {this.getDeskNumber(area.areaID) > 0 && (
                              <i>{this.getDeskNumber(area.areaID)}</i>
                            )}
                            {area.areaName}
                          </span>
                        }
                        key={index}
                      >
                        <MyScroll width={640} height={402}>
                          {banquetCreateStore.deskList.length > 0 &&
                            banquetCreateStore.deskList.map((desk, mindex) => {
                              return (
                                <li
                                  key={mindex}
                                  className={classnames({
                                    'desk-item': true,
                                    select: desk.select,
                                    iconfont: true,
                                    small: desk.tableCode.length > 8
                                  })}
                                  onClick={() => {
                                    banquetCreateStore.deskItemClick(desk);
                                  }}
                                >
                                  {desk.tableCode}
                                </li>
                              );
                            })}
                        </MyScroll>
                      </TabPane>
                    );
                  })}
              </Tabs>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default SelectDesk;
