export type Category = string;

export interface Memo {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: Category;
  isImportant: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  aiSummary: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  avatarInitials?: string;
  avatarBgColor?: string;
  membership: string;
  activeSince: string;
}

export interface Settings {
  aiAutoClassify: boolean;
}
