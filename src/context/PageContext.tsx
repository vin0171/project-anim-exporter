import { createContext, h } from 'preact';
import { ReactNode } from 'preact/compat';
import { useState, useContext } from 'preact/hooks';

export type Page = 'action' | 'export' | 'export-godot-scene';

interface PageProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const PageContext = createContext<PageProps | null>(null);

export function PageProvider({ children }: { children: ReactNode}) {
  const [currentPage, setCurrentPage] = useState<Page>('action');

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) throw new Error("usePage must be used within a PageProvider");
  return context;
}