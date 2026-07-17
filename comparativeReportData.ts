import { LanguageCode } from './types';

export interface SectionContent {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  cards?: { title: string; text: string }[];
}

export interface SimilarityItem {
  title: string;
  text: string;
}

export interface DifferenceRow {
  label: string;
  swedish: string;
  finnish: string;
}

export interface ReportData {
  intro: SectionContent;
  purposeTitle: string;
  purposeText: string;
  history: SectionContent & {
    swedishTitle: string;
    swedishText: string;
    finnishTitle: string;
    finnishText: string;
  };
  swedish: SectionContent & {
    practicesTitle: string;
    practicesText1: string;
    practicesText2: string;
    socialTitle: string;
    socialText: string;
  };
  finnish: SectionContent & {
    steamTitle: string;
    steamText1: string;
    steamText2: string;
    equalityTitle: string;
    equalityText: string;
  };
  similarities: {
    title: string;
    items: SimilarityItem[];
  };
  differences: {
    title: string;
    headers: string[];
    rows: DifferenceRow[];
  };
  future: SectionContent & {
    swedenSummaryTitle: string;
    swedenSummaryText: string;
    finlandSummaryTitle: string;
    finlandSummaryText: string;
  };
}

export const COMPARATIVE_REPORT_DATA: Record<LanguageCode, ReportData> = {
  en: {
    intro: {
      title: "Introduction",
      paragraphs: [
        "Saunas have been an integral part of Nordic culture for centuries, revered not only as places for physical relaxation but also as spaces for social interaction and mental rejuvenation. Among the various sauna traditions, the Swedish and Finnish saunas stand out, each with its distinct characteristics, practices, and cultural significance.",
        "This comparative report aims to explore the similarities and differences between Swedish and Finnish saunas, examining aspects such as design, heating methods, rituals, health benefits, and their roles in modern society. By understanding these two sauna traditions, we can appreciate their contributions to well-being and their enduring popularity in contemporary wellness practices."
      ]
    },
    purposeTitle: "Purpose of the Report",
    purposeText: "The purpose of this report is to provide a comprehensive comparison of Swedish and Finnish saunas, highlighting their unique features while identifying commonalities and cultural heritage. Through this analysis, we seek to enhance understanding of sauna culture and its impact on health and social dynamics, ultimately offering insights for enthusiasts and those new to this cherished practice.",
    history: {
      title: "Historical Background",
      paragraphs: [],
      swedishTitle: "Swedish Origins",
      swedishText: "The origins of the sauna trace back to ancient times when it served as a vital part of daily life in Sweden. Traditionally constructed from wood and heated by a stove, these steam-filled spaces have been used for ritual purification, relaxation, and social interaction. Over time, the sauna became a symbol of Swedish culture, embodying values of simplicity, nature, and togetherness.",
      finnishTitle: "Finnish Origins",
      finnishText: "The origins of the sauna can be traced back to ancient Finnish culture, where it served as a multifunctional space for bathing, socializing, and even giving birth due to its sterile conditions. Traditionally, saunas were built as log cabins, often with natural stones heated in a fire, providing a warm, humid environment that was both invigorating and therapeutic. Today, the essence remains a sanctuary for relaxation."
    },
    swedish: {
      title: "Swedish Sauna Culture",
      paragraphs: [],
      cards: [
        { title: "Wood-Fired & Electric", text: "Typically wood-paneled with pine or spruce. Stoves heat up rocks to radiate warmth ranging from 70°C to 100°C." },
        { title: "Bastukvast / Vippa", text: "A bundled whisk of birch branches dipped in water, used to gently whip the skin to stimulate circulation." },
        { title: "Smoke & Infrared", text: "Traditional chimney-less smoke saunas (Rökbastu) and modern low-temperature (50-60°C) infrared alternatives." }
      ],
      practicesTitle: "Practices and Rituals",
      practicesText1: "In Sweden, sauna culture is deeply ingrained in traditions and daily life, often embodying both relaxation and social interaction. Most Swedish saunas are constructed from wood, giving a distinctive aroma when heated. Known as 'bastu' in Swedish, they can be found in homes, public facilities, and seaside areas for natural cooling.",
      practicesText2: "A typical sauna session involves alternating between heat exposure (10-20 minutes) and cooling-off periods of similar duration, often by jumping into a lake, taking a cold shower, or relaxing in the fresh air. While not as common as in Finland, Swedes occasionally use eucalyptus leaves or herbal infusions. The 'doftkvast' (fragrant whisk) of birch twigs is gently tapped against the skin to stimulate circulation.",
      socialTitle: "Social and Health Experience",
      socialText: "Saunas are communal spaces where friends and family gather to bond. Sharing light meals, refreshments, and conversations is part of the experience. In Sweden, having a sauna in one's home is often seen as a status symbol, reflecting a lifestyle prioritizing comfort, health, luxury, and fine craftsmanship."
    },
    finnish: {
      title: "Finnish Sauna Culture",
      paragraphs: [],
      steamTitle: "The Sacred Ritual of Löyly",
      steamText1: "The Finnish sauna is more than just a physical space; it is a rich cultural tradition and a holistic approach to wellness. It is often referred to as the 'living room' of the home. Before entering, gathering essentials like a wool sauna hat and drinking water for hydration are part of the process. Showering beforehand is required as a sign of respect.",
      steamText2: "The heart of the Finnish sauna is 'löyly'—the wave of hot steam created by pouring water over the stove's hot stones (the kiuas). This enhances the heat and can be a collaborative activity. Additionally, the 'vihta' or 'vasta' (a birch branch bundle) is used to gently whip the body to improve circulation, add a pleasant fragrance, and enhance relaxation.",
      equalityTitle: "Equality & Social Connection",
      equalityText: "Traditionally, people are nude in the Finnish sauna, which strips away all social barriers, wealth status, and titles. This creates an atmosphere of absolute equality and openness. It is also a space of silence and mindfulness—traditionally regarded as sacred, where arguing, loud behavior, or cursing are completely avoided ('in the sauna, one behaves as in church')."
    },
    similarities: {
      title: "Key Similarities",
      items: [
        { title: "Therapeutic Relaxation", text: "Both cultures use saunas as spaces to unwind. The heat relaxes muscles, reduces joint tension, and mitigates everyday stress." },
        { title: "Detox & Cardiovascular Health", text: "Sweating aids detoxification. Regular use is widely believed to improve circulation, lung function, and reduce blood pressure." },
        { title: "Hygiene & Respect", text: "Showering before entering the hot room is a fundamental custom in both countries to respect the shared space and fellow bathers." },
        { title: "Alternating Cooling", text: "Alternating between the hot room and cooling off (cold plunge, rolling in snow, or resting outdoors) is core to both traditions." }
      ]
    },
    differences: {
      title: "Core Differences",
      headers: ["Comparison", "Swedish Bastu", "Finnish Sauna"],
      rows: [
        { label: "Architecture", swedish: "Incorporate contemporary elements, using sleek lines, glass, and steel. Often part of public wellness centers, gyms, and commercial spas.", finnish: "Simple, rustic log cabin designs close to nature (lakes, rivers). Smoke saunas (savusauna) without chimneys are a major cultural feature." },
        { label: "Rituals", swedish: "Intertwined with modern spa culture. Often combined with massage, beauty therapies, or aromatherapy (like eucalyptus infusions).", finnish: "Focus on raw löyly (steam throwing) and skin whipping with birch vihta/vasta. Group aufguss is used to create aromatic heat waves." },
        { label: "Societal Role", swedish: "Seen as a healthy recreational activity, social space, and wellness package, often integrated with public health centers.", finnish: "A vital national heritage and sacred space. The ultimate equalizer where all status and hierarchies are left outside." }
      ]
    },
    future: {
      title: "The Future & Conclusion",
      paragraphs: [
        "In the future, sauna culture in both Sweden and Finland is navigating a path between accessibility and modern innovation. Mobile and portable saunas (tents, floating rafts, trailers) are rising in popularity, allowing fans to enjoy this ancient practice in diverse natural or urban settings. Simultaneously, built-in saunas are standard in modern city apartments.",
        "Whether using tech like infrared heating or preserving ancient smoke traditions, the future of the sauna is secure because it remains tied to its original purpose: serving as a sanctuary for physical health and mental refreshment."
      ],
      swedenSummaryTitle: "In Sweden",
      swedenSummaryText: "The bastu stands as a cherished cultural heritage that transcends mere relaxation. It represents a wellness philosophy prioritizing community connection, personal self-care, and a deep respect for nature.",
      finlandSummaryTitle: "In Finland",
      finlandSummaryText: "In a fast-paced world, the sauna stands as a monument to mindfulness. It is a sacred place where time slows down, nourishing the mind, body, and spirit—one steam-filled moment at a time."
    }
  },
  fi: {
    intro: {
      title: "Johdanto",
      paragraphs: [
        "Saunat ovat olleet olennainen osa pohjoismaista kulttuuria vuosisatojen ajan. Niitä ei pidetä ainoastaan fyysisen rentoutumisen paikkoina, vaan myös sosiaalisen kanssakäymisen ja henkisen virkistymisen tiloina. Monien saunaperinteiden joukosta erottuvat ruotsalainen ja suomalainen sauna, joilla kummallakin on omat erityispiirteensä, käytäntönsä ja kulttuurinen merkityksensä.",
        "Tämän vertailuraportin tavoitteena on tarkastella ruotsalaisen ja suomalaisen saunan samankaltaisuuksia ja eroja paneutuen esimerkiksi suunnitteluun, lämmitysmenetelmiin, rituaaleihin, terveyshyötyihin sekä niiden asemaan nyky-yhteiskunnassa. Ymmärtämällä näitä kahta saunaperinnettä voimme arvostaa niiden merkitystä hyvinvoinnille ja niiden kestävää suosiota nykypäivän hyvinvointikäytännöissä."
      ]
    },
    purposeTitle: "Raportin Tarkoitus",
    purposeText: "Tämän raportin tarkoituksena on tarjota kattava vertailu ruotsalaisesta ja suomalaisesta saunasta, korostaen niiden ainutlaatuisia piirteitä samalla kun tunnistetaan yhteisiä tekijöitä ja kulttuuriperintöä. Tämän analyysin avulla pyrimme lisäämään ymmärrystä saunakulttuurista ja sen vaikutuksesta terveyteen ja sosiaaliseen dynamiikkaan tarjoten näkökulmia sekä lajin harrastajille että vasta-alkajille.",
    history: {
      title: "Historiallinen Tausta",
      paragraphs: [],
      swedishTitle: "Ruotsalainen Tausta",
      swedishText: "Saunan juuret ulottuvat muinaisaikoihin, jolloin se oli elintärkeä osa arkipäivää Ruotsissa. Perinteisesti puusta rakennettuja ja uunilla lämmitettyjä höyryisiä tiloja on käytetty rituaaliseen puhdistautumiseen, rentoutumiseen ja sosiaaliseen kanssakäymiseen. Ajan myötä saunasta (bastu) tuli ruotsalaisen kulttuurin symboli, joka ilmentää yksinkertaisuuden, luonnon ja yhdessäolon arvoja.",
      finnishTitle: "Suomalainen Tausta",
      finnishText: "Saunan juuret juontavat muinaissuomalaiseen kulttuuriin, jossa se toimi monitoimitilana peseytymiseen, sosiaaliseen elämään ja jopa synnyttämiseen sen steriilien olosuhteiden vuoksi. Perinteisesti saunat rakennettiin hirsikämppinä, joiden kivikasa lämmitettiin tulella, tarjoten lämpimän ja kostean ympäristön, joka oli sekä virkistävä että parantava. Nykyäänkin sauna säilyttää asemansa pyhänä rauhoittumisen paikkana."
    },
    swedish: {
      title: "Ruotsalainen Saunakulttuuri",
      paragraphs: [],
      cards: [
        { title: "Puu- ja Sähkökiuas", text: "Yleensä puupaneloitu männyllä tai kuusella. Kiuas lämmittää kivet säteilemään lämpöä, joka vaihtelee 70°C ja 100°C välillä." },
        { title: "Bastukvast / Vippa", text: "Veteen kastettu koivunoksista tehty vihta, jolla vastaillaan kevyesti ihoa verenkierron stimuloimiseksi." },
        { title: "Savusauna & Infrapuna", text: "Perinteiset hormittomat savusaunat (rökbastu) sekä nykyaikaiset matalalämpöiset (50-60°C) infrapunasaunat." }
      ],
      practicesTitle: "Käytännöt ja Rituaalit",
      practicesText1: "Ruotsissa saunakulttuuri on syvälle juurtunut perinteisiin ja jokapäiväiseen elämään, yhdistäen rentoutumisen ja sosiaalisen kanssakäymisen. Useimmat ruotsalaiset saunat on rakennettu puusta, mikä antaa niille ominaisen aromin lämmitettäessä. Ruotsiksi saunasta käytetään nimeä 'bastu', ja niitä löytyy kodeista, julkisista tiloista ja usein meren tai järven rannalta.",
      practicesText2: "Tyypillinen saunasessio sisältää vuorottelua lämmön (10–20 minuuttia) ja vilvoittelun välillä. Vilvoittelu tapahtuu uimalla järvessä, kylmässä suihkussa tai vain istumalla raittiissa ilmassa. Vaikka se ei ole yhtä yleistä kuin Suomessa, ruotsalaiset saattavat toisinaan käyttää eukalyptusta tai yrttiaromeja. Koivunoksista tehtyä 'doftkvastia' käytetään ihon kevyeen taputteluun verenkierron lisäämiseksi.",
      socialTitle: "Sosiaalinen ja Terveyskokemus",
      socialText: "Saunat ovat yhteisöllisiä tiloja, joissa ystävät ja perhe kokoontuvat. Kevyet välipalat, virvokkeet ja keskustelut ovat osa kokemusta. Ruotsissa oma kotisauna nähdään usein statussymbolina, joka heijastaa mukavuutta, terveyttä, ylellisyyttä ja laadukasta käsityötaitoa painottavaa elämäntapaa."
    },
    finnish: {
      title: "Suomalainen Saunakulttuuri",
      paragraphs: [],
      steamTitle: "Löylyn Pyhä Rituaali",
      steamText1: "Suomalainen sauna on paljon enemmän kuin vain fyysinen tila; se on rikas kulttuuriperinne ja kokonaisvaltainen lähestymistapa hyvinvointiin. Sitä kutsutaan usein kodin 'toiseksi olohuoneeksi'. Ennen saunaan menoa valmistellaan tarvikkeet, kuten villainen saunahattu suojamaan päätä kuumuudelta, ja huolehditaan nesteytyksestä. Suihkussa käynti ennen saunaa on itsestäänselvyys ja osoitus kunnioituksesta.",
      steamText2: "Suomalaisen saunan sydän on 'löyly'—kuuma höyry, joka syntyy heittämällä vettä kiukaan kuumille kiville. Tämä lisää lämmöntunnetta ja on usein yhteisöllistä toimintaa. Lisäksi käytetään koivunoksista sidottua vihtaa (tai vastaa) ihon kevyeen piiskaamiseen, minkä uskotaan parantavan verenkiertoa, tuovan miellyttävän tuoksun ja syventävän rentoutumista.",
      equalityTitle: "Tasa-arvo & Sosiaalinen Yhteys",
      equalityText: "Perinteisesti suomalaisessa saunassa ollaan alasti, mikä riisuu kaikki sosiaaliset roolit, varallisuuserot ja tittelit. Tämä luo ehdottoman tasa-arvon ja avoimuuden ilmapiirin. Sauna on myös hiljaisuuden ja tietoisen läsnäolon tila. Sitä on perinteisesti pidetty pyhänä paikkana, jossa riitelyä, kiroilua tai äänekästä käytöstä vältetään täysin ('saunassa ollaan kuin kirkossa')."
    },
    similarities: {
      title: "Keskeiset Samankaltaisuudet",
      items: [
        { title: "Terapeuttinen Rentoutuminen", text: "Molemmat kulttuurit käyttävät saunaa rentoutumiseen. Lämpö rentouttaa lihaksia, vähentää nivelten jännitystä ja lievittää stressiä." },
        { title: "Detox & Sydämen Terveys", text: "Hikoilu auttaa poistamaan kuona-aineita. Säännöllisen saunomisen uskotaan parantavan verenkiertoa, keuhkojen toimintaa ja laskevan verenpainetta." },
        { title: "Hygienia & Kunnioitus", text: "Peseytyminen ennen saunaan astumista on perussääntö molemmissa maissa yhteisen tilan ja muiden saunojien kunnioittamiseksi." },
        { title: "Vuorotteleva Vilvoittelu", text: "Vuorottelu kuuman saunan ja kylmän välillä (kuten avanto, lumessa pyöriminen tai ulkona istuminen) on molempien perinteiden ytimessä." }
      ]
    },
    differences: {
      title: "Keskeiset Erot",
      headers: ["Vertailu", "Ruotsalainen Bastu", "Suomalainen Sauna"],
      rows: [
        { label: "Arkkitehtuuri", swedish: "Yhdistää nykyaikaisia elementtejä, kuten lasia ja terästä sekä moderneja linjoja. Usein osa suurempaa kylpylää, kuntosalia tai julkista virkistyskeskusta.", finnish: "Yksinkertainen, maalaismainen hirsirakenne lähellä luontoa (järven tai joen rannalla). Hormiton savusauna on merkittävä ja arvostettu kulttuuripiirre." },
        { label: "Rituaalit", swedish: "Kytkeytyy vahvasti moderniin kylpylä- ja wellness-kulttuuriin. Yhdistetään usein hierontoihin, kauneushoitoihin tai aromaterapiaan (kuten eukalyptustipat).", finnish: "Keskittyy puhtaaseen löylyyn ja vihtomiseen koivunoksilla. Löylymestarin vetämää aufguss-rituaalia käytetään luomaan tuoksuvia lämpöaaltoja." },
        { label: "Sosiaalinen rooli", swedish: "Nähdään terveellisenä vapaa-ajan aktiviteettina ja osana modernia hyvinvointielämää, usein kytkettynä terveys- ja kuntoilukeskuksiin.", finnish: "Elinvoimainen kansallinen perintö ja pyhä tila. Äärimmäinen tasa-arvoistaja, jossa kaikki tittelit ja hierarkiat jätetään lauteiden ulkopuolelle." }
      ]
    },
    future: {
      title: "Tulevaisuus & Johtopäätökset",
      paragraphs: [
        "Tulevaisuudessa molempien maiden saunakulttuurit navigoivat saavutettavuuden ja modernin innovaation välimaastossa. Siirrettävät saunat (saunateltat, saunalautat, perävaunusaunat) kasvattavat suosiotaan mahdollistaen saunomisen luonnossa tai urbaaneissa satamissa. Samalla asuntosaunat ovat vakiinnuttaneet asemansa osana modernia kaupunkiasumista.",
        "Käytetäänpä uutta teknologiaa (kuten infrapunaa) tai vaalitaanpa vanhoja savusaunaperinteitä, saunan tulevaisuus on turvattu, koska se vastaa ihmisen perimmäiseen tarpeeseen: toimia kehon ja mielen rauhoittumisen tyyssijana."
      ],
      swedenSummaryTitle: "Ruotsissa",
      swedenSummaryText: "Bastu on vaalittu kulttuuriperintö, joka ylittää pelkän rentoutumisen. Se edustaa hyvinvointifilosofiaa, joka painottaa yhteisöllisyyttä, itsestä huolehtimista ja syvää luontosuhdetta.",
      finlandSummaryTitle: "Suomessa",
      finlandSummaryText: "Kiireisessä maailmassa sauna on läsnäolon monumentti. Se on pyhä paikka, jossa aika hidastuu, raviten mieltä, kehoa ja henkeä – löyly kerrallaan."
    }
  },
  sv: {
    intro: {
      title: "Introduktion",
      paragraphs: [
        "Bastu har varit en integrerad del av den nordiska kulturen i århundraden, uppskattad inte bara som en plats för fysisk avslappning utan också som ett utrymme för social interaktion och mental återhämtning. Bland de olika bastutraditionerna utmärker sig den svenska och den finska bastun, båda med sina distinkta egenskaper, sedvänjor och kulturella betydelse.",
        "Denna jämförande rapport syftar till att utforska likheterna och skillnaderna mellan svenska och finska bastur genom att undersöka aspekter som design, uppvärmningsmetoder, ritualer, hälsofördelar och deras roll i det moderna samhället. Genom att förstå dessa två bastutraditioner kan vi uppskatta deras bidrag till välbefinnande och deras bestående popularitet i samtida friskvårdsmetoder."
      ]
    },
    purposeTitle: "Rapportens Syfte",
    purposeText: "Syftet med denna rapport är att ge en övergripande jämförelse av svenska och finska bastur, och belysa deras unika egenskaper samtidigt som man identifierar gemensamma nämnare och kulturarv. Genom denna analys vill vi öka förståelsen för bastukulturen och dess inverkan på hälsa och social dynamik, samt erbjuda insikter för både entusiaster och nybörjare.",
    history: {
      title: "Historisk Bakgrund",
      paragraphs: [],
      swedishTitle: "Svensk Bakgrund",
      swedishText: "Bastuns ursprung sträcker sig tillbaka till forntiden då den utgjorde en viktig del av det dagliga livet i Sverige. Traditionellt konstruerade av trä och uppvärmda med en kamin, har dessa ångfyllda utrymmen använts för rituell rening, avslappning och socialt umgänge. Med tiden blev bastun en symbol för svensk kultur, präglad av enkelhet, natur och gemenskap.",
      finnishTitle: "Finsk Bakgrund",
      finnishText: "Bastuns ursprung kan spåras tillbaka till forntida finsk kultur, där den fungerade som ett mångsidigt utrymme för bad, socialt umgänge och historiskt sett även barnafödande tack vare dess sterila miljö. Traditionellt byggdes bastur som timmerstugor med naturstenar som värmdes över öppen eld, vilket skapade en varm och fuktig miljö. Än idag förblir bastun en helig fristad för återhämtning."
    },
    swedish: {
      title: "Svensk Bastukultur",
      paragraphs: [],
      cards: [
        { title: "Vedeldad & Elektrisk", text: "Oftast träpanelad med furu eller gran. Kaminen värmer upp stenar som strålar ut värme mellan 70°C och 100°C." },
        { title: "Bastukvast / Vippa", text: "Ett knippe björkris doppat i vatten som används för att lätt piska huden och stimulera blodcirkulationen." },
        { title: "Rökbastu & Infraröd", text: "Traditionella skorstensfria rökbastur (rökbastu) samt moderna infraröda alternativ med lägre temperatur (50-60°C)." }
      ],
      practicesTitle: "Rutiner och Ritualer",
      practicesText1: "I Sverige är bastukulturen djupt rotad i traditioner och vardagsliv, och förenar ofta avslappning med social samvaro. De flesta svenska bastur är byggda av trä, vilket ger en karaktäristisk doft vid uppvärmning. Bastun hittas i hem, offentliga anläggningar och ofta vid havet eller sjöar för naturlig avkylning.",
      practicesText2: "Ett typiskt bastubad innebär att man växlar mellan värme (10–20 minuter) och avkylning. Avkylningen sker genom att ta ett dopp i en sjö, en kall dusch eller bara sitta i friska luften. Även om det inte är lika vanligt som i Finland, använder svenskar ibland eukalyptus eller örtdroppar. En 'doftkvast' av björkris används för att lätt trycka mot huden för ökad cirkulation.",
      socialTitle: "Social och Hälsosam Erfarenhet",
      socialText: "Bastun är en gemensam plats där vänner och familj samlas för att umgås. Att dela enklare mat, dryck och samtal är en del av upplevelsen. I Sverige ses en egen hembastu ofta som en statussymbol som speglar en livsstil som värdesätter komfort, hälsa, lyx och gott hantverk."
    },
    finnish: {
      title: "Finsk Bastukultur",
      paragraphs: [],
      steamTitle: "Löylyns Heliga Ritual",
      steamText1: "Den finska bastun är mycket mer än bara ett fysiskt rum; den utgör en rik kulturskatt och ett helhetstänkande kring hälsa. Den kallas ofta för hemmet 'andra vardagsrum'. Inför bastubadet förbereder man tillbehör, som en bastumössa i ull för att skydda huvudet mot hettan, och ser till att dricka tillräckligt med vatten. Att duscha före bastun är en självklar regel av respekt.",
      steamText2: "Hjärtat i den finska bastun är 'löyly'—den heta ånga som uppstår när man kastar vatten på kaminens heta stenar (kiuas). Detta ökar värmekänslan och är ofta en gemensam aktivitet. Dessutom används en 'vihta' eller 'vasta' (ett björkrisknippe) för att lätt piska kroppen, vilket anses stimulera cirkulationen, sprida en behaglig doft och fördjupa avslappningen.",
      equalityTitle: "Jämlikhet & Social Gemenskap",
      equalityText: "Traditionellt badar man naken i den finska bastun, vilket skalar av alla sociala roller, status och titlar. Detta skapar en atmosfär av absolut jämlikhet och öppenhet. Bastun är också en plats för tystnad och medveten närvaro. Den har historiskt sett betraktats som en helig plats där gräl, svordomar eller högljutt beteende undviks helt ('i bastun uppför man sig som i kyrkan')."
    },
    similarities: {
      title: "Viktiga Likheter",
      items: [
        { title: "Terapeutisk Avslappning", text: "Båda kulturerna använder bastun för återhämtning. Värmen mjukar upp muskler, minskar ledvärk och lindrar vardagsstress." },
        { title: "Detox & Hjärthälsa", text: "Svettningen hjälper till att rensa ut slaggprodukter. Regelbundet bastubadande anses allmänt förbättra cirkulationen och sänka blodtrycket." },
        { title: "Hygien & Respekt", text: "Att duscha innan man går in i bastun är en grundregel i båda länderna för att respektera det gemensamma utrymmet och medbadarna." },
        { title: "Växlande Avkylning", text: "Att växla mellan den heta bastun och kyla (som isvak, rullning i snö eller att sitta utomhus) är centralt i båda traditionerna." }
      ]
    },
    differences: {
      title: "Huvudsakliga Skillnader",
      headers: ["Jämförelse", "Svensk Bastu", "Finsk Sauna"],
      rows: [
        { label: "Arkitektur", swedish: "Kombinerar moderna element som glas, stål och rena linjer. Ofta en del av större spaanläggningar, gym eller offentliga badanläggningar.", finnish: "Enkel, rustik timmerkonstruktion nära naturen (vid en sjö eller älv). Skorstenslös rökbastu (savusauna) är ett framträdande och högt värderat kulturinslag." },
        { label: "Ritualer", swedish: "Kopplas starkt till modern spa- och wellnesskultur. Kombineras ofta med massage, skönhetsbehandlingar eller aromaterapi (som eukalyptusdroppar).", finnish: "Fokus ligger på ren löyly (att kasta vatten) och bastubad med björkvihta/vasta. Bastuguidens aufguss används för att skapa väldoftande värmevågor." },
        { label: "Social roll", swedish: "Betraktas som en hälsosam fritidsaktivitet och en del av en modern wellness-livsstil, ofta integrerad med hälso- och friskvårdscenter.", finnish: "Ett levande nationellt kulturarv och ett heligt rum. Den ultimata utjämnaren där alla titlar och hierarkier lämnas utanför dörren." }
      ]
    },
    future: {
      title: "Framtid & Slutsatser",
      paragraphs: [
        "I framtiden navigerar bastukulturen i båda länderna mellan tillgänglighet och modern innovation. Mobila bastur (bastutält, bastuflottar, bastuvagnar) ökar i popularitet och gör det möjligt att bada bastu i vildmarken eller i urbana hamnar. Samtidigt har lägenhetsbastur etablerat sig som en standarddel av modernt boende.",
        "Oavsett om man använder ny teknik (som infraröd värme) eller värnar om gamla rökbastutraditioner, är bastuns framtid tryggad eftersom den svarar mot människans grundläggande behov: att vara en fristad för kroppslig och mental återhämtning."
      ],
      swedenSummaryTitle: "I Sverige",
      swedenSummaryText: "Bastun är ett värnat kulturarv som sträcker sig långt bortom enkel avslappning. Den representerar en wellnessfilosofi som betonar gemenskap, personlig egenvård och en djup respekt för naturen.",
      finlandSummaryTitle: "I Finland",
      finlandSummaryText: "I en hektisk värld är bastun ett monument över närvaro. Det är en helig plats där tiden stannar och ger näring åt sinne, kropp och själ – ett bastubad i taget."
    }
  }
};
