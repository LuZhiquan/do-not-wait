import React from 'react';

import './zeng_number_block.css';
import '../../iconfont/iconfont.css';
class ZhuanzengNumber extends React.Component {

  //转赠数量
   state = {number:1}

   jianClick=()=>{
     if(this.state.number>0){
        let value = this.state.number-1;
        console.log(value);
        this.setState({number:value})  
     }
      
   }

   jiaClick=()=>{
       let value = this.state.number+1;
       console.log(value);
        this.setState({number:value})  

   }
  render() {
     
    return (
        <div className="zhuang-zeng-block">
                 
            {this.props.children}
            <div className="number"><i className="iconfont icon-jian" onClick={this.jianClick}></i>{this.state.number}<i className="iconfont icon-jia"  onClick={ this.jiaClick}></i></div>                    
        </div>
    );
  }
}



export default ZhuanzengNumber;