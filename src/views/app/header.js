/**
* @author William Cui
* @description 头部导航容器
* @date 2017-03-27
**/

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router';
import { message } from 'antd';

import MorePopup from './more-popup'; //更多
import OpenClassPopup from './open-class-popup'; //开班
import Prompt from 'components/prompt-common'; //错误提示
import TopBar from 'components/top-bar'; //顶部条

import 'assets/styles/index/_fd_public.css';
import 'assets/styles/index/content.css';
import 'assets/styles/index/index_navs.css';
import 'assets/styles/index/left_bottom.css';

@inject('appStore')
@observer
class Header extends Component {
  constructor(props, context) {
    super(props, context);
    this.props.appStore.getMealName(0);
    this.state = {
      morePopup: false,
      statePopup: false
    };
  }

  componentDidUpdate() {
    let appStore = this.props.appStore;
    let feedback = appStore.feedback;
    if (
      feedback &&
      feedback.status !== 'error' &&
      feedback.status !== 'validate'
    ) {
      //提示
      switch (feedback.status) {
        case 'success':
          message.success(feedback.msg, appStore.closeFeedback());
          break;
        case 'warn':
          message.warn(feedback.msg, appStore.closeFeedback());
          break;
        case 'error':
          message.error(feedback.msg, appStore.closeFeedback());
          break;
        default:
          message.info(feedback.msg, appStore.closeFeedback());
      }
    }
  }

  render() {
    let account = sessionStorage.getItem('account')
      ? JSON.parse(sessionStorage.getItem('account'))
      : { userName: '' };
    let permissionList =
      account.permissionList && account.permissionList.length
        ? account.permissionList
        : [];
    let Offeracourse = permissionList.includes('CheckoutModule:offeracourse'); //开班
    let Shift = permissionList.includes('CheckoutModule:Shift'); //交班
    let QueryOrder = permissionList.includes('Order:QueryOrder'); //订单
    let QueryDinnerParty = permissionList.includes(
      'DinnerParty:QueryDinnerParty'
    ); //宴会查询
    let QueryReservation = permissionList.includes(
      'ReservationModule:QueryReservation'
    ); //预订查询
    let QueryMember = permissionList.includes('MemberModule:QueryMember'); //会员查询

    let { appStore } = this.props;
    let feedback = appStore.feedback;
    let operatePrompt;
    if (feedback && feedback.status === 'error') {
      //错误提示
      feedback.okClick = () => {
        if (feedback.confirmClick) feedback.confirmClick();
        feedback.cancelClick();
      };
      feedback.cancelClick = () => {
        appStore.closeFeedback();
      };
      operatePrompt = <Prompt message={feedback} />;
    }

    let links = [];
    const dineLink = {
      //堂食
      path: '/dine',
      icon: 'icon-home_tangshi',
      text: '堂食'
    };
    const chooseCashierLink = {
      //自选收银
      path: '/cashier',
      icon: 'icon-home_shouyin',
      text: '收银'
    };
    const dishCashierLink = {
      //点菜收银
      path: '/dishes-cashier',
      icon: 'icon-home_shouyin',
      text: '收银'
    };
    const memberLink = {
      //会员
      path: '/member',
      icon: 'icon-home_huiyuan',
      text: '会员'
    };
    const orderLink = {
      //订单
      path: '/order',
      icon: 'icon-home_dingdan',
      text: '订单'
    };
    const fastOrderLink = {
      //快餐订单
      path: '/fast-food-order',
      icon: 'icon-home_dingdan',
      text: '订单'
    };
    const bookingLink = {
      //预订
      path: '/booking',
      icon: 'icon-home_yuding',
      text: '预订'
    };
    const banquetLink = {
      //宴会
      path: '/banquet',
      icon: 'icon-home_yanhui',
      text: '宴会'
    };
    const openClassLink = {
      //开班
      action: () => {
        let permissionList = JSON.parse(sessionStorage.getItem('account'))
          .permissionList;
        if (permissionList.includes('CheckoutModule:offeracourse')) {
          appStore.ifopenclass = true;
          this.setState({
            statePopup: (
              <OpenClassPopup
                closeCancel={() => {
                  this.setState({ statePopup: false });
                }}
                okCancel={() => {
                  this.setState({ statePopup: false });
                }}
              />
            )
          });
        } else {
          message.destroy();
          message.info('你没有开班的权限', 2);
        }
      },
      icon: 'icon-home_kaiban',
      text: '开班'
    };
    const shiftLink = {
      //交班
      path: '/shift',
      icon: 'icon-home_jiaoban',
      text: '交班'
    };
    const moreLink = {
      //更多
      action: () => {
        this.setState({
          morePopup: (
            <MorePopup
              closepopup={() => {
                this.setState({ morePopup: '' });
              }}
            />
          )
        });
      },
      icon: 'icon-home_gengduo',
      text: '更多'
    };

    switch (account.businessPattern) {
      case 1239: //快餐-点菜模式
        links = [
          dishCashierLink,
          QueryMember && memberLink,
          QueryOrder && fastOrderLink,
          Offeracourse && openClassLink,
          Shift && shiftLink,
          moreLink
        ];
        break;
      case 1332: //快餐-自选模式
        links = [
          chooseCashierLink,
          QueryMember && memberLink,
          QueryOrder && fastOrderLink,
          Offeracourse && openClassLink,
          Shift && shiftLink,
          moreLink
        ];
        break;
      default:
        //正餐1238
        links = [
          dineLink,
          QueryMember && memberLink,
          QueryOrder && orderLink,
          QueryReservation && bookingLink,
          QueryDinnerParty && banquetLink,
          Offeracourse && openClassLink,
          Shift && shiftLink,
          moreLink
        ];
    }

    links = links.filter(link => link);

    return (
      <div id="nav">
        <TopBar />
        <div id="deskNav">
          {['', '', '', '', '', '', '', ''].map((item, index) => {
            let link = links[index];
            if (link) {
              let operator = link.path
                ? { to: link.path }
                : { onClick: link.action };
              return (
                <Link key={index} {...operator} activeClassName="active">
                  <i className={`iconfont ${link.icon}`} />
                  {link.text}
                </Link>
              );
            } else {
              return <Link className="empty" key={index} />;
            }
          })}
        </div>
        {operatePrompt}
        {this.props.children}
        {this.state.morePopup}
        {appStore.ifopenclass && this.state.statePopup}
      </div>
    );
  }
}

Header.wrappedComponent.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Header;
