export function setCookie(name, value, days = 0) {
    let expires = "";
    if (days > 0) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // No expires → session cookie → cleared when browser closes
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
    setCookie('past_purchases', uniqueIds.join(','), 30);
}

export function getPurchaseHistory() {
    const cookie = getCookie('past_purchases');
    if (!cookie) return [];
    return cookie.split(',').filter(Boolean);
}

// Full product history helpers
export function addToPurchaseHistoryProducts(products) {
    const existing = getPurchaseHistoryProducts();
    const merged = [...products];
    existing.forEach((existingProduct) => {
        if (!merged.some(p => p._id === existingProduct._id)) {
            merged.push(existingProduct);
        }
    });
    const limited = merged.slice(0, 20);
    setCookie('past_purchases_products', JSON.stringify(limited), 30);
}

export function getPurchaseHistoryProducts() {
    try {
        const cookie = getCookie('past_purchases_products');
        return cookie ? JSON.parse(cookie) : [];
    } catch (err) {
        console.error('Failed to parse purchase history products:', err);
        return [];
    }
}
