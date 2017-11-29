import React from 'react';

import './change_number.css';
class ZhuanzengNumber extends React.Component {

   state = {number: this.props.min || 1}

   jianClick=()=>{
     if(this.state.number>1){
        let value = this.state.number-1;
        this.setState({number: value});  
        this.props.onChange && this.props.onChange(value); 
     } 
   }

  jiaClick=()=>{
    if(this.state.number<this.props.max) {
      let value = this.state.number+1;
      this.setState({number: value});  
      this.props.onChange && this.props.onChange(value); 
    }
  }

  componentDidMount() {
     this.props.onChange && this.props.onChange(this.state.number); 
  }

  render() {
     
    return (
        <div className="zhuang-zeng-block">
            {this.props.children}
            <div className="number">
              <i className="iconfont icon-jian" onClick={this.jianClick}></i>
              {this.state.number}
              <i className="iconfont icon-jia" onClick={ this.jiaClick}></i>
            </div>                    
        </div>
    );
  }
}



export default ZhuanzengNumber;