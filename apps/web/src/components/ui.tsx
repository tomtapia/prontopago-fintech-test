import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

/** Minimal shadcn-style primitives (local, no heavy dep for MVP). */
export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border bg-white shadow-sm p-6">{children}</div>;
}
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-slate-900 px-4 py-2 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 ${props.className ?? ''}`}
    />
  );
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 ${props.className ?? ''}`}
    />
  );
});
export function Alert({ children }: { children: ReactNode }) {
  return <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{children}</div>;
}
