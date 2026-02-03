import Script from 'next/script';

export function GlobalStructuredData() {
    const data = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Tingle Talk",
        "url": "https://tingletalk.com",
        "description": "Tingle Talk is the #1 anonymous dating site and private chatting platform. Meet new people, find a date, or just have fun with instant random chatting. 100% safe, secure, and private.",
        "applicationCategory": "SocialNetworkingApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": [
            "Anonymous Dating",
            "Private Chatting Site",
            "Random Matching",
            "Safe and Secure Messaging",
            "No Registration Required",
            "Anonymous Messaging",
            "Global Connections"
        ],
        "keywords": "anonymous dating, private chatting site, tingletalk, tingle talk, free dating, random chat"
    };

    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Tingle Talk",
        "url": "https://tingletalk.com",
        "logo": "https://tingletalk.com/assets/logo.png",
        "sameAs": [
            "https://twitter.com/tingletalk"
        ]
    };

    const websiteData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Tingle Talk",
        "url": "https://tingletalk.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://tingletalk.com/?s={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
            />
            <Script
                id="org-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
            />
            <Script
                id="website-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
            />
        </>
    );
}

export function FAQStructuredData() {
    const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is the best anonymous dating site?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Tingle Talk is widely considered the best anonymous dating site due to its focus on privacy, security, and instant connections without requiring any sign-up or personal information."
                }
            },
            {
                "@type": "Question",
                "name": "Is Tingle Talk really a private chatting site?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Tingle Talk is designed as a fully private chatting site. We don't store your IP address, real name, or personal data. Each session is unique and temporary, ensuring 100% anonymity."
                }
            },
            {
                "@type": "Question",
                "name": "Do I need to create an account for this dating site?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Never. Tingle Talk is built for speed and privacy. No sign-up, no email verification, and no passwords required. Just choose a nickname and start chatting."
                }
            },
            {
                "@type": "Question",
                "name": "Is it safe to use an anonymous dating site like Tingle Talk?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Safety is our top priority. Tingle Talk uses advanced AI moderation to block malicious content and harmful users, and provides instant reporting and blocking tools for all users."
                }
            }
        ]
    };

    return (
        <Script
            id="faq-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
        />
    );
}

export default function StructuredData() {
    return (
        <>
            <GlobalStructuredData />
            <FAQStructuredData />
        </>
    );
}
