import { useSyncExternalStore } from 'react';

const listeners = new Set();
let currentAppearance = 'system';

const setCookie = (name, value, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = () => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    return localStorage.getItem('appearance') || 'system';
};

const isDarkMode = () => false;

const applyTheme = () => {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

const subscribe = (callback) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = () => listeners.forEach((listener) => listener());

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => applyTheme(currentAppearance);

export function initializeTheme() {
    if (typeof window === 'undefined') {
        return;
    }

    if (!localStorage.getItem('appearance')) {
        localStorage.setItem('appearance', 'system');
        setCookie('appearance', 'system');
    }

    currentAppearance = getStoredAppearance();
    applyTheme(currentAppearance);

    // Set up system theme change listener
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const resolvedAppearance = isDarkMode(appearance)
        ? 'dark'
        : 'light';

    const updateAppearance = (mode) => {
        currentAppearance = mode;

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    };

    return { appearance, resolvedAppearance, updateAppearance };
}
