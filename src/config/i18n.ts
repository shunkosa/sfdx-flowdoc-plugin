import * as i18n from 'i18n';
import * as path from 'path';

export default function() {
    i18n.configure({
        locales: ['en', 'ja'],
        directory: path.join(__dirname, '/locale'),
        updateFiles: false
    })

    i18n.defaultLocale = 'en';
    return i18n;
}
