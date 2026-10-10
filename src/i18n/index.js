import { ref } from 'vue';
import { messages } from './messages.js';

const SUPPORTED = ['es', 'en'];

const detectLocale = () => {
    try {
        const stored = localStorage.getItem('schedule_locale');
        if (stored && SUPPORTED.includes(stored)) return stored;
        const lang = (navigator.language || 'es').toLowerCase();
        return lang.startsWith('en') ? 'en' : 'es';
    } catch {
        return 'es';
    }
};

const locale = ref(detectLocale());

export function useI18n() {
    const t = (key) => messages[locale.value]?.[key] ?? messages.es[key] ?? key;

    const setLocale = (value) => {
        if (!SUPPORTED.includes(value)) return;
        locale.value = value;
        try {
            localStorage.setItem('schedule_locale', value);
        } catch {
            /* ignore storage errors */
        }
    };

    return { locale, t, setLocale };
}
