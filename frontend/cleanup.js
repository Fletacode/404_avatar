#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(__dirname, "..", "backend", "agent_worker.pid");

// 프로세스 정리 함수
function cleanupProcess(pid) {
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

// 정리 함수
function cleanup() {
  console.log('Cleaning up agent processes...');
  
  let cleanedUp = false;
  
  if (fs.existsSync(PID_FILE)) {
    try {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
      if (pid) {
        cleanupProcess(pid);
        fs.unlinkSync(PID_FILE);
        cleanedUp = true;
        console.log(`Cleaned up agent process with PID: ${pid}`);
      }
    } catch (error) {
      console.error('Error reading PID file:', error);
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
    
    if (!cleanedUp && error && error.code === 1) {
      console.log('No agent processes found to clean up');
    }
  });
}

// 신호 핸들러 등록
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, cleaning up...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, cleaning up...');
  cleanup();
  process.exit(0);
});

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  cleanup();
}
