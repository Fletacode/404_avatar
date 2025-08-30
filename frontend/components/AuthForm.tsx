"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LoginData, RegisterData } from "@/types/auth";
import { RelationshipToDeceased, PsychologicalSupportLevel, RELATIONSHIP_LABELS, SUPPORT_LEVEL_LABELS } from "@/types/constants";

interface AuthFormProps {
  onLogin: (data: LoginData) => void;
  onRegister: (data: RegisterData) => void;
  isLoading?: boolean;
  error?: string;
}

export function AuthForm({ onLogin, onRegister, isLoading, error }: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // 설문조사 관련 필드들
    birthDate: "",
    relationshipToDeceased: "",
    relationshipDescription: "",
    psychologicalSupportLevel: "",
    meetingParticipationDesire: false,
    personalNotes: "",
    privacyAgreement: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginMode) {
      onLogin({
        email: formData.email,
        password: formData.password,
      });
    } else {
      onRegister({
        username: formData.username,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthDate: formData.birthDate,
        relationshipToDeceased: formData.relationshipToDeceased,
        relationshipDescription: formData.relationshipDescription,
        psychologicalSupportLevel: formData.psychologicalSupportLevel,
        meetingParticipationDesire: formData.meetingParticipationDesire,
        personalNotes: formData.personalNotes,
        privacyAgreement: formData.privacyAgreement,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      relationshipToDeceased: "",
      relationshipDescription: "",
      psychologicalSupportLevel: "",
      meetingParticipationDesire: false,
      personalNotes: "",
      privacyAgreement: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isLoginMode ? "로그인" : "회원가입"}
        </h2>
        <p className="text-gray-400">
          {isLoginMode ? "계정에 로그인하세요" : "새 계정을 만드세요"}
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-md mb-4"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginMode && (
          <>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                사용자명
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLoginMode}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="사용자명을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLoginMode}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="실명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300 mb-1">
                생년월일
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="relationshipToDeceased" className="block text-sm font-medium text-gray-300 mb-1">
                고인과의 관계
              </label>
              <select
                id="relationshipToDeceased"
                name="relationshipToDeceased"
                value={formData.relationshipToDeceased}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {formData.relationshipToDeceased === RelationshipToDeceased.OTHER && (
              <div>
                <label htmlFor="relationshipDescription" className="block text-sm font-medium text-gray-300 mb-1">
                  관계 설명
                </label>
                <input
                  type="text"
                  id="relationshipDescription"
                  name="relationshipDescription"
                  value={formData.relationshipDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="고인과의 관계를 자세히 설명해주세요"
                />
              </div>
            )}

            <div>
              <label htmlFor="psychologicalSupportLevel" className="block text-sm font-medium text-gray-300 mb-1">
                심리적 지원 필요도
              </label>
              <select
                id="psychologicalSupportLevel"
                name="psychologicalSupportLevel"
                value={formData.psychologicalSupportLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {Object.entries(SUPPORT_LEVEL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  name="meetingParticipationDesire"
                  checked={formData.meetingParticipationDesire}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                그룹 모임 참여를 희망합니다
              </label>
            </div>

            <div>
              <label htmlFor="personalNotes" className="block text-sm font-medium text-gray-300 mb-1">
                개인적인 메모 (선택사항)
              </label>
              <textarea
                id="personalNotes"
                name="personalNotes"
                value={formData.personalNotes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="추가로 전하고 싶은 말씀이나 특별한 상황이 있다면 적어주세요"
              />
            </div>

            <div>
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  name="privacyAgreement"
                  checked={formData.privacyAgreement}
                  onChange={handleInputChange}
                  required={!isLoginMode}
                  className="mr-2 rounded"
                />
                <span className="text-red-400">*</span> 개인정보 수집 및 이용에 동의합니다
              </label>
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {!isLoginMode && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required={!isLoginMode}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isLoading ? "처리 중..." : (isLoginMode ? "로그인" : "회원가입")}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={toggleMode}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
        >
          {isLoginMode ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>
    </motion.div>
  );
}
