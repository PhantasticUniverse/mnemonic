import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initializeDatabase } from '@mnemonic/core';
import './styles/globals.css';

// Initialize the database (seeds default data if empty)
initializeDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
