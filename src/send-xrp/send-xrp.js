import { Client, Wallet, dropsToXrp, isValidClassicAddress, xrpToDrops } from 'xrpl';
import getWalletDetails from '../helpers/get-wallet-details';
import renderXrplLogo from '../helpers/render-xrpl-logo';
import submitTransaction from '../helpers/submit-transaction';

// Optional: Render the XRPL logo
renderXrplLogo();

const CLIENT = "wss://s.altnet.rippletest.net:51233/";

const client = new Client(CLIENT); 

let wallet;

// Self-invoking function to connect to the client
(async () => {
    try {
        await client.connect(); // Connect to the client

        // Check if the wallet credentials exist in localStorage
        const walletCredentials = localStorage.getItem('walletCredentials');

        if (!walletCredentials) {
            console.error('Wallet credentials not found in local storage.');
            return;
        }

        // If credentials exist, create a Wallet instance from them
        const { publicKey, privateKey } = JSON.parse(walletCredentials);
        wallet = new Wallet(publicKey, privateKey);

        // Subscribe to account transaction stream
        await client.request({
            command: 'subscribe',
            accounts: [wallet.address],
        });

        // Fetch the wallet details and show the available balance
        await getWalletDetails({ client }).then((walletDetails) => {
            if (walletDetails) {
              const { accountReserves, account_data } = walletDetails;
              availableBalanceElement.textContent = `Available Balance: ${dropsToXrp(account_data.Balance) - accountReserves} XRP`;
            } else {
              console.error('Failed to fetch wallet details.');
            }
          });
          

    } catch (error) {
        await client.disconnect();
        console.log(error);
    }
})();

// Get the elements from the DOM
const homeButton = document.querySelector('#home_button');
const txHistoryButton = document.querySelector('#transaction_history_button');
const destinationAddress = document.querySelector('#destination_address');
const amount = document.querySelector('#amount');
const destinationTag = document.querySelector('#destination_tag');
const submitTxBtn = document.querySelector('#submit_tx_button');
const availableBalanceElement = document.querySelector('#available_balance');

// Disable the submit button by default
submitTxBtn.disabled = false;
let isValidDestinationAddress = false;
const allInputs = document.querySelectorAll('#destination_address, #amount');

// Add event listener to the redirect buttons
homeButton.addEventListener('click', () => {
    window.location.pathname = '/wallet/index.html';
});

txHistoryButton.addEventListener('click', () => {
    window.location.pathname = '/wallet/src/transaction-history/transaction-history.html';
});

// Update the account balance on successful transaction
client.on('transaction', (response) => {
    if (response.validated && response.transaction.TransactionType === 'Payment') {
        getWalletDetails({ client }).then(({ accountReserves, account_data }) => {
            availableBalanceElement.textContent = `Available Balance: ${dropsToXrp(account_data.Balance) - accountReserves} XRP`;
        });
    }
});

const validateAddress = () => {
    destinationAddress.value = destinationAddress.value.trim();
    // Check if the address is valid
    if (isValidClassicAddress(destinationAddress.value)) {
        // Remove the invalid class if the address is valid
        destinationAddress.classList.remove('invalid');
        isValidDestinationAddress = true;
    } else {
        // Add the invalid class if the address is invalid
        isValidDestinationAddress = false;
        destinationAddress.classList.add('invalid');
    }
};

// Add event listener to the destination address
destinationAddress.addEventListener('input', validateAddress);
validateAddress(); // Validate the pre-filled destination address

// Add event listener to the amount input
amount.addEventListener('keydown', (event) => {
    const codes = [8, 190];
    const regex = /^[0-9\b.]+$/;

    // Allow: backspace, delete, tab, escape, enter and .
    if (!(regex.test(event.key) || codes.includes(event.keyCode))) {
        event.preventDefault();
        return false;
    }

    return true;
});

// NOTE: Keep this code at the bottom of the other input event listeners
// All the inputs should have a value to enable the submit button
for (let i = 0; i < allInputs.length; i++) {
    allInputs[i].addEventListener('input', () => {
        let values = [];
        allInputs.forEach((v) => values.push(v.value));
        submitTxBtn.disabled = !isValidDestinationAddress || values.includes('');
    });
}

// Add event listener to the submit button
submitTxBtn.addEventListener('click', async () => {
    try {
        console.log('Submitting transaction');
        submitTxBtn.disabled = true;
        submitTxBtn.textContent = 'Submitting...';
        console.log(destinationTag)

        // Retrieve the selected currency from the dropdown
        const selectedCurrency = document.querySelector('#currency').value;

        // Determine whether to use the existing logic for XRP or the sendAsset function for other currencies
        if (selectedCurrency === 'XRP') {
            // Existing logic for sending XRP
            const txJson = {
                TransactionType: 'Payment',
                Account: wallet.address,
                Amount: xrpToDrops(amount.value), // Convert XRP to drops
                Destination: destinationAddress.value,
            };

            // Get the destination tag if it exists
            if (destinationTag?.value !== '') {
                txJson.DestinationTag = parseInt(destinationTag.value, 10);
            }
            

            // Submit the transaction to the ledger
            const { result } = await submitTransaction({ client, tx: txJson });
            const txResult = result?.meta?.TransactionResult || result?.engine_result || ''; // Response format: https://xrpl.org/transaction-results.html
    
            // Check if the transaction was successful or not and show the appropriate message to the user
            if (txResult === 'tesSUCCESS') {
                alert('Transaction submitted successfully!');
            } else {
                throw new Error(txResult);
            }
        } else {
            // Logic for sending other assets using the sendAsset function
            await sendAsset(client, wallet, destinationAddress.value, selectedCurrency, amount.value);
            // TODO: Handle the response from sendAsset function and show appropriate messages to the user
        }
    } catch (error) {
        alert('Error submitting transaction, Please try again.');
        console.error(error);
    } finally {
        // Re-enable the submit button after the transaction is submitted so the user can submit another transaction
        submitTxBtn.disabled = false;
        submitTxBtn.textContent = 'Submit Transaction';
    }
});

async function sendAsset(client, fromWallet, toWallet, currency, toamount) {
    const paymentTx = {
        TransactionType: 'Payment',
        Account: fromWallet.address,
        Destination: toWallet,
        Amount: {
            currency,
            issuer: fromWallet.address,
            value: toamount,
        },
    };

    // Submit the payment transaction using your existing submitTransaction helper function
    const { result } = await submitTransaction({ client, tx: paymentTx });

    // Extract the transaction result
    const txResult = result?.meta?.TransactionResult || result?.engine_result || '';

    // Handle the transaction result
    if (txResult === 'tesSUCCESS') {
        alert(`Transaction submitted successfully for ${currency}!`);
    } else {
        // Handle errors (you can customize this part based on your application's needs)
        alert(`Error submitting transaction for ${currency}: ${txResult}`);
        throw new Error(txResult);
    }
}
