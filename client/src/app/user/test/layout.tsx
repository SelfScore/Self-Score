export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F9F8F6" }}>
      {children}
    </div>
  );
}
