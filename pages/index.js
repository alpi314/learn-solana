"use client";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { connectWallet } from "./logic/connectWallet";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Establish a connection to the Solana devnet
    const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
    setConnection(conn);

    const checkIfWalletIsConnected = async () => {
      if ("solana" in window && window.solana.isPhantom) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true });
          console.log("Connected with Public Key:", resp.publicKey.toString());
          setWalletAddress(resp.publicKey);
        } catch (err) {
          console.error("Failed to auto-connect to wallet:", err);
        }
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const handleConnectWallet = async () => {
    try {
      await connectWallet(setWalletAddress);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>Solana Devnet DApp</h1>
      {walletAddress ? (
        <div>
          <p>Connected wallet: {walletAddress.toString()}</p>
        </div>
      ) : (
        <button onClick={handleConnectWallet}>Connect to Phantom Wallet</button>
      )}
    </div>
  );
}
