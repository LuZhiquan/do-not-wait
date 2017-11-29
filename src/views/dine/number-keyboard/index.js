import React, { Component } from 'react';

import './number_keyboard.css';

class NumberKeyboard extends Component {
  state = {
    value: this.props.value || ''
  };

  componentDidMount() {
    let inputBounding = document
      .getElementsByClassName('kt-number')[this.props.index].querySelector('input')
      .getBoundingClientRect();
    let numberKeyboard = document.querySelector('.number-keyboard');
    numberKeyboard.style.top =
      inputBounding.top + inputBounding.height + 5 + 'px';
    numberKeyboard.style.right = '19px';
    numberKeyboard.focus();
  }

  componentDidUpdate() {
    this.props.onEnter(this.state.value);
  }

  render() {
    let { onClose } = this.props;
    let { value } = this.state;
    return (
      <ul
        className="number-keyboard"
        tabIndex="0"
        onBlur={() => {
          onClose();
        }}
      >
        {[
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '0',
          '←',
          '确定'
        ].map(key => {
          let className = key === '确定' ? { className: 'confirm' } : false;
          return (
            <li
              key={key}
              onClick={() => {
                if (key === '←') {
                  this.setState({
                    value: String(value).substr(0, value.length - 1)
                  });
                } else if (key === '确定') {
                  onClose();
                } else {
                  let changeValue = String(value + key).substr(0, 2);
                  if (Number(changeValue)) {
                    this.setState({ value: changeValue });
                  }
                }
              }}
              {...className}
            >
              {key === '←' ? (
                <i className="iconfont icon-order_btn_back" />
              ) : (
                key
              )}
            </li>
          );
        })}
      </ul>
    );
  }
}

export default NumberKeyboard;
