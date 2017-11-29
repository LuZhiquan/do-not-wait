import React from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';

import './card_input.less';

@inject('checkInStore')
@observer
class CardInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = { current: 0 };
  }

  componentDidUpdate() {
    let checkInStore = this.props.checkInStore;
    let current = this.state.current;

    document.onkeydown = function(e) {
      if (e.which === 13) {
        if (current === 0) {
          checkInStore.checkInClick();
        } else {
          checkInStore.checkOutClick();
        }
      }
    };
  }

  componentWillUnmount() {
    document.onkeydown = null;
  }

  focusInput = () => {
    this.input.focus();
  };

  render() {
    let checkInStore = this.props.checkInStore;
    return (
      <div className="card-input">
        <div className="card-btns">
          <div
            className={classnames({
              select: this.state.current === 0
            })}
            onClick={() => {
              this.setState({ current: 0 });
              this.focusInput();
            }}
          >
            签到
          </div>
          <div
            className={classnames({
              select: this.state.current === 1
            })}
            onClick={() => {
              this.setState({ current: 1 });
              this.focusInput();
            }}
          >
            签退
          </div>
        </div>
        <div className="card-content">
          <div className="content">
            <span>请刷卡</span>
            <input
              type="text"
              value={checkInStore.cardCode}
              onChange={e => {
                if (e.target.value.length <= 30) {
                  this.props.checkInStore.cardOnchange(e.target.value);
                }
              }}
              ref={input => {
                this.input = input;
              }}
              autoFocus
            />
          </div>
          <div
            className="btns"
            onClick={() => {
              if (this.props.handClick) {
                this.props.handClick();
              }
            }}
          >
            手工签到
          </div>
        </div>
      </div>
    );
  }
}

export default CardInput;
