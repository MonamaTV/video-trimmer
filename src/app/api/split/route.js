import { NextResponse } from "next/server";
import { saveFile, saveZip, timeDifference, trimVideo } from "@/utils/helpers";
import JSZip from "jszip";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");
  const timestamps = JSON.parse(data.get("timestamps"));

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  //Saves the file in the uploads folder
  const filePath = await saveFile(file, "uploads");

  try {
    const promises = timestamps.map(({ start, end }) => {
      const duration = timeDifference(start, end);
      return trimVideo(filePath, start, duration);
    });
    //Using a promise to process the video
    const results = await Promise.allSettled(promises);
    const zip = new JSZip();
    // console.log(results.);
    for (const video of results) {
      const file = await fs.readFile(video.value);
      const fileName = path.basename(video.value); // Extract file name from path
      zip.file(fileName, file); // Add file to zip
    }
    const content = await zip.generateAsync({ type: "nodebuffer" });
    const saved = await saveZip(content, "zip");
    // Write the zip file to the specified location
    const downloadFile = await fs.readFile(saved);
    console.log(downloadFile);
    return new NextResponse(downloadFile, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=tadima.zip",
      },
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.json({
      message: "Video failed to process",
    });
  }
}
