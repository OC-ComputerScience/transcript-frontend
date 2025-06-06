<script setup>
import { ref, computed, onMounted } from "vue";
import OCCourseServices from "../services/ocCourseServices";

const dialog = ref(false);
const loading = ref(false);
const ocCourses = ref([]);
const courseNumberFilter = ref("");
const filteredCourses = computed(() => {
  if (!courseNumberFilter.value) return ocCourses.value;
  return ocCourses.value.filter((course) =>
    course.courseNumber
      .toLowerCase()
      .includes(courseNumberFilter.value.toLowerCase())
  );
});
const editedIndex = ref(-1);
const editedItem = ref({
  courseNumber: "",
  courseName: "",
  courseDescription: "",
  courseHours: 0,
});
const defaultItem = {
  courseNumber: "",
  courseName: "",
  courseDescription: "",
  courseHours: 0,
};

const headers = [
  {
    title: "Course Number",
    key: "courseNumber",
    sortable: true,
    width: "150px",
  },
  { title: "Course Name", key: "courseName", sortable: true, width: "200px" },
  {
    title: "Course Description",
    key: "courseDescription",
    sortable: true,
    width: "400px",
  },
  { title: "Course Hours", key: "courseHours", sortable: true, width: "150px" },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    width: "120px",
    align: "center",
  },
];

const formTitle = computed(() => {
  return editedIndex.value === -1 ? "New OC Course" : "Edit OC Course";
});

const initialize = async () => {
  loading.value = true;
  await OCCourseServices.getAll()
    .then((response) => {
      ocCourses.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching OC courses:", error);
    });
  loading.value = false;
};

const editItem = (item) => {
  editedIndex.value = ocCourses.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteItem = async (item) => {
  const index = ocCourses.value.indexOf(item);
  if (confirm("Are you sure you want to delete this OC course?")) {
    await OCCourseServices.delete(editedItem.value.id)
      .then((response) => {
        ocCourses.value.splice(index, 1);
      })
      .catch((error) => {
        console.error("Error deleting OC course:", error);
      });
  }
};

const close = () => {
  dialog.value = false;
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
};

const save = async () => {
  if (editedIndex.value > -1) {
    // Update
    await OCCourseServices.update(editedItem.value.id, editedItem.value)
      .then((response) => {
        Object.assign(ocCourses.value[editedIndex.value], response.data);
      })
      .catch((error) => {
        console.error("Error saving OC course:", error);
      });
  } else {
    // Create
    const response = await OCCourseServices.create(editedItem.value)
      .then((response) => {
        ocCourses.value.push(response.data);
      })
      .catch((error) => {
        console.error("Error creating OC course:", error);
      });
  }
  close();
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
        <h1>OC Courses</h1>
        <v-btn color="primary" @click="openDialog()">Add OC Course</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="courseNumberFilter"
          label="Filter by Course Number"
          prepend-icon="mdi-magnify"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="filteredCourses"
          :loading="loading"
          class="elevation-1"
          :items-per-page="10"
          :items-per-page-options="[10, 20, 50, 100]"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="editItem(item.raw)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteItem(item.raw)"> mdi-delete </v-icon>
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
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.courseHours"
                  label="Hours"
                ></v-text-field>
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

<style scoped>
.v-data-table :deep(th) {
  font-weight: bold !important;
}
</style>
