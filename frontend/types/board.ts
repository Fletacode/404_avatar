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
  categoryId: number | string; // 문자열도 허용하여 백엔드에서 변환
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

export interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  boardId: number;
  user: {
    id: number;
    username: string;
    name: string;
  };
}

export interface CreateCommentData {
  content: string;
  author: string;
  boardId: number;
}
