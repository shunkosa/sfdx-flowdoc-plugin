// eslint-disable-next-line import/prefer-default-export
export function toArray(elements) {
    if (elements) {
        return Array.isArray(elements) ? elements : [elements];
    }
    return [];
}
