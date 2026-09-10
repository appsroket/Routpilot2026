const TRADES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Landscaping",
  "Pest Control",
  "Appliance Repair",
  "Pool Service",
  "Garage Doors",
  "Handyman",
];

// Infinite CSS marquee. The track holds two copies of the list and shifts by
// -50%, so the loop is seamless; it pauses on hover and stops under reduced
// motion (see .rp-marquee* in globals.css).
export function TradesMarquee() {
  const items = [...TRADES, ...TRADES];
  return (
    <div className="rp-marquee overflow-hidden border-y border-border bg-card py-5">
      <div className="rp-marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((trade, i) => (
          <div key={`${trade}-${i}`} className="flex items-center gap-10">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {trade}
            </span>
            <span className="size-1.5 rounded-full bg-primary/60" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
