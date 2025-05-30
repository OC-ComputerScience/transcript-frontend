<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import TranscriptCourseServices from "../services/transcriptCourseServices";
import UniversityTranscriptServices from "../services/universityTranscriptServices";
import UniversityCourseServices from "../services/universityCourseServices";
import OCCourseServices from "../services/ocCourseServices";
import SemesterServices from "../services/semesterServices";
import UploadServices from "../services/transcriptServices";

const route = useRoute();
const transcriptId = computed(() => route.params.id);
const dialog = ref(false);
const loading = ref(false);
const transcriptCourses = ref([]);
const universityTranscripts = ref([]);
const universityCourses = ref([]);
const ocCourses = ref([]);
const semesters = ref([]);
const currentTranscript = ref(null);
const statusOptions = ["UnMatched", "Matched", "Approved"];
const editedIndex = ref(-1);
const editedItem = ref({
  universityTranscriptId: null,
  courseNumber: "",
  courseDescription: "",
  courseHours: 0,
  universityCourseId: null,
  OCCourseId: null,
  semesterId: null,
  status: "UnMatched",
  grade: "",
});
const defaultItem = {
  universityTranscriptId: null,
  courseNumber: "",
  courseDescription: "",
  courseHours: 0,
  universityCourseId: null,
  OCCourseId: null,
  semesterId: null,
  status: "Pending",
  grade: "",
};

const ocrDialog = ref(false);
const ocrResults = ref(null);
const ocrLoading = ref(false);

const headers = [
  {
    title: "Transcript",
    key: "universityTranscript.OCIdNumber",
    width: "100px",
  },
  { title: "Course Number", key: "courseNumber", width: "100px" },
  { title: "Course Description", key: "courseDescription", width: "200px" },
  { title: "Course Hours", key: "courseHours", width: "80px" },
  {
    title: "University Course",
    key: "universityCourse.courseName",
    width: "150px",
  },
  { title: "OC Course Number", key: "ocCourse.courseNumber", width: "100px" },
  { title: "OC Course", key: "ocCourse.courseName", width: "150px" },
  { title: "Semester", key: "semester.name", width: "100px" },
  { title: "Grade", key: "grade", width: "80px" },
  { title: "Status", key: "status", width: "100px" },
  { title: "Status Changed Date", key: "statusChangedDate", width: "150px" },
  { title: "Actions", key: "actions", sortable: false, width: "120px" },
];

const formTitle = computed(() => {
  return editedIndex.value === -1
    ? "New Transcript Course"
    : "Edit Transcript Course";
});

const initialize = () => {
  loading.value = true;

  // Get the current transcript
  UniversityTranscriptServices.get(transcriptId.value)
    .then((response) => {
      currentTranscript.value = response.data;
      editedItem.value.universityTranscriptId = currentTranscript.value.id;
    })
    .catch((error) => {
      console.error("Error fetching transcript:", error);
    });

  // Get transcript courses for this transcript
  TranscriptCourseServices.getAll()
    .then((response) => {
      transcriptCourses.value = response.data.filter(
        (course) =>
          course.universityTranscriptId === parseInt(transcriptId.value)
      );
    })
    .catch((error) => {
      console.error("Error fetching transcript courses:", error);
    });

  UniversityCourseServices.getAll()
    .then((response) => {
      universityCourses.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching university courses:", error);
    });

  OCCourseServices.getAll()
    .then((response) => {
      ocCourses.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching OC courses:", error);
    });

  SemesterServices.getAll()
    .then((response) => {
      semesters.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching semesters:", error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const editItem = (item) => {
  editedIndex.value = transcriptCourses.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteItem = (item) => {
  const index = transcriptCourses.value.indexOf(item);
  if (confirm("Are you sure you want to delete this transcript course?")) {
    TranscriptCourseServices.delete(item.id)
      .then((response) => {
        transcriptCourses.value.splice(index, 1);
      })
      .catch((error) => {
        console.error("Error deleting transcript course:", error);
      });
  }
};

const close = () => {
  dialog.value = false;
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
};

const save = () => {
  if (editedIndex.value > -1) {
    // Update
    const updateData = { ...editedItem.value };
    // If status has changed, update the statusChangedDate
    if (
      transcriptCourses.value[editedIndex.value].status !==
      editedItem.value.status
    ) {
      updateData.statusChangedDate = new Date().toISOString();
    }

    TranscriptCourseServices.update(editedItem.value.id, updateData)
      .then((response) => {
        // Find the related data
        const universityTranscript = currentTranscript.value;
        const universityCourse = universityCourses.value.find(
          (c) => c.id === editedItem.value.universityCourseId
        );
        const ocCourse = ocCourses.value.find(
          (c) => c.id === editedItem.value.OCCourseId
        );
        const semester = semesters.value.find(
          (s) => s.id === editedItem.value.semesterId
        );
        // Create a new object with the related data
        const updatedItem = {
          ...response.data,
          universityTranscript: universityTranscript,
          universityCourse: universityCourse,
          ocCourse: ocCourse,
          semester: semester,
        };
        Object.assign(transcriptCourses.value[editedIndex.value], updatedItem);
        close();
      })
      .catch((error) => {
        console.error("Error updating transcript course:", error);
      });
  } else {
    // Create
    const createData = { ...editedItem.value };
    // Set initial statusChangedDate for new items
    createData.statusChangedDate = new Date().toISOString();

    TranscriptCourseServices.create(createData)
      .then((response) => {
        // Find the related data
        const universityTranscript = currentTranscript.value;
        const universityCourse = universityCourses.value.find(
          (c) => c.id === editedItem.value.universityCourseId
        );
        const ocCourse = ocCourses.value.find(
          (c) => c.id === editedItem.value.OCCourseId
        );
        const semester = semesters.value.find(
          (s) => s.id === editedItem.value.semesterId
        );
        // Create a new object with the related data
        const newItem = {
          ...response.data,
          universityTranscript: universityTranscript,
          universityCourse: universityCourse,
          ocCourse: ocCourse,
          semester: semester,
        };
        transcriptCourses.value.push(newItem);
        close();
      })
      .catch((error) => {
        console.error("Error creating transcript course:", error);
      });
  }
};

const openDialog = () => {
  editedItem.value = Object.assign({}, defaultItem);
  editedItem.value.universityTranscriptId = parseInt(transcriptId.value);
  editedIndex.value = -1;
  dialog.value = true;
};

const matchCourses = async () => {
  try {
    loading.value = true;
    const transcriptId = route.params.id;
    console.log("Matching courses for transcript:", transcriptId);

    // Get all transcript courses for this transcript
    const transcriptCoursesResponse = await TranscriptCourseServices.getAll();
    const currentTranscriptCourses = transcriptCoursesResponse.data.filter(
      (course) => course.universityTranscriptId === parseInt(transcriptId)
    );
    console.log("Current transcript courses:", currentTranscriptCourses);

    // Get all university courses
    const universityCoursesResponse = await UniversityCourseServices.getAll();
    const universityCourses = universityCoursesResponse.data;
    console.log("University courses:", universityCourses);

    // Get all OC courses
    const ocCoursesResponse = await OCCourseServices.getAll();
    const ocCourses = ocCoursesResponse.data;
    console.log("OC courses:", ocCourses);

    // Process each transcript course
    for (const transcriptCourse of currentTranscriptCourses) {
      console.log("\nProcessing course:", transcriptCourse.courseNumber);

      // Find matching university course by course number
      const matchingUniversityCourse = findMatchingUniversityCourse(
        transcriptCourse.courseNumber
      );
      console.log("Matching university course:", matchingUniversityCourse);

      if (matchingUniversityCourse) {
        // Find the OC course from the university course
        const ocCourse = ocCourses.find(
          (oc) => oc.id === matchingUniversityCourse.OCCourseId
        );
        console.log("Matching OC course:", ocCourse);

        if (ocCourse) {
          try {
            // Create update data with only the necessary fields
            const updateData = {
              universityTranscriptId: transcriptCourse.universityTranscriptId,
              courseNumber: transcriptCourse.courseNumber,
              courseDescription: transcriptCourse.courseDescription,
              courseHours: transcriptCourse.courseHours,
              universityCourseId: matchingUniversityCourse.id, // Use the matched university course ID
              OCCourseId: ocCourse.id,
              semesterId: transcriptCourse.semesterId,
              grade: transcriptCourse.grade,
              status: "Matched",
              statusChangedDate: new Date().toISOString(),
            };
            console.log("Updating with data:", updateData);

            const response = await TranscriptCourseServices.update(
              transcriptCourse.id,
              updateData
            );
            console.log("Update response:", response);

            if (response && response.data) {
              // Create the updated item with all necessary relations
              const updatedItem = {
                ...response.data,
                ocCourse: ocCourse,
                universityCourse: matchingUniversityCourse,
                universityTranscript: currentTranscript.value,
              };
              console.log("Created updated item:", updatedItem);

              // Update the local transcript courses array
              const index = transcriptCourses.value.findIndex(
                (tc) => tc.id === transcriptCourse.id
              );
              if (index !== -1) {
                console.log("Updating index:", index);
                transcriptCourses.value[index] = updatedItem;
                console.log(
                  "Updated local array:",
                  transcriptCourses.value[index]
                );
              } else {
                console.log(
                  "Could not find index for course:",
                  transcriptCourse.id
                );
              }
            } else {
              console.error("Invalid response from update:", response);
            }
          } catch (updateError) {
            console.error("Error updating course:", updateError);
          }
        } else {
          console.log(
            "No matching OC course found for university course:",
            matchingUniversityCourse
          );
        }
      } else {
        console.log(
          "No matching university course found for:",
          transcriptCourse.courseNumber
        );
      }
    }

    // Force a refresh of the data
    await initialize();

    // Show success message
    alert("Courses matched successfully!");
  } catch (error) {
    console.error("Error matching courses:", error);
    alert("Error matching courses. Please try again.");
  } finally {
    loading.value = false;
  }
};

const approveItem = async (item) => {
  try {
    const updateData = {
      universityTranscriptId: item.universityTranscriptId,
      courseNumber: item.courseNumber,
      courseDescription: item.courseDescription,
      courseHours: item.courseHours,
      universityCourseId: item.universityCourseId,
      OCCourseId: item.OCCourseId,
      semesterId: item.semesterId,
      grade: item.grade,
      status: "Approved",
      statusChangedDate: new Date().toISOString(),
    };

    const response = await TranscriptCourseServices.update(item.id, updateData);
    if (response && response.data) {
      const index = transcriptCourses.value.findIndex(
        (tc) => tc.id === item.id
      );
      if (index !== -1) {
        transcriptCourses.value[index] = {
          ...response.data,
          ocCourse: item.ocCourse,
          universityCourse: item.universityCourse,
          universityTranscript: item.universityTranscript,
          semester: item.semester,
        };
      }
    }
  } catch (error) {
    console.error("Error approving course:", error);
    alert("Error approving course. Please try again.");
  }
};

const processOCR = async () => {
  if (!currentTranscript.value) return;

  ocrLoading.value = true;
  try {
    const response = await UploadServices.processOCR(
      currentTranscript.value.id
    );
    ocrResults.value = response.data;
    ocrDialog.value = true;
  } catch (error) {
    console.error("Error processing OCR:", error);
    alert("Error processing OCR. Please try again.");
  } finally {
    ocrLoading.value = false;
  }
};

const findClosestSemester = (courseSemester) => {
  if (!courseSemester || !semesters.value.length) return null;

  // Try both formats: "FALL 1983" and "1983 FALL"
  let term, year;
  const parts = courseSemester.split(" ");

  if (parts.length === 2) {
    // Check if first part is a year (4 digits)
    if (/^\d{4}$/.test(parts[0])) {
      // Format: "1983 FALL"
      [year, term] = parts;
    } else {
      // Format: "FALL 1983"
      [term, year] = parts;
    }
  } else {
    return null;
  }

  if (!year || !term) return null;

  // Find semesters that match the year
  const matchingYearSemesters = semesters.value.filter((s) =>
    s.name.includes(year)
  );
  if (!matchingYearSemesters.length) return null;

  // Map full terms to their abbreviations
  const termMap = {
    FALL: "FA",
    SPRING: "SP",
    SUMMER: "SU",
    WINTER: "WI",
  };

  // Convert term to uppercase for comparison
  const upperTerm = term.toUpperCase();

  // Find the semester that matches both year and term (including abbreviations)
  const exactMatch = matchingYearSemesters.find((s) => {
    const semesterName = s.name.toUpperCase();
    // Check for both full term and abbreviated term
    return (
      semesterName.includes(upperTerm) ||
      (termMap[upperTerm] && semesterName.includes(termMap[upperTerm]))
    );
  });

  if (exactMatch) return exactMatch;

  // If no exact match, return the first semester from the matching year
  return matchingYearSemesters[0];
};

const findMatchingUniversityCourse = (courseNumber) => {
  if (!courseNumber || !universityCourses.value.length) return null;

  // Normalize the input course number by removing spaces, hyphens, and converting to uppercase
  const normalizeCourseNumber = (num) => {
    return num.replace(/[\s-]/g, "").toUpperCase();
  };

  const normalizedInput = normalizeCourseNumber(courseNumber);

  // Try to find an exact match first
  const exactMatch = universityCourses.value.find(
    (uc) => normalizeCourseNumber(uc.courseNumber) === normalizedInput
  );
  if (exactMatch) return exactMatch;

  // If no exact match, try to find a partial match
  return universityCourses.value.find(
    (uc) =>
      normalizeCourseNumber(uc.courseNumber).includes(normalizedInput) ||
      normalizedInput.includes(normalizeCourseNumber(uc.courseNumber))
  );
};

const addOcrCourses = async () => {
  if (!ocrResults.value || !currentTranscript.value) return;

  loading.value = true;
  try {
    for (const course of ocrResults.value.courses) {
      // Find the closest matching semester
      const matchingSemester = findClosestSemester(course.semester);

      // Find matching university course
      const matchingUniversityCourse = findMatchingUniversityCourse(
        course.courseNumber
      );

      const courseData = {
        universityTranscriptId: currentTranscript.value.id,
        courseNumber: course.courseNumber,
        courseDescription: course.courseName,
        courseHours: course.hours,
        semesterId: matchingSemester?.id || null,
        universityCourseId: matchingUniversityCourse?.id || null,
        grade: course.grade,
        status: "UnMatched",
        statusChangedDate: new Date().toISOString(),
      };

      await TranscriptCourseServices.create(courseData);
    }

    // Refresh the course list
    await initialize();
    ocrDialog.value = false;
  } catch (error) {
    console.error("Error adding OCR courses:", error);
    alert("Error adding courses. Please try again.");
  } finally {
    loading.value = false;
  }
};

const calculateTotalHours = (courses) => {
  return courses.reduce(
    (total, course) => total + (parseFloat(course.hours) || 0),
    0
  );
};

const calculateGPA = (courses) => {
  const gradePoints = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
    P: 0.0,
  };

  let totalPoints = 0;
  let totalHours = 0;

  courses.forEach((course) => {
    const hours = parseFloat(course.hours) || 0;
    const grade = course.grade.toUpperCase();
    const points = gradePoints[grade] || 0;

    totalPoints += points * hours;
    totalHours += hours;
  });

  return totalHours > 0 ? totalPoints / totalHours : 0;
};

onMounted(() => {
  initialize();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Transcript Courses</h1>
        <div v-if="currentTranscript" class="mb-4">
          <h2>Transcript: {{ currentTranscript.OCIdNumber }}</h2>
          <p>University: {{ currentTranscript.university?.name }}</p>
        </div>
        <div class="d-flex align-center">
          <v-btn color="primary" @click="openDialog()" class="mr-2">
            Add Transcript Course
          </v-btn>
          <v-btn
            color="secondary"
            @click="matchCourses"
            :loading="loading"
            class="mr-2"
          >
            Match with OC Courses
          </v-btn>
          <v-btn
            color="info"
            @click="processOCR"
            :loading="ocrLoading"
            :disabled="!currentTranscript"
          >
            <v-icon left>mdi-text-recognition</v-icon>
            Process OCR
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="transcriptCourses"
          :loading="loading"
          density="compact"
          class="elevation-1 compact-table"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              :color="item.status === 'Approved' ? 'success' : 'grey'"
              @click="approveItem(item)"
            >
              mdi-check-circle
            </v-icon>
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- OCR Results Dialog -->
    <v-dialog v-model="ocrDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5">
          OCR Results
          <v-spacer></v-spacer>
          <v-btn icon @click="ocrDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text v-if="ocrResults">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-card class="mb-4" variant="outlined">
                  <v-card-text>
                    <div class="text-h6 mb-2">Student Information</div>
                    <div>
                      <strong>Name:</strong> {{ ocrResults.studentName }}
                    </div>
                    <div>
                      <strong>University:</strong> {{ ocrResults.university }}
                    </div>
                    <div class="mt-2">
                      <strong>Total Hours:</strong>
                      {{ calculateTotalHours(ocrResults.courses) }}
                    </div>
                    <div>
                      <strong>GPA:</strong>
                      {{ calculateGPA(ocrResults.courses).toFixed(2) }}
                    </div>
                  </v-card-text>
                </v-card>

                <v-card variant="outlined">
                  <v-card-text>
                    <div class="text-h6 mb-2">
                      Courses ({{ ocrResults.courses.length }})
                    </div>
                    <v-table>
                      <thead>
                        <tr>
                          <th>Course Number</th>
                          <th>Course Name</th>
                          <th>Semester</th>
                          <th>Hours</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="course in ocrResults.courses"
                          :key="course.courseNumber"
                        >
                          <td>{{ course.courseNumber }}</td>
                          <td>{{ course.courseName }}</td>
                          <td>{{ course.semester }}</td>
                          <td>{{ course.hours }}</td>
                          <td>{{ course.grade }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="addOcrCourses"
            :loading="loading"
            :disabled="!ocrResults || !ocrResults.courses.length"
          >
            Add Courses to Transcript
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.universityTranscriptId"
                  :items="universityTranscripts"
                  item-title="OCIdNumber"
                  item-value="id"
                  label="University Transcript"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.courseNumber"
                  label="Course Number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.courseDescription"
                  label="Course Description"
                  required
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.courseHours"
                  label="Course Hours"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.universityCourseId"
                  :items="universityCourses"
                  item-title="courseName"
                  item-value="id"
                  label="University Course"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.OCCourseId"
                  :items="ocCourses"
                  item-title="courseName"
                  item-value="id"
                  label="OC Course"
                >
                  <template v-slot:append>
                    <v-icon
                      v-if="editedItem.OCCourseId"
                      @click.stop="editedItem.OCCourseId = null"
                      color="error"
                    >
                      mdi-close-circle
                    </v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.semesterId"
                  :items="semesters"
                  item-title="name"
                  item-value="id"
                  label="Semester"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.grade"
                  label="Grade"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.status"
                  :items="statusOptions"
                  label="Status"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="close">
            Cancel
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="save">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.compact-table :deep(th) {
  padding: 0 4px !important;
  white-space: nowrap;
}
.compact-table :deep(td) {
  padding: 0 4px !important;
  white-space: nowrap;
}
.compact-table :deep(.v-data-table__wrapper) {
  overflow-x: auto;
}
.compact-table :deep(.v-data-table__wrapper table) {
  border-spacing: 0;
  border-collapse: collapse;
}
.compact-table :deep(.v-data-table__wrapper table td),
.compact-table :deep(.v-data-table__wrapper table th) {
  border: none;
  margin: 0;
}
.compact-table :deep(.v-data-table__wrapper table tr) {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
</style>
