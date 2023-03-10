<template>
    <EditProjectToolbar
        :project="project"
        @save="saveProject()"
        @update="(_: any, updatedProject: MessagingProjectType) => updateProject(updatedProject)"
        @open-settings="showSettings(true)"
    />
    <EditSections
        :project="project"
        :refs="refs"
        @update="(value: SectionBodyType[]) => updateSections(value)"
    />
    <EditSettingsModal
        :settings="project.settings"
        ref="settingsModal"
        :refs="refs"
        @save="saveProject()"
        @update="(_: any, value) => updateProject(value)"
    />
</template>

<script lang="ts" setup>
//TODO: Deletes
//use tabs for each section
//use VMenu for individual view settings
//use full screen VDialog for overall settings

import { MessagingProjectType, SectionBodyType } from "~~/interfaces/types";
import { MessagingProject, getProjectRefs } from "~~/utils/project"; //TODO: Establish why these don't auto-import
const route = useRoute();
const projectRef = Array.isArray(route.params.project)
    ? route.params.project[0]
    : route.params.project;
const project = ref(await getProject(projectRef));
const settingsModal = ref<
    (HTMLElement & { showSettings: (value: boolean) => void }) | null
>(null);
const refs = computed(() => getAllRefs());

if (!project.value) {
    throw createError({
        statusCode: 404,
        message: `Project ${projectRef} not found`
    });
}

function showSettings(value: boolean) {
    settingsModal.value?.showSettings(value);
}

async function saveProject() {
    let { data, error } = await useFetch(`/api/edit/project/${projectRef}`, {
        method: "PATCH",
        body: {
            project: JSON.stringify(project.value)
        }
    });
    if (error?.value) {
        throw createError({
            statusCode: 500,
            message: `Error saving project ${projectRef}`
        });
        //TODO: Handle error differently
    }
}

async function getProject(
    projectRef: string
): Promise<MessagingProjectType | null> {
    let response = await useFetch(`/api/edit/project/${projectRef}`);
    try {
        let project = new MessagingProject(response.data.value);
        return project;
    } catch (error) {
        return null;
    }
}

function updateProject(value: MessagingProjectType) {
    project.value = value;
}

function updateSections(sections: SectionBodyType[]) {
    if (!project.value) return; //TODO: Handle error
    project.value.sections = sections;
}

function getAllRefs(): string[] {
    if (project.value) {
        return getProjectRefs(project.value);
    } else {
        return [""];
    }
}
</script>
