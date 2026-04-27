import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.API_URL ?? "",
    appUrl: process.env.APP_URL ?? "",
  });
}
