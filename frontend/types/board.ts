export interface Category {
  id: number;
  name: string;
  description: string;
  boards?: Board[];
}

export interface Board {
  id: number;
  title: string;
  content: string;
  author: string;
  user: {
    id: number;
    username: string;
    name: string;
  };
  category: Category;
  isAdminPost: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardData {
  title: string;
  content: string;
  author: string;
  categoryId: number;
  isAdminPost?: boolean;
}

export interface UpdateBoardData {
  title?: string;
  content?: string;
  categoryId?: number;
  isAdminPost?: boolean;
}

export interface CreateCategoryData {
  name: string;
  description: string;
}
