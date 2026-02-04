import React from 'react';
import { LanguageCode } from '../types';

interface PartnersPageProps {
    lang: LanguageCode;
}

export const PartnersPage = ({ lang }: PartnersPageProps) => {
    const t = {
        en: {
            title: "Partner Information",
            subtitle: "The Team",
            learnmera: {
                name: "Learnmera / Finland",
                description: "Learnmera is a private language education and translation provider located in the greater Helsinki area. They offer a variety of services, including language instruction, translation, marketing, and educational resource development. Learnmera is dedicated to fostering communication and understanding in an increasingly interconnected world by facilitating interaction between people in a global, multi-cultural society.",
                services: [
                    {
                        title: "Language instruction",
                        content: "Provides business language lessons in major Nordic and European languages, as well as beginner's courses in English, Finnish, and, Swedish."
                    },
                    {
                        title: "Translation and marketing services",
                        content: "Leverages its language expertise to help businesses and organizations communicate effectively with diverse audiences."
                    },
                    {
                        title: "Educational resource creation",
                        content: "They have considerable experience creating educational and cultural resources, including materials for language learning and other courses."
                    },
                    {
                        title: "Website and app development",
                        content: "Develops websites, web portals, benchmarking tools, games and mobile applications to support language learning and facilitate communication across cultures."
                    },
                    {
                        title: "IT services",
                        content: "Provides social media management services, for corporate clients and institutions seeking to enhance their customer interfaces and social media presence."
                    },
                    {
                        title: "Support for migrants",
                        content: "Assists migrants with various needs outside the classroom, including work, housing, and cultural issues."
                    }
                ],
                trackRecord: "They have a strong track record of involvement in EU and domestic projects, with staff having worked on over 60 such projects. They also manage an online platform, The Language Menu, which boasts a member base of around 35,000 teachers worldwide."
            },
            bcreative: {
                name: "B-Creative / Sweden",
                intro: "B-Creative is an association that are developing courses, event, workshops in different topics such as language learning, virtual travelling, education concepts and cultural concepts. B-Creative have a large network in Sweden and in Europe with NGOs, education organisations and associations.",
                staff: "The staff in B-Creative have experience of European projects, development of education material, marketing, networking and focus on the individual are central values for us.",
                work: "The staff are working with development of education material for different target groups such as culture education, entrepreneur skills, ICT education, social inclusion.",
                experience: "B-Creative staff have been involved in EU-projects that focus on lifelong learning, social exclusion, gender mainstreaming, disability, liberal education, entrepreneur skills, aspects within vocational training for adults and disadvantaged group. Also, good cooperation with Migrant associations and Senior associations and experience of development of activities and material for migrants and the elderly generation."
            }
        },
        fi: {
            title: "Kumppanitiedot",
            subtitle: "Tiimimme",
            learnmera: {
                name: "Learnmera / Suomi",
                description: "Learnmera on yksityinen, pääkaupunkiseudulla sijaitseva kielikoulutuksen ja käännöspalveluiden tarjoaja. Learnmera tarjoaa erilaisia palveluja kieltenopetuksesta kääntämiseen, markkinointia ja opetusresurssien kehittämistä. Se on omistautunut edistämään viestintää ja ymmärrystä yhä verkottuneemmassa maailmassa helpottamalla ihmisten välistä vuorovaikutusta globaalissa, monikulttuurisessa yhteiskunnassa.",
                services: [
                    {
                        title: "Kieltenopetus",
                        content: "Tarjoaa liike-elämän kieltenopetusta tärkeimmissä pohjoismaisissa ja eurooppalaisissa kielissä sekä englannin, suomen ja ruotsin alkeiskursseja."
                    },
                    {
                        title: "Käännös- ja markkinointipalvelut",
                        content: "Yrityksille ja organisaatioille kohdennetut kielikoulutus -ja käännöspalvelut viestinnän tehostamiseen erilaisille yleisöille."
                    },
                    {
                        title: "Koulutusresurssien luominen",
                        content: "Heillä on laaja kokemus koulutus- ja kulttuuriresurssien luomisesta, mukaan lukien kielten oppimisen ja muiden kurssien materiaalit."
                    },
                    {
                        title: "Verkkosivujen ja sovellusten kehittäminen",
                        content: "Learnmera kehittää verkkosivustoja, verkkoportaaleja, vertailuanalyysityökaluja, pelejä ja mobiilisovelluksia, jotka tukevat kielten oppimista ja helpottavat kulttuurien välistä viestintää."
                    },
                    {
                        title: "IT-palvelut",
                        content: "Tarjoaa sosiaalisen median hallintapalveluja yritysasiakkaille ja organisaatioille, jotka haluavat parantaa asiakasrajapintojaan ja sosiaalisen median läsnäoloaan."
                    },
                    {
                        title: "Tuki maahanmuuttajille",
                        content: "Auttaa maahanmuuttajia erilaisissa tarpeissa luokkahuoneen ulkopuolella, kuten työ-, asumis- ja kulttuurikysymyksissä."
                    }
                ],
                trackRecord: "Henkilöstö on osallistunut useaan EU:n ja kotimaan hankkeeseen ja se on yhteensä työskennellyt yli 60 kansainvälisessä ja kotimaisessa hankkeessa. Learnmera hallinnoi myös The Language Menu -verkkoyläustaa, jonka jäseninä on noin 35 000 opettajaa ympäri maailmaa."
            },
            bcreative: {
                name: "B-Creative / Ruotsi",
                intro: "B-Creative on yhdistys, joka kehittää kursseja, tapahtumia ja työpajoja eri aiheista, kuten kielten oppimisesta, virtuaalimatkailusta, koulutuskonsepteista ja kulttuurikonsepteista. B-Creativella on laaja verkosto Ruotsissa ja Euroopassa, johon kuuluu kansalaisjärjestöjä, koulutusorganisaatioita ja yhdistyksiä.",
                staff: "B-Creativen henkilökunnalla on kokemusta eurooppalaisista hankkeista, koulutusmateriaalin kehittämisestä, markkinoinnista ja verkostoitumisesta, ja yksilöllisyys on meille keskeinen arvo.",
                work: "Henkilökunta kehittää koulutusmateriaalia eri kohderyhmille, kuten kulttuurikasvatus, yrittäjyystaidot, ICT-koulutus ja sosiaalinen osallisuus.",
                experience: "B-Creativen henkilökunta on ollut mukana EU-hankkeissa, jotka keskittyvät elinikäiseen oppimiseen, sosiaaliseen syrjäytymiseen, sukupuolten tasa-arvoon, vammaisuuteen, liberaalikoulutukseen, yrittäjyystaitoihin sekä aikuisten ja heikommassa asemassa olevien ryhmien ammatilliseen koulutukseen. Lisäksi se tekee hyvää yhteistyötä maahanmuuttajärjestöjen ja seniorijärjestöjen kanssa ja sillä on kokemusta maahanmuuttajille ja vanhemmalle sukupolvelle suunnattujen aktiviteettien ja materiaalien kehittämisestä."
            }
        },
        sv: {
            title: "Partnerinformation",
            subtitle: "Vårt team",
            learnmera: {
                name: "Learnmera / Finland",
                description: "Learnmera är en privat språkutbildnings- och översättningsleverantör som ligger i Helsingforsregionen. De erbjuder en mängd olika tjänster, bland annat språkundervisning, översättning, marknadsföring och utveckling av utbildningsresurser. Learnmera arbetar för att främja kommunikation och förståelse i en alltmer sammankopplad värld genom att underlätta interaktion mellan människor i ett globalt, mångkulturellt samhälle.",
                services: [
                    {
                        title: "Språkundervisning",
                        content: "Erbjuder språklektioner för företag i de viktigaste nordiska och europeiska språken samt nybörjarkurser i engelska, finska och svenska."
                    },
                    {
                        title: "Översättnings- och marknadsföringstjänster",
                        content: "Utnyttjar sin språkexpertis för att hjälpa företag och organisationer att kommunicera effektivt med olika målgrupper."
                    },
                    {
                        title: "Skapande av utbildningsresurser",
                        content: "De har stor erfarenhet av att skapa utbildnings- och kulturresurser, inklusive material för språkinlärning och andra kurser."
                    },
                    {
                        title: "Webbplats- och apputveckling",
                        content: "Utvecklar webbplatser, webbportaler, benchmarkingverktyg, spel och mobila applikationer för att stödja språkinlärning och underlätta kommunikation mellan olika kulturer."
                    },
                    {
                        title: "IT-tjänster",
                        content: "Tillhandahåller tjänster för hantering av sociala medier för företagskunder och institutioner som vill förbättra sina kundgränssnitt och sin närvaro i sociala medier."
                    },
                    {
                        title: "Stöd till migranter",
                        content: "Hjälper migranter med olika behov utanför klassrummet, t.ex. arbete, bostad och kulturella frågor."
                    }
                ],
                trackRecord: "De har en gedigen erfarenhet av att delta i EU-projekt och nationella projekt, och deras personal har arbetat med över 60 sådana projekt. De förvaltar också en onlineplattform, The Language Menu, som har en medlemsbas på cirka 35 000 lärare över hela världen."
            },
            bcreative: {
                name: "B-Creative / Sverige",
                intro: "B-Creative är en förening som utvecklar kurser, evenemang och workshops inom olika ämnen, såsom språkinlärning, virtuella resor, utbildningskoncept och kulturella koncept. B-Creative har ett stort nätverk i Sverige och Europa med icke-statliga organisationer, utbildningsorganisationer och föreningar.",
                staff: "Personalen på B-Creative har erfarenhet av europeiska projekt, utveckling av utbildningsmaterial, marknadsföring och nätverkande, och fokus på individen är en central värdering för oss.",
                work: "Personalen arbetar med utveckling av utbildningsmaterial för olika målgrupper, såsom kulturutbildning, entreprenörskap, IT-utbildning och social inkludering.",
                experience: "B-Creatives personal har varit involverad i EU-projekt som fokuserar på livslångt lärande, social utestängning, jämställdhetsintegrering, funktionsnedsättning, liberal utbildning, entreprenörskap, aspekter inom yrkesutbildning för vuxna och missgynnade grupper. Dessutom har vi ett gott samarbete med invandrarföreningar och seniorföreningar samt erfarenhet av att utveckla aktiviteter och material för invandrare och äldre."
            }
        }
    }[lang];

    return (
        <div className="min-h-screen bg-snow pt-32 pb-24">
            <div className="max-w-[1000px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase bg-primary/5">
                        {t.subtitle}
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight uppercase">
                        {t.title}
                    </h1>
                </div>

                <div className="space-y-24">
                    {/* Learnmera Section */}
                    <section className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-primary/20 rounded-full hidden md:block"></div>
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6 mb-4">
                                <img src="/Learnmera logo FB_no Bkg.png" alt="Learnmera" className="h-16 object-contain" />
                                <div>
                                    <span className="size-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg inline-flex mb-2">1</span>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                                        {t.learnmera.name}
                                    </h2>
                                </div>
                            </div>
                            <div>
                                <p className="text-lg text-slate-600 leading-relaxed font-light mb-8">
                                    {t.learnmera.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {t.learnmera.services.map((service, i) => (
                                    <div key={i} className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                                        <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider group-hover:text-primary transition-colors">{service.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{service.content}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
                                <div className="flex items-start gap-6">
                                    <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-sky">verified</span>
                                    </div>
                                    <p className="text font-medium leading-relaxed opacity-90">
                                        {t.learnmera.trackRecord}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Email</p>
                                        <a href="mailto:veronica@learnmera.com" className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">veronica@learnmera.com</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">phone</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Phone</p>
                                        <p className="text-sm font-bold text-slate-900">+358 45 1695454</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">language</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Website</p>
                                        <a href="https://learnmera.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">learnmera.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* B-Creative Section */}
                    <section className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-primary/20 rounded-full hidden md:block"></div>
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6 mb-4">
                                <img src="/Gemini_Generated_Image_4638o4638o4638o4.png" alt="B-Creative" className="h-16 object-contain" />
                                <div>
                                    <span className="size-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg inline-flex mb-2">2</span>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                                        {t.bcreative.name}
                                    </h2>
                                </div>
                            </div>
                            <div>
                                <p className="text-lg text-slate-600 leading-relaxed font-light mb-8">
                                    {t.bcreative.intro}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="size-8 rounded-lg bg-sky/20 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-sm">groups</span>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed">{t.bcreative.staff}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="size-8 rounded-lg bg-sky/20 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-sm">auto_stories</span>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed">{t.bcreative.work}</p>
                                    </div>
                                </div>
                                <div className="p-8 bg-frost rounded-[2rem] border border-sky/20">
                                    <p className="text-sm text-slate-700 leading-loose italic">
                                        {t.bcreative.experience}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
