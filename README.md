# XRPL Money Market

This project is a demonstration of constructing a money market within the constraints of the XRPL. It was designed for a hackathon, prioritizing functionality over security. Please note that the current security measures are insufficient for production deployment. Should this project advance or be considered for real-world application, stringent security practices will be implemented to mitigate all known risks.

## Simple XRPL Wallet

This is a lightweight XRP wallet built using Vite. It allows users to send XRP transactions and view their transaction history. The wallet interacts with the XRP Ledger (XRPL) using the `xrpl` JavaScript library.

### Features

- Send XRP transactions: Users can send XRP to other addresses. The interface for sending XRP is found in `src/send-xrp/send-xrp.html` and the logic is in `src/send-xrp/send-xrp.js`.

- View transaction history: Users can view their transaction history. The interface for viewing transaction history is found in `src/transaction-history/transaction-history.html` and the logic is in `src/transaction-history/transaction-history.js`.

- Wallet details: The wallet details are fetched from the XRPL and displayed in the main interface (`index.html`). The logic for fetching wallet details is in `src/helpers/get-wallet-details.js`.

### Setup and Development

1. Clone the repository.
2. Install the dependencies using `yarn install`.
3. Start the development server using `yarn dev`.

### Dependencies

- `dotenv`: Loads environment variables from a `.env` file.
- `xrpl`: A library to interact with the XRP Ledger.

### Development Dependencies

- `Vite`: A build tool optimized for frontend development.
- Various polyfills and browserify plugins for compatibility.

### Structure

- Main Frontend: `counter.js`, `index.css`, `index.html`, `index.js`, `main.js`
- Helpers: Functions to get wallet details, render the XRPL logo, and submit transactions.
- Send XRP: Interface and logic to send XRP.
- Transaction History: Interface and logic to view transaction history.
