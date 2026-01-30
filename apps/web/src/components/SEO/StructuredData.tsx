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

    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
