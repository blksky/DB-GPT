import { createContext, useState } from 'react';

export const LayoutContext = createContext(null);

export default function LayoutContextProvider({ children }) {
  const [layout, setLayout] = useState({
    header: false,
    sidebar: false,
    issues: false,
    toolbar: true,
  });

  return <LayoutContext.Provider value={{ layout, setLayout }}>{children}</LayoutContext.Provider>;
}
