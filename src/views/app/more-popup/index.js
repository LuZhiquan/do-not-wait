import React from 'react';
import { Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router';
import './more_popup.less';

//更多入口弹窗
@inject('selloutStore', 'dayEndStore', 'appStore')
@observer
class MorePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tolink: '',
      Promptpopup: ''
    };
  }

  componentDidMount() {
    //沽清判断/sellout
    let selloutStore = this.props.selloutStore;
    selloutStore.getTakeeffect();
  }

  //关闭按钮事件
  handleCancel = () => {
    if (this.props.closepopup) {
      this.props.closepopup();
    }
  };

  render() {
    let selloutStore = this.props.selloutStore;
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let Queryput = permissionList.includes('SellClearModule:Queryput'); //沽清
    let Endofday = permissionList.includes('CheckoutModule:Endofday'); //日结
    let QueryTableManager =
      permissionList.includes('TableManager:QueryTableManager') &&
      account.businessPattern === 1238; //桌台负责人
    let Pricemaintenance =
      permissionList.includes('OtherModule:Pricemaintenance') &&
      account.businessPattern === 1238; //时价维护
    let StopSale = permissionList.includes('OtherModule:StopSale'); //停售

    return (
      <div>
        <Modal
          title="更多"
          visible={true}
          onCancel={this.handleCancel}
          footer={null}
          width={840}
          wrapClassName="index-popup-modal"
        >
          <div className="popup-center">
            {Queryput && (
              <Link
                className="pages-div"
                to={selloutStore.Takeeffect ? '/sellout/after' : '/sellout'}
              >
                沽清
              </Link>
            )}
            {StopSale && (
              <Link className="pages-div" to="/discontinued">
                停售
              </Link>
            )}
            {Pricemaintenance && (
              <Link className="pages-div" to="/price-maintenance">
                时价维护
              </Link>
            )}
            <Link className="pages-div" to="check-in">
              签到
            </Link>
            {Endofday && (
              <Link className="pages-div" to="/day-end">
                日结
              </Link>
            )}
            {QueryTableManager && (
              <Link className="pages-div" to="/responsible">
                桌台负责人
              </Link>
            )}
          </div>
          <div className="Prompt_button" onClick={this.handleCancel}>
            关闭
          </div>
        </Modal>
        {this.state.Promptpopup}
      </div>
    );
  }
}

export default MorePopup;
