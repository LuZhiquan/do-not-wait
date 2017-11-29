import React from 'react';
import { Modal, message } from 'antd';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import CommonKeyboardNum from '../common-keyboard-num'; //键盘
import MyScroll from 'react-custom-scrollbars'; //滚动条
import './zj-estimate-popup.less';
message.config({
  top: 300
});

//增加/减少/报损
@inject('selloutStore')
@observer
class ZjEstimatePopup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      myValue: '', //数字文本框
      recordValue: '' //其他原因文本
    };
  }

  //取消事件
  handleCancel = () => {
    if (this.props.updateestime) {
      this.props.updateestime();
    }
  };

  selloutStore = this.props.selloutStore;

  //确定事件
  handleOk = () => {
    if (this.state.myValue === '') {
      message.warn('请输入数量');
      return;
    } else if (this.state.myValue === '0') {
      message.warn('数量必须大于0');

      return;
    } else if (
      this.selloutStore.reasontext.reasonName === '' &&
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
      let quantity = this.state.myValue; //变动数量
      let textareaReason = this.state.recordValue; //变动原因textarea
      let changeReason =
        this.selloutStore.reasontext.reasonName === ''
          ? textareaReason
          : this.selloutStore.reasontext.reasonName;

      this.selloutStore.determinebotton(quantity, changeReason, () => {
        if (this.props.okbutton) {
          this.props.okbutton();
        }
      });
    }
  };
  //获取变动原因
  reachValue = e => {
    if (this.state.recordValue.length > 1) {
      let reasonlist = this.selloutStore.reasonlist;
      reasonlist.map(reason => {
        reason.selected = false;
        return reason;
      });
      this.selloutStore.reasontext.reasonName = ''; //清空勾选过的文本
    }
    var value = e.target.value;
    this.setState({ recordValue: value });
  };

  render() {
    let reasonlist = this.selloutStore.reasonlist;
    return (
      <div>
        <Modal
          title={this.selloutStore.addorreducename}
          visible={true}
          closable={false}
          maskClosable={false}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={840}
          wrapClassName="zj-estimate-popup-modal"
        >
          <div className="zj-estimate-title">
            {this.selloutStore.afterobj.productName}
          </div>
          <div className="zj-estimate-left">
            <div className="zj-estimate-tupe">
              <span>{this.selloutStore.afterobj.optionName}</span>
              <input type="text" value={this.state.myValue} />
            </div>
            <div className="zj-estimate-reason">
              <p>原因</p>
              <div className="div-reason">
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
                              this.selloutStore.selectreason(
                                reason.DictionaryID
                              ); //选中
                              this.selloutStore.getreasontext(
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
            <div className="zj-estimate-otherreason">
              <p>其他原因</p>
              <textarea
                placeholder="可输入原因"
                onChange={this.reachValue}
                value={this.state.recordValue}
              />
            </div>
          </div>
          <div className="zj-estimate-right">
            <div className="zj-right-keyboard">
              <CommonKeyboardNum
                Whetherpoint={
                  this.selloutStore.afterobj.needWeigh ? true : false
                }
                getResult={value => {
                  this.setState({ myValue: value });
                }}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default ZjEstimatePopup;
