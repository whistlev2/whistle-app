<template>
    <h1>Project Editor - {{ project.title }}</h1>
</template>

<script lang="ts" setup>
import Project from "~~/utils/project";
const route = useRoute();
const abbreviation = Array.isArray(route.params.abbreviation)
    ? route.params.abbreviation[0]
    : route.params.abbreviation;
const project = await getProject(abbreviation);
if (!project) {
    throw createError({
        statusCode: 404,
        message: `Project ${abbreviation} not found`
    });
}

async function getProject(abbreviation: string) {
    let response = await useFetch(`/api/edit/project/${abbreviation}`);
    try {
        let project = new Project(response.data.value);
        return project;
    } catch (error) {
        return null;
    }
}
</script>
