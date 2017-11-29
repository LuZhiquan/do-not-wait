/* 下单不成功提示弹窗 */
import React from 'react';
import { Modal } from 'antd';

import './add_order_validation_popup.css';

class AddOrderValidationPopup extends React.Component {
  handleCancel = () => {
    let { handleClose } = this.props;
    handleClose && handleClose();
  };

  render() {
    const { discontinued, curbSaleList, avaiableVOList } = this.props.data;

    return (
      <div id="prompt">
        <Modal
          title="提示"
          visible={true}
          maskClosable={false}
          width={510}
          height={546}
          onCancel={this.handleCancel}
          wrapClassName="add-order-modal"
          footer={null}
          closable={false}
        >
          {discontinued &&
          discontinued.length > 0 && (
            <div className="not-order-product">
              <h1>以下菜品已停售，不能下单！</h1>
              <ul className="stop-sale-product">
                {discontinued.map((text, index) => {
                  return <li key={index}>{text}</li>;
                })}
              </ul>
            </div>
          )}

          {curbSaleList &&
          curbSaleList.length > 0 && (
            <div className="not-order-product">
              <h1>以下菜品已沽清，不能下单！</h1>
              <ul className="out-of-stock">
                {curbSaleList.map((text, index) => {
                  return <li key={index}>{text}</li>;
                })}
              </ul>
            </div>
          )}

          {avaiableVOList &&
          avaiableVOList.length > 0 && (
            <div className="not-order-product">
              <h1>以下菜品可用数量不足，不能下单！</h1>
              <div className="table-title">
                <p className="dishes-name">菜品</p>
                <p className="surplus-num">可用数量</p>
                <p className="ordered-num">下单数量</p>
              </div>
              <ul className="table-list">
                {avaiableVOList.map((avaiable, index) => {
                  return (
                    <li key={index}>
                      <p className="dishes-name">{avaiable.productName}</p>
                      <p className="surplus-num">
                        {avaiable.availableFloatQuantity}
                      </p>
                      <p className="ordered-num">
                        {avaiable.orderedFloatQuantity}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="cancel-btn" onClick={this.handleCancel}>
            返回修改
          </div>
        </Modal>
      </div>
    );
  }
}

export default AddOrderValidationPopup;
