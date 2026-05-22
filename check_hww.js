import { execSync } from 'child_process';
const oldHowWeWorkContent = execSync('git show 9e8d598^1:how-we-work.html').toString('utf8');
console.log(oldHowWeWorkContent.includes('cat-home-kitchen.png') ? 'how-we-work had images' : 'how-we-work did NOT have images');
