"use client";

import { useState, useEffect } from 'react';
import { CategoryForm } from '@components/CategoryForm';
import { categoryApi } from '@/lib/api';
import type { Category } from '@/types/board';

interface CategoryEditPageProps {
  params: {
    id: string;
  };
}

export default function CategoryEditPage({ params }: CategoryEditPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const categoryId = parseInt(params.id, 10);

  useEffect(() => {
    if (isNaN(categoryId)) {
      setError('잘못된 카테고리 ID입니다.');
      setLoading(false);
      return;
    }

    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      const data = await categoryApi.getCategory(categoryId);
      setCategory(data);
    } catch (err) {
      setError('카테고리를 불러오는데 실패했습니다.');
      console.error('카테고리 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || '카테고리를 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  return <CategoryForm category={category} isEdit />;
}
