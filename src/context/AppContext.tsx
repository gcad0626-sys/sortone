import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import type { Memo, User, Settings } from '../types';

const INITIAL_CATEGORIES = ['전체', '업무', '개인', '아이디어', '우선순위'];

const today = new Date();
const formattedToday = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

const INITIAL_USER: User = {
  uid: '',
  name: '인영',
  email: 'user@sortone.ai',
  avatarUrl: '/default-avatar.png', // Fallback or placeholder
  avatarInitials: 'IY',
  avatarBgColor: '#A3C9F1',
  membership: 'Premium',
  activeSince: formattedToday,
  provider: 'email'
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
  categories: string[];
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getStorageKey = (uid: string, key: string) => `${uid || 'guest'}_${key}`;

  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem('sortone_user');
    return raw ? JSON.parse(raw) : INITIAL_USER;
  });

  const [memos, setMemos] = useState<Memo[]>(() => {
    const raw = localStorage.getItem(getStorageKey(user.uid, 'sortone_memos'));
    return raw ? JSON.parse(raw) : INITIAL_MEMOS;
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const raw = localStorage.getItem(getStorageKey(user.uid, 'sortone_recent_searches'));
    return raw ? JSON.parse(raw) : [];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const raw = localStorage.getItem(getStorageKey(user.uid, 'sortone_settings'));
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const raw = localStorage.getItem(getStorageKey(user.uid, 'sortone_categories'));
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      let currentUid = 'guest';
      if (firebaseUser) {
        setIsLoggedIn(true);
        currentUid = firebaseUser.uid;
        
        let provider: 'google' | 'kakao' | 'email' | undefined;
        const providerId = firebaseUser.providerData[0]?.providerId;
        if (providerId === 'google.com') provider = 'google';
        else if (providerId === 'password') provider = 'email';

        let parsedActiveSince: string | undefined;
        if (firebaseUser.metadata?.creationTime) {
          const d = new Date(firebaseUser.metadata.creationTime);
          parsedActiveSince = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
        }

        setUser(prev => {
          let finalActiveSince = parsedActiveSince || prev.activeSince;
          if (finalActiveSince === '2023.10.15') {
            const today = new Date();
            finalActiveSince = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
          }
          return {
            ...prev,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || prev.name,
            email: firebaseUser.email || prev.email,
            avatarUrl: prev.hasCustomAvatar ? prev.avatarUrl : (firebaseUser.photoURL || prev.avatarUrl),
            activeSince: finalActiveSince,
            ...(provider ? { provider } : {})
          };
        });
      } else {
        setIsLoggedIn(false);
        setUser(INITIAL_USER);
      }
      
      // Reload user data based on the current uid
      const loadData = (key: string, initial: any) => {
        const raw = localStorage.getItem(getStorageKey(currentUid, key));
        return raw ? JSON.parse(raw) : initial;
      };

      setMemos(loadData('sortone_memos', INITIAL_MEMOS));
      setRecentSearches(loadData('sortone_recent_searches', []));
      setSettings(loadData('sortone_settings', INITIAL_SETTINGS));
      setCategories(loadData('sortone_categories', INITIAL_CATEGORIES));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user.uid, 'sortone_memos'), JSON.stringify(memos));
  }, [memos, user.uid]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user.uid, 'sortone_recent_searches'), JSON.stringify(recentSearches));
  }, [recentSearches, user.uid]);

  useEffect(() => {
    localStorage.setItem('sortone_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user.uid, 'sortone_settings'), JSON.stringify(settings));
  }, [settings, user.uid]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user.uid, 'sortone_categories'), JSON.stringify(categories));
  }, [categories, user.uid]);

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

  const addCategory = (cat: string) => {
    if (!categories.includes(cat)) {
      setCategories(prev => [...prev, cat]);
    }
  };

  const removeCategory = (cat: string) => {
    if (cat !== '전체') {
      setCategories(prev => prev.filter(c => c !== cat));
    }
  };

  const login = () => { /* Firebase signInWithPopup handles login */ };
  const logout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const deleteAccount = async () => {
    try {
      const uid = user.uid;
      await signOut(auth);
      // Optional: Clean up user specific local storage here
      localStorage.removeItem(getStorageKey(uid, 'sortone_memos'));
      localStorage.removeItem(getStorageKey(uid, 'sortone_recent_searches'));
      localStorage.removeItem(getStorageKey(uid, 'sortone_settings'));
      localStorage.removeItem(getStorageKey(uid, 'sortone_categories'));
      
      setMemos(INITIAL_MEMOS);
      setUser(INITIAL_USER);
      setSettings(INITIAL_SETTINGS);
      setRecentSearches([]);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error deleting account/signing out:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      memos, addMemo, updateMemo, deleteMemo,
      user, updateUser, settings, toggleAiAutoClassify,
      recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches,
      isLoggedIn, login, logout, deleteAccount,
      categories, addCategory, removeCategory
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

