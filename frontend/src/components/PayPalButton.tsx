import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

const PayPalButton = () => {
    const [message, setMessage] = useState('');
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    if (isPending) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isRejected) {
        return <div className="text-red-500 font-medium p-4 text-center">Error: Failed to load PayPal script.</div>;
    }

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
            setMessage(`Could not initiate PayPal Checkout... Please try again.`);
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
                 setMessage(`✅ Subscription successful! Welcome.<br>Your transaction ID: ${transaction.id}`);
            } else {
                throw new Error(orderData.error || 'Failed to capture payment');
            }
        } catch (error) {
            console.error(error);
            setMessage(`Sorry, your payment could not be processed... Please try again.`);
        }
    };
    
    const onError = (err: any) => {
        console.error('PayPal error:', err);
        setMessage("An error occurred with your subscription. Please try again.");
    };

    return (
        <div className="w-full">
            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                style={{
                    shape: 'rect',
                    layout: 'vertical',
                    color: 'gold',
                    label: 'subscribe',
                }}
            />
            {message && <div id="result-message" dangerouslySetInnerHTML={{ __html: message }} className="mt-4 text-center" />}
        </div>
    );
};

export default PayPalButton; 