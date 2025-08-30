"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { surveyApi } from '@/lib/api';
import type { FamilySurvey, RelationshipToDeceased, PsychologicalSupportLevel } from '@/types/survey';
import { useAuth } from '@/contexts/AuthContext';

export function SurveyDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const [survey, setSurvey] = useState<FamilySurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadSurvey();
  }, [user, router]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const data = await surveyApi.getMySurvey();
      setSurvey(data);
    } catch (err) {
      setError('설문조사를 불러오는데 실패했습니다.');
      console.error('설문조사 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!survey || !user) return;
    
    if (!confirm('정말로 설문조사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      setDeleteLoading(true);
      await surveyApi.deleteMySurvey();
      alert('설문조사가 삭제되었습니다.');
      router.push('/');
    } catch (err) {
      alert('설문조사 삭제에 실패했습니다.');
      console.error('설문조사 삭제 실패:', err);
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
    });
  };

  const getRelationshipText = (relationship: RelationshipToDeceased) => {
    const relationshipMap = {
      [RelationshipToDeceased.SPOUSE]: '배우자',
      [RelationshipToDeceased.CHILD]: '자녀',
      [RelationshipToDeceased.PARENT]: '부모',
      [RelationshipToDeceased.SIBLING]: '형제자매',
      [RelationshipToDeceased.OTHER]: '기타',
    };
    return relationshipMap[relationship];
  };

  const getSupportLevelText = (level: PsychologicalSupportLevel) => {
    const levelMap = {
      [PsychologicalSupportLevel.HIGH]: '높음 (전문적인 상담이 시급히 필요)',
      [PsychologicalSupportLevel.MEDIUM]: '보통 (정기적인 상담이 도움이 될 것 같음)',
      [PsychologicalSupportLevel.LOW]: '낮음 (가끔 누군가와 이야기하고 싶음)',
      [PsychologicalSupportLevel.NONE]: '없음 (현재 특별한 지원이 필요하지 않음)',
    };
    return levelMap[level];
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {error || '아직 설문조사를 작성하지 않으셨습니다.'}
          </div>
          <Link
            href="/survey/new"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            설문조사 작성하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">내 설문조사</h1>
          <div className="flex space-x-2">
            <Link
              href="/survey/edit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>

      {/* 설문조사 정보 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">설문조사 정보</h2>
            <div className="text-sm text-gray-500">
              <span>작성일: {formatDate(survey.createdAt)}</span>
              {survey.createdAt !== survey.updatedAt && (
                <span className="ml-4">수정일: {formatDate(survey.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">기본 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">생년월일</span>
                <p className="mt-1 text-gray-900">{formatDate(survey.birthDate)}</p>
              </div>
            </div>
          </div>

          {/* 관계 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">고인과의 관계</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">관계</span>
                <p className="mt-1 text-gray-900">
                  {getRelationshipText(survey.relationshipToDeceased)}
                  {survey.relationshipDescription && ` (${survey.relationshipDescription})`}
                </p>
              </div>
            </div>
          </div>

          {/* 심리적 지원 */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">심리적 지원</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">필요한 지원 수준</span>
                <p className="mt-1 text-gray-900">
                  {getSupportLevelText(survey.psychologicalSupportLevel)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">유가족 모임 참여 희망</span>
                <p className="mt-1 text-gray-900">
                  {survey.meetingParticipationDesire ? '예' : '아니오'}
                </p>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          {survey.personalNotes && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">추가 정보</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-900 whitespace-pre-wrap">{survey.personalNotes}</p>
              </div>
            </div>
          )}

          {/* 동의 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">동의 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">개인정보 처리 동의</span>
                <p className="mt-1 text-gray-900">
                  {survey.privacyAgreement ? '동의' : '미동의'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">설문조사 완료</span>
                <p className="mt-1 text-gray-900">
                  {survey.surveyCompleted ? '완료' : '미완료'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
