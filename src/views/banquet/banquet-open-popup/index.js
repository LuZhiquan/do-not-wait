/**
* @author Shelly
* @description 宴会预定单开台
* @date 2017-06-27
**/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal } from 'antd';
import { message } from 'antd';
import PromptPopup from 'components/prompt-popup';
import Scrollbars from 'react-custom-scrollbars';

import './banquet_open.less';
message.config({
  top: 300
});

const promptContStyle = {
  padding: '80px 20px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
};

@inject('banquetCreateStore')
@observer
class Open extends Component {
  constructor(props) {
    super(props);

    let { banquetCreateStore, bookingID } = this.props;
    banquetCreateStore.toOpenTable(bookingID);

    this.state = {
      openNum: ['', '', '', '', '', '', '', '', '', ''],
      overPopup: ''
    };
  }

  //关闭的按钮
  handleCancel = () => {
    if (this.props.closepopup) {
      this.props.closepopup();
    }
  };

  //取消的按钮
  cancelOpen = () => {
    if (this.props.closepopup) {
      this.props.closepopup();
    }
  };

  //（打厨）
  kitchen = value => {
    let { banquetCreateStore, bookingID } = this.props;

    let typeList = [];
    let openNum = this.state.openNum;

    let allOpenNum = 0,
      totalBookingNum = 0,
      openZero = false;
    if (banquetCreateStore.openTableMessage) {
      banquetCreateStore.openTableMessage.tableTypes.forEach((type, index) => {
        let actualNum = openNum[index] ? openNum[index] * 1 : 0;
        let { typeID } = type;
        allOpenNum += actualNum * 1 + type.actualNum * 1;
        totalBookingNum += type.bookingNum * 1 + type.backupNum * 1;
        typeList.push({ typeID, actualNum });
      });
      banquetCreateStore.openTableMessage.tableTypes.forEach((type, index) => {
        if (openNum[index] > 0) {
          openZero = true;
          return;
        }
      });
    }

    //开台数有0
    if (openZero) {
      if (allOpenNum > totalBookingNum) {
        //开台数量大于预订备用和预定桌数之和
        this.setState({
          overPopup: (
            <PromptPopup
              onCancel={() => {
                this.setState({ overPopup: '' });
              }}
              onOk={() => {
                //开台打厨 value=1
                if (value) {
                  banquetCreateStore.openKitchen(bookingID, typeList, () => {
                    this.setState({ overPopup: '' });
                    if (this.props.okClick) {
                      this.props.okClick();
                    }
                  });
                } else {
                  //开台不打厨 value=0
                  banquetCreateStore.openNotKitchen(bookingID, typeList, () => {
                    this.setState({ overPopup: '' });
                    if (this.props.okClick) {
                      this.props.okClick();
                    }
                  });
                }
              }}
              okText={'继续'}
            >
              <div className="prompt" style={promptContStyle}>
                <span className="delele-text">
                  本次开台后将超过总预订桌数{totalBookingNum}桌（含备用桌），是否继续？
                </span>
              </div>
            </PromptPopup>
          )
        });
      } else {
        //开台打厨 value=1
        if (value) {
          banquetCreateStore.openKitchen(bookingID, typeList, () => {
            this.setState({ overPopup: '' });
            if (this.props.okClick) {
              this.props.okClick();
            }
          });
        } else {
          //开台不打厨 value=0
          banquetCreateStore.openNotKitchen(bookingID, typeList, () => {
            this.setState({ overPopup: '' });
            if (this.props.okClick) {
              this.props.okClick();
            }
          });
        }
      }
    } else {
      message.destroy();
      message.warn('开台桌数要大于0', 1);
    }
  };

  render() {
    let { banquetCreateStore } = this.props;
    let { openTableMessage } = banquetCreateStore;

    let booking = openTableMessage.booking;
    let tableTypes = openTableMessage.tableTypes;

    return (
      <Modal
        title="宴会开台"
        visible={true}
        maskClosable={false}
        okText="确定"
        cancelText="取消"
        footer={null}
        width={900}
        wrapClassName="banquet-open"
        onCancel={this.handleCancel}
      >
        <div className="dishes-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              //返回预定界面
              this.context.router.goBack();
            }}
          />宴会预订开台
        </div>
        <div className="content-wrap">
          <div className="content">
            <Scrollbars>
              <ul className="open-info">
                <li>
                  <span className="info-name">客户姓名</span>
                  <span>{openTableMessage && booking.customerName}</span>
                </li>
                <li>
                  <span className="info-name">宴会名称</span>
                  <span>{openTableMessage && booking.partyName}</span>
                </li>
                <li>
                  <span className="info-name">电话号码</span>
                  <span>{openTableMessage && booking.phone}</span>
                </li>
                <li>
                  <span className="info-name">宴会类型</span>
                  <span>{openTableMessage && booking.partyTypeName}</span>
                </li>
                <li>
                  <span className="info-name">宴会时间</span>
                  <span>{openTableMessage && booking.bookingTime}</span>
                </li>
                <li>
                  <span className="info-name">开席时间</span>
                  <span>
                    {openTableMessage && booking.openTime.split(' ')[1]}
                  </span>
                </li>
                <li>
                  <span className="info-name">预订说明</span>
                  <span>{openTableMessage && booking.bookingDesc}</span>
                </li>
              </ul>
              {openTableMessage &&
                tableTypes.map((type, index) => {
                  return (
                    <div key={index}>
                      {openTableMessage &&
                      tableTypes.length > 1 && (
                        <div className="more-table-title">
                          <span>{type.typeName}</span>
                        </div>
                      )}
                      <div className="title-info">
                        <span>预定桌数</span>
                        <span className="fill-content">{type.bookingNum}桌</span>
                        <span>备用桌数</span>
                        <span className="fill-content">{type.backupNum}桌</span>
                        <span>每桌人数</span>
                        <span className="fill-content">{type.peopleNum}人</span>
                        <span>已开台数</span>
                        <span className="fill-content">
                          {type.actualNum ? type.actualNum : 0}桌
                        </span>
                        <span>
                          本次开台桌数<input
                            type="text"
                            value={this.state.openNum[index]}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                let openNum = this.state.openNum;
                                openNum[index] = e.target.value;
                                this.setState({ openNum: openNum });
                              }
                            }}
                          />
                          <strong>桌</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
            </Scrollbars>
          </div>

          <div className="bottom-btn">
            <button className="btn" onClick={this.cancelOpen}>
              取消
            </button>
            <button
              className="btn selected"
              onClick={this.kitchen.bind(1, this)}
            >
              开台 （打厨）
            </button>
            <button
              className="btn selected"
              onClick={this.kitchen.bind(0, this)}
            >
              开台 （不打厨）
            </button>
          </div>
        </div>

        {this.state.overPopup}
      </Modal>
    );
  }
}

export default Open;
