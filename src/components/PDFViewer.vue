<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  path: { type: String, required: true },
  modelValue: { type: Boolean, required: true },
});
console.log(props.path);

const emit = defineEmits(["update:modelValue"]);

const dialog = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    dialog.value = newValue;
  }
);

watch(dialog, (newValue) => {
  emit("update:modelValue", newValue);
});

const close = () => {
  dialog.value = false;
};

const openInNewTab = () => {
  window.open(props.path, "_blank");
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="900px" fullscreen>
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Transcript PDF</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="white" variant="text" @click="openInNewTab" class="mr-2">
          <v-icon left>mdi-open-in-new</v-icon>
          Open in New Tab
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <iframe
          :src="path"
          width="100%"
          height="100%"
          style="border: none; min-height: 80vh"
        ></iframe>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-dialog--fullscreen {
  height: 90vh;
}
</style>
