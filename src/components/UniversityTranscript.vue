<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>University Transcripts</h1>
        <v-btn color="primary" @click="openDialog()"
          >Add University Transcript</v-btn
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="universityTranscripts"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.official="{ item }">
            <v-icon :color="item.official ? 'green' : 'red'">
              {{ item.official ? "mdi-check-circle" : "mdi-close-circle" }}
            </v-icon>
          </template>
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
                  v-model="editedItem.OCIdNumber"
                  label="OC ID Number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.universityId"
                  :items="universities"
                  item-text="name"
                  item-value="id"
                  label="University"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="editedItem.official"
                  label="Official Transcript"
                ></v-switch>
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
  name: "UniversityTranscript",
  data: () => ({
    dialog: false,
    loading: false,
    headers: [
      { text: "OC ID Number", value: "OCIdNumber" },
      { text: "University", value: "university.name" },
      { text: "Official", value: "official" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    universityTranscripts: [],
    universities: [],
    editedIndex: -1,
    editedItem: {
      OCIdNumber: "",
      universityId: null,
      official: false,
    },
    defaultItem: {
      OCIdNumber: "",
      universityId: null,
      official: false,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "New University Transcript"
        : "Edit University Transcript";
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.loading = true;
      try {
        const [transcriptsRes, universitiesRes] = await Promise.all([
          axios.get("/api/university-transcripts"),
          axios.get("/api/universities"),
        ]);
        this.universityTranscripts = transcriptsRes.data;
        this.universities = universitiesRes.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.universityTranscripts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.universityTranscripts.indexOf(item);
      if (
        confirm("Are you sure you want to delete this university transcript?")
      ) {
        try {
          await axios.delete(`/api/university-transcripts/${item.id}`);
          this.universityTranscripts.splice(index, 1);
        } catch (error) {
          console.error("Error deleting university transcript:", error);
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
            `/api/university-transcripts/${this.editedItem.id}`,
            this.editedItem
          );
          Object.assign(
            this.universityTranscripts[this.editedIndex],
            response.data
          );
        } else {
          // Create
          const response = await axios.post(
            "/api/university-transcripts",
            this.editedItem
          );
          this.universityTranscripts.push(response.data);
        }
        this.close();
      } catch (error) {
        console.error("Error saving university transcript:", error);
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
