/* ==========================================================
   瓜瓜英语 · 内容与 Mock 数据（唯一数据源）
   见 .design-contract.md §7 与 §11

   内容版权说明：
   - 88 个基础词 / 中文释义 / 例句：自建，面向 4-6 岁高频词
   - 儿歌歌词：均为公有领域作品（Twinkle 1806 / Alphabet Song 1835 /
     Old MacDonald 1917 / Itsy Bitsy Spider 传统民谣）
   - 绘本、角色扮演对话：自建短句，插画复用自建插画
   - 不含任何第三方 App 的课程内容、音频或美术素材
   - 「五环节闭环 / 多级体系 / 游戏化养成」的形态参照叽里呱啦公开信息，
     但具体玩法实现（拼图、泡泡、连线、找不同等）为本原型自创
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
    level: 'Y1 启蒙级'
  };

  /* ---------------- 五大课程版块（对应叽里呱啦的板块结构） ---------------- */
  var courses = [
    { id: 'main',    title: '主修课程',   desc: '五环节闯关', ico: IMG + 'units/animals.jpg', c1: '#FF8A3D', c2: '#FFB020', view: 'levelList' },
    { id: 'daily',   title: '每天5分钟', desc: '磨耳朵打卡', ico: IMG + 'units/colors.jpg',  c1: '#38A9FF', c2: '#6F7BFF', view: 'listen' },
    { id: 'interact',title: '互动游戏',   desc: '11 种玩法',  ico: IMG + 'units/body.jpg',    c1: '#FF5C8A', c2: '#FF8FB1', view: 'playDemo' },
    { id: 'rhyme',   title: '儿歌课程',   desc: '4 首公版儿歌', ico: IMG + 'rhymes/farm.jpg',  c1: '#2FCB8B', c2: '#7ED957', view: 'listen' },
    { id: 'book',    title: '绘本课程',   desc: '2 本分级绘本', ico: IMG + 'units/food.jpg',   c1: '#8B5CF6', c2: '#B58CFF', view: 'storyList' },
    { id: 'house',   title: '呱呱小屋',   desc: '装扮我的家', ico: IMG + 'units/family.jpg', c1: '#FFB020', c2: '#FF7A45', view: 'house' }
  ];

  /* ---------------- 多级体系（§11.1） ---------------- */

  var levels = [
    { id: 'Y1', name: '启蒙级', titleZh: '启蒙级', desc: '认识身边的事物', c1: '#FF8A3D', c2: '#FFB020' },
    { id: 'Y2', name: '进阶级', titleZh: '进阶级', desc: '会数数、会描述', c1: '#38A9FF', c2: '#6F7BFF' },
    { id: 'Y3', name: '成长级', titleZh: '成长级', desc: '走进自然与校园', c1: '#2FCB8B', c2: '#7ED957' }
  ];

  /* ---------------- 五环节闭环（§11.1，顺序即执行顺序） ---------------- */

  var STAGES = [
    { id: 'warm',     name: '预热', view: 'warm',     desc: '先听一听' },
    { id: 'learn',    name: '学习', view: 'learn',    desc: '看单词卡' },
    { id: 'practice', name: '练习', view: 'practice', desc: '玩中巩固' },
    { id: 'review',   name: '复习', view: 'review',   desc: '攻克错词' },
    { id: 'apply',    name: '应用', view: 'apply',    desc: '开口对话' }
  ];

  /* ---------------- 11 个主题单元 / 88 个基础词 ---------------- */
  /* Y1：沿用 v1 的 40 词与 5 张封面，不重复出图 */

  var units = [
    {
      id: 'animals', level: 'Y1', title: 'Animals', titleZh: '动物',
      ico: IMG + 'units/animals.jpg', c1: '#FF8A3D', c2: '#FFB020',
      talk: [
        { en: 'Hello! What can you see?', zh: '你好！你看到了什么？' },
        { en: 'I see a cat and a dog.',   zh: '我看见了一只猫和一只狗。' }
      ],
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
      id: 'colors', level: 'Y1', title: 'Colors & Shapes', titleZh: '颜色形状',
      ico: IMG + 'units/colors.jpg', c1: '#38A9FF', c2: '#6F7BFF',
      talk: [
        { en: 'What color do you like?', zh: '你喜欢什么颜色？' },
        { en: 'I like red and blue.',    zh: '我喜欢红色和蓝色。' }
      ],
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
      id: 'food', level: 'Y1', title: 'Food', titleZh: '食物',
      ico: IMG + 'units/food.jpg', c1: '#2FCB8B', c2: '#7ED957',
      talk: [
        { en: 'Are you hungry?',   zh: '你饿了吗？' },
        { en: 'Yes! I want milk.', zh: '是的！我想喝牛奶。' }
      ],
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
      id: 'body', level: 'Y1', title: 'My Body', titleZh: '身体',
      ico: IMG + 'units/body.jpg', c1: '#FF5C8A', c2: '#FF8FB1',
      talk: [
        { en: 'Touch your nose!',  zh: '摸摸你的鼻子！' },
        { en: 'This is my nose.',  zh: '这是我的鼻子。' }
      ],
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
      id: 'family', level: 'Y1', title: 'My Family', titleZh: '家人',
      ico: IMG + 'units/family.jpg', c1: '#8B5CF6', c2: '#B58CFF',
      talk: [
        { en: 'Who is he?',            zh: '他是谁？' },
        { en: 'He is my dad. I love him.', zh: '他是我爸爸。我爱他。' }
      ],
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
    },

    /* ---------- Y2 进阶级 ---------- */
    {
      id: 'numbers', level: 'Y2', title: 'Numbers', titleZh: '数字',
      ico: IMG + 'units/numbers.jpg', c1: '#38A9FF', c2: '#6F7BFF',
      talk: [
        { en: 'How old are you?', zh: '你几岁了？' },
        { en: 'I am five years old.', zh: '我五岁了。' }
      ],
      words: [
        { en: 'one',   zh: '一', ipa: '/wʌn/',    sen: 'I have one nose.',        senZh: '我有一个鼻子。' },
        { en: 'two',   zh: '二', ipa: '/tuː/',    sen: 'I have two eyes.',        senZh: '我有两只眼睛。' },
        { en: 'three', zh: '三', ipa: '/θriː/',   sen: 'Three little ducks.',     senZh: '三只小鸭子。' },
        { en: 'four',  zh: '四', ipa: '/fɔːr/',   sen: 'A cat has four legs.',    senZh: '猫有四条腿。' },
        { en: 'five',  zh: '五', ipa: '/faɪv/',   sen: 'Give me five!',           senZh: '我们击个掌！' },
        { en: 'six',   zh: '六', ipa: '/sɪks/',   sen: 'Six eggs in the box.',    senZh: '盒子里有六个鸡蛋。' },
        { en: 'seven', zh: '七', ipa: '/ˈsevn/',  sen: 'Seven stars at night.',   senZh: '夜里有七颗星星。' },
        { en: 'eight', zh: '八', ipa: '/eɪt/',    sen: 'Eight birds in the tree.', senZh: '树上有八只小鸟。' }
      ]
    },
    {
      id: 'clothes', level: 'Y2', title: 'My Clothes', titleZh: '衣物',
      ico: IMG + 'units/clothes.jpg', c1: '#FF5C8A', c2: '#FF8FB1',
      talk: [
        { en: 'Put on your coat.', zh: '穿上你的外套。' },
        { en: 'It is cold outside.', zh: '外面很冷。' }
      ],
      words: [
        { en: 'hat',   zh: '帽子', ipa: '/hæt/',     sen: 'Put on your hat.',        senZh: '戴上你的帽子。' },
        { en: 'shirt', zh: '衬衫', ipa: '/ʃɜːrt/',   sen: 'My shirt is white.',      senZh: '我的衬衫是白色的。' },
        { en: 'shoes', zh: '鞋子', ipa: '/ʃuːz/',    sen: 'These are my shoes.',     senZh: '这是我的鞋子。' },
        { en: 'socks', zh: '袜子', ipa: '/sɑːks/',   sen: 'Two warm socks.',         senZh: '两只暖和的袜子。' },
        { en: 'coat',  zh: '外套', ipa: '/koʊt/',    sen: 'My coat is blue.',        senZh: '我的外套是蓝色的。' },
        { en: 'dress', zh: '连衣裙', ipa: '/dres/',  sen: 'She has a red dress.',    senZh: '她有一条红裙子。' },
        { en: 'pants', zh: '裤子', ipa: '/pænts/',   sen: 'These pants are long.',   senZh: '这条裤子很长。' },
        { en: 'scarf', zh: '围巾', ipa: '/skɑːrf/',  sen: 'A scarf keeps me warm.',  senZh: '围巾让我很暖和。' }
      ]
    },
    {
      id: 'toys', level: 'Y2', title: 'My Toys', titleZh: '玩具',
      ico: IMG + 'units/toys.jpg', c1: '#FFB020', c2: '#FF7A45',
      talk: [
        { en: 'What is your favorite toy?', zh: '你最喜欢的玩具是什么？' },
        { en: 'My favorite toy is a car.',  zh: '我最喜欢的玩具是小汽车。' }
      ],
      words: [
        { en: 'ball',   zh: '球',     ipa: '/bɔːl/',    sen: 'Let us play with the ball.', senZh: '我们一起玩球吧。' },
        { en: 'doll',   zh: '娃娃',   ipa: '/dɑːl/',    sen: 'The doll is pretty.',     senZh: '娃娃很漂亮。' },
        { en: 'car',    zh: '小汽车', ipa: '/kɑːr/',    sen: 'My car can go fast.',     senZh: '我的小汽车跑得很快。' },
        { en: 'kite',   zh: '风筝',   ipa: '/kaɪt/',    sen: 'The kite is in the sky.', senZh: '风筝在天上飞。' },
        { en: 'robot',  zh: '机器人', ipa: '/ˈroʊbɑːt/', sen: 'The robot can walk.',    senZh: '机器人会走路。' },
        { en: 'blocks', zh: '积木',   ipa: '/blɑːks/',  sen: 'I build with blocks.',    senZh: '我用积木搭房子。' },
        { en: 'drum',   zh: '小鼓',   ipa: '/drʌm/',    sen: 'Beat the drum!',          senZh: '敲敲小鼓！' },
        { en: 'train',  zh: '小火车', ipa: '/treɪn/',   sen: 'The train goes choo choo.', senZh: '小火车呜呜开走了。' }
      ]
    },

    /* ---------- Y3 成长级 ---------- */
    {
      id: 'nature', level: 'Y3', title: 'Nature', titleZh: '自然',
      ico: IMG + 'units/nature.jpg', c1: '#2FCB8B', c2: '#7ED957',
      talk: [
        { en: 'What a sunny day!',   zh: '多晴朗的一天呀！' },
        { en: 'Let us look at the tree.', zh: '我们来看看那棵树。' }
      ],
      words: [
        { en: 'sun',      zh: '太阳', ipa: '/sʌn/',       sen: 'The sun is bright.',     senZh: '太阳很明亮。' },
        { en: 'moon',     zh: '月亮', ipa: '/muːn/',      sen: 'The moon is round.',     senZh: '月亮圆圆的。' },
        { en: 'tree',     zh: '树',   ipa: '/triː/',      sen: 'The tree is tall.',      senZh: '这棵树很高。' },
        { en: 'flower',   zh: '花',   ipa: '/ˈflaʊər/',   sen: 'This flower is pink.',   senZh: '这朵花是粉色的。' },
        { en: 'rain',     zh: '雨',   ipa: '/reɪn/',      sen: 'The rain is falling.',   senZh: '雨下起来了。' },
        { en: 'cloud',    zh: '云',   ipa: '/klaʊd/',     sen: 'A white cloud in the sky.', senZh: '天上一朵白云。' },
        { en: 'river',    zh: '河流', ipa: '/ˈrɪvər/',    sen: 'The river is long.',     senZh: '这条河很长。' },
        { en: 'mountain', zh: '山',   ipa: '/ˈmaʊntn/',   sen: 'The mountain is high.',  senZh: '这座山很高。' }
      ]
    },
    {
      id: 'school', level: 'Y3', title: 'My School', titleZh: '学校',
      ico: IMG + 'units/school.jpg', c1: '#8B5CF6', c2: '#B58CFF',
      talk: [
        { en: 'What is in your bag?', zh: '你的书包里有什么？' },
        { en: 'A book and a pen.',    zh: '一本书和一支笔。' }
      ],
      words: [
        { en: 'book',    zh: '书',   ipa: '/bʊk/',       sen: 'I read a book.',         senZh: '我在读书。' },
        { en: 'pen',     zh: '笔',   ipa: '/pen/',       sen: 'I write with a pen.',    senZh: '我用笔写字。' },
        { en: 'bag',     zh: '书包', ipa: '/bæɡ/',       sen: 'My bag is heavy.',       senZh: '我的书包很重。' },
        { en: 'desk',    zh: '课桌', ipa: '/desk/',      sen: 'My desk is clean.',      senZh: '我的课桌很干净。' },
        { en: 'chair',   zh: '椅子', ipa: '/tʃer/',      sen: 'Sit on the chair.',      senZh: '坐在椅子上。' },
        { en: 'ruler',   zh: '尺子', ipa: '/ˈruːlər/',   sen: 'A ruler is long.',       senZh: '尺子长长的。' },
        { en: 'teacher', zh: '老师', ipa: '/ˈtiːtʃər/',  sen: 'My teacher is kind.',    senZh: '我的老师很亲切。' },
        { en: 'friend',  zh: '朋友', ipa: '/frend/',     sen: 'You are my friend.',     senZh: '你是我的朋友。' }
      ]
    },
    {
      id: 'wild', level: 'Y3', title: 'Wild Animals', titleZh: '野生动物',
      ico: IMG + 'units/wild.jpg', c1: '#FF8A3D', c2: '#FFB020',
      talk: [
        { en: 'Look at the big lion!', zh: '看那头大狮子！' },
        { en: 'The panda is eating.',  zh: '熊猫正在吃东西。' }
      ],
      words: [
        { en: 'lion',     zh: '狮子',   ipa: '/ˈlaɪən/',     sen: 'The lion is strong.',    senZh: '狮子很强壮。' },
        { en: 'tiger',    zh: '老虎',   ipa: '/ˈtaɪɡər/',    sen: 'The tiger has stripes.', senZh: '老虎有条纹。' },
        { en: 'elephant', zh: '大象',   ipa: '/ˈelɪfənt/',   sen: 'The elephant is big.',   senZh: '大象很大。' },
        { en: 'monkey',   zh: '猴子',   ipa: '/ˈmʌŋki/',     sen: 'The monkey likes bananas.', senZh: '猴子喜欢香蕉。' },
        { en: 'bear',     zh: '熊',     ipa: '/ber/',        sen: 'The bear is sleeping.',  senZh: '熊在睡觉。' },
        { en: 'zebra',    zh: '斑马',   ipa: '/ˈziːbrə/',    sen: 'A zebra is black and white.', senZh: '斑马是黑白相间的。' },
        { en: 'panda',    zh: '熊猫',   ipa: '/ˈpændə/',     sen: 'The panda eats bamboo.', senZh: '熊猫吃竹子。' },
        { en: 'snake',    zh: '蛇',     ipa: '/sneɪk/',      sen: 'The snake is long.',     senZh: '蛇长长的。' }
      ]
    }
  ];

  /* 为每个单词补上插画路径，避免手写 88 遍 */
  units.forEach(function (u) {
    u.words.forEach(function (w) {
      w.img = IMG + 'words/' + w.en + '.jpg';
    });
  });

  /* ---------------- 玩法编排（§11.2） ---------------- */

  /* practice 覆盖本单元全部单词，玩法逐词轮换；review 快节奏且错词优先；
     apply 以角色扮演 + 自然拼读收尾 */
  var PLAY_PLANS = {
    practice: ['listenPick', 'pickWord', 'pair', 'bubble', 'matchLine', 'puzzle', 'trace', 'spotDiff'],
    review:   ['pickWord', 'listenPick', 'speakWord', 'bubble', 'spotDiff', 'matchLine'],
    apply:    ['roleplay', 'phonics', 'phonics', 'phonics']
  };

  /* 玩法元信息（label 供顶栏与步骤名使用） */
  var GAMES = [
    { id: 'listenPick', label: '听音选图', ico: 'ear',      desc: '听发音选图片', from: '复刻' },
    { id: 'pickWord',   label: '看图选词', ico: 'eye',      desc: '看图片选单词', from: '复刻' },
    { id: 'speakWord',  label: '跟读评测', ico: 'mic',      desc: '开口说出单词', from: '复刻' },
    { id: 'pair',       label: '拖拽配对', ico: 'hand',     desc: '把词卡拖到图片', from: '复刻' },
    { id: 'trace',      label: '字母描红', ico: 'pen',      desc: '手指描字母',   from: '复刻' },
    { id: 'puzzle',     label: '拼图',      ico: 'grid',    desc: '拼回完整图片', from: '自创' },
    { id: 'bubble',     label: '听音点泡泡', ico: 'bubble', desc: '点中正确的泡泡', from: '自创' },
    { id: 'matchLine',  label: '连线',      ico: 'line',    desc: '把图片和单词连线', from: '自创' },
    { id: 'spotDiff',   label: '找不同',    ico: 'search',  desc: '点出不一样的一个', from: '自创' },
    { id: 'roleplay',   label: '角色扮演',  ico: 'phone',   desc: '视频通话式对话', from: '复刻' },
    { id: 'phonics',    label: '自然拼读',  ico: 'abc',     desc: '听音找首字母词', from: '自创' }
  ];

  /* ---------------- 自然拼读表（引用已有单词，不额外出图） ---------------- */

  var phonics = [
    { letter: 'A', sound: '/æ/',  en: 'apple'  },
    { letter: 'B', sound: '/b/',  en: 'bear'   },
    { letter: 'C', sound: '/k/',  en: 'cat'    },
    { letter: 'D', sound: '/d/',  en: 'dog'    },
    { letter: 'E', sound: '/e/',  en: 'egg'    },
    { letter: 'F', sound: '/f/',  en: 'fish'   },
    { letter: 'H', sound: '/h/',  en: 'hat'    },
    { letter: 'K', sound: '/k/',  en: 'kite'   },
    { letter: 'M', sound: '/m/',  en: 'moon'   },
    { letter: 'P', sound: '/p/',  en: 'panda'  },
    { letter: 'R', sound: '/r/',  en: 'rabbit' },
    { letter: 'S', sound: '/s/',  en: 'sun'    },
    { letter: 'T', sound: '/t/',  en: 'tiger'  },
    { letter: 'W', sound: '/w/',  en: 'water'  }
  ];

  /* ---------------- 角色扮演脚本（自建短句） ---------------- */

  var roleplays = [
    {
      id: 'hello', title: 'Say Hello', titleZh: '打招呼',
      cover: IMG + 'words/baby.jpg', c1: '#38A9FF', c2: '#6F7BFF',
      rounds: [
        {
          npc: 'Hi! I am Gua Gua. What is your name?', npcZh: '嗨！我是呱呱。你叫什么名字？',
          options: [
            { en: 'My name is Xiao Gua.', zh: '我叫小瓜。', ok: true },
            { en: 'I have a red ball.',   zh: '我有一个红球。' }
          ]
        },
        {
          npc: 'Nice to meet you! How old are you?', npcZh: '很高兴认识你！你几岁了？',
          options: [
            { en: 'I am five years old.', zh: '我五岁了。', ok: true },
            { en: 'Good night.',          zh: '晚安。' }
          ]
        },
        {
          npc: 'Wow, you can speak English! Bye bye!', npcZh: '哇，你会说英语！再见啦！',
          options: [
            { en: 'Bye bye, Gua Gua!', zh: '再见，呱呱！', ok: true },
            { en: 'No, thank you.',    zh: '不，谢谢。' }
          ]
        }
      ]
    },
    {
      id: 'breakfast', title: 'Time to Eat', titleZh: '吃饭啦',
      cover: IMG + 'words/apple.jpg', c1: '#2FCB8B', c2: '#7ED957',
      rounds: [
        {
          npc: 'It is breakfast time. Are you hungry?', npcZh: '到早饭时间了。你饿吗？',
          options: [
            { en: 'Yes, I am hungry.', zh: '是的，我饿了。', ok: true },
            { en: 'The cat is sleeping.', zh: '猫在睡觉。' }
          ]
        },
        {
          npc: 'What do you want to eat?', npcZh: '你想吃什么？',
          options: [
            { en: 'I want bread and milk.', zh: '我想吃面包和牛奶。', ok: true },
            { en: 'I want to run.',        zh: '我想跑步。' }
          ]
        },
        {
          npc: 'Here you are. Enjoy your meal!', npcZh: '给你。祝你用餐愉快！',
          options: [
            { en: 'Thank you, Gua Gua!', zh: '谢谢你，呱呱！', ok: true },
            { en: 'I am six.',           zh: '我六岁。' }
          ]
        }
      ]
    },
    {
      id: 'playtime', title: 'Let Us Play', titleZh: '一起玩吧',
      cover: IMG + 'words/car.jpg', c1: '#FFB020', c2: '#FF7A45',
      rounds: [
        {
          npc: 'Look! What is your favorite toy?', npcZh: '看！你最喜欢的玩具是什么？',
          options: [
            { en: 'My favorite toy is a car.', zh: '我最喜欢的玩具是小汽车。', ok: true },
            { en: 'I am a teacher.',          zh: '我是一名老师。' }
          ]
        },
        {
          npc: 'Can you see the kite in the sky?', npcZh: '你能看见天上的风筝吗？',
          options: [
            { en: 'Yes, I can see it.', zh: '是的，我能看见。', ok: true },
            { en: 'I like apples.',    zh: '我喜欢苹果。' }
          ]
        },
        {
          npc: 'Great! Let us play together.', npcZh: '太棒了！我们一起玩吧。',
          options: [
            { en: 'OK! Let us go.',  zh: '好的！我们走吧。', ok: true },
            { en: 'I am sleeping.', zh: '我在睡觉。' }
          ]
        }
      ]
    }
  ];

  /* ---------------- 呱呱小屋 · 装扮道具（§11.3） ---------------- */

  var HOUSE_SLOTS = [
    { id: 'ceiling', name: '天花板' },
    { id: 'wall',    name: '墙面' },
    { id: 'corner',  name: '角落' },
    { id: 'floor',   name: '地面' },
    { id: 'seat',    name: '休息区' }
  ];

  var houseItems = [
    { id: 'lamp',      name: '星星吊灯', slot: 'ceiling', cost: 20, img: IMG + 'house/lamp.jpg' },
    { id: 'balloons',  name: '气球串',   slot: 'ceiling', cost: 15, img: IMG + 'house/balloons.jpg' },
    { id: 'window',    name: '小窗户',   slot: 'wall',    cost: 18, img: IMG + 'house/window.jpg' },
    { id: 'clock',     name: '笑脸挂钟', slot: 'wall',    cost: 22, img: IMG + 'house/clock.jpg' },
    { id: 'plant',     name: '小盆栽',   slot: 'corner',  cost: 16, img: IMG + 'house/plant.jpg' },
    { id: 'shelf',     name: '小书架',   slot: 'corner',  cost: 28, img: IMG + 'house/shelf.jpg' },
    { id: 'rug',       name: '圆地毯',   slot: 'floor',   cost: 24, img: IMG + 'house/rug.jpg' },
    { id: 'blocks',    name: '积木角',   slot: 'floor',   cost: 20, img: IMG + 'house/blocks.jpg' },
    { id: 'cushion',   name: '软坐垫',   slot: 'seat',    cost: 14, img: IMG + 'house/cushion.jpg' },
    { id: 'sofa',      name: '小沙发',   slot: 'seat',    cost: 32, img: IMG + 'house/sofa.jpg' }
  ];

  /* ---------------- 成长勋章（§11.3，判定在 api.js 实现） ---------------- */

  var badges = [
    { id: 'firstStage',  name: '第一次闯关', desc: '完成任意一个学习环节', rule: 'stages', need: 1,  c1: '#FF8A3D', c2: '#FFB020' },
    { id: 'tenWords',    name: '十词达人',   desc: '学会 10 个单词',      rule: 'learned', need: 10, c1: '#38A9FF', c2: '#6F7BFF' },
    { id: 'thirtyWords', name: '词汇小富翁', desc: '学会 30 个单词',      rule: 'learned', need: 30, c1: '#2FCB8B', c2: '#7ED957' },
    { id: 'fullStars',   name: '满分小星星', desc: '一个环节拿到 3 星',   rule: 'star3',   need: 1,  c1: '#FFB020', c2: '#FF7A45' },
    { id: 'speakTen',    name: '开口说',     desc: '完成 10 次跟读',      rule: 'speak',   need: 10, c1: '#FF5C8A', c2: '#FF8FB1' },
    { id: 'rhymeFour',   name: '儿歌小歌手', desc: '听完 4 首公版儿歌',   rule: 'rhymes',  need: 4,  c1: '#8B5CF6', c2: '#B58CFF' },
    { id: 'bookTwo',     name: '绘本阅读家', desc: '读完 2 本绘本',       rule: 'stories', need: 2,  c1: '#2FCB8B', c2: '#38A9FF' },
    { id: 'gemsFifty',   name: '魔石收藏家', desc: '累计获得 50 颗魔石',  rule: 'gems',    need: 50, c1: '#FFB020', c2: '#FF8A3D' },
    { id: 'noWrong',     name: '一次就对',   desc: '一个环节全部答对',    rule: 'perfect', need: 1,  c1: '#FF7A45', c2: '#FF5C8A' },
    { id: 'y1Clear',     name: '启蒙毕业',   desc: 'Y1 五个单元都完成练习', rule: 'y1',    need: 5,  c1: '#8B5CF6', c2: '#38A9FF' },
    { id: 'decorator',   name: '装修小能手', desc: '拥有 3 件小屋装扮',   rule: 'house',   need: 3,  c1: '#FF8A3D', c2: '#2FCB8B' },
    { id: 'streakWeek',  name: '坚持一周',   desc: '连续打卡 7 天',       rule: 'streak',  need: 7,  c1: '#D63A67', c2: '#FF7A45' }
  ];

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

  /* ---------------- 老版闯关题型顺序（quiz 兼容别名仍在使用） ---------------- */
  var QUIZ_PLAN = ['listen', 'pick', 'listen', 'pick', 'listen', 'pick', 'speak', 'speak'];

  /* ---------------- 查询工具 ---------------- */

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
  function getLevel(id) {
    for (var i = 0; i < levels.length; i++) if (levels[i].id === id) return levels[i];
    return null;
  }
  function getGame(id) {
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i];
    return null;
  }
  function getRoleplay(id) {
    for (var i = 0; i < roleplays.length; i++) if (roleplays[i].id === id) return roleplays[i];
    return null;
  }
  function getHouseItem(id) {
    for (var i = 0; i < houseItems.length; i++) if (houseItems[i].id === id) return houseItems[i];
    return null;
  }
  function getBadge(id) {
    for (var i = 0; i < badges.length; i++) if (badges[i].id === id) return badges[i];
    return null;
  }
  function unitsByLevel(level) {
    return units.filter(function (u) { return u.level === level; });
  }
  function allWords() {
    var out = [];
    units.forEach(function (u) { u.words.forEach(function (w) { out.push(w); }); });
    return out;
  }
  /** 按 en 找词（跨单元） */
  function findWord(en) {
    for (var i = 0; i < units.length; i++) {
      var ws = units[i].words;
      for (var j = 0; j < ws.length; j++) if (ws[j].en === en) return ws[j];
    }
    return null;
  }

  global.GUAGUA_DATA = {
    profile: profile,
    courses: courses,
    levels: levels,
    STAGES: STAGES,
    units: units,
    GAMES: GAMES,
    PLAY_PLANS: PLAY_PLANS,
    phonics: phonics,
    roleplays: roleplays,
    HOUSE_SLOTS: HOUSE_SLOTS,
    houseItems: houseItems,
    badges: badges,
    rhymes: rhymes,
    stories: stories,
    dailyTips: dailyTips,
    report: report,
    QUIZ_PLAN: QUIZ_PLAN,
    getUnit: getUnit,
    getRhyme: getRhyme,
    getStory: getStory,
    getLevel: getLevel,
    getGame: getGame,
    getRoleplay: getRoleplay,
    getHouseItem: getHouseItem,
    getBadge: getBadge,
    unitsByLevel: unitsByLevel,
    allWords: allWords,
    findWord: findWord
  };

})(window);
