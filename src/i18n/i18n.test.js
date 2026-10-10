import { describe, it, expect, beforeEach } from 'vitest';
import { useI18n } from './index.js';

describe('useI18n', () => {
    beforeEach(() => {
        useI18n().setLocale('es');
    });

    it('traduce al español por defecto', () => {
        const { t } = useI18n();
        expect(t('homeTitle')).toBe('Armador de Horarios');
        expect(t('mySchedule')).toBe('Mi horario');
    });

    it('cambia de idioma en caliente', () => {
        const { t, setLocale } = useI18n();
        setLocale('en');
        expect(t('homeTitle')).toBe('Schedule Builder');
        expect(t('mySchedule')).toBe('My Schedule');
    });

    it('devuelve la clave si la traducción no existe', () => {
        expect(useI18n().t('__missing__')).toBe('__missing__');
    });

    it('ignora locales no soportados', () => {
        const { t, setLocale } = useI18n();
        setLocale('fr');
        expect(t('homeTitle')).toBe('Armador de Horarios');
    });
});
