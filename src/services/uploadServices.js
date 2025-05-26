import apiClient from "./services.js";

export default {
  uploadTranscript(file, transcriptId) {
    console.log('Uploading file for transcript:', transcriptId);
    const formData = new FormData();
    formData.append("transcriptId", transcriptId.toString());
    formData.append("file", file);
    formData.append("filename", `transcript-${transcriptId}.pdf`);

    return apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
      },
      transformRequest: [(data) => data],
    });
  },
}; 