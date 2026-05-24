import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AcademicProvider } from './context/AcademicContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AcademicProvider>
          <App />
        </AcademicProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
