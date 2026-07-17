import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // next-js-app의 기준 디렉토리(process.cwd())에서 상위 디렉토리의 docs/DEVELOPMENT_NOTE.md 경로를 지정합니다.
    const filePath = path.join(process.cwd(), "../docs/DEVELOPMENT_NOTE.md");
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ content });
    } else {
      return NextResponse.json(
        { error: "DEVELOPMENT_NOTE.md file not found" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Failed to read DEVELOPMENT_NOTE.md", error);
    return NextResponse.json(
      { error: "Failed to read file on server: " + error.message },
      { status: 500 }
    );
  }
}
