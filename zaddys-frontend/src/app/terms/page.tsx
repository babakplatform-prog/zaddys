import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="app-frame min-h-screen px-5 pb-32 pt-16">
      <article className="mx-auto max-w-2xl space-y-7 text-sm leading-7 text-zaddys-gray">
        <Link href="/" className="text-xs font-bold uppercase tracking-[0.16em] text-zaddys-red">Back to ZADDYS</Link>
        <header><p className="section-label">Ordering made clear</p><h1 className="mt-2 text-3xl font-black text-zaddys-ink">Terms &amp; Conditions</h1><p className="mt-2">Last updated: August 23, 2026</p></header>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Orders and payment</h2><p>Orders are confirmed only after successful server-side payment verification. Prices, availability, delivery fees, and preparation times may change before an order is accepted.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Delivery</h2><p>You are responsible for providing accurate contact and delivery information. Delivery timing is an estimate and may change because of demand, weather, traffic, or events outside our control.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Cancellations and support</h2><p>Contact ZADDYS promptly through support if an order needs attention. Once preparation has started, cancellation or refund eligibility may be limited.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Account responsibility</h2><p>Keep your login and verification details private. You may delete your account from your profile. Orders already processed may remain in anonymized records.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Contact</h2><p>Questions about an order or these terms can be sent to <a className="font-semibold text-zaddys-red" href="mailto:orders@zaddys.ng">orders@zaddys.ng</a>.</p></section>
      </article>
    </main>
  );
}