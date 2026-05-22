import fs from 'fs';
import { execSync } from 'child_process';

// 1. Fix index.html brand tiles
const oldIndexContent = execSync('git show "9e8d598^1:index.html"').toString('utf8');
const brandCategoriesMatch = oldIndexContent.match(/<div class="brand-categories">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/);

if (brandCategoriesMatch) {
    let indexHtml = fs.readFileSync('index.html', 'utf8');
    const categoryTilesMatch = indexHtml.match(/<div class="category-tiles">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/);
    if (categoryTilesMatch) {
        // Just before doing this, we also need to obfuscate the email if it was in the old code block, but wait, the brand-categories block doesn't have an email in it.
        indexHtml = indexHtml.replace(categoryTilesMatch[0], brandCategoriesMatch[0]);
        fs.writeFileSync('index.html', indexHtml, 'utf8');
        console.log('Fixed index.html category images.');
    } else {
        console.log('Could not find category-tiles in index.html');
    }
} else {
    console.log('Could not find brand-categories in old index.html');
}

// 2. Fix js/main.js Modal dynamic text
let mainJs = fs.readFileSync('js/main.js', 'utf8');
const modalLogicToReplace = `            const prefill = btn.getAttribute('data-modal-prefill');
            if (prefill) {
                const purposeField = modal.querySelector('[name="purpose"]');
                if (purposeField) purposeField.value = prefill;

                const subjectField = modal.querySelector('[name="subject"]');
                if (subjectField) subjectField.value = prefill;
            }`;

const newModalLogic = `            const prefill = btn.getAttribute('data-modal-prefill');
            if (prefill) {
                const purposeField = modal.querySelector('[name="purpose"]');
                if (purposeField) purposeField.value = prefill;

                const subjectField = modal.querySelector('[name="subject"]');
                if (subjectField) subjectField.value = prefill;
                
                // Dynamically update modal title and message based on the button clicked
                const modalTitle = modal.querySelector('.modal__title');
                if (modalTitle) modalTitle.textContent = prefill;
                
                const messageField = modal.querySelector('[name="message"]');
                if (messageField) {
                    if (prefill === 'Brand Permission Request') {
                        messageField.value = 'I would like to request brand permission information for SurgeRoot.';
                    } else {
                        messageField.value = 'I would like to request distributor references for SurgeRoot.';
                    }
                }
            }`;

if (mainJs.includes(modalLogicToReplace)) {
    mainJs = mainJs.replace(modalLogicToReplace, newModalLogic);
    fs.writeFileSync('js/main.js', mainJs, 'utf8');
    console.log('Fixed js/main.js modal logic.');
} else {
    console.log('Could not find modal logic to replace in main.js. It might already be fixed or changed.');
}

