import React from 'react';
import { Modal, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { inject, observer } from 'mobx-react';
import './update-estimate-popup.less';
import CommonKeyboardNum from '../common-keyboard-num'; //键盘

message.config({
  top: 300
});

//沽清
@inject('selloutStore')
@observer
class UpdateEstimatePopup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: this.props.selloutStore.optionIDSum, // 返回值【0：没有规格  1：有规格】 判断此菜品是有规格的还是没有规格的【1：有规格按规格(2：有规格不按规格)  0：没有规格】
      current: '0', // 1：有规格按规格 文本框输入数字的时候判断应该输入那个文本框
      isCureSale: true // 有按规格的时候 【1 ,2 】之间的切换  //默认是按规格沽清的所以默认值维true
    };
  }

  //取消事件
  handleCancel = () => {
    if (this.props.updateestime) {
      this.props.updateestime();
    }
    this.props.selloutStore.inputIndex = 0;
  };

  //确定事件
  handleOk = () => {
    let selloutStore = this.props.selloutStore;
    // let  messageobj=selloutStore.messageobj;
    let messagelist = selloutStore.selloutmessageList;
    let curbSaleList = [];
    // let lept=false;
    // messagelist.forEach(function(obj){
    //     if(obj.changevalue === true){//取出被改动过的数据
    //         if( obj.initFloatQuantity.includes(".")){
    //             if(obj.initFloatQuantity.startsWith(".") || obj.initFloatQuantity.endsWith(".") || obj.initFloatQuantity.toString().split(".")[1].length>2){
    //                 lept=true;
    //             }
    //         }

    //     }

    // });

    // if(lept === true){
    //         message.destroy();
    //         message.warn("(输入价格格式有误/只能输入两位小数)请检查后再进行保存");

    // }else{
    messagelist.map(function(obj) {
      if (obj.changevalue === true) {
        //取出被改动过的数据
        curbSaleList.push({
          optionID: obj.optionID,
          quantity: obj.initFloatQuantity * 1 + ''
        });
      }
      return obj;
    });
    let menuID = selloutStore.savemenuID;
    let isAccOptionCureSale; //是否按规格沽清（必填，如果没有规格就填false）
    if (Number(this.state.type) === 1 || Number(this.state.type) === 2) {
      //1：有规格按规格 2：有规格不按规格
      isAccOptionCureSale = this.state.isCureSale;
    } else {
      //0：无规格
      isAccOptionCureSale = false;
    }
    this.props.selloutStore.addmessagevalue(
      curbSaleList,
      menuID,
      isAccOptionCureSale,
      () => {
        if (this.props.okdateestime) {
          this.props.okdateestime();
        }
      }
    ); //执行添加的action

    // }
  };
  render() {
    let sumcount = 0;
    let account =
      sessionStorage.getItem('account') &&
      JSON.parse(sessionStorage.getItem('account'));
    let selloutStore = this.props.selloutStore;
    let messagelist = selloutStore.selloutmessageList;
    let messageobj = selloutStore.messageobj;
    let standard;
    let reservenum;
    let estimatenum;
    if (messagelist.length) {
      messagelist.forEach((mnews, index) => {
        if (mnews.exchangeRate === 1) {
          standard = mnews.optionName; //不按规格的名称
          reservenum =
            messageobj.standardOptionBookingSum === null
              ? 0
              : (messageobj.standardOptionBookingSum * 1).toFixed(2) * 1; //不按规格的预订数量
          estimatenum = mnews.initFloatQuantity; //不按规格的沽清数量
          selloutStore.setvalue(standard, reservenum, estimatenum); //把上面三个值存进store里面 给 2：有规格不按规格 赋值
          selloutStore.subscript = index; //按规格的时候此数据在json所在的下标是多少【确定添加/修改的时候把对象传回接口的时候需要用到】
        }
      });
    }

    //判断是不是正餐模式
    const isDinner = account.businessPattern === 1238;

    return (
      <div>
        <Modal
          title={selloutStore.menuname}
          visible={true}
          closable={false}
          maskClosable={false}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          width={840}
          wrapClassName="update-estimate-popup-modal"
        >
          <div className="estimate-main">
            <Scrollbars>
              <div className="update-estimate-left">
                {Number(this.state.type) === 1 &&
                messageobj.accOptionCureSale === true && ( //1：有规格按规格
                    <div className="update-left-content-yesan">
                      <div className="update-left-how">
                        <p className="update-how-span">
                          共 {messagelist.length} 个规格{' '}
                        </p>
                        {(() => {
                          if (messagelist.length) {
                            let button;
                            messagelist.forEach((mnews, index) => {
                              if (mnews.exchangeRate === 1) {
                                button = (
                                  <p className="update-how-botton">
                                    <i
                                      className="iconfont icon-icon_checkbox_sel-"
                                      onClick={() => {
                                        this.setState({
                                          type: '2', //2：有规格不按规格
                                          isCureSale: 'false'
                                        });
                                        messageobj.accOptionCureSale = false;
                                      }}
                                    />
                                    按规格沽清
                                  </p>
                                );
                              }
                            });
                            return button;
                          }
                        })()}
                      </div>
                      {(() => {
                        if (messagelist.length) {
                          return messagelist.map((mnews, index) => {
                            sumcount++;
                            let quantity = messagelist[index].initFloatQuantity;
                            return (
                              <div key={index} className="update-left-each">
                                <p className="update-left-type">
                                  {mnews.optionName}
                                </p>
                                <div className="update-left-number">
                                  {isDinner && (
                                    <span>
                                      预订数量：<em>{mnews.bookingSum}</em>
                                    </span>
                                  )}
                                  <span>
                                    沽清数量
                                    <input
                                      type="text"
                                      id={sumcount}
                                      value={quantity || ''}
                                      onKeyDown={e => {
                                        if (
                                          messagelist[index].changevalue ===
                                          false
                                        ) {
                                          e.target.value = '';
                                        }
                                      }}
                                      onChange={e => {
                                        if (/^\d*$/.test(e.target.value)) {
                                          messagelist[index].initFloatQuantity =
                                            e.target.value;
                                          messagelist[index].changevalue = true;
                                        }
                                      }}
                                      className={
                                        selloutStore.inputIndex ===
                                          sumcount - 1 && 'changebg'
                                      }
                                      onFocus={e => {
                                        selloutStore.inputIndex =
                                          e.target.id - 1;
                                        this.setState({ current: index });
                                      }}
                                    />
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        }
                      })()}
                    </div>
                  )}
                {Number(this.state.type) === 2 &&
                messageobj.accOptionCureSale === false && ( //2：有规格不按规格
                    <div className="update-left-content-noan">
                      <div className="update-left-how">
                        <p className="update-how-span">
                          标准规格：{selloutStore.standard}{' '}
                        </p>
                        <p className="update-how-botton">
                          <i
                            className="buan"
                            onClick={() => {
                              this.setState({
                                type: '1', //1：有规格按规格
                                isCureSale: 'true'
                              });
                              messageobj.accOptionCureSale = true;
                            }}
                          />{' '}
                          按规格沽清
                        </p>
                      </div>
                      {isDinner && (
                        <div className="update-left-each">
                          <span>预订数量</span>
                          <input
                            type="text"
                            className="readOnly-bg"
                            value={selloutStore.reservenum}
                            readOnly
                          />
                        </div>
                      )}
                      <div className="update-left-each">
                        <span>沽清数量</span>
                        <input
                          type="text"
                          value={selloutStore.estimatenum || ''}
                          onKeyDown={e => {
                            if (
                              messagelist[selloutStore.subscript]
                                .changevalue === false
                            ) {
                              e.target.value = '';
                            }
                          }}
                          onChange={e => {
                            if (/^\d*$/.test(e.target.value)) {
                              messagelist[
                                selloutStore.subscript
                              ].initFloatQuantity =
                                e.target.value;
                              selloutStore.estimatenum = e.target.value;
                              messagelist[
                                selloutStore.subscript
                              ].changevalue = true;
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                {Number(this.state.type) === 0 && ( //0：没有规格
                  <div className="update-left-content-noguige">
                    {(() => {
                      if (messagelist.length) {
                        return messagelist.map((mnews, index) => {
                          let quantity = messagelist[index].initFloatQuantity;
                          return (
                            <div key={index}>
                              {isDinner && (
                                <div className="update-left-each">
                                  <span>预订数量</span>
                                  <input
                                    className="readOnly-bg"
                                    type="text"
                                    value={messagelist[index].bookingSum}
                                    readOnly
                                  />
                                </div>
                              )}
                              <div className="update-left-each">
                                <span>沽清数量</span>
                                <input
                                  type="text"
                                  value={quantity || ''}
                                  onKeyDown={e => {
                                    if (
                                      messagelist[index].changevalue === false
                                    ) {
                                      e.target.value = '';
                                    }
                                  }}
                                  onChange={e => {
                                    if (/^\d*$/.test(e.target.value)) {
                                      messagelist[index].initFloatQuantity =
                                        e.target.value;
                                      messagelist[index].changevalue = true;
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          );
                        });
                      }
                    })()}
                  </div>
                )}
              </div>
              <div className="update-estimate-right">
                <div className="update-right-keyboard">
                  <CommonKeyboardNum
                    Whetherpoint={false}
                    getvalue={value => {
                      let current = this.state.current; //1：有规格按规格 的时候文本框的下标
                      let initFloatQuantity =
                        messagelist[current].initFloatQuantity || ''; // 1：有规格按规格 沽清数量 称重 =true 的取值

                      let estimatenum = selloutStore.estimatenum || ''; //2：有规格不按规格 沽清数量 也要判断称重【true/false】的取值

                      let initFloatQuantity1 =
                        messagelist[current].initFloatQuantity || ''; //0：没有规格 沽清数量 称重 =true 的取值

                      if (Number(this.state.type) === 1) {
                        //1：有规格按规格
                        if (value === 'click') {
                          //数字键盘点击删除
                          messagelist[current].initFloatQuantity = (
                            initFloatQuantity + ''
                          ).substring(0, (initFloatQuantity + '').length - 1);

                          messagelist[current].changevalue = true; //说明数据有改动过
                        } else {
                          //追加数据
                          // if(value === "."){
                          //     if(String(initFloatQuantity).indexOf(".") !== -1){
                          //         message.destroy();
                          //         message.warn("不能输入多个小数点");
                          //     }else if(initFloatQuantity === ""){
                          //             messagelist[current].initFloatQuantity = "0.";
                          //     }else{
                          //         messagelist[current].initFloatQuantity = initFloatQuantity+value;
                          //     }
                          // }else{

                          // messagelist[current].initFloatQuantity = initFloatQuantity+value;
                          // }
                          if (messagelist[current].emptyvalue === false) {
                            messagelist[current].initFloatQuantity = '';
                            messagelist[current].initFloatQuantity = value;
                            messagelist[current].emptyvalue = true;
                          } else {
                            if (
                              messagelist[current].initFloatQuantity <=
                              100000000
                            ) {
                              messagelist[current].initFloatQuantity =
                                initFloatQuantity + value;
                            } else {
                              message.destroy();
                              message.info('已达到最大值');
                            }
                          }

                          messagelist[current].changevalue = true; //说明数据有改动过
                        }
                      } else if (Number(this.state.type) === 2) {
                        //2：有规格不按规格
                        if (value === 'click') {
                          //数字键盘点击删除
                          messagelist[
                            selloutStore.subscript
                          ].initFloatQuantity = (estimatenum + '').substring(
                            0,
                            (estimatenum + '').length - 1
                          );

                          selloutStore.estimatenum = (
                            estimatenum + ''
                          ).substring(0, (estimatenum + '').length - 1);
                          messagelist[
                            selloutStore.subscript
                          ].changevalue = true; //说明数据有改动过
                        } else {
                          //追加数据
                          // if(value === "."){
                          //         if(String(estimatenum).indexOf(".") !== -1){
                          //             message.destroy();
                          //             message.warn("不能输入多个小数点");
                          //         }else if(estimatenum === ""){
                          //             messagelist[selloutStore.subscript].initFloatQuantity = "0.";
                          //         }else{
                          //             messagelist[selloutStore.subscript].initFloatQuantity = estimatenum+value;
                          //         }
                          //     }else{
                          // messagelist[selloutStore.subscript].initFloatQuantity = estimatenum+value;
                          // }
                          if (
                            messagelist[selloutStore.subscript].emptyvalue ===
                            false
                          ) {
                            messagelist[
                              selloutStore.subscript
                            ].initFloatQuantity =
                              '';
                            messagelist[
                              selloutStore.subscript
                            ].initFloatQuantity = value;
                            messagelist[
                              selloutStore.subscript
                            ].emptyvalue = true;
                            selloutStore.estimatenum = value;
                          } else {
                            if (
                              messagelist[selloutStore.subscript]
                                .initFloatQuantity <= 100000000
                            ) {
                              messagelist[
                                selloutStore.subscript
                              ].initFloatQuantity =
                                estimatenum + value;
                              selloutStore.estimatenum = estimatenum + value;
                            } else {
                              message.destroy();
                              message.info('已达到最大值');
                            }
                          }
                          messagelist[
                            selloutStore.subscript
                          ].changevalue = true; //说明数据有改动过
                        }
                      } else if (Number(this.state.type) === 0) {
                        //0：没有规格
                        if (value === 'click') {
                          //数字键盘点击删除
                          messagelist[current].initFloatQuantity = (
                            initFloatQuantity1 + ''
                          ).substring(0, (initFloatQuantity1 + '').length - 1);

                          messagelist[current].changevalue = true; //说明数据有改动过
                        } else {
                          //追加数据
                          // if(value === "."){
                          //     if(String(initFloatQuantity1).indexOf(".") !== -1){
                          //         message.destroy();
                          //         message.warn("不能输入多个小数点");
                          //     }else if(initFloatQuantity1 === ""){
                          //         messagelist[current].initFloatQuantity = "0.";
                          //     }else{
                          //         messagelist[current].initFloatQuantity = initFloatQuantity1+value;
                          //     }
                          // }else{
                          // messagelist[current].initFloatQuantity = initFloatQuantity1+value;
                          // }
                          if (messagelist[current].emptyvalue === false) {
                            messagelist[current].initFloatQuantity = '';
                            messagelist[current].initFloatQuantity = value;
                            messagelist[current].emptyvalue = true;
                          } else {
                            if (
                              messagelist[current].initFloatQuantity <=
                              100000000
                            ) {
                              messagelist[current].initFloatQuantity =
                                initFloatQuantity1 + value;
                            } else {
                              message.destroy();
                              message.info('已达到最大值');
                            }
                          }
                          messagelist[current].changevalue = true; //说明数据有改动过
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </Scrollbars>
          </div>
        </Modal>
      </div>
    );
  }
}

export default UpdateEstimatePopup;
