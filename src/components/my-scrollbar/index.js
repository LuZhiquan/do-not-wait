import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';

import './my-scrollbar.css';

class MyScroll extends React.Component{

    preClick=()=>{
       let scrollTop = this.refs.scrollbars.getScrollTop();
       let clientHeight = this.refs.scrollbars.getClientHeight();
       this.refs.scrollbars.scrollTop(scrollTop-clientHeight+10);
    }
    nextClick=()=>{
      let scrollTop= this.refs.scrollbars.getScrollTop();
      let clientHeight = this.refs.scrollbars.getClientHeight();
      this.refs.scrollbars.scrollTop(scrollTop+clientHeight-10);
    }

    render(){
        return <div className="my-scroll">
          <Scrollbars style={{ width:this.props.width, height: this.props.height }}  ref="scrollbars">
            <ul className="all-items-right">
              {this.props.children}
            </ul>
          </Scrollbars>
          <div className="all-pagination">
            {this.props.hasAllSelected &&
            <div onClick={this.props.handleAllSelected}>
              <i className={classnames({
                  'iconfont': true,
                  'icon-kaitairen_icon_sel-': true,
                  'selected': this.props.areAllSelected
              })}></i> 
              全选
              <span style={{marginLeft: '40px'}}>已选{this.props.areSelectedNumber}份</span>
            </div>}
            <div onClick={this.preClick}>上一页</div>
            <div onClick={this.nextClick}>下一页</div>
          </div>
      </div>
    }
}

export default MyScroll;
