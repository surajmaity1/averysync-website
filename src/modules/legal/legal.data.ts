import type { LegalDocument } from './legal.types'

/**
 * Static content for the Terms of Service and Privacy Policy pages.
 *
 * These are conventional, standards-aligned policies for a SaaS product
 * (GDPR / CCPA-aware) written as plain content data so the pages stay purely
 * presentational and unit-testable. They are a solid professional baseline,
 * not a substitute for review by counsel before launch.
 */

const COMPANY = 'Averysync Inc.'
const PRODUCT = 'Averysync'
const LEGAL_EMAIL = 'legal@averysync.com'
const PRIVACY_EMAIL = 'privacy@averysync.com'
const GOVERNING_LAW = 'the State of Delaware, United States'
const LAST_UPDATED = '2026-07-20'

export const TERMS_DOCUMENT: LegalDocument = {
  kind: 'terms',
  title: 'Terms of Service',
  lastUpdated: LAST_UPDATED,
  intro: `These Terms of Service ("Terms") govern your access to and use of ${PRODUCT}, the real-time audio and community platform operated by ${COMPANY} ("${PRODUCT}", "we", "us", or "our"). By creating an account or using the service, you agree to be bound by these Terms.`,
  sections: [
    {
      id: 'acceptance',
      heading: '1. Acceptance of Terms',
      body: [
        {
          type: 'paragraph',
          text: `By accessing or using ${PRODUCT}, you confirm that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy, which is incorporated here by reference. If you are entering into these Terms on behalf of an organization, you represent that you have the authority to bind that organization.`,
        },
        {
          type: 'paragraph',
          text: 'If you do not agree to these Terms, you must not access or use the service.',
        },
      ],
    },
    {
      id: 'eligibility',
      heading: '2. Eligibility',
      body: [
        {
          type: 'paragraph',
          text: `You must be at least 16 years old, or the minimum age of digital consent in your country, to use ${PRODUCT}. By using the service you represent and warrant that you meet this requirement and that you are not barred from using the service under any applicable law.`,
        },
      ],
    },
    {
      id: 'accounts',
      heading: '3. Accounts and Registration',
      body: [
        {
          type: 'paragraph',
          text: 'You may need an account to use certain features. You agree to provide accurate information and to keep it up to date. You are responsible for all activity that occurs under your account.',
        },
        {
          type: 'list',
          items: [
            'Keep your login credentials confidential and do not share your account.',
            'Notify us promptly of any unauthorized use or security breach.',
            'We may suspend or terminate accounts that violate these Terms.',
          ],
        },
      ],
    },
    {
      id: 'acceptable-use',
      heading: '4. Acceptable Use',
      body: [
        {
          type: 'paragraph',
          text: 'You agree to use the service lawfully and respectfully. You must not:',
        },
        {
          type: 'list',
          items: [
            'Harass, threaten, defame, or discriminate against other members.',
            'Post or transmit unlawful, infringing, hateful, or sexually exploitative content.',
            'Record or redistribute a live Space without the required consent of participants.',
            'Distribute malware, spam, or engage in phishing or fraud.',
            'Attempt to gain unauthorized access to the service or interfere with its operation.',
            'Scrape, reverse engineer, or resell the service except as permitted by law.',
          ],
        },
      ],
    },
    {
      id: 'user-content',
      heading: '5. User Content',
      body: [
        {
          type: 'paragraph',
          text: 'You retain ownership of the content you create, post, or broadcast, including your audio, posts, and messages ("User Content"). You are solely responsible for your User Content and the consequences of sharing it.',
        },
        {
          type: 'paragraph',
          text: `You grant ${COMPANY} a worldwide, non-exclusive, royalty-free license to host, store, reproduce, and display your User Content solely to operate, provide, and improve the service. This license ends when you delete your User Content, except where it has been shared with others who have not deleted it or where we must retain it to comply with law.`,
        },
      ],
    },
    {
      id: 'spaces',
      heading: '6. Live Spaces',
      body: [
        {
          type: 'paragraph',
          text: 'Spaces are live, real-time audio rooms. Hosts are responsible for moderating their Spaces, including muting or removing participants who violate these Terms. Participation in a Space is voluntary and may be publicly audible to other members.',
        },
        {
          type: 'paragraph',
          text: 'Do not share confidential information in a Space that you do not want other participants to hear or repeat.',
        },
      ],
    },
    {
      id: 'intellectual-property',
      heading: '7. Intellectual Property',
      body: [
        {
          type: 'paragraph',
          text: `The service, including its software, design, trademarks, and branding, is owned by ${COMPANY} and protected by intellectual property laws. Except for the rights expressly granted to you, we reserve all rights, title, and interest in the service.`,
        },
      ],
    },
    {
      id: 'third-party',
      heading: '8. Third-Party Services',
      body: [
        {
          type: 'paragraph',
          text: 'The service may integrate with or link to third-party services, such as authentication providers. We are not responsible for third-party services, and your use of them is governed by their own terms and policies.',
        },
      ],
    },
    {
      id: 'termination',
      heading: '9. Termination',
      body: [
        {
          type: 'paragraph',
          text: 'You may stop using the service and delete your account at any time. We may suspend or terminate your access if you violate these Terms, if required by law, or if we discontinue the service. Provisions that by their nature should survive termination will survive.',
        },
      ],
    },
    {
      id: 'disclaimers',
      heading: '10. Disclaimers',
      body: [
        {
          type: 'paragraph',
          text: 'The service is provided "as is" and "as available" without warranties of any kind, whether express, implied, or statutory, including any implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will be uninterrupted, secure, or error-free.',
        },
      ],
    },
    {
      id: 'liability',
      heading: '11. Limitation of Liability',
      body: [
        {
          type: 'paragraph',
          text: `To the maximum extent permitted by law, ${COMPANY} and its officers, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, or goodwill arising from your use of the service. Our total liability for any claim will not exceed the greater of the amount you paid us in the twelve months before the claim or one hundred US dollars (USD 100).`,
        },
      ],
    },
    {
      id: 'indemnification',
      heading: '12. Indemnification',
      body: [
        {
          type: 'paragraph',
          text: `You agree to indemnify and hold harmless ${COMPANY} from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising out of your User Content, your use of the service, or your violation of these Terms or of any law or third-party right.`,
        },
      ],
    },
    {
      id: 'governing-law',
      heading: '13. Governing Law and Disputes',
      body: [
        {
          type: 'paragraph',
          text: `These Terms are governed by the laws of ${GOVERNING_LAW}, without regard to its conflict-of-laws rules. You agree that any dispute will be resolved in the courts located in that jurisdiction, unless applicable law grants you the right to bring a claim elsewhere.`,
        },
      ],
    },
    {
      id: 'changes',
      heading: '14. Changes to These Terms',
      body: [
        {
          type: 'paragraph',
          text: 'We may update these Terms from time to time. When we make material changes, we will update the "Last updated" date above and, where appropriate, provide additional notice. Your continued use of the service after changes take effect constitutes acceptance of the revised Terms.',
        },
      ],
    },
    {
      id: 'contact',
      heading: '15. Contact Us',
      body: [
        {
          type: 'paragraph',
          text: `If you have questions about these Terms, contact us at ${LEGAL_EMAIL} or by mail to ${COMPANY}, Legal Department.`,
        },
      ],
    },
  ],
}

export const PRIVACY_DOCUMENT: LegalDocument = {
  kind: 'privacy',
  title: 'Privacy Policy',
  lastUpdated: LAST_UPDATED,
  intro: `This Privacy Policy explains how ${COMPANY} ("${PRODUCT}", "we", "us", or "our") collects, uses, shares, and protects your personal information when you use ${PRODUCT}. We are committed to handling your data responsibly and in line with applicable data protection laws, including the GDPR and the CCPA.`,
  sections: [
    {
      id: 'introduction',
      heading: '1. Introduction and Scope',
      body: [
        {
          type: 'paragraph',
          text: `This policy applies to personal information we process about visitors and registered users of ${PRODUCT}. It does not apply to third-party services that have their own privacy policies.`,
        },
      ],
    },
    {
      id: 'information-we-collect',
      heading: '2. Information We Collect',
      body: [
        {
          type: 'paragraph',
          text: 'We collect information you provide directly, information generated as you use the service, and information from third parties such as authentication providers.',
        },
        {
          type: 'list',
          items: [
            'Account data: your name, email address, and profile details.',
            'Content: posts, messages, and audio you share in Spaces.',
            'Usage data: pages viewed, features used, and interactions.',
            'Device and log data: IP address, browser type, and timestamps.',
            'Cookies and similar technologies used to keep you signed in.',
          ],
        },
      ],
    },
    {
      id: 'how-we-use',
      heading: '3. How We Use Your Information',
      body: [
        {
          type: 'paragraph',
          text: 'We use personal information to:',
        },
        {
          type: 'list',
          items: [
            'Provide, maintain, and secure the service and your account.',
            'Enable core features such as Spaces, the feed, and messaging.',
            'Personalize your experience and recommend relevant content.',
            'Communicate with you about updates, security, and support.',
            'Detect, prevent, and respond to fraud, abuse, and violations of our Terms.',
            'Comply with legal obligations and enforce our agreements.',
          ],
        },
      ],
    },
    {
      id: 'legal-bases',
      heading: '4. Legal Bases for Processing (GDPR)',
      body: [
        {
          type: 'paragraph',
          text: 'If you are in the European Economic Area or the United Kingdom, we process your personal information on the following legal bases: performance of our contract with you, our legitimate interests in operating and improving the service, your consent where required, and compliance with legal obligations.',
        },
      ],
    },
    {
      id: 'how-we-share',
      heading: '5. How We Share Information',
      body: [
        {
          type: 'paragraph',
          text: 'We do not sell your personal information. We share it only as described below:',
        },
        {
          type: 'list',
          items: [
            'With other members: content you post or broadcast in Spaces is visible or audible to participants.',
            'With service providers who process data on our behalf under contract (for example, hosting and audio delivery).',
            'For legal reasons, such as complying with a lawful request or protecting rights and safety.',
            'In a business transfer, such as a merger or acquisition, subject to this policy.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      heading: '6. Cookies and Tracking',
      body: [
        {
          type: 'paragraph',
          text: 'We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the service is used. You can control cookies through your browser settings, though some features may not work without them.',
        },
      ],
    },
    {
      id: 'data-retention',
      heading: '7. Data Retention',
      body: [
        {
          type: 'paragraph',
          text: 'We retain personal information for as long as your account is active or as needed to provide the service, and thereafter as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we delete or anonymize it.',
        },
      ],
    },
    {
      id: 'data-security',
      heading: '8. Data Security',
      body: [
        {
          type: 'paragraph',
          text: 'We use technical and organizational measures such as encryption in transit, access controls, and monitoring to protect your information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
        },
      ],
    },
    {
      id: 'your-rights',
      heading: '9. Your Rights and Choices',
      body: [
        {
          type: 'paragraph',
          text: 'Depending on where you live, you may have the right to:',
        },
        {
          type: 'list',
          items: [
            'Access, correct, or delete the personal information we hold about you.',
            'Object to or restrict certain processing, and withdraw consent.',
            'Request a portable copy of your data.',
            'Opt out of the sale or sharing of personal information (we do not sell it).',
            'Lodge a complaint with your local data protection authority.',
          ],
        },
        {
          type: 'paragraph',
          text: `To exercise these rights, contact us at ${PRIVACY_EMAIL}. We will not discriminate against you for exercising them.`,
        },
      ],
    },
    {
      id: 'international-transfers',
      heading: '10. International Data Transfers',
      body: [
        {
          type: 'paragraph',
          text: 'We may process and store information in countries other than your own. Where we transfer personal information across borders, we use appropriate safeguards such as standard contractual clauses to protect it.',
        },
      ],
    },
    {
      id: 'childrens-privacy',
      heading: "11. Children's Privacy",
      body: [
        {
          type: 'paragraph',
          text: 'The service is not directed to children under the minimum age described in our Terms of Service, and we do not knowingly collect personal information from them. If you believe a child has provided us with personal information, please contact us so we can delete it.',
        },
      ],
    },
    {
      id: 'changes',
      heading: '12. Changes to This Policy',
      body: [
        {
          type: 'paragraph',
          text: 'We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last updated" date above and, where appropriate, provide additional notice.',
        },
      ],
    },
    {
      id: 'contact',
      heading: '13. Contact Us',
      body: [
        {
          type: 'paragraph',
          text: `If you have questions or requests regarding this Privacy Policy or your personal information, contact our privacy team at ${PRIVACY_EMAIL}.`,
        },
      ],
    },
  ],
}

export const LEGAL_DOCUMENTS = {
  terms: TERMS_DOCUMENT,
  privacy: PRIVACY_DOCUMENT,
} as const
