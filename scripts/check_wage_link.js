const fs = require('fs');

const backup = fs.readFileSync('backup_before_v4/index.html', 'utf8');

console.log('wage link in backup:', backup.match(/href="[^"]*wage[^"]*"/g));
