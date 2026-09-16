const fs = require('fs');

const backup = fs.readFileSync('backup_before_v4/index.html', 'utf8');

console.log('--- In Backup ---');
console.log('scheduler link:', backup.match(/href="[^"]*scheduler[^"]*"/g));
console.log('widget articles or news:', backup.match(/id="widget-[^"]+"/g));
