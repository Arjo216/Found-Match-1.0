// src/components/Subscription/CheckoutButton.tsx
import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type Props = {
  amount?: number; // in cents
  label?: string;
};

export default function CheckoutButton({ amount = 1000, label = "Pay" }: Props) {
  const handleClick = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe failed to load.");
        return;
      }

      // Call your server endpoint that creates a Checkout Session or PaymentIntent
      // The project already has API route files (e.g. stripe-create-payment-intent.ts).
      // Adjust the endpoint path if your API route has a different name.
      const resp = await fetch("/api/stripe-create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Server error: ${resp.status} ${text}`);
      }

      const data = await resp.json();

      // Backend can return either a sessionId (for redirectToCheckout)
      // or a clientSecret (for Elements confirmCardPayment flow).
      if (data.sessionId) {
        // if your backend creates a Checkout Session
        await (stripe as any).redirectToCheckout({ sessionId: data.sessionId });
      } else if (data.clientSecret) {
        // If backend returned a PaymentIntent clientSecret, you need Stripe Elements to confirm card payment.
        // Here we simply log it so developer can implement Elements-based flow.
        console.log("clientSecret:", data.clientSecret);
        alert("Client secret obtained. Implement Elements confirm flow to complete payment.");
      } else {
        console.error("Unexpected response from server:", data);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error (see console).");
    }
  };

  return (
    <button onClick={handleClick} className="btn">
      {label} — ${(amount / 100).toFixed(2)}
    </button>
  );
}
