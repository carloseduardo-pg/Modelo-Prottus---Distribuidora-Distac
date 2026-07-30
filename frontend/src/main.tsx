import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/distac-tokens.css';
import './styles/base.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
