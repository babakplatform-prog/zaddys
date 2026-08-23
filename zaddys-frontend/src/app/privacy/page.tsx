import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="app-frame min-h-screen px-5 pb-32 pt-16">
      <article className="mx-auto max-w-2xl space-y-7 text-sm leading-7 text-zaddys-gray">
        <Link href="/" className="text-xs font-bold uppercase tracking-[0.16em] text-zaddys-red">Back to ZADDYS</Link>
        <header><p className="section-label">Customer care and trust</p><h1 className="mt-2 text-3xl font-black text-zaddys-ink">Privacy Policy</h1><p className="mt-2">Last updated: August 23, 2026</p></header>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Information we collect</h2><p>We collect your name, email address, phone number, delivery details, order history, and account activity needed to provide ZADDYS services.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">How we use it</h2><p>We use this information to process orders, verify accounts, send transactional messages, provide support, prevent fraud, and improve the customer experience. Paystack processes payment details; ZADDYS does not store full card numbers.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Cookies and local storage</h2><p>We use essential browser storage for authentication preferences, theme settings, and your cart. You can clear this storage from your browser, though some features may stop working.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Your rights</h2><p>You may request access, correction, or deletion of your account data by contacting support. Completed orders may be retained in anonymized form for accounting, fraud prevention, and legal obligations.</p></section>
        <section><h2 className="mb-2 text-lg font-bold text-zaddys-ink">Contact</h2><p>For privacy questions, contact us at <a className="font-semibold text-zaddys-red" href="mailto:orders@zaddys.ng">orders@zaddys.ng</a>.</p></section>
      </article>
    </main>
  );
}