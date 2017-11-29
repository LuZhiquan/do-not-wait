import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';
import { browserHistory } from 'react-router';
import CommonKeyboardNum from 'components/common-keyboard-num';
import Loading from 'components/loading';
import { message } from 'antd';

import './create-beposit.less';
message.config({
  top: 300
});

@inject('banquetCreateStore')
@observer
class CreateBeposit extends Component {
  constructor(props) {
    super(props);
    let { saveData } = this.props.location.state;
    let mSaveData = JSON.parse(saveData);

    this.state = {
      currentBanquetType: mSaveData.currentBanquetType,
      isMoreType: mSaveData.isMoreType,
      selectDesk: mSaveData.selectDesk,
      banquetMessage: mSaveData.banquetMessage,
      tTypes: mSaveData.tTypes,
      bookingMoney: '',
      loading: ''
    };
  }

  //确定
  OkClick = () => {
    let { banquetCreateStore } = this.props;
    let {
      currentBanquetType,
      selectDesk,
      banquetMessage,
      tTypes,
      isMoreType
    } = this.state;

    let myType,
      tableNum = 0,
      mbackupNum = 0;
    let allActualAmount = 0,
      allTotalAmount = 0;
    myType = tTypes.map((type, index) => {
      let {
        typeName,
        bookingNum,
        backupNum,
        peopleNum,
        amount,
        actualAmount,
        banquetComboID,
        banquetComboName,
        cart
      } = type;

      tableNum += bookingNum * 1;
      mbackupNum += backupNum * 1;

      let shoppingCart = cart.shoppingCart;

      let mactualAmount = actualAmount * bookingNum;
      let mtotalAmount = amount * bookingNum;
      allActualAmount += mactualAmount * 1;
      allTotalAmount += mtotalAmount * 1;

      let coBackupNum = backupNum ? backupNum : 0;

      return {
        typeName,
        bookingNum,
        backupNum: coBackupNum,
        amount: actualAmount, //amount 单桌现价
        totalAmount: amount, //totalAmount 单桌原价
        peopleNum,
        banquetComboID,
        banquetComboName,
        shoppingCart
      };
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

    let isOpenTableType = 0;
    if (isMoreType) {
      isOpenTableType = 1;
    } else {
      isOpenTableType = 0;
    }
    let object = {
      isOpenTableType: isOpenTableType,
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
      totalAmount: allTotalAmount.toFixed(2),
      actualAmount: allActualAmount.toFixed(2),
      bookingAmount: this.state.bookingMoney ? this.state.bookingMoney : 0,
      bookingDesc: banquetMessage.bookingMemo,
      tableIDs: tableIDs.toString(),
      tTypes: myType
    };

    console.log(object);

    //banquetCreateStore.saveBanquetBooking(JSON.stringify(object));
    this.setState({ loading: <Loading /> });
    banquetCreateStore.saveBanquetBooking(object, (success, msg) => {
      this.setState({ loading: '' });
      if (success) {
        message.destroy();
        message.success(msg, 1);
        browserHistory.push('/banquet/records');
      } else {
        message.destroy();
        message.warn(msg, 1);
      }
    });
  };
  //取消
  cancelClick = () => {
    let { banquetCreateStore } = this.props;
    banquetCreateStore.clearMessage();
    browserHistory.push('/banquet/records');
  };

  render() {
    let { currentBanquetType, isMoreType, banquetMessage, tTypes } = this.state;

    let allMoney = 0;
    tTypes.forEach((item, index) => {
      allMoney += item.totalAmount * 1;
    });
    return (
      <div id="createbeposit-main">
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
                            <em>{type.backupNum || 0}桌</em>
                          </div>
                          <div className="details-content">
                            <span>每桌价格</span>
                            <em>{type.actualAmount}元</em>
                            <span>金额</span>
                            <em>{type.totalAmount}元</em>
                          </div>
                        </div>
                      );
                    })}
                    {isMoreType && (
                      <div className="details-content">
                        <span>订单总额</span>
                        <em>{allMoney}元</em>
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
              <button onClick={this.cancelClick}>取消</button>
            </div>
          </div>
          <div className="banquetpay-right-main">
            <div className="right-content">
              <div className="right-list">
                <div className="list-title">
                  <div className="list-title-main">
                    <div className="title-main">
                      <p>{allMoney}</p>
                      <span>订单总额(元)</span>
                    </div>
                  </div>
                </div>
                <div className="pay-money">
                  <span>预收订金(元)</span>
                  <span>{this.state.bookingMoney}</span>
                </div>
                <div className="banquetpay-number-keyboard">
                  <CommonKeyboardNum
                    width={'100%'}
                    height={331}
                    Whetherpoint={true}
                    getResult={value => {
                      this.setState({ bookingMoney: value });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="right-bottom">
              <button onClick={this.OkClick}>完成</button>
            </div>
          </div>
        </div>
        {this.state.loading && <Loading />}
      </div>
    );
  }
}

CreateBeposit.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default CreateBeposit;
