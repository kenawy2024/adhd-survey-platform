require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Ensure data directory
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = require('./lib/db');

const surveys = [
  {
    title: 'مقياس تقرير الذات لاضطراب ADHD للبالغين (ASRS)',
    slug: 'asrs-adult-adhd-self-report',
    description: 'مقياس تقرير الذات المعتمد لاضطراب نقص الانتباه وفرط النشاط للبالغين، طورته منظمة الصحة العالمية.',
    category: 'ADHD', icon: '📋', estimatedMinutes: 5,
    questions: [
      { _id: 'asrs_q1', text: 'كم مرة تواجه صعوبة في إنهاء الخطوات الأخيرة من مشروع بعد الانتهاء من الجزء الصعب منه؟', order: 1, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q2', text: 'كم مرة تواجه صعوبة في ترتيب الأمور عند القيام بمهمة تتطلب التنظيم؟', order: 2, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q3', text: 'كم مرة تواجه مشكلة في تذكر المواعيد أو الالتزامات؟', order: 3, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q4', text: 'كم مرة تتجنب أو تتأخر في البدء بمهمة تتطلب تفكيراً كثيراً؟', order: 4, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q5', text: 'كم مرة تتلوى أو تحرك يديك أو قدميك عندما تضطر للجلوس لفترة طويلة؟', order: 5, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q6', text: 'كم مرة تشعر بالنشاط الزائد وكأنك مدفوع بمحرك؟', order: 6, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q7', text: 'كم مرة ترتكب أخطاء بسبب عدم انتباهك للتفاصيل في العمل أو الدراسة؟', order: 7, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q8', text: 'كم مرة تجد صعوبة في الانتباه عند القيام بمهام رتيبة أو مملة؟', order: 8, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q9', text: 'كم مرة تجد صعوبة في التركيز على ما يقوله الناس لك مباشرة؟', order: 9, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q10', text: 'كم مرة تضع الأشياء في أماكن غلط وتجد صعوبة في إيجادها لاحقاً؟', order: 10, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q11', text: 'كم مرة تنشغل بأشياء أخرى وتفقد تركيزك في أثناء القيام بعمل ما؟', order: 11, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q12', text: 'كم مرة تغادر كرسيك في الاجتماعات أو المواقف التي يُتوقع فيها منك الجلوس؟', order: 12, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q13', text: 'كم مرة تشعر بعدم الراحة وأنت جالس بهدوء في وقت فراغك؟', order: 13, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q14', text: 'كم مرة تجد نفسك تتكلم كثيراً في المواقف الاجتماعية؟', order: 14, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'asrs_q15', text: 'كم مرة تكمل جملة الشخص الذي يتحدث معك أو تقاطعه؟', order: 15, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] }
    ],
    scoringRules: [
      { minScore: 0, maxScore: 19, label: 'احتمال منخفض لاضطراب ADHD', description: 'نتيجتك تشير إلى احتمال منخفض لوجود اضطراب نقص الانتباه. أعراضك ضمن النطاق الطبيعي.', color: '#28a745' },
      { minScore: 20, maxScore: 39, label: 'احتمال متوسط لاضطراب ADHD', description: 'نتيجتك تشير إلى بعض أعراض نقص الانتباه. يُنصح بمراجعة متخصص للتقييم الدقيق.', color: '#ffc107' },
      { minScore: 40, maxScore: 60, label: 'احتمال مرتفع لاضطراب ADHD', description: 'نتيجتك تشير إلى احتمال مرتفع لوجود اضطراب نقص الانتباه. يُنصح بشدة باستشارة طبيب أو معالج نفسي.', color: '#dc3545' }
    ]
  },
  {
    title: 'اختبار صعوبة الانتباه وتشتت التركيز',
    slug: 'attention-difficulty-test',
    description: 'اختبار متخصص لقياس مدى صعوبة التركيز والانتباه في المواقف اليومية المختلفة.',
    category: 'ADHD', icon: '🎯', estimatedMinutes: 6,
    questions: [
      { _id: 'att_q1', text: 'هل تجد صعوبة في إتمام قراءة كتاب أو مقالة طويلة دون تشتت؟', order: 1, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q2', text: 'هل تبدأ مهاماً متعددة في نفس الوقت دون إتمام أي منها؟', order: 2, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q3', text: 'هل تنسى بسهولة ما كنت تريد قوله أو تفعله خلال ثوانٍ؟', order: 3, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q4', text: 'هل تجد نفسك تحدق في الفراغ بدلاً من إتمام مهمة أمامك؟', order: 4, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q5', text: 'هل تحتاج إلى قراءة الجملة أكثر من مرة لفهمها؟', order: 5, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q6', text: 'هل تتأثر تركيزك بسهولة بالأصوات أو الحركات من حولك؟', order: 6, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q7', text: 'هل تواجه صعوبة في متابعة التعليمات متعددة الخطوات؟', order: 7, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q8', text: 'هل يصعب عليك الانتباه خلال الاجتماعات أو المحاضرات الطويلة؟', order: 8, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q9', text: 'هل تشعر أن أفكارك "تطير" من موضوع لآخر بسرعة؟', order: 9, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q10', text: 'هل تنسى مهام اليوم اليومية مثل دفع الفواتير أو المواعيد الطبية؟', order: 10, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q11', text: 'هل تجد صعوبة في الحفاظ على انتباهك أثناء المحادثات الاجتماعية؟', order: 11, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'att_q12', text: 'هل تتجنب المهام التي تتطلب تركيزاً مستداماً؟', order: 12, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] }
    ],
    scoringRules: [
      { minScore: 0, maxScore: 15, label: 'احتمال منخفض لصعوبات الانتباه', description: 'لا تظهر عليك أعراض واضحة لصعوبات الانتباه. قدراتك على التركيز ضمن النطاق الطبيعي.', color: '#28a745' },
      { minScore: 16, maxScore: 30, label: 'احتمال متوسط لصعوبات الانتباه', description: 'تعاني من بعض صعوبات الانتباه التي قد تؤثر على حياتك اليومية. يُنصح بالتحدث مع متخصص.', color: '#ffc107' },
      { minScore: 31, maxScore: 48, label: 'احتمال مرتفع لصعوبات الانتباه', description: 'أعراض صعوبات الانتباه واضحة وقد تؤثر بشكل كبير على حياتك. يُنصح بشدة بالتقييم المهني.', color: '#dc3545' }
    ]
  },
  {
    title: 'اختبار الاندفاعية وضبط النفس',
    slug: 'impulsivity-self-control-test',
    description: 'اختبار متخصص لقياس مستوى الاندفاعية وصعوبة ضبط النفس المرتبطة باضطراب ADHD.',
    category: 'ADHD', icon: '⚡', estimatedMinutes: 5,
    questions: [
      { _id: 'imp_q1', text: 'هل تتصرف قبل أن تفكر في عواقب أفعالك؟', order: 1, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q2', text: 'هل تقاطع الآخرين أثناء حديثهم؟', order: 2, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q3', text: 'هل تتخذ قرارات متسرعة ثم تندم عليها لاحقاً؟', order: 3, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q4', text: 'هل تجد صعوبة في الانتظار في طابور أو دورك في المحادثة؟', order: 4, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q5', text: 'هل تنفق المال بشكل غير مخطط له؟', order: 5, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q6', text: 'هل تبدأ في الإجابة قبل أن تنتهي من سماع السؤال؟', order: 6, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q7', text: 'هل تقول أشياء دون تفكير وتندم عليها لاحقاً؟', order: 7, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q8', text: 'هل تتصرف بناءً على مزاجك اللحظي دون التخطيط؟', order: 8, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q9', text: 'هل تجد صعوبة في كبح ردود فعلك العاطفية؟', order: 9, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'imp_q10', text: 'هل تتخطى الخطوات الأساسية في المهام بحثاً عن نتائج سريعة؟', order: 10, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] }
    ],
    scoringRules: [
      { minScore: 0, maxScore: 12, label: 'مستوى اندفاعية منخفض', description: 'تتمتع بقدرة جيدة على ضبط النفس والتفكير قبل التصرف.', color: '#28a745' },
      { minScore: 13, maxScore: 25, label: 'مستوى اندفاعية متوسط', description: 'تظهر بعض السلوكيات الاندفاعية التي قد تؤثر على علاقاتك وقراراتك. يُنصح باستشارة متخصص.', color: '#ffc107' },
      { minScore: 26, maxScore: 40, label: 'مستوى اندفاعية مرتفع', description: 'الاندفاعية تؤثر بشكل واضح على حياتك. يُنصح بشدة بالتقييم من قِبل متخصص في الصحة النفسية.', color: '#dc3545' }
    ]
  },
  {
    title: 'اختبار فرط النشاط الحركي',
    slug: 'hyperactivity-test',
    description: 'اختبار متخصص لقياس مستوى فرط النشاط الحركي وعدم القدرة على الهدوء المرتبطة باضطراب ADHD.',
    category: 'ADHD', icon: '🏃', estimatedMinutes: 5,
    questions: [
      { _id: 'hyp_q1', text: 'هل تشعر بالحاجة المستمرة للتحرك حتى في أوقات الراحة؟', order: 1, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q2', text: 'هل تتحرك أو تتلوى كثيراً عند الجلوس لفترة طويلة؟', order: 2, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q3', text: 'هل تجد صعوبة في ممارسة الأنشطة الهادئة كالقراءة أو مشاهدة التلفاز؟', order: 3, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q4', text: 'هل تقفز من نشاط لآخر دون إتمام أي منها؟', order: 4, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q5', text: 'هل تتكلم بشكل مفرط في المواقف الاجتماعية؟', order: 5, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q6', text: 'هل يصفك الآخرون بأنك "لا تتوقف عن الحركة"؟', order: 6, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q7', text: 'هل تشعر بصعوبة في الاسترخاء التام حتى عندما تريد ذلك؟', order: 7, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q8', text: 'هل تتقن عدة مهام في نفس الوقت بشكل متزامن؟', order: 8, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q9', text: 'هل يؤثر نشاطك الزائد على نوم من حولك؟', order: 9, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q10', text: 'هل تجد صعوبة في إنهاء وجبة طعام دون القيام للبحث عن شيء آخر؟', order: 10, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'hyp_q11', text: 'هل تشعر بالقلق أو الانزعاج عند الاضطرار للبقاء ساكناً؟', order: 11, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] }
    ],
    scoringRules: [
      { minScore: 0, maxScore: 13, label: 'مستوى نشاط طبيعي', description: 'مستوى نشاطك الحركي ضمن النطاق الطبيعي ولا يبدو أنه يؤثر سلباً على حياتك.', color: '#28a745' },
      { minScore: 14, maxScore: 27, label: 'مستوى نشاط فوق الطبيعي', description: 'تظهر عليك بعض أعراض فرط النشاط. قد تستفيد من التقييم من قِبل متخصص.', color: '#ffc107' },
      { minScore: 28, maxScore: 44, label: 'مستوى نشاط مرتفع جداً', description: 'فرط النشاط واضح ومؤثر على حياتك اليومية. يُنصح بشدة بالتقييم المهني.', color: '#dc3545' }
    ]
  },
  {
    title: 'اختبار تأثير ADHD على الحياة اليومية',
    slug: 'adhd-daily-life-impact',
    description: 'اختبار شامل لقياس مدى تأثير أعراض اضطراب ADHD على الحياة اليومية والعلاقات والعمل.',
    category: 'ADHD', icon: '🌟', estimatedMinutes: 7,
    questions: [
      { _id: 'dly_q1', text: 'هل تواجه صعوبة في إدارة وقتك وإنجاز المهام في مواعيدها؟', order: 1, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q2', text: 'هل يؤثر تشتت انتباهك على أداءك في العمل أو الدراسة؟', order: 2, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q3', text: 'هل تعاني من صعوبات في علاقاتك الاجتماعية بسبب أعراض ADHD؟', order: 3, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q4', text: 'هل تؤثر حالتك على مزاجك وشعورك بتقدير الذات؟', order: 4, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q5', text: 'هل تجد صعوبة في الحفاظ على ترتيب منزلك أو مكان عملك؟', order: 5, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q6', text: 'هل تؤخر المهام المهمة حتى آخر لحظة (التسويف)؟', order: 6, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q7', text: 'هل تعاني من اضطرابات في النوم بسبب أفكارك المتسارعة؟', order: 7, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q8', text: 'هل تجد صعوبة في إدارة أموالك أو التخطيط المالي؟', order: 8, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q9', text: 'هل تشعر بالإحباط والتوتر عندما لا تستطيع إنجاز ما تخطط له؟', order: 9, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q10', text: 'هل تتأخر كثيراً عن المواعيد بسبب صعوبات التنظيم؟', order: 10, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q11', text: 'هل تجد صعوبة في الحفاظ على عادات صحية منتظمة؟', order: 11, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q12', text: 'هل تعاني من صعوبة في اتخاذ القرارات حتى في الأمور البسيطة؟', order: 12, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] },
      { _id: 'dly_q13', text: 'هل تشعر أن حياتك الأسرية تتأثر سلباً بأعراضك؟', order: 13, answerOptions: [{text:'أبداً',score:0},{text:'نادراً',score:1},{text:'أحياناً',score:2},{text:'غالباً',score:3},{text:'دائماً',score:4}] }
    ],
    scoringRules: [
      { minScore: 0, maxScore: 16, label: 'تأثير منخفض على الحياة اليومية', description: 'حياتك اليومية تسير بشكل طبيعي إلى حد بعيد. التأثيرات المحتملة لأعراض ADHD محدودة.', color: '#28a745' },
      { minScore: 17, maxScore: 33, label: 'تأثير متوسط على الحياة اليومية', description: 'تعاني من تأثيرات ملحوظة على جوانب من حياتك اليومية. التقييم المهني سيساعدك في الحصول على الدعم المناسب.', color: '#ffc107' },
      { minScore: 34, maxScore: 52, label: 'تأثير مرتفع على الحياة اليومية', description: 'الأعراض تؤثر بشكل كبير على جودة حياتك. يُنصح بشدة بزيارة طبيب أو معالج نفسي متخصص في اضطراب ADHD.', color: '#dc3545' }
    ]
  }
];

async function seed() {
  console.log('🌱 بدء تهيئة قاعدة البيانات...');

  // Clear existing
  await db.surveys.removeAsync({}, { multi: true });
  await db.admins.removeAsync({}, { multi: true });
  await db.ads.removeAsync({}, { multi: true });

  // Insert surveys
  for (const s of surveys) {
    await db.surveys.insertAsync({
      ...s,
      isActive: true,
      totalResponses: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  console.log('✅ تم إضافة 5 استبيانات ADHD');

  // Create admin
  const hashed = await bcrypt.hash('admin123', 12);
  await db.admins.insertAsync({ username: 'admin', password: hashed, email: 'admin@adhd.com', createdAt: new Date() });
  console.log('✅ تم إنشاء حساب المسؤول: admin / admin123');

  // Sample ads (inactive by default)
  await db.ads.insertAsync({ name: 'بانر الصفحة الرئيسية', position: 'homepage_banner', type: 'adsense', adsenseClient: 'ca-pub-XXXXXXXX', adsenseSlot: '1234567890', isActive: false, impressions: 0, clicks: 0, createdAt: new Date() });
  await db.ads.insertAsync({ name: 'إعلان جانبي', position: 'sidebar', type: 'adsense', adsenseClient: 'ca-pub-XXXXXXXX', adsenseSlot: '0987654321', isActive: false, impressions: 0, clicks: 0, createdAt: new Date() });
  await db.ads.insertAsync({ name: 'إعلان صفحة النتائج', position: 'results_page', type: 'adsense', adsenseClient: 'ca-pub-XXXXXXXX', adsenseSlot: '1122334455', isActive: false, impressions: 0, clicks: 0, createdAt: new Date() });
  console.log('✅ تم إضافة أماكن الإعلانات');

  console.log('');
  console.log('🎉 ============================================');
  console.log('✅  تم تهيئة قاعدة البيانات بنجاح!');
  console.log('🚀  شغّل الخادم بـ: npm start');
  console.log('🌐  الموقع: http://localhost:3000');
  console.log('🔐  لوحة التحكم: http://localhost:3000/admin/login.html');
  console.log('👤  بيانات الدخول: admin / admin123');
  console.log('🎉 ============================================');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
