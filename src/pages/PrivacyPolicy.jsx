import GlitchText from "../components/GlitchText";

const sections = [
  {
    num: "1",
    title: "Scope",
    body: "This Privacy Policy applies to personal information we process through the Services, including creator dashboards, AI features, analytics tools, matchmaking tools, integrations, support interactions, billing workflows, and related communications.\n\nThis Privacy Policy does not apply to third-party platforms, websites, apps, or services that we do not control, including TikTok, Twitch, payment providers, and analytics vendors; information processed solely on behalf of business customers under a separate written agreement; or anonymous or deidentified information that cannot reasonably be used to identify you.",
  },
  {
    num: "2",
    title: "The Information We Collect",
    body: "The personal information we collect depends on how you use ALT CTRL, what features you use, what information you choose to provide, and whether you connect third-party accounts.\n\n2.1 Information You Provide Directly\n• Account registration information (name, email, username, password, preferences)\n• Creator profile information (display name, TikTok/Twitch handle, bio, timezone, goals)\n• Session logs and metrics (stream dates, viewers, follower changes, notes)\n• Communications (emails, support tickets, feedback)\n• Payment and subscription information (billing email, address, status)\n\n2.2 Information We Collect Automatically\n• Device information (browser type, OS, device identifiers)\n• Usage information (pages viewed, features used, session duration)\n• Log information (IP address, timestamps, error logs)\n• Approximate location inferred from IP address\n• Cookie, pixel, and similar technology data\n\n2.3 Information from Connected Platforms\nWhen you connect third-party accounts, we may collect account identifiers, display names, profile images, public content metadata, and other authorized data.\n\n2.4 Information We Generate or Derive\n• Recommendation and consistency scores\n• Analytics summaries and trend classifications\n• AI-generated summaries, plans, and workflow outputs",
  },
  {
    num: "3",
    title: "Sources of Personal Information",
    body: "• Directly from you\n• Automatically from your device or browser\n• From connected third-party platforms you authorize\n• From payment processors and subscription vendors\n• From service providers acting on our behalf\n• From publicly available sources where lawful and appropriate",
  },
  {
    num: "4",
    title: "How We Use Personal Information",
    body: "• To provide, operate, maintain, and improve the Services\n• To create and manage your account\n• To personalize your profile, dashboard, and creator experience\n• To power analytics, AI recommendations, and insights\n• To process subscriptions, payments, and transactions\n• To provide customer support and respond to requests\n• To send service messages, confirmations, and legal notices\n• To send marketing communications where permitted\n• To detect, prevent, and respond to fraud and security incidents\n• To enforce our Terms of Service and policies\n• To develop, improve, and protect our products\n• To create aggregated or deidentified analytics\n• To comply with legal obligations",
  },
  {
    num: "5",
    title: "AI Features and Processing",
    body: "ALT CTRL uses personal information to power AI-assisted features such as recommendations, summaries, templates, match suggestions, and scheduling insights.\n\nAI-generated outputs may reflect patterns, predictions, or summaries based on your data and system logic. They may be inaccurate, incomplete, or outdated, and you are responsible for reviewing them before relying on them.",
  },
  {
    num: "6",
    title: "Cookies and Similar Technologies",
    body: "We use cookies, pixels, local storage, SDKs, and similar technologies for authentication, account security, traffic measurement, debugging, and analytics. You can control certain cookies through your browser settings. Blocking some cookies may affect how the Services function.",
  },
  {
    num: "7",
    title: "How We Share Personal Information",
    body: "7.1 Service Providers\nWe share information with vendors that perform services for us, such as hosting, storage, analytics, payment processing, and customer support.\n\n7.2 Connected Platforms and Integrations\nWhen you connect a third-party platform, information may be exchanged based on your authorization and the platform's rules.\n\n7.3 Other Users or Public Features\nCertain profile or performance-related information may be visible to other users based on your settings.\n\n7.4 Corporate Transactions\nWe may disclose personal information in connection with mergers, acquisitions, restructuring, or sales of assets.\n\n7.5 Legal and Safety Reasons\nWe may disclose information if necessary to comply with law, enforce agreements, investigate fraud, or protect safety.\n\n7.6 With Your Direction or Consent\nWe may share information if you ask us to or clearly consent.",
  },
  {
    num: "8",
    title: "Data Retention",
    body: "We retain personal information for as long as reasonably necessary to provide the Services, maintain your account, comply with legal obligations, and prevent fraud. When we no longer need personal information, we delete it, deidentify it, or securely store it until deletion is feasible.",
  },
  {
    num: "9",
    title: "Data Security",
    body: "We use reasonable administrative, technical, and organizational measures designed to protect personal information from unauthorized access, use, alteration, disclosure, or destruction. However, no system is completely secure, and we cannot guarantee absolute security.\n\nYou are responsible for protecting your account credentials and notifying us if your account has been compromised.",
  },
  {
    num: "10",
    title: "International Data Transfers",
    body: "We may process and store personal information in the United States and other countries where we or our service providers operate. These countries may have data protection laws that differ from yours. Where required by law, we will use appropriate safeguards for cross-border transfers.",
  },
  {
    num: "11",
    title: "Your Privacy Rights and Choices",
    body: "Depending on where you live, you may have certain privacy rights under applicable law, including rights to access, correct, delete, or port your personal information, object to or restrict processing, withdraw consent, or opt out of targeted advertising.\n\n11.1 Account and Communication Choices\nYou may update information through your account settings and opt out of marketing emails.\n\n11.2 Connected Platform Choices\nYou may disconnect integrations through your ALT CTRL account or the connected platform.\n\n11.3 Submitting a Privacy Request\nContact: privacy@altctrl.us\n\n11.4 California Notice\nCalifornia residents may have rights under California privacy law.\n\n11.5 UK / EEA Notice\nIf you are in the UK or EEA, we process personal information on the basis of contract performance, legal compliance, or legitimate interests. You may lodge a complaint with your data protection authority.",
  },
  {
    num: "12",
    title: "Children's Privacy",
    body: "The Services are not directed to children under 18, and we do not knowingly collect personal information from anyone under 18. If you believe a child has provided us personal information, contact us and we will take appropriate steps.",
  },
  {
    num: "13",
    title: "Third-Party Services and External Links",
    body: "The Services may contain links to third-party sites and services. We are not responsible for the privacy, security, content, or practices of third parties. Your interactions with them are governed by their own terms and privacy policies.",
  },
  {
    num: "14",
    title: "Changes to This Privacy Policy",
    body: "We may update this Privacy Policy from time to time. If we make material changes, we will update the effective date and provide additional notice where required. Your continued use of the Services after updates means you acknowledge the revised policy.",
  },
  {
    num: "15",
    title: "Contact Us",
    body: "If you have questions about this Privacy Policy or our privacy practices:\n\nALT CTRL\nWebsite: altctrl.us\nPrivacy Email: privacy@altctrl.us\nSupport Email: support@altctrl.us",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// LEGAL — DATA PROTOCOL</div>
          <GlitchText text="PRIVACY POLICY" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-500 font-mono text-xs mt-4">Effective Date: March 28, 2026 | Last Updated: March 28, 2026</p>
        </div>

        <p className="text-slate-400 leading-relaxed mb-12 text-sm">
          This Privacy Policy explains how ALT CTRL ("ALT CTRL," "we," "us," or "our") collects, uses, shares, stores, and otherwise processes personal information when you visit altctrl.us, create an account, connect third-party platforms, use our products and features, communicate with us, or otherwise interact with our services (collectively, the "Services"). This Privacy Policy should be read together with our Terms of Service.
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