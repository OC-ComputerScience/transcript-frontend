<template>
  <div>
    <v-container>
      <h1 class="text-h4 mb-4 text-center">
        Welcome to Transcript Evaluation System
      </h1>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="item in menuItems"
          :key="item.title"
        >
          <v-card
            :to="item.path"
            class="mx-auto"
            max-width="400"
            height="200"
            elevation="2"
          >
            <v-card-title class="text-h5">
              <v-icon large class="mr-2">{{ item.icon }}</v-icon>
              {{ item.title }}
            </v-card-title>
            <v-card-text class="text-body-1">
              {{ item.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
const menuItems = [
  {
    title: "Transcripts",
    icon: "mdi-file-document",
    path: "/transcripts",
    description: "Manage university transcripts and their status",
  },
  {
    title: "Universities",
    icon: "mdi-school",
    path: "/universities",
    description: "Manage university information and details",
  },
  {
    title: "University Courses",
    icon: "mdi-book-open",
    path: "/university-courses",
    description: "Manage university course mappings and equivalencies",
  },
  {
    title: "OC Courses",
    icon: "mdi-book",
    path: "/oc-courses",
    description: "Manage OC course catalog and details",
  },
  {
    title: "Semesters",
    icon: "mdi-calendar",
    path: "/semesters",
    description: "Manage academic semesters and terms",
  },
  {
    title: "Catalogs",
    icon: "mdi-book-multiple",
    path: "/catalogs",
    description: "Manage course catalogs and their effective dates",
  },
];
</script>
