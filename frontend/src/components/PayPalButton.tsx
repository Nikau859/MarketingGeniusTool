import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

// This component is a wrapper for the PayPalButtons to access the script loading state
const ButtonWrapper = ({ createOrder, onApprove, onError, setMessage } : { createOrder: () => Promise<string>, onApprove: (data: any) => Promise<void>, onError: (err: any) => void, setMessage: (message: string) => void }) => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    if (isPending) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isRejected) {
        setMessage("Error: Failed to load PayPal script. Please check your internet connection or try again later.");
        return null;
    }

    return (
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
    );
};

const PayPalButton = () => {
    const [message, setMessage] = useState('');
    const payPalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!payPalClientId) {
        return <div className="text-red-500 font-medium p-4 text-center">Error: PayPal Client ID is not configured.</div>;
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
            throw error;
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
        <div className="w-full">
            <PayPalScriptProvider options={initialOptions}>
                <ButtonWrapper 
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    setMessage={setMessage}
                />
            </PayPalScriptProvider>
            {message && <div id="result-message" dangerouslySetInnerHTML={{ __html: message }} className="mt-4 text-center" />}
        </div>
    );
};

export default PayPalButton; 