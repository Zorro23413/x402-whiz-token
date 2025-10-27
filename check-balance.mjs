import { createPublicClient, http, formatEther } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const address = "0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1";

const balance = await publicClient.getBalance({ address });
console.log(`\n=== Seller Account Balance ===`);
console.log(`Address: ${address}`);
console.log(`Balance: ${formatEther(balance)} ETH`);
console.log(`\nYou need at least 0.001 ETH (~$0.003) to mint tokens.`);

if (balance === 0n) {
  console.log(`\n❌ BALANCE IS ZERO - Please send ETH to this address!`);
  console.log(`\nSend at least 0.005 ETH to cover multiple minting transactions.`);
}
