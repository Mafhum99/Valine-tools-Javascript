/**
 * 527 - YAML to JSON Converter
 * Converts YAML data to JSON format
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'YAML to JSON Converter', icon: '🔄' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function yamlToJson(yaml) {
        const lines = yaml.split('\n');
        const result = {};
        const stack = [{ obj: result, indent: -1 }];

        function getIndentLevel(line) {
            const match = line.match(/^(\s*)/);
            return match[0].length;
        }

        function tryParseValue(val) {
            val = val.trim();
            if (val === '' || val === '~' || val === 'null') return null;
            if (val === 'true' || val === 'True' || val === 'TRUE') return true;
            if (val === 'false' || val === 'False' || val === 'FALSE') return false;

            // Remove quotes
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                return val.slice(1, -1);
            }

            // Number
            if (!isNaN(val) && val !== '') return Number(val);

            // Inline array
            if (val.startsWith('[') && val.endsWith(']')) {
                const inner = val.slice(1, -1).trim();
                if (inner === '') return [];
                return inner.split(',').map(item => {
                    const trimmed = item.trim();
                    // Remove quotes from items
                    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                        return trimmed.slice(1, -1);
                    }
                    return tryParseValue(trimmed);
                });
            }

            // Inline object
            if (val.startsWith('{') && val.endsWith('}')) {
                const inner = val.slice(1, -1).trim();
                if (inner === '') return {};
                const obj = {};
                inner.split(',').forEach(pair => {
                    const [k, ...v] = pair.split(':');
                    if (k && v.length > 0) {
                        obj[k.trim()] = tryParseValue(v.join(':').trim());
                    }
                });
                return obj;
            }

            return val;
        }

        function getCurrentContainer(indent) {
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            return stack[stack.length - 1].obj;
        }

        let inMultilineString = false;
        let multilineKey = '';
        let multilineIndent = 0;
        let multilineValue = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines and comments
            if (trimmed === '' || trimmed.startsWith('#')) continue;

            // Handle multiline strings
            if (inMultilineString) {
                const lineIndent = getIndentLevel(line);
                if (lineIndent >= multilineIndent && trimmed !== '') {
                    multilineValue.push(line.slice(multilineIndent));
                    continue;
                } else {
                    const container = getCurrentContainer(multilineIndent);
                    const key = multilineKey;
                    container[key] = multilineValue.join('\n');
                    inMultilineString = false;
                    multilineValue = [];
                }
            }

            const indent = getIndentLevel(line);

            // List item
            if (trimmed.startsWith('- ')) {
                const container = getCurrentContainer(indent);
                const content = trimmed.slice(2).trim();

                // Find the parent array
                let parentArray = null;
                let parentKey = null;
                for (let j = stack.length - 1; j >= 0; j--) {
                    if (Array.isArray(stack[j].obj)) {
                        parentArray = stack[j].obj;
                        break;
                    }
                }

                if (content.includes(':')) {
                    const [key, ...valParts] = content.split(':');
                    const keyName = key.trim();
                    const valStr = valParts.join(':').trim();

                    if (valStr === '' || valStr === '|' || valStr === '>') {
                        const newItem = {};
                        if (parentArray) {
                            parentArray.push(newItem);
                            stack.push({ obj: newItem, indent: indent });
                        }
                        if (valStr === '|' || valStr === '>') {
                            inMultilineString = true;
                            multilineKey = keyName;
                            multilineIndent = indent + 2;
                        }
                    } else {
                        const newItem = { [keyName]: tryParseValue(valStr) };
                        if (parentArray) {
                            parentArray.push(newItem);
                        }
                    }
                } else {
                    if (parentArray) {
                        parentArray.push(tryParseValue(content));
                    }
                }
                continue;
            }

            // Key-value pair
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex !== -1) {
                const key = trimmed.substring(0, colonIndex).trim();
                const valStr = trimmed.substring(colonIndex + 1).trim();

                const container = getCurrentContainer(indent);

                if (valStr === '' || valStr === '|' || valStr === '>') {
                    // Check if next non-empty line is a list
                    const nextLineIdx = i + 1;
                    while (nextLineIdx < lines.length && (lines[nextLineIdx].trim() === '' || lines[nextLineIdx].trim().startsWith('#'))) {
                        // skip
                    }
                    if (nextLineIdx < lines.length && lines[nextLineIdx].trim().startsWith('- ')) {
                        container[key] = [];
                        stack.push({ obj: container[key], indent: indent });
                    } else if (valStr === '|' || valStr === '>') {
                        inMultilineString = true;
                        multilineKey = key;
                        multilineIndent = indent + 2;
                        multilineValue = [];
                    } else {
                        container[key] = {};
                        stack.push({ obj: container[key], indent: indent });
                    }
                } else {
                    container[key] = tryParseValue(valStr);
                }
            }
        }

        if (inMultilineString && multilineValue.length > 0) {
            const container = getCurrentContainer(0);
            container[multilineKey] = multilineValue.join('\n');
        }

        return result;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter YAML data'; return; }

        try {
            const result = yamlToJson(input);
            let output = '═══ YAML to JSON Conversion ═══\n\n';
            output += JSON.stringify(result, null, 2);
            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error parsing YAML: ' + error.message;
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
