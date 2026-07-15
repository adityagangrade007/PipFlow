export const siteConfig = {
  name: "Pipflow",
  tagline: "Mission control for your trading bots",
  description:
    "Monitor and control your MetaTrader Expert Advisors from anywhere. Real-time equity, remote start/stop, risk guardrails and instant alerts — on any device.",
  url: "https://pipflow.vercel.app",
  nav: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  links: {
    signIn: "/login",
    getStarted: "/register",
    github: "https://github.com",
    twitter: "https://x.com",
  },
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
