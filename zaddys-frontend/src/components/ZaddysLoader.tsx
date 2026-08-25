import Image from "next/image";

export default function ZaddysLoader({ label = "Preparing your moment" }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 bg-white text-zaddys-red" role="status" aria-live="polite">
      <Image src="/zaddys-logo.jpg" alt="Zaddy's Creamery and Grills" width={150} height={80} className="h-auto w-36 animate-pulse object-contain" />
      <span className="text-xs font-bold uppercase tracking-[0.16em]">{label}</span>
    </div>
  );
}
