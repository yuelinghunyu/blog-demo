import React from 'react';
import './App.scss';

import Content from './component/content'

function App() {
  return (
    <div className="app">
      <header className="app-header">header</header>
      <Content />
      <footer className="app-footer">footer</footer>
    </div>
  );
}

export default App;
