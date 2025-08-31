"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MatchingPage() {
  const router = useRouter();

  useEffect(() => {
    // 기본적으로 상담사 매칭 페이지로 리다이렉트
    router.replace('/matching/counselor');
  }, [router]);

  return null;
}
