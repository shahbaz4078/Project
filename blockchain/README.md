# Blockchain — Foundry Smart Contract Suite

This directory contains all Solidity smart contracts, tests, and deployment scripts for the Agri-Supply Chain platform, managed with [Foundry](https://book.getfoundry.sh/).

---

## 📁 Structure

```
blockchain/
├── src/                    # Solidity contracts
│   ├── MyContract.sol      # Example owner/message contract
│   └── ShipmentAudit.sol   # On-chain audit log for supply-chain milestones
├── test/                   # Foundry tests (.t.sol)
│   ├── MyContract.t.sol
│   └── ShipmentAudit.t.sol
├── script/                 # Deployment scripts (.s.sol)
│   ├── Deploy.s.sol
│   └── DeployShipmentAudit.s.sol
├── lib/                    # Dependencies installed via `forge install`
├── out/                    # Compiled artifacts (git-ignored)
├── foundry.toml            # Foundry configuration
├── .env.example            # Environment variable template
└── .gitignore
```

---

## ⚙️ Prerequisites

Install Foundry (includes `forge`, `cast`, `anvil`):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## 🚀 Quick Start

### 1. Clone & install dependencies

```bash
cd blockchain
forge install foundry-rs/forge-std   # installs forge-std into lib/
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY
```

On Linux/macOS load them:
```bash
source .env
```

On Windows (PowerShell):
```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^#][^=]*)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), 'Process')
  }
}
```

### 3. Compile

```bash
forge build
```

### 4. Run tests

```bash
forge test -vvv
```

Run a specific test file:
```bash
forge test --match-path test/ShipmentAudit.t.sol -vvv
```

---

## 🚢 Deployment

### Local fork (safe testing)

```bash
# Terminal 1 — start local node
anvil

# Terminal 2 — deploy
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
forge script script/DeployShipmentAudit.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Sepolia testnet

```bash
forge script script/DeployShipmentAudit.s.sol:DeployShipmentAudit \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Mainnet

```bash
forge script script/DeployShipmentAudit.s.sol:DeployShipmentAudit \
  --rpc-url $MAINNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

---

## 🛠 Useful Forge Commands

| Command | Description |
|---|---|
| `forge build` | Compile contracts |
| `forge test -vvv` | Run all tests with traces |
| `forge test --gas-report` | Show gas usage per function |
| `forge coverage` | Generate test coverage report |
| `forge fmt` | Auto-format Solidity files |
| `cast call <addr> "message()"` | Call a view function on a deployed contract |

---

## 📜 Contracts

### `ShipmentAudit.sol`
Emits an `AuditRecorded` event for every supply-chain milestone recorded by the backend. No state is written on-chain (gas-optimised); all history lives in event logs indexable via The Graph or a backend listener.

### `MyContract.sol`
Simple owner + message contract used as a reference template.
