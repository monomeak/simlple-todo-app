import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.API_URL ?? "",
    apiVersion: process.env.API_VERSION ?? "v1",
    appUrl: process.env.APP_URL ?? "",
  });
}
