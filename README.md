# Stable Coin DeFi Application

Full-stack decentralized finance (DeFi) application for a stablecoin

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Smart Contracts](#smart-contracts)
  - [Key Concepts](#key-concepts)
  - [Testing](#testing)
- [Frontend Application](#frontend-application)
  - [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction

This project is a full-stack decentralized finance (DeFi) application for a stablecoin. It features a robust smart contract backend built with Foundry for a decentralized stablecoin (DSC) and a modern Next.js frontend for user interaction. The stablecoin aims for relative stability, pegged to $1.00, and uses an algorithmic, decentralized mechanism for minting, backed by exogenous collateral like wETH and wBTC.

## Features

- **Decentralized Stablecoin (DSC):** An algorithmic stablecoin pegged to $1.00.
- **Collateral-backed Minting:** Users can mint DSC by depositing approved collateral (e.g., wETH, wBTC).
- **Health Factor Calculation:** Monitors the health of user positions to prevent under-collateralization.
- **Liquidation Mechanism:** Allows for the liquidation of unhealthy positions to maintain solvency.
- **Price Feeds:** Integrates Chainlink price feeds for accurate collateral valuation.
- **User Interface:** A responsive and intuitive web interface built with Next.js and Shadcn UI components for managing positions, minting/burning DSC, and viewing transaction history.

## Technologies Used

**Frontend:**

- **Next.js 15:** React framework for building server-rendered and static web applications.
- **React 19:** JavaScript library for building user interfaces.
- **TypeScript:** Superset of JavaScript that adds static typing.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Shadcn UI:** Reusable UI components built with Radix UI and Tailwind CSS.
- **Ethers.js:** A complete Ethereum wallet implementation and utilities for interacting with smart contracts.
- **Zod & React Hook Form:** For form validation and management.

**Foundry (Smart Contracts):**

- **Solidity:** Programming language for writing smart contracts.
- **Foundry:** A blazing fast, portable and modular toolkit for Ethereum application development.
  - **Forge:** For smart contract testing and deployment.
  - **Anvil:** For a local Ethereum development blockchain.
- **OpenZeppelin Contracts:** Secure and community-vetted smart contract implementations.
- **Chainlink:** Decentralized oracle networks for price feeds.

## Project Structure

The project is organized into two main parts: the frontend application and the smart contract backend.

```
.
├── app/                  # Next.js application pages and global styles
├── components/           # React components, including UI (Shadcn) and custom forms
├── foundry-defi-stablecoin/ # Foundry project for smart contracts
│   ├── lib/              # Foundry dependencies (OpenZeppelin, Chainlink)
│   ├── script/           # Deployment scripts for smart contracts
│   ├── src/              # Core Solidity smart contracts (DecentralizedStableCoin, DSCEngine)
│   └── test/             # Foundry tests for smart contracts
├── hooks/                # Custom React hooks
├── lib/                  # Frontend utility functions, contract services, types
├── public/               # Static assets for the Next.js app
├── styles/               # Global CSS styles
├── .gitignore            # Git ignore file
├── package.json          # Frontend dependencies and scripts
├── pnpm-lock.yaml        # PNPM lock file
├── next.config.mjs       # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) & **npm** or **pnpm** (recommended)
- **Foundry:** Follow the installation guide [here](https://book.getfoundry.sh/getting-started/installation).

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/victormosquera/stable-coin.git
    cd stable-coin
    ```

2. **Install frontend dependencies:**

    ```bash
    pnpm install
    # or npm install
    ```

3. **Install Foundry dependencies (for smart contracts):**
    Navigate into the `foundry-defi-stablecoin` directory and run `forge update`.

    ```bash
    cd foundry-defi-stablecoin
    forge update
    cd .. # Go back to the root directory
    ```

### Running the Application

To run the full application, you need to start both the local blockchain (Anvil) and the Next.js frontend.

1. **Start a local blockchain with Anvil:**
    Open a new terminal and run:

    ```bash
    anvil
    ```

    Keep this terminal open as Anvil needs to keep running.

2. **Deploy Smart Contracts:**
    In another terminal, navigate to the `foundry-defi-stablecoin` directory and deploy the contracts. You might need to adjust the deployment script (`script/DeployDSC.s.sol`) based on your Anvil setup or specific network.

    ```bash
    cd foundry-defi-stablecoin
    forge script script/DeployDSC.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key <YOUR_ANVIL_PRIVATE_KEY>
    cd .. # Go back to the root directory
    ```

    Replace `<YOUR_ANVIL_PRIVATE_KEY>` with a private key from your Anvil output (e.g., `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).

3. **Start the Frontend Application:**
    In a third terminal, from the root directory of the project:

    ```bash
    pnpm dev
    # or npm run dev
    ```

    The frontend application will be accessible at `http://localhost:3000`.

## Smart Contracts

The smart contracts are located in the `foundry-defi-stablecoin/src` directory.

### Key Concepts

- `DecentralizedStableCoin.sol`: The ERC20 token contract for the DSC.
- `DSCEngine.sol`: The core logic contract that handles collateral management, DSC minting/burning, health factor calculation, and liquidations.

### Testing

Smart contract tests are written using Foundry's Forge.
To run all tests:

```bash
cd foundry-defi-stablecoin
forge test
```

To run specific tests or fuzz tests, refer to the Foundry documentation.

## Frontend Application

The frontend is a Next.js application that provides a user interface for interacting with the deployed smart contracts.

### Available Scripts

In the root directory of the project, you can run:

- `pnpm dev`: Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Runs ESLint to check for code quality issues.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

For any inquiries, please contact [Victor Mosquera](mailto:viktor1103@gmail.com).
