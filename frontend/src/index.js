import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/flag-icon-emoji.css';
import App from './App';
import { SignupProvider } from './contexts/SignupContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SignupProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SignupProvider>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
