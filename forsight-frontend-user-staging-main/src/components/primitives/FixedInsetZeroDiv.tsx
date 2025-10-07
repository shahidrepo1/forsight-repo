function FixedInsetZeroDiv({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/70">
      {children}
    </div>
  );
}
export default FixedInsetZeroDiv;
