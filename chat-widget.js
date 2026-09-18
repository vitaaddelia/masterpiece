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
    question: "What are you looking for in opportunities?",
    keywords: ["opportunit", "looking for", "job", "role", "hire", "hiring", "work with"],
    answer: "I'm looking for product design roles where I can own a problem end-to-end — from research through developer handoff — ideally on a small team where design has real influence on strategy, not just pixels.\n\n[Edit this in chat-widget.js — this is a placeholder, personalize it!]"
  },
  {
    question: "What do you do for fun?",
    keywords: ["fun", "hobby", "hobbies", "free time", "outside of work", "do for fun"],
    answer: "[This is a placeholder — edit chat-widget.js and tell people what you actually do for fun! e.g. hobbies, weekend activities, interests outside design.]"
  },
  {
    question: "What inspires you?",
    keywords: ["inspire", "inspiration", "motivat"],
    answer: "[This is a placeholder — edit chat-widget.js with what genuinely inspires your design work or your career.]"
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
    answer: "[This is a placeholder — edit chat-widget.js to say whether you're currently open to freelance/contract work, and how people should reach out.]"
  }
];

const GREETING = "Hey there, I'm VitaLLM.";
const FALLBACK = "That's a good question — I don't have a scripted answer for that one yet. Feel free to reach out directly at hola.vitaaddelia@gmail.com and Vita will answer personally!";

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
