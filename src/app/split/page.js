"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
const Merge = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const url = URL.createObjectURL(e.target.files[0]);
    setVideoUrl(url);

    setFile(e.target.files[0]);
  };

  const [timestamps, setTimestamps] = useState([]);

  const handleAddTimeStamps = (e) => {
    e.preventDefault();
    setTimestamps((prevItems) => [
      ...prevItems,
      {
        id: uuidv4(),
        start,
        end,
      },
    ]);

    setEnd("");
    setStart("");
  };

  const handleRemoveTimestamps = (id) => {
    setTimestamps((prevItems) => {
      return prevItems.filter((item) => item.id !== id);
    });
  };

  const handleMergeVideo = async (e) => {
    e.target.disabled = true;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamps", JSON.stringify(timestamps));

    const response = await fetch("/api/split", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "trimmed-videos.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      console.log("File upload failed");
    }
    e.target.disabled = false;
  };

  const [videoUrl, setVideoUrl] = useState("");
  return (
    <div className="sm:w-1/3 w-full px-3 mx-auto flex flex-col ">
      <h1 className="my-5">Split video</h1>
      {!videoUrl && (
        <label
          htmlFor="file"
          className="bg-slate-600/30 border h-[240px] w-full flex justify-center items-center my-3 shadow"
        >
          <p>Click to select video</p>
        </label>
      )}
      {videoUrl && (
        <div className="w-full">
          <video
            id="video"
            name="video"
            className="w-full my-2"
            height="240"
            key={videoUrl}
            preload="metadata"
            controls
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <label
            htmlFor="file"
            className="bg-none underline text-xs` text-black border-none outline-none"
          >
            Click here to change video
          </label>{" "}
        </div>
      )}
      <form className="w-full">
        <input
          className=" w-full text-lg text-gray-900 border border-gray-300  cursor-pointer bg-white dark:text-gray-400 focus:outline-none  dark:placeholder-gray-400 hidden"
          id="file"
          accept="video/mp4, video/avi, video/mov"
          name="file"
          type="file"
          onChange={handleFileChange}
        />
        <div className="flex flex-row w-full space-x-1 my-1">
          <input
            className="border w-1/2 text-sm border-slate-400 text-black p-3 py-2 outline-none"
            type="text"
            name="start"
            id="start"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="HH:MM:SS"
          />
          <input
            type="text"
            name="end"
            id="end"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="HH:MM:SS"
            className="w-1/2 text-sm border text-black p-3 py-2  outline-none border-slate-400"
          />
          <button
            onClick={handleAddTimeStamps}
            className="bg-black text-white px-3"
          >
            +
          </button>
        </div>
        <div>
          <p className="text-xs">Click to remove:</p>
          <ul>
            {timestamps.map(({ start, end, id }, index) => (
              <li
                onClick={() => handleRemoveTimestamps(id)}
                className="block text-xs underline"
                key={index}
              >
                {++index}. {start} - {end}
              </li>
            ))}
          </ul>
        </div>
        <button
          className=" bg-black text-white p-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed absolute bottom-6 max-w-full"
          onClick={handleMergeVideo}
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Merge;
