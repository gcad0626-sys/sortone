import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const TabBarContainer = styled.nav`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: ${({ theme }) => theme.layout.tabbarHeight};
  background-color: ${({ theme }) => theme.colors.white};
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-top: 1px solid #E9ECEF;
  border-radius: 0;
  box-shadow: 0 -4px 14px rgba(30, 60, 100, 0.06);
  z-index: 90;
`;

const TabItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #B7C0C9;
  text-decoration: none;
  padding: 8px 16px;
  transition: all 0.2s ease;

  img {
    width: 24px;
    height: 24px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  &.active {
    color: #5D9CE8;
    background-color: #F8EAF5;
    border-radius: 24px;
    padding: 8px 24px;
    
    img {
      opacity: 1;
    }
  }
`;

export const TabBar: React.FC = () => {
  return (
    <TabBarContainer>
      <TabItem to="/memo">
        <img src="/Book.png" alt="Memo" />
        Memo
      </TabItem>
      <TabItem to="/ai">
        <img src="/cat.png" alt="Ai" />
        Ai
      </TabItem>
      <TabItem to="/search">
        <img src="/Search.png" alt="Search" />
        Search
      </TabItem>
      <TabItem to="/profile">
        <img src="/Key.png" alt="Profile" />
        Profile
      </TabItem>
    </TabBarContainer>
  );
};
