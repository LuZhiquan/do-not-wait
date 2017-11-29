/**
* @author gm
* @description 客勤档案模块
* @date 2017-05-17
**/
import React, { Component } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Tabs } from 'antd';

import './customer_archive_block.less';
const TabPane = Tabs.TabPane;

class CustomerArchiveBlock extends Component {
  constructor(props) {
    super(props);
    this.state = { customerPopup: '' };
  }

  render() {
    let customer = this.props.customerArchives;
    let isVip = customer && customer.memberInfo && customer.memberInfo.roleID;

    return (
      <div id="customer_archive_block">
        <Scrollbars>
          <div className="archive-content-block">
            <div>
              <ul className="info">
                <li className="name">
                  {customer &&
                    customer.memberInfo &&
                    customer.memberInfo.roleName}
                </li>
                {false && (
                  <li
                    className="iconfont icon-home_icon_searchx"
                    onClick={() => {
                      // this.setState({customerPopup:<GuestSearchPopup/>});
                    }}
                  />
                )}
              </ul>
              <ul className="my-list">
                <li>
                  <span className="li-title">{isVip ? '发卡日期：' : '首次消费：'}</span>
                  {customer &&
                    customer.memberInfo &&
                    customer.memberInfo.issueTime}
                </li>
                <li>
                  <span className="li-title">{isVip ? '发卡门店：' : '消费门店：'}</span>
                  {customer &&
                    customer.memberInfo &&
                    customer.memberInfo.merchantName}
                </li>
                <li>
                  <span className="li-title">累计充值：</span>
                  {customer &&
                    customer.memberInfo &&
                    customer.memberInfo.cumulateRecharge}
                </li>
                <li>
                  <span className="li-title">可用余额：</span>
                  {customer &&
                    customer.memberInfo &&
                    customer.memberInfo.canUseAmount}
                </li>
                <li>
                  <span className="li-title">累计积分：</span>
                  {customer &&
                    customer.memberInfo &&
                    customer.memberInfo.totalBonus}
                </li>
                <li>
                  <span className="li-title">可用积分：</span>
                  {customer &&
                    customer.memberInfo &&
                    customer.memberInfo.currentBonus}
                </li>
              </ul>
            </div>
            <ul className="number">
              <li>
                <p>
                  {(customer &&
                    customer.memberInfo &&
                    customer.memberInfo.bookingCount) ||
                    0}
                </p>
                <div>预订次数</div>
              </li>
              <li>
                <p>
                  {(customer &&
                    customer.memberInfo &&
                    customer.memberInfo.cancelCount) ||
                    0}
                </p>
                <div>取消次数</div>
              </li>

              <li>
                <p>
                  {(customer &&
                    customer.memberInfo &&
                    customer.memberInfo.expiredCount) ||
                    0}
                </p>
                <div>未到次数</div>
              </li>
              <li>
                <p>
                  {(customer &&
                    customer.memberInfo &&
                    customer.memberInfo.consumeCount) ||
                    0}
                </p>
                <div>消费次数</div>
              </li>

              <li>
                <p>
                  {customer &&
                  customer.memberInfo &&
                  customer.memberInfo.cumulateConsume ? (
                    (customer.memberInfo.cumulateConsume * 1).toFixed(2)
                  ) : (
                    0
                  )}
                </p>
                <div>消费总额</div>
              </li>

              <li>
                <p>
                  {customer &&
                  customer.memberInfo &&
                  customer.memberInfo.avgConsume ? (
                    (customer.memberInfo.avgConsume * 1).toFixed(2)
                  ) : (
                    0
                  )}
                </p>
                <div>单均消费</div>
              </li>

              <li>
                <p>
                  {customer &&
                  customer.memberInfo &&
                  customer.memberInfo.avgPersonConsume ? (
                    (customer.memberInfo.avgPersonConsume * 1).toFixed(2)
                  ) : (
                    0
                  )}
                </p>
                <div>人均消费</div>
              </li>
            </ul>
            <div className="records">
              <Tabs defaultActiveKey="1">
                <TabPane tab="预订纪录" key="1">
                  <div className="list reverse-record">
                    <ul className="records-title">
                      <li>序号</li>
                      <li>预订时间</li>
                      <li>人数</li>
                      <li>桌台</li>
                      <li>预订方式</li>
                      <li>来源</li>
                      <li>状态</li>
                      <li>备注</li>
                    </ul>
                    <div className="records-content">
                      <Scrollbars>
                        {customer.bookingRecord &&
                          customer.bookingRecord.length > 0 &&
                          customer.bookingRecord.map((record, index) => {
                            let bookingStatus, bookingType;
                            switch (record.bookingStatus) {
                              case 617:
                                bookingStatus = '未知';
                                break;
                              case 618:
                                bookingStatus = '成功';
                                break;
                              case 619:
                                bookingStatus = '失败';
                                break;
                              case 620:
                                bookingStatus = '已过期';
                                break;
                              case 621:
                                bookingStatus = '已删除';
                                break;
                              case 622:
                                bookingStatus = '已改期';
                                break;
                              case 729:
                                bookingStatus = '已取消';
                                break;
                              case 759:
                                bookingStatus = '预订完成';
                                break;
                              case 762:
                                bookingStatus = '排队';
                                break;
                              case 1002:
                                bookingStatus = '进行中';
                                break;
                              case 1012:
                                bookingStatus = '待支付';
                                break;
                              default:
                                break;
                            }

                            switch (record.bookingType) {
                              case 614:
                                bookingType = '预订点菜';
                                break;
                              case 615:
                                bookingType = '预订留位';
                                break;
                              case 616:
                                bookingType = '普通预订';
                                break;
                              default:
                                break;
                            }
                            return (
                              <div className="con-item" key={index}>
                                <span>{index + 1}</span>
                                <span>{record.bookingTime}</span>
                                <span>{record.peopleNum}</span>
                                <span>{record.tableCodes}</span>
                                <span>{bookingType}</span>
                                <span>{record.bookingChannelDesc}</span>
                                <span>{bookingStatus}</span>
                                <span>{record.memo}</span>
                              </div>
                            );
                          })}
                      </Scrollbars>
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="消费纪录" key="2">
                  <div className="list consume-record">
                    <ul className="records-title">
                      <li>序号</li>
                      <li>消费单号</li>
                      <li>预订时间</li>
                      <li>消费</li>
                      <li>优惠</li>
                      <li>付款</li>
                      <li>人数</li>
                      <li>桌台</li>
                    </ul>
                    <div className="records-content">
                      <Scrollbars>
                        {customer.consumeRecord &&
                          customer.consumeRecord.length > 0 &&
                          customer.consumeRecord.map((record, index) => {
                            return (
                              <div className="con-item" key={index}>
                                <span>{index + 1}</span>
                                <span>
                                  {record.orderCode && record.orderCode}
                                </span>
                                <span>
                                  {record.bookingTime && record.bookingTime}
                                </span>
                                <span>
                                  {record.totalAmount && record.totalAmount}
                                </span>
                                <span>
                                  {record.discountAmount &&
                                    record.discountAmount}
                                </span>
                                <span>
                                  {record.actualAmount && record.actualAmount}
                                </span>
                                <span>
                                  {record.peopleNum && record.peopleNum}
                                </span>
                                <span>
                                  {record.tableName && record.tableName}
                                </span>
                              </div>
                            );
                          })}
                      </Scrollbars>
                    </div>
                  </div>
                </TabPane>

                <TabPane tab="点菜偏好" key="3">
                  <div className="list preference-record">
                    <ul className="records-title">
                      <li>序号</li>
                      <li>菜品名称</li>
                      <li>单位</li>
                      <li>点菜次数</li>
                      <li>最近点菜</li>
                    </ul>
                    <div className="records-content">
                      <Scrollbars>
                        {customer.orderDishesRecord &&
                          customer.orderDishesRecord.length > 0 &&
                          customer.orderDishesRecord.map((record, index) => {
                            return (
                              <div className="con-item" key={index}>
                                <span>{index + 1}</span>
                                <span>
                                  {record.productName && record.productName}
                                </span>
                                <span>
                                  {record.productUnit && record.productUnit}
                                </span>
                                <span>
                                  {record.detailCount && record.detailCount}
                                </span>
                                <span>
                                  {record.createTime && record.createTime}
                                </span>
                              </div>
                            );
                          })}
                      </Scrollbars>
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="口味偏好" key="4">
                  <div className="list consume-taste">
                    <ul className="records-title">
                      <li>序号</li>
                      <li>口味</li>
                      <li>次数</li>
                    </ul>
                    <div className="records-content">
                      <Scrollbars>
                        {customer.orderTasteRecord &&
                          customer.orderTasteRecord.length > 0 &&
                          customer.orderTasteRecord.map((taste, index) => {
                            return (
                              <div className="con-item" key={index}>
                                <span>{index + 1}</span>
                                <span>{taste.attributeName}</span>
                                <span>{taste.attributeCount}</span>
                              </div>
                            );
                          })}
                      </Scrollbars>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </Scrollbars>
      </div>
    );
  }
}

export default CustomerArchiveBlock;
