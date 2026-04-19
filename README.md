# Fractional Server Hosting Pool

A full-stack decentralized application that allows users to pool resources to fractionally host servers. This project combines a modern web frontend, a robust backend API, and a Stellar (Soroban) smart contract to handle the underlying decentralized logic.

## Project Structure

This monorepo is divided into three main components:

- **`frontend/`**: The web application built using Vite. Contains the user interface where users can interact with the server hosting pool.
- **`backend/`**: The Node.js application that provides the API, manages off-chain data (via models/routes), and acts as an intermediary.
- **`smart-contract/`**: The Rust-based Soroban smart contract meant to be deployed on the Stellar network, handling the decentralized fraction/pool logic safely on-chain.

## Prerequisites

Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16+ recommended for backend and frontend)
- [npm](https://www.npmjs.com/) (comes with Node)
- [Rust](https://www.rust-lang.org/tools/install) (for the smart contract)
- `soroban-cli` (installed via `cargo install --locked soroban-cli`)

## Getting Started

### 1. Install Dependencies

To install all dependencies across the root, frontend, and backend simultaneously, run from the root directory:

```bash
npm run install:all
```

Alternatively, you can install them individually:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Configuration

If the `backend/` directory requires an environment variables file, ensure you have set up a `.env` file there according to the project's requirements (e.g., database URIs, port configurations, and secret keys).

### 3. Running the Development Servers

You can launch both the frontend (Vite) and backend (Node.js) concurrently by running the following command from the root folder:

```bash
npm run dev
```

This script utilizes `concurrently` to boot both services in parallel. 
- You can access the backend API (typically `http://localhost:5000` or the port specified in `.env`).
- You can access the frontend (typically `http://localhost:5173` or as provided by Vite).

### 4. Compiling the Smart Contract

To build the Stellar smart contract for deployment, navigate to the `smart-contract` directory and use the `cargo` build pipeline targeting WebAssembly:

```bash
cd smart-contract
cargo build --target wasm32-unknown-unknown --release
```

Refer to the internal [`smart-contract/README.md`](./smart-contract/README.md) for more details on deploying and invoking the contract.

## Architecture Highlights
- **Vite Setup**: Fast and lean frontend tooling.
- **Express / Node.js**: Modular backend setup supporting designated routes, middleware, and data models.
- **Stellar & Soroban**: Next-gen smart contracts interacting via Wasm logic.
- **Monorepo Scripts**: Centralized `package.json` for managing installation and execution concurrently.

## License

ISC License (see `package.json` for more details).
