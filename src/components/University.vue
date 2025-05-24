<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Universities</h1>
        <v-btn color="primary" @click="openDialog()">Add University</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="universities"
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
                  v-model="editedItem.name"
                  label="Name"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.city"
                  label="City"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.state"
                  label="State"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.country"
                  label="Country"
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
  name: "University",
  data: () => ({
    dialog: false,
    loading: false,
    headers: [
      { text: "Name", value: "name" },
      { text: "City", value: "city" },
      { text: "State", value: "state" },
      { text: "Country", value: "country" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    universities: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      city: "",
      state: "",
      country: "",
    },
    defaultItem: {
      name: "",
      city: "",
      state: "",
      country: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New University" : "Edit University";
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.loading = true;
      try {
        const response = await axios.get("/api/universities");
        this.universities = response.data;
      } catch (error) {
        console.error("Error fetching universities:", error);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.universities.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.universities.indexOf(item);
      if (confirm("Are you sure you want to delete this university?")) {
        try {
          await axios.delete(`/api/universities/${item.id}`);
          this.universities.splice(index, 1);
        } catch (error) {
          console.error("Error deleting university:", error);
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
            `/api/universities/${this.editedItem.id}`,
            this.editedItem
          );
          Object.assign(this.universities[this.editedIndex], response.data);
        } else {
          // Create
          const response = await axios.post(
            "/api/universities",
            this.editedItem
          );
          this.universities.push(response.data);
        }
        this.close();
      } catch (error) {
        console.error("Error saving university:", error);
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
