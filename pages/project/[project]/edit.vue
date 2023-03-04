<template>
    <h1>Project Editor - {{ project.title }}</h1>
    <EditSections :project="project" />
</template>

<script lang="ts" setup>
//use tabs for each section
//use VMenu for individual view settings
//use full screen VDialog for overall settings

import Project from "~~/utils/project";
const route = useRoute();
const projectRef = Array.isArray(route.params.project)
    ? route.params.project[0]
    : route.params.project;
const project = await getProject(projectRef);
if (!project) {
    throw createError({
        statusCode: 404,
        message: `Project ${projectRef} not found`
    });
}

async function getProject(projectRef: string) {
    let response = await useFetch(`/api/edit/project/${projectRef}`);
    try {
        let project = new Project(response.data.value);
        return project;
    } catch (error) {
        return null;
    }
}
</script>
