import * as i18n from 'i18n';
import * as path from 'path';

export default function(locale: string) {
    i18n.configure({
        locales: ['en', 'ja'],
        directory: path.join(__dirname, '/locale'),
        updateFiles: false
    })

    i18n.defaultLocale = locale === 'ja' ? 'ja' : 'en';
    i18n.locale = locale === 'ja' ? 'ja' : 'en';
    return i18n;
}
