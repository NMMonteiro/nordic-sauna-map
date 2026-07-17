import { LanguageCode } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Globe, Mail, Phone, ExternalLink, ShieldCheck, PlusCircle } from 'lucide-react';

interface PartnersPageProps {
    lang: LanguageCode;
}

export const PartnersPage = ({ lang }: PartnersPageProps) => {
    const t = {
        en: {
            title: "Our Network",
            subtitle: "Project Consortium",
            learnmera: {
                name: "Learnmera / Finland",
                description: "Learnmera is a private language education and translation provider located in the greater Helsinki area. They offer a variety of services, including language instruction, translation, marketing, and educational resource development. Learnmera is dedicated to fostering communication and understanding in an increasingly interconnected world by facilitating interaction between people in a global, multi-cultural society.",
                services: [
                    { title: "Language Instruction", content: "Provides business language lessons in major Nordic and European languages, as well as beginner's courses in English, Finnish, and Swedish." },
                    { title: "Translation & Marketing", content: "Leverages its language expertise to help businesses and organizations communicate effectively with diverse audiences." },
                    { title: "Educational Resources", content: "They have considerable experience creating educational and cultural resources, including materials for language learning and other courses." },
                    { title: "Digital Solutions", content: "Develops websites, web portals, benchmarking tools, games and mobile applications to support language learning and facilitate communication across cultures." },
                    { title: "IT Services", content: "Provides social media management services, for corporate clients and institutions seeking to enhance their customer interfaces and social media presence." },
                    { title: "Support for Migrants", content: "Assists migrants with various needs outside the classroom, including work, housing, and cultural issues." }
                ],
                trackRecord: "They have a strong track record of involvement in EU and domestic projects, with staff having worked on over 60 such projects. They also manage an online platform, The Language Menu, which boasts a member base of around 35,000 teachers worldwide."
            },
            bcreative: {
                name: "B-Creative / Sweden",
                intro: "B-Creative is an association that are developing courses, event, workshops in different topics such as language learning, virtual travelling, education concepts and cultural concepts. B-Creative have a large network in Sweden and in Europe with NGOs, education organisations and associations.\n\nThe staff in B- Creative have experience of European projects, development of education material, marketing, networking and focus on the individual are central values for us.\nThe staff are working with development of education material for different target groups such as culture education, entrepreneur skills, ICT education, social inclusion.",
                experience: "B- Creative staff have been involved in EU-projects that focus on lifelong learning, social exclusion, gender mainstreaming, disability, liberal education, entrepreneur skills, aspects within vocational training for adults and disadvantaged group. Also, good cooperation with Migrant associations and Senior associations and experience of development of activities and material for migrants and the elderly generation."
            }
        },
        fi: {
            title: "Kumppanimme",
            subtitle: "Projektin Konsortio",
            learnmera: {
                name: "Learnmera / Suomi",
                description: "Learnmera on yksityinen kielikoulutuksen ja käännöspalveluiden tarjoaja Helsingin seudulla. He tarjoavat monenlaisia palveluita, kuten kielikoulutusta, kääntämistä, markkinointia ja opetusresurssien kehittämistä. Learnmera on omistautunut edistämään viestintää ja ymmärrystä yhä enemmän toisiinsa kytkeytyvässä maailmassa helpottamalla ihmisten välistä vuorovaikutusta globaalissa, monikulttuurisessa yhteiskunnassa.",
                services: [
                    { title: "Kieltenopetus", content: "Tarjoaa liike-elämän kielitunteja tärkeimmissä pohjoismaisissa ja eurooppalaisissa kielissä sekä alkeiskursseja englanniksi, suomeksi ja ruotsiksi." },
                    { title: "Käännöspalvelut", content: "Hyödyntää kieliasiantuntemustaan auttaakseen yrityksiä ja organisaatioita viestimään tehokkaasti moninaisten yleisöjen kanssa." },
                    { title: "Opetusresurssit", content: "Heillä on huomattava kokemus opetus- ja kulttuuriresurssien luomisesta, mukaan lukien materiaalit kieltenopiskeluun ja muihin kursseihin." },
                    { title: "Digitaaliset Ratkaisut", content: "Kehittää verkkosivustoja, verkkoportaaleja, benchmarking-työkaluja, pelejä ja mobiilisovelluksia kieltenopiskelun tueksi ja kulttuurienvälisen viestinnän helpottamiseksi." },
                    { title: "IT-palvelut", content: "Tarjoaa sosiaalisen median hallintavelvollisuuksia yritysasiakkaille ja instituutiolle, jotka haluavat parantaa asiakasrajapintojaan ja sosiaalisen median näkyvyyttään." },
                    { title: "Tuki maahanmuuttajille", content: "Auttaa maahanmuuttajia erilaisissa tarpeissa luokkahuoneen ulkopuolella, mukaan lukien työ, asuminen ja kulttuuriset asiat." }
                ],
                trackRecord: "Heillä on vahva kokemus osallistumisesta EU- ja kotimaisiin hankkeisiin; henkilöstö on työskennellyt yli 60 tällaisessa hankkeessa. He myös hallinnoivat The Language Menu -verkkoalustaa, jolla on noin 35 000 opettajajäsentä maailmanlaajuisesti."
            },
            bcreative: {
                name: "B-Creative / Ruotsi",
                intro: "B-Creative on yhdistys, joka kehittää kursseja, tapahtumia ja työpajoja eri aiheista, kuten kieltenopiskelusta, virtuaalimatkailusta sekä koulutus- ja kulttuurikonsepteista. B-Creativella on laaja verkosto Ruotsissa ja Euroopassa kansalaisjärjestöjen, koulutusorganisaatioiden ja yhdistysten kanssa.\n\nB-Creativen henkilökunnalla on kokemusta eurooppalaisista hankkeista, opetusmateriaalin kehittämisestä, markkinoinnista ja verkostoitumisesta, ja yksilön kohtaaminen on meille keskeinen arvo.\nHenkilökunta työskentelee opetusmateriaalien kehittämiseksi eri kohderyhmille, kuten kulttuurikasvatukseen, yrittäjyystaitoihin, tieto- ja viestintätekniikan opetukseen ja sosiaaliseen osallisuuteen.",
                experience: "B-Creativen henkilökunta on ollut mukana EU-hankkeissa, jotka keskittyvät elinikäiseen oppimiseen, sosiaaliseen syrjäytymiseen, sukupuolten tasa-arvon valtavirtaistamiseen, vammaisuuteen, vapaaseen sivistystyöhön, yrittäjyystaitoihin sekä aikuisten ja heikoimmassa asemassa olevien ryhmien ammatillisen koulutuksen osa-alueisiin. Lisäksi he tekevät hyvää yhteistyötä maahanmuuttajayhdistysten ja senioriyhdistysten kanssa ja heillä on kokemusta toiminnan ja materiaalien kehittämisestä maahanmuuttajille ja ikääntyvälle sukupolvelle."
            }
        },
        sv: {
            title: "Vårt Nätverk",
            subtitle: "Projektkonsortium",
            learnmera: {
                name: "Learnmera / Finland",
                description: "Learnmera är en privat språkutbildnings- och översättningsleverantör belägen i Helsingforsregionen. De erbjuder en mängd olika tjänster, inklusive språkundervisning, översättning, marknadsföring och utveckling av utbildningsresurser. Learnmera är dedikerade till att främja kommunikation och förståelse i en alltmer sammanlänkad värld genom att underlätta interaktion mellan människor i ett globalt, mångkulturellt samhälle.",
                services: [
                    { title: "Språkundervisning", content: "Erbjuder språklektioner för affärslivet i de viktigaste nordiska och europeiska språken, samt nybörjarkurser i engelska, finska och svenska." },
                    { title: "Översättningstjänster", content: "Använder sin språkexpertis för att hjälpa företag och organisationer att kommunicera effektivt med olika målgrupper." },
                    { title: "Utbildningsresurser", content: "De har stor erfarenhet av att skapa utbildnings- och kulturresurser, inklusive material för språkinlärning och andra kurser." },
                    { title: "Digitala Lösningar", content: "Utvecklar webbplatser, webbportaler, benchmarkingverktyg, spel och mobilapplikationer för att stödja språkinlärning och underlätta kommunikation mellan kulturer." },
                    { title: "IT-tjänster", content: "Erbjuder tjänster för hantering av sociala medier för företagskunder och institutioner som vill förbättra sina kundgränssnitt och närvaro i sociala medier." },
                    { title: "Stöd för migranter", content: "Hjälper migranter med olika behov utanför klassrummet, inklusive arbete, bostad och kulturella frågor." }
                ],
                trackRecord: "De har en stark meritlista av engagemang i EU-projekt och nationella projekt, där personalen har arbetat med över 60 sådana projekt. De förvaltar också en onlineplattform, The Language Menu, som har en medlemsbas på cirka 35 000 lärare över hela världen."
            },
            bcreative: {
                name: "B-Creative / Sverige",
                intro: "B-Creative är en förening som utvecklar kurser, evenemang och workshops inom olika ämnen som språkinlärning, virtuellt resande, utbildningskoncept och kulturella koncept. B-Creative har ett stort nätverk i Sverige och i Europa med frivilligorganisationer, utbildningsorganisationer och föreningar.\n\nPersonalen i B-Creative har erfarenhet av europeiska projekt, utveckling av utbildningsmaterial, marknadsföring, nätverksbyggande, och fokus på individen är centrala värden för oss.\nPersonalen arbetar med utveckling av utbildningsmaterial för olika målgrupper såsom kulturutbildning, entreprenörskompetens, IKT-utbildning och social inkludering.",
                experience: "Personalen i B-Creative har varit involverade i EU-projekt som fokuserar på livslångt lärande, social utestängning, jämställdhetsintegrering, funktionshinder, folkbildning, entreprenörskompetens, aspekter inom yrkesutbildning för vuxna och missgynnade grupper. De har också ett gott samarbete med migrantföreningar och seniorföreningar samt erfarenhet av att utveckla aktiviteter och material för migranter och den äldre generationen."
            }
        }
    }[lang] || {
        title: "Our Network",
        subtitle: "Partners",
        learnmera: { name: "", description: "", services: [], trackRecord: "" },
        bcreative: { name: "", intro: "", experience: "" }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100 }
        }
    } as const;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full" />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/40 rounded-full" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black tracking-[0.3em] uppercase"
                    >
                        {t.subtitle}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase leading-[0.85]"
                    >
                        {t.title.split(' ')[0]} <br />
                        <span className="text-primary italic">{t.title.split(' ')[1]}</span>
                    </motion.h1>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-40"
                >
                    {/* Learnmera Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-10 sticky top-32">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center">
                                    <img src="/Learnmera logo FB_no Bkg.png" alt="Learnmera" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                    {t.learnmera.name.split(' / ')[0]} <br />
                                    <span className="text-primary text-xl font-bold tracking-[0.2em]">{t.learnmera.name.split(' / ')[1]}</span>
                                </h2>
                            </div>

                            <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                                {t.learnmera.description}
                            </p>

                            <div className="flex flex-col gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4 group">
                                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                        <Mail className="size-5" />
                                    </div>
                                    <a href="mailto:veronica@learnmera.com" className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">veronica@learnmera.com</a>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                        <ExternalLink className="size-5" />
                                    </div>
                                    <a href="https://learnmera.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">learnmera.com</a>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {t.learnmera.services.map((service, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/30 dark:shadow-none transition-all group"
                                >
                                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 mb-6 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlusCircle className="size-5" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white mb-3 uppercase tracking-[0.2em]">{service.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">{service.content}</p>
                                </motion.div>
                            ))}

                            <div className="md:col-span-2 p-12 bg-slate-900 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative z-10 flex items-start gap-8">
                                    <ShieldCheck className="size-12 text-blue-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-4">Enterprise Status</p>
                                        <p className="text-xl md:text-2xl font-light leading-snug opacity-90">
                                            {t.learnmera.trackRecord}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* B-Creative Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-10 lg:order-2 sticky top-32">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center">
                                    <img src="/Gemini_Generated_Image_4638o4638o4638o4.png" alt="B-Creative" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                    {t.bcreative.name.split(' / ')[0]} <br />
                                    <span className="text-primary text-xl font-bold tracking-[0.2em]">{t.bcreative.name.split(' / ')[1]}</span>
                                </h2>
                            </div>

                            <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                                {t.bcreative.intro}
                            </p>
                        </div>

                        <div className="lg:col-span-7 lg:order-1">
                            <div className="p-16 bg-blue-50/50 dark:bg-slate-900/50 rounded-[4rem] border border-blue-100 dark:border-slate-800 shadow-2xl shadow-blue-200/20 dark:shadow-none relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 max-w-2xl">
                                    <p className="text-lg md:text-xl font-light text-slate-700 dark:text-slate-200 leading-relaxed">
                                        {t.bcreative.experience}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};
