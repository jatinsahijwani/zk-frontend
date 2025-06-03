"use client";
import React, { useState, useEffect } from "react";
import { initWeb3, verifyProof } from "@/lib/contracts";
import { groth16 } from "snarkjs";

export default function Home() {
  const [inputA, setInputA] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initWeb3().catch(console.error);
  }, []);

  const handleVerify = async () => {
    try {
      setError("");
      setResult("");
      setLoading(true);

      if (!inputA) {
        setError("Please enter a value for 'a'");
        setLoading(false);
        return;
      }

      // Prepare input for the circuit
      const input = { a: inputA.toString() };

      // Generate proof and public signals using snarkjs in browser
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        "/hello_js/hello.wasm",
        "/hello_js/hello_final.zkey"
      );

      // Format proof and public signals for Solidity contract call
      const callData = await groth16.exportSolidityCallData(proof, publicSignals);

      const argv = callData
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x) => BigInt(x).toString());

      const a = [argv[0], argv[1]];
      const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
      ];
      const c = [argv[6], argv[7]];
      const inputArr = [argv[8]];

      // Verify proof on-chain
      const isValid = await verifyProof({ a, b, c, input: inputArr });
      setResult(isValid ? "✅ Proof Verified" : "❌ Invalid Proof");
    } catch (e) {
      console.error(e);
      setError("Error verifying proof. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>ZK Proof Verifier (Next.js + web3.js + snarkjs)</h1>
      <input
        type="number"
        placeholder="Enter value of a"
        value={inputA}
        onChange={(e) => setInputA(e.target.value)}
        style={{ padding: "8px", marginRight: "10px", width: "150px" }}
      />
      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "red",
          color: "white",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Verifying..." : "Verify Proof"}
      </button>
      {result && <p>{result}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
