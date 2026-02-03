import { Sauna, Country } from './types';

export const SAUNAS: Sauna[] = [
  {
    sauna_id: '1',
    coordinates: { lat: 60.1583, lng: 24.9333 },
    metadata: {
      country: Country.FINLAND,
      region: 'Helsinki',
      type: 'Urban Public'
    },
    content: {
      sv: {
        name: 'Löyly Helsinki',
        description: 'Ett arkitektoniskt mästerverk vid Helsingfors strandkant.',
        etiquette: 'Dusch före inträde. Baddräkt krävs i den allmänna bastun. Använd "pefletti" (sittunderlag) på bänkarna.'
      },
      fi: {
        name: 'Löyly Helsinki',
        description: 'Arkkitehtoninen mestariteos Helsingin rannalla.',
        etiquette: 'Käy suihkussa ennen saunaa. Uimapuku on pakollinen yleisessä saunassa. Käytä peflettiä lauteilla.'
      },
      en: {
        name: 'Löyly Helsinki',
        description: 'An architectural masterpiece on the Helsinki waterfront.',
        etiquette: 'Shower before entering. Swimsuits are required in the public mixed sauna. Use a "pefletti" (seat cover) on the benches.'
      }
    },
    media: {
      featured_image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070',
      images: [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070',
        'https://images.unsplash.com/photo-1596230502424-aa6174571d1b?q=80&w=2031'
      ],
      audio_interviews: [
        {
          title: 'The Architecture of Löyly',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          speaker: 'Antero Vartia',
          duration: '04:15',
          description: 'A discussion about the sustainable design and wooden structure of the facility.'
        }
      ],
      video_clips: [
        {
          title: 'Morning Dip at Löyly',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-winter-forest-on-a-sunny-day-631-large.mp4',
          description: 'Slow motion capture of a winter swim after the sauna.'
        }
      ]
    },
    contact: {
      website: 'https://www.loylyhelsinki.fi',
      address: 'Hernesaari, Helsinki'
    }
  },
  {
    sauna_id: '2',
    coordinates: { lat: 61.5033, lng: 23.7333 },
    metadata: {
      country: Country.FINLAND,
      region: 'Tampere',
      type: 'Wood-Fired'
    },
    content: {
      sv: {
        name: 'Rajaportti Bastu',
        description: 'Finlands äldsta fortfarande fungerande allmänna bastu.',
        etiquette: 'Tystnad är guld i bastun. Separata avdelningar för män och kvinnor. Ta med egen björkris (vihta).'
      },
      fi: {
        name: 'Rajaportin Sauna',
        description: 'Suomen vanhin edelleen toimiva yleinen sauna.',
        etiquette: 'Hiljaisuus on kultaa löylyhuoneessa. Erilliset puolet miehille ja naisille. Tuo oma vihta.'
      },
      en: {
        name: 'Rajaportti Sauna',
        description: 'The oldest still functioning public sauna in Finland.',
        etiquette: 'Silence is golden in the steam room. Separate sides for men and women. Bring your own birch whisk (vihta).'
      }
    },
    media: {
      images: ['https://images.unsplash.com/photo-1549416801-667793d92004?q=80&w=2073'],
      audio_interviews: [],
      video_clips: []
    },
    contact: {
      website: 'https://www.rajaportinsauna.fi',
      address: 'Pispala, Tampere'
    }
  },
  {
    sauna_id: '3',
    coordinates: { lat: 55.6050, lng: 12.9640 },
    metadata: {
      country: Country.SWEDEN,
      region: 'Skåne',
      type: 'Ice Bath'
    },
    content: {
      sv: {
        name: 'Ribersborgs Kallbadhus',
        description: 'Historiskt kallbadhus i Malmö från 1898.',
        etiquette: 'Nakenhet är obligatorisk i bastun. Respektera de könsindelade zonerna.'
      },
      fi: {
        name: 'Ribersborgin kylpylä',
        description: 'Historiallinen avokylpylä Malmössä vuodelta 1898.',
        etiquette: 'Alastomuus on pakollista saunassa. Kunnioita sukupuolijakoa.'
      },
      en: {
        name: 'Ribersborgs Kallbadhus',
        description: 'Historic open-air bath in Malmö dating back to 1898.',
        etiquette: 'Nudity is mandatory in the sauna areas. Respect the gender-segregated zones.'
      }
    },
    media: {
      images: ['https://images.unsplash.com/photo-1583093153531-1804bc5576da?q=80&w=2070'],
      audio_interviews: [],
      video_clips: []
    },
    contact: {
      website: 'https://ribersborgskallbadhus.se',
      address: 'Malmö, Sweden'
    }
  },
  {
    sauna_id: '4',
    coordinates: { lat: 56.0465, lng: 12.6945 },
    metadata: {
      country: Country.SWEDEN,
      region: 'Skåne',
      type: 'Wood-Fired'
    },
    content: {
      sv: {
        name: 'Pålsjö Baden',
        description: 'En juvel vid Helsingborgs kust.',
        etiquette: 'Tvaga dig noga före bad.'
      },
      fi: {
        name: 'Pålsjö Baden',
        description: 'Helsingborgin rannikon helmi.',
        etiquette: 'Peseydy huolellisesti ennen saunaa.'
      },
      en: {
        name: 'Pålsjö Baden',
        description: 'A jewel on the coast of Helsingborg.',
        etiquette: 'Wash thoroughly before bathing.'
      }
    },
    media: {
      images: ['https://images.unsplash.com/photo-1600585154340-be61912e3318?q=80&w=2070'],
      audio_interviews: [],
      video_clips: []
    },
    contact: {
      website: 'https://palsjobaden.se',
      address: 'Helsingborg, Sweden'
    }
  },
  {
    sauna_id: '5',
    coordinates: { lat: 60.1667, lng: 24.9667 },
    metadata: {
      country: Country.FINLAND,
      region: 'Helsinki',
      type: 'Savusauna'
    },
    content: {
      sv: {
        name: 'Sompasauna',
        description: 'En folkdriven rökbastu i hjärtat av Helsingfors.',
        etiquette: 'Alla är välkomna. Ingen personal, bara gemenskap.'
      },
      fi: {
        name: 'Sompasauna',
        description: 'Kansan vetämä savusauna Helsingin sydämessä.',
        etiquette: 'Kaikki ovat tervetulleita. Ei työntekijöitä, vain yhteisö.'
      },
      en: {
        name: 'Sompasauna',
        description: 'A community-driven public sauna in the heart of Helsinki.',
        etiquette: 'Everyone is welcome. No staff, only community.'
      }
    },
    media: {
      images: ['https://images.unsplash.com/photo-1549416801-667793d92004?q=80&w=2073'],
      audio_interviews: [],
      video_clips: []
    },
    contact: {
      website: 'https://sompasauna.fi',
      address: 'Verkkosaari, Helsinki'
    }
  },
  {
    sauna_id: '6',
    coordinates: { lat: 56.1612, lng: 15.5869 },
    metadata: {
      country: Country.SWEDEN,
      region: 'Blekinge',
      type: 'Urban Public'
    },
    content: {
      sv: {
        name: 'Karlskrona Kallbadhus',
        description: 'Klassiskt badhus i Blekinge skärgård.',
        etiquette: 'Följ lokala anvisningar för bastubruk.'
      },
      fi: {
        name: 'Karlskronan kylpylä',
        description: 'Klassinen kylpylä Blekingen saaristossa.',
        etiquette: 'Noudata paikallisia saunomisohjeita.'
      },
      en: {
        name: 'Karlskrona Kallbadhus',
        description: 'Classic bathhouse in the Blekinge archipelago.',
        etiquette: 'Follow local instructions for sauna use.'
      }
    },
    media: {
      images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070'],
      audio_interviews: [],
      video_clips: []
    },
    contact: {
      website: 'https://karlskrona.se',
      address: 'Karlskrona, Sweden'
    }
  },
  {
    sauna_id: '7',
    coordinates: { lat: 60.1658, lng: 24.9431 },
    metadata: {
      country: Country.FINLAND,
      region: 'Helsinki',
      type: 'Electric'
    },
    content: {
      sv: { name: 'Allas Sea Pool', description: 'Simning och bastu mitt i centrala Helsingfors.', etiquette: 'Dusch krävs.' },
      fi: { name: 'Allas Sea Pool', description: 'Uimista ja saunomista Helsingin ytimessä.', etiquette: 'Käy suihkussa.' },
      en: { name: 'Allas Sea Pool', description: 'Swimming and sauna in the heart of Helsinki.', etiquette: 'Showering is required.' }
    },
    media: { images: ['https://images.unsplash.com/photo-1549416801-667793d92004?q=80&w=2073'], audio_interviews: [], video_clips: [] },
    contact: { website: 'https://allasseapool.fi', address: 'Market Square, Helsinki' }
  },
  {
    sauna_id: '8',
    coordinates: { lat: 59.3293, lng: 18.0686 },
    metadata: {
      country: Country.SWEDEN,
      region: 'Stockholm',
      type: 'Floating'
    },
    content: {
      sv: { name: 'Centralbadet', description: 'En jugendpärla för hälsa och välbefinnande.', etiquette: 'Njut av lugnet.' },
      fi: { name: 'Centralbadet', description: 'Jugend-helmi terveydelle ja hyvinvoinnille.', etiquette: 'Nauti rauhasta.' },
      en: { name: 'Centralbadet', description: 'An Art Nouveau gem for health and well-being.', etiquette: 'Enjoy the tranquility.' }
    },
    media: { images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070'], audio_interviews: [], video_clips: [] },
    contact: { website: 'https://centralbadet.se', address: 'Stockholm, Sweden' }
  },
  {
    sauna_id: '9',
    coordinates: { lat: 68.3495, lng: 18.8312 },
    metadata: {
      country: Country.SWEDEN,
      region: 'Lapland',
      type: 'Wood-Fired'
    },
    content: {
      sv: { name: 'Abisko Bastu', description: 'Bastu under norrskenet.', etiquette: 'Vid norrsken, titta ut.' },
      fi: { name: 'Abiskon sauna', description: 'Sauna revontulten alla.', etiquette: 'Revontulten aikaan katso ulos.' },
      en: { name: 'Abisko Sauna', description: 'Sauna under the Northern Lights.', etiquette: 'Watch for the Aurora.' }
    },
    media: { images: ['https://images.unsplash.com/photo-1596230502424-aa6174571d1b?q=80&w=2031'], audio_interviews: [], video_clips: [] },
    contact: { website: 'https://abisko.se', address: 'Abisko, Sweden' }
  }
];