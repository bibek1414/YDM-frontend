import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface AdminPanelLayoutProps {
  children: React.ReactNode;
}

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
