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
                  item-text="OCIdNumber"
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
                  item-text="courseName"
                  item-value="id"
                  label="University Course"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.OCCourseId"
                  :items="ocCourses"
                  item-text="courseName"
                  item-value="id"
                  label="OC Course"
                ></v-select>
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

<script>
import axios from "axios";

export default {
  name: "TranscriptCourse",
  data: () => ({
    dialog: false,
    loading: false,
    headers: [
      { text: "Transcript", value: "universityTranscript.OCIdNumber" },
      { text: "Course Number", value: "courseNumber" },
      { text: "Course Description", value: "courseDescription" },
      { text: "Course Hours", value: "courseHours" },
      { text: "University Course", value: "universityCourse.courseName" },
      { text: "OC Course", value: "ocCourse.courseName" },
      { text: "Status", value: "status" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    transcriptCourses: [],
    universityTranscripts: [],
    universityCourses: [],
    ocCourses: [],
    statusOptions: ["Pending", "Approved", "Rejected"],
    editedIndex: -1,
    editedItem: {
      universityTranscriptId: null,
      courseNumber: "",
      courseDescription: "",
      courseHours: 0,
      universityCourseId: null,
      OCCourseId: null,
      status: "Pending",
    },
    defaultItem: {
      universityTranscriptId: null,
      courseNumber: "",
      courseDescription: "",
      courseHours: 0,
      universityCourseId: null,
      OCCourseId: null,
      status: "Pending",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "New Transcript Course"
        : "Edit Transcript Course";
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.loading = true;
      try {
        const [
          transcriptCoursesRes,
          universityTranscriptsRes,
          universityCoursesRes,
          ocCoursesRes,
        ] = await Promise.all([
          axios.get("/api/transcript-courses"),
          axios.get("/api/university-transcripts"),
          axios.get("/api/university-courses"),
          axios.get("/api/oc-courses"),
        ]);
        this.transcriptCourses = transcriptCoursesRes.data;
        this.universityTranscripts = universityTranscriptsRes.data;
        this.universityCourses = universityCoursesRes.data;
        this.ocCourses = ocCoursesRes.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.transcriptCourses.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.transcriptCourses.indexOf(item);
      if (confirm("Are you sure you want to delete this transcript course?")) {
        try {
          await axios.delete(`/api/transcript-courses/${item.id}`);
          this.transcriptCourses.splice(index, 1);
        } catch (error) {
          console.error("Error deleting transcript course:", error);
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
            `/api/transcript-courses/${this.editedItem.id}`,
            this.editedItem
          );
          Object.assign(
            this.transcriptCourses[this.editedIndex],
            response.data
          );
        } else {
          // Create
          const response = await axios.post(
            "/api/transcript-courses",
            this.editedItem
          );
          this.transcriptCourses.push(response.data);
        }
        this.close();
      } catch (error) {
        console.error("Error saving transcript course:", error);
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
