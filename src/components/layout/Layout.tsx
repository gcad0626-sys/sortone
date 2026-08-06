import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { Sidebar } from './Sidebar';

const AppContainer = styled.div`
  /* styles are managed by GlobalStyle (.app) but we use this as a semantic wrapper */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Screen = styled.main<{ $hasHeader: boolean; $hasTabBar: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  
  padding-top: ${({ $hasHeader, theme }) => ($hasHeader ? theme.layout.headerHeight : '0')};
  padding-bottom: ${({ $hasTabBar, theme }) => ($hasTabBar ? theme.layout.tabbarHeight : '0')};

  /* Hide scrollbar for webkit */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ScrollContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Route paths that should show the header and tabbar
  const showHeaderRoutes = ['/memo', '/ai', '/search', '/profile', '/archive', '/trash'];
  const showTabBarRoutes = ['/memo', '/ai', '/search', '/profile', '/add', '/detail', '/archive', '/trash'];

  // Check if current path starts with any of the routes above (for nested routes if any)
  const hasHeader = showHeaderRoutes.some(route => location.pathname.startsWith(route));
  const hasTabBar = showTabBarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <AppContainer className="app">
      {hasHeader && <Header onMenuClick={() => setIsSidebarOpen(true)} />}
      
      <Screen $hasHeader={hasHeader} $hasTabBar={hasTabBar}>
        <ScrollContent>
          <Outlet />
        </ScrollContent>
      </Screen>

      {hasTabBar && <TabBar />}
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </AppContainer>
  );
};
