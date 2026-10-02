/* ==========================================================
   瓜瓜英语 · 内容与 Mock 数据（唯一数据源）
   见 .design-contract.md §7

   内容版权说明：
   - 40 个基础词 / 中文释义 / 例句：自建，面向 4-6 岁高频词
   - 儿歌歌词：均为公有领域作品（Twinkle 1806 / Alphabet Song 1835 /
     Old MacDonald 1917 / Itsy Bitsy Spider 传统民谣）
   - 绘本：自建短句，插画复用自建词卡插画
   - 不含任何第三方 App 的课程内容、音频或美术素材
   ========================================================== */

(function (global) {
  'use strict';

  var IMG = 'assets/img/';

  /* ---------------- 宝贝档案（mock） ---------------- */
  var profile = {
    name: '小瓜',
    age: 5,
    avatar: IMG + 'words/baby.jpg',
    streakDays: 7,
    todayMinutes: 12,
    dailyLimitMinutes: 20,
    level: 'L1 启蒙级'
  };

  /* ---------------- 五大课程版块（对应叽里呱啦的板块结构） ---------------- */
  var courses = [
    { id: 'main',    title: '主修课程',   desc: '闯关学单词', ico: IMG + 'units/animals.jpg', c1: '#FF8A3D', c2: '#FFB020', view: 'unitList' },
    { id: 'daily',   title: '每天5分钟', desc: '磨耳朵打卡', ico: IMG + 'units/colors.jpg',  c1: '#38A9FF', c2: '#6F7BFF', view: 'listen' },
    { id: 'interact',title: '互动课程',   desc: '跟读开口说', ico: IMG + 'units/body.jpg',    c1: '#FF5C8A', c2: '#FF8FB1', view: 'quizDemo' },
    { id: 'rhyme',   title: '儿歌课程',   desc: '4 首公版儿歌', ico: IMG + 'rhymes/farm.jpg',  c1: '#2FCB8B', c2: '#7ED957', view: 'listen' },
    { id: 'book',    title: '绘本课程',   desc: '2 本分级绘本', ico: IMG + 'units/food.jpg',   c1: '#8B5CF6', c2: '#B58CFF', view: 'storyList' },
    { id: 'report',  title: '课程报告',   desc: '看本周进步', ico: IMG + 'units/family.jpg', c1: '#FFB020', c2: '#FF7A45', view: 'report' }
  ];

  /* ---------------- 5 个主题单元 / 40 个基础词 ---------------- */
  var units = [
    {
      id: 'animals', title: 'Animals', titleZh: '动物',
      ico: IMG + 'units/animals.jpg', c1: '#FF8A3D', c2: '#FFB020',
      words: [
        { en: 'cat',    zh: '猫',   ipa: '/kæt/',      sen: 'A cat says meow.',         senZh: '猫喵喵叫。' },
        { en: 'dog',    zh: '狗',   ipa: '/dɔːɡ/',     sen: 'The dog can run.',         senZh: '小狗会跑。' },
        { en: 'bird',   zh: '鸟',   ipa: '/bɜːrd/',    sen: 'The bird can fly.',        senZh: '小鸟会飞。' },
        { en: 'fish',   zh: '鱼',   ipa: '/fɪʃ/',      sen: 'The fish can swim.',       senZh: '小鱼会游泳。' },
        { en: 'duck',   zh: '鸭子', ipa: '/dʌk/',      sen: 'The duck says quack.',     senZh: '鸭子嘎嘎叫。' },
        { en: 'pig',    zh: '猪',   ipa: '/pɪɡ/',      sen: 'The pig is pink.',         senZh: '小猪是粉色的。' },
        { en: 'cow',    zh: '奶牛', ipa: '/kaʊ/',      sen: 'The cow gives milk.',      senZh: '奶牛产牛奶。' },
        { en: 'rabbit', zh: '兔子', ipa: '/ˈræbɪt/',   sen: 'The rabbit has long ears.', senZh: '兔子有长耳朵。' }
      ]
    },
    {
      id: 'colors', title: 'Colors & Shapes', titleZh: '颜色形状',
      ico: IMG + 'units/colors.jpg', c1: '#38A9FF', c2: '#6F7BFF',
      words: [
        { en: 'red',    zh: '红色', ipa: '/red/',      sen: 'The apple is red.',        senZh: '苹果是红色的。' },
        { en: 'blue',   zh: '蓝色', ipa: '/bluː/',     sen: 'The sky is blue.',         senZh: '天空是蓝色的。' },
        { en: 'yellow', zh: '黄色', ipa: '/ˈjeloʊ/',   sen: 'The sun is yellow.',       senZh: '太阳是黄色的。' },
        { en: 'green',  zh: '绿色', ipa: '/ɡriːn/',    sen: 'The leaf is green.',       senZh: '叶子是绿色的。' },
        { en: 'circle', zh: '圆形', ipa: '/ˈsɜːrkl/',  sen: 'A ball is a circle.',      senZh: '皮球是圆形的。' },
        { en: 'square', zh: '方形', ipa: '/skwer/',    sen: 'A box is a square.',       senZh: '盒子是方形的。' },
        { en: 'star',   zh: '星星', ipa: '/stɑːr/',    sen: 'I see a star.',            senZh: '我看见一颗星星。' },
        { en: 'heart',  zh: '心形', ipa: '/hɑːrt/',    sen: 'This is a red heart.',     senZh: '这是一颗红心。' }
      ]
    },
    {
      id: 'food', title: 'Food', titleZh: '食物',
      ico: IMG + 'units/food.jpg', c1: '#2FCB8B', c2: '#7ED957',
      words: [
        { en: 'apple',  zh: '苹果', ipa: '/ˈæpl/',     sen: 'I eat an apple.',          senZh: '我吃一个苹果。' },
        { en: 'banana', zh: '香蕉', ipa: '/bəˈnænə/',  sen: 'The banana is yellow.',    senZh: '香蕉是黄色的。' },
        { en: 'milk',   zh: '牛奶', ipa: '/mɪlk/',     sen: 'I drink milk.',            senZh: '我喝牛奶。' },
        { en: 'bread',  zh: '面包', ipa: '/bred/',     sen: 'I like bread.',            senZh: '我喜欢面包。' },
        { en: 'egg',    zh: '鸡蛋', ipa: '/eɡ/',       sen: 'The egg is white.',        senZh: '鸡蛋是白色的。' },
        { en: 'cake',   zh: '蛋糕', ipa: '/keɪk/',     sen: 'The cake is sweet.',       senZh: '蛋糕是甜的。' },
        { en: 'water',  zh: '水',   ipa: '/ˈwɔːtər/',  sen: 'I drink water.',           senZh: '我喝水。' },
        { en: 'rice',   zh: '米饭', ipa: '/raɪs/',     sen: 'I eat rice.',              senZh: '我吃米饭。' }
      ]
    },
    {
      id: 'body', title: 'My Body', titleZh: '身体',
      ico: IMG + 'units/body.jpg', c1: '#FF5C8A', c2: '#FF8FB1',
      words: [
        { en: 'eye',   zh: '眼睛', ipa: '/aɪ/',        sen: 'I see with my eyes.',      senZh: '我用眼睛看。' },
        { en: 'nose',  zh: '鼻子', ipa: '/noʊz/',      sen: 'I smell with my nose.',    senZh: '我用鼻子闻。' },
        { en: 'mouth', zh: '嘴巴', ipa: '/maʊθ/',      sen: 'I eat with my mouth.',     senZh: '我用嘴巴吃东西。' },
        { en: 'ear',   zh: '耳朵', ipa: '/ɪr/',        sen: 'I hear with my ears.',     senZh: '我用耳朵听。' },
        { en: 'hand',  zh: '手',   ipa: '/hænd/',      sen: 'Wave your hand.',          senZh: '挥挥你的手。' },
        { en: 'foot',  zh: '脚',   ipa: '/fʊt/',       sen: 'I have two feet.',         senZh: '我有两只脚。' },
        { en: 'hair',  zh: '头发', ipa: '/her/',       sen: 'My hair is black.',        senZh: '我的头发是黑色的。' },
        { en: 'tooth', zh: '牙齿', ipa: '/tuːθ/',      sen: 'Brush your teeth.',        senZh: '刷干净你的牙齿。' }
      ]
    },
    {
      id: 'family', title: 'My Family', titleZh: '家人',
      ico: IMG + 'units/family.jpg', c1: '#8B5CF6', c2: '#B58CFF',
      words: [
        { en: 'mom',     zh: '妈妈', ipa: '/mɑːm/',      sen: 'My mom loves me.',       senZh: '妈妈爱我。' },
        { en: 'dad',     zh: '爸爸', ipa: '/dæd/',       sen: 'My dad is tall.',        senZh: '爸爸很高。' },
        { en: 'baby',    zh: '宝宝', ipa: '/ˈbeɪbi/',    sen: 'The baby is small.',     senZh: '宝宝小小的。' },
        { en: 'sister',  zh: '姐妹', ipa: '/ˈsɪstər/',   sen: 'My sister can sing.',    senZh: '姐姐会唱歌。' },
        { en: 'brother', zh: '兄弟', ipa: '/ˈbrʌðər/',   sen: 'My brother can run.',    senZh: '哥哥会跑。' },
        { en: 'grandma', zh: '奶奶', ipa: '/ˈɡrænmɑː/',  sen: 'Grandma tells stories.', senZh: '奶奶讲故事。' },
        { en: 'grandpa', zh: '爷爷', ipa: '/ˈɡrænpɑː/',  sen: 'Grandpa likes tea.',     senZh: '爷爷喜欢喝茶。' },
        { en: 'family',  zh: '家人', ipa: '/ˈfæməli/',   sen: 'I love my family.',      senZh: '我爱我的家人。' }
      ]
    }
  ];

  /* 为每个单词补上插画路径，避免手写 40 遍 */
  units.forEach(function (u) {
    u.words.forEach(function (w) {
      w.img = IMG + 'words/' + w.en + '.jpg';
    });
  });

  /* ---------------- 磨耳朵 · 公版儿歌 ---------------- */
  var rhymes = [
    {
      id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', titleZh: '小星星',
      cover: IMG + 'rhymes/twinkle.jpg', seconds: 48, c1: '#8B5CF6', c2: '#38A9FF',
      lines: [
        { en: 'Twinkle, twinkle, little star,',      zh: '一闪一闪亮晶晶' },
        { en: 'How I wonder what you are.',          zh: '我多想知道你是什么' },
        { en: 'Up above the world so high,',         zh: '你高高挂在天上' },
        { en: 'Like a diamond in the sky.',          zh: '像天空中的一颗钻石' },
        { en: 'Twinkle, twinkle, little star,',      zh: '一闪一闪亮晶晶' },
        { en: 'How I wonder what you are.',          zh: '我多想知道你是什么' }
      ]
    },
    {
      id: 'abc', title: 'The Alphabet Song', titleZh: '字母歌',
      cover: IMG + 'rhymes/abc.jpg', seconds: 35, c1: '#FF8A3D', c2: '#FFB020',
      lines: [
        { en: 'A B C D E F G,',                      zh: '字母歌第一段' },
        { en: 'H I J K L M N O P,',                  zh: '字母歌第二段' },
        { en: 'Q R S, T U V,',                       zh: '字母歌第三段' },
        { en: 'W X Y and Z.',                        zh: '字母歌第四段' },
        { en: 'Now I know my ABC,',                  zh: '现在我会唱字母歌啦' },
        { en: "Next time won't you sing with me.",   zh: '下次你和我一起唱好吗' }
      ]
    },
    {
      id: 'farm', title: 'Old MacDonald Had a Farm', titleZh: '老麦克唐纳有个农场',
      cover: IMG + 'rhymes/farm.jpg', seconds: 52, c1: '#2FCB8B', c2: '#7ED957',
      lines: [
        { en: 'Old MacDonald had a farm, E-I-E-I-O.', zh: '老麦克唐纳有个农场' },
        { en: 'And on his farm he had a cow,',        zh: '农场上有一头奶牛' },
        { en: 'With a moo moo here,',                 zh: '这里哞哞叫' },
        { en: 'And a moo moo there.',                 zh: '那里哞哞叫' },
        { en: 'Here a moo, there a moo,',             zh: '这里哞，那里哞' },
        { en: 'Everywhere a moo moo.',                zh: '到处都在哞哞叫' }
      ]
    },
    {
      id: 'spider', title: 'The Itsy Bitsy Spider', titleZh: '小小蜘蛛',
      cover: IMG + 'rhymes/spider.jpg', seconds: 44, c1: '#FF5C8A', c2: '#FF8FB1',
      lines: [
        { en: 'The itsy bitsy spider climbed up the water spout.', zh: '小小蜘蛛爬上了水管' },
        { en: 'Down came the rain and washed the spider out.',     zh: '大雨落下把蜘蛛冲了下来' },
        { en: 'Out came the sun and dried up all the rain,',       zh: '太阳出来晒干了雨水' },
        { en: 'And the itsy bitsy spider climbed up the spout again.', zh: '小小蜘蛛又爬上了水管' }
      ]
    }
  ];

  /* ---------------- 绘本（自建短句，插画复用词卡插画） ---------------- */
  var stories = [
    {
      id: 'catAndDog', title: 'A Cat and a Dog', titleZh: '猫和狗',
      cover: IMG + 'words/cat.jpg', pages: [
        { img: IMG + 'words/cat.jpg',    en: 'This is a cat.',                    zh: '这是一只猫。' },
        { img: IMG + 'words/dog.jpg',    en: 'This is a dog.',                    zh: '这是一只狗。' },
        { img: IMG + 'words/bird.jpg',   en: 'The cat and the dog see a bird.',   zh: '猫和狗看见一只小鸟。' },
        { img: IMG + 'words/rabbit.jpg', en: 'The bird flies away. Here is a rabbit.', zh: '小鸟飞走了。这里有一只兔子。' },
        { img: IMG + 'words/duck.jpg',   en: 'What a happy day!',                 zh: '多开心的一天呀！' }
      ]
    },
    {
      id: 'myDay', title: 'My Day', titleZh: '我的一天',
      cover: IMG + 'words/apple.jpg', pages: [
        { img: IMG + 'words/apple.jpg',  en: 'I eat an apple.',   zh: '我吃一个苹果。' },
        { img: IMG + 'words/milk.jpg',   en: 'I drink milk.',     zh: '我喝一杯牛奶。' },
        { img: IMG + 'words/hand.jpg',   en: 'I wash my hands.',  zh: '我洗干净小手。' },
        { img: IMG + 'words/eye.jpg',    en: 'I close my eyes.',  zh: '我闭上眼睛。' },
        { img: IMG + 'words/family.jpg', en: 'I love my family.', zh: '我爱我的家人。' }
      ]
    }
  ];

  /* ---------------- 每日一句 ---------------- */
  var dailyTips = [
    { en: 'Good morning!',        zh: '早上好呀！' },
    { en: 'I love you, Mom.',     zh: '妈妈，我爱你。' },
    { en: 'Let us read a book.',  zh: '我们一起读书吧。' },
    { en: 'You are so clever!',   zh: '你真聪明！' },
    { en: 'Wash your hands first.', zh: '先把手洗干净。' },
    { en: 'Time to go to bed.',   zh: '该睡觉啦。' }
  ];

  /* ---------------- 能力分析 / 报告（mock，非真实埋点） ---------------- */
  var report = {
    listening: 78,
    speaking: 64,
    reading: 52,
    writing: 41,
    weekDone: 6,
    weekTarget: 7,
    weekWords: 32,
    weekPatterns: 9
  };

  /* ---------------- 闯关题目类型顺序 ---------------- */
  var QUIZ_PLAN = ['listen', 'pick', 'listen', 'pick', 'listen', 'pick', 'speak', 'speak'];

  function getUnit(id) {
    for (var i = 0; i < units.length; i++) if (units[i].id === id) return units[i];
    return null;
  }
  function getRhyme(id) {
    for (var i = 0; i < rhymes.length; i++) if (rhymes[i].id === id) return rhymes[i];
    return null;
  }
  function getStory(id) {
    for (var i = 0; i < stories.length; i++) if (stories[i].id === id) return stories[i];
    return null;
  }
  function allWords() {
    var out = [];
    units.forEach(function (u) { u.words.forEach(function (w) { out.push(w); }); });
    return out;
  }

  global.GUAGUA_DATA = {
    profile: profile,
    courses: courses,
    units: units,
    rhymes: rhymes,
    stories: stories,
    dailyTips: dailyTips,
    report: report,
    QUIZ_PLAN: QUIZ_PLAN,
    getUnit: getUnit,
    getRhyme: getRhyme,
    getStory: getStory,
    allWords: allWords
  };

})(window);