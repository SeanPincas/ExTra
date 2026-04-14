import { readFileSync } from "node:fs";

const quotesFileUrl = new URL("../data/quotes.json", import.meta.url);
const quoteLibrary = JSON.parse(readFileSync(quotesFileUrl, "utf-8"));

function hashString(value) {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
}

function getQuoteChangeHours(preferredHours) {
    if (!Number.isFinite(preferredHours)) {
        return 24;
    }

    const normalizedHours = Math.trunc(preferredHours);

    if (normalizedHours < 1) {
        return 1;
    }

    if (normalizedHours > 168) {
        return 168;
    }

    return normalizedHours;
}

export function getCurrentQuoteForUser(userId, preferredHours) {
    const quoteChangeHours = getQuoteChangeHours(preferredHours);
    const rotationWindowMs = quoteChangeHours * 60 * 60 * 1000;
    const now = Date.now();
    const timeBucket = Math.floor(now / rotationWindowMs);
    const hashedUserSeed = hashString(String(userId));
    const quoteIndex = (hashedUserSeed + timeBucket) % quoteLibrary.length;
    const quote = quoteLibrary[quoteIndex];
    const nextChangeAt = new Date((timeBucket + 1) * rotationWindowMs);

    return {
        ...quote,
        quoteChangeHours,
        nextChangeAt: nextChangeAt.toISOString(),
    };
}

export function getAllQuotes() {
    return quoteLibrary;
}
