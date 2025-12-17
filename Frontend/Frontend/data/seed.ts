// data/seed.ts
export const users = {
  me: {
    id: "u1",
    name: "Your Name",
    role: "founder",
    headline: "SaaS founder",
    bio: "Building the future of B2B apps.",
    domain: "SaaS",
  },
};

export const founders = [
  { id: "f1", name: "Asha Patel", headline: "SaaS · Pre-seed", image: "/images/sample1.png", summary: "20k MRR, early traction" },
  { id: "f2", name: "Rahul Singh", headline: "Healthcare · Seed", image: "/images/sample2.png", summary: "Pilot with hospital" },
  { id: "f3", name: "Kiran Mehra", headline: "Fintech · Growth", image: "/images/sample3.png", summary: "Growing to 200k MRR" },
];

export const investors = [
  { id: "i1", name: "Investor A", headline: "Seed investor", image: "/images/sample2.png", summary: "Focus: SaaS, early growth" },
  { id: "i2", name: "Investor B", headline: "Angel - Healthcare", image: "/images/sample3.png", summary: "Focus: healthcare startups" },
];

export const conversations = [
  { id: "m1", title: "Match with Investor A", last: "Hi — interested in a quick chat", messages: [{ from: "peer", text: "Hi — interested in a quick chat" }] },
  { id: "m2", title: "Match with Rahul", last: "Sent deck", messages: [{ from: "peer", text: "Sent deck" }] },
];
