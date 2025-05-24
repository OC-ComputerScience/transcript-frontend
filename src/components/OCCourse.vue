<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>OC Courses</h1>
        <v-btn color="primary" @click="openDialog()">Add OC Course</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="ocCourses"
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

<script>
import axios from "axios";

export default {
  name: "OCCourse",
  data: () => ({
    dialog: false,
    loading: false,
    headers: [
      { text: "Course Number", value: "courseNumber" },
      { text: "Course Name", value: "courseName" },
      { text: "Course Description", value: "courseDescription" },
      { text: "Course Hours", value: "courseHours" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    ocCourses: [],
    editedIndex: -1,
    editedItem: {
      courseNumber: "",
      courseName: "",
      courseDescription: "",
      courseHours: 0,
    },
    defaultItem: {
      courseNumber: "",
      courseName: "",
      courseDescription: "",
      courseHours: 0,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New OC Course" : "Edit OC Course";
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.loading = true;
      try {
        const response = await axios.get("/api/oc-courses");
        this.ocCourses = response.data;
      } catch (error) {
        console.error("Error fetching OC courses:", error);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.ocCourses.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.ocCourses.indexOf(item);
      if (confirm("Are you sure you want to delete this OC course?")) {
        try {
          await axios.delete(`/api/oc-courses/${item.id}`);
          this.ocCourses.splice(index, 1);
        } catch (error) {
          console.error("Error deleting OC course:", error);
        }
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      try {
        if (this.editedIndex > -1) {
          // Update
          const response = await axios.put(
            `/api/oc-courses/${this.editedItem.id}`,
            this.editedItem
          );
          Object.assign(this.ocCourses[this.editedIndex], response.data);
        } else {
          // Create
          const response = await axios.post("/api/oc-courses", this.editedItem);
          this.ocCourses.push(response.data);
        }
        this.close();
      } catch (error) {
        console.error("Error saving OC course:", error);
      }
    },

    openDialog() {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
      this.dialog = true;
    },
  },
};
</script>
