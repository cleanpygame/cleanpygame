/**
 * Utility functions for debug mode
 */

const DEBUG_STORAGE_KEY = 'cleanCodeGame_debugMode';

/**
 * Checks if debug mode is enabled
 * @returns Whether debug mode is enabled
 */
export const isDebugModeEnabled = (): boolean => {
    return localStorage.getItem(DEBUG_STORAGE_KEY) === 'true';
};

/**
 * Sets debug mode enabled/disabled
 * @param enabled - Whether debug mode should be enabled
 */
export const setDebugMode = (enabled: boolean): void => {
    localStorage.setItem(DEBUG_STORAGE_KEY, enabled ? 'true' : 'false');
};

/**
 * Parses URL query parameters for debug mode
 * If debug=true or debug=false is present in the URL, it will update the local storage value
 * If debug parameter is not present, it will return the value from localStorage
 * If no value in localStorage, default is false
 * @returns Whether debug mode is enabled after parsing
 */
export const parseDebugModeFromUrl = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');

    if (debugParam === 'true' || debugParam === 'false') {
        const isEnabled = debugParam === 'true';
        setDebugMode(isEnabled);
        return isEnabled;
    }

    // If no valid debug parameter is found, return the current setting from localStorage
    return isDebugModeEnabled();
};