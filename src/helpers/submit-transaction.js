import { Wallet } from 'xrpl';

export default async function submitTransaction({ client, tx }) {
    try {
        // Check if the wallet credentials exist in localStorage
        const walletCredentials = localStorage.getItem('walletCredentials');

        if (!walletCredentials) {
            console.error('Wallet credentials not found in local storage.');
            return null;
        }

        // If credentials exist, create a Wallet instance from them
        const { publicKey, privateKey } = JSON.parse(walletCredentials);
        const wallet = new Wallet(publicKey, privateKey);

        tx.Account = wallet.address;

        // Sign and submit the transaction : https://xrpl.org/send-xrp.html#send-xrp
        const response = await client.submit(tx, { wallet });
        console.log(response);

        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
}
