import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get(`/transcriptCourses`);
  },
  get(id) {
    return apiClient.get(`/transcriptCourses/${id}`);
  },
  create(data) {
    return apiClient.post(`/transcriptCourses`, data);
  },
  update(id, data) {
    return apiClient.put(`/transcriptCourses/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/transcriptCourses/${id}`);
  },
}; 