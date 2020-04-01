// eslint-disable-next-line import/prefer-default-export
export function unescapeHtml(target) {
    if (typeof target !== 'string') return target;

    const patterns = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
        '&#x27;': "'",
        '&#x60;': '`',
    };

    return target.replace(/&(lt|gt|amp|quot|#x27|#x60);/g, function(match) {
        return patterns[match];
    });
}
