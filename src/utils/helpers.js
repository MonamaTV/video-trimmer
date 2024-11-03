import { randomUUID } from "crypto";
import Ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";

export const timeToSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

export const timeDifference = (startTime, endTime) => {
  let diffInSeconds = timeToSeconds(endTime) - timeToSeconds(startTime);

  if (diffInSeconds < 0) {
    diffInSeconds += 24 * 3600;
  }

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

export const createFolder = async (folderName) => {
  const uploadDir = path.join(process.cwd(), folderName);
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
};

export const saveFile = async (file, folder) => {
  try {
    const uploadDir = await createFolder(folder);
    const filePath = path.join(uploadDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    return filePath;
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const saveZip = async (file, folder) => {
  try {
    const uploadDir = await createFolder(folder);
    const filePath = path.join(uploadDir, "tadima.zip");

    // const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, file);
    return filePath;
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const trimVideo = (filePath, startTime, duration) => {
  const videoName = randomUUID() + ".mp4";
  return new Promise((resolve, reject) => {
    Ffmpeg(filePath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(videoName)
      .on("end", async () => {
        console.log("Done processing...");
        resolve(videoName);
      })
      .on("error", (err) => {
        reject(new Error(err));
      })
      .run();
  });
};
