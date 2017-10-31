const fs = require('fs');
const extractText = require('../src/unfluff/unfluff');

const text = fs.readFileSync(process.argv[2]);

console.log(extractText(text, 'zh'));
