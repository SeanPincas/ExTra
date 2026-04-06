export type LegalDocumentKey = "privacy" | "terms"

interface LegalDocumentSection {
    heading: string
    body: string[]
}

interface LegalDocument {
    title: string
    updatedAt: string
    intro: string
    sections: LegalDocumentSection[]
}

export const legalDocuments: Record<LegalDocumentKey, LegalDocument> = {
    privacy: {
        title: "Data Privacy Policy",
        updatedAt: "April 7, 2026",
        intro:
            "This Privacy Policy explains how ExTra collects, uses, stores, and protects personal data in line with the Data Privacy Act of 2012 (Republic Act No. 10173) and its core principles of transparency, legitimate purpose, proportionality, and security.",
        sections: [
            {
                heading: "Information We Collect",
                body: [
                    "ExTra may collect your name, email address, login credentials, finance entries, reminders, dashboard preferences, and limited usage data needed to operate the platform.",
                    "We collect only the personal and financial information that is reasonably necessary to create your account, provide expense tracking features, and support the ExTra experience.",
                ],
            },
            {
                heading: "Purpose of Collection and Use",
                body: [
                    "Your data is used for account creation, authentication, finance tracking, reminders, notifications such as payday-related prompts, and product improvements that support legitimate platform operations.",
                    "ExTra does not collect personal data for unrelated purposes, and personal finance information is not intended to be sold or used for advertising.",
                ],
            },
            {
                heading: "Data Protection and Security",
                body: [
                    "ExTra uses reasonable organizational and technical measures such as protected backend routes, authentication controls, request validation, and secure handling of stored data to reduce unauthorized access and misuse.",
                    "While no online system can guarantee absolute security, ExTra is designed to maintain the confidentiality and integrity of user information through responsible system safeguards.",
                ],
            },
            {
                heading: "Data Sharing and Retention",
                body: [
                    "As a general rule, ExTra does not share personal data with unrelated third parties except when reasonably required for lawful operation, legal compliance, or security response.",
                    "Personal data should not be retained longer than necessary for the purpose it was collected, subject to legitimate legal, operational, or security requirements.",
                ],
            },
            {
                heading: "Your Rights as a Data Subject",
                body: [
                    "Users may request access to their data, correction of inaccurate information, deletion or removal where applicable, withdrawal of consent, and the ability to raise privacy-related concerns or complaints.",
                    "These rights reflect the protections granted to data subjects under Philippine data privacy law and should be respected by the system as account management capabilities expand.",
                ],
            },
        ],
    },
    terms: {
        title: "Terms and Conditions",
        updatedAt: "April 7, 2026",
        intro:
            "These Terms and Conditions define the rules for using ExTra as a personal expense tracking and finance dashboard platform and help protect both the user and the system.",
        sections: [
            {
                heading: "Acceptance of Terms",
                body: [
                    "By creating an account, logging in, or continuing to use ExTra, you acknowledge that you have read and accepted these Terms and Conditions.",
                    "If you do not agree with these terms, you should not continue using the platform.",
                ],
            },
            {
                heading: "Proper Use of the Platform",
                body: [
                    "ExTra must only be used for lawful, proper, and responsible account and finance tracking activity.",
                    "Users must not misuse the service, submit false or misleading information, attempt to bypass security, or interfere with the stability and intended purpose of the platform.",
                ],
            },
            {
                heading: "Account Responsibility",
                body: [
                    "Users are responsible for keeping their login credentials secure and for activity performed under their account.",
                    "If account misuse, unauthorized access, or suspicious activity is suspected, users should stop using the session and seek account support once account recovery tools are available.",
                ],
            },
            {
                heading: "Financial Disclaimer",
                body: [
                    "ExTra is not a financial advisor, investment platform, tax consultant, or legal advisor.",
                    "The system provides tracking, reminders, and dashboard tools only, and does not guarantee financial outcomes, savings performance, or decision accuracy.",
                ],
            },
            {
                heading: "Limitation of Liability",
                body: [
                    "ExTra is not responsible for financial loss, user error, incorrect interpretation of records, or misuse of the platform beyond what is required by applicable law.",
                    "Users remain responsible for how they use the system and for decisions made using their own financial data.",
                ],
            },
            {
                heading: "Suspension, Termination, and Updates",
                body: [
                    "Accounts may be limited, suspended, or terminated for misuse, abuse, security risks, or violation of platform rules.",
                    "These terms may be updated over time, and continued use of ExTra after updates may be treated as acceptance of the revised terms with appropriate notice.",
                ],
            },
        ],
    },
}
