/**
 * Lorem Ipsum Generator
 * Generate lorem ipsum placeholder text
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Lorem Ipsum Generator', icon: '📜' });

    const paragraphCountEl = $('#paragraphCount');
    const sentencesPerParagraphEl = $('#sentencesPerParagraph');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    const words = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
        'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
        'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
        'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
        'explicabo', 'nemo', 'ipsam', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
        'consequuntur', 'magni', 'ratione', 'sequi', 'nesciunt', 'neque', 'porro',
        'quisquam', 'numquam', 'quaerat', 'mollitia', 'officiis', 'debitis', 'autem',
        'quibusdam', 'maiores', 'alias', 'perferendis', 'doloribus', 'repellat'
    ];

    function randomWord() {
        return words[Math.floor(Math.random() * words.length)];
    }

    function generateSentence() {
        const length = Math.floor(Math.random() * 8) + 5;
        const sentenceWords = [];
        for (let i = 0; i < length; i++) {
            sentenceWords.push(randomWord());
        }
        sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
        return sentenceWords.join(' ') + '.';
    }

    function generate() {
        const numParagraphs = Math.max(1, Math.min(50, parseInt(paragraphCountEl.value) || 3));
        const numSentences = Math.max(1, Math.min(20, parseInt(sentencesPerParagraphEl.value) || 4));

        try {
            const paragraphs = [];
            for (let i = 0; i < numParagraphs; i++) {
                const sentences = [];
                for (let j = 0; j < numSentences; j++) {
                    sentences.push(generateSentence());
                }
                paragraphs.push(sentences.join(' '));
            }

            const result = paragraphs.join('\n\n');
            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        paragraphCountEl.value = '3';
        sentencesPerParagraphEl.value = '4';
        outputEl.textContent = '-';
    }

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.textContent;
            if (text === '-') {
                showToast('No data to copy');
                return;
            }
            copyToClipboard(text);
        });
    }
});
