import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './views/Routes';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Routes />, div);
});
