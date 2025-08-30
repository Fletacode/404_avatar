"use client";

import { useState, useEffect } from 'react';
import { SurveyForm } from '@components/SurveyForm';
import { surveyApi } from '@/lib/api';
import type { FamilySurvey } from '@/types/survey';

export default function SurveyEditPage() {
  const [survey, setSurvey] = useState<FamilySurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadSurvey();
  }, []);

  const loadSurvey = async () => {
    try {
      const data = await surveyApi.getMySurvey();
      setSurvey(data);
    } catch (err) {
      setError('설문조사를 불러오는데 실패했습니다.');
      console.error('설문조사 로드 실패:', err);
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

  if (error || !survey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || '설문조사를 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  return <SurveyForm survey={survey} isEdit />;
}
