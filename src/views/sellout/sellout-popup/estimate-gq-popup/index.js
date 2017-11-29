import React from 'react';
import { Modal, message } from 'antd';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import MyScroll from 'react-custom-scrollbars'; //滚动条
import './estimate-gq-popup.less';

message.config({
  top: 300
});

//沽清/删除
@inject('selloutStore')
@observer
class GqEstimatePopup extends React.Component {
  state = {
    recordValue: '' //其他原因文本层
  };

  //取消事件
  handleCancel = () => {
    if (this.props.gqclose) {
      this.props.gqclose();
    }
  };

  //确定事件
  handleOk = () => {
    if (
      this.props.selloutStore.reasontext.reasonName === '' &&
      this.state.recordValue.trim() === ''
    ) {
      message.warn('请选择原因');
      return;
    } else if (
      this.state.recordValue !== '' &&
      this.state.recordValue.length > 100
    ) {
      message.warn('输入的原因不能超过100个字');
      return;
    } else {
      let textareaReason = this.state.recordValue; //变动原因textarea
      let changeReason =
        this.props.selloutStore.reasontext.reasonName === ''
          ? textareaReason
          : this.props.selloutStore.reasontext.reasonName;

      this.props.selloutStore.determinebotton('', changeReason, () => {
        if (this.props.okbutton) {
          this.props.okbutton();
        }
      });
    }
  };

  //获取变动原因
  reachValue = e => {
    if (this.state.recordValue.length > 1) {
      let selloutStore = this.props.selloutStore;
      let reasonlist = selloutStore.reasonlist;
      reasonlist.map(reason => {
        reason.selected = false;
        return reason;
      });
      selloutStore.reasontext.reasonName = ''; //清空勾选过的文本
    }
    var value = e.target.value;
    this.setState({ recordValue: value });
  };

  render() {
    let selloutStore = this.props.selloutStore;
    let reasonlist = selloutStore.reasonlist;
    return (
      <div>
        <Modal
          title={selloutStore.addorreducename}
          visible={true}
          closable={false}
          maskClosable={false}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={840}
          wrapClassName="estimate-gq-popup"
        >
          <div className="estimate-gq-title">
            {selloutStore.afterobj.productName}
          </div>
          <div className="estimate-gq-main">
            <div className="gq-estimate-reason">
              <p>原因</p>
              <div className="div-resion">
                <MyScroll>
                  {(() => {
                    if (reasonlist.length) {
                      return reasonlist.map(reason => {
                        return (
                          <div
                            key={reason.DictionaryID}
                            className={classnames({
                              'each-reason': true,
                              'each-checked': reason.selected
                            })}
                            onClick={() => {
                              selloutStore.selectreason(reason.DictionaryID); //选中
                              selloutStore.getreasontext(
                                reason.DictionaryID,
                                reason.DictionaryName
                              ); //获取文本
                              this.setState({ recordValue: '' });
                            }}
                          >
                            {reason.selected && (
                              <i className="iconfont icon-icon_checkbox_sel" />
                            )}
                            <span>{reason.DictionaryName}</span>
                          </div>
                        );
                      });
                    }
                  })()}
                </MyScroll>
              </div>
            </div>
            <div className="gq-estimate-otherreason">
              <p>其他原因</p>
              <textarea
                placeholder="可输入原因"
                onChange={this.reachValue}
                value={this.state.recordValue}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default GqEstimatePopup;
