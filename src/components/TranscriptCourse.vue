<script setup>
import { ref, computed, onMounted } from "vue";
import TranscriptCourseServices from "../services/transcriptCourseServices";
import UniversityTranscriptServices from "../services/universityTranscriptServices";
import UniversityCourseServices from "../services/universityCourseServices";
import OCCourseServices from "../services/ocCourseServices";

const dialog = ref(false);
const loading = ref(false);
const transcriptCourses = ref([]);
const universityTranscripts = ref([]);
const universityCourses = ref([]);
const ocCourses = ref([]);
const statusOptions = ["Pending", "Approved", "Rejected"];
const editedIndex = ref(-1);
const editedItem = ref({
  universityTranscriptId: null,
  courseNumber: "",
  courseDescription: "",
  courseHours: 0,
  universityCourseId: null,
  OCCourseId: null,
  status: "Pending",
  grade: "",
});
const defaultItem = {
  universityTranscriptId: null,
  courseNumber: "",
  courseDescription: "",
  courseHours: 0,
  universityCourseId: null,
  OCCourseId: null,
  status: "Pending",
  grade: "",
};

const headers = [
  { title: "Transcript", key: "universityTranscript.OCIdNumber" },
  { title: "Course Number", key: "courseNumber" },
  { title: "Course Description", key: "courseDescription" },
  { title: "Course Hours", key: "courseHours" },
  { title: "University Course", key: "universityCourse.courseName" },
  { title: "OC Course", key: "ocCourse.courseName" },
  { title: "Grade", key: "grade" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1
    ? "New Transcript Course"
    : "Edit Transcript Course";
});

const initialize = () => {
  loading.value = true;

  TranscriptCourseServices.getAll()
    .then((response) => {
      transcriptCourses.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching transcript courses:", error);
    });

  UniversityTranscriptServices.getAll()
    .then((response) => {
      universityTranscripts.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching university transcripts:", error);
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
    TranscriptCourseServices.update(editedItem.value.id, editedItem.value)
      .then((response) => {
        // Find the related data
        const universityTranscript = universityTranscripts.value.find(
          (t) => t.id === editedItem.value.universityTranscriptId
        );
        const universityCourse = universityCourses.value.find(
          (c) => c.id === editedItem.value.universityCourseId
        );
        const ocCourse = ocCourses.value.find(
          (c) => c.id === editedItem.value.OCCourseId
        );
        // Create a new object with the related data
        const updatedItem = {
          ...response.data,
          universityTranscript: universityTranscript,
          universityCourse: universityCourse,
          ocCourse: ocCourse,
        };
        Object.assign(transcriptCourses.value[editedIndex.value], updatedItem);
        close();
      })
      .catch((error) => {
        console.error("Error updating transcript course:", error);
      });
  } else {
    // Create
    TranscriptCourseServices.create(editedItem.value)
      .then((response) => {
        // Find the related data
        const universityTranscript = universityTranscripts.value.find(
          (t) => t.id === editedItem.value.universityTranscriptId
        );
        const universityCourse = universityCourses.value.find(
          (c) => c.id === editedItem.value.universityCourseId
        );
        const ocCourse = ocCourses.value.find(
          (c) => c.id === editedItem.value.OCCourseId
        );
        // Create a new object with the related data
        const newItem = {
          ...response.data,
          universityTranscript: universityTranscript,
          universityCourse: universityCourse,
          ocCourse: ocCourse,
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
  editedIndex.value = -1;
  dialog.value = true;
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
        <v-btn color="primary" @click="openDialog()"
          >Add Transcript Course</v-btn
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="transcriptCourses"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.actions="{ item }">
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
                  v-model.number="editedItem.courseHours"
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
          <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
