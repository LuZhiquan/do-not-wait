import React from 'react';
import { Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router'; 
import { browserHistory } from 'react-router'; //路径跳转　

import Promptpopup from 'components/prompt-popup';//提示
import OpenClassPopup from '../../app/open-class-popup';//开班

import './more_popup.less'; 

const promptContStyle = {
  lineHeight: '200px',
  textAlign: 'center',
  color: '#000',
  fontSize: '20px'
}


//更多入口弹窗
@inject('selloutStore','dayEndStore','appStore') @observer
class MorePopup extends React.Component {

  constructor(props) {
    super(props);   
    this.state={
      tolink: '',
      Promptpopup: '',
      statePopup: false 
    };
  } 
  
  componentDidMount() {
    //沽清判断/sellout
    let selloutStore=this.props.selloutStore;
    selloutStore.getTakeeffect(); 

    //上一营业日有数据但没日结时
    let dayEndStore=this.props.dayEndStore;
    dayEndStore.checkBeforeDailyWorking();
  }

  //关闭按钮事件
  handleCancel=()=>{ 
    let { handleClose } = this.props;
    handleClose && handleClose();
  }

  //日结
  dayend=()=>{ 
    // let dayEndStore=this.props.dayEndStore;
    let appStore=this.props.appStore;  
    if(!appStore.isDayEnd) {
          this.setState({Promptpopup:<Promptpopup cancelText={"知道了"}　okText={"去日结"} 
          onCancel={()=>{//知道了
              this.setState({Promptpopup:''}); 
          }}
          onOk={()=>{//去日结 
            
              this.setState({Promptpopup:'',today:true});
              browserHistory.push('/day-end'); //去到日结页面
          }}>
              
              <div style={promptContStyle}>上一营业日还没日结</div>
          </Promptpopup>})
    }else{
       browserHistory.push('/day-end'); //去到日结页面
    }
  }

  render() {   
    let selloutStore=this.props.selloutStore; 

    let account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : null;
    let permissionList = account.permissionList && account.permissionList.length ? account.permissionList : [];
    let Offeracourse = permissionList.includes('CheckoutModule:offeracourse');//开班
    let Shift = permissionList.includes('CheckoutModule:Shift');//交班
    let QueryOrder = permissionList.includes('Order:QueryOrder');//订单
    let QueryMember = permissionList.includes('MemberModule:QueryMember');//会员查询
    let Queryput = permissionList.includes('SellClearModule:Queryput');//沽清
    let Endofday = permissionList.includes('CheckoutModule:Endofday');//日结
    let StopSale = permissionList.includes('OtherModule:StopSale');//停售

    return <div>
      <Modal 
        title="更多" 
        visible={true}   
        onCancel={this.handleCancel} 
        footer={null} 
        width={840}
        wrapClassName="cashier-popup-modal"
      >  
        <div className="popup-center">
          {QueryOrder && <Link className="link-btn" to="/fast-food-order">订单</Link>}
          {QueryMember && <Link className="link-btn" to="/member">会员</Link>}
          {Queryput && <Link className="link-btn" to={selloutStore.Takeeffect ? '/sellout/after' : '/sellout' }>沽清</Link>} 
          {StopSale && <Link className="link-btn" to="/discontinued">停售</Link>}
          {Offeracourse && <Link className="link-btn" onClick={() => {
              this.setState({
                statePopup: <OpenClassPopup 
                      closeCancel={()=>{
                          this.setState({statePopup: false}); 
                      }}
                      okCancel={()=>{
                          this.setState({statePopup: false}); 
                      }}
                  >
                  </OpenClassPopup>
              });  
          }}>开班</Link>}
          {Shift && <Link className="link-btn" to="/shift">交班</Link>}
          <Link className="link-btn" to="check-in">签到</Link>
          {Endofday && <Link to="/day-end" className="link-btn">日结</Link>}
        </div>
        <div className="return-btn" onClick={this.handleCancel}>返回</div>
      </Modal>
      {this.state.Promptpopup}
      {this.state.statePopup}
    </div>
  }
}

export default MorePopup;