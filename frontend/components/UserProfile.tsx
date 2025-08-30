"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { RelationshipToDeceased, PsychologicalSupportLevel, RELATIONSHIP_LABELS, SUPPORT_LEVEL_LABELS } from '@/types/constants';
import type { User } from '@/types/auth';

export function UserProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    setEditData(user);
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // TODO: API 호출로 사용자 정보 업데이트
      // await authApi.updateProfile(editData);
      
      setIsEditing(false);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(user || {});
    setIsEditing(false);
    setError('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '설정되지 않음';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내 정보</h1>
        <p className="text-gray-600">회원가입 시 입력한 정보를 확인하고 수정할 수 있습니다.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">개인 정보</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              수정
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">기본 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">사용자명</label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editData.username || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">이름</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">이메일</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">생년월일</label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthDate"
                  value={editData.birthDate || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formatDate(user.birthDate)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">가입일</label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          {/* 설문조사 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">가족 관련 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">고인과의 관계</label>
              {isEditing ? (
                <select
                  name="relationshipToDeceased"
                  value={editData.relationshipToDeceased || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">
                  {user.relationshipToDeceased ? RELATIONSHIP_LABELS[user.relationshipToDeceased as keyof typeof RELATIONSHIP_LABELS] : '설정되지 않음'}
                </p>
              )}
            </div>

            {(isEditing ? editData.relationshipToDeceased : user.relationshipToDeceased) === RelationshipToDeceased.OTHER && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">관계 설명</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="relationshipDescription"
                    value={editData.relationshipDescription || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.relationshipDescription || '설정되지 않음'}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">심리적 지원 필요도</label>
              {isEditing ? (
                <select
                  name="psychologicalSupportLevel"
                  value={editData.psychologicalSupportLevel || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {Object.entries(SUPPORT_LEVEL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">
                  {user.psychologicalSupportLevel ? SUPPORT_LEVEL_LABELS[user.psychologicalSupportLevel as keyof typeof SUPPORT_LEVEL_LABELS] : '설정되지 않음'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">그룹 모임 참여 희망</label>
              {isEditing ? (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="meetingParticipationDesire"
                    checked={editData.meetingParticipationDesire || false}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  참여를 희망합니다
                </label>
              ) : (
                <p className="text-gray-900">
                  {user.meetingParticipationDesire ? '희망함' : '희망하지 않음'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">개인 메모</label>
              {isEditing ? (
                <textarea
                  name="personalNotes"
                  value={editData.personalNotes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user.personalNotes || '작성된 메모가 없습니다'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">개인정보 이용 동의</label>
              <p className="text-gray-900">
                {user.privacyAgreement ? '동의함' : '동의하지 않음'}
              </p>
            </div>
          </div>
        </div>

        {/* 관리자 정보 */}
        {user.isAdmin && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-700 mb-2">관리자 권한</h3>
            <p className="text-blue-600 font-medium">이 계정은 관리자 권한을 가지고 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}