// Initialize PayPal Buttons
const paypalButtons = window.paypal.Buttons({
    style: {
        shape: "rect",
        layout: "vertical",
        color: "gold",
        label: "subscribe",
    },
    async createOrder() {
        try {
            // Validate price before sending to backend
            const price = "20.00";
            if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
                throw new Error("Invalid price");
            }

            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cart: [
                        {
                            id: "premium_subscription",
                            quantity: "1",
                            price: price
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create order");
            }

            const orderData = await response.json();

            if (orderData.id) {
                return orderData.id;
            }
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

            throw new Error(errorMessage);
        } catch (error) {
            console.error(error);
            resultMessage(`Could not initiate PayPal Checkout...<br><br>${error.message}`);
        }
    },
    async onApprove(data, actions) {
        try {
            if (!data.orderID || !data.payerID) {
                throw new Error("Missing order or payer information");
            }

            const response = await fetch(
                `http://localhost:5000/api/orders/${data.orderID}/capture`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        payerID: data.payerID
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to capture payment");
            }

            const orderData = await response.json();
            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
            } else if (errorDetail) {
                throw new Error(
                    `${errorDetail.description} (${orderData.debug_id})`
                );
            } else if (!orderData.purchase_units) {
                throw new Error(JSON.stringify(orderData));
            } else {
                const transaction =
                    orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                    orderData?.purchase_units?.[0]?.payments
                        ?.authorizations?.[0];
                resultMessage(
                    `✅ Subscription successful! Welcome to Marketing Genius Premium.<br>
                    <br>Your subscription ID: ${transaction.id}`
                );
                console.log(
                    "Capture result",
                    orderData,
                    JSON.stringify(orderData, null, 2)
                );
            }
        } catch (error) {
            console.error(error);
            resultMessage(
                `Sorry, your subscription could not be processed...<br><br>${error.message}`
            );
        }
    },
    onError: function(err) {
        console.error('❌ PayPal error:', err);
        resultMessage("There was an error processing your subscription. Please try again.");
    }
});

paypalButtons.render("#paypal-button-container");

// Function to show result messages to the user
function resultMessage(message) {
    const container = document.querySelector("#result-message");
    if (container) {
        // Sanitize message to prevent XSS
        const sanitizedMessage = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        container.innerHTML = sanitizedMessage;
    }
} 