/**
 * HTML Entity Decoder
 * Decode HTML entities to characters
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'HTML Entity Decoder', icon: '\uD83D\uDD13' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const decodeBtn = $('#decode');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const htmlEntities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'",
        '&nbsp;': '\u00A0',
        '&copy;': '\u00A9',
        '&reg;': '\u00AE',
        '&trade;': '\u2122',
        '&ndash;': '\u2013',
        '&mdash;': '\u2014',
        '&lsquo;': '\u2018',
        '&rsquo;': '\u2019',
        '&ldquo;': '\u201C',
        '&rdquo;': '\u201D',
        '&bull;': '\u2022',
        '&hellip;': '\u2026',
        '&middot;': '\u00B7',
        '&euro;': '\u20AC',
        '&pound;': '\u00A3',
        '&yen;': '\u00A5',
        '&cent;': '\u00A2',
        '&sect;': '\u00A7',
        '&para;': '\u00B6',
        '&deg;': '\u00B0',
        '&plusmn;': '\u00B1',
        '&times;': '\u00D7',
        '&divide;': '\u00F7',
        '&frac12;': '\u00BD',
        '&frac14;': '\u00BC',
        '&frac34;': '\u00BE',
        '&sup1;': '\u00B9',
        '&sup2;': '\u00B2',
        '&sup3;': '\u00B3',
        '&micro;': '\u00B5',
        '&laquo;': '\u00AB',
        '&raquo;': '\u00BB',
        '&iexcl;': '\u00A1',
        '&iquest;': '\u00BF',
        '&Agrave;': '\u00C0',
        '&Aacute;': '\u00C1',
        '&Acirc;': '\u00C2',
        '&Atilde;': '\u00C3',
        '&Auml;': '\u00C4',
        '&Aring;': '\u00C5',
        '&AElig;': '\u00C6',
        '&Ccedil;': '\u00C7',
        '&Egrave;': '\u00C8',
        '&Eacute;': '\u00C9',
        '&Ecirc;': '\u00CA',
        '&Euml;': '\u00CB',
        '&Igrave;': '\u00CC',
        '&Iacute;': '\u00CD',
        '&Icirc;': '\u00CE',
        '&Iuml;': '\u00CF',
        '&ETH;': '\u00D0',
        '&Ntilde;': '\u00D1',
        '&Ograve;': '\u00D2',
        '&Oacute;': '\u00D3',
        '&Ocirc;': '\u00D4',
        '&Otilde;': '\u00D5',
        '&Ouml;': '\u00D6',
        '&Oslash;': '\u00D8',
        '&Ugrave;': '\u00D9',
        '&Uacute;': '\u00DA',
        '&Ucirc;': '\u00DB',
        '&Uuml;': '\u00DC',
        '&Yacute;': '\u00DD',
        '&THORN;': '\u00DE',
        '&szlig;': '\u00DF',
        '&agrave;': '\u00E0',
        '&aacute;': '\u00E1',
        '&acirc;': '\u00E2',
        '&atilde;': '\u00E3',
        '&auml;': '\u00E4',
        '&aring;': '\u00E5',
        '&aelig;': '\u00E6',
        '&ccedil;': '\u00E7',
        '&egrave;': '\u00E8',
        '&eacute;': '\u00E9',
        '&ecirc;': '\u00EA',
        '&euml;': '\u00EB',
        '&igrave;': '\u00EC',
        '&iacute;': '\u00ED',
        '&icirc;': '\u00EE',
        '&iuml;': '\u00EF',
        '&eth;': '\u00F0',
        '&ntilde;': '\u00F1',
        '&ograve;': '\u00F2',
        '&oacute;': '\u00F3',
        '&ocirc;': '\u00F4',
        '&otilde;': '\u00F5',
        '&ouml;': '\u00F6',
        '&oslash;': '\u00F8',
        '&ugrave;': '\u00F9',
        '&uacute;': '\u00FA',
        '&ucirc;': '\u00FB',
        '&uuml;': '\u00FC',
        '&yacute;': '\u00FD',
        '&thorn;': '\u00FE',
        '&yuml;': '\u00FF',
        '&alpha;': '\u03B1',
        '&beta;': '\u03B2',
        '&gamma;': '\u03B3',
        '&delta;': '\u03B4',
        '&epsilon;': '\u03B5',
        '&zeta;': '\u03B6',
        '&eta;': '\u03B7',
        '&theta;': '\u03B8',
        '&iota;': '\u03B9',
        '&kappa;': '\u03BA',
        '&lambda;': '\u03BB',
        '&mu;': '\u03BC',
        '&nu;': '\u03BD',
        '&xi;': '\u03BE',
        '&pi;': '\u03C0',
        '&sigma;': '\u03C3',
        '&tau;': '\u03C4',
        '&upsilon;': '\u03C5',
        '&phi;': '\u03C6',
        '&chi;': '\u03C7',
        '&psi;': '\u03C8',
        '&omega;': '\u03C9'
    };

    function decodeHtmlEntities(input) {
        let result = input;

        // Decode numeric entities (&#38; or &#x26;)
        result = result.replace(/&#(\d+);/g, (_, code) => {
            return String.fromCharCode(parseInt(code, 10));
        });
        result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        });

        // Decode named entities (case-insensitive)
        const entityRegex = /&([a-zA-Z]+);/g;
        result = result.replace(entityRegex, (match, name) => {
            // Try exact match first
            if (htmlEntities[match]) return htmlEntities[match];
            // Try lowercase
            const lower = '&' + name.toLowerCase() + ';';
            if (htmlEntities[lower]) return htmlEntities[lower];
            // Try capitalize-first
            const capFirst = '&' + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() + ';';
            if (htmlEntities[capFirst]) return htmlEntities[capFirst];
            return match; // Unknown entity, return as-is
        });

        return result;
    }

    function decode() {
        const input = inputEl.value;
        if (!input.trim()) {
            outputEl.textContent = 'Please enter text with HTML entities';
            return;
        }
        try {
            outputEl.textContent = decodeHtmlEntities(input);
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    decodeBtn.addEventListener('click', decode);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('input', debounce(decode, 300));
});
