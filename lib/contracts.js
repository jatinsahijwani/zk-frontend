import Web3 from "web3";

// RPC URL for browser environment
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";

// Contract address and ABI
const CONTRACT_ADDRESS = "0x784356c3c1a096625c5869e7a56a5cd3738c9b46";

const ABI = [
  {
    "inputs": [
      { "internalType": "uint256[2]", "name": "_pA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "_pB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "_pC", "type": "uint256[2]" },
      { "internalType": "uint256[1]", "name": "_pubSignals", "type": "uint256[1]" }
    ],
    "name": "verifyProof",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

let web3;
let contract;

// ✅ Call this once from a useEffect in your component
export async function initWeb3() {
  if (typeof window !== "undefined") {
    web3 = new Web3(RPC_URL);
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    console.log("Web3 initialized");
  } else {
    console.error("Web3 not supported in this environment");
  }
}

export async function verifyProof({ a, b, c, input }) {
  if (!contract) {
    throw new Error("Contract not initialized. Call initWeb3() first.");
  }
  try {
    const result = await contract.methods.verifyProof(a, b, c, input).call();
    return result;
  } catch (err) {
    console.error("verifyProof error:", err);
    throw err;
  }
}
