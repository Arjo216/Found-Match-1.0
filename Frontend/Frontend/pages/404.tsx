/// pages/404.tsx
import React from "react";
import Link from "next/link";
import Layout from "../components/Layout"; // adjust if your Layout path differs

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-24 text-center">
        <h1 className="text-5xl font-extrabold mb-4">404</h1>
        <h2 className="text-2xl mb-6">Page not found</h2>
        <p className="text-gray-600 mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/" className="px-4 py-2 bg-gray-100 rounded shadow inline-block">
            Home
          </Link>

          <Link
            href="/projects"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow inline-block"
          >
            View Projects
          </Link>
        </div>
      </div>
    </Layout>
  );
}
