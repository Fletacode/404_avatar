"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { surveyApi } from '@/lib/api';
import { FamilySurvey, SubmitSurveyData, RelationshipToDeceased, PsychologicalSupportLevel } from '@/types/survey';
import { useAuth } from '@/contexts/AuthContext';

interface SurveyFormProps {
  survey?: FamilySurvey;
  isEdit?: boolean;
}

export function SurveyForm({ survey, isEdit = false }: SurveyFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<SubmitSurveyData>({
    birthDate: survey?.birthDate?.split('T')[0] || '',
    relationshipToDeceased: survey?.relationshipToDeceased || RelationshipToDeceased.OTHER,
    relationshipDescription: survey?.relationshipDescription || '',
    psychologicalSupportLevel: survey?.psychologicalSupportLevel || PsychologicalSupportLevel.NONE,
    meetingParticipationDesire: survey?.meetingParticipationDesire || false,
    personalNotes: survey?.personalNotes || '',
    privacyAgreement: survey?.privacyAgreement || false,
    surveyCompleted: true,
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.birthDate) {
      setError('생년월일을 입력해주세요.');
      return;
    }
    
    if (!formData.privacyAgreement) {
      setError('개인정보 처리 동의는 필수입니다.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isEdit) {
        await surveyApi.updateMySurvey(formData);
        alert('설문조사가 수정되었습니다.');
      } else {
        await surveyApi.submitSurvey(formData);
        alert('설문조사가 제출되었습니다.');
      }
      
      router.push('/survey/my');
    } catch (err) {
      console.error('설문조사 처리 실패:', err);
      setError(isEdit ? '설문조사 수정에 실패했습니다.' : '설문조사 제출에 실패했습니다.');
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
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? '설문조사 수정' : '유가족 설문조사'}
        </h1>
        <p className="mt-2 text-gray-600">
          더 나은 지원을 위해 몇 가지 질문에 답변해 주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 기본 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">기본 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                생년월일 *
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 관계 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">고인과의 관계</h2>
          
          <div className="mb-4">
            <label htmlFor="relationshipToDeceased" className="block text-sm font-medium text-gray-700 mb-2">
              고인과의 관계 *
            </label>
            <select
              id="relationshipToDeceased"
              name="relationshipToDeceased"
              value={formData.relationshipToDeceased}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={RelationshipToDeceased.SPOUSE}>배우자</option>
              <option value={RelationshipToDeceased.CHILD}>자녀</option>
              <option value={RelationshipToDeceased.PARENT}>부모</option>
              <option value={RelationshipToDeceased.SIBLING}>형제자매</option>
              <option value={RelationshipToDeceased.OTHER}>기타</option>
            </select>
          </div>

          {formData.relationshipToDeceased === RelationshipToDeceased.OTHER && (
            <div className="mb-4">
              <label htmlFor="relationshipDescription" className="block text-sm font-medium text-gray-700 mb-2">
                관계 설명
              </label>
              <input
                type="text"
                id="relationshipDescription"
                name="relationshipDescription"
                value={formData.relationshipDescription}
                onChange={handleInputChange}
                placeholder="고인과의 관계를 설명해 주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* 심리적 지원 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">심리적 지원</h2>
          
          <div className="mb-4">
            <label htmlFor="psychologicalSupportLevel" className="block text-sm font-medium text-gray-700 mb-2">
              현재 필요한 심리적 지원 수준 *
            </label>
            <select
              id="psychologicalSupportLevel"
              name="psychologicalSupportLevel"
              value={formData.psychologicalSupportLevel}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={PsychologicalSupportLevel.HIGH}>높음 (전문적인 상담이 시급히 필요)</option>
              <option value={PsychologicalSupportLevel.MEDIUM}>보통 (정기적인 상담이 도움이 될 것 같음)</option>
              <option value={PsychologicalSupportLevel.LOW}>낮음 (가끔 누군가와 이야기하고 싶음)</option>
              <option value={PsychologicalSupportLevel.NONE}>없음 (현재 특별한 지원이 필요하지 않음)</option>
            </select>
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="meetingParticipationDesire"
                name="meetingParticipationDesire"
                checked={formData.meetingParticipationDesire}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="meetingParticipationDesire" className="text-sm font-medium text-gray-700">
                유가족 모임 참여를 희망합니다
              </label>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">추가 정보</h2>
          
          <div className="mb-4">
            <label htmlFor="personalNotes" className="block text-sm font-medium text-gray-700 mb-2">
              기타 전달하고 싶은 말씀
            </label>
            <textarea
              id="personalNotes"
              name="personalNotes"
              value={formData.personalNotes}
              onChange={handleInputChange}
              rows={4}
              placeholder="추가로 전달하고 싶은 내용이 있다면 자유롭게 작성해 주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>
        </div>

        {/* 개인정보 동의 */}
        <div className="mb-8">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="privacyAgreement"
                name="privacyAgreement"
                checked={formData.privacyAgreement}
                onChange={handleInputChange}
                required
                className="mr-2 mt-1"
              />
              <label htmlFor="privacyAgreement" className="text-sm text-gray-700">
                <span className="font-medium">개인정보 처리 동의 (필수)</span>
                <br />
                본 설문조사에서 수집된 개인정보는 유가족 지원 서비스 제공 목적으로만 사용되며, 
                관련 법령에 따라 안전하게 관리됩니다. 개인정보 처리에 동의하시겠습니까?
              </label>
            </div>
          </div>
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
            {loading ? (isEdit ? '수정 중...' : '제출 중...') : (isEdit ? '수정' : '제출')}
          </button>
        </div>
      </form>
    </div>
  );
}
