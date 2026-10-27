/* ====================================================================
   VITALLM: a scripted FAQ assistant. No API key, no backend, no AI model.

   HOW TO EDIT ANSWERS
   Each entry in FAQS has:
     id        a short unique name, used by `related`
     question  the wording shown on suggestion chips
     keywords  words or phrases that trigger it (any language, any case).
               Start a broad word with ~ (like '~experience') so it only wins
               when nothing more specific matches.
               Short words (5 letters or fewer) only match as whole words,
               so "use" won't match "user". Longer ones also match inside
               words, so "opportunit" catches "opportunity" and "opportunities".
               Longer, more specific keywords count for more.
     answer    what VitaLLM says. A blank line starts a new paragraph.
               Links: [[link text|https://…]] or [[link text|/case-study-bonza]].
     related   ids of 2–3 follow-up questions shown after the answer.

   To add a topic, copy an entry, give it a new id, and edit it.
   ==================================================================== */

const EMAIL = 'hola.vitaaddelia@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/vitaaddelia/';
const RESUME = '/resume';
const ASK_VITA = `I'd rather not guess at that one. Email Vita at [[${EMAIL}|mailto:${EMAIL}]] and she'll answer it herself.`;

const FAQS = [
  /* ---------- about Vita ---------- */
  {
    id: 'experience',
    question: "What's your experience?",
    keywords: ['~experience', '~background', 'career', 'work history', '~worked', 'companies', 'employers', 'employer', '~years', '~pengalaman', '~erfahrung', 'where have you worked', 'previous jobs'],
    answer: "I'm a Product Designer at BlazeCommerce (since 2024), working on e-commerce sites, and I also design growth-focused landing pages with DSCommerce for the DACH market.\n\nBefore that I was a Senior Product Designer at NOTES Healthcare ERP (2022–2024), a UX Designer at Kampus Indonesia (2022), and Lead UX Designer at Diceritain (2021).",
    related: ['results', 'blaze', 'notesco']
  },
  {
    id: 'projects',
    question: 'What have you worked on?',
    keywords: ['worked on', 'projects', 'project', 'case study', 'case studies', 'portfolio', 'work samples', 'examples', 'proyek', 'projekte', 'showcase'],
    answer: "Four case studies:\n\n• The Catalog Heist: search and navigation for a 500,000+ product catalog\n• Bonza: an AI dog nutritionist (in staging)\n• Doctors' payslips inside NOTES Healthcare ERP\n• QA automation: 413 automated tests across 200+ pages\n\nAsk me about any of them, or scroll to Selected work.",
    related: ['catalog', 'payslip', 'qa']
  },
  {
    id: 'results',
    question: 'What results have you delivered?',
    keywords: ['results', 'result', 'impact', 'metrics', 'numbers', 'kpi', 'roi', 'achievements', 'achievement', 'outcomes', 'outcome', 'proven', 'success', 'hasil', 'ergebnisse'],
    answer: "A few numbers, each from a specific role:\n\n• +116% conversion and 2.3× ROAS on DACH landing pages (DSCommerce)\n• +40% organic traffic and +25% conversion (BlazeCommerce)\n• +1,125% active user growth I contributed to (NOTES Healthcare ERP)\n• +70% feature usage after the doctors' payslip redesign\n• 27,000+ session hours supported by research at Diceritain",
    related: ['dscommerce', 'payslip', 'abtest']
  },
  {
    id: 'strengths',
    question: 'Why should we hire you?',
    keywords: ['why hire', 'why should', 'strengths', 'strength', 'good at', 'best at', 'unique', 'different', 'skills', 'skill', 'superpower', 'specialty', 'specialise', 'specialize', 'kelebihan', 'stärken'],
    answer: "Three things I'd point to:\n\n• I design for numbers: conversion, organic traffic and feature usage are in every role on my resume.\n• I'm comfortable with complex systems, from a 500,000-product catalog to multi-role hospital workflows.\n• I own delivery past handoff. I built an automated QA suite so what ships matches what I designed.",
    related: ['results', 'qa', 'process']
  },
  {
    id: 'process',
    question: "What's your design process like?",
    keywords: ['process', 'approach', 'how do you design', 'how you design', 'workflow', 'methodology', 'method', 'steps', 'framework', 'proses', 'vorgehen'],
    answer: "I get the structure right before touching pixels: page types, states and what the user is trying to do. Then I design, hand off, and check what actually shipped.\n\nIn practice that means research first (interviews and usability tests), principles agreed before Figma, and automated QA after launch.",
    related: ['research', 'tools', 'qa']
  },
  {
    id: 'research',
    question: 'How do you do user research?',
    keywords: ['research', 'user research', 'interview', 'interviews', 'usability', 'user testing', 'user test', 'audit', 'insights', 'survey', 'discovery', 'users', 'user needs', 'feedback', 'riset', 'forschung'],
    answer: "Depends on the project:\n\n• Interviews: for the payslip redesign I talked with doctors, and their exact words shaped the design.\n• Usability tests and interviews shaped the learning platform at Kampus Indonesia.\n• Research at Diceritain supported 27,000+ session hours.\n• Doctors' own words, quoted in the case study, set the three rules the redesign follows.",
    related: ['payslip', 'kampus', 'process']
  },
  {
    id: 'tools',
    question: 'What tools do you use?',
    keywords: ['tools', 'tool', '~software', 'figma', 'stack', 'framer', 'apps', 'programs', 'design tools', 'tech stack', 'werkzeuge'],
    answer: "Mainly Figma, with Figma AI for first-pass component variants and Figma MCP for developer handoff.\n\nFor QA I use Ghost Inspector and Claude, and I've used Claude Code to check every screen state before a rollout. I design for Shopify, WooCommerce, WordPress and Framer sites.",
    related: ['ai', 'platforms', 'qa']
  },
  {
    id: 'ai',
    question: 'How do you use AI in your work?',
    keywords: ['ai', 'artificial intelligence', 'claude', 'chatgpt', 'gpt', 'llm', 'figma ai', 'mcp', 'prompt', 'prompting', 'machine learning', 'automation tools', 'ki'],
    answer: "As a force multiplier, with me directing the thinking:\n\n• Figma AI for first-pass component variants\n• Figma MCP to keep developer handoff in sync\n• Claude to write 413 Ghost Inspector tests from plain-language descriptions\n• Claude Code to check screen states before a rollout\n\nBonza, currently in staging, is also an AI product: an AI dog nutritionist.",
    related: ['qa', 'bonza', 'tools']
  },
  {
    id: 'platforms',
    question: 'Which platforms do you design for?',
    keywords: ['shopify', 'woocommerce', 'wordpress', 'webflow', 'cms', 'platform', 'platforms', 'code', 'coding', 'html', 'css', 'javascript', 'frontend', 'front end'],
    answer: "Mostly Shopify, WooCommerce, WordPress and Framer: 19+ e-commerce sites at BlazeCommerce alone. I work closely with developers through Figma MCP handoff, and this portfolio itself is hand-coded HTML, CSS and JavaScript.",
    related: ['blaze', 'site', 'tools']
  },

  /* ---------- skills and domains ---------- */
  {
    id: 'ecommerce',
    question: 'What e-commerce work have you done?',
    keywords: ['e-commerce', 'ecommerce', 'online store', 'online shop', 'shop', 'store', 'retail', 'checkout', 'cart', 'product page', 'product pages', 'toko online', 'onlineshop'],
    answer: "Most of my recent work. 19+ sites at BlazeCommerce (+40% organic traffic, +25% conversion), 29+ landing pages for DSCommerce (+116% conversion), and the Catalog Heist search rebuild for a 500,000+ product store.",
    related: ['catalog', 'dscommerce', 'seo']
  },
  {
    id: 'abtest',
    question: 'Do you do A/B testing and CRO?',
    keywords: ['ab test', 'ab testing', 'a b test', 'split test', 'split testing', 'experiment', 'experiments', 'cro', 'conversion', 'conversion rate', 'optimization', 'optimisation', 'optimiz', 'roas', 'growth'],
    answer: "Yes. At DSCommerce, UX changes and A/B testing on landing pages for the DACH market led to +116% conversion and 2.3× ROAS.",
    related: ['dscommerce', 'results', 'ecommerce']
  },
  {
    id: 'seo',
    question: 'Do you design with SEO in mind?',
    keywords: ['seo', 'organic', 'search engine', 'google', 'traffic', 'ranking', 'rankings'],
    answer: "Yes. At BlazeCommerce, clearer navigation and SEO-minded UX contributed to +40% organic traffic. Good information architecture helps shoppers and search engines at the same time.",
    related: ['blaze', 'catalog', 'ecommerce']
  },
  {
    id: 'healthcare',
    question: 'What healthcare work have you done?',
    keywords: ['healthcare', 'health care', 'medical', 'hospital', 'hospitals', 'clinic', 'clinics', 'health', 'kesehatan', 'gesundheit', 'b2b', 'enterprise', 'complex systems'],
    answer: "Two years as Senior Product Designer at NOTES Healthcare ERP, designing multi-role workflows for hospitals and clinics. I contributed to +1,125% active user growth there.\n\nThe doctors' payslip redesign is the case study: feature usage rose 70%.",
    related: ['payslip', 'notesco', 'research']
  },
  {
    id: 'designsystems',
    question: 'Have you built design systems?',
    keywords: ['design system', 'design systems', 'component', 'components', 'tokens', 'ui kit', 'library', 'style guide', 'multi brand'],
    answer: "Yes. I built Diceritain's first design system, and I've designed a multi-brand design system (it's one of the cards on the laptop in Selected work).\n\nOn the Catalog Heist, I used Figma AI for first-pass component variants so I could spend my time on edge cases.",
    related: ['diceritain', 'catalog', 'tools']
  },
  {
    id: 'mobile',
    question: 'Do you design for mobile?',
    keywords: ['mobile', 'responsive', 'phone', 'smartphone', 'ios', 'android', 'app', 'apps design', 'small screen'],
    answer: "Always. A few examples: responsive learning experiences at Kampus Indonesia, and separate desktop and mobile QA tests for every key interaction, because the two break in different ways.",
    related: ['qa', 'kampus', 'ecommerce']
  },
  {
    id: 'collab',
    question: 'How do you work with developers?',
    keywords: ['developers', 'developer handoff', 'handoff', 'hand off', 'engineers', 'engineering', 'team', 'collaborate', 'collaboration', 'stakeholders', 'cross functional', 'zusammenarbeit'],
    answer: "Closely. I use Figma MCP so developers get specs straight from the source, and after launch my automated QA suite gives them the exact failing step, selector and viewport instead of a vague \"something looks wrong\".",
    related: ['qa', 'tools', 'process']
  },
  {
    id: 'a11y',
    question: 'Do you consider accessibility?',
    keywords: ['accessibility', 'accessible', 'a11y', 'wcag', 'inclusive', 'contrast', 'screen reader', 'barrierefrei'],
    answer: "Yes, in practical ways: readable text sizes, contrast that passes WCAG AA, and live text instead of text baked into images, so it stays readable on any screen.",
    related: ['mobile', 'process', 'designsystems']
  },

  /* ---------- case studies ---------- */
  {
    id: 'catalog',
    question: 'Tell me about the Catalog Heist',
    keywords: ['catalog heist', 'catalog', 'catalogue', 'heist', 'alternate worlds', 'comics', 'comic', 'collectibles', 'search', 'filter', 'filters', 'filtering', 'navigation', 'category', 'categories', '500000', '500k'],
    answer: "For Alternate Worlds, a comics and collectibles store with a 500,000+ product catalog on WooCommerce, I redesigned search, filtering and navigation. Category, sub-category and results now live on one page. Launch metrics are still pending, so the case study doesn't claim numbers yet.\n\n[[Read the Catalog Heist case study|/case-study-catalog-heist]]",
    related: ['designsystems', 'ecommerce', 'bonza']
  },
  {
    id: 'bonza',
    question: 'Tell me about Bonza',
    keywords: ['bonza', 'dog', 'dogs', 'pet', 'pets', 'meal', 'meal plan', 'food', 'nutrition', 'nutritionist', 'quiz', 'onboarding', 'subscription'],
    answer: "Bonza is an AI dog nutritionist, currently in staging. A short quiz builds a meal plan, and the plan keeps adjusting after checkout, with the owner confirming every change.\n\n[[Read the Bonza case study|/case-study-bonza]]",
    related: ['ai', 'catalog', 'payslip']
  },
  {
    id: 'payslip',
    question: "Tell me about the doctors' payslip project",
    keywords: ['payslip', 'payslips', 'pay slip', 'salary', 'salaries', 'pay', 'payroll', 'doctor', 'doctors', 'finance', 'gaji', 'dokter'],
    answer: "Inside NOTES Healthcare ERP, doctors couldn't trace their own pay: deductions had no labels and a question meant days of waiting for HR. I redesigned the salary experience around three rules: show the highlights first, give every number a receipt, and no dead ends.\n\nFeature usage jumped 70%, and drop-off in multi-step flows fell from 47% to 11%.\n\n[[Read the payslip case study|/case-study-notes-payslip]]",
    related: ['healthcare', 'research', 'qa']
  },
  {
    id: 'qa',
    question: 'Tell me about the QA automation project',
    keywords: ['qa', 'quality', 'quality assurance', 'testing', 'tests', 'test', 'ghost inspector', 'automation', 'automated', 'automate', 'bugs', 'bug', 'regression', '413'],
    answer: "I built an automated QA system with Ghost Inspector and Claude: 413 tests across 200+ pages, run with one API call after every deployment. It checks the states I designed (open cart, open mobile menu, drawers), not just whether pages load.\n\n[[Read the QA case study|/case-study-qa-automation]]",
    related: ['ai', 'collab', 'results']
  },

  /* ---------- companies ---------- */
  {
    id: 'blaze',
    question: 'What do you do at BlazeCommerce?',
    keywords: ['blazecommerce', 'blaze commerce', 'blaze', 'current job', 'current role', 'now', 'currently'],
    answer: "I'm a Product Designer for e-commerce at BlazeCommerce (since 2024): 19+ sites across Shopify, WooCommerce, WordPress and Framer, with +40% organic traffic and +25% conversion.",
    related: ['seo', 'platforms', 'catalog']
  },
  {
    id: 'dscommerce',
    question: 'What did you do at DSCommerce?',
    keywords: ['dscommerce', 'ds commerce', 'dach', 'germany', 'german market', 'austria', 'switzerland', 'landing page', 'landing pages', 'deutschland'],
    answer: "Product Designer for growth and commerce (2025–2026): 29+ landing pages for the DACH market, with +116% conversion and 2.3× ROAS through UX and A/B testing.",
    related: ['abtest', 'results', 'ecommerce']
  },
  {
    id: 'notesco',
    question: 'What did you do at NOTES Healthcare ERP?',
    keywords: ['notes healthcare', 'notes erp', 'notes', 'erp', 'senior product designer', 'senior designer'],
    answer: "Senior Product Designer (2022–2024): multi-role workflows for hospitals and clinics. I contributed to +1,125% active user growth, and redesigned how doctors read their pay.",
    related: ['payslip', 'healthcare', 'research']
  },
  {
    id: 'kampus',
    question: 'What did you do at Kampus Indonesia?',
    keywords: ['kampus', 'kampus indonesia', 'edtech', 'online education', 'learning platform', 'e learning', 'elearning', 'students', 'course', 'courses'],
    answer: "UX Designer (2022): responsive learning experiences for an online education platform, shaped by usability tests and interviews.",
    related: ['research', 'mobile', 'diceritain']
  },
  {
    id: 'diceritain',
    question: 'What did you do at Diceritain?',
    keywords: ['diceritain', 'mental health', 'peer support', 'wellbeing', 'counseling', 'counselling'],
    answer: "Lead UX Designer (2021) on a mental-health peer-support app. I built its first design system, and my research supported 27,000+ session hours.",
    related: ['designsystems', 'research', 'kampus']
  },

  /* ---------- practical ---------- */
  {
    id: 'resume',
    question: 'Can I see your resume?',
    keywords: ['resume', 'cv', 'curriculum', 'lebenslauf', 'riwayat hidup', 'download cv'],
    answer: "Of course: [[View Vita's resume|" + RESUME + "]]. You can download it as a PDF from that page too.",
    related: ['experience', 'contact', 'opportunities']
  },
  {
    id: 'contact',
    question: 'How can I get in touch?',
    keywords: ['contact', 'reach', 'email', 'e mail', 'mail', 'get in touch', 'linkedin', 'talk', 'message', 'call', 'meeting', 'kontak', 'kontakt'],
    answer: "Email is fastest: [[" + EMAIL + "|mailto:" + EMAIL + "]]\n\nOr find me on [[LinkedIn|" + LINKEDIN + "]].",
    related: ['opportunities', 'freelance', 'resume']
  },
  {
    id: 'opportunities',
    question: 'What are you looking for in opportunities?',
    keywords: ['opportunit', 'looking for', 'job', 'role', 'position', 'hire', 'hiring', 'recruit', 'work with', 'next role', 'open to work', 'lowongan', 'stelle'],
    answer: "Product design roles where I can own a problem end-to-end, from research through developer handoff and QA, ideally on a small team where design shapes strategy, not just pixels.",
    related: ['strengths', 'contact', 'freelance']
  },
  {
    id: 'freelance',
    question: 'Are you open to freelance work?',
    keywords: ['freelance', 'freelancer', 'contract', 'contractor', 'available', 'availability', 'part time', 'project basis', 'side project', 'consulting'],
    answer: "Depends on the project. The fastest way to find out is to ask: email [[" + EMAIL + "|mailto:" + EMAIL + "]] with a bit about what you have in mind.",
    related: ['contact', 'rates', 'opportunities']
  },
  { id: 'rates', question: 'What are your rates?', keywords: ['rate', 'rates', 'pricing', 'price', 'cost', 'budget', 'how much', 'salary expectation', 'fee', 'fees', 'harga'], answer: ASK_VITA, related: ['freelance', 'contact'] },
  { id: 'location', question: 'Where are you based?', keywords: ['based', 'located', 'location', 'where are you', 'where do you live', 'timezone', 'time zone', 'remote', 'relocat', 'country', 'city'], answer: ASK_VITA, related: ['opportunities', 'contact'] },
  { id: 'languages', question: 'Which languages do you speak?', keywords: ['language', 'languages', 'speak', 'english', 'german', 'deutsch', 'bahasa', 'indonesian'], answer: ASK_VITA, related: ['dscommerce', 'contact'] },
  { id: 'education', question: 'What did you study?', keywords: ['education', 'degree', 'university', 'study', 'studied', 'school', 'bootcamp', 'certificate', 'certification', 'kuliah', 'studium'], answer: ASK_VITA, related: ['experience', 'resume'] },
  { id: 'fun', question: 'What do you do for fun?', keywords: ['fun', 'hobby', 'hobbies', 'free time', 'outside of work', 'weekend', 'personal'], answer: ASK_VITA, related: ['inspire', 'contact'] },
  { id: 'inspire', question: 'What inspires you?', keywords: ['inspire', 'inspiration', 'motivat', 'passion', 'why design', 'favorite', 'favourite'], answer: ASK_VITA, related: ['process', 'contact'] },

  /* ---------- about this site and VitaLLM ---------- */
  {
    id: 'site',
    question: 'How was this site built?',
    keywords: ['this site', 'this website', 'website', 'portfolio site', 'built this', 'made this', 'laptop', '3d', 'three js', 'threejs', 'animation', 'logo', 'vita design'],
    answer: "Designed and coded by Vita: hand-written HTML, CSS and JavaScript, with three.js for the 3D laptop and Lenis for smooth scrolling. It's hosted on Vercel.",
    related: ['platforms', 'vitallm', 'projects']
  },
  {
    id: 'vitallm',
    question: 'Are you an AI?',
    keywords: ['vitallm', 'are you ai', 'are you an ai', 'real ai', 'are you real', 'are you human', 'are you a bot', 'bot', 'chatbot', 'who are you', 'what are you', 'robot', 'talking to'],
    answer: "I'm VitaLLM, a scripted assistant with no AI model behind me. Vita wrote every answer, and I match your question to the closest one by its keywords. If I miss, email her at [[" + EMAIL + "|mailto:" + EMAIL + "]].",
    related: ['help', 'site', 'contact']
  },
  {
    id: 'help',
    question: 'What can I ask you?',
    keywords: ['help', 'what can i ask', 'what can you do', 'topics', 'options', 'menu', 'questions', 'bantuan', 'hilfe'],
    answer: "Ask about Vita's experience, results, any case study (Catalog Heist, Bonza, payslips, QA automation), her process, research, tools, AI, e-commerce, healthcare, mobile or design systems. Or tap a suggestion below.",
    related: ['experience', 'projects', 'results']
  },
  {
    id: 'hello',
    question: 'Hi!',
    keywords: ['hi', 'hello', 'hey', 'hiya', 'halo', 'hai', 'hallo', 'good morning', 'good afternoon', 'good evening', 'selamat'],
    answer: "Hi! I'm VitaLLM. Ask me anything about Vita's work, or pick a question below.",
    related: ['experience', 'projects', 'results']
  },
  {
    id: 'thanks',
    question: 'Thanks!',
    keywords: ['thanks', 'thank you', 'thx', 'cheers', 'makasih', 'terima kasih', 'danke', 'great', 'awesome', 'cool'],
    answer: "You're welcome! If you'd like to talk to Vita herself, email is fastest: [[" + EMAIL + "|mailto:" + EMAIL + "]]",
    related: ['contact', 'resume', 'projects']
  }
];

const GREETING = "Hey there, I'm VitaLLM.";
// Suggestions shown when the chat opens, in this order (by id).
const CHIP_ORDER = ['experience', 'projects', 'results', 'strengths', 'process', 'contact'];
const FALLBACK = "Hmm, I don't have an answer for that one yet. Try asking about Vita's experience, a case study, her tools or her process, or email her at [[" + EMAIL + "|mailto:" + EMAIL + "]].";
const FALLBACK_RELATED = ['help', 'projects', 'contact'];

/* ==================================================================== */

const byId = Object.fromEntries(FAQS.map((f) => [f.id, f]));

// Lowercase, drop apostrophes, turn punctuation into spaces (keeping +, for "A+"),
// and pad with spaces so whole-word matches work at the edges.
function norm(text) {
  return ' ' + text.toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}\s+]/gu, ' ').replace(/\s+/g, ' ').trim() + ' ';
}
const COMPILED = FAQS.map((faq) => ({
  faq,
  keys: faq.keywords.map((k) => {
    const weak = k.startsWith('~');                 // broad word: counts, but loses to anything specific
    const n = norm(weak ? k.slice(1) : k).trim();
    return { n, weak, whole: n.length <= 5 && !n.includes(' ') };
  })
}));

function findFaq(text) {
  const t = norm(text);
  let best = null, bestScore = 0;
  COMPILED.forEach(({ faq, keys }) => {
    let score = 0;
    keys.forEach(({ n, weak, whole }) => {
      if (!n) return;
      if (whole ? t.includes(' ' + n + ' ') : t.includes(n)) score += weak ? 2 : n.length;
    });
    if (score > bestScore) { bestScore = score; best = faq; }
  });
  return best;
}

const launcher = document.getElementById('vlmLauncher');
const panel = document.getElementById('vlmPanel');
const closeBtn = document.getElementById('vlmClose');
const resetBtn = document.getElementById('vlmReset');
const body = document.getElementById('vlmBody');
const form = document.getElementById('vlmForm');
const input = document.getElementById('vlmInput');

function openPanel() {
  panel.classList.add('open');
  launcher.classList.add('hidden');
  if (!body.dataset.started) startConversation();
}

function closePanel() {
  panel.classList.remove('open');
  launcher.classList.remove('hidden');
}

function chips(ids, extraClass) {
  const wrap = document.createElement('div');
  wrap.className = 'vlm-suggestions' + (extraClass ? ' ' + extraClass : '');
  ids.map((id) => byId[id]).filter(Boolean).forEach((faq) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'vlm-suggestion';
    chip.textContent = '\u21aa\u00a0 ' + faq.question;
    chip.addEventListener('click', () => askQuestion(faq.question, faq));
    wrap.appendChild(chip);
  });
  return wrap;
}

function startConversation() {
  body.innerHTML = '';
  body.dataset.started = 'true';
  const greetEl = document.createElement('div');
  greetEl.className = 'vlm-greeting';
  greetEl.textContent = GREETING;
  body.appendChild(greetEl);
  body.appendChild(chips(CHIP_ORDER));
}

// Renders plain text with [[label|href]] links, built with DOM nodes (no innerHTML).
function addMessage(text, from) {
  const msg = document.createElement('div');
  msg.className = from === 'user' ? 'vlm-msg vlm-msg--user' : 'vlm-msg vlm-msg--bot';
  if (from === 'user') {
    msg.textContent = text;
  } else {
    const re = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      msg.appendChild(document.createTextNode(text.slice(last, m.index)));
      const a = document.createElement('a');
      a.textContent = m[1];
      a.href = m[2];
      if (/^https?:/.test(m[2])) { a.target = '_blank'; a.rel = 'noopener'; }
      msg.appendChild(a);
      last = re.lastIndex;
    }
    msg.appendChild(document.createTextNode(text.slice(last)));
  }
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function askQuestion(questionText, knownFaq) {
  body.querySelectorAll('.vlm-suggestions').forEach((el) => el.remove());
  addMessage(questionText, 'user');
  const faq = knownFaq || findFaq(questionText);
  setTimeout(() => {
    addMessage(faq ? faq.answer : FALLBACK, 'bot');
    body.appendChild(chips(faq ? faq.related : FALLBACK_RELATED, 'vlm-followups'));
    body.scrollTop = body.scrollHeight;
  }, 300);
}

launcher.addEventListener('click', openPanel);
closeBtn.addEventListener('click', closePanel);
resetBtn.addEventListener('click', startConversation);

const headerLink = document.getElementById('vlmHeaderLink');
if (headerLink) headerLink.addEventListener('click', openPanel);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  askQuestion(text);
  input.value = '';
});
