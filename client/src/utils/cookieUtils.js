export function setCookie(name, value, days = 365) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

export function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Purchase history helpers using cookies
export function addToPurchaseHistory(productIds) {
    const existing = getCookie('past_purchases');
    const currentIds = existing ? existing.split(',') : [];
    const uniqueIds = [...new Set([...productIds, ...currentIds])].slice(0, 20);
    setCookie('past_purchases', uniqueIds.join(','), 365);
}

export function getPurchaseHistory() {
    const cookie = getCookie('past_purchases');
    if (!cookie) return [];
    return cookie.split(',').filter(Boolean);
}
