export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PARSTAMA - PMR SMKN 1 Singosari",
    alternateName: "PARSTAMA",
    url: "https://parstama.my.id",
    logo: "https://parstama.my.id/parstama_logo.png",
    description: "Palang Merah Remaja atau PARSTAMA adalah organisasi kepemudaan yang berfokus pada kemanusiaan, pertolongan pertama, dan pengembangan karakter siswa di SMKN 1 Singosari.",
    foundingDate: "2014",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Singosari",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-814-5914-5800",
      contactType: "customer service",
      availableLanguage: "Indonesian",
    },
    sameAs: [],
    keywords: ["PMR", "Palang Merah Remaja", "PARSTAMA", "SMKN 1 Singosari", "kemanusiaan", "pertolongan pertama", "organisasi siswa"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
