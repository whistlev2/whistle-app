<template>
    <v-toolbar fixed density="compact">
        <v-toolbar-title>
            <v-text-field
                v-model="project.title"
                label="Project Title"
                outlined
                dense
                hide-details
                @update:model-value="updateProject"
            />
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn @click="saveProject()">
            <v-icon>mdi-content-save</v-icon> Save
        </v-btn>
        <v-btn @click="openSettings()">
            <v-icon>mdi-cog</v-icon> Settings
        </v-btn>
    </v-toolbar>
</template>
<script setup lang="ts">
const { project } = defineProps(["project"]);
const emit = defineEmits(["save", "update", "open-settings"]);

function saveProject() {
    emit("save");
}

function updateProject() {
    emit("update", project);
}

function openSettings() {
    emit("open-settings");
}
</script>
<style scoped></style>
