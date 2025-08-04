import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts'
import './styles/style.scss'
import "@fontsource/roboto"

export { default as Common } from './components/Common.tsx';


/*

export { default as Error } from './components/Error';

export { default as Login } from './components/Login';
export { default as Admin } from './components/Admin';
export { default as Main } from './components/Main';
export { default as Offline } from './components/Offline';
export { default as Schedules } from './components/Schedules';

*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);serviceWorkerRegistration.register();