import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { api } from "../../lib/api";

export default function ChatList() {
  const [convos, setConvos] = useState<any[]>([]);

  useEffect(() => {
    api.get("/chat/conversations").then((r)=> setConvos(r.data || [])).catch(()=> {
      setConvos([
        { id: "m1", title: "Match with Investor A", last: "Hey, let’s chat" },
        { id: "m2", title: "Match with Rahul", last: "Sent deck" },
      ]);
    });
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Messages</h1>
      <div className="mt-6 lg:flex gap-6">
        <div className="lg:w-1/3 bg-white rounded p-4 shadow">
          <ul className="space-y-2">
            {convos.map((c)=>(
              <li key={c.id} className="p-2 hover:bg-gray-50 rounded">
                <Link href={`/chat/${c.id}`} legacyBehavior>
                  <a>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-gray-500">{c.last}</div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:flex-1 bg-white rounded p-4 shadow">
          <p className="text-sm text-gray-500">Select a conversation to open chat</p>
        </div>
      </div>
    </Layout>
  );
}
