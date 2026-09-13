export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU'

export type DigitalPresenceBrief = {
  businessName: string
  industry: string
  market: string
  language?: string
  services: string[]
  goals: string[]
}

export type KeywordIdea = {
  keyword: string
  funnelStage: FunnelStage
  intent: 'Informational' | 'Commercial' | 'Transactional'
}

export type SocialProfile = {
  channel: string
  suggestedHandle: string
  bio: string
  status: 'suggested' | 'connected'
}

export function generateKeywordIdeas(brief: DigitalPresenceBrief): KeywordIdea[] {
  const location = brief.market || 'Indonesia'
  const core = brief.industry.toLowerCase()
  return [
    { keyword: `${core} ${location}`, funnelStage: 'TOFU', intent: 'Informational' },
    { keyword: `inspirasi ${core}`, funnelStage: 'TOFU', intent: 'Informational' },
    { keyword: `tips memilih ${core}`, funnelStage: 'TOFU', intent: 'Informational' },
    { keyword: `jasa ${core} ${location}`, funnelStage: 'MOFU', intent: 'Commercial' },
    { keyword: `jasa ${core} terbaik ${location}`, funnelStage: 'MOFU', intent: 'Commercial' },
    { keyword: `custom ${core} ${location}`, funnelStage: 'MOFU', intent: 'Commercial' },
    { keyword: `konsultasi ${core} ${location}`, funnelStage: 'BOFU', intent: 'Transactional' },
    { keyword: `harga jasa ${core} ${location}`, funnelStage: 'BOFU', intent: 'Transactional' },
    { keyword: `vendor ${core} ${location}`, funnelStage: 'BOFU', intent: 'Commercial' },
    { keyword: `pesan ${core} ${location}`, funnelStage: 'BOFU', intent: 'Transactional' },
  ]
}

export function generateSocialProfiles(brief: DigitalPresenceBrief): SocialProfile[] {
  const handleBase = brief.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return [
    { channel: 'Instagram', suggestedHandle: `@${handleBase}.id`, bio: `${brief.industry}. ${brief.goals[0] || 'Solusi profesional untuk kebutuhan Anda.'}`, status: 'suggested' },
    { channel: 'Facebook', suggestedHandle: brief.businessName, bio: `${brief.businessName} · ${brief.industry} · ${brief.market}`, status: 'suggested' },
    { channel: 'TikTok', suggestedHandle: `@${handleBase}id`, bio: `${brief.industry} · tips, proses, inspirasi`, status: 'suggested' },
    { channel: 'Pinterest', suggestedHandle: brief.businessName, bio: `Inspirasi ${brief.industry} dan referensi proyek.`, status: 'suggested' },
    { channel: 'YouTube', suggestedHandle: brief.businessName, bio: `Edukasi dan cerita di balik ${brief.industry}.`, status: 'suggested' },
  ]
}

export function generateHowToSchema(topic: string) {
  const steps = [
    ['Tentukan target audience', 'Identifikasi siapa yang paling membutuhkan informasi tentang topik ini.'],
    ['Pilih topik', `Pilih topik yang relevan dengan kebutuhan audience: ${topic}.`],
    ['Research keywords', 'Kelompokkan keyword berdasarkan intent dan funnel stage.'],
    ['Susun outline', 'Buat struktur yang menjawab pertanyaan utama secara bertahap.'],
    ['Buat konten', 'Tulis konten yang original, bermanfaat, mudah dipindai, dan sesuai intent.'],
    ['Review SEO', 'Periksa title, heading, internal links, metadata, schema, dan kualitas informasi.'],
    ['Publish dan monitor', 'Publikasikan melalui channel yang diotorisasi lalu pantau performa.'],
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Cara membuat konten SEO untuk ${topic}`,
    step: steps.map(([name, text], index) => ({ '@type': 'HowToStep', position: index + 1, name, text })),
  }
}

export function buildDigitalPresenceManifest(brief: DigitalPresenceBrief) {
  return {
    schemaVersion: '1.0',
    brief,
    keywordIdeas: generateKeywordIdeas(brief),
    socialProfiles: generateSocialProfiles(brief),
    howToSchema: generateHowToSchema(brief.industry),
    automation: {
      research: 'provider_required',
      accountCreation: 'authorization_required',
      publishing: 'connector_required',
      defaultMode: 'semi_auto',
    },
  }
}
