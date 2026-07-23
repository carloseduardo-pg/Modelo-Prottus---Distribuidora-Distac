import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/distac-tokens.css';
import './styles/crud.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
