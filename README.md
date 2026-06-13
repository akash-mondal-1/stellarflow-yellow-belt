# StellarFlow – Decentralized Crowdfunding on Stellar

A multi-wallet crowdfunding dApp built on the Stellar Network using Soroban Smart Contracts, React, TypeScript, and Stellar Wallets Kit.

This project was developed for the Stellar Developers Yellow Belt Level 2 Challenge.

---

## Features

### Multi-Wallet Support

* Freighter
* xBull
* Albedo

### Smart Contract Integration

* Soroban Smart Contract written in Rust
* Contract deployed on Stellar Testnet
* Real blockchain transactions
* Contract state fetched directly from the ledger

### Real-Time Activity Feed

* Live donation tracking
* Real transaction hashes
* Real donor wallet addresses
* Real Soroban event integration

### Transaction Tracking

* Pending
* Success
* Failed

### Error Handling

Implemented and tested:

1. Wallet not installed
2. Wallet connection rejected
3. Insufficient balance
4. Transaction submission failure
5. Network/RPC failure

### Responsive UI

* Glassmorphism design
* Mobile friendly
* React + TailwindCSS

---

# Smart Contract Information

## Contract Address

CCC7RME6HJVMKMRRUOMWUKGZKKWRAZLJ3SWN5GDU2Y5D4FCMCZ7N53PU

## Contract Explorer

https://lab.stellar.org/contract/CCC7RME6HJVMKMRRUOMWUKGZKKWRAZLJ3SWN5GDU2Y5D4FCMCZ7N53PU

## Verified Contract Transaction

Transaction Hash:

c2e843a080652841a358e6885498fabfa8548b045c576e1810d1474b8ba2f9f0

Explorer:

https://stellar.expert/explorer/testnet/tx/c2e843a080652841a358e6885498fabfa8548b045c576e1810d1474b8ba2f9f0

---

# Architecture

Frontend (React/Vite)
↓
Stellar Wallets Kit
↓
Soroban RPC
↓
Crowdfund Smart Contract
↓
Contract Events
↓
Live Activity Feed

---

# Screenshots

## Wallet Selection

![Wallet Selection](screenshots/wallet-connect.png)

## Dashboard

![Dashboard](screenshots/dashboard.png)

## Successful Donation

![Donation Success](screenshots/donation-success.png)

## Explorer Verification

![Explorer Verification](screenshots/explorer-proof.png)

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion

## Blockchain

* Stellar Testnet
* Soroban
* Stellar Wallets Kit
* Stellar SDK

## Smart Contract

* Rust
* Soroban SDK

---

# Local Development

## Clone Repository

```bash
git clone <repository-url>
cd stellarflow
```

## Install Dependencies

```bash
cd frontend
npm install
```

## Environment Variables

Create:

```env
frontend/.env
```

Add:

```env
VITE_CONTRACT_ID=CCC7RME6HJVMKMRRUOMWUKGZKKWRAZLJ3SWN5GDU2Y5D4FCMCZ7N53PU
```

## Run Frontend

```bash
npm run dev
```

---

# Smart Contract Build

```bash
cd contracts/crowdfund

stellar contract build
```

---

# Yellow Belt Requirement Verification

| Requirement                   | Status |
| ----------------------------- | ------ |
| Contract Deployed on Testnet  | ✅      |
| Contract Called from Frontend | ✅      |
| Transaction Status Visible    | ✅      |
| Multi Wallet Support          | ✅      |
| Real-Time Event Integration   | ✅      |
| Error Handling (3+)           | ✅      |
| Public GitHub Repository      | ✅      |
| README Documentation          | ✅      |

---

# Author

Akash Mondal

Built for Stellar Developers Yellow Belt Level 2 Challenge.
