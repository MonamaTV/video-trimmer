import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import Ffmpeg from "fluent-ffmpeg";
import { saveFile, timeDifference, trimVideo } from "@/utils/helpers";
import { validateTime } from "@/utils/validations";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");
  const start = data.get("start");
  const end = data.get("end");

  if (!validateTime(start) && !validateTime(end)) {
    return NextResponse.json(
      { error: "Failed to validate the times" },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }
  //Saves the file in the uploads folder
  const filePath = await saveFile(file, "uploads");

  //Calculate the time diff
  const duration = timeDifference(start, end);

  try {
    //Using a promise to process the video
    const savedFile = await trimVideo(filePath, start, duration);

    const downloadFile = await fs.readFile(savedFile);
    return new Response(downloadFile, {
      headers: {
        "Content-Type": downloadFile.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${downloadFile.name}"`,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Video failed to process",
    });
  }
}
