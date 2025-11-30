const tokenToTab = new Map();

// Bind a token string to a tabId
function bindTokenToTab(token, tabId) {
    if (!token || !tabId) return false;
    tokenToTab.set(token, tabId);
    return true;
}

// Check if token is allowed for this tab
function isTokenAllowedForTab(token, tabId) {
    if (!token) return false;
    const mapped = tokenToTab.get(token);
    // If not bound yet, deny (token must be bound on login)
    if (!mapped) return false;
    return mapped === tabId;
}

// Unbind token (e.g., logout on this tab)
function unbindToken(token) {
    if (!token) return false;
    return tokenToTab.delete(token);
}

module.exports = {
    bindTokenToTab,
    isTokenAllowedForTab,
    unbindToken,
};
