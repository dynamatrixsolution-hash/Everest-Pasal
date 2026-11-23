// ==============================================================================
// EVEREST PASAL - CLIENT-SIDE ROUTER
// Path-based routing with browser history support, navigation hooks, and link components
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  query: URLSearchParams;
}

const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname || '/',
  navigate: () => {},
  query: new URLSearchParams(window.location.search),
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(window.location.pathname || '/');
  const [query, setQuery] = useState<URLSearchParams>(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
      setQuery(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    const [pathname, search] = to.split('?');
    setPath(pathname || '/');
    setQuery(new URLSearchParams(search || ''));
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ path, navigate, query }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  return useContext(RouterContext);
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, className, style, children, onClick, ...rest }) => {
  const { navigate } = useRouter();

  return (
    <a
      href={to}
      className={className}
      style={{ textDecoration: 'none', color: 'inherit', ...style }}
      onClick={(e) => {
        if (onClick) onClick(e);
        if (!e.defaultPrevented && !rest.target) {
          e.preventDefault();
          navigate(to);
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
};
