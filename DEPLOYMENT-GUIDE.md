# Whiz402Token Deployment Guide

## Overview
You've successfully updated your token minting system with the following new parameters:
- **Max Supply**: 999,999,999 tokens (increased from 1,000,000)
- **Mint Amount**: 50,000 tokens per mint (increased from 100)
- **Price**: $1.00 USDC per mint (increased from $0.10)

## Step-by-Step Deployment

### Step 1: Deploy the New Token Contract

You have two deployment options:

#### Option A: Using thirdweb (RECOMMENDED - Easiest)

1. Install thirdweb CLI globally:
   ```bash
   npm install -g thirdweb
   ```

2. Deploy the contract:
   ```bash
   npx thirdweb deploy src/contracts/Whiz402Token.sol
   ```

3. This will:
   - Compile your contract automatically
   - Open a browser to thirdweb dashboard
   - Let you choose network → **Select "Base" (Chain ID 8453)**
   - Deploy and verify the contract automatically

4. After deployment, copy the contract address (it will look like `0x...`)

#### Option B: Using Remix IDE

1. Go to https://remix.ethereum.org/
2. Create a new file: `Whiz402Token.sol`
3. Copy contents from `src/contracts/Whiz402Token.sol`
4. Add import remapping in Remix settings:
   ```
   @openzeppelin/=https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/
   ```
5. Compile with Solidity 0.8.20+
6. Connect MetaMask to **Base Mainnet**
7. Deploy using "Injected Provider - MetaMask"
8. Copy the deployed contract address

### Step 2: Transfer Contract Ownership

The contract needs to be owned by your seller account so the backend can mint tokens.

**Your Seller Account**: `0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1`

#### If you deployed with thirdweb:
Run the transfer ownership script:
```bash
npm run transfer-ownership
```

#### If you deployed with Remix:
In Remix, call the `transferOwnership` function with:
```
0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1
```

### Step 3: Update Environment Variables

Update your `.env.local` file with the new contract address:

```bash
TOKEN_CONTRACT_ADDRESS=0x...  # Replace with your new contract address
```

### Step 4: Deploy to Vercel

1. Commit and push all changes to GitHub:
   ```bash
   git add .
   git commit -m "Update token contract: 999M supply, 50k tokens per $1 USDC"
   git push
   ```

2. Vercel will automatically redeploy your application

3. Make sure your Vercel environment variables include:
   - `TOKEN_CONTRACT_ADDRESS` (your new contract address)
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
   - `CDP_WALLET_SECRET`
   - `NETWORK=base`

### Step 5: Verify Everything Works

1. Go to your deployed site: `https://x402-whiz-token.vercel.app/mint`

2. Connect your wallet

3. Try to mint tokens (you'll pay $1.00 USDC and receive 50,000 tokens)

4. Check the transaction on BaseScan

5. Verify the USDC payment arrived in your seller wallet:
   ```bash
   node check-usdc-balance.mjs
   ```

## What Changed

### Contract Changes
- **File**: `src/contracts/Whiz402Token.sol`
- Name: "Whiz402"
- Symbol: "WHIZ"
- MAX_SUPPLY: 999,999,999 tokens
- MINT_AMOUNT: 50,000 tokens

### Backend Changes
- **File**: `src/middleware.ts:34`
  - Price: "$1.00" (was "$0.10")
  - Description: "Mint 50,000 Whiz402 tokens"

- **File**: `src/lib/token.ts:21`
  - MINT_AMOUNT: 50,000 tokens (was 100)

- **File**: `src/app/api/mint/route.ts`
  - Updated documentation to reflect $1.00 and 50,000 tokens

### Frontend Changes
- **File**: `src/app/mint/page.tsx`
  - Price display: "$1.00 USDC"
  - Button text: "Mint 50,000 Tokens"
  - Instructions updated throughout

## Withdrawing Your Earnings

After users mint tokens, you can withdraw USDC to your personal wallet:

1. Edit `scripts/withdraw-usdc.ts` and add your MetaMask address on line 15

2. Run the withdrawal script:
   ```bash
   npx tsx scripts/withdraw-usdc.ts
   ```

3. The script will transfer all USDC from the seller wallet to your personal wallet

**Note**: Make sure the seller wallet has enough ETH for gas fees (~0.001 ETH)

## Contract Details

### Old Contract (DO NOT USE)
- Address: `0x9e3B554776258543b8a2cAF7D09c67D14C31879E`
- Max Supply: 1,000,000 tokens
- Mint Amount: 100 tokens per $0.10

### New Contract (DEPLOY THIS)
- Contract: `src/contracts/Whiz402Token.sol`
- Max Supply: 999,999,999 tokens
- Mint Amount: 50,000 tokens per $1.00
- Address: (will be set after deployment)

## Support

If you encounter any issues:

1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Ensure seller wallet has ETH for gas fees
4. Check BaseScan for transaction status

## Quick Reference

```bash
# Check deployment guide
npm run deploy-whiz

# Transfer ownership (after deploying contract)
npm run transfer-ownership

# Check USDC balance
node check-usdc-balance.mjs

# Withdraw USDC to your wallet
npx tsx scripts/withdraw-usdc.ts

# Local development
npm run dev
```

## Network Information

- **Network**: Base Mainnet
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Seller Wallet**: 0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1
- **USDC Contract**: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

Good luck with your deployment! 🚀
