
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { AuthProvider } from '../context/AuthContext'
// @ts-ignore: Allow importing global CSS without type declarations in this file
import '../styles/globals.css' // Ensure this matches your CSS import path

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}