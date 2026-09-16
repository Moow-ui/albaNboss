const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('index.html', 'utf8');

console.log('--- Deep Validation of Portal index.html ---');

// 1. Check tool cards
const bossScheduler = content.includes('href="https://shift-scheduler.moow-ui.workers.dev/"') && !content.includes('id="boss-btn-scheduler"\n              href="https://shift-scheduler.moow-ui.workers.dev/" \n              class="calc-card card-blue is-pending"');
const bossHourlyWage = content.includes('href="https://paycalculator.moow-ui.workers.dev/wage/"') && content.includes('class="calc-card card-teal"') && !content.includes('class="calc-card card-teal is-pending"');
const bossInsPending = content.includes('class="calc-card card-indigo is-pending"');

const workerWage = content.includes('href="https://shift-calculator.moow-ui.workers.dev/"') && !content.includes('class="calc-card card-orange is-pending"');
const workerSevPending = content.includes('class="calc-card card-purple is-pending"');
const workerNightPending = content.includes('class="calc-card card-rose is-pending"');

console.log('Tool cards status:');
console.log('  Boss Scheduler (Live):', bossScheduler);
console.log('  Boss Hourly Wage (Live):', bossHourlyWage);
console.log('  Boss 4-Insurances (Pending):', bossInsPending);
console.log('  Worker Real Wage (Live):', workerWage);
console.log('  Worker Severance (Pending):', workerSevPending);
console.log('  Worker Night/Holiday (Pending):', workerNightPending);

// 2. Check 6 widgets
const widgetIds = [
  'widget-board',
  'widget-policy-news',
  'widget-news',
  'widget-tips',
  'widget-qna',
  'widget-video'
];
console.log('Widget boxes:');
widgetIds.forEach(id => {
  console.log(`  Widget ${id}:`, content.includes(`id="${id}"`));
});

// 3. Check JS Syntax
const scriptMatches = content.match(/<script>([\s\S]*?)<\/script>/g);
let jsErrors = 0;
scriptMatches.forEach((tag, idx) => {
  const code = tag.replace(/<\/?script>/g, '');
  try {
    new vm.Script(code);
  } catch (err) {
    console.error(`  Script #${idx+1} Syntax Error:`, err.message);
    jsErrors++;
  }
});
console.log('  JS Errors:', jsErrors);

// 4. Check HTML unclosed critical tags
const openArticles = (content.match(/<article/g) || []).length;
const closeArticles = (content.match(/<\/article>/g) || []).length;
console.log(`  <article> tags: ${openArticles} open, ${closeArticles} close`);

const openSections = (content.match(/<section/g) || []).length;
const closeSections = (content.match(/<\/section>/g) || []).length;
console.log(`  <section> tags: ${openSections} open, ${closeSections} close`);

console.log('--- Deep Validation Complete ---');
