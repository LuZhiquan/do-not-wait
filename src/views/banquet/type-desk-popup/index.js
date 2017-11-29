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

@inject('banquetListStore')
@observer
class SelectDesk extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 0
    };
  }

  handleOk = () => {
    let tablenameList = []; //点菜需要的list
    this.props.banquetListStore.selectDesk.forEach((item, mindex) => {
      tablenameList.push(item.deskname);
    });
    if (this.props.handleOk) {
      this.props.handleOk(tablenameList);
    }
  };

  handleCancel = () => {
    if (this.props.handleCancel) {
      this.props.handleCancel();
    }
  };

  componentDidMount() {
    let { banquetListStore } = this.props;

    banquetListStore.getBookingAreaList(banquetListStore.banbookingID);
  }

  render() {
    let { banquetListStore } = this.props;
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
                已选{banquetListStore.selectDesk.length}桌／共{banquetListStore.allDeskNumber}桌
              </div>
              <div
                className="all"
                onClick={() => {
                  banquetListStore.allDeskClick(this.state.key);
                }}
              >
                {banquetListStore.isSelectAll ? (
                  <i className="iconfont icon-icon_checkbox_sel" />
                ) : (
                  <i className="iconfont icon-yuan" />
                )}
                全选
              </div>
            </div>
            <div className="content">
              <Tabs tabPosition="left" defaultActiveKey="0">
                {banquetListStore.areaList.length > 0 &&
                  banquetListStore.areaList.map((area, index) => {
                    return (
                      <TabPane
                        key={index}
                        tab={
                          <div
                            className="tab-name"
                            onClick={() => {
                              if (index === 0) {
                                banquetListStore.getUsableBookingTableList(
                                  banquetListStore.banbookingID
                                );
                              } else {
                                banquetListStore.getTablesList(
                                  area.typeID,
                                  area.tableTypeName
                                );
                              }
                              this.setState({ key: index });
                            }}
                          >
                            {area.tableTypeName}
                          </div>
                        }
                      >
                        <MyScroll width={640} height={402}>
                          {banquetListStore.deskList.length > 0 &&
                            banquetListStore.deskList.map((desk, mindex) => {
                              return (
                                <li
                                  key={mindex}
                                  className={classnames({
                                    'desk-item': true,
                                    select: desk.select,
                                    iconfont: true,
                                    small: desk.typeID.length > 8
                                  })}
                                  onClick={() => {
                                    banquetListStore.deskItemClick(desk);
                                  }}
                                >
                                  {desk.tableTypeName}
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
