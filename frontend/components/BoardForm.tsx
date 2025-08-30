"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { boardApi, categoryApi } from '@/lib/api';
import type { Board, Category, CreateBoardData, UpdateBoardData } from '@/types/board';
import { useAuth } from '@/contexts/AuthContext';

interface BoardFormProps {
  board?: Board; // 수정 시에만 전달
  isEdit?: boolean;
}

export function BoardForm({ board, isEdit = false }: BoardFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: board?.title || '',
    content: board?.content || '',
    categoryId: board?.category.id || 0,
    isAdminPost: board?.isAdminPost || false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadCategories();
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (!isEdit && data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (err) {
      console.error('카테고리 로드 실패:', err);
      setError('카테고리를 불러오는데 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    
    if (!formData.categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isEdit && board) {
        const updateData: UpdateBoardData = {
          title: formData.title,
          content: formData.content,
          categoryId: formData.categoryId,
          isAdminPost: user.isAdmin ? formData.isAdminPost : undefined,
        };
        await boardApi.updateBoard(board.id, updateData);
        alert('게시글이 수정되었습니다.');
        router.push(`/board/${board.id}`);
      } else {
        const createData: CreateBoardData = {
          title: formData.title,
          content: formData.content,
          author: user.username,
          categoryId: formData.categoryId,
          isAdminPost: user.isAdmin ? formData.isAdminPost : false,
        };
        const newBoard = await boardApi.createBoard(createData);
        alert('게시글이 작성되었습니다.');
        router.push(`/board/${newBoard.id}`);
      }
    } catch (err) {
      console.error('게시글 처리 실패:', err);
      setError(isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value,
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? '게시글 수정' : '게시글 작성'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 카테고리 선택 */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>카테고리를 선택하세요</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 관리자 게시글 옵션 */}
          {user.isAdmin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAdminPost"
                name="isAdminPost"
                checked={formData.isAdminPost}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="isAdminPost" className="text-sm font-medium text-gray-700">
                공지사항으로 등록
              </label>
            </div>
          )}
        </div>

        {/* 제목 */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="게시글 제목을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 내용 */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            내용 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={15}
            placeholder="게시글 내용을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (isEdit ? '수정 중...' : '작성 중...') : (isEdit ? '수정' : '작성')}
          </button>
        </div>
      </form>
    </div>
  );
}
