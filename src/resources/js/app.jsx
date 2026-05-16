import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import '../css/app.css';

createRoot(document.getElementById('app')).render(<App />);
