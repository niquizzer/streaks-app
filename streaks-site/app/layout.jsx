"use client"

import "./globals.css";
import { store } from "./store/store";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Provider } from 'react-redux';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
