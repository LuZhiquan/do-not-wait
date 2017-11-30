import React from 'react';
import { render } from 'react-dom';
import 'whatwg-fetch';
import registerServiceWorker from './registerServiceWorker';

import Routes from './views/Routes';

import 'assets/styles/index/antd.css';
import 'assets/styles/index/_reset.css';
import 'assets/iconfont/iconfont.css';
import 'assets/styles/popup/popup.css';
import 'assets/styles/message/message.css';
import 'assets/styles/modal.css';

render(
	<Routes />,
	document.getElementById('root')
);

registerServiceWorker();

