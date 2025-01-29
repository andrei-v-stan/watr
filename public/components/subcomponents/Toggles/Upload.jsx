import { useState, useRef } from 'react';

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

function TogglesUploadSection() {
  const [files, setFiles] = useState([]);
  const [uploadText, setUploadText] = useState("");
  const [etaText, setEtaText] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRefs = useRef({});

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatETA = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files || []);
    newFiles.forEach(file => {
      if (files.some(existingFile => existingFile.name === file.name)) {
        alert(`The file ${file.name} is already in the list.`);
      } else {
        setFiles(prev => [...prev, file]);
      }
    });
  };

  const removeFile = (fileName) => {
    const fileItem = fileRefs.current[fileName];
    if (!fileItem) return;

    fileItem.classList.add("disappearing");

    const { top, left, width, height } = fileItem.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const ripple = document.createElement("div");
    ripple.className = "boom-effect";
    ripple.style.left = `${centerX - 10}px`;
    ripple.style.top = `${centerY - 10}px`;
    document.body.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });

    setTimeout(() => {
      fileItem.classList.remove("disappearing");
      setFiles((prev) => prev.filter((file) => file.name !== fileName));
    }, 1000);
  };

  const uploadFiles = () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadText("");
    setEtaText("");

    const uploadNextFile = (index) => {
      if (index >= files.length) {
        setUploading(false);
        setUploadStatus("success");
        setUploadText("✔ All files uploaded successfully!");
        setTimeout(resetUploadState, 3000);
        return;
      }

      const file = files[index];
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      const startTime = Date.now();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          const uploadedSize = formatSize(event.loaded);
          const totalFormatted = formatSize(event.total);
          const elapsedTime = (Date.now() - startTime) / 1000;
          const speed = event.loaded / elapsedTime;
          const eta = (event.total - event.loaded) / speed;

          setUploadText(`File: ${index + 1}/${files.length} | ${percentComplete.toFixed(2)}% (${uploadedSize} / ${totalFormatted})`);
          setEtaText(`ETA: ${formatETA(eta)} | Speed: ${formatSize(speed)}/s`);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          uploadNextFile(index + 1);
        } else {
          setUploadStatus("error");
          setUploadText("✖ Error during upload.");
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        setUploadStatus("error");
        setUploadText("✖ Error during upload.");
        setUploading(false);
      };

      xhr.open("POST", `http://${HOST}:${PORT}/${API}/files/upload`);
      xhr.withCredentials = true;
      xhr.send(formData);
    };

    uploadNextFile(0);
  };

  const resetUploadState = () => {
    setFiles([]);
    setUploadText("");
    setEtaText("");
    setUploadStatus(null);
    setUploading(false);
  };


  return (
    <section id="toggles-upload-section">
      <h2>Upload Files</h2>
      <button onClick={() => document.getElementById('file-input').click()}>Choose Files</button>
      <input type="file" id="file-input" multiple onChange={handleFileChange} hidden></input>
      <div id="file-list">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="file-item" 
            ref={(el) => (fileRefs.current[file.name] = el)}
          >
            <span className="file-name" data-name={file.name} onClick={() => removeFile(file.name)}>
              <span className="remove-icon left">✖</span>
              {file.name}
              <span className="remove-icon right">✖</span>
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={uploadFiles}
        disabled={uploading}
        className={`upload-button ${uploadStatus === "success" ? "success" : uploadStatus === "error" ? "error" : ""}`}
      >
        {uploading ? <span className="loader"></span> : uploadStatus === "success" ? "✔" : "Submit"}
      </button>
      {uploadText && <div className="upload-text">{uploadText}</div>}
      {etaText && <div className="eta-text">{etaText}</div>}
    </section>
  );
}

export default TogglesUploadSection;
