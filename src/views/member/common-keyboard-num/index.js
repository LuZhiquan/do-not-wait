import React from 'react';
import './common-keyboard-num.less';
import { message } from 'antd';
message.config({
	top: 300
});

class CommonKeyboardNum extends React.Component {
	state = { result: '' };

	itemClick = (e) => {
		let temp = this.state.result;
		let value = e.target.value;

		let fixTwo = /^\d{0,8}\.{0,1}(\d{0,1})?$/; // 正则匹配小数位不超过2位

		if (temp.startsWith('.')) {
			temp = '0'.concat(temp);
		}

		if (temp * 1 < 100000) {
			if (fixTwo.test(temp)) {
				if (value) {
					if (value >= 0 && value <= 9) {
						temp = temp.concat(value);
					} else if (value === '.') {
						if (!temp.includes('.')) {
							temp = temp.concat(value);
						}
					}
				} else {
					temp = temp.substring(0, temp.length - 1);
				}

				this.setState({ result: temp });

				if (this.props.getResult) {
					this.props.getResult(temp);
				}
			} else {
				if (!value) {
					temp = temp.substring(0, temp.length - 1);
					this.setState({ result: temp });

					if (this.props.getResult) {
						this.props.getResult(temp);
					}
				} else {
					message.destroy();
					message.info('只能输入两位小数');
				}
			}
		} else {
			if (!value) {
				temp = temp.substring(0, temp.length - 1);
				this.setState({ result: temp });

				if (this.props.getResult) {
					this.props.getResult(temp);
				}
			} else {
				message.destroy();
				message.info('已达到最大值');
			}
		}
	};

	render() {
		return (
			<div className="my-common-keybord" style={{ width: this.props.width, height: this.props.height }}>
				<div className="button-combination">
					<div className="item-main">
						<input type="button" className="btn-item" value="1" onClick={this.itemClick} />
						<input type="button" className="btn-item" value="2" onClick={this.itemClick} />
						<input type="button" className="btn-item" value="3" onClick={this.itemClick} />
					</div>
				</div>
				<div className="button-combination">
					<div className="item-main">
						<input type="button" className="btn-item" value="4" onClick={this.itemClick} />
						<input type="button" className="btn-item" value="5" onClick={this.itemClick} />
						<input type="button" className="btn-item" value="6" onClick={this.itemClick} />
					</div>
				</div>
				<div className="button-combination">
					<div className="item-main">
						<input type="button" className="btn-item" value="7" onClick={this.itemClick} />
						<input type="button" className="btn-item" value="8" onClick={this.itemClick} />
						<input type="button" className="btn-item" value="9" onClick={this.itemClick} />
					</div>
				</div>
				<div className="button-combination">
					<div className="item-main">
						{this.props.Whetherpoint === true && (
							<input type="button" className="btn-item" value="." onClick={this.itemClick} />
						)}
						<input type="button" className="btn-item" value="0" onClick={this.itemClick} />
						<button
							className={this.props.Whetherpoint === true ? 'btn-item' : 'btn-item newflex'}
							onClick={this.itemClick}
						>
							<i className="iconfont icon-order_btn_back" />
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default CommonKeyboardNum;
