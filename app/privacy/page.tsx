import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
          <p className="font-medium text-[var(--text-primary)] opacity-80">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Introduction</h2>
            <p>
              Welcome to Student Dashboard. I respect your privacy and am committed to protecting your personal data. 
              This privacy policy will inform you as to how I look after your personal data when you visit this website 
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>
          
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. The Data Collected About You</h2>
            <p className="mb-4">
              I may collect, use, store and transfer different kinds of personal data about you which have been grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Identity Data</strong> includes first name, last name, username or similar identifier, and profile picture (often provided via Google OAuth).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Contact Data</strong> includes email address.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Usage Data</strong> includes information about how you use our website and services.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. How Your Personal Data is Used</h2>
            <p className="mb-4">
              I will only use your personal data when the law allows. Most commonly, I will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where it is necessary to perform the service (e.g., providing the dashboard functionality).</li>
              <li>Where it is necessary for legitimate interests and your interests and fundamental rights do not override those interests.</li>
              <li>Where there is a need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Data Security</h2>
            <p>
              I have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
              As the sole developer, I strictly limit access to your personal data to myself, and only access it when a technical or administrative need arises.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">5. Third-Party Links</h2>
            <p>
              This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. I do not control these third-party websites and am not responsible for their privacy statements.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">6. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">7. Contact Me</h2>
            <p>
              If you have any questions about this privacy policy or the platform's privacy practices, please feel free to reach out to me.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
