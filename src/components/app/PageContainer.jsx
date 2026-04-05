export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`max-w-[1300px] mx-auto px-4 sm:px-6 py-6 ${className}`}>
      {children}
    </div>
  );
}