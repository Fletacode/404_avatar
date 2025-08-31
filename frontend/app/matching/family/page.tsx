"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { matchingApi } from '../../../lib/api';
import type { FamilyGroup, Matching } from '../../../types/matching';

export default function FamilyMatchingPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'my-matchings'>('recommended');
  const [recommendedGroups, setRecommendedGroups] = useState<FamilyGroup[]>([]);
  const [allGroups, setAllGroups] = useState<FamilyGroup[]>([]);
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
          const recommended = await matchingApi.getRecommendedFamilyGroups();
          setRecommendedGroups(recommended);
          break;
        case 'all':
          const all = await matchingApi.getAllFamilyGroups();
          setAllGroups(all);
          break;
        case 'my-matchings':
          const matchings = await matchingApi.getMyFamilyMatchings();
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

  const handleJoinGroup = async (groupId: number) => {
    try {
      await matchingApi.createFamilyMatching({ familyGroupId: groupId });
      alert('유가족 모임 참가 요청이 성공적으로 전송되었습니다!');
      if (activeTab === 'my-matchings') {
        loadData();
      }
    } catch (err) {
      alert('참가 요청에 실패했습니다.');
      console.error('Failed to join group:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
            <p className="text-gray-600">유가족 매칭 서비스를 이용하려면 로그인해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  const getMeetingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ONLINE': '온라인',
      'OFFLINE': '오프라인',
      'HYBRID': '온/오프라인'
    };
    return labels[type] || type;
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'ONLINE': return 'bg-blue-100 text-blue-800';
      case 'OFFLINE': return 'bg-green-100 text-green-800';
      case 'HYBRID': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderGroupCard = (group: FamilyGroup) => (
    <div key={group.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
            <p className="text-gray-700 mb-3 leading-relaxed">{group.description}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getMeetingTypeColor(group.meetingType)}`}>
                {getMeetingTypeLabel(group.meetingType)}
              </span>
              {group.matchScore && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium">
                  매칭도 {group.matchScore}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{group.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>다음 모임: {new Date(group.nextMeetingDate).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>진행자: {group.leaderName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            참가자: {group.currentMembers}/{group.maxMembers}명
          </div>
          <button
            onClick={() => handleJoinGroup(group.id)}
            disabled={group.currentMembers >= group.maxMembers}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            참가 신청
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
            <h3 className="text-xl font-bold text-gray-900">{matching.familyGroup?.name}</h3>
            <p className="text-orange-600 font-medium">{matching.familyGroup?.location}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 text-sm rounded-full font-medium bg-orange-100 text-orange-800">
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
          신청일: {new Date(matching.createdAt).toLocaleDateString('ko-KR')}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">유가족 모임 매칭</h1>
          <p className="text-gray-600">비슷한 경험을 가진 유가족들과 함께하는 모임을 찾아보세요.</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('recommended')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommended'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                추천 모임
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                전체 모임
              </button>
              <button
                onClick={() => setActiveTab('my-matchings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-matchings'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                내 신청 현황
              </button>
            </nav>
          </div>
        </div>

        {/* 컨텐츠 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'recommended' && recommendedGroups.map(renderGroupCard)}
            {activeTab === 'all' && allGroups.map(renderGroupCard)}
            {activeTab === 'my-matchings' && myMatchings.map(renderMatchingCard)}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && (
          <>
            {activeTab === 'recommended' && recommendedGroups.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">추천 모임이 없습니다</h3>
                <p className="text-gray-500">설문조사를 완료하면 맞춤 유가족 모임을 추천받을 수 있습니다.</p>
              </div>
            )}
            {activeTab === 'all' && allGroups.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 모임이 없습니다</h3>
              </div>
            )}
            {activeTab === 'my-matchings' && myMatchings.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">참가 신청이 없습니다</h3>
                <p className="text-gray-500">유가족 모임에 참가 신청을 해보세요.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
