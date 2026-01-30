import Script from 'next/script';

export default function StructuredData() {
    const data = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Tingle Talk",
        "url": "https://tingletalk.com",
        "description": "Anonymous dating and random chatting platform. Meet new people instantly and safely.",
        "applicationCategory": "SocialNetworkingApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": [
            "Anonymous Chatting",
            "Random Matching",
            "Safe and Secure Messaging",
            "No Registration Required"
        ]
    };

    const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Is Tingle Talk really anonymous?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. We don't store your IP address, your real name, or your personal data. Each session is unique and temporary."
                }
            },
            {
                "@type": "Question",
                "name": "Do I need to create an account?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Never. Tingle Talk is built for speed. No sign-up, no email verification, and no passwords required."
                }
            },
            {
                "@type": "Question",
                "name": "Is it safe to chat with strangers?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Safety is our priority. We use AI moderation to block malicious content, and you can report or block users instantly."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use Tingle Talk on my phone?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely! Tingle Talk is a Progressive Web App (PWA). You can install it on iOS or Android directly from the browser."
                }
            }
        ]
    };

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
            />
            <Script
                id="faq-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
            />
        </>
    );
}
