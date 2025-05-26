import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get(`/ocCourses`);
  },
  get(id) {
    return apiClient.get(`/ocCourses/${id}`);
  },
  create(data) {
    return apiClient.post(`/ocCourses`, data);
  },
  update(id, data) {
    return apiClient.put(`/ocCourses/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/ocCourses/${id}`);
  },
}; 