"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isAddress, createWalletClient, custom, publicActions } from "viem";
import { base } from "viem/chains";
import { wrapFetchWithPayment } from "x402-fetch";

export default function MintPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Check if wallet is connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          setAddress(accounts[0]); // Auto-fill recipient address
        }
      } catch (err) {
        console.error("Failed to check wallet connection:", err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask or another Web3 wallet");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Switch to Base network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }], // Base Mainnet = 8453 = 0x2105
        });
      } catch (switchError: any) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        }
      }

      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      setAddress(accounts[0]); // Auto-fill recipient address
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  };

  const handleMint = async () => {
    setError(null);
    setResult(null);

    // Check wallet connection
    if (!walletConnected) {
      setError("Please connect your wallet first");
      return;
    }

    // Validate address
    if (!address || !isAddress(address)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);

    try {
      // Get the connected account
      const [account] = await window.ethereum!.request({
        method: "eth_accounts",
      });

      // Create wallet client with public actions for X402
      const walletClient = createWalletClient({
        account,
        chain: base,
        transport: custom(window.ethereum!),
      }).extend(publicActions);

      // Create x402-enabled fetch with wallet client
      const x402fetch = wrapFetchWithPayment(fetch, walletClient);

      // Use x402fetch to handle payment flow automatically
      const response = await x402fetch("/api/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mint tokens");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Whiz402 Token Minting
            </h1>
            <p className="text-gray-300">
              Mint 100 Whiz402 tokens using the X402 payment protocol
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full">
              <span className="text-sm text-purple-200">Price:</span>
              <span className="text-lg font-bold text-white">$0.10 USDC</span>
            </div>
          </div>

          {/* Wallet Connection */}
          {!walletConnected ? (
            <div className="mb-6">
              <Button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-200"
              >
                Connect Wallet to Continue
              </Button>
              <p className="text-center text-sm text-gray-400 mt-2">
                Connect your wallet to mint tokens
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 text-sm">
                ✓ Wallet Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          )}

          {/* Mint Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Recipient Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading || !walletConnected}
              />
            </div>

            <Button
              onClick={handleMint}
              disabled={loading || !address || !walletConnected}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Minting..." : "Mint 100 Tokens"}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="mt-6 p-6 bg-green-500/20 border border-green-500/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-green-200">
                  Tokens Minted Successfully!
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium">
                    {result.amount} Whiz402 Tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-mono text-xs">
                    {result.recipient.slice(0, 6)}...{result.recipient.slice(-4)}
                  </span>
                </div>
                {result.transactionHash && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Transaction:</span>
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline text-xs font-mono"
                    >
                      {result.transactionHash.slice(0, 6)}...
                      {result.transactionHash.slice(-4)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">
              How it works:
            </h3>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Enter the Ethereum address to receive tokens</li>
              <li>Click "Mint 100 Tokens" to initiate payment</li>
              <li>Pay $0.10 USDC via X402 protocol</li>
              <li>Receive 100 Whiz402 tokens instantly</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Powered by{" "}
            <a
              href="https://x402.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              X402 Protocol
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
