import { getOrCreateSellerAccount } from "./src/lib/accounts.js";

console.log("\n=== Exporting Seller Wallet ===\n");

const sellerAccount = await getOrCreateSellerAccount();

console.log("Address:", sellerAccount.address);
console.log("\n📋 To import into MetaMask:");
console.log("1. Open MetaMask");
console.log("2. Click your account icon → Import Account");
console.log("3. Select 'Private Key'");
console.log("4. Paste the private key below:\n");

// The seller account from CDP doesn't directly expose the private key
// Let's try to get it from the wallet data
console.log("⚠️  Note: CDP-managed wallets may not expose private keys directly.");
console.log("Let me check the wallet data structure...\n");

// Print the seller account structure to see what we have access to
console.log("Seller account properties:");
console.log(Object.keys(sellerAccount));

// Try to access the private key if available
if (sellerAccount.privateKey) {
  console.log("\n🔑 Private Key:", sellerAccount.privateKey);
} else if (sellerAccount.key) {
  console.log("\n🔑 Private Key:", sellerAccount.key);
} else {
  console.log("\n⚠️  Private key not directly accessible from the account object.");
  console.log("CDP wallets use server-side signing. Check the wallet export method.");
}

console.log("\n📍 View on BaseScan:");
console.log(`https://basescan.org/address/${sellerAccount.address}`);
