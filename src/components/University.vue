<script setup>
import { ref, computed, onMounted } from "vue";
import UniversityServices from "../services/universityServices";

const dialog = ref(false);
const loading = ref(false);
const universities = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({
  name: "",
  city: "",
  state: "",
  country: "",
});
const defaultItem = {
  name: "",
  city: "",
  state: "",
  country: "",
};

const headers = [
  { text: "Name", value: "name" },
  { text: "City", value: "city" },
  { text: "State", value: "state" },
  { text: "Country", value: "country" },
  { text: "Actions", value: "actions", sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1 ? "New University" : "Edit University";
});

async function initialize() {
  loading.value = true;

  const response = await UniversityServices.getAll()
    .then((response) => {
      universities.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching universities:", error);
    });

  loading.value = false;
}

function editItem(item) {
  editedIndex.value = universities.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
}

async function deleteItem(item) {
  const index = universities.value.indexOf(item);
  if (confirm("Are you sure you want to delete this university?")) {
    await UniversityServices.delete(item.id)
      .then((response) => {
        universities.value.splice(index, 1);
      })
      .catch((error) => {
        console.error("Error deleting university:", error);
      });
  }
}

function close() {
  dialog.value = false;
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
}

async function save() {
  if (editedIndex.value > -1) {
    // Update
    await UniversityServices.update(editedItem.value.id, editedItem.value)
      .then((response) => {
        universities.value[editedIndex.value] = Object.assign(
          {},
          editedItem.value
        );
        close();
      })
      .catch((error) => {
        console.error("Error editing university:", error);
      });
  } else {
    // Create
    const response = await UniversityServices.create(editedItem.value)
      .then((resonse) => {
        universities.value.push(response.data);
        close();
      })
      .catch((error) => {
        console.error("Error saving university: ", error);
      });
  }
}

function openDialog() {
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
  dialog.value = true;
}

onMounted(() => {
  initialize();
});
</script>

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
