"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const [times, setTimes] = useState({
    start: "",
    end: "",
  });

  const handleInput = (event) => {
    const value = event.target.value;
    const name = event.target.name;

    setTimes({
      ...times,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    console.log(e.target.files);
    const url = URL.createObjectURL(e.target.files[0]);
    setVideoUrl(url);

    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target.disabled = true;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("start", times.start);
    formData.append("end", times.end);

    const response = await fetch("/trim", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      console.log("File upload failed");
    }
    e.target.disabled = false;
  };

  return (
    <div className="sm:w-1/3 w-full px-3 mx-auto flex flex-col ">
      <h1 className="my-5">Upload a file</h1>
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
          name="file"
          type="file"
          onChange={handleFileChange}
        />
        <div className="flex flex-col gap-x-3 mt-2">
          <input
            className="border text-sm border-slate-400 text-black p-3 outline-none"
            type="text"
            name="start"
            id="start"
            placeholder="HH:MM:SS"
            onChange={handleInput}
          />
          <input
            type="text"
            name="end"
            onChange={handleInput}
            id="end"
            placeholder="HH:MM:SS"
            className="text-sm border text-black p-3 my-2 outline-none border-slate-400"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white p-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Trim
        </button>
      </form>
    </div>
  );
}
