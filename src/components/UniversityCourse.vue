<script setup>
import { ref, computed, onMounted } from "vue";
import UniversityCourseServices from "../services/universityCourseServices";
import UniversityServices from "../services/universityServices";
import OCCourseServices from "../services/ocCourseServices";
import SemesterServices from "../services/semesterServices";

const dialog = ref(false);
const loading = ref(false);
const universityCourses = ref([]);
const universities = ref([]);
const ocCourses = ref([]);
const semesters = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({
  universityId: null,
  courseNumber: "",
  courseName: "",
  courseDescription: "",
  courseHours: 0,
  OCCourseId: null,
  semesterId: null,
});
const defaultItem = {
  universityId: null,
  courseNumber: "",
  courseName: "",
  courseDescription: "",
  courseHours: 0,
  OCCourseId: null,
  semesterId: null,
};

const headers = [
  { text: "University", value: "university.name" },
  { text: "Course Number", value: "courseNumber" },
  { text: "Course Name", value: "courseName" },
  { text: "Course Description", value: "courseDescription" },
  { text: "Course Hours", value: "courseHours" },
  { text: "OC Course", value: "ocCourse.courseName" },
  { text: "Semester", value: "semester.name" },
  { text: "Actions", value: "actions", sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1
    ? "New University Course"
    : "Edit University Course";
});

const initialize = () => {
  loading.value = true;

  UniversityCourseServices.getAll()
    .then((response) => {
      universityCourses.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching university courses:", error);
    });

  UniversityServices.getAll()
    .then((response) => {
      universities.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching universities:", error);
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
  editedIndex.value = universityCourses.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteItem = (item) => {
  const index = universityCourses.value.indexOf(item);
  if (confirm("Are you sure you want to delete this university course?")) {
    UniversityCourseServices.delete(item.id)
      .then((response) => {
        universityCourses.value.splice(index, 1);
      })
      .catch((error) => {
        console.error("Error deleting university course:", error);
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
    UniversityCourseServices.update(editedItem.value.id, editedItem.value)
      .then((response) => {
        // Find the university, OC course, and semester data
        const university = universities.value.find(
          (u) => u.id === editedItem.value.universityId
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
          university: university,
          ocCourse: ocCourse,
          semester: semester,
        };
        Object.assign(universityCourses.value[editedIndex.value], updatedItem);
        close();
      })
      .catch((error) => {
        console.error("Error updating university course:", error);
      });
  } else {
    // Create
    UniversityCourseServices.create(editedItem.value)
      .then((response) => {
        // Find the university, OC course, and semester data
        const university = universities.value.find(
          (u) => u.id === editedItem.value.universityId
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
          university: university,
          ocCourse: ocCourse,
          semester: semester,
        };
        universityCourses.value.push(newItem);
        close();
      })
      .catch((error) => {
        console.error("Error creating university course:", error);
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
        <h1>University Courses</h1>
        <v-btn color="primary" @click="openDialog()"
          >Add University Course</v-btn
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="universityCourses"
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
                  v-model="editedItem.universityId"
                  :items="universities"
                  item-title="name"
                  item-value="id"
                  label="University"
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
                <v-text-field
                  v-model="editedItem.courseName"
                  label="Course Name"
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
                  v-model="editedItem.OCCourseId"
                  :items="ocCourses"
                  item-title="courseName"
                  item-value="id"
                  label="OC Course"
                ></v-select>
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
