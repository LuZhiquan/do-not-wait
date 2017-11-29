/**
* @author shining
* @description 开班
* @date 2017-05-27
**/
import React from 'react';
import { Modal, message } from 'antd';
import { observer, inject } from 'mobx-react';
import Prompt from 'components/prompt-common'; //错误提示
import './open-class-pouup.less';

message.config({
  top: 300
});

@inject('appStore', 'shiftStore')
@observer
class OpenClassPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reservefund: ''
    };
  }

  componentDidMount() {
    this.nameInput.focus();
  }
  shiftStore = this.props.shiftStore;

  // 点击确定按钮
  handleOk = () => {
    let reservefund = this.state.reservefund; 
    if (reservefund === '' || reservefund*1 === 0 ) {
      message.destroy();
      message.warning('请输入备用金且数值大于0');
    } else {
      if (reservefund.includes('.')) {
        if (
          reservefund.startsWith('.') ||
          reservefund.endsWith('.') ||
          reservefund.toString().split('.')[1].length > 2
        ) {
          message.destroy();
          message.warn('(输入价钱格式有误/只能输入两位小数)请检查后再进行保存');
        } else {
          let _this = this;
          let shiftStore = this.props.shiftStore;
          shiftStore.getstartWorking(this.state.reservefund, function() {
            if (_this.props.okCancel) {
              _this.props.okCancel();
            }
          });
        }
      } else {
        let _this = this;
        let shiftStore = this.props.shiftStore;
        shiftStore.getstartWorking(this.state.reservefund, function() {
          if (_this.props.okCancel) {
            _this.props.okCancel();
          }
        });
      }
    }
  };

  inputData(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  // 点击数字键盘
  handleClick = (e) => {
   
    let temp = this.state.reservefund;
    let value = e.target.innerHTML; 
    if (value) {
     
      if (value >= 0 && value <= 9) {

        if (temp <= 100000000) {
          var dot = temp.indexOf(".");
          if (dot !== -1) {
            var dotCnt = temp.substring(dot + 1, temp.length);
            if (dotCnt.length < 2) {
              temp = temp.concat(value);
            } else {
              message.destroy();
              message.info('只能输入两位小数');
            }
          } else {
            temp = temp.concat(value);
          }

        } else {
          message.destroy();
          message.info('已达到最大值');
        }
 
      } else if (value === '.') {

        if (!temp.includes(".") && temp <= 1000000) {
          temp = temp.concat(value);
        } 
      }
    } else {

      temp = temp.substring(0, temp.length - 1);

    }

    if (temp.startsWith('.')) {
      temp = "0".concat(temp);
    }


    this.setState({ reservefund: temp });

  };

  // 点击退格
  handleBack = e => {
    let inputVal = this.state.reservefund;
    inputVal = inputVal.substring(0, inputVal.length - 1);
    this.setState({ reservefund: inputVal });
  };

  //点击取消的按钮
  handleCancel = e => {
    if (this.props.closeCancel) {
      this.props.closeCancel();
    }
  };

  componentDidUpdate() {
    let feedback = this.shiftStore.feedback;
    if (
      feedback &&
      feedback.status !== 'error' &&
      feedback.status !== 'validate'
    ) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, this.shiftStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, this.shiftStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, this.shiftStore.closeFeedback());
      }
    }
  }

  render() {
    let feedback = this.shiftStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
        // ifopenclass
        this.props.appStore.ifopenclass = false;
      };
      feedback.cancelClick = () => {
        this.shiftStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    return (
      <Modal
        title="开班"
        visible={true}
        maskClosable={false}
        width={510}
        height={509}
        footer={null}
        wrapClassName="open-class-modal"
        onCancel={this.handleCancel}
      >
        <div id="login">
          <input
            type="text"
            value={this.state.reservefund}
            placeholder="请输入备用金"
            onChange={e => {
              if (/^\d*\.{0,1}\d*$/.test(e.target.value)) {
                this.setState({ reservefund: e.target.value });
                this.inputData.bind(this);
              }
            }}
            ref={input => {
              this.nameInput = input;
            }}
          />
          <span>元 </span>
        </div>
        <div id="num-key">
          <ul>
            <li className="number" onClick={this.handleClick}>
              1
            </li>
            <li className="number" onClick={this.handleClick}>
              2
            </li>
            <li className="number" onClick={this.handleClick}>
              3
            </li>
            <li
              className="back iconfont icon-order_btn_back"
              onClick={this.handleBack}
            />

            <li className="number" onClick={this.handleClick}>
              4
            </li>
            <li className="number" onClick={this.handleClick}>
              5
            </li>
            <li className="number" onClick={this.handleClick}>
              6
            </li>
            <li className="clear-all" onClick={this.handleCancel}>
              取消
            </li>
            <li className="number" onClick={this.handleClick}>
              7
            </li>
            <li className="number" onClick={this.handleClick}>
              8
            </li>
            <li className="number" onClick={this.handleClick}>
              9
            </li>
            <li className="okbutton" onClick={this.handleOk}>
              确定
            </li>
            <li className="number" onClick={this.handleClick}>
              0
            </li>
            <li className="number" onClick={this.handleClick}>
              00
            </li>
            <li className="number" onClick={this.handleClick}>
              .
            </li>
          </ul>
        </div>
        {operatePrompt}
      </Modal>
    );
  }
}

export default OpenClassPopup;
