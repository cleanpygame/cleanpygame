import {beforeEach, describe, expect, test, vi} from 'vitest';
import {isDebugModeEnabled, parseDebugModeFromUrl, setDebugMode} from '../utils/debugUtils';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        },
        removeItem: (key: string) => {
            delete store[key];
        }
    };
})();

Object.defineProperty(window, 'localStorage', {value: localStorageMock});

// Mock URL search params
const mockURLSearchParams = vi.fn();
Object.defineProperty(window, 'URLSearchParams', {
    value: vi.fn().mockImplementation(() => {
        return {
            get: mockURLSearchParams
        };
    })
});

describe('Debug Utilities', () => {
    beforeEach(() => {
        localStorageMock.clear();
        mockURLSearchParams.mockClear();
        // Reset window.location.search
        Object.defineProperty(window, 'location', {
            value: {search: ''},
            writable: true
        });
    });

    test('isDebugModeEnabled returns false by default', () => {
        expect(isDebugModeEnabled()).toBe(false);
    });

    test('isDebugModeEnabled returns true when debug mode is enabled', () => {
        setDebugMode(true);
        expect(isDebugModeEnabled()).toBe(true);
    });

    test('isDebugModeEnabled returns false when debug mode is disabled', () => {
        setDebugMode(false);
        expect(isDebugModeEnabled()).toBe(false);
    });

    test('setDebugMode sets the value in localStorage', () => {
        setDebugMode(true);
        expect(localStorage.getItem('cleanCodeGame_debugMode')).toBe('true');

        setDebugMode(false);
        expect(localStorage.getItem('cleanCodeGame_debugMode')).toBe('false');
    });

    test('parseDebugModeFromUrl sets debug mode from URL parameter', () => {
        // Mock URL parameter debug=true
        mockURLSearchParams.mockReturnValue('true');

        const result = parseDebugModeFromUrl();

        expect(result).toBe(true);
        expect(localStorage.getItem('cleanCodeGame_debugMode')).toBe('true');
    });

    test('parseDebugModeFromUrl sets debug mode to false from URL parameter', () => {
        // Mock URL parameter debug=false
        mockURLSearchParams.mockReturnValue('false');

        const result = parseDebugModeFromUrl();

        expect(result).toBe(false);
        expect(localStorage.getItem('cleanCodeGame_debugMode')).toBe('false');
    });

    test('parseDebugModeFromUrl returns current setting when no valid parameter is found', () => {
        // Set initial value
        setDebugMode(true);

        // Mock URL parameter not present
        mockURLSearchParams.mockReturnValue(null);

        const result = parseDebugModeFromUrl();

        expect(result).toBe(true);
        expect(localStorage.getItem('cleanCodeGame_debugMode')).toBe('true');
    });
});