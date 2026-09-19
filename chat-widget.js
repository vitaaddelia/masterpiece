/* ====================================================================
   VITALLM — a scripted FAQ widget, no API key or backend needed.

   HOW TO EDIT YOUR ANSWERS:
   Scroll down to the FAQS array below. Each entry has:
     - question: shown as a clickable suggestion chip
     - keywords: words that trigger this answer when someone types
       their own question (lowercase, no punctuation)
     - answer: what VitaLLM says back (plain text, can include \n\n
       for a new paragraph)

   To add a new Q&A: copy one of the objects in the array and edit it.
   To change the greeting or fallback message, edit GREETING and
   FALLBACK below the array.
   ==================================================================== */

const FAQS = [
  {
    question: "What's your experience?",
    keywords: ["experience", "background", "career", "history", "worked", "companies", "employer", "resume", "cv"],
    answer: "I'm currently a Product Designer at BlazeCommerce (e-commerce, since May 2024), and also work with DSCommerce on growth-focused design in the DACH market.\n\nBefore that, I was a Senior Product Designer at NOTES Healthcare ERP (2022–2024), designing multi-role workflows for hospitals and clinics, and earlier did UX design at Kampus Indonesia and Diceritain."
  },
  {
    question: "What have you worked on?",
    keywords: ["worked on", "projects", "case studies", "portfolio", "built", "shipped"],
    answer: "A few recent ones: The Catalog Heist (redesigning search & navigation for a 500K+ product e-commerce catalog), Bonza (an AI-driven dog meal-plan concept), and a salary redesign for doctors inside NOTES Healthcare ERP. You can see all three in the Work section above!"
  },
  {
    question: "What are you looking for in opportunities?",
    keywords: ["opportunit", "looking for", "job", "role", "hire", "hiring", "work with"],
    answer: "I'm looking for product design roles where I can own a problem end-to-end — from research through developer handoff — ideally on a small team where design has real influence on strategy, not just pixels."
  },
  {
    question: "What do you do for fun?",
    keywords: ["fun", "hobby", "hobbies", "free time", "outside of work", "do for fun"],
    answer: "Ooh, good one — I haven't taught VitaLLM that story yet! Email Vita directly at hola.vitaaddelia@gmail.com and she'll happily tell you herself 😊"
  },
  {
    question: "What inspires you?",
    keywords: ["inspire", "inspiration", "motivat"],
    answer: "That one's a bit too personal for a scripted bot to guess at! Drop Vita a line at hola.vitaaddelia@gmail.com — she'd love to actually answer that one herself."
  },
  {
    question: "What's your design process like?",
    keywords: ["process", "approach", "how do you design", "workflow", "methodology"],
    answer: "I try to get the structure right before touching pixels — mapping page types, states, and user intent first. That upfront system-thinking means fewer surprises later, and a design that can flex as a product grows."
  },
  {
    question: "What tools do you use?",
    keywords: ["tools", "software", "figma", "use", "stack"],
    answer: "Mainly Figma, plus Figma AI for first-pass component variants and Figma MCP for developer handoff. I've also used Claude Code for systematic QA — checking every screen state against expected behavior before a rollout."
  },
  {
    question: "Are you open to freelance or contract work?",
    keywords: ["freelance", "contract", "available", "availability"],
    answer: "Depends on the project! The fastest way to find out is just to ask — email Vita at hola.vitaaddelia@gmail.com with a bit about what you have in mind 😊"
  },
  {
    question: "Where are you based?",
    keywords: ["based", "located", "location", "live", "from", "where are you"],
    answer: "I'll let Vita share that one herself — email her at hola.vitaaddelia@gmail.com and she'll fill you in!"
  },
  {
    question: "How can I get in touch?",
    keywords: ["contact", "reach", "email", "get in touch", "linkedin", "talk"],
    answer: "Best ways to reach me: hola.vitaaddelia@gmail.com or LinkedIn — both linked in the footer of this site!"
  }
];

const GREETING = "Hey there, I'm VitaLLM.";
const FALLBACK = "Hmm, I don't have a scripted answer for that one yet! Email Vita directly at hola.vitaaddelia@gmail.com — she'd love to answer that herself 😊";

/* ==================================================================== */

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

function startConversation() {
  body.innerHTML = '';
  body.dataset.started = 'true';

  const greetEl = document.createElement('div');
  greetEl.className = 'vlm-greeting';
  greetEl.textContent = GREETING;
  body.appendChild(greetEl);

  const suggestions = document.createElement('div');
  suggestions.className = 'vlm-suggestions';
  FAQS.forEach(faq => {
    const chip = document.createElement('button');
    chip.className = 'vlm-suggestion';
    chip.innerHTML = '&#8618;&nbsp; ' + faq.question;
    chip.addEventListener('click', () => askQuestion(faq.question));
    suggestions.appendChild(chip);
  });
  body.appendChild(suggestions);
}

function addMessage(text, from) {
  const msg = document.createElement('div');
  msg.className = from === 'user' ? 'vlm-msg vlm-msg--user' : 'vlm-msg vlm-msg--bot';
  msg.textContent = text;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function findAnswer(text) {
  const clean = text.toLowerCase().replace(/[^\w\s]/g, '');
  let best = null;
  let bestScore = 0;
  FAQS.forEach(faq => {
    let score = 0;
    faq.keywords.forEach(kw => {
      if (clean.includes(kw)) score++;
    });
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  });
  return best ? best.answer : FALLBACK;
}

function askQuestion(questionText) {
  // Remove suggestion chips after first real question, keeps chat tidy
  const suggestionsEl = body.querySelector('.vlm-suggestions');
  if (suggestionsEl) suggestionsEl.remove();

  addMessage(questionText, 'user');
  const answer = findAnswer(questionText);
  setTimeout(() => addMessage(answer, 'bot'), 300);
}

launcher.addEventListener('click', openPanel);
closeBtn.addEventListener('click', closePanel);
resetBtn.addEventListener('click', startConversation);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  askQuestion(text);
  input.value = '';
});
