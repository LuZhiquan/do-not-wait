import React from 'react';
import { observer, inject } from 'mobx-react';
import { Modal } from 'antd';
import './card_code_popup.less';

@inject('memberStore')
@observer
class CardCode extends React.Component {
	constructor(props) {
		super(props);

		this.state = { code: '' };
	}

	componentDidMount() {
		this.nameInput.focus();
	}

	componentDidUpdate() {
		let memberStore = this.props.memberStore;

		memberStore.memberInfo.chipCode = '';
		let _this = this;
		document.onkeydown = function(e) {
			if (e.which === 13) {
				memberStore.getCardCode(_this.state.code);
				if (_this.props.close) {
					_this.props.close();
				}
			}
		};
	}
	componentWillUnmount() {
		document.onkeydown = null;
	}
	handleCancel = () => {
		if (this.props.handleCancel) {
			this.props.handleCancel();
		}
	};

	render() {
		return (
			<div>
				<Modal
					title="刷卡"
					visible={true}
					maskClosable={false}
					onCancel={this.handleCancel}
					onOk={this.handleOk}
					width={500}
					footer={null}
					wrapClassName="card-code-modal"
				>
					<div className="card-code-container">
						<div className="content">
							<span>请刷卡</span>
							<input
								type="text"
								value={this.state.code}
								onChange={(e) => {
									if (e.target.value.length <= 30) {
										this.setState({ code: e.target.value });
									}
								}}
								ref={(input) => {
									this.nameInput = input;
								}}
							/>
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}

export default CardCode;
