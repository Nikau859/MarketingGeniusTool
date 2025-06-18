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
    script.src = `https://www.paypal.com/sdk/js?client-id=AW5zLjkJKy_wPUgftgBk-XC2oU6NWCTcnq5yv88l0FkZoD6rZfW12kLFJizny1Ex-E-d3EZPwRbDJVFO&buyer-country=US&currency=USD&components=buttons&enable-funding=venmo,paylater,card&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: "P-2N006366A368920S8NBE64JY", // Your plan ID
            });
          },
          onApprove: async function (data: any) {
            const resultMessage = document.getElementById("result-message");
            if (resultMessage) {
              resultMessage.textContent = "✅ Subscription successful! ID: " + data.subscriptionID;
            }
            
            // Notify your backend
            try {
              await fetch(`${import.meta.env.VITE_API_URL}/api/paypal/subscription-success`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscriptionID: data.subscriptionID,
                  payerID: data.payerID,
                }),
              });
            } catch (err) {
              console.error("❌ Backend error:", err);
              if (resultMessage) {
                resultMessage.textContent = "There was an error processing your subscription on our server.";
              }
            }
          },
          onError: function (err: any) {
            console.error("❌ PayPal error:", err);
            const resultMessage = document.getElementById("result-message");
            if (resultMessage) {
              resultMessage.textContent = "There was an error processing your subscription.";
            }
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

  return (
    <>
      <div id="paypal-button-container" />
      <p id="result-message" className="mt-4 text-center"></p>
    </>
  );
};

export default PayPalSubscriptionButton; 