import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ImageKitStudentSandboxView} from './components/ImageKitStudentSandboxView.tsx';
import './index.css';

const isMediaSandboxMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mediaSandbox') === '1';

createRoot(document.getElementById('root')!).render(
  isMediaSandboxMode ? <ImageKitStudentSandboxView /> : <App />
);

