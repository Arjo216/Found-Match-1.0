// pages/subscription.tsx (or pages/whatever)
import React from "react";

type CheckoutButtonProps = {
  amount: number;
  label: string;
};

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ amount, label }) => {
    const handleCheckout = () => {
        console.log(`Checkout: ${amount}`);
        // Add your checkout logic here
    };

    return <button onClick={handleCheckout}>{label}</button>;
};

export default function SubscriptionPage() {
  return (
    <main>
      <h1>Subscription</h1>
      <CheckoutButton amount={5000} label="Subscribe" />
    </main>
  );
}
