import React from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Collapse } from 'antd';
import './order-details-popup.less';
import MyScroll from 'components/my-scrollbar';
import Scrollbars from 'react-custom-scrollbars';

const Panel = Collapse.Panel;

@inject('banquetCreateStore', 'banquetListStore')
@observer
class OrderDetailsPopup extends React.Component {
  constructor(props, context, handleClick) {
    super(props, context);
  }

  banquetListStore = this.props.banquetListStore;

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

  render() {
    let tableTypesList = this.banquetListStore.tableTypesList;
    let mainInfoobj = this.banquetListStore.mainInfoobj;
    let costDetail = this.banquetListStore.costDetail;
    let tradeRecords = this.banquetListStore.tradeRecords;
    let addProds = this.banquetListStore.addProds;

    return (
      <div>
        <Modal
          title="订单详情"
          visible={true}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={900}
          wrapClassName="order-details-popup-modal"
        >
          <div className="banquet-order-details-main">
            <div className="order-details-left">
              <Scrollbars>
                <div className="order-details-left-main">
                  <div className="details-content">
                    <span>宴会单号</span>
                    <em>{mainInfoobj.bookingID}</em>
                  </div>
                  <div className="details-content">
                    <span>客户姓名</span>
                    <em>{mainInfoobj.customerName}</em>
                    <span>电话</span>
                    <em>{mainInfoobj.phone}</em>
                  </div>
                  <div className="details-content">
                    <span>宴会名称</span>
                    <em>{mainInfoobj.partyName}</em>
                    <span>宴会类型</span>
                    <em>{mainInfoobj.partyTypeName}</em>
                  </div>
                  <div className="details-content">
                    <span>宴会日期</span>
                    <em>{mainInfoobj.bookingTime}</em>
                    <span>开席时间</span>
                    <em>{this.banquetListStore.openTime}</em>
                  </div>
                  {(() => {
                    return tableTypesList.map((tab, index) => {
                      return (
                        <div className="order-classification" key={index}>
                          {tab.TypeName !== '' && <p>{tab.TypeName}</p>}
                          <div className="details-content">
                            <span>预定桌数</span>
                            <em>{tab.BookingNum}桌</em>
                            <span>备用桌数</span>
                            <em>{tab.BackupNum}桌</em>
                          </div>
                          <div className="details-content">
                            <span>每桌价格</span>
                            <em>{tab.Amount}元</em>
                            <span>金额</span>
                            <em>{tab.TotalAmount}元</em>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  <div className="details-content">
                    <span>加收费用</span>
                    <em>{mainInfoobj.additionAmount} 元</em>
                    <span>订单总额</span>
                    <em>{mainInfoobj.banqTotalAmount} 元</em>
                  </div>
                  <hr className="css-hr" />
                  <div className="normal-condition">
                    <div className="details-content">
                      <span>预定说明</span>
                      <em>{mainInfoobj.bookingDesc}</em>
                    </div>
                    <div className="details-content">
                      <span>场地布置</span>
                      <em>{mainInfoobj.layoutSite}</em>
                    </div>
                    <div className="details-content">
                      <span>摆台要求</span>
                      <em>{mainInfoobj.dressTable}</em>
                    </div>
                    <div className="details-content">
                      <span>音响要求</span>
                      <em>{mainInfoobj.audio}</em>
                    </div>
                  </div>
                  {costDetail && (
                    <div>
                      <hr className="css-hr" />
                      <div className="may-need">
                        <div className="details-content">
                          <span>宴会菜金</span>
                          <em>{costDetail.ActualAmount}</em>
                          <span>加收费用</span>
                          <em>{costDetail.AdditionAmount}</em>
                        </div>
                        <div className="details-content">
                          <span>加菜金额</span>
                          <em>{costDetail.AddProdAmountf}</em>
                          <span>折扣金额</span>
                          <em>{costDetail.DiscountAmount}</em>
                        </div>
                        <div className="details-content">
                          <span>调整金额</span>
                          <em>{costDetail.AdjustmentAmount}</em>
                          <span>应收</span>
                          <em>{costDetail.PendingAmount}</em>
                        </div>
                      </div>
                    </div>
                  )}

                  {tradeRecords.length > 0 && (
                    <div>
                      <hr className="css-hr" />
                      <div className="collection-record">
                        <p>收款纪录</p>
                        {(() => {
                          return tradeRecords.map((tab, index) => {
                            return (
                              <span key={index}>
                                {tab.payType}
                                {tab.ChangeAmount}
                              </span>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </Scrollbars>
            </div>
            <div className="order-details-right">
              <p className="right-title">菜品详情</p>
              <MyScroll width={418} height={409}>
                <div className="order-details-right-main">
                  {(() => {
                    return tableTypesList.map((tab, index) => {
                      return (
                        <Collapse
                          bordered={false}
                          key={index}
                          defaultActiveKey={['0']}
                        >
                          {tab.ActualNum > 0 && (
                            <Panel
                              header={
                                <div className="show-content">
                                  <div className="content-title">
                                    {tab.TypeName !== '' && (
                                      <em>{tab.TypeName}</em>
                                    )}
                                    <span>每桌¥{tab.Amount}</span>
                                    <span>共{tab.ActualNum}桌</span>
                                    <span>金额：¥{tab.TotalAmount}元</span>
                                  </div>
                                </div>
                              }
                            >
                              {tab.orderDetailInfos.map((child, index) => {
                                if (child.IsCombo) {
                                  return (
                                    <div className="order-submenu" key={index}>
                                      <div className="order-main">
                                        <div className="order-title">
                                          <span>{index + 1}</span>
                                          <span>
                                            {' '}
                                            <i>套</i> {child.ProductName}
                                          </span>
                                          <span>
                                            {child.Quantity}X{tab.ActualNum}席
                                          </span>
                                        </div>
                                      </div>

                                      {child.comboDetailInfos.map(
                                        (combo, i) => {
                                          return (
                                            <div className="each-order" key={i}>
                                              <p className="order-p">
                                                <span>{combo.ProductName}</span>
                                              </p>
                                              {combo.ValueNames && (
                                                <em>做法：{combo.ValueNames}</em>
                                              )}
                                              {combo.DetailDesc && (
                                                <em>备注：{combo.DetailDesc}</em>
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="order-submenu" key={index}>
                                      <div className="order-main">
                                        <div className="order-title">
                                          <span>{index + 1}</span>
                                          <span> {child.ProductName}</span>
                                          <span>
                                            {child.Quantity}X{tab.ActualNum}席
                                          </span>
                                        </div>
                                        <div>
                                          {child.ValueNames && (
                                            <p>做法：{child.ValueNames}</p>
                                          )}
                                          {child.DetailDesc && (
                                            <p>备注：{child.DetailDesc}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              })}
                            </Panel>
                          )}
                        </Collapse>
                      );
                    });
                  })()}

                  <Collapse bordered={false} defaultActiveKey={['0']}>
                    <Panel
                      disabled
                      header={
                        <div className="show-content">
                          <div className="content-title">
                            <em>加菜清单</em>
                          </div>
                        </div>
                      }
                    >
                      {(() => {
                        return addProds.map((tab, index) => {
                          if (tab.IsCombo) {
                            return (
                              <div className="order-submenu" key={index}>
                                <div className="order-main">
                                  <div className="order-title-special">
                                    <span>{index + 1}</span>
                                    <span>
                                      {' '}
                                      <i>套</i> {tab.ProductName}
                                    </span>
                                    <span>
                                      {tab.Quantity}X{tab.CopiesNum}席
                                    </span>
                                    <span>￥{tab.OriginalPrice}</span>
                                  </div>
                                  <div>
                                    {tab.ValueNames && (
                                      <p>做法：{tab.ValueNames}</p>
                                    )}
                                    {tab.DetailDesc && (
                                      <p>备注：{tab.DetailDesc}</p>
                                    )}
                                    {tab.TableName && <p>桌台：{tab.TableName}</p>}
                                  </div>
                                </div>
                                {tab.comboDetailInfos.map((combo, i) => {
                                  return (
                                    <div className="each-order" key={i}>
                                      <p className="order-p">
                                        <span>{combo.ProductName}</span>
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          } else {
                            return (
                              <div className="order-submenu" key={index}>
                                <div className="order-main">
                                  <div className="order-title-special">
                                    <span>{index + 1}</span>
                                    <span> {tab.ProductName}</span>
                                    <span>
                                      {tab.Quantity}X{tab.CopiesNum}席
                                    </span>
                                    <span>￥{tab.OriginalPrice}</span>
                                  </div>
                                  <div>
                                    {tab.TableName && <p>桌台：{tab.TableName}</p>}
                                    {tab.ValueNames && (
                                      <p>做法：{tab.ValueNames}</p>
                                    )}
                                    {tab.DetailDesc && (
                                      <p>备注：{tab.DetailDesc}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        });
                      })()}
                    </Panel>
                  </Collapse>
                </div>
              </MyScroll>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default OrderDetailsPopup;
