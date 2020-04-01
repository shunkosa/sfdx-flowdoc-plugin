// eslint-disable-next-line import/prefer-default-export
export function toArray<T = any>(elements): Array<T> {
    if (elements) {
        return Array.isArray(elements) ? elements : [elements];
    }
    return [];
}
