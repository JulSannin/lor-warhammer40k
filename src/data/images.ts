import type { SectionImage } from './types'

/**
 * Изображения лежат в public/img и отдаются вместе с сайтом. Раньше они
 * тянулись напрямую с CDN Fandom, но при прокрутке это давало рывки:
 * запрос уходил только когда кадр подходил к экрану, и на чужой сети
 * ответ приходил с заметной задержкой.
 *
 * Поле remote — исходная ссылка, по которой файл был получен. По ней же
 * работает scripts/fetch-images.mjs (npm run images): скрипт докачивает
 * недостающие файлы, ничего не трогая у уже скачанных.
 *
 * Все изображения — собственность Games Workshop Ltd.
 * Некоммерческое фанатское использование.
 */
export const images: Record<string, SectionImage[]> = {
  'war-in-heaven': [
    {
      src: './img/necrontyr-fan-art.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/29/Necrontyr_%28fan-art%29.png/revision/latest/scale-to-width-down/1600?cb=20210928144713&path-prefix=ru',
      alt: 'Некронтир на смертном одре',
      caption: 'Некронтир: раса, вся культура которой построена вокруг смерти',
      role: 'inline',
      afterHeading: 1,
      width: 1920,
      height: 1437,
    },
    {
      src: './img/march-of-necrons.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/7/75/March_of_necrons.jpg/revision/latest/scale-to-width-down/1600?cb=20200516093505&path-prefix=ru',
      alt: 'Марш некронов',
      caption: 'Некроны выжигали целые звёздные системы',
      role: 'inline',
      afterHeading: 3,
      width: 1600,
      height: 1168,
    },
    {
      src: './img/szarekh2.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/6/65/Szarekh2.jpg/revision/latest/scale-to-width-down/1600?cb=20250131185606',
      alt: 'Безмолвный Царь некронов',
      caption: 'Безмолвный Царь — тот, кто разбил К’тан и увёл свой народ в стазис',
      role: 'hero',
      width: 1536,
      height: 1128,
    },
    {
      src: './img/nightbringer-vs-deathwatch.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/9/93/Nightbringer_vs._Deathwatch.jpg/revision/latest/scale-to-width-down/1600?cb=20130203215343',
      alt: 'Ночной Странник',
      caption: 'Ночной Странник — один из К’тан, Звёздных богов',
      role: 'inline',
      afterHeading: 2,
      width: 1000,
      height: 714,
    },
    {
      src: './img/warp-gate.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/6/6c/Warp_Gate.jpg/revision/latest/scale-to-width-down/1600?cb=20151101182120',
      alt: 'Врата Паутины',
      caption: 'Паутина — сеть тоннелей вне реального пространства, наследие Древних',
      role: 'inline',
      afterHeading: 0,
      width: 900,
      height: 800,
    },
  ],
  'eldar-fall': [
    /*
     * Пантеон. Из восьми богов таблицы на вики есть арт только для трёх:
     * Асурьяна, Кхаина и Кегораха. По Ише, Курноусе, Вауле, Лилеат и
     * Морай-Хег нет ни одного файла — проверено поиском по именам файлов
     * на обеих вики, русской и английской. Кхаин идёт последним: при
     * нечётном числе картинок последняя занимает ряд целиком.
     */
    {
      src: './img/asuryan-the-creator-cosmos.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/2f/Asuryan_The_Creator-Cosmos.jpg/revision/latest/scale-to-width-down/1600?cb=20200708205238&path-prefix=ru',
      alt: 'Асурьян, Король-Феникс',
      caption: 'Асурьян — Владыка владык, чей дар эльдар — мудрость',
      role: 'inline',
      afterHeading: 0,
      contain: true,
      width: 707,
      height: 1129,
    },
    {
      src: './img/cegorach-harlequins.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/c/cc/Cegorach_Harlequins.png/revision/latest/scale-to-width-down/1600?cb=20151111000000&path-prefix=ru',
      alt: 'Кегорах, Смеющийся Бог',
      caption: 'Кегорах — трикстер и художник, укрывшийся от Слаанеш в Паутине',
      role: 'inline',
      afterHeading: 0,
      contain: true,
      width: 990,
      height: 1315,
    },
    {
      src: './img/bloody-handed-god.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/e/ea/Bloody-Handed_God.jpg/revision/latest/scale-to-width-down/1600?cb=20110927145831',
      alt: 'Кхаин, Кровавый Бог',
      caption:
        'Кхаин — бог войны и убийства, чей дар эльдар — ярость. После Падения разбит на осколки-Аватары',
      role: 'inline',
      afterHeading: 0,
      contain: true,
      width: 833,
      height: 1390,
    },
    {
      src: './img/falloftheeldar.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/0/08/FalloftheEldar.jpg/revision/latest/scale-to-width-down/1600?cb=20181029103610&path-prefix=ru',
      alt: 'Падение эльдар',
      caption: 'Рождение Слаанеш убило почти всю расу мгновенно',
      role: 'inline',
      afterHeading: 1,
      width: 1008,
      height: 720,
    },
    {
      src: './img/exodites-vs-astra-militarum-fan-art.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/6/6e/Exodites_vs_Astra_Militarum_%28fan-art%29.png/revision/latest/scale-to-width-down/1600?cb=20260129201755&path-prefix=ru',
      alt: 'Экзодиты',
      caption: 'Экзодиты ушли на аграрные миры ещё до Падения',
      role: 'inline',
      afterHeading: 2,
      width: 1920,
      height: 824,
    },
    {
      src: './img/aspectwarriors2.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/b/bf/AspectWarriors2.jpg/revision/latest/scale-to-width-down/1600?cb=20200911172301',
      alt: 'Аспектные Воины эльдар',
      caption:
        'Путь Воина — дисциплина, которой кораблемиры удерживают себя от повторения Падения',
      role: 'hero',
      width: 3840,
      height: 2160,
    },
    {
      src: './img/iyanden.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/1/11/Iyanden.jpg/revision/latest/scale-to-width-down/1600?cb=20150317235539',
      alt: 'Кораблемир Иянден',
      caption: 'Иянден — один из кораблей-континентов, ушедших до Падения',
      role: 'inline',
      afterHeading: 2,
      width: 1618,
      height: 682,
    },
    {
      src: './img/portoflostsouls.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/8/84/PortofLostSouls.jpg/revision/latest/scale-to-width-down/1600?cb=20170523002749',
      alt: 'Коморра',
      caption: 'Коморра — город друкари внутри Паутины',
      role: 'inline',
      afterHeading: 2,
      width: 2254,
      height: 1614,
    },
  ],
  'pre-imperium': [
    {
      src: './img/temnaya-era-tehnologiy.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/8/8d/%D0%A2%D1%91%D0%BC%D0%BD%D0%B0%D1%8F_%D0%AD%D1%80%D0%B0_%D0%A2%D0%B5%D1%85%D0%BD%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D0%B9.jpg/revision/latest/scale-to-width-down/1600?cb=20180502100705&path-prefix=ru',
      alt: 'Города Тёмной Эры Технологий',
      caption: 'Золотой век: тысячи миров, автономные машины, продление жизни',
      role: 'inline',
      afterHeading: 0,
      width: 1333,
      height: 603,
    },
    {
      src: './img/tech-barbarians-fan-art.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/28/Tech-Barbarians_%28fan-art%29.png/revision/latest/scale-to-width-down/1600?cb=20260708152710&path-prefix=ru',
      alt: 'Техно-варлорды',
      caption: 'Терра Эры Раздора: поле битвы техно-варлордов',
      role: 'inline',
      afterHeading: 1,
      width: 1920,
      height: 893,
    },
    {
      src: './img/waves-of-the-warp.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/3/36/Waves_of_the_Warp.jpg/revision/latest/scale-to-width-down/1600?cb=20190609035307&path-prefix=ru',
      alt: 'Варп-шторм',
      caption: 'Варп взбесился: шторма отрезали миры друг от друга на тысячелетия',
      role: 'hero',
      width: 1900,
      height: 1200,
    },
    {
      src: './img/witchsight.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/1/15/Witchsight.jpg/revision/latest/scale-to-width-down/1600?cb=20230325173753',
      alt: 'Пробуждение псайкера',
      caption: 'Пробуждение псайкера обычно заканчивалось демоническим вторжением',
      role: 'inline',
      afterHeading: 1,
      width: 1449,
      height: 942,
    },
  ],
  'emperor-crusade': [
    {
      src: './img/lion-by-d1sarmon1a-d7lsghj.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/5/5d/Lion_by_d1sarmon1a-d7lsghj.jpg/revision/latest/scale-to-width-down/1600?cb=20170520174501&path-prefix=ru',
      alt: 'Лев Эль’Джонсон',
      caption: 'Лев Эль’Джонсон — Тёмные Ангелы',
      role: 'primarch',
      primarch: 'I',
      width: 625,
      height: 980,
    },
    {
      src: './img/phoenician-by-d1sarmon1a-d8maucc.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/3/3c/Phoenician_by_d1sarmon1a-d8maucc.jpg/revision/latest/scale-to-width-down/1600?cb=20160424162222&path-prefix=ru',
      alt: 'Фулгрим',
      caption: 'Фулгрим — Дети Императора',
      role: 'primarch',
      primarch: 'III',
      width: 625,
      height: 980,
    },
    {
      src: './img/perturabo-by-d1sarmon1a-d8q6lzp.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/2e/Perturabo_by_d1sarmon1a-d8q6lzp.jpg/revision/latest/scale-to-width-down/1600?cb=20160424162244&path-prefix=ru',
      alt: 'Пертурабо',
      caption: 'Пертурабо — Железные Воины',
      role: 'primarch',
      primarch: 'IV',
      width: 625,
      height: 980,
    },
    {
      src: './img/jaghatai-khan.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/4/49/Jaghatai_Khan.jpg/revision/latest/scale-to-width-down/1600?cb=20151119191535&path-prefix=ru',
      alt: 'Джагатай Хан',
      caption: 'Джагатай Хан — Белые Шрамы',
      role: 'primarch',
      primarch: 'V',
      width: 600,
      height: 940,
    },
    {
      src: './img/lemanrussportrait.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/28/LemanRussPortrait.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153746&path-prefix=ru',
      alt: 'Леман Русс',
      caption: 'Леман Русс — Космические Волки',
      role: 'primarch',
      primarch: 'VI',
      width: 625,
      height: 980,
    },
    {
      src: './img/rogaldornart.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/6/6d/RogalDornArt.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153558&path-prefix=ru',
      alt: 'Рогал Дорн',
      caption: 'Рогал Дорн — Имперские Кулаки',
      role: 'primarch',
      primarch: 'VII',
      width: 625,
      height: 980,
    },
    {
      src: './img/konradcurzearthh.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/8/88/KonradCurzeArtHH.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153409&path-prefix=ru',
      alt: 'Конрад Кёрз',
      caption: 'Конрад Кёрз — Повелители Ночи',
      role: 'primarch',
      primarch: 'VIII',
      width: 625,
      height: 980,
    },
    {
      src: './img/sanguinius.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/a/af/Sanguinius.jpg/revision/latest/scale-to-width-down/1600?cb=20151124111918&path-prefix=ru',
      alt: 'Сангвиний',
      caption: 'Сангвиний — Кровавые Ангелы',
      role: 'primarch',
      primarch: 'IX',
      width: 600,
      height: 940,
    },
    {
      src: './img/ferrusmanusarthh.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/9/99/FerrusManusArtHH.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153527&path-prefix=ru',
      alt: 'Феррус Манус',
      caption: 'Феррус Манус — Железные Руки',
      role: 'primarch',
      primarch: 'X',
      width: 625,
      height: 980,
    },
    {
      src: './img/angron-by-d1sarmon1a-d84dn5q.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/3/3e/Angron_by_d1sarmon1a-d84dn5q.jpg/revision/latest/scale-to-width-down/1600?cb=20170520174652&path-prefix=ru',
      alt: 'Ангрон',
      caption: 'Ангрон — Пожиратели Миров',
      role: 'primarch',
      primarch: 'XII',
      width: 625,
      height: 980,
    },
    {
      src: './img/guilliman-sketch.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/c/c2/Guilliman_Sketch.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153639&path-prefix=ru',
      alt: 'Робаут Жиллиман',
      caption: 'Робаут Жиллиман — Ультрамарины',
      role: 'primarch',
      primarch: 'XIII',
      width: 625,
      height: 980,
    },
    {
      src: './img/mortarion-by-d1sarmon1a-d8kwq1h.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/c/c3/Mortarion_by_d1sarmon1a-d8kwq1h.jpg/revision/latest/scale-to-width-down/1600?cb=20160424162059&path-prefix=ru',
      alt: 'Мортарион',
      caption: 'Мортарион — Гвардия Смерти',
      role: 'primarch',
      primarch: 'XIV',
      width: 625,
      height: 980,
    },
    {
      src: './img/magnus.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/21/Magnus.jpg/revision/latest/scale-to-width-down/1600?cb=20180615165359&path-prefix=ru',
      alt: 'Магнус Красный',
      caption: 'Магнус Красный — Тысяча Сынов',
      role: 'primarch',
      primarch: 'XV',
      width: 625,
      height: 980,
    },
    {
      src: './img/warmaster-horus-remembrancer-sketch.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/e/ed/Warmaster_Horus_Remembrancer_Sketch.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153246&path-prefix=ru',
      alt: 'Хорус',
      caption: 'Хорус — Сыны Хоруса',
      role: 'primarch',
      primarch: 'XVI',
      width: 625,
      height: 980,
    },
    {
      src: './img/675px-lorgarportrait.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/d/d6/675px-LorgarPortrait.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153819&path-prefix=ru',
      alt: 'Лоргар',
      caption: 'Лоргар — Несущие Слово',
      role: 'primarch',
      primarch: 'XVII',
      width: 625,
      height: 980,
    },
    {
      src: './img/vulkanarthh.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/28/VulkanArtHH.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153847&path-prefix=ru',
      alt: 'Вулкан',
      caption: 'Вулкан — Саламандры',
      role: 'primarch',
      primarch: 'XVIII',
      width: 625,
      height: 980,
    },
    {
      src: './img/628px-coraxportrait.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/f/fd/628px-CoraxPortrait.jpg/revision/latest/scale-to-width-down/1600?cb=20160424153448&path-prefix=ru',
      alt: 'Корвус Коракс',
      caption: 'Корвус Коракс — Гвардия Ворона',
      role: 'primarch',
      primarch: 'XIX',
      width: 625,
      height: 980,
    },
    {
      src: './img/alphariusart.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/7/78/AlphariusArt.jpg/revision/latest/scale-to-width-down/1600?cb=20160424152752&path-prefix=ru',
      alt: 'Альфарий',
      caption: 'Альфарий — Альфа-Легион',
      role: 'primarch',
      primarch: 'XX',
      width: 625,
      height: 980,
    },
    {
      src: './img/emperor-of-mankind-great-crusade.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/f/fb/Emperor_of_Mankind_%28Great_Crusade%29.jpg/revision/latest/scale-to-width-down/1600?cb=20170827172743&path-prefix=ru',
      alt: 'Император ведёт Крестовый Поход',
      caption: 'Император вышел из тени, когда варп-шторма начали стихать',
      role: 'inline',
      afterHeading: 0,
      width: 1280,
      height: 854,
    },
    {
      src: './img/the-primarchs.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/a/aa/The_Primarchs.jpg/revision/latest/scale-to-width-down/1600?cb=20171210211743',
      alt: 'Примархи',
      caption: 'Двадцать примархов — и двадцать разных детств на двадцати чужих мирах',
      role: 'hero',
      width: 1920,
      height: 1080,
    },
    {
      src: './img/legio-custodes-gal-vorbak.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/3/3c/Legio_Custodes_Gal_Vorbak.jpg/revision/latest/scale-to-width-down/1600?cb=20141227205416',
      alt: 'Легио Кустодес',
      caption: 'Кустодии — те, кто вырезал Громовых Воинов на пиру',
      role: 'inline',
      afterHeading: 1,
      width: 2560,
      height: 1440,
    },
    {
      src: './img/malcadorhorusheresy.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/5/54/MalcadorHorusHeresy.jpg/revision/latest/scale-to-width-down/1600?cb=20250926152559',
      alt: 'Малкадор Сигиллит',
      caption: 'Малкадор Сигиллит, Имперский Регент',
      role: 'inline',
      afterHeading: 3,
      width: 1920,
      height: 1114,
    },
  ],
  'horus-heresy': [
    {
      src: './img/the-coronation-of-the-warmaster-fan-art.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/4/4f/The_Coronation_of_The_Warmaster_%28fan-art%29.jpg/revision/latest/scale-to-width-down/1600?cb=20240521180854&path-prefix=ru',
      alt: 'Коронация Военного Магистра',
      caption: 'Хорус принимает титул Военного Магистра — за девять лет до Осады Терры',
      role: 'inline',
      afterHeading: 0,
      width: 1920,
      height: 1079,
    },
    {
      src: './img/betrayal-istvaan-iii.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/a/a1/Betrayal_Istvaan_III.jpg/revision/latest/scale-to-width-down/1600?cb=20121017031734',
      alt: 'Изстван III в огне',
      caption: 'Хорус сбросил вирусные бомбы на планету, где стояли его собственные лоялисты',
      role: 'inline',
      afterHeading: 1,
      width: 1594,
      height: 862,
    },
    {
      src: './img/urgall-depression-initial-assault.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/b/bc/Urgall_Depression_Initial_Assault.jpg/revision/latest/scale-to-width-down/1600?cb=20140415174943',
      alt: 'Высадка на Изстване V',
      caption: 'Семь легионов на одной площадке высадки: четыре из них уже были предателями',
      role: 'inline',
      afterHeading: 2,
      width: 1597,
      height: 895,
    },
    {
      src: './img/sanguinius-death-fan-art.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/1/1a/Sanguinius_death_%28fan-art%29.jpg/revision/latest/scale-to-width-down/1600?cb=20241230001454&path-prefix=ru',
      alt: 'Гибель Сангвиния',
      caption: 'Сангвиний знал о своей смерти заранее и всё равно вышел один',
      role: 'inline',
      afterHeading: 4,
      width: 1920,
      height: 1043,
    },
    {
      src: './img/horus-heresy-visions-of-heresy.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/7/77/Horus_Heresy_visions_of_heresy.jpg/revision/latest/scale-to-width-down/1600?cb=20210327215616&path-prefix=ru',
      alt: 'Император против Хоруса на Мстительном Духе',
      caption: 'Император вложил всё, что имел, и стёр Хоруса из существования',
      role: 'inline',
      afterHeading: 4,
      width: 2560,
      height: 1193,
    },
    {
      src: './img/isstvan-v-massacre.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/a/ae/Isstvan_V_Massacre.jpg/revision/latest/scale-to-width-down/1600?cb=20210317123807',
      alt: 'Резня на площадке высадки',
      caption: 'Изстван V: вторая волна открыла огонь по своим',
      role: 'hero',
      width: 1920,
      height: 1080,
    },
    {
      src: './img/scouring-of-prospero2.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/8/84/Scouring_of_Prospero2.jpg/revision/latest/scale-to-width-down/1600?cb=20161116084326',
      alt: 'Сожжение Просперо',
      caption: 'Просперо сожгли по приказу, который Хорус подменил в пути',
      role: 'inline',
      afterHeading: 3,
      width: 2880,
      height: 1620,
    },
    {
      src: './img/emp-vs-horus-battle-terra.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/a/a1/Emp_vs_Horus_Battle_Terra.png/revision/latest/scale-to-width-down/1600?cb=20180616200410',
      alt: 'Император против Хоруса',
      caption: 'Император стёр Хоруса из существования — тело, дух и душу',
      role: 'inline',
      afterHeading: 4,
      width: 2228,
      height: 1428,
    },
    {
      src: './img/golden-throneffg.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/b/ba/Golden_ThroneFFG.jpg/revision/latest/scale-to-width-down/1600?cb=20200625210800',
      alt: 'Золотой Трон',
      caption: 'Золотой Трон: ни жив, ни мёртв',
      role: 'inline',
      afterHeading: 4,
      width: 2490,
      height: 1440,
    },
  ],
  'ten-thousand-years': [
    {
      src: './img/ultramariny-idut-v-boy.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/9/9d/%D0%A3%D0%BB%D1%8C%D1%82%D1%80%D0%B0%D0%BC%D0%B0%D1%80%D0%B8%D0%BD%D1%8B_%D0%B8%D0%B4%D1%83%D1%82_%D0%B2_%D0%B1%D0%BE%D0%B9.jpg/revision/latest/scale-to-width-down/1600?cb=20170707091456&path-prefix=ru',
      alt: 'Ультрамарины',
      caption: 'Кодекс Астартес разбил легионы по сто тысяч на ордены по тысяче',
      role: 'inline',
      afterHeading: 0,
      width: 1920,
      height: 1110,
    },
    {
      src: './img/ork-waaagh-armageddon.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/1/16/Ork_Waaagh%21_Armageddon.png/revision/latest/scale-to-width-down/1600?cb=20140723171409',
      alt: 'Орочья волна',
      caption: 'Война Зверя: тяжёлые бои шли в каждом сегментуме Империума одновременно',
      role: 'inline',
      afterHeading: 2,
      width: 1822,
      height: 681,
    },
    {
      src: './img/inquisitor-in-the-archive.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/8/81/Inquisitor_in_the_Archive.png/revision/latest/scale-to-width-down/1600?cb=20220926123126&path-prefix=ru',
      alt: 'Инквизитор в архиве',
      caption: 'Знание стало опасным: его хранят, но не понимают',
      role: 'inline',
      afterHeading: 1,
      width: 1920,
      height: 1086,
    },
    {
      src: './img/1310806467-a545454way.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/3/38/1310806467_a545454way.jpg/revision/latest/scale-to-width-down/1600?cb=20151012115543&path-prefix=ru',
      alt: 'Сестра Битвы',
      caption: 'Сёстры Битвы: формулировку про «мужчин под ружьём» обошли с блеском',
      role: 'inline',
      afterHeading: 3,
      width: 1000,
      height: 659,
    },
    {
      src: './img/death-korps-of-krieg-ceremony.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/d/d2/Death_Korps_of_Krieg_Ceremony.jpg/revision/latest/scale-to-width-down/1600?cb=20170827214653&path-prefix=ru',
      alt: 'Имперская церемония',
      caption: 'Бюрократия такого масштаба, что приказ может идти столетиями',
      role: 'inline',
      afterHeading: 4,
      width: 1221,
      height: 906,
    },
    {
      src: './img/2070-catachan-imperial-guard.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/4/41/2070_catachan.imperial_guard.jpg/revision/latest/scale-to-width-down/1600?cb=20130213065232',
      alt: 'Астра Милитарум',
      caption: 'Средняя продолжительность жизни имперского гвардейца в бою — минуты',
      role: 'hero',
      width: 1411,
      height: 894,
    },
  ],
  chaos: [
    {
      src: './img/traitors.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/b/bd/Traitors.jpg/revision/latest/scale-to-width-down/1600?cb=20170401145945',
      alt: 'Космодесант Хаоса',
      caption: 'Предатели, ушедшие в Око Ужаса десять тысяч лет назад',
      role: 'hero',
      width: 2560,
      height: 1440,
    },
    {
      src: './img/khorne-by-alexboca.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/c/c4/Khorne_by_alexboca.jpg/revision/latest/scale-to-width-down/1600?cb=20140603022205',
      alt: 'Кхорн',
      caption: 'Кхорн — Бог Крови',
      role: 'inline',
      afterHeading: 0,
      width: 1136,
      height: 811,
    },
    {
      src: './img/daemon-primarch-mortarion-closeup-igor-sid.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/9/92/Daemon_Primarch_Mortarion_Closeup_Igor_Sid.png/revision/latest/scale-to-width-down/1600?cb=20190321163348',
      alt: 'Мортарион',
      caption: 'Нургл — Дедушка Чума',
      role: 'inline',
      afterHeading: 1,
      width: 1206,
      height: 882,
    },
    {
      src: './img/937084-tzeentchspawn.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/6/6d/937084-tzeentchspawn.jpg/revision/latest/scale-to-width-down/1600?cb=20111021201940',
      alt: 'Отродье Тзинча',
      caption: 'Тзинч — Изменяющий Пути',
      role: 'inline',
      afterHeading: 2,
      width: 3309,
      height: 2376,
    },
    {
      src: './img/nkaritotalwarwarhammeriii.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/d/dc/N%27KariTotalWarWarhammerIII.webp/revision/latest/scale-to-width-down/1600?cb=20240913160419',
      alt: 'Хранитель Секретов',
      caption: 'Слаанеш — Тёмный Принц',
      role: 'inline',
      afterHeading: 3,
      width: 3840,
      height: 2158,
    },
    {
      src: './img/blackcrusades3.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/e/ea/BlackCrusades3.jpg/revision/latest/scale-to-width-down/1600?cb=20130831031102',
      alt: 'Чёрный Крестовый Поход',
      caption: 'Тринадцать Чёрных Крестовых Походов Абаддона',
      role: 'inline',
      width: 1199,
      height: 869,
    },
  ],
  xenos: [
    {
      src: './img/tyranid-hive-fleet.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/a/a6/Tyranid_Hive_Fleet.png/revision/latest/scale-to-width-down/1600?cb=20200704095157&path-prefix=ru',
      alt: 'Флот-улей тиранидов',
      caption: 'Флот приходит, пожирает всю биомассу до голого камня и летит дальше',
      role: 'inline',
      afterHeading: 1,
      width: 1819,
      height: 758,
    },
    {
      src: './img/belisarius-cawl-and-trazin.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/9/92/Belisarius_Cawl_and_Trazin.jpg/revision/latest/scale-to-width-down/1600?cb=20200527192021&path-prefix=ru',
      alt: 'Белизарий Каул и Тразин Неисчислимый',
      caption: 'Тразин Неисчислимый — некрон-коллекционер, ворующий живых для музея',
      role: 'inline',
      afterHeading: 2,
      width: 1920,
      height: 938,
    },
    {
      src: './img/orkarmyarmageddon.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/9/9e/OrkArmyArmageddon.jpg/revision/latest/scale-to-width-down/1600?cb=20260330004144',
      alt: 'Орочий ВААААГХ!',
      caption: 'ВААААГХ! — религия, миграция и волна разрушения одновременно',
      role: 'hero',
      width: 1920,
      height: 1071,
    },
    {
      src: './img/gork-mork.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/1/18/Gork_%26_Mork.png/revision/latest/scale-to-width-down/1600?cb=20190928204109&path-prefix=ru',
      alt: 'Горк и Морк',
      caption: 'Горк — брутально хитрый, Морк — хитро брутальный',
      role: 'inline',
      afterHeading: 0,
      width: 1304,
      height: 766,
    },
    {
      src: './img/tyranidsvchaos.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/7/75/TyranidsvChaos.jpg/revision/latest/scale-to-width-down/1600?cb=20191011182202',
      alt: 'Тираниды',
      caption: 'Тираниды — не завоеватели, а пищеварительная система',
      role: 'inline',
      afterHeading: 1,
      width: 1558,
      height: 906,
    },
    {
      src: './img/necron-warriors-vs-um.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/3/33/Necron_Warriors_vs_UM.png/revision/latest/scale-to-width-down/1600?cb=20160811061758',
      alt: 'Некроны',
      caption: 'Гробницы открываются по всей галактике',
      role: 'inline',
      afterHeading: 2,
      width: 1145,
      height: 828,
    },
    {
      src: './img/fire-caste.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/8/83/Fire_Caste.jpg/revision/latest/scale-to-width-down/1600?cb=20170718165335',
      alt: 'Каста Огня Т’ау',
      caption: 'Каста Огня — воины Высшего Блага',
      role: 'inline',
      afterHeading: 3,
      width: 1200,
      height: 726,
    },
  ],
  indomitus: [
    {
      src: './img/warhammer40k-galaxy.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/4/45/Warhammer40k_Galaxy.jpg/revision/latest/scale-to-width-down/1600?cb=20180304104716&path-prefix=ru',
      alt: 'Карта галактики с Цикатрикс Маледиктум',
      caption:
        'Великий Разлом рассёк галактику пополам: всё, что отрезано от Астрономикона, — Империум Нихилус',
      role: 'inline',
      afterHeading: 1,
      contain: true,
      width: 2900,
      height: 2000,
    },
    {
      src: './img/fallencadia.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/e/e2/FallenCadia.jpg/revision/latest/scale-to-width-down/1600?cb=20210906181852',
      alt: 'Павшая Кадия',
      caption: 'Планета-крепость, десять тысяч лет запиравшая выход из Ока Ужаса',
      role: 'inline',
      afterHeading: 0,
      width: 3840,
      height: 1748,
    },
    {
      src: './img/imperial-palace-terra.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/b/ba/Imperial_Palace_Terra.jpg/revision/latest/scale-to-width-down/1600?cb=20180815130552&path-prefix=ru',
      alt: 'Императорский дворец на Терре',
      caption: 'Жиллиман прошёл Паутиной на Терру и поговорил с отцом',
      role: 'inline',
      afterHeading: 2,
      width: 2560,
      height: 1189,
    },
    {
      src: './img/the-war-for-cadia.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/2d/The_War_for_Cadia.jpeg/revision/latest/scale-to-width-down/1600?cb=20170128205609',
      alt: 'Война за Кадию',
      caption: 'Кадия сломалась, но она не согнулась',
      role: 'hero',
      width: 2560,
      height: 1570,
    },
    {
      src: './img/primaris-astartes-mars.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/5/57/Primaris_Astartes_Mars.png/revision/latest/scale-to-width-down/1600?cb=20170813145734&path-prefix=ru',
      alt: 'Примарис-космодесантники',
      caption: 'Примарис — итог десяти тысяч лет тайной работы Белизария Каула',
      role: 'inline',
      afterHeading: 2,
      width: 1918,
      height: 866,
    },
    {
      src: './img/guillimaneraindomirus.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/9/96/GuillimanEraIndomirus.jpg/revision/latest/scale-to-width-down/1600?cb=20230324140231',
      alt: 'Робаут Жиллиман',
      caption: 'Жиллиман вышел из Тронного Зала изменившимся',
      role: 'inline',
      afterHeading: 2,
      width: 2100,
      height: 1155,
    },
    {
      src: './img/plague-wars-official-art.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/7/77/Plague_Wars_Official_Art.jpeg/revision/latest/scale-to-width-down/1600?cb=20230705140611',
      alt: 'Чумные Войны',
      caption: 'Мортарион лично вторгся в Ультрамар',
      role: 'inline',
      afterHeading: 3,
      width: 3072,
      height: 2048,
    },
    {
      src: './img/thelionversusangron.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/f/f9/TheLionVersusAngron.jpg/revision/latest/scale-to-width-down/1600?cb=20230324162050',
      alt: 'Лев против Ангрона',
      caption: 'Лев Эль’Джонсон вернулся после десяти тысяч лет',
      role: 'inline',
      afterHeading: 3,
      width: 2100,
      height: 1134,
    },
  ],
  thesis: [
    {
      src: './img/imperial-library.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/2/23/Imperial_Library.jpg/revision/latest/scale-to-width-down/1600?cb=20250213230828&path-prefix=ru',
      alt: 'Имперская библиотека',
      caption: 'Он получил религию своего имени, инквизицию и сожжённые библиотеки',
      role: 'inline',
      width: 3352,
      height: 1818,
    },
    {
      src: './img/emperors-thirst.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/0/0c/Emperors_Thirst.png/revision/latest/scale-to-width-down/1600?cb=20130417202128',
      alt: 'Псайкеров ведут к Золотому Трону',
      caption: 'Тысяча псайкеров в день — только чтобы корабли могли летать',
      role: 'hero',
      width: 1587,
      height: 868,
    },
  ],
  disputed: [
    {
      src: './img/slann-hieroglyphs-sketch.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/6/65/Slann_Hieroglyphs_Sketch.jpg/revision/latest/scale-to-width-down/1600?cb=20160720181446',
      alt: 'Слаан и иероглифы, Rogue Trader',
      caption:
        'Разворот из Rogue Trader: именно там Слааны были той древней расой, что научила эльдар строить Паутину',
      role: 'inline',
      afterHeading: 0,
      plate: true,
      width: 1146,
      height: 810,
    },
    {
      src: './img/carrionlordoftheimperium.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/8/8b/CarrionLordoftheImperium.jpg/revision/latest/scale-to-width-down/1600?cb=20260612174346',
      alt: 'Император на Золотом Троне',
      caption:
        'Император многократно уличён во лжи о собственном прошлом. Вопрос оставлен открытым',
      role: 'inline',
      afterHeading: 2,
      width: 1327,
      height: 725,
    },
    {
      src: './img/custodes-art-1.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/e/e8/Custodes%2C_Art_%281%29.png/revision/latest/scale-to-width-down/1600?cb=20181118114458&path-prefix=ru',
      alt: 'Легио Кустодес',
      caption: 'По второй версии защитником был кустодий — реткон, объясняющий, как он выжил',
      role: 'inline',
      afterHeading: 1,
      width: 1600,
      height: 703,
    },
    {
      src: './img/dorn-vs-alpha-legion.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/c/cb/Dorn_vs_Alpha_Legion.jpg/revision/latest/scale-to-width-down/1600?cb=20180702180558&path-prefix=ru',
      alt: 'Дорн против Альфа-Легиона',
      caption: 'На чьей стороне играл Альфа-Легион, лор так и не разрешил',
      role: 'inline',
      afterHeading: 3,
      width: 1000,
      height: 629,
    },
    {
      src: './img/emperor-vs-horus.webp',
      remote:
        'https://static.wikia.nocookie.net/warhammer40k/images/3/3f/Emperor_VS_Horus.jpg/revision/latest/scale-to-width-down/1600?cb=20120414071343',
      alt: 'Император, Хорус и павший защитник',
      caption: 'Кем был защитник у ног Хоруса — лор менял ответ трижды',
      role: 'hero',
      width: 1600,
      height: 1169,
    },
  ],
}
