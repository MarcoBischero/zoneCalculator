export default function StructuredData() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ZoneCalculator PRO',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
        },
        author: {
            '@type': 'Organization',
            name: 'ZoneCalculator PRO Team',
            url: 'https://zonecalcpro.web.app',
        },
        description: 'Il tuo assistente personale per la dieta a zona. Calcolo blocchi automatico, tracking pasti e coach AI.',
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
