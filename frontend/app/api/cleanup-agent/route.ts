import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

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

export async function POST() {
  try {
    let cleanedUp = false;
    
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
      if (pid) {
        cleanupProcess(pid);
        fs.unlinkSync(PID_FILE);
        cleanedUp = true;
        console.log(`Cleaned up agent process with PID: ${pid}`);
      }
    }

    // 추가로 이름으로 찾아서 정리
    const { exec } = require('child_process');
    exec('pkill -f "agent_worker.py"', (error, stdout, stderr) => {
      if (error && error.code !== 1) { // code 1은 프로세스를 찾지 못한 경우
        console.error('Error killing agent processes:', error);
      } else {
        console.log('All agent_worker.py processes terminated');
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: cleanedUp ? "Agent process cleaned up successfully" : "No agent process found to clean up"
    });

  } catch (error) {
    console.error("Error in cleanup-agent API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
