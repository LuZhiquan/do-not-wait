/**
* @author William Cui
* @description 路由顶层容器
* @date 2017-03-27
**/

import { Component } from 'react';

class App extends Component {
  render() {
    return this.props.children;
  }
}

export default App;
