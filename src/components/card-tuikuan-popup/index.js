/**
* @author GaoMeng
* @description 银行卡退款界面
* @date 2017-05-13
**/
import React from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import './card_tuikuan_popup.less';

@inject('settlementStore')
@observer
class TuikuanPopup extends React.Component {
  render() {
    return (
      <Modal
        title={this.props.title + '退款'}
        visible={true}
        maskClosable={false}
        onOk={() => {
          if (this.props.onOk) {
            this.props.onOk();
          }
        }}
        okText="确定"
        cancelText="放弃"
        width={840}
        wrapClassName="card-tuikuan-popup-modal"
        onCancel={() => {
          if (this.props.onCancel) {
            this.props.onCancel();
          }
        }}
      >
        <div className="tuikuan-block">
          <div className="tuikaun-money">
            <div className="money-content">20000元</div>
            <p>订单总额（元）</p>
          </div>
          <div className="tuikuan-cause">
            <div className="cause-header">退款原因</div>
            <ul className="refund-reason">
              <li className="btn-210-44 btn-active">选错结算方式</li>
              <li className="btn-210-44">选错结算方式</li>
              <li className="btn-210-44">选错结算方式</li>
              <li className="btn-210-44">选错结算方式</li>
              <li className="btn-210-44">选错结算方式</li>
            </ul>
          </div>
          <textarea
            type="text"
            placeholder="可输入自定义赠菜原因"
            className="tuikaun-remarks"
          />
        </div>
      </Modal>
    );
  }
}

export default TuikuanPopup;
