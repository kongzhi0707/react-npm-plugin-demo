
import React from 'react';
import ReactDOM from 'react-dom';
import ChangeButton from './components/change-button';

const App = () => {
  return (
    <div>
      <ChangeButton />
    </div>
  );
}

// 要实现局部热更新，必须添加如下代码
if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(<App />, document.getElementById('root'));