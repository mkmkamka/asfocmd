// Hand-authored trilingual metadata for the posts migrated from the old
// Blogger site (content/scraped/posts → archive-posts.json). Bodies remain in
// Romanian (originals); ru/en readers get a translated title/excerpt plus an
// archive note (see archive.ts).
import type { Localized } from "@/data/news";

export type ArchiveMeta = {
  cat: Localized;
  title: Localized;
  excerpt: Localized;
};

const CAT = {
  instruire: { ro: "Instruire", ru: "Обучение", en: "Training" },
  international: { ro: "Internațional", ru: "Международное", en: "International" },
  evenimente: { ro: "Evenimente", ru: "События", en: "Events" },
  anunturi: { ro: "Anunțuri", ru: "Объявления", en: "Announcements" },
  documente: { ro: "Documente", ru: "Документы", en: "Documents" },
  felicitari: { ro: "Felicitări", ru: "Поздравления", en: "Greetings" },
  siguranta: { ro: "Siguranță", ru: "Безопасность", en: "Safety" },
} satisfies Record<string, Localized>;

export const archiveMeta: Record<string, ArchiveMeta> = {
  "2023-02-curs-baza-sobar-in-cadrul-asociatiei": {
    cat: CAT.instruire,
    title: {
      ro: "Curs de bază pentru sobari în cadrul Asociației ASFOCMD",
      ru: "Базовый курс печников в рамках Ассоциации ASFOCMD",
      en: "Basic stove-builder course within the ASFOCMD Association",
    },
    excerpt: {
      ro: "Ultimele pregătiri înaintea cursului de bază pentru sobari, susținut sub egida maestrului sobar Tudor Burac, după standardul european.",
      ru: "Последние приготовления к базовому курсу печников под руководством мастера Тудора Бурака, по европейскому стандарту.",
      en: "Final preparations for the basic stove-builder course, led by master stove builder Tudor Burac to the European standard.",
    },
  },
  "2023-02-curs-sobar-teoretic": {
    cat: CAT.instruire,
    title: {
      ro: "Curs sobar teoretic, 7–10 februarie 2023",
      ru: "Теоретический курс печника, 7–10 февраля 2023",
      en: "Theoretical stove-builder course, 7–10 February 2023",
    },
    excerpt: {
      ro: "Curs de bază pentru sobari organizat de ASFOCMD în colaborare cu ASFOCH.RO.",
      ru: "Базовый курс для печников, организованный ASFOCMD совместно с ASFOCH.RO.",
      en: "Basic course for stove builders organised by ASFOCMD together with ASFOCH.RO.",
    },
  },
  "2022-08-participarea-delegatiei-ap-asfocmd-la": {
    cat: CAT.international,
    title: {
      ro: "Delegația ASFOCMD la congresul ESCHFOE 2022, Opole, Polonia",
      ru: "Делегация ASFOCMD на конгрессе ESCHFOE 2022 в Ополе, Польша",
      en: "ASFOCMD delegation at the ESCHFOE 2022 congress in Opole, Poland",
    },
    excerpt: {
      ro: "Participarea delegației asociației la congresul Federației Europene a Maeștrilor Coșari ESCHFOE-2022.",
      ru: "Участие делегации ассоциации в конгрессе Европейской федерации мастеров-трубочистов ESCHFOE-2022.",
      en: "The association's delegation took part in the ESCHFOE 2022 congress of the European Federation of Master Chimney Sweeps.",
    },
  },
  "2021-07-organizarea-unui-curs-de-instruire": {
    cat: CAT.instruire,
    title: {
      ro: "Curs intern de instruire a evaluatorilor/coșari din întreprinderile membre",
      ru: "Внутренний курс обучения оценщиков-трубочистов предприятий-членов",
      en: "Internal training course for evaluator chimney sweeps from member companies",
    },
    excerpt: {
      ro: "Centrul de instruire „Hornar-Expert Prim” organizează un curs intern pentru evaluatorii/coșarii întreprinderilor membre ASFOCMD.",
      ru: "Учебный центр «Hornar-Expert Prim» организует внутренний курс для оценщиков-трубочистов предприятий-членов ASFOCMD.",
      en: "The Hornar-Expert Prim training centre is running an internal course for evaluator sweeps from ASFOCMD member companies.",
    },
  },
  "2021-05-congresul-veuko-2021": {
    cat: CAT.international,
    title: {
      ro: "Congresul VEUKO 2021",
      ru: "Конгресс VEUKO 2021",
      en: "VEUKO Congress 2021",
    },
    excerpt: {
      ro: "Pe 19 mai a avut loc congresul anual VEUKO, platforma europeană a asociațiilor de sobari, unde Moldova este reprezentată de ASFOCMD.",
      ru: "19 мая состоялся ежегодный конгресс VEUKO — европейской платформы ассоциаций печников; Молдову представляет ASFOCMD.",
      en: "The annual congress of VEUKO, the European platform of stove-builder associations, took place on 19 May; Moldova is represented by ASFOCMD.",
    },
  },
  "2020-12-anunt-cu-privire-la-organizarea-unui": {
    cat: CAT.instruire,
    title: {
      ro: "Anunț: curs online de instruire a sobarilor",
      ru: "Объявление: онлайн-курс обучения печников",
      en: "Announcement: online training course for stove builders",
    },
    excerpt: {
      ro: "Curs online prin Zoom în perioada pandemiei, în cadrul acordului bilateral dintre ASFOCMD și ASFOCH România.",
      ru: "Онлайн-курс в Zoom в период пандемии, в рамках двустороннего соглашения между ASFOCMD и ASFOCH (Румыния).",
      en: "An online Zoom course during the pandemic, under the bilateral agreement between ASFOCMD and ASFOCH Romania.",
    },
  },
  "2020-08-anunt-curs-de-instruire-si-atestare": {
    cat: CAT.instruire,
    title: {
      ro: "Anunț: curs de instruire și atestare a specialiștilor evaluatori/coșari",
      ru: "Объявление: курс обучения и аттестации специалистов-оценщиков/трубочистов",
      en: "Announcement: training and certification course for evaluator chimney sweeps",
    },
    excerpt: {
      ro: "Curs de instruire și atestare pentru specialiștii din întreprinderile membre ASFOCMD, la centrul „Hornar-Expert Prim”.",
      ru: "Курс обучения и аттестации для специалистов предприятий-членов ASFOCMD в центре «Hornar-Expert Prim».",
      en: "Training and certification course for specialists from ASFOCMD member companies at the Hornar-Expert Prim centre.",
    },
  },
  "2020-05-congres-veuko-2020": {
    cat: CAT.international,
    title: {
      ro: "Congresul VEUKO 2020",
      ru: "Конгресс VEUKO 2020",
      en: "VEUKO Congress 2020",
    },
    excerpt: {
      ro: "Congresul anual al asociațiilor de sobari din Europa s-a desfășurat online, cu peste 30 de participanți din diverse țări.",
      ru: "Ежегодный конгресс европейских ассоциаций печников прошёл онлайн, более 30 участников из разных стран.",
      en: "The annual congress of Europe's stove-builder associations was held online, with over 30 participants from various countries.",
    },
  },
  "2020-05-raport-catre-veuko": {
    cat: CAT.documente,
    title: {
      ro: "Raport către Congresul VEUKO 2020",
      ru: "Отчёт Конгрессу VEUKO 2020",
      en: "Report to the VEUKO Congress 2020",
    },
    excerpt: {
      ro: "Raportul ASFOCMD prezentat congresului VEUKO din 14 mai 2020 despre activitatea asociației.",
      ru: "Отчёт ASFOCMD, представленный конгрессу VEUKO 14 мая 2020 года, о деятельности ассоциации.",
      en: "ASFOCMD's report to the VEUKO congress of 14 May 2020 on the association's activity.",
    },
  },
  "2020-04-felicitari-cu-sfintele-sarbatori-de": {
    cat: CAT.felicitari,
    title: {
      ro: "Felicitări cu sfintele sărbători de Paști",
      ru: "Поздравление со светлым праздником Пасхи",
      en: "Easter greetings",
    },
    excerpt: {
      ro: "Mesajul de felicitare al echipei ASFOCMD cu ocazia sărbătorilor de Paști.",
      ru: "Поздравительное послание команды ASFOCMD по случаю пасхальных праздников.",
      en: "The ASFOCMD team's greeting on the occasion of the Easter holidays.",
    },
  },
  "2020-02-adunarea-generala-anuala-si-cerebrarea": {
    cat: CAT.anunturi,
    title: {
      ro: "Adunarea generală anuală și Ziua ASFOCMD — 29 februarie 2020",
      ru: "Ежегодное общее собрание и День ASFOCMD — 29 февраля 2020",
      en: "Annual general assembly and ASFOCMD Day — 29 February 2020",
    },
    excerpt: {
      ro: "Convocarea adunării generale anuale a membrilor și sărbătorirea Zilei ASFOCMD, la sediul asociației din Chișinău.",
      ru: "Созыв ежегодного общего собрания членов и празднование Дня ASFOCMD в офисе ассоциации в Кишинёве.",
      en: "Convening of the annual general assembly and celebration of ASFOCMD Day at the association's Chișinău office.",
    },
  },
  "2019-12-felicitari-cu-sarbatoria-sfintelui": {
    cat: CAT.felicitari,
    title: {
      ro: "Felicitări cu sărbătorile de Crăciun și Revelion 2020",
      ru: "Поздравление с Рождеством и Новым 2020 годом",
      en: "Christmas and New Year 2020 greetings",
    },
    excerpt: {
      ro: "Felicitări adresate coșarilor, sobarilor și constructorilor de coșuri de fum, membri și prieteni ai asociației.",
      ru: "Поздравления трубочистам, печникам и строителям дымоходов — членам и друзьям ассоциации.",
      en: "Greetings to the chimney sweeps, stove builders and flue constructors — members and friends of the association.",
    },
  },
  "2019-12-cosarii-asfocmd-efectueaza-evaluarea-si": {
    cat: CAT.siguranta,
    title: {
      ro: "Coșarii ASFOCMD pregătesc coșurile de fum pentru sezonul rece",
      ru: "Трубочисты ASFOCMD готовят дымоходы к холодному сезону",
      en: "ASFOCMD sweeps prepare chimneys for the cold season",
    },
    excerpt: {
      ro: "Membrii asociației efectuează evaluarea și curățarea coșurilor de fum, sistemelor de ventilare, sobelor și centralelor termice.",
      ru: "Члены ассоциации проводят оценку и чистку дымоходов, вентиляционных систем, печей и отопительных котлов.",
      en: "Association members carry out inspection and sweeping of chimneys, ventilation systems, stoves and heating boilers.",
    },
  },
  "2019-12-autorizarea-instruirii-la-centrul-de": {
    cat: CAT.instruire,
    title: {
      ro: "Autorizarea instruirii la centrul „Hornar-Expert Prim”",
      ru: "Авторизация обучения в центре «Hornar-Expert Prim»",
      en: "Training authorisation for the Hornar-Expert Prim centre",
    },
    excerpt: {
      ro: "Centrul de instruire al membrului ASFOCMD a fost autorizat de Agenția pentru Supraveghere Tehnică, conform legislației.",
      ru: "Учебный центр члена ASFOCMD авторизован Агентством технического надзора в соответствии с законодательством.",
      en: "The ASFOCMD member's training centre was authorised by the Technical Supervision Agency in line with the law.",
    },
  },
  "2019-07-mesaj-de-multumire-administratiei": {
    cat: CAT.evenimente,
    title: {
      ro: "Mesaj de mulțumire bibliotecii de arte „Tudor Arghezi”",
      ru: "Благодарность библиотеке искусств им. Тудора Аргези",
      en: "Thanks to the Tudor Arghezi arts library",
    },
    excerpt: {
      ro: "Mulțumiri administrației bibliotecii pentru spațiul și atmosfera oferite la evenimentele asociației.",
      ru: "Благодарность администрации библиотеки за предоставленное пространство и атмосферу на мероприятиях ассоциации.",
      en: "Thanks to the library's administration for the space and welcoming atmosphere at the association's events.",
    },
  },
  "2019-05-interviu-in-cadrul-emisiunii-buna": {
    cat: CAT.evenimente,
    title: {
      ro: "Interviu la emisiunea „Bună Dimineața”, Moldova 1",
      ru: "Интервью в передаче «Buna Dimineața» на Moldova 1",
      en: "Interview on Moldova 1's Buna Dimineața show",
    },
    excerpt: {
      ro: "Tudor Burac, director al departamentului sobe ASFOCMD, despre congresul VEUKO de la Praga.",
      ru: "Тудор Бурак, директор печного департамента ASFOCMD, — о конгрессе VEUKO в Праге.",
      en: "Tudor Burac, head of ASFOCMD's stove department, on the VEUKO congress in Prague.",
    },
  },
  "2019-05-participarea-asociatiei-asfocmd-la": {
    cat: CAT.international,
    title: {
      ro: "ASFOCMD la Congresul VEUKO — Praga 2019",
      ru: "ASFOCMD на конгрессе VEUKO — Прага 2019",
      en: "ASFOCMD at the VEUKO Congress — Prague 2019",
    },
    excerpt: {
      ro: "Maeștrii Tudor Burac și Mircea Balșoeanu au reprezentat asociația la congresul asociațiilor de sobari din UE.",
      ru: "Мастера Тудор Бурак и Мирча Балшояну представили ассоциацию на конгрессе печных ассоциаций ЕС.",
      en: "Masters Tudor Burac and Mircea Balșoeanu represented the association at the EU stove-builder associations' congress.",
    },
  },
  "2019-05-felicitare-asfocmd-cu-ziua-hornarului": {
    cat: CAT.felicitari,
    title: {
      ro: "Felicitare de Ziua Hornarului pentru colegii din România",
      ru: "Поздравление с Днём трубочиста коллегам из Румынии",
      en: "Chimney Sweep Day greetings to colleagues in Romania",
    },
    excerpt: {
      ro: "Felicitări colegilor de breaslă din ASFOCH România cu ocazia Zilei Hornarului.",
      ru: "Поздравления коллегам по цеху из ASFOCH (Румыния) по случаю Дня трубочиста.",
      en: "Greetings to fellow craftsmen at ASFOCH Romania on Chimney Sweep Day.",
    },
  },
  "2019-03-adunare-generala-asfocmd": {
    cat: CAT.anunturi,
    title: {
      ro: "Adunarea generală ASFOCMD — 24 martie 2019",
      ru: "Общее собрание ASFOCMD — 24 марта 2019",
      en: "ASFOCMD general assembly — 24 March 2019",
    },
    excerpt: {
      ro: "Adunarea generală anuală, cu invitația membrilor cu drepturi depline și a membrilor afiliați.",
      ru: "Ежегодное общее собрание с приглашением полноправных и аффилированных членов.",
      en: "The annual general assembly, open to full and affiliated members.",
    },
  },
  "2018-08-blog-post_27": {
    cat: CAT.international,
    title: {
      ro: "Discursul președintelui ASFOCMD la congresul ESCHFOE 2018",
      ru: "Речь председателя ASFOCMD на конгрессе ESCHFOE 2018",
      en: "ASFOCMD president's speech at the ESCHFOE 2018 congress",
    },
    excerpt: {
      ro: "Discursul lui Alexei Golomoz la Congresul Federației Europene a Maeștrilor Coșari ESCHFOE-2018.",
      ru: "Выступление Алексея Голомоза на конгрессе Европейской федерации мастеров-трубочистов ESCHFOE-2018.",
      en: "Alexei Golomoz's address to the ESCHFOE 2018 congress of the European Federation of Master Chimney Sweeps.",
    },
  },
  "2018-08-blog-post": {
    cat: CAT.international,
    title: {
      ro: "Raport și cerere de aderare către congresul ESCHFOE",
      ru: "Отчёт и заявка на вступление к конгрессу ESCHFOE",
      en: "Report and membership application to the ESCHFOE congress",
    },
    excerpt: {
      ro: "Raportul ASFOCMD către Congresul ESCHFOE, însoțit de cererea de aderare la federație.",
      ru: "Отчёт ASFOCMD конгрессу ESCHFOE вместе с заявкой на вступление в федерацию.",
      en: "ASFOCMD's report to the ESCHFOE congress, together with its application to join the federation.",
    },
  },
  "2018-08-blog-post_24": {
    cat: CAT.international,
    title: {
      ro: "Președintele ASFOCMD la congresul ESCHFOE de la Târgu Mureș",
      ru: "Председатель ASFOCMD на конгрессе ESCHFOE в Тыргу-Муреше",
      en: "ASFOCMD president at the ESCHFOE congress in Târgu Mureș",
    },
    excerpt: {
      ro: "Participarea lui Alexei Golomoz la congresul ESCHFOE organizat la Târgu Mureș, România, și conferința de presă a federației.",
      ru: "Участие Алексея Голомоза в конгрессе ESCHFOE в Тыргу-Муреше (Румыния) и пресс-конференция федерации.",
      en: "Alexei Golomoz's participation in the ESCHFOE congress held in Târgu Mureș, Romania, and the federation's press conference.",
    },
  },
  "2018-08-blog-post_30": {
    cat: CAT.international,
    title: {
      ro: "Poza de grup a delegațiilor statelor membre ESCHFOE",
      ru: "Групповое фото делегаций стран — членов ESCHFOE",
      en: "Group photo of the ESCHFOE member-state delegations",
    },
    excerpt: {
      ro: "Fotografia de grup a delegațiilor la congresul ESCHFOE 2018.",
      ru: "Групповая фотография делегаций на конгрессе ESCHFOE 2018.",
      en: "The group photograph of delegations at the ESCHFOE 2018 congress.",
    },
  },
  "2018-08-blog-post_88": {
    cat: CAT.international,
    title: {
      ro: "Felicitări cu ocazia aderării ASFOCMD la ESCHFOE",
      ru: "Поздравления по случаю вступления ASFOCMD в ESCHFOE",
      en: "Congratulations on ASFOCMD joining ESCHFOE",
    },
    excerpt: {
      ro: "Mesaje de felicitare de la președintele ESCHFOE Oswald Wilhelm și de la ASFOCH România.",
      ru: "Поздравления от председателя ESCHFOE Освальда Вильгельма и от ASFOCH (Румыния).",
      en: "Congratulatory messages from ESCHFOE president Oswald Wilhelm and from ASFOCH Romania.",
    },
  },
  "2018-07-primul-curs-al-sobarilor-adaugat-in": {
    cat: CAT.instruire,
    title: {
      ro: "Primul curs al sobarilor: 1 membru și 9 membri afiliați noi",
      ru: "Первый курс печников: 1 новый член и 9 аффилированных",
      en: "First stove-builder course: 1 new member and 9 affiliates",
    },
    excerpt: {
      ro: "Primul curs al sobarilor a adus asociației un membru nou și nouă membri afiliați — un început bun pentru departamentul sobarilor.",
      ru: "Первый курс печников принёс ассоциации нового члена и девять аффилированных — хорошее начало для печного департамента.",
      en: "The first stove-builder course brought the association one new member and nine affiliates — a good start for the stove department.",
    },
  },
  "2018-04-precizari-la-anunt-curs-de-hornari": {
    cat: CAT.anunturi,
    title: {
      ro: "Precizări: curs de hornari nivelul II, 2–4 mai 2018",
      ru: "Уточнения: курс трубочистов II уровня, 2–4 мая 2018",
      en: "Clarifications: level II chimney-sweep course, 2–4 May 2018",
    },
    excerpt: {
      ro: "Precizări privind perioada de desfășurare a cursului de hornari nivelul II — verificare.",
      ru: "Уточнения о сроках проведения курса трубочистов II уровня — проверка.",
      en: "Clarifications on the dates of the level II chimney-sweep verification course.",
    },
  },
  "2018-04-curs-de-hornari-nivelul-ii-controlori-2": {
    cat: CAT.instruire,
    title: {
      ro: "Curs de hornari nivelul II — controlori, mai 2018",
      ru: "Курс трубочистов II уровня — контролёры, май 2018",
      en: "Level II chimney-sweep course — inspectors, May 2018",
    },
    excerpt: {
      ro: "Curs organizat conform statutului ASFOCMD și programului de școlarizare, în zilele de 2–4, 7 și 8 mai 2018.",
      ru: "Курс, организованный согласно уставу ASFOCMD и программе обучения, 2–4, 7 и 8 мая 2018 года.",
      en: "A course run under the ASFOCMD statute and training programme on 2–4, 7 and 8 May 2018.",
    },
  },
  "2018-03-anunt-conform-prevederilor-art": {
    cat: CAT.instruire,
    title: {
      ro: "Curs sobar, 11–13 aprilie 2018",
      ru: "Курс печника, 11–13 апреля 2018",
      en: "Stove-builder course, 11–13 April 2018",
    },
    excerpt: {
      ro: "Anunț și precizări privind cursul de sobari din aprilie 2018.",
      ru: "Объявление и уточнения о курсе печников в апреле 2018 года.",
      en: "Announcement and clarifications about the April 2018 stove-builder course.",
    },
  },
  "2018-03-decizienr": {
    cat: CAT.documente,
    title: {
      ro: "Decizia nr. 01/2018: condiții pentru școlarizările interne",
      ru: "Решение № 01/2018: условия внутреннего обучения",
      en: "Decision no. 01/2018: terms for internal training",
    },
    excerpt: {
      ro: "Decizia Consiliului de administrare privind condițiile școlarizărilor interne în anul 2018.",
      ru: "Решение административного совета об условиях внутреннего обучения в 2018 году.",
      en: "The administrative council's decision on the terms of internal training courses in 2018.",
    },
  },
  "2018-02-acord-de-colaborare-asociatiilor-de": {
    cat: CAT.documente,
    title: {
      ro: "Acord de colaborare între asociațiile de profil similar",
      ru: "Соглашение о сотрудничестве профильных ассоциаций",
      en: "Cooperation agreement between kindred associations",
    },
    excerpt: {
      ro: "Colaborare și schimb de experiență sub formă de parteneriate cu asociații de profil similar din țară și străinătate.",
      ru: "Сотрудничество и обмен опытом в форме партнёрств с профильными ассоциациями в стране и за рубежом.",
      en: "Cooperation and knowledge exchange through partnerships with kindred associations at home and abroad.",
    },
  },
  "2018-02-instruirea-profesionala-membrilor": {
    cat: CAT.instruire,
    title: {
      ro: "Instruirea profesională continuă a membrilor ASFOCMD",
      ru: "Непрерывное профессиональное обучение членов ASFOCMD",
      en: "Ongoing professional training of ASFOCMD members",
    },
    excerpt: {
      ro: "Președintele și vicepreședintele asociației au participat la pregătirea profesională continuă în ianuarie 2018.",
      ru: "Председатель и вице-председатель ассоциации прошли непрерывную профессиональную подготовку в январе 2018 года.",
      en: "The association's president and vice-president took part in continuing professional training in January 2018.",
    },
  },
  "2018-02-participarea-vicepresedintelui": {
    cat: CAT.international,
    title: {
      ro: "Vicepreședintele Igor Blanița la instruirea coșarilor din Federația Rusă",
      ru: "Вице-председатель Игорь Бланица на обучении трубочистов в России",
      en: "Vice-president Igor Blanița at chimney-sweep training in Russia",
    },
    excerpt: {
      ro: "Participare la instruirea organizată de „Ghilda Trubocistov” împreună cu Academia Prohornar din România.",
      ru: "Участие в обучении, организованном «Гильдией трубочистов» вместе с академией Prohornar из Румынии.",
      en: "Participation in training organised by the Russian Chimney Sweeps' Guild with Romania's Prohornar Academy.",
    },
  },
  "2018-02-primii-pasi-pentru-aderarea-asociatiei": {
    cat: CAT.international,
    title: {
      ro: "Primii pași pentru aderarea ASFOCMD la ESCHFOE",
      ru: "Первые шаги к вступлению ASFOCMD в ESCHFOE",
      en: "First steps towards ASFOCMD joining ESCHFOE",
    },
    excerpt: {
      ro: "Demersurile asociației pentru aderarea la Federația Europeană a Maeștrilor Coșari ESCHFOE.",
      ru: "Действия ассоциации по вступлению в Европейскую федерацию мастеров-трубочистов ESCHFOE.",
      en: "The association's steps towards joining ESCHFOE, the European Federation of Master Chimney Sweeps.",
    },
  },
  "2018-02-primul-eveniment-organizat-de": {
    cat: CAT.evenimente,
    title: {
      ro: "Primul eveniment organizat de ASFOCMD după fondare",
      ru: "Первое мероприятие ASFOCMD после основания",
      en: "ASFOCMD's first event after its founding",
    },
    excerpt: {
      ro: "Primul curs de instruire internă a hornarilor, organizat cu sprijinul asociației ASFOCH din România.",
      ru: "Первый внутренний курс обучения трубочистов, организованный при поддержке ассоциации ASFOCH из Румынии.",
      en: "The first internal chimney-sweep training course, organised with support from Romania's ASFOCH association.",
    },
  },
  "2018-02-cerere-de-aprobare-standardului-de-sobe": {
    cat: CAT.evenimente,
    title: {
      ro: "Participarea la sărbătoarea profesională Ziua Salvatorului",
      ru: "Участие в профессиональном празднике — Дне спасателя",
      en: "Taking part in Rescuer's Day celebrations",
    },
    excerpt: {
      ro: "Președintele ASFOCMD la evenimentele Zilei Salvatorului, organizate de IGSU al MAI al R. Moldova.",
      ru: "Председатель ASFOCMD на мероприятиях Дня спасателя, организованных ГИЧС МВД Республики Молдова.",
      en: "ASFOCMD's president at Rescuer's Day events organised by Moldova's General Inspectorate for Emergency Situations.",
    },
  },
  "2018-02-discursul-presedintelui-asfocmd-golomoz": {
    cat: CAT.evenimente,
    title: {
      ro: "Discursul președintelui ASFOCMD de Ziua Sobarului",
      ru: "Речь председателя ASFOCMD в День печника",
      en: "ASFOCMD president's speech on Stove Builder's Day",
    },
    excerpt: {
      ro: "Discursul lui Alexei Golomoz la întrunirea sobarilor din 2 februarie, cu ocazia Zilei Sobarului.",
      ru: "Выступление Алексея Голомоза на встрече печников 2 февраля по случаю Дня печника.",
      en: "Alexei Golomoz's speech at the stove builders' gathering of 2 February, marking Stove Builder's Day.",
    },
  },
  "2018-02-cerere-aderare-asfocmd": {
    cat: CAT.documente,
    title: {
      ro: "Modelul cererii de aderare la ASFOCMD",
      ru: "Образец заявления о вступлении в ASFOCMD",
      en: "ASFOCMD membership application template",
    },
    excerpt: {
      ro: "Modelul cererii de aderare pentru persoane fizice, disponibil pentru descărcare și completare.",
      ru: "Образец заявления о вступлении для физических лиц, доступный для скачивания и заполнения.",
      en: "The membership application template for individuals, available to download and fill in.",
    },
  },
  "2023-01-blog-post": {
    cat: CAT.anunturi,
    title: {
      ro: "Adunarea generală ASFOCMD — 10 februarie 2023",
      ru: "Общее собрание ASFOCMD — 10 февраля 2023",
      en: "ASFOCMD general assembly — 10 February 2023",
    },
    excerpt: {
      ro: "Convocarea adunării generale a membrilor asociației pentru 10 februarie 2023, ora 13:00.",
      ru: "Созыв общего собрания членов ассоциации на 10 февраля 2023 года, 13:00.",
      en: "The association's general assembly is convened for 10 February 2023 at 13:00.",
    },
  },
  "2022-02-felicitare-cu-prilegul-sarbatorii": {
    cat: CAT.felicitari,
    title: {
      ro: "Felicitare de Ziua Sobarului și Șeministului — ASFOCH România",
      ru: "Поздравление с Днём печника и каминщика — ASFOCH Румыния",
      en: "Stove and Fireplace Builder's Day greetings — ASFOCH Romania",
    },
    excerpt: {
      ro: "Felicitare cu prilejul sărbătorii profesionale a colegilor din asociația ASFOCH din România.",
      ru: "Поздравление по случаю профессионального праздника коллег из ассоциации ASFOCH (Румыния).",
      en: "Greetings on the professional day of our colleagues at Romania's ASFOCH association.",
    },
  },
  "2019-06-anunt-de-organizare-cursului-de": {
    cat: CAT.instruire,
    title: {
      ro: "Anunț: curs de evaluatori coșari, 8–12 iulie 2019",
      ru: "Объявление: курс оценщиков-трубочистов, 8–12 июля 2019",
      en: "Announcement: evaluator chimney-sweep course, 8–12 July 2019",
    },
    excerpt: {
      ro: "Organizarea cursului de evaluatori coșari în perioada 8–12 iulie 2019 — detalii în afișul atașat.",
      ru: "Курс оценщиков-трубочистов пройдёт 8–12 июля 2019 года — подробности в афише.",
      en: "The evaluator chimney-sweep course runs 8–12 July 2019 — details in the attached notice.",
    },
  },
  "2018-02-cerere-de-aprobare-standardului-sobe-in": {
    cat: CAT.documente,
    title: {
      ro: "Cerere de aprobare a standardului „Sobe în situ”",
      ru: "Заявка на утверждение стандарта «Печи на месте»",
      en: "Request for approval of the \"Stoves in situ\" standard",
    },
    excerpt: {
      ro: "Demersul asociației pentru aprobarea standardului privind construcția sobelor la fața locului.",
      ru: "Обращение ассоциации об утверждении стандарта строительства печей на месте.",
      en: "The association's request for approval of the standard on building stoves in situ.",
    },
  },
  "2018-02-agenda-pentru-intrunirea-sobarilor": {
    cat: CAT.anunturi,
    title: {
      ro: "Agenda întrunirii sobarilor — vineri, 2 februarie 2018",
      ru: "Повестка встречи печников — пятница, 2 февраля 2018",
      en: "Agenda of the stove builders' gathering — Friday, 2 February 2018",
    },
    excerpt: {
      ro: "Agenda întrunirii sobarilor din 2 februarie 2018 — detalii în afișul atașat.",
      ru: "Повестка встречи печников 2 февраля 2018 года — подробности в афише.",
      en: "The agenda of the stove builders' gathering of 2 February 2018 — details in the attached notice.",
    },
  },
  "2017-12-testa-pagina": {
    cat: CAT.evenimente,
    title: {
      ro: "Moldova la festivalul hornarilor",
      ru: "Молдова на фестивале трубочистов",
      en: "Moldova at the chimney sweeps' festival",
    },
    excerpt: {
      ro: "Reprezentanții Moldovei la festivalul hornarilor — imagine din arhiva asociației.",
      ru: "Представители Молдовы на фестивале трубочистов — фото из архива ассоциации.",
      en: "Moldova's representatives at the chimney sweeps' festival — a photo from the association's archive.",
    },
  },
  "2017-12-intrunirea-anuale-directorilor-asfocmd": {
    cat: CAT.evenimente,
    title: {
      ro: "Întrunirea anuală a directorilor ASFOCMD",
      ru: "Ежегодная встреча директоров ASFOCMD",
      en: "Annual meeting of ASFOCMD directors",
    },
    excerpt: {
      ro: "Pe 16 decembrie a avut loc întrunirea de lucru a directorilor din cadrul asociației.",
      ru: "16 декабря состоялась рабочая встреча директоров ассоциации.",
      en: "The working meeting of the association's directors took place on 16 December.",
    },
  },
};
