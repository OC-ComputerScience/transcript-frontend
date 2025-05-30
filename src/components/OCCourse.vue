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
  { text: "Course Number", value: "courseNumber" },
  { text: "Course Name", value: "courseName" },
  { text: "Course Description", value: "courseDescription" },
  { text: "Course Hours", value: "courseHours" },
  { text: "Actions", value: "actions", sortable: false },
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
        <v-table>
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.value">
                {{ header.text }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredCourses" :key="item.id">
              <td>{{ item.courseNumber }}</td>
              <td>{{ item.courseName }}</td>
              <td>{{ item.courseDescription }}</td>
              <td>{{ item.courseHours }}</td>
              <td>
                <v-icon small class="mr-2" @click="editItem(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
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
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.courseHours"
                  label="Course Hours"
                  type="number"
                  required
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
