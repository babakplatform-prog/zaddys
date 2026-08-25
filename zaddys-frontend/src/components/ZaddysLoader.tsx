import Image from "next/image";

export default function ZaddysLoader({ label = "Preparing your moment" }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-white text-zaddys-red" role="status" aria-live="polite">
      <div className="rounded-[2rem] border-2 border-zaddys-red bg-white p-4 shadow-[0_12px_35px_rgba(201,20,20,0.14)]">
        <Image src="/zaddys-logo.PNG" alt="Zaddy's Creamery and Grills" width={150} height={80} className="h-auto w-36 animate-pulse object-contain" priority />
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.16em]">{label}</span>
    </div>
  );
}
