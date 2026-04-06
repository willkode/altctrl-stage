import GlitchText from "../components/GlitchText";

const sections = [
  {
    num: "1",
    title: "What ALT CTRL Is",
    body: "ALT CTRL is a creator intelligence and management platform designed to help live creators and streamers with features such as scheduling, analytics, AI-powered recommendations, partner matching, creator tools, agency-exit workflows, and optional paid or invite-only programs.\n\nALT CTRL is not TikTok, Twitch, or any other third-party platform, and ALT CTRL is not a law firm, financial advisor, talent agency, or licensed professional advisor unless explicitly stated in a separate signed agreement.",
  },
  {
    num: "2",
    title: "Eligibility",
    body: "You may use the Services only if:\n• You are at least 18 years old, or the age of legal majority where you live\n• You have the legal capacity to enter into these Terms\n• Your use does not violate any applicable law or regulation\n• You are not barred from using the Services under any applicable law\n\nIf you use the Services on behalf of a company or entity, you represent that you have authority to bind that entity to these Terms.",
  },
  {
    num: "3",
    title: "Account Registration and Security",
    body: "To use some features, you must create an account. You agree to:\n• Provide accurate, current, and complete information\n• Keep your login credentials confidential\n• Promptly update your account information if it changes\n• Accept responsibility for all activity under your account\n\nYou must notify us immediately at support@altctrl.us if your account has been compromised. We may suspend or terminate accounts that are inaccurate, fraudulent, insecure, abusive, or in violation of these Terms.",
  },
  {
    num: "4",
    title: "Subscriptions, Fees, Billing, and Refunds",
    body: "Some parts of the Services may be offered on a paid basis, including subscriptions, premium tools, or optional programs.\n\n4.1 Paid Plans: You agree to pay all applicable fees, taxes, and charges. Unless otherwise stated, subscriptions renew automatically until canceled.\n\n4.2 Billing Authorization: You authorize us and our payment processors to charge your payment method.\n\n4.3 Price Changes: We may change pricing with notice. New pricing applies beginning with your next billing cycle.\n\n4.4 Cancellation: You may cancel at any time through your account settings. Cancellations take effect at the end of your current paid period.\n\n4.5 Refunds: Except where required by law, all purchases are final and non-refundable.",
  },
  {
    num: "5",
    title: "Beta Features",
    body: "We may label certain features as beta, pilot, test, or early access. Beta features may be incomplete, unstable, changed, suspended, or removed at any time without notice. Beta features are provided as-is with no warranty.",
  },
  {
    num: "6",
    title: "Creator Data, Integrations, and Third-Party Platforms",
    body: "The Services may allow you to connect third-party accounts or import data from services such as TikTok or Twitch.\n\n6.1 You represent that you own or control the account, have the right to authorize ALT CTRL to access data, and that connection does not violate any third-party terms.\n\n6.2 Your use of third-party platforms remains subject to their own terms, policies, and guidelines. You are responsible for compliance.\n\n6.3 We do not control third-party services and are not responsible for their acts, omissions, outages, or policy changes.\n\n6.4 We may add, change, restrict, or remove integrations at any time as required by platform rules or technical limitations.",
  },
  {
    num: "7",
    title: "AI Recommendations and Output",
    body: "ALT CTRL may provide AI-generated recommendations, summaries, plans, and other output. You understand and agree that:\n• AI Output may be incomplete, inaccurate, outdated, or inappropriate\n• AI Output is for informational purposes only\n• AI Output is NOT legal, financial, tax, medical, or professional advice\n• You are solely responsible for reviewing and deciding whether to rely on AI Output\n• You remain responsible for your content, decisions, and creator operations\n\nWe do not guarantee any particular result, including growth, followers, revenue, or monetization.",
  },
  {
    num: "8",
    title: "Agency Exit Assistant; No Legal Services",
    body: "The Agency Exit Assistant is an organizational and drafting tool only. It does not provide legal advice, create an attorney-client relationship, guarantee release from contracts, or act as your representative unless we separately agree in writing.\n\nAny materials generated must be independently reviewed by you. If dealing with contract penalties, legal threats, or material disputes, consult a qualified attorney in your jurisdiction.",
  },
  {
    num: "9",
    title: "Optional Programs, Networks, and Managed Services",
    body: "ALT CTRL may offer optional programs, communities, or support services. Unless expressly stated in a separate signed agreement, ALT CTRL does not act as your exclusive manager, agent, talent representative, employer, or fiduciary.",
  },
  {
    num: "10",
    title: "User Content",
    body: "10.1 Your Content: You may submit data, text, documents, screenshots, images, and other materials (\"User Content\"). You retain ownership of your User Content.\n\n10.2 License to ALT CTRL: You grant us a worldwide, non-exclusive, royalty-free license to host, store, process, analyze, and use your User Content to operate the Services, improve our tools, and comply with legal obligations.\n\n10.3 Your Promises: You represent that you own or control your User Content and that it does not violate any law, contract, or third-party right.",
  },
  {
    num: "11",
    title: "Feedback",
    body: "If you provide suggestions, feedback, or improvement requests, you grant us a perpetual, irrevocable, worldwide, royalty-free right to use, modify, and exploit that Feedback without restriction or compensation.",
  },
  {
    num: "12",
    title: "Acceptable Use and Prohibited Conduct",
    body: "You agree not to:\n• Violate any law or third-party platform terms\n• Impersonate any person or entity\n• Upload false, misleading, or manipulated records\n• Harass, threaten, stalk, or defame others\n• Scrape or reverse engineer the Services\n• Interfere with the operation or security of the Services\n• Access another user's account without authorization\n• Upload malware or harmful code\n• Generate spam or deceptive communications\n• Submit knowingly false complaints or bad-faith reports\n• Use the Services to develop competing products",
  },
  {
    num: "13",
    title: "Moderation, Monitoring, and Enforcement",
    body: "We may monitor use of the Services, review content, investigate suspected misuse, and take action including warning, restricting, suspending, or terminating accounts where necessary to protect the Services, users, or our legal interests.",
  },
  {
    num: "14",
    title: "Intellectual Property",
    body: "The Services, including our software, interfaces, branding, designs, and underlying technology, are owned by ALT CTRL or our licensors and protected by intellectual property law.\n\nWe grant you a limited, non-exclusive, non-transferable, revocable right to access and use the Services for your personal or internal business use. You may not copy, distribute, modify, or exploit any part of the Services except as expressly permitted.",
  },
  {
    num: "15",
    title: "Privacy",
    body: "Your use of the Services is also subject to our Privacy Policy, which describes how we collect, use, and protect personal information. By using the Services, you acknowledge that you have read the Privacy Policy.\n\nPrivacy Policy: altctrl.us/privacy",
  },
  {
    num: "16",
    title: "Communications",
    body: "You agree that we may send you transactional, service, legal, security, and account-related communications electronically, including by email or in-app message. You may also receive promotional messages where permitted by law.",
  },
  {
    num: "17",
    title: "Copyright and Takedown Procedure",
    body: "If you believe content infringes your intellectual property rights, contact us at legal@altctrl.us. For DMCA notices, include your contact information, a description of the work claimed to be infringed, identification of the infringing material, a good-faith statement that use is unauthorized, and a statement under penalty of perjury that information is accurate.",
  },
  {
    num: "18",
    title: "Suspension and Termination",
    body: "We may suspend or terminate your access to the Services at any time if you violate these Terms, engage in abuse, your use is fraudulent or unlawful, it is required by law, or necessary for security or operational reasons.\n\nSections that by their nature should survive termination will survive, including ownership, disclaimers, limitations of liability, and indemnity.",
  },
  {
    num: "19",
    title: "Disclaimers",
    body: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE.\" ALT CTRL DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.\n\nWe do not warrant that analytics will be accurate, that services will integrate continuously, that you will gain followers or revenue, or that services will be available without outages.",
  },
  {
    num: "20",
    title: "Limitation of Liability",
    body: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALT CTRL WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, BUSINESS, DATA, OR PLATFORM ACCESS.\n\nALT CTRL'S TOTAL LIABILITY FOR ALL CLAIMS WILL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID IN THE 12 MONTHS BEFORE THE CLAIM; OR (B) USD $100.",
  },
  {
    num: "21",
    title: "Indemnification",
    body: "You agree to defend, indemnify, and hold harmless ALT CTRL and its affiliates from any claims, damages, liabilities, losses, costs, and expenses, including reasonable attorneys' fees, arising out of your use of the Services, your User Content, your violation of these Terms, your relationships with agencies or partners, or your use of AI Output.",
  },
  {
    num: "22",
    title: "Dispute Resolution",
    body: "Any dispute arising out of or relating to these Terms or the Services will be governed by applicable law. Both parties consent to personal jurisdiction and venue in the applicable courts.",
  },
  {
    num: "23",
    title: "Changes to the Services",
    body: "We may modify, suspend, discontinue, or remove any part of the Services at any time, with or without notice.",
  },
  {
    num: "24",
    title: "Changes to These Terms",
    body: "We may update these Terms from time to time. If we make material changes, we will post the updated Terms and update the effective date. Your continued use means you accept the revised Terms.",
  },
  {
    num: "25",
    title: "General Terms",
    body: "25.1 Entire Agreement: These Terms constitute the entire agreement regarding the Services.\n\n25.2 Severability: If any provision is invalid, remaining provisions remain in full force.\n\n25.3 No Waiver: Failure to enforce any provision is not a waiver.\n\n25.4 Assignment: You may not assign these Terms without our consent.\n\n25.5 Force Majeure: We are not liable for delays caused by events beyond our control.\n\n25.6 Relationship: Nothing creates a partnership, employment, or fiduciary relationship.",
  },
  {
    num: "26",
    title: "Contact Information",
    body: "ALT CTRL\n\nWebsite: altctrl.us\nSupport: support@altctrl.us\nLegal Notices: legal@altctrl.us",
  },
];

export default function Terms() {
  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// LEGAL — TERMS OF SERVICE</div>
          <GlitchText text="TERMS OF SERVICE" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-500 font-mono text-xs mt-4">Effective Date: March 28, 2026 | Last Updated: March 28, 2026</p>
        </div>

        <p className="text-slate-400 leading-relaxed mb-12 text-sm">
          These Terms of Service (\"Terms\") are a legally binding agreement between you and ALT CTRL (\"ALT CTRL,\" \"we,\" \"us,\" or \"our\") governing your access to and use of altctrl.us, our web application, and any related products, features, content, tools, integrations, communications, and services (collectively, the \"Services\").\n\n\nBy accessing or using the Services, creating an account, or otherwise using ALT CTRL, you agree to be bound by these Terms. If you do not agree, do not use the Services.
        </p>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl font-black text-cyan-400 shrink-0">{section.num}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-black uppercase text-white mb-4">{section.title}</h2>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{section.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}