import React from 'react';
import { ChevronLeft, Shield, FileText } from 'lucide-react';

interface PrivacyTermsProps {
  mode: 'privacy' | 'terms';
  onBack: () => void;
}

export default function PrivacyTerms({ mode, onBack }: PrivacyTermsProps) {
  const isPrivacy = mode === 'privacy';

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans pb-12 mesh-gradient animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="max-w-md mx-auto relative px-6">

        {/* Header */}
        <header className="py-8 flex items-center gap-4 bg-transparent">
          <button onClick={onBack} className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isPrivacy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {isPrivacy ? <Shield size={18} /> : <FileText size={18} />}
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
          </div>
        </header>

        {/* Last Updated */}
        <div className="glass-panel p-4 flex gap-3 border-white/5 mb-6">
          <p className="text-[10px] text-[#e1e3e4]/60 leading-relaxed font-bold uppercase tracking-wider">
            Last Updated: June 2026 • SaukiGlobal Technologies
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isPrivacy ? <PrivacyContent /> : <TermsContent />}
        </div>

        <p className="text-center text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-[0.2em] mt-10 mb-4">
          SaukiGlobal v1.0 • Crafted in Nigeria
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-5 border-white/5 shadow-xl">
      <h3 className="text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-3">{title}</h3>
      <div className="text-xs text-[#e1e3e4]/70 leading-relaxed space-y-2 font-medium">
        {children}
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <>
      <Section title="Introduction">
        <p>
          SaukiGlobal ("we", "our", "us") is committed to protecting your personal information. This Privacy Policy explains
          how we collect, use, store, and share your data when you use our mobile application and services.
        </p>
        <p>
          By creating an account or using SaukiGlobal, you agree to the practices described in this policy.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p className="font-bold text-white/80">Personal Information:</p>
        <p>• Full name, email address, and phone number (during registration)</p>
        <p>• BVN or NIN (for identity verification and virtual account creation)</p>
        <p>• Physical address (if provided for eSIM registration)</p>
        <p className="font-bold text-white/80 pt-2">Financial Information:</p>
        <p>• Wallet balance, transaction history, and payment records</p>
        <p>• Bank transfer details for manual funding</p>
        <p className="font-bold text-white/80 pt-2">Device Information:</p>
        <p>• Device identifiers for push notifications</p>
        <p>• App usage data and crash logs for improving our services</p>
      </Section>

      <Section title="How We Use Your Data">
        <p>• To create and manage your SaukiGlobal account</p>
        <p>• To process transactions (airtime, data, bill payments, etc.)</p>
        <p>• To verify your identity (KYC compliance)</p>
        <p>• To send important notifications about your transactions and account</p>
        <p>• To improve our services and user experience</p>
        <p>• To prevent fraud and maintain security</p>
      </Section>

      <Section title="Data Security">
        <p>
          All data transmitted between your device and our servers is encrypted using HTTPS/TLS protocols.
          Your transaction PIN is securely hashed and never stored in plain text. We implement industry-standard
          security measures to protect your personal information from unauthorized access.
        </p>
      </Section>

      <Section title="Data Sharing">
        <p>We do not sell your personal data. We may share information with:</p>
        <p>• Payment processors and network providers to fulfill your transactions</p>
        <p>• Regulatory authorities when required by Nigerian law</p>
        <p>• Service partners necessary to deliver requested services (e.g., eSIM providers)</p>
      </Section>

      <Section title="Data Retention & Deletion">
        <p>
          We retain your data for as long as your account is active. You may request complete deletion of your
          account and associated data at any time through the app's Profile Settings. Upon receiving a deletion
          request, we will permanently remove your personal data within 30 days, except where retention is
          required by law or for legitimate business purposes (e.g., transaction records for regulatory compliance).
        </p>
      </Section>

      <Section title="Your Rights">
        <p>You have the right to:</p>
        <p>• Access and review your personal data</p>
        <p>• Request correction of inaccurate information</p>
        <p>• Request deletion of your account and data</p>
        <p>• Withdraw consent for data processing</p>
      </Section>

      <Section title="Contact Us">
        <p>
          For any privacy-related questions or requests, contact us at:
        </p>
        <p className="text-[#66df75] font-bold">Email: support@saukiglobal.com</p>
        <p className="text-[#66df75] font-bold">WhatsApp: +234 906 850 0544</p>
        <p className="text-[#66df75] font-bold">Website: https://saukiglobal.com</p>
      </Section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <Section title="Acceptance of Terms">
        <p>
          By downloading, installing, or using the SaukiGlobal application, you agree to be bound by these
          Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>
      </Section>

      <Section title="Services Provided">
        <p>SaukiGlobal provides the following digital services:</p>
        <p>• Airtime and data bundle purchases</p>
        <p>• Electricity bill payments</p>
        <p>• Cable TV subscription payments</p>
        <p>• Exam result checker PINs (WAEC, NECO, NABTEB)</p>
        <p>• eSIM registration and management</p>
        <p>• NIN printing services</p>
        <p>• Wallet-to-wallet transfers</p>
        <p>• Airtime-to-cash conversion</p>
        <p>• CAC business registration</p>
        <p>• International airtime top-up</p>
      </Section>

      <Section title="Account Responsibilities">
        <p>• You must provide accurate and complete information during registration</p>
        <p>• You are responsible for maintaining the confidentiality of your login credentials and transaction PIN</p>
        <p>• You must be at least 18 years old to use our services</p>
        <p>• You agree not to use the platform for any fraudulent, illegal, or unauthorized activities</p>
        <p>• You are responsible for all activities that occur under your account</p>
      </Section>

      <Section title="Wallet & Transactions">
        <p>• Wallet funding is processed through secure payment gateways and virtual bank accounts</p>
        <p>• All transactions are final once confirmed and processed</p>
        <p>• Transaction fees, if any, will be clearly displayed before confirmation</p>
        <p>• SaukiGlobal reserves the right to reverse fraudulent or erroneous transactions</p>
        <p>• Wallet balances do not earn interest</p>
      </Section>

      <Section title="Refund Policy">
        <p>
          Refunds are processed on a case-by-case basis. If a transaction fails but your wallet is debited,
          the amount will be automatically reversed within 24 hours. For disputed transactions, please contact
          our support team with the transaction reference number. SaukiGlobal is not responsible for failed
          transactions caused by incorrect information provided by the user (e.g., wrong phone number,
          meter number, or smart card number).
        </p>
      </Section>

      <Section title="Service Availability">
        <p>
          We strive to maintain 24/7 service availability. However, services may be temporarily unavailable
          due to maintenance, network provider issues, or circumstances beyond our control. SaukiGlobal shall
          not be held liable for any losses arising from service interruptions.
        </p>
      </Section>

      <Section title="Account Termination">
        <p>
          SaukiGlobal reserves the right to suspend or terminate accounts that violate these terms, engage in
          fraudulent activities, or are used for illegal purposes. You may also request account deletion at
          any time through the app's Profile Settings.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          SaukiGlobal shall not be liable for any indirect, incidental, or consequential damages arising from
          the use of our services. Our total liability for any claim shall not exceed the amount you paid for
          the specific transaction in question.
        </p>
      </Section>

      <Section title="Changes to Terms">
        <p>
          We may update these Terms of Service from time to time. Continued use of the application after
          changes are posted constitutes your acceptance of the updated terms. We will notify users of
          significant changes through the app or email.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any disputes
          arising from these terms shall be resolved in accordance with Nigerian law.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          For questions about these terms, contact us at:
        </p>
        <p className="text-[#66df75] font-bold">Email: support@saukiglobal.com</p>
        <p className="text-[#66df75] font-bold">WhatsApp: +234 906 850 0544</p>
        <p className="text-[#66df75] font-bold">Website: https://saukiglobal.com</p>
      </Section>
    </>
  );
}
