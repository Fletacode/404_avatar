"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoryApi } from '@/lib/api';
import type { Category, CreateCategoryData } from '@/types/board';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryFormProps {
  category?: Category;
  isEdit?: boolean;
}

export function CategoryForm({ category, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: category?.name || '',
    description: category?.description || '',
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.isAdmin) return;
    
    if (!formData.name.trim()) {
      setError('카테고리 이름을 입력해주세요.');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('카테고리 설명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isEdit && category) {
        await categoryApi.updateCategory(category.id, formData);
        alert('카테고리가 수정되었습니다.');
      } else {
        await categoryApi.createCategory(formData);
        alert('카테고리가 생성되었습니다.');
      }
      
      router.push('/admin/categories');
    } catch (err) {
      console.error('카테고리 처리 실패:', err);
      setError(isEdit ? '카테고리 수정에 실패했습니다.' : '카테고리 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          관리자 권한이 필요합니다.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? '카테고리 수정' : '카테고리 생성'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 카테고리 이름 */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 이름 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="카테고리 이름을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 카테고리 설명 */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 설명 *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="카테고리에 대한 설명을 입력하세요"
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
            {loading ? (isEdit ? '수정 중...' : '생성 중...') : (isEdit ? '수정' : '생성')}
          </button>
        </div>
      </form>
    </div>
  );
}
