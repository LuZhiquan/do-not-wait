import React from 'react';
import { message } from 'antd';
import { observer, inject } from 'mobx-react';

import './check_in.less';
import CardInput from './card-input';
import HandInput from './hand-input';

message.config({
  top: 300
});

//签到
@inject('checkInStore')
@observer
class CheckIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isCardPopup: false };
  }

  render() {
    let checkInStore = this.props.checkInStore;

    let checkPopup;
    if (this.state.isCardPopup) {
      checkPopup = (
        <CardInput
          handClick={() => {
            this.setState({ isCardPopup: false });
            this.props.checkInStore.cardCode = '';
          }}
        />
      );
    } else {
      checkPopup = (
        <HandInput
          inClick={() => {
            checkInStore.checkInClick();
          }}
          outClick={() => {
            checkInStore.checkOutClick();
          }}
          cardClick={() => {
            this.setState({ isCardPopup: true });
            this.props.checkInStore.cardCode = '';
          }}
        />
      );
    }

    return (
      <div className="check-in" id="check_in">
        <div className="check-in-header">
          <i
            className="iconfont icon-order_btn_back"
            onClick={() => {
              //返回预定界面
              this.context.router.goBack();
            }}
          />签到
        </div>
        <div className="check-in-content">{checkPopup}</div>
      </div>
    );
  }
}

CheckIn.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default CheckIn;
