import { useEffect } from "react";

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalSubscriptionButton = () => {
  useEffect(() => {
    // Remove any existing PayPal script
    const existingScript = document.getElementById("paypal-sdk");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: process.env.REACT_APP_PAYPAL_PLAN_ID,
            });
          },
          onApprove: async function (data: any) {
            alert("✅ Subscription successful! ID: " + data.subscriptionID);
            // Notify your backend
            try {
              await fetch(`${process.env.REACT_APP_API_URL}/api/paypal/subscription-success`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscriptionID: data.subscriptionID,
                  payerID: data.payerID,
                }),
              });
            } catch (err) {
              console.error("❌ Backend error:", err);
              alert("There was an error processing your subscription on our server.");
            }
          },
          onError: function (err: any) {
            console.error("❌ PayPal error:", err);
            alert("There was an error processing your subscription.");
          },
        }).render("#paypal-button-container");
      }
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      script.remove();
      const container = document.getElementById("paypal-button-container");
      if (container) container.innerHTML = "";
    };
  }, []);

  return <div id="paypal-button-container" />;
};

export default PayPalSubscriptionButton; 