import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-[var(--bg-surface)] p-8 md:p-12 rounded-2xl shadow-[var(--shadow-md)]">
        <Link 
          href="/" 
          className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-accent)] mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-[var(--text-primary)]">
          Terms and Conditions
        </h1>
        
        <div className="space-y-6 text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
          <p className="font-medium text-[var(--text-primary)] opacity-80">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Student Dashboard platform, you agree to be bound by these Terms and Conditions and the Privacy Policy. 
              If you do not agree with any part of these terms, you must not use the services.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. Description of Service</h2>
            <p>
              Student Dashboard provides a set of tools to help students track attendance, classes, exams, and other academic records. 
              I reserve the right to modify, suspend, or discontinue the service at any time without notice.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. User Registration and Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may be required to register with Google OAuth to access certain features.</li>
              <li>You agree to keep your account information secure and confidential.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>I reserve the right to suspend or terminate accounts that violate these terms or for any other reason at my sole discretion.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Acceptable Use Policy</h2>
            <p className="mb-4">
              You agree not to use the platform in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the platform. You must not use the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>In any way that is unlawful, illegal, fraudulent, or harmful.</li>
              <li>To copy, store, host, transmit, send, use, publish, or distribute any material consisting of malicious computer software.</li>
              <li>To conduct any systematic or automated data collection activities (including scraping, data mining, data extraction).</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">5. Intellectual Property Rights</h2>
            <p>
              Unless otherwise stated, I own the intellectual property rights in the website and material on the website. 
              All these intellectual property rights are reserved. You may view and/or print pages for your own personal use subject to restrictions set in these terms.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall the developer of Student Dashboard be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the platform.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">7. Changes to Terms</h2>
            <p>
              I reserve the right, at my sole discretion, to modify or replace these Terms at any time. 
              By continuing to access or use the Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">8. Contact Me</h2>
            <p>
              If you have any questions about these Terms, please contact me.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
