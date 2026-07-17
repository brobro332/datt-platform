import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    let filePath = "/docs/DEVELOPMENT_NOTE.md";
    
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), "../docs/DEVELOPMENT_NOTE.md");
    }
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ content });
    } else {
      return NextResponse.json(
        { error: `DEVELOPMENT_NOTE.md file not found at ${filePath}` },
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
