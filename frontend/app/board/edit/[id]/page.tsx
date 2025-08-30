"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BoardForm } from '@components/BoardForm';
import { boardApi } from '@/lib/api';
import type { Board } from '@/types/board';

interface BoardEditPageProps {
  params: {
    id: string;
  };
}

export default function BoardEditPage({ params }: BoardEditPageProps) {
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const boardId = parseInt(params.id, 10);

  useEffect(() => {
    if (isNaN(boardId)) {
      setError('잘못된 게시글 ID입니다.');
      setLoading(false);
      return;
    }

    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    try {
      const data = await boardApi.getBoard(boardId);
      setBoard(data);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('게시글 로드 실패:', err);
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

  if (error || !board) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || '게시글을 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  return <BoardForm board={board} isEdit />;
}
