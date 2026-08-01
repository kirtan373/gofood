import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './ui.css';
import App from './App';
import './dark.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();