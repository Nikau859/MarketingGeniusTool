import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalButton = () => {
    const [message, setMessage] = useState('');
    const payPalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!payPalClientId) {
        return <div className="text-red-500">Error: PayPal Client ID is not configured.</div>;
    }

    const initialOptions = {
        clientId: payPalClientId,
        currency: 'USD',
        intent: 'subscription',
        vault: true,
    };

    const createOrder = async () => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: [{ id: 'premium_subscription', quantity: '1', price: '20.00' }],
                }),
            });
            const orderData = await response.json();
            if (orderData.id) {
                return orderData.id;
            }
            throw new Error(orderData.error || 'Failed to create order');
        } catch (error) {
            console.error(error);
            setMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
            return '';
        }
    };

    const onApprove = async (data: any) => {
        try {
            const response = await fetch(`/api/orders/${data.orderID}/capture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payerID: data.payerID }),
            });
            const orderData = await response.json();
            if (response.ok) {
                 const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0];
                 setMessage(`✅ Subscription successful! Welcome to Marketing Genius Premium.<br><br>Your subscription ID: ${transaction.id}`);
            } else {
                throw new Error(orderData.error || 'Failed to capture payment');
            }
        } catch (error) {
            console.error(error);
            setMessage(`Sorry, your subscription could not be processed...<br><br>${error}`);
        }
    };
    
    const onError = (err: any) => {
        console.error('❌ PayPal error:', err);
        setMessage("There was an error processing your subscription. Please try again.");
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
                style={{
                    shape: 'rect',
                    layout: 'vertical',
                    color: 'gold',
                    label: 'subscribe',
                }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
            />
            {message && <div id="result-message" dangerouslySetInnerHTML={{ __html: message }} className="mt-4 text-center" />}
        </PayPalScriptProvider>
    );
};

export default PayPalButton; 