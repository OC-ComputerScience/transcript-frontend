<script setup>
import { ref, computed, onMounted } from "vue";
import OCCourseServices from "../services/ocCourseServices";

const dialog = ref(false);
const deleteDialog = ref(false);
const itemToDelete = ref(null);
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
  courseHours: null,
});
const defaultItem = {
  courseNumber: "",
  courseName: "",
  courseDescription: "",
  courseHours: null,
};

const formErrors = ref({
  courseNumber: false,
  courseName: false,
  courseDescription: false,
  courseHours: false,
});

const isFormValid = computed(() => {
  console.log("Form validation check:", {
    courseNumber: editedItem.value.courseNumber,
    courseName: editedItem.value.courseName,
    courseDescription: editedItem.value.courseDescription,
    courseHours: editedItem.value.courseHours,
  });

  const isValid = Boolean(
    editedItem.value.courseNumber &&
      editedItem.value.courseName &&
      editedItem.value.courseDescription &&
      editedItem.value.courseHours
  );

  console.log("Is form valid:", isValid);
  return isValid;
});

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
  console.log("Raw item:", item);
  console.log("Item type:", typeof item);
  console.log("Item properties:", Object.keys(item));

  if (!item) {
    console.error("No item provided to editItem");
    return;
  }

  editedItem.value = {
    id: item.id,
    courseNumber: item.courseNumber || "",
    courseName: item.courseName || "",
    courseDescription: item.courseDescription || "",
    courseHours: item.courseHours || "",
  };
  console.log("Edited item:", editedItem.value);
  dialog.value = true;
};

const deleteItem = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const confirmDelete = () => {
  const index = ocCourses.value.indexOf(itemToDelete.value);
  OCCourseServices.delete(itemToDelete.value.id)
    .then((response) => {
      ocCourses.value.splice(index, 1);
      deleteDialog.value = false;
      itemToDelete.value = null;
    })
    .catch((error) => {
      console.error("Error deleting OC course:", error);
    });
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
            <v-icon size="small" class="me-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
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
                  :error="formErrors.courseNumber"
                  :error-messages="
                    formErrors.courseNumber ? 'Course Number is required' : ''
                  "
                  @input="formErrors.courseNumber = false"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.courseName"
                  label="Course Name"
                  required
                  :error="formErrors.courseName"
                  :error-messages="
                    formErrors.courseName ? 'Course Name is required' : ''
                  "
                  @input="formErrors.courseName = false"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.courseDescription"
                  label="Course Description"
                  required
                  :error="formErrors.courseDescription"
                  :error-messages="
                    formErrors.courseDescription
                      ? 'Course Description is required'
                      : ''
                  "
                  @input="formErrors.courseDescription = false"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.courseHours"
                  label="Course Hours"
                  required
                  :error="formErrors.courseHours"
                  :error-messages="
                    formErrors.courseHours ? 'Course Hours is required' : ''
                  "
                  @input="formErrors.courseHours = false"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="save"
            :disabled="!isFormValid"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Delete OC Course</v-card-title>
        <v-card-text>
          Are you sure you want to delete this OC course? This action cannot be
          undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="error" text @click="confirmDelete">Delete</v-btn>
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
