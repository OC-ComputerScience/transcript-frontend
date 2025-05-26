<script setup>
import { ref, computed, onMounted } from "vue";
import UniversityTranscriptServices from "../services/universityTranscriptServices";
import UniversityServices from "../services/universityServices";
import UploadServices from "../services/uploadServices";
import PDFViewer from "./PDFViewer.vue";

const dialog = ref(false);
const uploadDialog = ref(false);
const pdfDialog = ref(false);
const selectedFile = ref(null);
const currentTranscript = ref(null);
const currentPdfUrl = ref("");
const loading = ref(false);
const universityTranscripts = ref([]);
const universities = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({
  OCIdNumber: "",
  name: "",
  universityId: null,
  official: false,
});
const defaultItem = {
  OCIdNumber: "",
  name: "",
  universityId: null,
  official: false,
};

const headers = [
  { title: "OC ID Number", key: "OCIdNumber" },
  { title: "Student Name", key: "name" },
  { title: "University", key: "university.name" },
  { title: "Official", key: "official" },
  { title: "PDF", key: "pdf" },
  { title: "Actions", key: "actions", sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1
    ? "New University Transcript"
    : "Edit University Transcript";
});

const initialize = () => {
  loading.value = true;

  UniversityTranscriptServices.getAll()
    .then((responce) => {
      universityTranscripts.value = responce.data;
    })
    .catch((error) => {
      console.log("Error reading University Transcripts");
    });

  UniversityServices.getAll()
    .then((responce) => {
      universities.value = responce.data;
    })
    .catch((error) => {
      console.log("Error reading Universitis");
    });

  loading.value = false;
};

const editItem = (item) => {
  editedIndex.value = universityTranscripts.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteItem = async (item) => {
  const index = universityTranscripts.value.indexOf(item);
  if (confirm("Are you sure you want to delete this university transcript?")) {
    await UniversityTranscriptServices.delete(item.id)
      .then((response) => {
        universityTranscripts.value.splice(index, 1);
      })
      .catch((error) => {
        console.error("Error deleting university transcript:", error);
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
    await UniversityTranscriptServices.update(
      editedItem.value.id,
      editedItem.value
    )
      .then((response) => {
        // Find the university data
        const university = universities.value.find(
          (u) => u.id === editedItem.value.universityId
        );
        // Create a new object with the university data
        const updatedItem = {
          ...response.data,
          university: university,
        };
        Object.assign(
          universityTranscripts.value[editedIndex.value],
          updatedItem
        );
        close();
      })
      .catch((error) => {
        console.error("Error updating university transcript:", error);
      });
  } else {
    // Create
    await UniversityTranscriptServices.create(editedItem.value)
      .then((response) => {
        // Find the university data
        const university = universities.value.find(
          (u) => u.id === editedItem.value.universityId
        );
        // Create a new object with the university data
        const newItem = {
          ...response.data,
          university: university,
        };
        universityTranscripts.value.push(newItem);
        close();
      })
      .catch((error) => {
        console.error("Error creating university transcript:", error);
      });
  }
};

const openDialog = () => {
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
  dialog.value = true;
};

const openUploadDialog = (item) => {
  currentTranscript.value = item;
  uploadDialog.value = true;
};

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!selectedFile.value || !currentTranscript.value) return;

  console.log("Current transcript:", currentTranscript.value); // Debug log
  try {
    await UploadServices.uploadTranscript(
      selectedFile.value,
      currentTranscript.value.id
    );
    uploadDialog.value = false;
    selectedFile.value = null;
    currentTranscript.value = null;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

const viewPdf = (item) => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(7);
  currentPdfUrl.value = `http://localhost:3100/transcript/pdf/${item.id}?t=${timestamp}&r=${random}`;
  console.log("Attempting to view PDF at URL:", currentPdfUrl.value);
  pdfDialog.value = true;
};

onMounted(() => {
  initialize();
});
</script>

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
          <template v-slot:item.pdf="{ item }">
            <div class="d-flex align-center">
              <v-icon
                small
                class="mr-2"
                @click="openUploadDialog(item)"
                color="primary"
              >
                mdi-file-pdf-box
              </v-icon>
              <v-icon small class="mr-2" @click="viewPdf(item)" color="primary">
                mdi-eye
              </v-icon>
            </div>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="deleteItem(item)">
              mdi-delete
            </v-icon>
            <v-icon
              small
              @click="$router.push(`/transcript-courses/${item.id}`)"
            >
              mdi-book-open-page-variant
            </v-icon>
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
                <v-text-field
                  v-model="editedItem.name"
                  label="Student Name"
                  required
                ></v-text-field>
              </v-col>
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

    <!-- Upload Dialog -->
    <v-dialog v-model="uploadDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Upload Transcript PDF</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-file-input
                  v-model="selectedFile"
                  accept=".pdf"
                  label="Select PDF file"
                  prepend-icon="mdi-file-pdf-box"
                  @change="handleFileSelect"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="uploadDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="uploadFile"
            :disabled="!selectedFile"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PDF Viewer Dialog -->
    <v-dialog v-model="pdfDialog" max-width="900px" fullscreen>
      <PDFViewer :path="currentPdfUrl" v-model="pdfDialog" />
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-dialog--fullscreen {
  height: 90vh;
}
</style>
