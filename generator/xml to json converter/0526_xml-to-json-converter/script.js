/**
 * 526 - XML to JSON Converter
 * Converts XML data to JSON format
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'XML to JSON Converter', icon: '🔄' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function xmlToJson(xml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            throw new Error('Invalid XML: ' + parseError.textContent.substring(0, 100));
        }

        function nodeToJson(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                return text === '' ? null : text;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) {
                return null;
            }

            const result = {};

            // Add attributes
            if (node.attributes && node.attributes.length > 0) {
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    result['@' + attr.name] = attr.value;
                }
            }

            // Add child elements
            const children = Array.from(node.childNodes).filter(
                child => child.nodeType === Node.ELEMENT_NODE || 
                         (child.nodeType === Node.TEXT_NODE && child.textContent.trim())
            );

            if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
                const text = children[0].textContent.trim();
                if (Object.keys(result).length === 0) {
                    return tryParseValue(text);
                }
                result['#text'] = tryParseValue(text);
            } else {
                const childElements = Array.from(node.childNodes).filter(
                    child => child.nodeType === Node.ELEMENT_NODE
                );

                childElements.forEach(child => {
                    const childResult = nodeToJson(child);
                    const childName = child.nodeName;

                    if (result[childName]) {
                        if (!Array.isArray(result[childName])) {
                            result[childName] = [result[childName]];
                        }
                        result[childName].push(childResult);
                    } else {
                        result[childName] = childResult;
                    }
                });
            }

            return result;
        }

        function tryParseValue(val) {
            if (val === 'true') return true;
            if (val === 'false') return false;
            if (val === '' || val === null) return null;
            if (!isNaN(val) && val !== '') return Number(val);
            return val;
        }

        const rootName = doc.documentElement.nodeName;
        const json = {};
        json[rootName] = nodeToJson(doc.documentElement);
        return json;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter XML data'; return; }

        try {
            const result = xmlToJson(input);
            let output = '═══ XML to JSON Conversion ═══\n\n';
            output += JSON.stringify(result, null, 2);
            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error parsing XML: ' + error.message;
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
