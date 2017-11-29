import React from 'react';
import { observer, inject } from 'mobx-react';
import { Modal } from 'antd';
import './alter_password_popup.less';

@inject('memberStore')
@observer
class AlterPassword extends React.Component {
	constructor(props) {
		super(props);
		this.props.memberStore.alterInitial();
	}

	handleCancel = () => {
		if (this.props.cancelClick) {
			this.props.cancelClick();
		}
		this.props.memberStore.alterHandleCancel();
	};

	handleOk = () => {
		if (this.props.okClick) {
			this.props.okClick();
		}
		this.props.memberStore.alterHandleOk();
	};

	render() {
		let memberStore = this.props.memberStore;

		return (
			<div>
				<Modal
					title="修改密码"
					visible={true}
					maskClosable={false}
					onCancel={this.handleCancel}
					closable={false}
					onOk={this.handleOk}
					width={500}
					wrapClassName="alter-password-popup-modal"
				>
					<div className="alter-password-container">
						<div>
							<span className="al-title">旧密码</span>
							<input
								type="password"
								value={memberStore.alterPassword.oldPassword}
								onChange={(e) => {
									if (e.target.value.length <= 6 && /^\w*$/.test(e.target.value)) {
										memberStore.alterOldPassword(e.target.value);
									}
								}}
							/>
							<span className="error">{memberStore.alterErrorText.oldError}</span>
						</div>
						<div>
							<span className="al-title">新密码</span>
							<input
								type="password"
								value={memberStore.alterPassword.newPassword}
								onChange={(e) => {
									if (e.target.value.length <= 6 && /^\w*$/.test(e.target.value)) {
										memberStore.alterNewPassword(e.target.value);
									}
								}}
							/>
						</div>
						<div>
							<span className="al-title">新密码确认</span>
							<input
								type="password"
								value={memberStore.alterPassword.confirmPassword}
								onChange={(e) => {
									if (e.target.value.length <= 6 && /^\w*$/.test(e.target.value)) {
										memberStore.alterConfirmPassword(e.target.value);
									}
								}}
							/>
							<span className="error">{memberStore.alterErrorText.confirmError}</span>
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}

export default AlterPassword;
