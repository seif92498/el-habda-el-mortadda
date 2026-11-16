// بنك الأسئلة الافتراضي — عدّل من شاشة "إدارة الأسئلة" أو من questions.json
const CATEGORIES = [
  "🧠 معلومات عامة","⚽ معلومات كورة","🔄 انتقالات لاعبين","🖼️ صور لاعبين",
  "🛡️ صور فرق وشعارات","👥 صور تشكيلة فريق","🎤 غني أغنية مصرية","🔠 كلمات معكوسة","🎬 وصف أفلام ومسلسلات"
];

const DEFAULT_QUESTIONS = [
  // 🧠 معلومات عامة
  {id:"g001",category:"🧠 معلومات عامة",question:"إيه أطول نهر في العالم؟",answer:"نهر النيل",difficulty:"سهل"},
  {id:"g002",category:"🧠 معلومات عامة",question:"مين اللي بنى الهرم الأكبر؟",answer:"الملك خوفو",difficulty:"سهل"},
  {id:"g003",category:"🧠 معلومات عامة",question:"إيه عاصمة اليابان؟",answer:"طوكيو",difficulty:"سهل"},
  {id:"g004",category:"🧠 معلومات عامة",question:"كام عدد الكواكب في المجموعة الشمسية؟",answer:"8 كواكب",difficulty:"متوسط"},
  {id:"g005",category:"🧠 معلومات عامة",question:"مين مؤلف رواية 'أولاد حارتنا'؟",answer:"نجيب محفوظ",difficulty:"متوسط"},
  // ⚽ معلومات كورة
  {id:"k001",category:"⚽ معلومات كورة",question:"مين اللي كسب كأس العالم 2022؟",answer:"الأرجنتين",difficulty:"سهل"},
  {id:"k002",category:"⚽ معلومات كورة",question:"كام مرة مصر كسبت كأس أمم أفريقيا؟",answer:"7 مرات",difficulty:"متوسط"},
  {id:"k003",category:"⚽ معلومات كورة",question:"مين أكتر لاعب كسب الكرة الدهبية؟",answer:"ليونيل ميسي",difficulty:"سهل"},
  {id:"k004",category:"⚽ معلومات كورة",question:"أول كأس عالم اتلعب في سنة كام وفين؟",answer:"1930 في أوروجواي",difficulty:"صعب"},
  {id:"k005",category:"⚽ معلومات كورة",question:"مين هداف دوري أبطال أوروبا التاريخي؟",answer:"كريستيانو رونالدو",difficulty:"سهل"},
  // 🔄 انتقالات
  {id:"tr001",category:"🔄 انتقالات لاعبين",question:"لاعب مصري انتقل من روما لليفربول سنة 2017",answer:"محمد صلاح",difficulty:"سهل"},
  {id:"tr002",category:"🔄 انتقالات لاعبين",question:"انتقل من برشلونة لباريس سان جيرمان سنة 2017 بـ 222 مليون يورو",answer:"نيمار",difficulty:"سهل"},
  {id:"tr003",category:"🔄 انتقالات لاعبين",question:"انتقل من ريال مدريد ليوفنتوس سنة 2018",answer:"كريستيانو رونالدو",difficulty:"سهل"},
  {id:"tr004",category:"🔄 انتقالات لاعبين",question:"انتقل من ليفربول لبرشلونة سنة 2018",answer:"فيليب كوتينيو",difficulty:"متوسط"},
  {id:"tr005",category:"🔄 انتقالات لاعبين",question:"انتقل من توتنهام لريال مدريد سنة 2013 كأغلى لاعب وقتها",answer:"جاريث بيل",difficulty:"متوسط"},
  // 🖼️ صور لاعبين
  {id:"p001",category:"🖼️ صور لاعبين",question:"مين اللاعب ده؟",image:"players/p001.jpg",answer:"محمد صلاح",difficulty:"سهل"},
  {id:"p002",category:"🖼️ صور لاعبين",question:"مين اللاعب ده؟",image:"players/p002.jpg",answer:"محمد أبو تريكة",difficulty:"سهل"},
  {id:"p003",category:"🖼️ صور لاعبين",question:"مين اللاعب ده؟",image:"players/p003.jpg",answer:"أحمد حسن",difficulty:"متوسط"},
  {id:"p004",category:"🖼️ صور لاعبين",question:"مين اللاعب ده؟",image:"players/p004.jpg",answer:"كيليان مبابي",difficulty:"سهل"},
  {id:"p005",category:"🖼️ صور لاعبين",question:"مين اللاعب ده؟",image:"players/p005.jpg",answer:"عصام الحضري",difficulty:"سهل"},
  // 🛡️ شعارات
  {id:"l001",category:"🛡️ صور فرق وشعارات",question:"شعار أنهي نادي؟",image:"logos/l001.jpg",answer:"الأهلي",difficulty:"سهل"},
  {id:"l002",category:"🛡️ صور فرق وشعارات",question:"شعار أنهي نادي؟",image:"logos/l002.jpg",answer:"الزمالك",difficulty:"سهل"},
  {id:"l003",category:"🛡️ صور فرق وشعارات",question:"شعار أنهي نادي؟",image:"logos/l003.jpg",answer:"ليفربول",difficulty:"سهل"},
  {id:"l004",category:"🛡️ صور فرق وشعارات",question:"شعار أنهي نادي؟",image:"logos/l004.jpg",answer:"بايرن ميونخ",difficulty:"متوسط"},
  {id:"l005",category:"🛡️ صور فرق وشعارات",question:"شعار أنهي نادي؟",image:"logos/l005.jpg",answer:"أياكس أمستردام",difficulty:"صعب"},
  // 👥 تشكيلات
  {id:"tm001",category:"👥 صور تشكيلة فريق",question:"تشكيلة أنهي فريق؟",image:"teams/tm001.jpg",answer:"منتخب مصر 2008",difficulty:"متوسط"},
  {id:"tm002",category:"👥 صور تشكيلة فريق",question:"تشكيلة أنهي فريق؟",image:"teams/tm002.jpg",answer:"برشلونة 2011",difficulty:"متوسط"},
  {id:"tm003",category:"👥 صور تشكيلة فريق",question:"تشكيلة أنهي فريق؟",image:"teams/tm003.jpg",answer:"الأهلي 2021",difficulty:"سهل"},
  {id:"tm004",category:"👥 صور تشكيلة فريق",question:"تشكيلة أنهي فريق؟",image:"teams/tm004.jpg",answer:"ريال مدريد 2017",difficulty:"متوسط"},
  {id:"tm005",category:"👥 صور تشكيلة فريق",question:"تشكيلة أنهي فريق؟",image:"teams/tm005.jpg",answer:"ليستر سيتي 2016",difficulty:"صعب"},
  // 🎤 أغاني
  {id:"m001",category:"🎤 غني أغنية مصرية",question:"كمّل: 'بحبك يا حمار...'",answer:"(غناء — الحكم يحكم)",difficulty:"سهل"},
  {id:"m002",category:"🎤 غني أغنية مصرية",question:"غني أغنية 'ثلاث دقات'",answer:"(غناء — الحكم يحكم)",difficulty:"سهل"},
  {id:"m003",category:"🎤 غني أغنية مصرية",question:"كمّل: 'أنا مش بتاع كده...'",answer:"(غناء — الحكم يحكم)",difficulty:"متوسط"},
  {id:"m004",category:"🎤 غني أغنية مصرية",question:"غني مقطع من 'سيبوني لوحدي'",answer:"(غناء — الحكم يحكم)",difficulty:"متوسط"},
  {id:"m005",category:"🎤 غني أغنية مصرية",question:"كمّل: 'يا بنات البنات...'",answer:"(غناء — الحكم يحكم)",difficulty:"سهل"},
  // 🔠 كلمات معكوسة
  ...["الاهرام","النيل","القاهرة","كشري","طعمية","ملوخية","بسبوسة","التوكتوك","الفلوكة","المترو",
      "التحرير","الازهر","القلعة","ابو الهول","الكورنيش","الاسكندرية","اسوان","الاقصر","فول","المولد"]
    .map((w,i)=>({id:"r"+String(i+1).padStart(3,"0"),category:"🔠 كلمات معكوسة",question:"اقرأ الكلمة المعكوسة دي:",
      word:w,reverse:true,answer:w,difficulty:w.length<=4?"سهل":w.length<=7?"متوسط":"صعب"})),
  // 🎬 أفلام ومسلسلات
  {id:"f001",category:"🎬 وصف أفلام ومسلسلات",question:"فيلم عن دكتور نفسي بيرجع للشغل بعد سنين، ويدخل في عالم من الأحلام والجان وحبوب غامضة. إيه اسم الفيلم؟",answer:"الفيل الأزرق",difficulty:"سهل"},
  {id:"f002",category:"🎬 وصف أفلام ومسلسلات",question:"فيلم عن حرب الاستنزاف، وفيه مجموعة صاعقة بتنفّذ مهمة صعبة جوه سيناء بعد نكسة 67.",answer:"الممر",difficulty:"سهل"},
  {id:"f003",category:"🎬 وصف أفلام ومسلسلات",question:"فيلم من أيام الاحتلال الإنجليزي، عن مقاومة سرية وبطلين واحد منهم اسمه كيرة.",answer:"كيرة والجن",difficulty:"متوسط"},
  {id:"f004",category:"🎬 وصف أفلام ومسلسلات",question:"فيلم أحداثه كلها تقريبًا جوه عربية ترحيلات، وفيها ناس من اتجاهات مختلفة اتقبض عليهم بعد أحداث 2013.",answer:"اشتباك",difficulty:"صعب"},
  {id:"f005",category:"🎬 وصف أفلام ومسلسلات",question:"فيلم عن إخوات بيعملوا عمليات سرقة جريئة ويتورطوا في مشاكل كبيرة.",answer:"ولاد رزق",difficulty:"متوسط"},
  {id:"f006",category:"🎬 وصف أفلام ومسلسلات",question:"فيلم رومانسي بيحكي عن الحب على سبع مراحل، وبيتقسم زي محاضرة.",answer:"هيبتا",difficulty:"متوسط"},
  {id:"s001",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل رمضاني عن رجال الشرطة والجيش في مواجهة الإرهاب في سيناء.",answer:"الاختيار",difficulty:"سهل"},
  {id:"s002",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل عن حسن الصباح وفرقة فدائية بتاعة اغتيالات في العصور الوسطى.",answer:"الحشاشين",difficulty:"متوسط"},
  {id:"s003",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل كوميدي عن راجل من الصعيد كبير العيلة وبيعيش وسط مواقف هزار مع إخواته وأهل قريته.",answer:"الكبير أوي",difficulty:"سهل"},
  {id:"s004",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل أكشن عن واحد من حارة شعبية بيبقى قوي ومشهور وهو معروف باسم رفعت.",answer:"الأسطورة",difficulty:"متوسط"},
  {id:"s005",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل عن راجل بيدير عيلة قوية في الصعيد وبيتحول لعمدة وله هيبة وكلمة مسموعة.",answer:"جعفر العمدة",difficulty:"متوسط"},
  {id:"s006",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل رعب وغموض مأخوذ عن روايات الدكتور رفعت إسماعيل.",answer:"ما وراء الطبيعة",difficulty:"متوسط"},
  {id:"s007",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل بيحكي قصة حب وأحداث في حارة اليهود في القاهرة قبل ثورة يوليو.",answer:"حارة اليهود",difficulty:"صعب"},
  {id:"s008",category:"🎬 وصف أفلام ومسلسلات",question:"مسلسل مأخوذ عن رواية، أحداثه وقت الحملة الفرنسية على مصر.",answer:"سره الباتع",difficulty:"صعب"}
];

const QuestionStore = {
  KEY:"habda_questions",
  load(){ try{ const s=localStorage.getItem(this.KEY); if(s) return JSON.parse(s);}catch(e){} return JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)); },
  save(list){ localStorage.setItem(this.KEY, JSON.stringify(list)); },
  reset(){ localStorage.removeItem(this.KEY); }
};

// عكس الكلمة (آخر حرف الأول)
const reverseWord = w => Array.from(w).reverse().join("");