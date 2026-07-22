import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get("version") || "v2.0.2";
    
    const fileName = `DEVELOPMENT_NOTE_${version}.md`;
    if (!/^[a-zA-Z0-9_.-]+$/.test(fileName)) {
      return NextResponse.json({ error: "Invalid version format" }, { status: 400 });
    }
    
    let filePath = `/docs/${fileName}`;
    
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), `../docs/${fileName}`);
    }
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ content });
    } else {
      return NextResponse.json(
        { error: `${fileName} file not found at ${filePath}` },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Failed to read DEVELOPMENT_NOTE", error);
    return NextResponse.json(
      { error: "Failed to read file on server: " + error.message },
      { status: 500 }
    );
  }
}
