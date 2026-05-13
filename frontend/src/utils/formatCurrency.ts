export function formatCurrency(amount: number, currency = "PHP") {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0)
}
