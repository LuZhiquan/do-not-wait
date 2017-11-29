import React from 'react';
import { Tabs } from 'antd';
import { observer, inject } from 'mobx-react';
import EstimateClearTotal from '../../sellout/sellout-popup/estimate-clear-total'; //按总沽清
import './estimate-clearafter-popup.less';
const TabPane = Tabs.TabPane;

//沽清
@inject('selloutStore')
@observer
class EstimateClearAfterPopup extends React.Component {
  render() {
    let selloutStore = this.props.selloutStore;
    return (
      <div className="estimate-clearafter-popup">
        <div className="estimate-clearafter-after">沽清</div>
        <i
          className="iconfont icon-order_btn_back"
          onClick={() => {
            this.context.router.goBack();
            selloutStore.savelastcombination('0', '', '0'); //清空商品分类选中组合
            selloutStore.saveshop = '0'; //恢复全部选项被选中
            selloutStore.fillindate = '';
            selloutStore.showright = false;
          }}
        />
        <Tabs defaultActiveKey="0">
          <TabPane tab="按日沽清" key="0" className="estimate-clear-tab">
            <EstimateClearTotal />
          </TabPane>
          <TabPane tab="按总沽清" key="1" className="estimate-clear-tab" />
        </Tabs>
      </div>
    );
  }
}

EstimateClearAfterPopup.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default EstimateClearAfterPopup;
