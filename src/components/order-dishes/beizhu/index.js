import React from 'react';

import './beizhu.css';
class BeiZhu extends React.Component {

  //  remarkValue 备注内容
  state = {memo: this.props.memo || ''}

  componentWillReceiveProps(props) {
    if (this.props !== props) {
      this.setState({ memo: props.memo });
    }
  }

  render() {

    return (
        <div className="remarks">
          <textarea 
            className="remark-textarea" 
            value={this.state.memo}
            placeholder="请输入备注，限100字以内。"
            onChange={(e)=>{
              let memo = e.target.value.substr(0, 100);
              this.props.onEntry && this.props.onEntry(memo);
            }}
          ></textarea>
          <i className="iconfont icon-shanchu1" onClick={()=>{
              this.props.onEntry && this.props.onEntry('');
          }}></i>
        </div>
    );
  }
}



export default BeiZhu;
