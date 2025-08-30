import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const backendDir = path.join(process.cwd(), "..", "backend");
    const logFilePath = path.join(backendDir, "agent_worker.log");

    if (!fs.existsSync(logFilePath)) {
      return NextResponse.json({ 
        success: false, 
        message: "Log file not found",
        logs: "No logs available yet. Agent may not have started."
      });
    }

    const logs = fs.readFileSync(logFilePath, "utf-8");
    
    return NextResponse.json({ 
      success: true, 
      logs: logs,
      lastModified: fs.statSync(logFilePath).mtime
    });

  } catch (error) {
    console.error("Error reading agent logs:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
