"use client";

import { useState, useEffect } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { matchingApi } from '../../../lib/api';
import type { Counselor, Matching } from '../../../types/matching';

export default function MatchingPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'my-matchings'>('recommended');
  const [recommendedCounselors, setRecommendedCounselors] = useState<Counselor[]>([]);
  const [allCounselors, setAllCounselors] = useState<Counselor[]>([]);
  const [myMatchings, setMyMatchings] = useState<Matching[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      switch (activeTab) {
        case 'recommended':
          const recommended = await matchingApi.getRecommendedCounselors();
          setRecommendedCounselors(recommended);
          break;
        case 'all':
          const all = await matchingApi.getAllCounselors();
          setAllCounselors(all);
          break;
        case 'my-matchings':
          const matchings = await matchingApi.getMyMatchings();
          setMyMatchings(matchings);
          break;
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMatching = async (counselorId: number) => {
    try {
      await matchingApi.createMatching({ counselorId });
      alert('매칭 요청이 성공적으로 전송되었습니다!');
      // 내 매칭 목록을 새로고침
      if (activeTab === 'my-matchings') {
        loadData();
      }
    } catch (err) {
      alert('매칭 요청에 실패했습니다.');
      console.error('Failed to create matching:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
            <p className="text-gray-600">매칭 서비스를 이용하려면 로그인해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  const getSpecialtyLabel = (specialty: string) => {
    const labels: Record<string, string> = {
      'GRIEF_COUNSELING': '애도상담',
      'FAMILY_THERAPY': '가족치료', 
      'TRAUMA_THERAPY': '트라우마치료',
      'GROUP_THERAPY': '집단상담',
      'CHILD_COUNSELING': '아동상담',
      'ELDERLY_COUNSELING': '노인상담'
    };
    return labels[specialty] || specialty;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'AVAILABLE': '상담가능',
      'BUSY': '상담중',
      'UNAVAILABLE': '상담불가'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      case 'UNAVAILABLE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCounselorCard = (counselor: Counselor) => (
    <div key={counselor.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{counselor.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{counselor.name}</h3>
              <p className="text-blue-600 font-medium">{getSpecialtyLabel(counselor.specialty)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(counselor.status)}`}>
                  {getStatusLabel(counselor.status)}
                </span>
                {counselor.matchScore && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                    매칭도 {counselor.matchScore}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-bold text-gray-900">{counselor.rating}</span>
              <span className="text-gray-500">({counselor.totalReviews})</span>
            </div>
            <p className="text-sm text-gray-500">{counselor.experienceYears}년 경력</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">{counselor.introduction}</p>

        {counselor.education && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">학력</h4>
            <p className="text-sm text-gray-600">{counselor.education}</p>
          </div>
        )}

        {counselor.experience && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">경력</h4>
            <p className="text-sm text-gray-600">{counselor.experience}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            오늘 상담: {counselor.currentClientsToday}/{counselor.maxClientsPerDay}
          </div>
          <button
            onClick={() => handleRequestMatching(counselor.id)}
            disabled={counselor.status !== 'AVAILABLE'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            매칭 요청
          </button>
        </div>
      </div>
    </div>
  );

  const renderMatchingCard = (matching: Matching) => (
    <div key={matching.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{matching.counselor?.name}</h3>
            <p className="text-blue-600 font-medium">{matching.counselor ? getSpecialtyLabel(matching.counselor.specialty) : ''}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
              {matching.status === 'PENDING' ? '대기중' : 
               matching.status === 'ACCEPTED' ? '승인됨' :
               matching.status === 'REJECTED' ? '거부됨' :
               matching.status === 'COMPLETED' ? '완료됨' : '취소됨'}
            </span>
            <p className="text-sm text-gray-500 mt-1">매칭도 {matching.matchScore}%</p>
          </div>
        </div>
        
        {matching.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">메모</h4>
            <p className="text-sm text-gray-600">{matching.notes}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          요청일: {new Date(matching.createdAt).toLocaleDateString('ko-KR')}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상담사 매칭</h1>
          <p className="text-gray-600">당신에게 맞는 전문 상담사를 찾아보세요.</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('recommended')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommended'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                추천 상담사
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                전체 상담사
              </button>
              <button
                onClick={() => setActiveTab('my-matchings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-matchings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                내 매칭 현황
              </button>
            </nav>
          </div>
        </div>

        {/* 컨텐츠 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'recommended' && recommendedCounselors.map(renderCounselorCard)}
            {activeTab === 'all' && allCounselors.map(renderCounselorCard)}
            {activeTab === 'my-matchings' && myMatchings.map(renderMatchingCard)}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && (
          <>
            {activeTab === 'recommended' && recommendedCounselors.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">추천 상담사가 없습니다</h3>
                <p className="text-gray-500">설문조사를 완료하면 맞춤 상담사를 추천받을 수 있습니다.</p>
              </div>
            )}
            {activeTab === 'all' && allCounselors.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 상담사가 없습니다</h3>
              </div>
            )}
            {activeTab === 'my-matchings' && myMatchings.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">매칭 요청이 없습니다</h3>
                <p className="text-gray-500">상담사에게 매칭 요청을 보내보세요.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
