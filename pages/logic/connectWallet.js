export const connectWallet = async (setWalletAddress) => {
    if ("solana" in window) {
      const provider = window.solana;
  
      if (provider.isPhantom) {
        try {
          const resp = await provider.connect();
          console.log("Connected to wallet:", resp.publicKey.toString());
          setWalletAddress(resp.publicKey); // Update the state with the wallet's public key
        } catch (err) {
          console.error("Wallet connection failed:", err);
          throw new Error("Wallet connection failed. Please try again.");
        }
      } else {
        alert("Please install the Phantom Wallet extension to use this app!");
        throw new Error("Phantom Wallet not detected.");
      }
    } else {
      alert("Phantom Wallet not detected.");
      throw new Error("Phantom Wallet not detected.");
    }
  };
  