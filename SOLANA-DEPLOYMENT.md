# Solana X402 Token Minting - Deployment Guide

## Overview
This guide will help you deploy an X402-powered SPL token minting service on Solana.

## Why Solana?
- ⚡ **400ms finality** (vs 2-12 seconds on Base)
- 💰 **$0.00025 per transaction** (vs $0.01-0.10 on Base)
- 🚀 **Supports ALL SPL tokens** (vs EIP-3009 only on EVM)
- 🌐 **Better for high-frequency, low-value transactions**

## Prerequisites
- Solana CLI installed
- Node.js and npm
- A Solana wallet (Phantom, Solflare, etc.)
- Some SOL for transaction fees (~0.01 SOL)

## Step 1: Install Solana CLI

```bash
# macOS/Linux
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Windows
# Download from https://github.com/solana-labs/solana/releases
```

Verify installation:
```bash
solana --version
```

## Step 2: Create Solana Wallet for Seller Account

```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/seller-keypair.json

# Get the public key
solana-keygen pubkey ~/.config/solana/seller-keypair.json
```

**Save this address!** This is your seller account that will receive USDC payments.

## Step 3: Fund Your Seller Wallet

### For Devnet (Testing):
```bash
# Set network to devnet
solana config set --url devnet

# Airdrop SOL for testing
solana airdrop 2
```

### For Mainnet (Production):
1. Send at least 0.1 SOL to your seller address
2. You can buy SOL on exchanges like Coinbase, Binance, etc.

## Step 4: Create SPL Token

```bash
# Create a new SPL token
spl-token create-token

# This will output your Token Mint Address - SAVE IT!
# Example: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

## Step 5: Configure Environment Variables

Update your `.env.local` file:

```bash
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta  # or "devnet" for testing
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com

# Seller wallet private key (JSON array format)
SOLANA_SELLER_PRIVATE_KEY=[1,2,3...]  # Your keypair secret from Step 2

# Token mint address from Step 4
SOLANA_TOKEN_MINT=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### Get Private Key as JSON Array:
```bash
cat ~/.config/solana/seller-keypair.json
```

Copy the entire array (e.g., `[1,2,3,4,5...]`) and paste it as `SOLANA_SELLER_PRIVATE_KEY`.

## Step 6: Grant Mint Authority

Your seller wallet needs to be the mint authority:

```bash
# If you created the token, you're already the authority
# Otherwise, transfer authority:
spl-token authorize <TOKEN_MINT> mint <SELLER_PUBLIC_KEY>
```

## Step 7: Deploy to Vercel

Update Vercel environment variables:

1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add these variables:
   - `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`
   - `NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com`
   - `SOLANA_SELLER_PRIVATE_KEY=[...]` (your private key)
   - `SOLANA_TOKEN_MINT=...` (your token mint address)

3. Redeploy:
```bash
git push
```

## Step 8: Test Your Minting

1. Go to `https://your-domain.vercel.app/mint-solana`
2. Enter a Solana address
3. Click "Mint 50,000 SPL Tokens"
4. Pay $0.10 USDC via X402
5. Tokens should arrive in <1 second!

## How to Check Your Earnings

### Check USDC Balance:
```bash
# Get your seller's USDC token account
spl-token accounts <USDC_MINT_ADDRESS>

# USDC Mint Address on Solana:
# EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Withdraw USDC:
```bash
# Transfer USDC to your personal wallet
spl-token transfer <USDC_TOKEN_ACCOUNT> <AMOUNT> <YOUR_WALLET_ADDRESS>
```

## Network Information

### Mainnet:
- **Network**: mainnet-beta
- **RPC**: https://api.mainnet-beta.solana.com
- **Explorer**: https://solscan.io
- **USDC Mint**: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

### Devnet:
- **Network**: devnet
- **RPC**: https://api.devnet.solana.com
- **Explorer**: https://solscan.io?cluster=devnet
- **Test Faucet**: https://faucet.solana.com

## Pricing Comparison

| Feature | Base (EVM) | Solana |
|---------|------------|--------|
| Finality | 2-12 seconds | 400ms |
| TX Cost | $0.01-0.10 | $0.00025 |
| Token Standard | ERC-20 (EIP-3009) | SPL (All tokens) |
| Mint Cost | ~$0.50 | ~$0.00025 |

## Troubleshooting

### Error: "Insufficient SOL for transaction"
- Your seller wallet needs SOL for gas fees
- Send at least 0.01 SOL to your seller address

### Error: "Invalid mint authority"
- Make sure your seller wallet is the mint authority
- Run: `spl-token authorize <TOKEN_MINT> mint <SELLER_PUBLIC_KEY>`

### Error: "Token account not found"
- The recipient needs a token account
- The code automatically creates one, but requires SOL for rent

## Security Best Practices

1. **Never commit private keys** to GitHub
2. **Use environment variables** for sensitive data
3. **Test on devnet** before mainnet
4. **Keep seller wallet secure** - it holds your earnings
5. **Regular backups** of your keypair file

## Support

- Solana Docs: https://docs.solana.com
- X402 Docs: https://docs.payai.network
- SPL Token Guide: https://spl.solana.com/token

## Quick Reference Commands

```bash
# Check balance
solana balance <ADDRESS>

# Check token balance
spl-token balance <TOKEN_MINT>

# Transfer tokens
spl-token transfer <TOKEN_MINT> <AMOUNT> <RECIPIENT>

# View token info
spl-token display <TOKEN_MINT>
```

Good luck with your Solana deployment! 🚀
