import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react"
import { ToastProvider } from '../components/Toaster';
import NotificationPoller from '../components/NotificationPoller';

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <NotificationPoller />
      <Component {...pageProps} />
      <Analytics />
    </ToastProvider>
  );
}
