/**
 * @author shelly
 * @description 提示界面
 * @date 2017-05-12
 **/
import React from 'react';
import { Modal } from 'antd';

import './prompt_popup.css';

class PromptPopup extends React.Component {
  render() {
    return (
      <div id="prompt">
        <Modal
          title="提示"
          visible={true}
          maskClosable={false}
          okText="继续点菜"
          cancelText="返回修改"
          width={510}
          height={546}
          wrapClassName="prompt-popup-modal"
        >
          <div className="not-order-product">
            <h1>以下菜品已停售，不能下单！</h1>
            <ul className="stop-sale-product">
              <li>榴莲蛋糕</li>
              <li>榴莲蛋糕</li>
              <li>榴莲蛋糕</li>
              <li>红烧大江鲢鱼</li>
              <li>特惠午餐</li>
              <li>特惠午餐</li>
              <li>红烧大江鲢鱼</li>
            </ul>
          </div>
          <div className="not-order-product">
            <h1>以下菜品已停售，不能下单！</h1>
            <ul className="out-of-stock">
              <li>榴莲蛋糕</li>
              <li>榴莲蛋糕</li>
              <li>榴莲蛋糕</li>
              <li>榴莲蛋糕</li>
            </ul>
          </div>
          <div className="not-order-product">
            <h1>以下菜品已停售，不能下单！</h1>
            <div className="table-title">
              <p className="dishes-name">菜品</p>
              <p className="surplus-num">剩余数量</p>
              <p className="ordered-num">下单数量</p>
            </div>
            <ul className="table-list">
              <li>
                <p className="dishes-name">水煮大鱼头</p>
                <p className="surplus-num">1</p>
                <p className="ordered-num">2</p>
              </li>
              <li>
                <p className="dishes-name">水煮大鱼头</p>
                <p className="surplus-num">1</p>
                <p className="ordered-num">2</p>
              </li>
              <li>
                <p className="dishes-name">水煮大鱼头</p>
                <p className="surplus-num">1</p>
                <p className="ordered-num">2</p>
              </li>
            </ul>
          </div>
        </Modal>
      </div>
    );
  }
}

export default PromptPopup;
