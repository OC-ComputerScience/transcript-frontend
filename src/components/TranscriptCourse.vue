<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import TranscriptCourseServices from "../services/transcriptCourseServices";
import UniversityTranscriptServices from "../services/universityTranscriptServices";
import UniversityCourseServices from "../services/universityCourseServices";
import OCCourseServices from "../services/ocCourseServices";
import SemesterServices from "../services/semesterServices";

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
      console.log("Processing course:", transcriptCourse.courseNumber);

      // Find matching university course by course number
      const matchingUniversityCourse = universityCourses.find(
        (uc) => uc.courseNumber === transcriptCourse.courseNumber
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
              universityCourseId: transcriptCourse.universityCourseId,
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
        }
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
          <v-btn color="secondary" @click="matchCourses" :loading="loading">
            Match with OC Courses
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
