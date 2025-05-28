import apiClient from "./services.js";

export default {
  uploadTranscript(file, transcriptId) {
    console.log('Uploading file for transcript:', transcriptId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("transcriptId", transcriptId);
    formData.append("filename", `transcript-${transcriptId}.pdf`);

    return apiClient.post("/transcript/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
      },
      transformRequest: [(data) => data],
    });
  },

  processOCR(transcriptId) {
    return apiClient.get(`/transcript/ocr/${transcriptId}`);
  }
}; 