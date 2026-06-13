import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force Vite to use a single instance of each package — prevents the
    // older stellar-base (v13/v14) bundled inside @creit.tech/stellar-wallets-kit
    // and @trezor/* from being loaded alongside stellar-base v15.
    // Without this, XDR deserialization in getTransaction() uses the wrong
    // TransactionMeta definition and throws "Bad union switch: 4".
    dedupe: [
      '@stellar/stellar-sdk',
      '@stellar/stellar-base',
    ],
    alias: {
      '@stellar/stellar-sdk': path.resolve(
        __dirname,
        'node_modules/@stellar/stellar-sdk'
      ),
      '@stellar/stellar-base': path.resolve(
        __dirname,
        'node_modules/@stellar/stellar-sdk/node_modules/@stellar/stellar-base'
      ),
    },
  },
})
