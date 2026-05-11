/**
 * PriceTag — renders a price with "SAR" label.
 *
 * Usage:
 *   <PriceTag amount={149.99} />            → "149.99 SAR"
 *   <PriceTag amount={0} zeroLabel="FREE"/> → "FREE"
 */

export default function PriceTag({ amount, decimals = 2, zeroLabel }) {
    if (zeroLabel && Number(amount) === 0) {
        return <span>{zeroLabel}</span>;
    }

    return (
        <span style={{ display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap', gap: '0.25em' }}>
            {Number(amount).toFixed(decimals)}
            <span style={{ fontSize: '0.7em', fontWeight: 700, opacity: 0.85 }}>SAR</span>
        </span>
    );
}
