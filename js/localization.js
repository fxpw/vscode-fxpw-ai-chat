// Localization module for webview
let localizedStrings = {};

function initLocalization(localizationData) {
	localizedStrings = localizationData || {};
}

function t(key) {
	return localizedStrings[key] || key;
}

// Export functions to global scope for use in other JS files
window.localization = {
	init: initLocalization,
	t: t
};