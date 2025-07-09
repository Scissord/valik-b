/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('category').del();

  await knex('category').insert([
    {
      id: 1,
      title: "Обои",
      parent_id: null,
    },
    {
      id: 2,
      title: "Рулонные обои",
      parent_id: 1,
    },
    {
      id: 3,
      title: "Обои под покраску",
      parent_id: 1,
    },
    {
      id: 4,
      title: "Жидкие обои",
      parent_id: 1,
    },
    {
      id: 5,
      title: "Фотообои",
      parent_id: 1,
    },
    {
      id: 6,
      title: "Стеклообои",
      parent_id: 1,
    },
    {
      id: 7,
      title: "Самоклеющаяся плёнка",
      parent_id: 1,
    },
    {
      id: 8,
      title: "Обои новинки",
      parent_id: 1,
    },
    {
      id: 9,
      title: "Сантехника",
      parent_id: null,
    },
    {
      id: 10,
      title: "Ванны",
      parent_id: 9,
    },
    {
      id: 11,
      title: "Душевые кабины",
      parent_id: 9,
    },
    {
      id: 12,
      title: "Душевые лейки, шланги",
      parent_id: 9,
    },
    {
      id: 13,
      title: "Душевые поддоны и перегородки",
      parent_id: 9,
    },
    {
      id: 14,
      title: "Душевые системы",
      parent_id: 9,
    },
    {
      id: 15,
      title: "Инсталляции",
      parent_id: 9,
    },
    {
      id: 16,
      title: "Мойки кухонные",
      parent_id: 9,
    },
    {
      id: 17,
      title: "Писсуары",
      parent_id: 9,
    },
    {
      id: 18,
      title: "Полотенцесушители",
      parent_id: 9,
    },
    {
      id: 19,
      title: "Раковины",
      parent_id: 9,
    },
    {
      id: 20,
      title: "Сифоны, обвязка",
      parent_id: 9,
    },
    {
      id: 21,
      title: "Смесители",
      parent_id: 9,
    },
    {
      id: 22,
      title: "Трап для душа",
      parent_id: 9,
    },
    {
      id: 23,
      title: "Унитазы",
      parent_id: 9,
    },
    {
      id: 24,
      title: "Аксессуары",
      parent_id: 9,
    },
    {
      id: 25,
      title: "Биде",
      parent_id: 9,
    },
    {
      id: 26,
      title: "Ревизионные люди",
      parent_id: 9,
    },
    {
      id: 27,
      title: "Покрытия для пола",
      parent_id: null,
    },
    {
      id: 28,
      title: "SPC плитка",
      parent_id: 27,
    },
    {
      id: 29,
      title: "Ламинат",
      parent_id: 27,
    },
    {
      id: 30,
      title: "Линолеум",
      parent_id: 27,
    },
    {
      id: 31,
      title: "Доска террасная и комплектующие",
      parent_id: 27,
    },
    {
      id: 32,
      title: "Ковролан",
      parent_id: 27,
    },
    {
      id: 33,
      title: "Паркет",
      parent_id: 27,
    },
    {
      id: 34,
      title: "Ковры и придверные коврики",
      parent_id: 27,
    },
    {
      id: 35,
      title: "Коврики для ванных комнат",
      parent_id: 27,
    },
    {
      id: 36,
      title: "Плинтусы",
      parent_id: 27,
    },
    {
      id: 37,
      title: "Пороги, стыки",
      parent_id: 27,
    },
    {
      id: 38,
      title: "Щетинистые коврики",
      parent_id: 27,
    },
    {
      id: 39,
      title: "Подложка",
      parent_id: 27,
    },
    {
      id: 40,
      title: "Искусственная трава",
      parent_id: 27,
    },
    {
      id: 41,
      title: "Ковровые дорожки",
      parent_id: 27,
    },
    {
      id: 42,
      title: "Кафель",
      parent_id: null,
    },
    {
      id: 43,
      title: "Керамогранит",
      parent_id: 42,
    },
    {
      id: 44,
      title: "Напольная плитка",
      parent_id: 42,
    },
    {
      id: 45,
      title: "Облицовочная плитка",
      parent_id: 42,
    },
    {
      id: 46,
      title: "Декоративные элементы",
      parent_id: 42,
    },
    {
      id: 47,
      title: "Плитка мозаика",
      parent_id: 42,
    },
    {
      id: 48,
      title: "Клинкерная плитка",
      parent_id: 42,
    },
    {
      id: 49,
      title: "Декоративные камни",
      parent_id: 42,
    },
    {
      id: 50,
      title: "Раскладки под плитку",
      parent_id: 42,
    },
    {
      id: 51,
      title: "Крестики и СВП для кафеля",
      parent_id: 42,
    },
    {
      id: 52,
      title: "Двери и фурнитура",
      parent_id: null,
    },
    {
      id: 53,
      title: "Арки",
      parent_id: 52,
    },
    {
      id: 54,
      title: "Входные двери",
      parent_id: 52,
    },
    {
      id: 55,
      title: "Двери для бани",
      parent_id: 52,
    },
    {
      id: 56,
      title: "Дверная фурнитура",
      parent_id: 52,
    },
    {
      id: 57,
      title: "Межкомнатные двери",
      parent_id: 52,
    },
    {
      id: 58,
      title: "Арки с ПВХ покрытием",
      parent_id: 53,
    },
    {
      id: 59,
      title: "Доводчики дверные",
      parent_id: 56,
    },
    {
      id: 60,
      title: "Замки врезные",
      parent_id: 56,
    },
    {
      id: 61,
      title: "Замки навесные",
      parent_id: 56,
    },
    {
      id: 62,
      title: "Замки накладные",
      parent_id: 56,
    },
    {
      id: 63,
      title: "Защелки и задвижки дверные",
      parent_id: 56,
    },
    {
      id: 64,
      title: "Накладки и фиксаторы",
      parent_id: 56,
    },
    {
      id: 65,
      title: "Ограничители дверные",
      parent_id: 56,
    },
    {
      id: 66,
      title: "Петли дверные",
      parent_id: 56,
    },
    {
      id: 67,
      title: "Ручки дверные",
      parent_id: 56,
    },
    {
      id: 68,
      title: "Цилиндры дверные",
      parent_id: 56,
    },
    {
      id: 69,
      title: "Дверные комплектующие",
      parent_id: 57,
    },
    {
      id: 70,
      title: "Межкомнатные двери со стеклом",
      parent_id: 57,
    },
    {
      id: 71,
      title: "Двери под покраску межкомнатные",
      parent_id: 57,
    },
    {
      id: 72,
      title: "Мебель",
      parent_id: null,
    },
    {
      id: 73,
      title: "Кровати",
      parent_id: 72,
    },
    {
      id: 74,
      title: "Столы, стулья",
      parent_id: 72,
    },
    {
      id: 75,
      title: "Мебель для ванной",
      parent_id: 72,
    },
    {
      id: 76,
      title: "Мебель для отдыха",
      parent_id: 72,
    },
    {
      id: 77,
      title: "Изделия из дерева и ротанга",
      parent_id: 72,
    },
    {
      id: 78,
      title: "Полки",
      parent_id: 72,
    },
    {
      id: 79,
      title: "Металлические шкафы и сейфы",
      parent_id: 72,
    },
    {
      id: 80,
      title: "Стеллажи, комоды",
      parent_id: 72,
    },
    {
      id: 81,
      title: "Шкафы обувные",
      parent_id: 72,
    },
    {
      id: 82,
      title: "Этажерки",
      parent_id: 72,
    },
    {
      id: 83,
      title: "Чехлы для мебели",
      parent_id: 72,
    },
    {
      id: 84,
      title: "Лаки, краски, клей",
      parent_id: null,
    },
    {
      id: 85,
      title: "Аэрозольные краски",
      parent_id: 84,
    },
    {
      id: 86,
      title: "Водоэмульсии",
      parent_id: 84,
    },
    {
      id: 87,
      title: "Герметик",
      parent_id: 84,
    },
    {
      id: 88,
      title: "Грунтовки",
      parent_id: 84,
    },
    {
      id: 89,
      title: "Клей",
      parent_id: 84,
    },
    {
      id: 90,
      title: "Колоранты",
      parent_id: 84,
    },
    {
      id: 91,
      title: "Краски",
      parent_id: 84,
    },
    {
      id: 92,
      title: "Лаки",
      parent_id: 84,
    },
    {
      id: 93,
      title: "Очиститель монтажной пены",
      parent_id: 84,
    },
    {
      id: 94,
      title: "Пена монтажная",
      parent_id: 84,
    },
    {
      id: 95,
      title: "Пропитки",
      parent_id: 84,
    },
    {
      id: 96,
      title: "Растворители, разбавители",
      parent_id: 84,
    },
    {
      id: 97,
      title: "Эмали",
      parent_id: 84,
    },
    {
      id: 98,
      title: "Инструменты",
      parent_id: null,
    },
    {
      id: 99,
      title: "Электро-пневмо инструменты",
      parent_id: 98,
    },
    {
      id: 100,
      title: "Ручной инструмент",
      parent_id: 98,
    },
    {
      id: 101,
      title: "Малярный инструмент",
      parent_id: 98,
    },
    {
      id: 102,
      title: "Организация рабочего места",
      parent_id: 98,
    },
    {
      id: 103,
      title: "Расходные материалы",
      parent_id: 98,
    },
    {
      id: 104,
      title: "Измерительно-разметочные инструменты",
      parent_id: 98,
    },
    {
      id: 105,
      title: "Дрели, шуруповерты",
      parent_id: 99,
    },
    {
      id: 106,
      title: "Перфораторы",
      parent_id: 99,
    },
    {
      id: 107,
      title: "Пилы электрические",
      parent_id: 99,
    },
    {
      id: 108,
      title: "Фрезеры",
      parent_id: 99,
    },
    {
      id: 109,
      title: "Плиткорезы",
      parent_id: 99,
    },
    {
      id: 110,
      title: "Гайковёрты",
      parent_id: 99,
    },
    {
      id: 111,
      title: "Миксеры строительные",
      parent_id: 99,
    },
    {
      id: 112,
      title: "Пистолеты",
      parent_id: 99,
    },
    {
      id: 113,
      title: "Штроборезы",
      parent_id: 99,
    },
    {
      id: 114,
      title: "Краскопульты",
      parent_id: 99,
    },
    {
      id: 115,
      title: "Лобзики",
      parent_id: 99,
    },
    {
      id: 116,
      title: "Многофункциональные инструменты",
      parent_id: 99,
    },
    {
      id: 117,
      title: "Рубанки",
      parent_id: 99,
    },
    {
      id: 118,
      title: "Станки",
      parent_id: 99,
    },
    {
      id: 119,
      title: "Фены технические",
      parent_id: 99,
    },
    {
      id: 120,
      title: "Шлифовальные машины",
      parent_id: 99,
    },
    {
      id: 121,
      title: "Степлеры",
      parent_id: 99,
    },
    {
      id: 122,
      title: "Аккумуляторы и зарядные устройства",
      parent_id: 99,
    },
    {
      id: 123,
      title: "Кувалды",
      parent_id: 100,
    },
    {
      id: 124,
      title: "Ломы и гвоздодеры",
      parent_id: 100,
    },
    {
      id: 125,
      title: "Напильники",
      parent_id: 100,
    },
    {
      id: 126,
      title: "Ножовки",
      parent_id: 100,
    },
    {
      id: 127,
      title: "Пистолеты для герметиков",
      parent_id: 100,
    },
    {
      id: 128,
      title: "Рубанки ручные",
      parent_id: 100,
    },
    {
      id: 129,
      title: "Стамески",
      parent_id: 100,
    },
    {
      id: 130,
      title: "Струбцины",
      parent_id: 100,
    },
    {
      id: 131,
      title: "Терки и шлифовщики",
      parent_id: 100,
    },
    {
      id: 132,
      title: "Топоры",
      parent_id: 100,
    },
    {
      id: 133,
      title: "Губцевый инструмент",
      parent_id: 100,
    },
    {
      id: 134,
      title: "Ключи",
      parent_id: 100,
    },
    {
      id: 135,
      title: "Молотки, киянки",
      parent_id: 100,
    },
    {
      id: 136,
      title: "Наборы инструментов и биты",
      parent_id: 100,
    },
    {
      id: 137,
      title: "Отвёртки",
      parent_id: 100,
    },
    {
      id: 138,
      title: "Степлеры ручные",
      parent_id: 100,
    },
    {
      id: 139,
      title: "Валики",
      parent_id: 101,
    },
    {
      id: 140,
      title: "Ванночки, ёмкости для краски",
      parent_id: 101,
    },
    {
      id: 141,
      title: "Инструменты для декорирования",
      parent_id: 101,
    },
    {
      id: 142,
      title: "Кисти",
      parent_id: 101,
    },
    {
      id: 143,
      title: "Ножи, ножницы",
      parent_id: 101,
    },
    {
      id: 144,
      title: "Перчатки",
      parent_id: 101,
    },
    {
      id: 145,
      title: "Правило",
      parent_id: 101,
    },
    {
      id: 146,
      title: "Респираторы",
      parent_id: 101,
    },
    {
      id: 147,
      title: "Ролики",
      parent_id: 101,
    },
    {
      id: 148,
      title: "Скотчи, ленты",
      parent_id: 101,
    },
    {
      id: 149,
      title: "Шпатели",
      parent_id: 101,
    },
    {
      id: 150,
      title: "Наждачная бумага",
      parent_id: 101,
    },
    {
      id: 151,
      title: "Лебедки",
      parent_id: 102,
    },
    {
      id: 152,
      title: "Стремянки",
      parent_id: 102,
    },
    {
      id: 153,
      title: "Тиски",
      parent_id: 102,
    },
    {
      id: 154,
      title: "Ящики и сумки для инструмента",
      parent_id: 102,
    },
    {
      id: 155,
      title: "Буры",
      parent_id: 103,
    },
    {
      id: 156,
      title: "Лезвия для ножей",
      parent_id: 103,
    },
    {
      id: 157,
      title: "Пилки для лобзиков",
      parent_id: 103,
    },
    {
      id: 158,
      title: "Щетки",
      parent_id: 103,
    },
    {
      id: 159,
      title: "Диски",
      parent_id: 103,
    },
    {
      id: 160,
      title: "Свёрла и коронки",
      parent_id: 103,
    },
    {
      id: 161,
      title: "Лазерные уровни и нивелиры",
      parent_id: 104,
    },
    {
      id: 162,
      title: "Рулетки",
      parent_id: 104,
    },
    {
      id: 163,
      title: "Гидроуровни",
      parent_id: 104,
    },
    {
      id: 164,
      title: "Уровни ручные",
      parent_id: 104,
    },
    {
      id: 165,
      title: "Всё для дома, сада и огорода",
      parent_id: null,
    },
    {
      id: 166,
      title: "Домашний текстиль",
      parent_id: 165,
    },
    {
      id: 167,
      title: "Посуда",
      parent_id: 165,
    },
    {
      id: 168,
      title: "Отдых на природе",
      parent_id: 165,
    },
    {
      id: 169,
      title: "Сад и огород",
      parent_id: 165,
    },
    {
      id: 170,
      title: "Уборка дома",
      parent_id: 165,
    },
    {
      id: 171,
      title: "Аксессуары для бани и сауны",
      parent_id: 165,
    },
    {
      id: 172,
      title: "Хозяйственные товары",
      parent_id: 165,
    },
    {
      id: 173,
      title: "Новогодние ёлки и украшения",
      parent_id: 165,
    },
    {
      id: 174,
      title: "Доски гладильные",
      parent_id: 165,
    },
    {
      id: 175,
      title: "Горшки цветочные",
      parent_id: 165,
    },
    {
      id: 176,
      title: "Ёмкости",
      parent_id: 165,
    },
    {
      id: 177,
      title: "Кувшины, вазы",
      parent_id: 165,
    },
    {
      id: 178,
      title: "Лестницы",
      parent_id: 165,
    },
    {
      id: 179,
      title: "Поролон",
      parent_id: 165,
    },
    {
      id: 180,
      title: "Прочее",
      parent_id: 165,
    },
    {
      id: 181,
      title: "Садовые ящики, корзины, мешки",
      parent_id: 165,
    },
    {
      id: 182,
      title: "Средства для ухода за обувью",
      parent_id: 165,
    },
    {
      id: 183,
      title: "Сушилки",
      parent_id: 165,
    },
    {
      id: 184,
      title: "Товары для детей",
      parent_id: 165,
    },
    {
      id: 185,
      title: "Хранение",
      parent_id: 165,
    },
    {
      id: 186,
      title: "Ящики, коробки",
      parent_id: 165,
    },
    {
      id: 187,
      title: "Бытовая химия",
      parent_id: 165,
    },
    {
      id: 188,
      title: "Карнизы",
      parent_id: 166,
    },
    {
      id: 189,
      title: "Одеяла и пледы",
      parent_id: 166,
    },
    {
      id: 190,
      title: "Полотенца",
      parent_id: 166,
    },
    {
      id: 191,
      title: "Постельное белье",
      parent_id: 166,
    },
    {
      id: 192,
      title: "Рулонные шторы",
      parent_id: 166,
    },
    {
      id: 193,
      title: "Шторы",
      parent_id: 166,
    },
    {
      id: 194,
      title: "Подушки",
      parent_id: 166,
    },
    {
      id: 195,
      title: "Бутылки",
      parent_id: 167,
    },
    {
      id: 196,
      title: "Бутылки",
      parent_id: 167,
    },
    {
      id: 197,
      title: "Вилки столовые",
      parent_id: 167,
    },
    {
      id: 198,
      title: "Дуршлаги",
      parent_id: 167,
    },
    {
      id: 199,
      title: "Кастрюли, казаны, сковорода",
      parent_id: 167,
    },
    {
      id: 200,
      title: "Ковши",
      parent_id: 167,
    },
    {
      id: 201,
      title: "Кружки",
      parent_id: 167,
    },
    {
      id: 202,
      title: "Крышки",
      parent_id: 167,
    },
    {
      id: 203,
      title: "Кухонные корзины",
      parent_id: 167,
    },
    {
      id: 204,
      title: "Кухонные принадлежности",
      parent_id: 167,
    },
    {
      id: 205,
      title: "Пищевые емкости для хранения",
      parent_id: 167,
    },
    {
      id: 206,
      title: "Тарелки",
      parent_id: 167,
    },
    {
      id: 207,
      title: "Барбекю и мангалы",
      parent_id: 168,
    },
    {
      id: 208,
      title: "Розжиг",
      parent_id: 168,
    },
    {
      id: 209,
      title: "Средства для защиты от комаров",
      parent_id: 168,
    },
    {
      id: 210,
      title: "Шампуры и решетки",
      parent_id: 168,
    },
    {
      id: 211,
      title: "Дачные туалеты и души",
      parent_id: 168,
    },
    {
      id: 212,
      title: "Бассейны",
      parent_id: 168,
    },
    {
      id: 213,
      title: "Всё для пикника",
      parent_id: 168,
    },
    {
      id: 214,
      title: "Декор сада",
      parent_id: 169,
    },
    {
      id: 215,
      title: "Пистолеты и дождеватели",
      parent_id: 169,
    },
    {
      id: 216,
      title: "Семена",
      parent_id: 169,
    },
    {
      id: 217,
      title: "Укрывной материал",
      parent_id: 169,
    },
    {
      id: 218,
      title: "Уничтожение насекомых и грызунов",
      parent_id: 169,
    },
    {
      id: 219,
      title: "Заборы",
      parent_id: 169,
    },
    {
      id: 220,
      title: "Лейки",
      parent_id: 169,
    },
    {
      id: 221,
      title: "Уход за растениями",
      parent_id: 169,
    },
    {
      id: 222,
      title: "Садовый инвентарь",
      parent_id: 169,
    },
    {
      id: 223,
      title: "Шланги поливочные, насадки",
      parent_id: 169,
    },
    {
      id: 224,
      title: "Средства для ухода за одеждой",
      parent_id: 170,
    },
    {
      id: 225,
      title: "Швабры",
      parent_id: 170,
    },
    {
      id: 226,
      title: "Щетки",
      parent_id: 170,
    },
    {
      id: 227,
      title: "Банные принадлежности",
      parent_id: 171,
    },
    {
      id: 228,
      title: "Масла и соли для бани",
      parent_id: 171,
    },
    {
      id: 229,
      title: "Обустройство бани",
      parent_id: 171,
    },
    {
      id: 230,
      title: "Бумажки изделия",
      parent_id: 172,
    },
    {
      id: 231,
      title: "Ведра",
      parent_id: 172,
    },
    {
      id: 232,
      title: "Мешки строительные",
      parent_id: 172,
    },
    {
      id: 233,
      title: "Мусорные баки и урны",
      parent_id: 172,
    },
    {
      id: 234,
      title: "Корзины",
      parent_id: 172,
    },
    {
      id: 235,
      title: "Корзины для белья",
      parent_id: 172,
    },
    {
      id: 236,
      title: "Пакеты, пленки",
      parent_id: 172,
    },
    {
      id: 237,
      title: "Гирлянды",
      parent_id: 173,
    },
    {
      id: 238,
      title: "Ёлки",
      parent_id: 173,
    },
    {
      id: 239,
      title: "Ёлочные украшения",
      parent_id: 173,
    },
    {
      id: 240,
      title: "Чехлы",
      parent_id: 174,
    },
    {
      id: 241,
      title: "Очистители",
      parent_id: 187,
    },
    {
      id: 242,
      title: "Водоснабжение, отопление и вентиляция",
      parent_id: null,
    },
    {
      id: 243,
      title: "Вентиляционные системы и комплектующие",
      parent_id: 242,
    },
    {
      id: 244,
      title: "Жироуловители",
      parent_id: 242,
    },
    {
      id: 245,
      title: "Котлы отопительные",
      parent_id: 242,
    },
    {
      id: 246,
      title: "Радиаторы",
      parent_id: 242,
    },
    {
      id: 247,
      title: "Расширительные баки",
      parent_id: 242,
    },
    {
      id: 248,
      title: "Счетчики воды и газа",
      parent_id: 242,
    },
    {
      id: 249,
      title: "Трубы, фитинги, краны",
      parent_id: 242,
    },
    {
      id: 250,
      title: "Фильтры для воды",
      parent_id: 242,
    },
    {
      id: 251,
      title: "Водонагреватели",
      parent_id: 242,
    },
    {
      id: 252,
      title: "Воздуховоды и комплектующие",
      parent_id: 243,
    },
    {
      id: 253,
      title: "Вытяжные вентиляторы",
      parent_id: 243,
    },
    {
      id: 254,
      title: "Комплектующие для котлов",
      parent_id: 245,
    },
    {
      id: 255,
      title: "Комплект для радиатора",
      parent_id: 246,
    },
    {
      id: 256,
      title: "Запорная арматура",
      parent_id: 249,
    },
    {
      id: 257,
      title: "Подводка гибкая",
      parent_id: 249,
    },
    {
      id: 258,
      title: "Трубы пластиковые",
      parent_id: 249,
    },
    {
      id: 259,
      title: "Фитинги для платиковых труб",
      parent_id: 249,
    },
    {
      id: 260,
      title: "Оборудование",
      parent_id: null,
    },
    {
      id: 261,
      title: "Строительное оборудование",
      parent_id: 260
    },
    {
      id: 262,
      title: "Бытовое оборудование",
      parent_id: 260
    },
    {
      id: 263,
      title: "Садовая техника",
      parent_id: 260
    },
    {
      id: 264,
      title: "Спецодежда",
      parent_id: 260
    },
    {
      id: 265,
      title: "Виброплиты",
      parent_id: 261
    },
    {
      id: 266,
      title: "Стабилизаторы",
      parent_id: 261
    },
    {
      id: 267,
      title: "Бетономешалки",
      parent_id: 261
    },
    {
      id: 268,
      title: "Генераторы",
      parent_id: 261
    },
    {
      id: 269,
      title: "Компрессоры",
      parent_id: 261
    },
    {
      id: 270,
      title: "Сварочные аппараты",
      parent_id: 261
    },
    {
      id: 271,
      title: "Насосы",
      parent_id: 261
    },
    {
      id: 272,
      title: "Мойки высокого давления",
      parent_id: 262
    },
    {
      id: 273,
      title: "Пылесосы",
      parent_id: 262
    },
    {
      id: 274,
      title: "Бензопилы",
      parent_id: 263
    },
    {
      id: 275,
      title: "Воздуходувки",
      parent_id: 263
    },
    {
      id: 276,
      title: "Культиваторы",
      parent_id: 263
    },
    {
      id: 277,
      title: "Снегоуборщики",
      parent_id: 263
    },
    {
      id: 278,
      title: "Газонокосилки",
      parent_id: 263
    },
    {
      id: 279,
      title: "Триммеры",
      parent_id: 263
    },
    {
      id: 280,
      title: "Комплектующие для садовой техники",
      parent_id: 263
    },
    {
      id: 281,
      title: "Опрыскиватели",
      parent_id: 263
    },
    {
      id: 282,
      title: "Обувь",
      parent_id: 264
    },
    {
      id: 283,
      title: "Одежда",
      parent_id: 264
    },
    {
      id: 284,
      title: "Сварочные краги",
      parent_id: 264
    },
    {
      id: 285,
      title: "Сварочные маски",
      parent_id: 264
    },
    {
      id: 286,
      title: "Декор",
      parent_id: null
    },
    {
      id: 287,
      title: "Галтели",
      parent_id: 286
    },
    {
      id: 288,
      title: "Декор потолка",
      parent_id: 286
    },
    {
      id: 289,
      title: "Декоративные уголки",
      parent_id: 286
    },
    {
      id: 290,
      title: "Декоративные элементы",
      parent_id: 286
    },
    {
      id: 291,
      title: "Декор-панели",
      parent_id: 286
    },
    {
      id: 292,
      title: "Жалюзи",
      parent_id: 286
    },
    {
      id: 293,
      title: "Плёнки декоративные",
      parent_id: 286
    },
    {
      id: 294,
      title: "Стикеры",
      parent_id: 286
    },
    {
      id: 295,
      title: "Оформление интерьера",
      parent_id: 286
    },
    {
      id: 296,
      title: "Комплектующие для декор-панелей",
      parent_id: 291
    },
    {
      id: 297,
      title: "Панели МДФ",
      parent_id: 291
    },
    {
      id: 298,
      title: "Панели ПВХ",
      parent_id: 291
    },
    {
      id: 299,
      title: "Ароматы для дома",
      parent_id: 295
    },
    {
      id: 300,
      title: "Искусственные растения",
      parent_id: 295
    },
    {
      id: 301,
      title: "Подсвечники",
      parent_id: 295
    },
    {
      id: 302,
      title: "Свечи",
      parent_id: 295
    },
    {
      id: 303,
      title: "Фоторамки",
      parent_id: 295
    },
    {
      id: 304,
      title: "Зеркала интерьерные",
      parent_id: 295
    },
    {
      id: 305,
      title: "Часы",
      parent_id: 295
    },
    {
      id: 306,
      title: "Бытовая техника",
      parent_id: null
    },
    {
      id: 307,
      title: "Аксессуары для малой бытовой техники",
      parent_id: 306
    },
    {
      id: 308,
      title: "Вентиляторы",
      parent_id: 306
    },
    {
      id: 309,
      title: "Варочные поверхности, духовки",
      parent_id: 306
    },
    {
      id: 310,
      title: "Утюги",
      parent_id: 306
    },
    {
      id: 311,
      title: "Крепёж",
      parent_id: null
    },
    {
      id: 312,
      title: "Анкера",
      parent_id: 311
    },
    {
      id: 313,
      title: "Болты, гайки, шайбы",
      parent_id: 311
    },
    {
      id: 314,
      title: "Заглушки, ленты, наклейки",
      parent_id: 311
    },
    {
      id: 315,
      title: "Зонтики для утеплителя",
      parent_id: 311
    },
    {
      id: 316,
      title: "Крепления для изделий",
      parent_id: 311
    },
    {
      id: 317,
      title: "Кронштейны, держатели, уголки",
      parent_id: 311
    },
    {
      id: 318,
      title: "Крюки, подвесы",
      parent_id: 311
    },
    {
      id: 319,
      title: "Мебельная фурнитура",
      parent_id: 311
    },
    {
      id: 320,
      title: "Нагель-дюбели",
      parent_id: 311
    },
    {
      id: 321,
      title: "Саморезы, шурупы",
      parent_id: 311
    },
    {
      id: 322,
      title: "Такелаж",
      parent_id: 311
    },
    {
      id: 323,
      title: "Хомуты",
      parent_id: 311
    },
    {
      id: 324,
      title: "Шнуры, шпагаты",
      parent_id: 311
    },
    {
      id: 325,
      title: "Гвозди",
      parent_id: 311
    },
    {
      id: 326,
      title: "Строительные материалы",
      parent_id: null
    },
    {
      id: 327,
      title: "Материалы",
      parent_id: 326
    },
    {
      id: 328,
      title: "Смеси, растворы",
      parent_id: 326
    },
    {
      id: 329,
      title: "Пиломатериалы",
      parent_id: 327
    },
    {
      id: 330,
      title: "Сетки",
      parent_id: 327
    },
    {
      id: 331,
      title: "Теплоизоляция",
      parent_id: 327
    },
    {
      id: 332,
      title: "Кровельные материалы",
      parent_id: 327
    },
    {
      id: 333,
      title: "Листовые материалы",
      parent_id: 327
    },
    {
      id: 334,
      title: "Пароизоляция",
      parent_id: 327
    },
    {
      id: 335,
      title: "Профиль, уголки",
      parent_id: 327
    },
    {
      id: 336,
      title: "Шумоизоляция",
      parent_id: 327
    },
    {
      id: 337,
      title: "Гидроизоляция, мастики",
      parent_id: 328
    },
    {
      id: 338,
      title: "Самовыравнивающиеся смеси",
      parent_id: 328
    },
    {
      id: 339,
      title: "Термоизоляция",
      parent_id: 328
    },
    {
      id: 340,
      title: "Декоративные штукатурки",
      parent_id: 328
    },
    {
      id: 341,
      title: "Затирки",
      parent_id: 328
    },
    {
      id: 342,
      title: "Клеевые смеси",
      parent_id: 328
    },
    {
      id: 343,
      title: "Цемент, песок",
      parent_id: 328
    },
    {
      id: 344,
      title: "Шпатлёвки",
      parent_id: 328
    },
    {
      id: 345,
      title: "Электротовары",
      parent_id: null
    },
    {
      id: 346,
      title: "Автомат выключатели",
      parent_id: 345
    },
    {
      id: 347,
      title: "Вилки",
      parent_id: 345
    },
    {
      id: 348,
      title: "Звонки, домофоны и аксессуары",
      parent_id: 345
    },
    {
      id: 349,
      title: "Кабели",
      parent_id: 345
    },
    {
      id: 350,
      title: "Каминокомплекты",
      parent_id: 345
    },
    {
      id: 351,
      title: "Лампы",
      parent_id: 345
    },
    {
      id: 352,
      title: "Обогреватели",
      parent_id: 345
    },
    {
      id: 353,
      title: "Осветительные приборы",
      parent_id: 345
    },
    {
      id: 354,
      title: "Панели",
      parent_id: 345
    },
    {
      id: 355,
      title: "Прожекторы",
      parent_id: 345
    },
    {
      id: 356,
      title: "Распредкоробки",
      parent_id: 345
    },
    {
      id: 357,
      title: "Розетки, выключатели, рамки",
      parent_id: 345
    },
    {
      id: 358,
      title: "Светильники, люстры",
      parent_id: 345
    },
    {
      id: 359,
      title: "Светильник-ночник",
      parent_id: 345
    },
    {
      id: 360,
      title: "Светодиодные ленты",
      parent_id: 345
    },
    {
      id: 361,
      title: "Счетчики электроэнергии",
      parent_id: 345
    },
    {
      id: 362,
      title: "Тестеры напряжения",
      parent_id: 345
    },
    {
      id: 363,
      title: "Точечные светильники (Споты)",
      parent_id: 345
    },
    {
      id: 364,
      title: "Трековые светильники и комплектующие",
      parent_id: 345
    },
    {
      id: 365,
      title: "Удлинители",
      parent_id: 345
    },
    {
      id: 366,
      title: "Умный дом",
      parent_id: 345
    },
    {
      id: 367,
      title: "Щитовое оборудование",
      parent_id: 345
    },
    {
      id: 368,
      title: "Электрические комплектующие",
      parent_id: 345
    },
    {
      id: 369,
      title: "Тёплый пол",
      parent_id: 345
    },
    {
      id: 370,
      title: "Автомобильные товары",
      parent_id: null
    },
    {
      id: 371,
      title: "Авто Аксессуары",
      parent_id: 370
    },
    {
      id: 372,
      title: "Технические жидкости",
      parent_id: 370
    },
  ]);

  await knex.raw("SELECT setval('category_id_seq', (SELECT MAX(id) FROM category))");
};
