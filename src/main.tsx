import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import "./index.css"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import store from './redux/store';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
// import 'aos/dist/aos.css'
import Router from './Routers';
import 'react-datepicker/dist/react-datepicker.css'; // Import CSS


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
        <BrowserRouter basename='/'>
        <ScrollToTop/>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Router />
          </React.Suspense>
        </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ className: 'react-hot-toast' }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
