"use client";

import React, { useEffect, useState } from "react";

export default function Home() {
  // ----------------------------------------------------------------------
  // 1) Metamask / Mock Wallet
  // ----------------------------------------------------------------------
  const [account, setAccount] = useState<string>("");

  const connectWallet = async () => {
    // In a real app, you'd do window.ethereum.request({...}).
    // Here we just mock a user address.
    const mockAddress = "0xMockUser123";
    setAccount(mockAddress);
    alert("Wallet connected (mock): " + mockAddress);
  };

  // ----------------------------------------------------------------------
  // 2) Create Token & Add to Metamask (Mock)
  // ----------------------------------------------------------------------
  const [createdToken, setCreatedToken] = useState("");
  const createToken = () => {
    // Pretend we deployed a new token
    const newTokenAddr = "0xNEW123";
    setCreatedToken(newTokenAddr);
    alert(`Mock token created: ${newTokenAddr}`);
  };

  const addTokenToMetamask = () => {
    if (!createdToken) return;
    alert(`Adding token ${createdToken} to Metamask (mock).`);
  };

  // ----------------------------------------------------------------------
  // 3) Analyze Risk via Mock AVS (OpenAI or fallback)
  // ----------------------------------------------------------------------
  const [tokenToAnalyze, setTokenToAnalyze] = useState("");
  const [classification, setClassification] = useState("");
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [avsError, setAvsError] = useState("");

  const analyzeTokenRisk = async () => {
    try {
      setAvsError("");
      setClassification("");
      setRiskScore(null);

      // Example payload for /classify
      const payload = {
        tokenAddress: tokenToAnalyze,
        functionSignature: "mint", // or removeLiquidity, etc.
      };

      const res = await fetch("http://localhost:3001/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setAvsError(json.error || "Error from AVS");
      } else {
        setClassification(json.classification);
        setRiskScore(json.riskScore);
      }
    } catch (err: any) {
      setAvsError(err.message);
    }
  };

  // ----------------------------------------------------------------------
  // 4) Fetch AVS Public Key from Mock Guardian
  // ----------------------------------------------------------------------
  const [guardianAddress, setGuardianAddress] = useState("0xGuardian");
  const [avsPubKey, setAvsPubKey] = useState("N/A");
  const fetchAvsKey = async () => {
    try {
      // For the demo, let's pretend we have an endpoint returning "0xMockAvsKey"
      const res = await fetch("http://localhost:3002/avspubkey");
      const json = await res.json();
      setAvsPubKey(json.avsPublicKey);
      alert("Fetched AVS Public Key: " + json.avsPublicKey);
    } catch (err) {
      alert("Failed to fetch AVS key from mock guardian");
    }
  };

  // ----------------------------------------------------------------------
  // 5) Rug the Coin -> triggers /rug on mock mempool
  // ----------------------------------------------------------------------
  const rugCoin = async () => {
    if (!createdToken) {
      alert("No token to rug. Create one first!");
      return;
    }
    const payload = { token: createdToken };
    const res = await fetch("http://localhost:4001/rug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    alert(`Rug attempt: ${json.status}`);
  };

  // ----------------------------------------------------------------------
  // 6) Connect to Mock Mempool WebSocket for logs
  // ----------------------------------------------------------------------
  const [mempoolLogs, setMempoolLogs] = useState<string[]>([]);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("Connected to mock mempool WS");
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        const txt = `${data.event} => txHash=${data.txHash}, from=${data.txFrom}, token=${
          data.token || ""
        }`;
        setMempoolLogs((prev) => [...prev, txt]);
      } catch (e) {
        console.error("WS parse error", e);
      }
    };
    ws.onerror = (err) => console.error("WS error", err);
    ws.onclose = () => console.log("WS closed");
    return () => ws.close();
  }, []);

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div style={styles.container}>
      <h1>WatchDog Demo (Full Mock)</h1>

      {/* Two columns */}
      <div style={styles.columns}>
        {/* Left: AVS + Mempool logs */}
        <div style={styles.column}>
          <h2>AVS Risk Analysis</h2>
          <div style={{ marginBottom: 10 }}>
            <label>Token to Analyze:</label>
            <input
              style={styles.input}
              value={tokenToAnalyze}
              onChange={(e) => setTokenToAnalyze(e.target.value)}
              placeholder="0xNEW123..."
            />
            <button onClick={analyzeTokenRisk} style={styles.btn}>Analyze</button>
          </div>
          {avsError && <p style={{ color: "red" }}>Error: {avsError}</p>}
          {classification && riskScore !== null && (
            <div>
              <p>Classification: <b>{classification}</b></p>
              <p>Risk Score: <b>{riskScore}%</b></p>
            </div>
          )}

          <hr style={styles.hr} />
          <h3>Mempool Logs (Mock)</h3>
          {mempoolLogs.length === 0 && <p>No logs yet.</p>}
          <ul>
            {mempoolLogs.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        </div>

        {/* Right: user actions */}
        <div style={styles.column}>
          <h2>User Actions</h2>

          {!account ? (
            <button onClick={connectWallet} style={styles.btn}>Connect Wallet</button>
          ) : (
            <p>Wallet Connected: <b>{account}</b></p>
          )}

          <hr style={styles.hr} />

          <h3>Create Token</h3>
          <button onClick={createToken} style={styles.btn}>Create Token</button>
          {createdToken && (
            <div style={{ marginTop: 5 }}>
              <p>New Token: <b>{createdToken}</b></p>
              <button onClick={addTokenToMetamask} style={styles.btn}>
                Add to Metamask
              </button>
            </div>
          )}

          <hr style={styles.hr} />

          <h3>Guardian Info</h3>
          <p>Guardian Address:</p>
          <input
            style={styles.input}
            value={guardianAddress}
            onChange={(e) => setGuardianAddress(e.target.value)}
          />
          <button onClick={fetchAvsKey} style={styles.btn}>Fetch AVS Key</button>
          <p>AVS Public Key: <b>{avsPubKey}</b></p>

          <hr style={styles.hr} />

          <h3>Rug the Token</h3>
          <button onClick={rugCoin} style={styles.btn} disabled={!createdToken}>
            Remove Liquidity (Rug)
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  columns: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    marginTop: 20,
  },
  column: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: 4,
    padding: 10,
  },
  btn: {
    marginLeft: 10,
    padding: "6px 12px",
    backgroundColor: "#2196f3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  input: {
    marginLeft: 6,
    padding: "4px",
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  hr: {
    margin: "12px 0",
  },
};
