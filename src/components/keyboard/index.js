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

// import React, { Component } from 'react';
// import { render, unmountComponentAtNode } from 'react-dom';
// import Keyboard from './Keyboard';

// export default class FullKeyboard extends Component {
//   keyboardLayer = document.createElement('div');

//   componentDidMount() {
//     //将keyboardLayer标签并塞进body
//     this.keyboardLayer.setAttribute('class', 'keyboard-layer');
//     document.body.appendChild(this.keyboardLayer);
//     this.renderKeyboard();
//   }

//   componentDidUpdate() {
//     this.renderKeyboard();
//   }

//   componentWillUnmount() {
//     //在组件卸载的时候，保证弹层也被卸载掉
//     unmountComponentAtNode(this.keyboardLayer);
//     document.body.removeChild(this.keyboardLayer);
//   }

//   renderKeyboard = () => {
//     //将弹层渲染到body下的div标签
//     render(<Keyboard />, this.keyboardLayer);
//   };

//   render() {
//     return null;
//   }
// }
