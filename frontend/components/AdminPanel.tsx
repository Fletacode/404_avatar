"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { surveyApi, categoryApi } from '@/lib/api';
import type { SurveyStatistics, Category } from '@/types/survey';
import { useAuth } from '@/contexts/AuthContext';

export function AdminPanel() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!user?.isAdmin) {
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, categoriesData] = await Promise.all([
        surveyApi.getStatistics(),
        categoryApi.getCategories(),
      ]);
      setStatistics(statsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('관리자 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">관리자 패널</h1>
        <p className="mt-2 text-gray-600">시스템 관리 및 통계 정보</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/categories"
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          <h3 className="text-lg font-semibold">카테고리 관리</h3>
          <p className="text-sm opacity-90">게시판 카테고리 추가/수정/삭제</p>
        </Link>
        <Link
          href="/admin/surveys"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
        >
          <h3 className="text-lg font-semibold">설문조사 관리</h3>
          <p className="text-sm opacity-90">모든 설문조사 조회 및 관리</p>
        </Link>
        <Link
          href="/board/write"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
        >
          <h3 className="text-lg font-semibold">공지사항 작성</h3>
          <p className="text-sm opacity-90">관리자 공지사항 작성</p>
        </Link>
      </div>

      {/* 설문조사 통계 */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">설문조사 통계</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">총 응답 수</span>
                <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">고인과의 관계</span>
                <div className="mt-2 space-y-1">
                  {statistics.relationshipStats.map((stat, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{stat.relationship}</span>
                      <span className="font-medium">{stat.count}명</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">심리적 지원 수준</h2>
            <div className="space-y-2">
              {statistics.supportLevelStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{stat.supportLevel}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(stat.count / statistics.total) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 현황 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">카테고리 현황</h2>
          <Link
            href="/admin/categories/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
          >
            새 카테고리
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  게시글 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    카테고리가 없습니다.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {category.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {category.boards?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/categories/edit/${category.id}`}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        수정
                      </Link>
                      <button className="text-red-600 hover:text-red-800">
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
