# Quick Deployment Guide for X402 Token Minting Platform

This guide will help you deploy your token minting platform to Vercel in under 10 minutes.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- MetaMask or any Ethereum wallet

## Step 1: Get Coinbase CDP Credentials (2 minutes)

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
2. Sign up or log in
3. Create a new project
4. Navigate to "API Keys" and create a new key
5. Save these values (you'll need them for Vercel):
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
6. Navigate to "Wallets" and create a wallet secret
7. Save `CDP_WALLET_SECRET`

## Step 2: Deploy the Token Contract (3 minutes)

### Using Remix IDE (Easiest):

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `MintableToken.sol`
3. Copy contents from `src/contracts/MintableToken.sol`
4. Click "Solidity Compiler" tab, select version `0.8.20+`
5. Click "Compile MintableToken.sol"
6. Click "Deploy & Run Transactions" tab
7. Select "Injected Provider - MetaMask"
8. Connect MetaMask to **Base Sepolia** network:
   - Network Name: Base Sepolia
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency: ETH
   - Block Explorer: `https://sepolia.basescan.org`
9. Get free testnet ETH from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
10. Click "Deploy" in Remix
11. **Copy the deployed contract address** (you'll need this)

## Step 3: Deploy to Vercel (3 minutes)

1. Push your code to GitHub:
   ```bash
   cd x402-starter
   git init
   git add .
   git commit -m "Initial commit - X402 token minting platform"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. Go to [Vercel](https://vercel.com/new)
3. Import your GitHub repository
4. Configure Project:
   - Framework Preset: Next.js
   - Root Directory: `./`
5. Add Environment Variables:
   ```
   CDP_API_KEY_ID=your_key_from_step1
   CDP_API_KEY_SECRET=your_secret_from_step1
   CDP_WALLET_SECRET=your_wallet_secret_from_step1
   TOKEN_CONTRACT_ADDRESS=your_contract_address_from_step2
   NETWORK=base-sepolia
   ```
6. Click "Deploy"

## Step 4: Test Your Platform (2 minutes)

1. Once deployed, visit `https://your-app.vercel.app/mint`
2. Enter a test wallet address
3. Click "Mint 100 Tokens"
4. The X402 payment flow will initiate
5. After payment, check the transaction on [BaseScan](https://sepolia.basescan.org)

## Going to Production

When ready for mainnet:

1. Deploy contract to Base mainnet using same Remix process (switch network in MetaMask)
2. Update Vercel environment variables:
   ```
   NETWORK=base
   TOKEN_CONTRACT_ADDRESS=your_mainnet_contract_address
   ```
3. Fund your CDP seller wallet with USDC for gas fees

## Costs

### Testnet (Free):
- Contract deployment: Free testnet ETH
- Minting gas: Free (funded by faucet)
- X402 payments: Testnet USDC (free)

### Mainnet:
- Contract deployment: ~$1-5 in ETH
- Per mint gas: ~$0.10-0.50 in ETH
- X402 payment: $1.00 USDC per mint (charged to user)

## Troubleshooting

### Build fails on Vercel
- Make sure all environment variables are set
- Check that there are no TypeScript errors

### Contract deployment fails
- Ensure you have testnet ETH in MetaMask
- Try refreshing Remix and recompiling

### Minting doesn't work
- Verify `TOKEN_CONTRACT_ADDRESS` is correct
- Check seller wallet has USDC (auto-funded on testnet)

## Support

- [X402 Documentation](https://x402.gitbook.io/x402)
- [Coinbase CDP Docs](https://docs.cdp.coinbase.com/)
- [Vercel Support](https://vercel.com/support)

## Next Steps

- Customize the UI in `src/app/mint/page.tsx`
- Adjust pricing in `src/middleware.ts`
- Add analytics and monitoring
- Create custom token name/symbol in the contract
