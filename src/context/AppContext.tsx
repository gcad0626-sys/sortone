import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Memo, User, Settings } from '../types';

const STORAGE_KEY = 'sortone_memos';
const SEARCH_STORAGE_KEY = 'sortone_recent_searches';
const USER_STORAGE_KEY = 'sortone_user';
const SETTINGS_STORAGE_KEY = 'sortone_settings';
const LOGIN_STORAGE_KEY = 'sortone_logged_in';

const INITIAL_USER: User = {
  name: '인영',
  email: 'user@sortone.ai',
  avatarUrl: '/default-avatar.png', // Fallback or placeholder
  avatarInitials: 'IY',
  avatarBgColor: '#A3C9F1',
  membership: 'Premium',
  activeSince: '2023.10.15'
};

const INITIAL_SETTINGS: Settings = {
  aiAutoClassify: true
};

const INITIAL_MEMOS: Memo[] = [
  {
    id: 'm1',
    title: '신규 프로젝트 마일스톤',
    content: '다음 분기 핵심 과제. 주간 회의 때 앱 익스피리언스 고도화 및 접근성 가이드라인 준비 최우선.',
    tags: ['업무', '우선순위'],
    category: '업무',
    isImportant: true,
    aiSummary: [
      '다음 분기 핵심 과제에 대한 회의를 정리했습니다.',
      '앱 익스피리언스 고도화가 최우선 과제로 설정되었습니다.',
      '접근성 가이드라인 준비가 지속적으로 필요합니다.'
    ],
    createdAt: '2023-10-24T09:00:00.000Z',
    updatedAt: '2023-10-24T09:00:00.000Z'
  },
  {
    id: 'm2',
    title: '주말 캠핑 체크리스트',
    content: '텐트, 침낭, 화로대, 식재료(고기, 야채, 소스), 랜턴, 장작...',
    tags: ['개인'],
    category: '개인',
    isImportant: false,
    aiSummary: [
      '캠핑에 필요한 장비와 식재료 목록을 정리했습니다.',
      '텐트, 침낭, 화로대 등 기본 장비가 포함되어 있습니다.',
      '조명을 위한 랜턴과 장작 목록이 추가되었습니다.'
    ],
    createdAt: '2023-10-25T09:00:00.000Z',
    updatedAt: '2023-10-25T09:00:00.000Z'
  }
];

interface AppContextType {
  memos: Memo[];
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemo: (id: string, updates: Partial<Memo>) => void;
  deleteMemo: (id: string) => void;
  user: User;
  updateUser: (updates: Partial<User>) => void;
  settings: Settings;
  toggleAiAutoClassify: () => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  deleteAccount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [memos, setMemos] = useState<Memo[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MEMOS;
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const raw = localStorage.getItem(SEARCH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_USER;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(LOGIN_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOGIN_STORAGE_KEY, String(isLoggedIn));
  }, [isLoggedIn]);

  const addMemo = (memoData: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMemo: Memo = {
      ...memoData,
      id: 'm' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMemos(prev => [newMemo, ...prev]);
  };

  const updateMemo = (id: string, updates: Partial<Memo>) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
  };

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const toggleAiAutoClassify = () => {
    setSettings(prev => ({ ...prev, aiAutoClassify: !prev.aiAutoClassify }));
  };

  const addRecentSearch = (term: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t !== term);
      return [term, ...filtered].slice(0, 5);
    });
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches(prev => prev.filter(t => t !== term));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);
  const deleteAccount = () => {
    localStorage.clear();
    setMemos(INITIAL_MEMOS);
    setUser(INITIAL_USER);
    setSettings(INITIAL_SETTINGS);
    setRecentSearches([]);
    setIsLoggedIn(false);
  };

  return (
    <AppContext.Provider value={{
      memos, addMemo, updateMemo, deleteMemo,
      user, updateUser, settings, toggleAiAutoClassify,
      recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches,
      isLoggedIn, login, logout, deleteAccount
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
