const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const readme = path.join(__dirname, 'README.md');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replacements
    // EVM -> ASTER
    content = content.replace(/\bEVM\b/g, 'Aster');
    // ETH -> ASTER
    content = content.replace(/\bETH\b/g, 'ASTER');
    // Ethereum -> Aster
    content = content.replace(/\bEthereum\b/gi, 'Aster');

    fs.writeFileSync(filePath, content, 'utf8');
}

// Replace in src/pages
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx'));
for (const file of files) {
    replaceInFile(path.join(srcDir, file));
}

// Replace in README.md
replaceInFile(readme);

console.log('Replaced all ETH/EVM/Ethereum texts with Aster.');
