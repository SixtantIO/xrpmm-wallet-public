import { Client, Wallet, classicAddressToXAddress } from 'xrpl';
import wallet_mm_data from '../assets/wallet_mm.json';

let wallet_mm;
wallet_mm = new Wallet(wallet_mm_data.public_key, wallet_mm_data.private_key);

export default async function getWalletDetails({ client }) {
    try {
        let wallet;

        // Check if the wallet credentials exist in localStorage
        const walletCredentials = localStorage.getItem('walletCredentials');
     
        // Get the loading message element
        const loadingMessageElement = document.getElementById('loading_wallet_details');

        
        if (walletCredentials) {
            // If credentials exist, create a Wallet instance from them
            const { publicKey, privateKey } = JSON.parse(walletCredentials);
            wallet = new Wallet(publicKey, privateKey);
            // Update the loading message for existing wallet
            if (loadingMessageElement) {
                loadingMessageElement.textContent = 'Loading Wallet...';
            }
        } else {
            // If credentials do not exist, create and fund a wallet
            if (loadingMessageElement) {
                loadingMessageElement.textContent = 'Setting up Testnet Wallet. This may take up to a minute.';
            }
            const fund_result = await client.fundWallet();
            wallet = fund_result.wallet;
            console.log(fund_result);

           
        // Set s and send assets for USD, EUR, and MXN
        const currencies = ['USD', 'EUR', 'MXN', 'TST'];
        for (const currency of currencies) {
            // Set trustline
            await setTrustline(client, wallet, currency);
            // Send asset
            // await sendAsset(client, wallet, currency);
        }

        // Store the wallet credentials in localStorage
        localStorage.setItem('walletCredentials', JSON.stringify({
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey
        }));
        }

        // Get the wallet details: https://xrpl.org/account_info.html
        const {
            result: { account_data },
        } = await client.request({
            command: 'account_info',
            account: wallet.address,
            ledger_index: 'validated',
        });

        const ownerCount = account_data.OwnerCount || 0;

        // Get the reserve base and increment
        const {
            result: {
                info: {
                    validated_ledger: { reserve_base_xrp, reserve_inc_xrp },
                },
            },
        } = await client.request({
            command: 'server_info',
        });

        // Calculate the reserves by multiplying the owner count by the increment and adding the base reserve to it.
        const accountReserves = ownerCount * reserve_inc_xrp + reserve_base_xrp;

        console.log('Got wallet details!');

        return { 
            account_data, 
            accountReserves, 
            xAddress: classicAddressToXAddress(wallet.address, false, false), // Learn more: https://xrpaddress.info/
            address: wallet.address 
        };
    } catch (error) {
        console.log('Error getting wallet details', error);
        return error;
    }
}
async function setTrustline(client, wallet, currency) {
    const trustSetTx = {
      TransactionType: 'TrustSet',
      Account: wallet_mm.address,
      LimitAmount: {
        currency,
        issuer: wallet.address,
        value: '1000000', // Matching the original value
      },
    };
  
    const preparedTrustSetTx = await client.autofill(trustSetTx);
    const signedTrustSetTx = wallet_mm.sign(preparedTrustSetTx);
    const result = await client.submitAndWait(signedTrustSetTx.tx_blob);
    return result;
  }
  
  async function sendAsset(client, wallet, currency) {
    console.log(wallet_mm)
    const paymentTx = {
      TransactionType: 'Payment',
      Account: wallet.address,
      Destination: wallet_mm.address,
      Amount: {
        currency,
        issuer: wallet.address,
        value: '100000', // Matching the original value
      },
    };
  
    const preparedPaymentTx = await client.autofill(paymentTx);
    const signedPaymentTx = wallet.sign(preparedPaymentTx);
    const result = await client.submitAndWait(signedPaymentTx.tx_blob);
    return result;
  }
  
  
