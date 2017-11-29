import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import { message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import './modify-beposit.less';

message.config({
  top: 300
});

@inject('banquetCreateStore')
@observer
class ModifyBeposit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reasonIndex: -1,
      additionAmount: '',
      additionbookingAmount: '',
      reason: ''
    };

    let { banquetCreateStore } = this.props;
    banquetCreateStore.getBookingUpdateReasons();
  }
  //确定
  modifyOkClick = () => {
    let { banquetCreateStore } = this.props;

    let { saveData } = this.props.location.state;

    let mSaveData = JSON.parse(saveData);
    let { additionAmount, additionbookingAmount } = this.state;

    let {
      currentBanquetType,
      selectDesk,
      banquetMessage,
      tTypes,
      bookingID
    } = mSaveData;

    let tableNum = 0,
      mbackupNum = 0,
      allMoney = 0,
      allActualAmount = 0;

    //console.log("tTypes",tTypes);
    tTypes.forEach((type, index) => {
      let { bookingNum, backupNum, totalAmount, amount } = type;
      tableNum += bookingNum * 1;
      mbackupNum += backupNum * 1;
      allMoney += totalAmount * bookingNum;
      allActualAmount += bookingNum * amount;
    });
    let tableIDs = [];
    selectDesk.forEach((desk, index) => {
      let { tableID } = desk;
      tableIDs.push(tableID);
    });

    let openTime =
      banquetMessage.bookingTime.split(' ')[0] +
      ' ' +
      banquetMessage.openTime +
      ':00';

    let reason;
    if (this.state.reasonIndex >= 0) {
      reason = banquetCreateStore.updateReasons[this.state.reasonIndex];
    } else {
      reason = this.state.reason;
    }
    let object = {
      bookingID: bookingID,
      customerName: banquetMessage.customerName,
      gender: banquetMessage.gendar,
      phone: banquetMessage.phone,
      partyName: banquetMessage.partyName,
      partyType: currentBanquetType.partyType,
      tableNum: tableNum,
      backupNum: mbackupNum,
      tempNum: banquetMessage.tempNum,
      bookingTime: banquetMessage.bookingTime,
      openTime: openTime,
      duration: banquetMessage.duration,
      dressTable: banquetMessage.dressTable,
      layoutSite: banquetMessage.layoutSite,
      audio: banquetMessage.audio,
      totalAmount: (allMoney * 1).toFixed(2),
      actualAmount: (allActualAmount * 1).toFixed(2),
      bookingAmount: banquetMessage.bookingAmount,
      bookingDesc: banquetMessage.bookingMemo,
      tableIDs: tableIDs.toString(),
      reasons: reason,
      additionbookingAmount: additionbookingAmount
        ? additionbookingAmount * 1
        : 0,
      additionAmount: additionAmount ? additionAmount * 1 : 0,
      tTypes: tTypes
    };
    console.log(object);

    if (reason) {
      banquetCreateStore.modifyOkClick(JSON.stringify(object));
    } else {
      message.destroy();
      message.warn('请输入原因', 1);
    }
  };
  //取消
  modifyCancelClick = () => {
    let { banquetCreateStore } = this.props;
    banquetCreateStore.clearMessage();
    browserHistory.push('/banquet/records');
  };

  render() {
    let { banquetCreateStore } = this.props;

    let { saveData } = this.props.location.state;
    let mSaveData = JSON.parse(saveData);
    let { currentBanquetType, isMoreType, banquetMessage, tTypes } = mSaveData;

    let allMoney = 0;
    tTypes.forEach((item, index) => {
      allMoney += item.amount * item.bookingNum;
    });

    return (
      <div id="modifybeposit-main">
        <div className="banquetpay-title">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              this.context.router.goBack();
            }}
          />
          待确认
        </div>
        <div className="banquetpay-all-main">
          <div className="banquetpay-left-main">
            <div className="left-content">
              <div className="left-list">
                <Scrollbars>
                  <div className="left-list-main">
                    <p className="guest-information">
                      {banquetMessage.customerName}
                      <i className="iconfont icon-yuding_phone_laidian" />
                      {banquetMessage.phone}
                    </p>
                    <div className="details-content">
                      <span>宴会名称</span>
                      <em>{banquetMessage.partyName}</em>
                      <span>宴会类型</span>
                      <em>{currentBanquetType.typeName}</em>
                    </div>
                    <div className="details-content">
                      <span>婚宴日期</span>
                      <em>{banquetMessage.bookingTime}</em>
                      <span>开席时间</span>
                      <em>{banquetMessage.openTime}</em>
                    </div>
                    {tTypes.map((type, index) => {
                      return (
                        <div className="order-classification" key={index}>
                          {type.typeName && (
                            <p className="especially">{type.typeName}</p>
                          )}
                          <div className="details-content">
                            <span>预订桌数</span>
                            <em>{type.bookingNum}桌</em>
                            <span>备用桌数</span>
                            <em>{type.backupNum}桌</em>
                          </div>
                          <div className="details-content">
                            <span>每桌价格</span>
                            <em>{type.amount}元</em>
                            <span>金额</span>
                            <em>
                              {(type.amount * type.bookingNum).toFixed(2)}元
                            </em>
                          </div>
                        </div>
                      );
                    })}
                    {isMoreType && (
                      <div className="details-content">
                        <span>订单总额</span>
                        <em>{allMoney.toFixed(2)}元</em>
                      </div>
                    )}
                    <hr className="css-hr" />
                    <div className="details-content">
                      <span>预订说明</span>
                      <em>{banquetMessage.bookingMemo}</em>
                    </div>
                    <div className="details-content">
                      <span>场地布置</span>
                      <em>{banquetMessage.layoutSite}</em>
                    </div>
                    <div className="details-content">
                      <span>摆台要求</span>
                      <em>{banquetMessage.dressTable}</em>
                    </div>
                    <div className="details-content">
                      <span>音响要求</span>
                      <em>{banquetMessage.audio}</em>
                    </div>
                  </div>
                </Scrollbars>
              </div>
            </div>
            <div className="left-bottom">
              <button onClick={this.modifyCancelClick}>取消</button>
            </div>
          </div>
          <div className="banquetpay-right-main">
            <div className="right-content">
              <div className="right-list">
                <div className="list-title">
                  <div className="title-main">
                    <p>
                      <span>订单总额</span>
                      {allMoney.toFixed(2)}
                    </p>
                    <p>
                      <span>已收订金</span>
                      {banquetMessage.bookingAmount}
                    </p>
                    <p>
                      <span>加收费用</span>
                      <input
                        type="text"
                        value={this.state.additionAmount}
                        onChange={e => {
                          if (/^\d*\.{0,1}\d*$/.test(e.target.value)) {
                            this.setState({ additionAmount: e.target.value });
                          }
                        }}
                      />元
                    </p>
                    <p>
                      <span>追加订金</span>
                      <input
                        type="text"
                        value={this.state.additionbookingAmount}
                        onChange={e => {
                          if (/^\d*\.{0,1}\d*$/.test(e.target.value)) {
                            this.setState({
                              additionbookingAmount: e.target.value
                            });
                          }
                        }}
                      />元
                    </p>
                  </div>
                </div>
                <div className="tui-reason">修改原因</div>
                <div className="tui-reason-main">
                  <Scrollbars>
                    {banquetCreateStore.updateReasons.map((reason, index) => {
                      return (
                        <div
                          key={index}
                          className={classnames({
                            'each-reason': true,
                            checkreason: index === this.state.reasonIndex
                          })}
                          onClick={() => {
                            this.setState({ reason: '' });
                            this.setState({ reasonIndex: index });
                          }}
                        >
                          {reason}
                        </div>
                      );
                    })}
                  </Scrollbars>
                </div>
                <div className="other-reason">
                  <textarea
                    placeholder="请输入其他修改原因"
                    value={this.state.reason}
                    onChange={e => {
                      let value = e.target.value;
                      if(/^[A-Za-z0-9\u4e00-\u9fa5]*$/.test(value) && value.length<=200){
                        this.setState({ reason: e.target.value });
                      } 
                      if (e.target.value) {
                        this.setState({ reasonIndex: -1 });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="right-bottom">
              <button onClick={this.modifyOkClick}>完成</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ModifyBeposit.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default ModifyBeposit;
