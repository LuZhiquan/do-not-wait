import React from 'react';

import './change_number_bar.css';
class ChangeNumberBar extends React.Component {

  state = {number: this.props.min}

  jianClick=()=>{
    if(this.state.number>1){
      let value = this.state.number-1;
      this.setState({number: value});  
      this.props.changeNumber && this.props.changeNumber(value); 
    } 
  }

  jiaClick=()=>{
    if(this.state.number<this.props.max) {
      let value = this.state.number+1;
      this.setState({number: value});  
      this.props.changeNumber && this.props.changeNumber(value); 
    }
  }

  render() {
    let { enabled } = this.props;
    return <li>
        {this.props.children}
        {enabled && this.state.number>0 && <div className="number">
          <i className="iconfont icon-jian" onClick={this.jianClick}></i>
          {this.state.number}
          <i className="iconfont icon-jia" onClick={ this.jiaClick}></i>
        </div>}  
    </li>
  }
}



export default ChangeNumberBar;