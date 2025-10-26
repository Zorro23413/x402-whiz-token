# X402 Token Minting Platform

A decentralized token minting platform built with X402 payment protocol. Users can mint 100 tokens for $1.00 USDC using the X402 accountless payment system.

## Features

- **X402 Payment Integration**: Pay-per-mint using the X402 protocol ($1.00 per mint)
- **Instant Token Minting**: Receive 100 X402 tokens instantly after payment
- **No Account Required**: True accountless payments via X402
- **Base Network**: Deployed on Base blockchain (Ethereum L2)
- **Beautiful UI**: Modern, responsive minting interface

## Architecture

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Visit /mint page
       ▼
┌─────────────────┐
│  Next.js App    │
│  (Frontend)     │
└──────┬──────────┘
       │
       │ 2. POST /api/mint with address
       ▼
┌─────────────────┐
│ X402 Middleware │ ◄── 3. Checks payment ($1.00 USDC)
└──────┬──────────┘
       │
       │ 4. Payment verified
       ▼
┌─────────────────┐
│  Mint API       │
│  Route Handler  │
└──────┬──────────┘
       │
       │ 5. Call smart contract
       ▼
┌─────────────────┐
│ MintableToken   │
│ Smart Contract  │ ──► 6. Mint 100 tokens to address
└─────────────────┘
```

## Quick Start

### 1. Clone and Install

```bash
cd x402-starter
npm install
```

### 2. Get Coinbase CDP Credentials

1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
2. Create an account or sign in
3. Create a new project
4. Generate API credentials:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
   - `CDP_WALLET_SECRET`

### 3. Deploy the Token Contract

You have several options to deploy the `MintableToken.sol` contract:

#### Option A: Using Remix IDE (Recommended for beginners)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file: `MintableToken.sol`
3. Copy the contract code from `src/contracts/MintableToken.sol`
4. Add this import remapping in Remix settings:
   ```
   @openzeppelin/=https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/
   ```
5. Compile with Solidity 0.8.20+
6. Connect MetaMask to **Base Sepolia** network
   - Network: Base Sepolia
   - RPC: https://sepolia.base.org
   - Chain ID: 84532
7. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
8. Deploy the contract using "Injected Provider - MetaMask"
9. Copy the deployed contract address

#### Option B: Using Foundry

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create a Foundry project
forge init token-deploy
cd token-deploy

# Copy the contract
cp ../src/contracts/MintableToken.sol src/

# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# Deploy to Base Sepolia
forge create --rpc-url https://sepolia.base.org \
  --private-key YOUR_PRIVATE_KEY \
  src/MintableToken.sol:MintableToken

# Save the deployed contract address
```

### 4. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Coinbase CDP Credentials
CDP_API_KEY_ID=your_api_key_id
CDP_API_KEY_SECRET=your_api_key_secret
CDP_WALLET_SECRET=your_wallet_secret

# Network (use base-sepolia for testing)
NETWORK=base-sepolia

# Token Contract Address (from step 3)
TOKEN_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000/mint](http://localhost:3000/mint) to see the minting interface.

### 6. Test the Minting

1. Get a test wallet address (from MetaMask or any Ethereum wallet)
2. Visit `/mint` page
3. Enter the recipient address
4. Click "Mint 100 Tokens"
5. The X402 payment flow will be initiated ($1.00 USDC)
6. After payment, 100 tokens will be minted to the address

**Note**: On testnet (base-sepolia), the app automatically requests USDC from the faucet when your balance is low.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Add X402 token minting platform"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
   - `CDP_WALLET_SECRET`
   - `TOKEN_CONTRACT_ADDRESS`
   - `NETWORK=base-sepolia`
4. Deploy

### 3. Going to Production (Mainnet)

When ready for production:

1. Deploy the token contract to **Base mainnet**
2. Update environment variables in Vercel:
   ```
   NETWORK=base
   TOKEN_CONTRACT_ADDRESS=0xYourMainnetContractAddress
   ```
3. Fund your seller account with USDC:
   - Check your seller address in [CDP Dashboard](https://portal.cdp.coinbase.com)
   - Send USDC to fund gas fees for minting

## File Structure

```
x402-starter/
├── src/
│   ├── app/
│   │   ├── mint/
│   │   │   └── page.tsx              # Minting UI page
│   │   └── api/
│   │       └── mint/
│   │           └── route.ts          # Minting API endpoint
│   ├── contracts/
│   │   └── MintableToken.sol         # ERC20 token contract
│   ├── lib/
│   │   ├── token.ts                  # Token minting logic
│   │   ├── accounts.ts               # CDP account management
│   │   └── env.ts                    # Environment config
│   └── middleware.ts                 # X402 payment middleware
├── scripts/
│   └── deploy-token.ts               # Deployment guide
├── .env.local                        # Environment variables
└── MINTING_SETUP.md                  # This file
```

## API Endpoints

### POST /api/mint

Mints 100 tokens to a specified address (protected by X402 payment).

**Request:**
```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully minted 100 tokens",
  "transactionHash": "0xabc...",
  "recipient": "0x1234...",
  "amount": "100",
  "explorerUrl": "https://sepolia.basescan.org/tx/0xabc..."
}
```

### GET /api/mint

Returns information about the minting endpoint.

## Smart Contract

The `MintableToken` contract is a simple ERC20 token with:

- **Name**: X402 Token
- **Symbol**: X402
- **Decimals**: 18
- **Mint Amount**: 100 tokens per call
- **Functions**:
  - `mint(address to)`: Owner-only mint function
  - `publicMint(address to)`: Public mint function (used by API)

## Troubleshooting

### "Token contract not configured" error

Make sure `TOKEN_CONTRACT_ADDRESS` is set in `.env.local`.

### Payment not working

1. Ensure your seller account has USDC on the network
2. Check that `NETWORK` is set correctly
3. On testnet, the app auto-requests funds from faucet

### Transaction fails

1. Verify the contract is deployed on the correct network
2. Check that the seller account has enough ETH for gas
3. View transaction on [BaseScan](https://sepolia.basescan.org)

## Resources

- [X402 Protocol](https://x402.org)
- [X402 Documentation](https://x402.gitbook.io/x402)
- [Coinbase CDP](https://docs.cdp.coinbase.com/)
- [Base Network](https://base.org)
- [Vercel Documentation](https://vercel.com/docs)

## License

MIT
