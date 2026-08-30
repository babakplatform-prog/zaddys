import Image from "next/image";

export default function ZaddysLoader() {
  return (
    <div className="flex min-h-[18rem] w-full items-center justify-center bg-white px-6 text-zaddys-red" role="status" aria-live="polite">
      <div className="rounded-[2rem] border-2 border-zaddys-red bg-white p-4 shadow-[0_12px_35px_rgba(201,20,20,0.14)]">
        <Image src="/zaddys-logo.PNG" alt="Zaddy's Creamery and Grills" width={150} height={80} className="h-auto w-36 animate-pulse object-contain" priority />
      </div>
    </div>
  );
}
