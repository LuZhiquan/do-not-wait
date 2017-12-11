import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Keyboard from './Keyboard';

class KeyboardAPI {
  constructor() {
    this.keyboardLayer = document.createElement('div');
    this.keyboardLayer.setAttribute('class', 'keyboard-layer');
    document.body.appendChild(this.keyboardLayer);
  }

  show({ target, onChange }) {
    this.target = target;
    //将键盘渲染到body下的div.keyboard-layer键盘层
    render(
      <Keyboard
        target={target}
        onChange={onChange}
        onClose={this.close.bind(this)}
      />,
      this.keyboardLayer
    );
  }

  close(e) {
    //将键盘从键盘层卸载
    if (
      (!e || e.target !== this.target) &&
      this.keyboardLayer.getElementsByClassName('keyboard').length > 0
    ) {
      this.keyboardLayer
        .getElementsByClassName('keyboard')[0]
        .setAttribute('class', 'keyboard');

      setTimeout(() => {
        unmountComponentAtNode(this.keyboardLayer);
      }, 250);
    }
  }
}

export default new KeyboardAPI();
