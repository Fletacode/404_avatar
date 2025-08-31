"use client";

import { useState, useRef } from "react";
import { CloseIcon } from "./CloseIcon";

interface AgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: { imagePath: string; prompt: string; voiceFile?: File }) => void;
  isLoading?: boolean;
}

export function AgentConfigModal({ isOpen, onClose, onStart, isLoading }: AgentConfigModalProps) {
  const [prompt, setPrompt] = useState("당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자와 자연스럽고 즐거운 대화를 나누세요.");
  const [imagePath, setImagePath] = useState("fred.png"); // 기본값으로 fred.png 설정
  const [selectedImageType, setSelectedImageType] = useState<"preset" | "upload">("preset");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 음성 파일 관련 상태
  const [selectedVoiceFile, setSelectedVoiceFile] = useState<File | null>(null);
  const [voiceFileRef] = useState(useRef<HTMLInputElement>(null));

  // 사전 정의된 아바타 이미지 목록
  const presetImages = [
    { name: "fred.png", displayName: "Fred" },
    { name: "mary.png", displayName: "Mary" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedImageType("upload");
      
      // 파일을 base64로 변환
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImagePath(result); // base64 데이터를 저장
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetImageSelect = (imageName: string) => {
    setSelectedImageType("preset");
    setImagePath(imageName); // 프리셋 이미지는 파일명만 전달
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePath || !prompt.trim()) {
      alert("이미지와 프롬프트를 모두 입력해주세요.");
      return;
    }
    onStart({ imagePath, prompt, voiceFile: selectedVoiceFile || undefined });
  };

  const handleReset = () => {
    setPrompt("당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자와 자연스럽고 즐거운 대화를 나누세요.");
    setImagePath("fred.png");
    setSelectedImageType("preset");
    setSelectedFile(null);
    setSelectedVoiceFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (voiceFileRef.current) {
      voiceFileRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">에이전트 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
                      {/* 이미지 선택 섹션 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                아바타 이미지
              </label>
              
              {/* 프리셋 이미지 선택 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">프리셋 이미지</h4>
                <div className="flex gap-2">
                  {presetImages.map((image) => (
                    <button
                      key={image.name}
                      type="button"
                      onClick={() => handlePresetImageSelect(image.name)}
                      className={`p-2 border-2 rounded-lg transition-colors ${
                        selectedImageType === "preset" && imagePath === image.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={isLoading}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{image.displayName}</div>
                        <div className="text-xs text-gray-500">{image.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            {/* 커스텀 이미지 업로드 */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">커스텀 이미지 업로드</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                {selectedImageType === "upload" && selectedFile ? (
                  <div className="space-y-2">
                    <div className="text-green-600 font-medium">
                      ✓ {selectedFile.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 underline"
                      disabled={isLoading}
                    >
                      다른 이미지 선택
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-gray-400">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      disabled={isLoading}
                    >
                      이미지 파일 선택
                    </button>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG 파일 지원</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 음성 파일 업로드 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              음성 파일 (MP3)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                ref={voiceFileRef}
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedVoiceFile(file);
                  }
                }}
                className="hidden"
                disabled={isLoading}
              />
              {selectedVoiceFile ? (
                <div className="space-y-2">
                  <div className="text-green-600 font-medium">
                    ✓ {selectedVoiceFile.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => voiceFileRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 underline"
                    disabled={isLoading}
                  >
                    다른 음성 파일 선택
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => voiceFileRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    disabled={isLoading}
                  >
                    MP3 음성 파일 선택
                  </button>
                  <p className="text-sm text-gray-500">MP3 파일을 업로드하면 ElevenLabs로 보이스를 생성합니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 프롬프트 입력 섹션 */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              에이전트 프롬프트
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="에이전트의 역할과 행동 방식을 설명해주세요..."
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-500">
              에이전트가 어떻게 행동해야 하는지 구체적으로 설명해주세요.
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              초기화
            </button>
            <div className="space-x-3">
              
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isLoading || !imagePath || !prompt.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>시작 중...</span>
                  </>
                ) : (
                  <span>대화 시작</span>
                )}
              </button>
              

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
