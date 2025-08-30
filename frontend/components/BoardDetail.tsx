"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { boardApi } from '@/lib/api';
import type { Board } from '@/types/board';
import { useAuth } from '@/contexts/AuthContext';

interface BoardDetailProps {
  boardId: number;
}

export function BoardDetail({ boardId }: BoardDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const data = await boardApi.getBoard(boardId);
      setBoard(data);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('게시글 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!board || !user) return;
    
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      setDeleteLoading(true);
      await boardApi.deleteBoard(board.id);
      alert('게시글이 삭제되었습니다.');
      router.push('/board');
    } catch (err) {
      alert('게시글 삭제에 실패했습니다.');
      console.error('게시글 삭제 실패:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEditOrDelete = user && (
    user.id === board?.user.id.toString() || user.isAdmin
  );

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
        <div className="mt-4">
          <Link
            href="/board"
            className="text-blue-600 hover:text-blue-800"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/board"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>

      {/* 게시글 정보 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
              {board.isAdminPost && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                  공지
                </span>
              )}
            </div>
            {canEditOrDelete && (
              <div className="flex space-x-2">
                <Link
                  href={`/board/edit/${board.id}`}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>작성자: {board.author}</span>
              <span>카테고리: {board.category.name}</span>
              <span>조회수: {board.viewCount}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>작성일: {formatDate(board.createdAt)}</span>
              {board.createdAt !== board.updatedAt && (
                <span>수정일: {formatDate(board.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="px-6 py-8">
          <div 
            className="prose max-w-none text-gray-900 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: board.content.replace(/\n/g, '<br>') }}
          />
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="mt-6 flex justify-between">
        <Link
          href="/board"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          목록
        </Link>
        {user && (
          <Link
            href="/board/write"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            새 글 작성
          </Link>
        )}
      </div>
    </div>
  );
}
