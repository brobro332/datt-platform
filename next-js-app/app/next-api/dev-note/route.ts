import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get("version") || "v2.0.1";
    
    let fileName = "DEVELOPMENT_NOTE_v2.0.1.md";
    if (version === "v1.0.0") {
      fileName = "DEVELOPMENT_NOTE_v1.0.0.md";
    } else if (version === "v2.0.0") {
      fileName = "DEVELOPMENT_NOTE_v2.0.0.md";
    } else if (version === "v2.0.1") {
      fileName = "DEVELOPMENT_NOTE_v2.0.1.md";
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
