import { useEffect } from 'react';

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalButton = () => {
  useEffect(() => {
    if (window.paypal) {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          layout: 'vertical',
          color: 'gold',
          label: 'subscribe',
        },
        async createOrder() {
          try {
            const price = '20.00';
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cart: [
                  {
                    id: 'premium_subscription',
                    quantity: '1',
                    price: price,
                  },
                ],
              }),
            });

            const orderData = await response.json();

            if (orderData.id) {
              return orderData.id;
            } else {
              const errorDetail = orderData?.details?.[0];
              const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);
              throw new Error(errorMessage);
            }
          } catch (error) {
            console.error(error);
            const resultMessage = document.getElementById('result-message');
            if (resultMessage) {
              resultMessage.innerHTML = `Could not initiate PayPal Checkout...<br><br>${error}`;
            }
          }
        },
        async onApprove(data: any) {
          try {
            const response = await fetch(`/api/orders/${data.orderID}/capture`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payerID: data.payerID,
              }),
            });

            const orderData = await response.json();
            const resultMessage = document.getElementById('result-message');

            if (response.ok) {
              const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0] || orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
              if (resultMessage) {
                resultMessage.innerHTML = `✅ Subscription successful! Welcome to Marketing Genius Premium.<br><br>Your subscription ID: ${transaction.id}`;
              }
            } else {
              const errorDetail = orderData?.details?.[0];
              if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                // Handle declined payment
                return window.paypal.Buttons().restart();
              } else {
                const errorMessage = errorDetail
                  ? `${errorDetail.description} (${orderData.debug_id})`
                  : JSON.stringify(orderData);
                throw new Error(errorMessage);
              }
            }
          } catch (error) {
            console.error(error);
            const resultMessage = document.getElementById('result-message');
            if (resultMessage) {
              resultMessage.innerHTML = `Sorry, your subscription could not be processed...<br><br>${error}`;
            }
          }
        },
        onError: function (err: any) {
          console.error('❌ PayPal error:', err);
          const resultMessage = document.getElementById('result-message');
          if (resultMessage) {
            resultMessage.textContent = 'There was an error processing your subscription. Please try again.';
          }
        },
      }).render('#paypal-button-container');
    }
  }, []);

  return null; 
};

export default PayPalButton; 