import { NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const execAsync = promisify(exec);

// PID 파일 경로
const PID_FILE = path.join(process.cwd(), "..", "backend", "agent_worker.pid");

// ElevenLabs 보이스 클로닝 함수
async function createVoiceClone(audioFilePath: string): Promise<string | null> {
  try {
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      console.log("ELEVENLABS_API_KEY가 설정되지 않았습니다.");
      return null;
    }

    // ElevenLabs 클라이언트 초기화
    const elevenlabs = new ElevenLabsClient({
      apiKey: elevenLabsApiKey
    });

    // 음성 파일을 스트림으로 읽기
    const audioStream = fs.createReadStream(audioFilePath);

    // Instant Voice Clone 생성
    const voice = await elevenlabs.voices.ivc.create({
      name: `Voice_${Date.now()}`,
      description: '사용자 업로드 음성으로 생성된 보이스',
      files: [audioStream],
    });

    console.log('보이스 생성 성공:', voice);
    return voice.voiceId;
    
  } catch (error) {
    console.error('보이스 생성 중 오류:', error);
    return null;
  }
}

// 프로세스 정리 함수
function cleanupProcess(pid: number) {
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`Sent SIGTERM to process ${pid}`);
    
    // 3초 후에도 살아있으면 강제 종료
    setTimeout(() => {
      try {
        process.kill(pid, 'SIGKILL');
        console.log(`Sent SIGKILL to process ${pid}`);
      } catch (error) {
        // 프로세스가 이미 종료된 경우 무시
      }
    }, 3000);
  } catch (error) {
    console.log(`Process ${pid} already terminated`);
  }
}

// 기존 프로세스 정리
function cleanupExistingProcesses() {
  try {
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
      if (pid) {
        cleanupProcess(pid);
        fs.unlinkSync(PID_FILE);
      }
    }
  } catch (error) {
    console.error("Error cleaning up existing processes:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imagePath, prompt, userId, username, voiceFile } = body;

    if (!imagePath || !prompt || !userId || !username) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // 백엔드 디렉토리 경로
    const backendDir = path.join(process.cwd(), "..", "backend");
    const agentWorkerPath = path.join(backendDir, "agent_worker.py");
    const venvActivatePath = path.join(backendDir, "venv", "bin", "activate");

    // agent_worker.py 파일이 존재하는지 확인
    if (!fs.existsSync(agentWorkerPath)) {
      return new NextResponse("Agent worker not found", { status: 404 });
    }

    // 가상환경 activate 파일이 존재하는지 확인
    if (!fs.existsSync(venvActivatePath)) {
      return new NextResponse("Virtual environment not found", { status: 404 });
    }

    // 이미지 파일 존재 여부는 나중에 처리 (프리셋 vs 업로드 구분)

    // 기존 프로세스 정리
    cleanupExistingProcesses();
    
    console.log(`Starting new agent process...`);
    console.log(`Image path: ${imagePath}`);
    console.log(`Prompt: ${prompt}`);

    // 이미지 파일을 assets 디렉토리에 저장
    let finalImagePath = imagePath;
    
    if (imagePath.startsWith('data:')) {
      // 새로 업로드된 이미지인 경우 (base64)
      try {
        const imageBuffer = Buffer.from(imagePath.split(',')[1], 'base64');
        const imageFileName = `user_avatar_${Date.now()}.png`;
        const savedImagePath = path.join(backendDir, "assets", imageFileName);
        
        fs.writeFileSync(savedImagePath, imageBuffer);
        finalImagePath = imageFileName;
        
        console.log(`Image saved to: ${savedImagePath}`);
      } catch (error) {
        console.error('Error saving uploaded image:', error);
        return new NextResponse("Failed to save uploaded image", { status: 500 });
      }
    } else {
      // 프리셋 이미지인 경우, 파일이 존재하는지 확인
      const presetImagePath = path.join(backendDir, "assets", imagePath);
      if (!fs.existsSync(presetImagePath)) {
        return new NextResponse(`Preset image not found: ${imagePath}`, { status: 404 });
      }
      finalImagePath = imagePath;
    }
    
    // 음성 파일 처리 및 ElevenLabs 보이스 생성
    let voiceId = "WlTYZQsFnSwb5skDNdyT"; // 기본 voice_id
    
    // if (voiceFile && voiceFile.startsWith('data:audio/')) {
    //   try {
    //     console.log("음성 파일을 처리하고 ElevenLabs로 보이스를 생성합니다...");
        
    //     // base64 데이터를 파일로 저장
    //     const audioBuffer = Buffer.from(voiceFile.split(',')[1], 'base64');
    //     const audioFileName = `voice_${Date.now()}.mp3`;
    //     const audioFilePath = path.join(backendDir, "assets", audioFileName);
        
    //     fs.writeFileSync(audioFilePath, audioBuffer);
    //     console.log(`음성 파일 저장됨: ${audioFilePath}`);
        
    //     // ElevenLabs API로 보이스 생성
    //     const voiceIdResponse = await createVoiceClone(audioFilePath);
    //     if (voiceIdResponse) {
    //       voiceId = voiceIdResponse;
    //       console.log(`새로운 보이스 생성됨: ${voiceId}`);
    //     }
    //   } catch (error) {
    //     console.error('보이스 생성 실패:', error);
    //     console.log('기본 보이스를 사용합니다.');
    //   }
    // }
    
    // 설정을 텍스트 파일로 저장
    const configContent = `IMAGE_PATH=${finalImagePath}
PROMPT=${prompt}
USER_ID=${userId}
USERNAME=${username}
VOICE_ID=${voiceId}`;
    
    const configFilePath = path.join(backendDir, "assets", "agent_config.txt");
    fs.writeFileSync(configFilePath, configContent, 'utf8');
    console.log(`Configuration saved to: ${configFilePath}`);

    // spawn을 사용하여 프로세스 시작
    const child = spawn('/bin/bash', ['-c', `cd "${backendDir}" && source venv/bin/activate && python3 agent_worker.py start`], {
      detached: false, // 부모 프로세스와 연결 유지
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // PID 저장
    if (child.pid) {
      fs.writeFileSync(PID_FILE, child.pid.toString());
      console.log(`Agent process started with PID: ${child.pid}`);
    }

    // 출력 로그 처리
    child.stdout?.on('data', (data) => {
      console.log('=== AGENT STDOUT ===');
      console.log(data.toString());
    });

    child.stderr?.on('data', (data) => {
      console.log('=== AGENT STDERR ===');
      console.log(data.toString());
    });

    child.on('close', (code) => {
      console.log(`Agent process exited with code ${code}`);
      // PID 파일 정리
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
    });

    child.on('error', (error) => {
      console.error('Agent process error:', error);
      // PID 파일 정리
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Agent 시작 명령이 실행되었습니다." 
    });

  } catch (error) {
    console.error("Error in start-agent API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
