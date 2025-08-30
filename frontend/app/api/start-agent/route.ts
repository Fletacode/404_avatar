import { NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

// PID 파일 경로
const PID_FILE = path.join(process.cwd(), "..", "backend", "agent_worker.pid");

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
    const { imagePath, prompt, userId, username } = body;

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

    // 이미지 파일의 절대 경로 구성 (assets 디렉토리에서 찾기)
    const absoluteImagePath = path.join(backendDir, "assets", imagePath);
    
    // 이미지 파일이 존재하는지 확인
    if (!fs.existsSync(absoluteImagePath)) {
      return new NextResponse(`Image file not found: ${imagePath}`, { status: 404 });
    }

    // 기존 프로세스 정리
    cleanupExistingProcesses();
    
    console.log(`Starting new agent process...`);
    console.log(`Image path: ${absoluteImagePath}`);
    console.log(`Prompt: ${prompt}`);

    // spawn을 사용하여 프로세스 시작
    const child = spawn('/bin/bash', ['-c', `cd "${backendDir}" && source venv/bin/activate && python3 agent_worker.py start`], {
      env: {
        ...process.env,
        AGENT_IMAGE_PATH: absoluteImagePath,
        AGENT_PROMPT: prompt,
        AGENT_USER_ID: userId,
        AGENT_USERNAME: username,
      },
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
