export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}

