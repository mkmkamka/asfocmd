// Placeholder news content, structured the way the Sanity "post" documents will
// be (see cms/schemas). One slug per post, shared across locales; every string
// field is localized. Replace via src/lib/cms.ts once Sanity is live.
import type { Locale } from "@/i18n/config";

export type Localized = Record<Locale, string>;

export type PostBlock = {
  h?: Localized; // optional subheading
  p: Localized;  // paragraph
};

export type Post = {
  slug: string;
  iso: string; // publication date, for sorting
  cover: 1 | 2 | 3; // gradient variant of the card cover, fallback when no image
  image?: string; // cover photo (public/ path); shown instead of the gradient
  gallery?: string[]; // additional photos, shown after the article body
  embeds?: string[]; // YouTube embed URLs
  cat: Localized;
  date: Localized; // human-readable, per locale
  title: Localized;
  excerpt: Localized;
  body: PostBlock[];
  /** Optional link out — a Facebook post, an album, the original article.
      Set by the admin editor; the archive posts never carry one. */
  link?: string;
};

export const posts: Post[] = [
  {
    slug: "campanie-pregatire-sezon-rece",
    iso: "2026-07-10",
    cover: 1,
    cat: { ro: "Siguranță", ru: "Безопасность", en: "Safety" },
    date: { ro: "10 iulie 2026", ru: "10 июля 2026", en: "10 July 2026" },
    title: {
      ro: "Campanie națională: pregătește-ți coșul pentru sezonul rece",
      ru: "Национальная кампания: подготовьте дымоход к холодному сезону",
      en: "National campaign: get your chimney ready for the cold season",
    },
    excerpt: {
      ro: "ASFOCMD recomandă verificarea și curățarea coșurilor de fum înainte de începerea sezonului de încălzire.",
      ru: "ASFOCMD рекомендует проверить и очистить дымоходы до начала отопительного сезона.",
      en: "ASFOCMD recommends inspecting and sweeping chimneys before the heating season begins.",
    },
    body: [
      {
        p: {
          ro: "Vara este momentul ideal pentru întreținerea sistemelor de evacuare a fumului. Asociația Coșarilor din Moldova lansează campania anuală de informare privind pregătirea locuințelor pentru sezonul rece, cu accent pe verificarea coșurilor de fum, a sobelor și a centralelor termice.",
          ru: "Лето — идеальное время для обслуживания систем дымоудаления. Ассоциация трубочистов Молдовы запускает ежегодную информационную кампанию по подготовке жилья к холодному сезону, с акцентом на проверку дымоходов, печей и отопительных котлов.",
          en: "Summer is the ideal time to service flue systems. The Chimney Sweeps Association of Moldova is launching its annual awareness campaign on preparing homes for the cold season, focusing on the inspection of chimneys, stoves and heating boilers.",
        },
      },
      {
        h: {
          ro: "De ce contează verificarea anuală",
          ru: "Почему важна ежегодная проверка",
          en: "Why the annual inspection matters",
        },
        p: {
          ro: "Depunerile de funingine reduc tirajul și pot lua foc la temperaturi înalte, iar fisurile din coș permit pătrunderea monoxidului de carbon în locuință. O curățare profesională, efectuată de un coșar autorizat, elimină aceste riscuri și prelungește durata de viață a instalației de încălzire.",
          ru: "Отложения сажи уменьшают тягу и могут воспламениться при высоких температурах, а трещины в дымоходе пропускают угарный газ в жилище. Профессиональная чистка, выполненная сертифицированным трубочистом, устраняет эти риски и продлевает срок службы отопительной системы.",
          en: "Soot deposits reduce draught and can ignite at high temperatures, while cracks in the flue let carbon monoxide seep into the home. A professional sweep by a certified chimney sweep removes these risks and extends the life of the heating installation.",
        },
      },
      {
        p: {
          ro: "Membrii asociației, prezenți în majoritatea raioanelor țării, pot fi găsiți prin harta interactivă de pe prima pagină. Programările pentru lunile august–septembrie se fac de pe acum, pentru a evita aglomerația de la începutul sezonului.",
          ru: "Членов ассоциации, работающих в большинстве районов страны, можно найти на интерактивной карте на главной странице. Запись на август–сентябрь ведётся уже сейчас, чтобы избежать наплыва в начале сезона.",
          en: "Association members, active in most districts of the country, can be found via the interactive map on the homepage. Bookings for August–September are open now, to avoid the rush at the start of the season.",
        },
      },
    ],
  },
  {
    slug: "curs-formare-standard-european",
    iso: "2026-06-12",
    cover: 2,
    cat: { ro: "Instruire", ru: "Обучение", en: "Training" },
    date: { ro: "12 iunie 2026", ru: "12 июня 2026", en: "12 June 2026" },
    title: {
      ro: "Curs de formare la standard european",
      ru: "Курс подготовки по европейскому стандарту",
      en: "Training course to European standard",
    },
    excerpt: {
      ro: "Sesiune practică pentru construcția sobelor conform normelor UE.",
      ru: "Практическая сессия по строительству печей согласно нормам ЕС.",
      en: "Hands-on session on building stoves in line with EU standards.",
    },
    body: [
      {
        p: {
          ro: "Asociația a organizat o nouă sesiune de instruire practică dedicată construcției și reabilitării sobelor, în conformitate cu normele europene în vigoare. Cursul a reunit meșteri din mai multe raioane și a fost condus de formatori cu experiență internațională.",
          ru: "Ассоциация организовала новую практическую сессию, посвящённую строительству и восстановлению печей в соответствии с действующими европейскими нормами. Курс собрал мастеров из нескольких районов и проводился преподавателями с международным опытом.",
          en: "The association held a new hands-on training session dedicated to building and rehabilitating stoves in line with current European standards. The course brought together craftsmen from several districts and was led by trainers with international experience.",
        },
      },
      {
        p: {
          ro: "Participanții au lucrat pe machete reale, parcurgând etapele de dimensionare, zidire și verificare a tirajului. La final, fiecare cursant a primit un certificat de participare recunoscut de asociație.",
          ru: "Участники работали на реальных макетах, проходя этапы расчёта, кладки и проверки тяги. По завершении каждый слушатель получил сертификат участия, признаваемый ассоциацией.",
          en: "Participants worked on real mock-ups, going through the stages of sizing, bricklaying and draught testing. At the end, each trainee received a certificate of participation recognised by the association.",
        },
      },
      {
        p: {
          ro: "Următoarele sesiuni vor fi anunțate pe pagina de instruire. Membrii ASFOCMD beneficiază de prioritate la înscriere.",
          ru: "Следующие сессии будут анонсированы на странице обучения. Члены ASFOCMD имеют приоритет при записи.",
          en: "Upcoming sessions will be announced on the training page. ASFOCMD members get priority when registering.",
        },
      },
    ],
  },
  {
    slug: "adunarea-generala-2026",
    iso: "2026-05-28",
    cover: 3,
    cat: { ro: "Asociație", ru: "Ассоциация", en: "Association" },
    date: { ro: "28 mai 2026", ru: "28 мая 2026", en: "28 May 2026" },
    title: {
      ro: "Adunarea generală anuală 2026",
      ru: "Общее годовое собрание 2026",
      en: "Annual general assembly 2026",
    },
    excerpt: {
      ro: "Bilanțul activității și obiectivele pentru anul următor.",
      ru: "Итоги деятельности и цели на следующий год.",
      en: "A review of the year's activity and objectives for the next.",
    },
    body: [
      {
        p: {
          ro: "Membrii asociației s-au reunit la Chișinău pentru adunarea generală anuală. Președintele Alexei Golomoz a prezentat bilanțul activității: sesiuni de instruire organizate, membri noi atestați și pași concreți în dialogul cu autoritățile privind reglementarea profesiei de coșar.",
          ru: "Члены ассоциации собрались в Кишинёве на общее годовое собрание. Президент Алексей Голомоз представил итоги деятельности: проведённые учебные сессии, аттестация новых членов и конкретные шаги в диалоге с властями по регулированию профессии трубочиста.",
          en: "Association members gathered in Chișinău for the annual general assembly. President Alexei Golomoz presented the year's results: training sessions held, newly certified members and concrete steps in the dialogue with the authorities on regulating the chimney sweep profession.",
        },
      },
      {
        p: {
          ro: "Printre obiectivele votate pentru anul următor se numără extinderea rețelei de membri în raioanele încă neacoperite, lansarea noului site al asociației și continuarea programului de formare la standard european.",
          ru: "Среди целей, утверждённых на следующий год, — расширение сети членов в ещё не охваченных районах, запуск нового сайта ассоциации и продолжение программы подготовки по европейскому стандарту.",
          en: "Objectives approved for the coming year include expanding the member network into districts not yet covered, launching the association's new website and continuing the European-standard training programme.",
        },
      },
    ],
  },
  {
    slug: "congres-veuko-2026",
    iso: "2026-04-15",
    cover: 1,
    cat: { ro: "Internațional", ru: "Международное", en: "International" },
    date: { ro: "15 aprilie 2026", ru: "15 апреля 2026", en: "15 April 2026" },
    title: {
      ro: "Participare la congresul VEUKO",
      ru: "Участие в конгрессе VEUKO",
      en: "Taking part in the VEUKO congress",
    },
    excerpt: {
      ro: "Delegația ASFOCMD la întâlnirea europeană a hornarilor.",
      ru: "Делегация ASFOCMD на европейской встрече трубочистов.",
      en: "The ASFOCMD delegation at the European chimney sweeps' meeting.",
    },
    body: [
      {
        p: {
          ro: "O delegație a asociației a participat la congresul anual al VEUKO, federația europeană a maeștrilor coșari, din care ASFOCMD face parte. Congresul reunește asociațiile naționale din întreaga Europă pentru a discuta standardele profesiei, formarea și siguranța la foc.",
          ru: "Делегация ассоциации приняла участие в ежегодном конгрессе VEUKO — европейской федерации мастеров-трубочистов, членом которой является ASFOCMD. Конгресс объединяет национальные ассоциации со всей Европы для обсуждения стандартов профессии, обучения и пожарной безопасности.",
          en: "A delegation of the association took part in the annual congress of VEUKO, the European federation of master chimney sweeps, of which ASFOCMD is a member. The congress brings together national associations from across Europe to discuss professional standards, training and fire safety.",
        },
      },
      {
        p: {
          ro: "Apartenența la VEUKO oferă membrilor ASFOCMD acces la bune practici europene, materiale de instruire și o rețea de colegi din peste douăzeci de țări. Discuțiile din acest an s-au concentrat pe tranziția energetică și rolul coșarului în verificarea sistemelor moderne de încălzire.",
          ru: "Членство в VEUKO даёт членам ASFOCMD доступ к европейским лучшим практикам, учебным материалам и сети коллег из более чем двадцати стран. Обсуждения этого года были посвящены энергетическому переходу и роли трубочиста в проверке современных отопительных систем.",
          en: "VEUKO membership gives ASFOCMD members access to European best practices, training materials and a network of colleagues from more than twenty countries. This year's discussions focused on the energy transition and the sweep's role in inspecting modern heating systems.",
        },
      },
    ],
  },
  {
    slug: "protocol-igsu-prevenire-incendii",
    iso: "2026-03-03",
    cover: 2,
    cat: { ro: "Asociație", ru: "Ассоциация", en: "Association" },
    date: { ro: "3 martie 2026", ru: "3 марта 2026", en: "3 March 2026" },
    title: {
      ro: "Colaborare pentru prevenirea incendiilor casnice",
      ru: "Сотрудничество для предотвращения бытовых пожаров",
      en: "Working together to prevent household fires",
    },
    excerpt: {
      ro: "Asociația își propune un parteneriat cu autoritățile pentru campanii comune de prevenire.",
      ru: "Ассоциация планирует партнёрство с властями для совместных профилактических кампаний.",
      en: "The association is pursuing a partnership with the authorities for joint prevention campaigns.",
    },
    body: [
      {
        p: {
          ro: "Un număr semnificativ de incendii casnice din Moldova are drept cauză coșurile de fum defecte sau necurățate. ASFOCMD își propune să colaboreze cu autoritățile responsabile de situațiile excepționale pentru campanii comune de informare și prevenire, în special în mediul rural.",
          ru: "Значительная часть бытовых пожаров в Молдове происходит из-за неисправных или неочищенных дымоходов. ASFOCMD намерена сотрудничать с органами, отвечающими за чрезвычайные ситуации, в проведении совместных информационных и профилактических кампаний, особенно в сельской местности.",
          en: "A significant share of household fires in Moldova is caused by faulty or unswept chimneys. ASFOCMD aims to work with the authorities responsible for emergency situations on joint awareness and prevention campaigns, particularly in rural areas.",
        },
      },
      {
        p: {
          ro: "Printre acțiunile propuse: verificări gratuite pentru familii vulnerabile înaintea sezonului rece, materiale informative distribuite prin primării și un registru public al coșarilor autorizați, disponibil chiar pe acest site.",
          ru: "Среди предлагаемых мер: бесплатные проверки для уязвимых семей перед холодным сезоном, информационные материалы, распространяемые через примэрии, и публичный реестр сертифицированных трубочистов — прямо на этом сайте.",
          en: "Proposed actions include free inspections for vulnerable families ahead of the cold season, information materials distributed through town halls, and a public register of certified sweeps — available right here on this site.",
        },
      },
    ],
  },
];
