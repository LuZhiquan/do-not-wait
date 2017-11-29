/**
* @author William Cui
* @description 宴会入口容器
* @date 2017-06-27
**/

import React, { Component } from 'react';
import { Link } from 'react-router';
import { inject, observer } from 'mobx-react';
import './banquet-index.less';

@inject('banquetCreateStore', 'banquetListStore')
@observer
class Banquet extends Component {
  banquetListStore = this.props.banquetListStore;

  //宴会
  clickbanquet = () => {
    this.banquetListStore.setthisclick(1);
  };

  //预定纪录
  clickbanquet = () => {
    this.banquetListStore.setthisclick(2);
  };

  render() {
    return (
      <div id="banquet-main">
        <div className="banquet-left">
          <Link
            to="/banquet"
            className={this.banquetListStore.thisclick === 1 ? 'select' : ''}
            onClick={this.clickbanquet}
          >
            宴会
          </Link>
          <Link
            to="/banquet/records"
            className={this.banquetListStore.thisclick === 2 ? 'select' : ''}
            onClick={this.bookarecord}
          >
            预订纪录
          </Link>
        </div>
        <div className="banquet-right">{this.props.children}</div>
      </div>
    );
  }
}

export default Banquet;
