"use client";

import { CloseIcon } from "@components/CloseIcon";
import { NoAgentNotification } from "@components/NoAgentNotification";
import TranscriptionView from "@components/TranscriptionView";
import { AuthForm } from "@components/AuthForm";
import { AgentConfigModal } from "@components/AgentConfigModal";
import { AgentLogsModal } from "@components/AgentLogsModal";
import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import type { ConnectionDetails } from "./api/connection-details/route";
import { useAuth } from "@/contexts/AuthContext";
import type { LoginData, RegisterData } from "@/types/auth";

export default function Page() {
  const [room] = useState(new Room());
  const { user, isAuthenticated, login, register, logout, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string>("");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isStartingAgent, setIsStartingAgent] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // 파일을 base64로 변환하는 함수
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleCleanupAgent = async () => {
    try {
      const response = await fetch("/api/cleanup-agent", {
        method: "POST",
      });
      const result = await response.json();
      
      if (result.success) {
        alert("Agent 프로세스가 정리되었습니다.");
      } else {
        alert("정리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error cleaning up agent:", error);
      alert("정리 중 오류가 발생했습니다.");
    }
  };

  const startAgentWithConfig = useCallback(async (config: { imagePath: string; prompt: string; voiceFile?: File }) => {
    if (!user) return;

    setIsStartingAgent(true);
    try {
      // 1. Start the agent with custom configuration
      const startAgentResponse = await fetch("/api/start-agent/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagePath: config.imagePath,
          prompt: config.prompt,
          userId: user.id,
          username: user.username,
          voiceFile: config.voiceFile ? await fileToBase64(config.voiceFile) : undefined,
        }),
      });

      if (!startAgentResponse.ok) {
        throw new Error("Failed to start agent");
      }

      // 2. Get connection details
      const url = new URL(
        process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
        window.location.origin
      );
      
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get connection details");
      }

      const connectionDetailsData: ConnectionDetails = await response.json();

      // 3. Connect to room
      await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
      await room.localParticipant.setMicrophoneEnabled(true);

      setIsConfigModalOpen(false);
    } catch (error) {
      console.error("Connection failed:", error);
      alert("연결에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsStartingAgent(false);
    }
  }, [room, user]);

  const onConnectButtonClicked = useCallback(() => {
    setIsConfigModalOpen(true);
  }, []);

  const handleLogin = async (data: LoginData) => {
    setAuthError("");
    const result = await login(data);
    if (!result.success) {
      setAuthError(result.message);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setAuthError("");
    const result = await register(data);
    if (!result.success) {
      setAuthError(result.message);
    }
  };

  const handleLogout = () => {
    logout();
    // 룸 연결이 있다면 해제
    if (room.state === "connected") {
      room.disconnect();
    }
  };

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">로딩 중...</p>
        </div>
      </main>
    );
    
  }

  // 인증되지 않은 경우 로그인/회원가입 폼 표시
  if (!isAuthenticated || !user) {
    return (
      <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
        <div className="w-full flex justify-center mb-8">
          <img src="assets/hedra_logo.svg" alt="Hedra Logo" className="h-16 w-auto" />
        </div>
        <AuthForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
          error={authError}
        />
      </main>
    );
  }

      // 인증된 사용자의 메인 화면
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img src="assets/hedra_logo.svg" alt="Hedra Logo" className="h-20 w-auto" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              안녕하세요, {user.username}님!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI 아바타와 대화하고 커뮤니티에 참여해보세요.
            </p>
            
            {/* AI 아바타 대화 섹션 */}
            <div className="bg-gray-900 rounded-lg p-8 mb-8" data-lk-theme="default">
              <RoomContext.Provider value={room}>
                <div className="lk-room-container max-w-[1024px] mx-auto">
                  <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} />
                </div>
              </RoomContext.Provider>
            </div>
            
            {/* 컨트롤 버튼들 */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={handleCleanupAgent}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Agent 정리
              </button>
              <button
                onClick={() => setIsLogsModalOpen(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📊 로그 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 기능 소개 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">게시판</h3>
              <p className="text-gray-600 mb-4">
                다른 사용자들과 소통하고 정보를 공유하세요.
              </p>
              <a
                href="/board"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                게시판 보기
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">매칭</h3>
              <p className="text-gray-600 mb-4">
                전문 상담사와 매칭되어 개인 맞춤 상담을 받아보세요.
              </p>
              <a
                href="/matching"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                매칭 서비스
              </a>
            </div>
          </div>

          {user.isAdmin && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">관리자</h3>
                <p className="text-gray-600 mb-4">
                  시스템 관리 및 통계 정보를 확인하세요.
                </p>
                <a
                  href="/admin"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  관리자 패널
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <AgentConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onStart={startAgentWithConfig}
        isLoading={isStartingAgent}
      />

      <AgentLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  );
}

function SimpleVoiceAssistant(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <>
      <AnimatePresence mode="wait">
        {agentState === "disconnected" ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="grid items-center justify-center h-full"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="uppercase px-4 py-2 bg-white text-black rounded-md"
              onClick={() => props.onConnectButtonClicked()}
            >
              Start a conversation
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex flex-col items-center gap-4 h-full"
          >
            <AgentVisualizer />
            <div className="flex-1 w-full">
              <TranscriptionView />
            </div>
            <div className="w-full">
              <ControlBar onConnectButtonClicked={props.onConnectButtonClicked} />
            </div>
            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AgentVisualizer() {
  const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();
  if (videoTrack) {
    return (
      <div className="h-[512px] w-[512px] rounded-lg overflow-hidden">
        <VideoTrack trackRef={videoTrack} />
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full">
      <BarVisualizer
        state={agentState}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="relative h-[60px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={() => props.onConnectButtonClicked()}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
