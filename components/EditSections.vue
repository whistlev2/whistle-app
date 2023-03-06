<template>
    <div>
        <div v-if="sectionPath.length > 0">
            <span v-for="sectionRef in sectionPath">
                &gt;
                <v-btn @click="goToPathSection(sectionRef)">{{
                    sectionRef
                }}</v-btn>
            </span>
        </div>
        <div>
            <span v-for="(section, index) in activeSections" :key="section.ref">
                <EditSection
                    v-if="section.type == 'section'"
                    :section="section"
                    @expand="expandSection(section)"
                />
                <!-- TODO: Put all view types in same component -->
                <EditTextView
                    v-else-if="section.type == 'text'"
                    :view="section"
                    @update="(_: any, value: ViewType) => updateSection(index, value)"
                />
                <EditCustomView
                    v-else-if="section.type == 'custom'"
                    :view="section"
                />
            </span>
        </div>
    </div>
</template>
<script setup lang="ts">
import {
    ProjectType,
    SectionBodyType,
    SectionType,
    ViewType
} from "~~/interfaces/types";

const props = defineProps(["project"]);
const project = ref(props.project as ProjectType);
const activeSections: Ref<Array<SectionBodyType>> = ref(project.value.sections);
const sectionPath: Ref<string[]> = ref([]);
const emit = defineEmits(["update"]);

function expandSection(section: SectionType) {
    sectionPath.value.push(section.ref);
    activeSections.value = section.body;
}

function updateSection(index: number, value: ViewType) {
    activeSections.value[index] = value;
    emit("update", activeSections.value);
}

function goToPath(path: string[]) {
    let sections: SectionBodyType[] = project.value.sections;
    for (let i = 0; i < path.length; i++) {
        for (let j = 0; j < sections.length; j++) {
            if (sections[j].ref === path[i]) {
                if (!(sections[j].type == "section")) {
                    throw createError({ message: "Invalid path" });
                }
                sections = sections[j].body as SectionBodyType[];
                break;
            }
        }
    }
    sectionPath.value = path;
    activeSections.value = sections;
}

function goToPathSection(sectionRef: string) {
    let path = [];
    for (let i = 0; i < sectionPath.value.length; i++) {
        path.push(sectionPath.value[i]);
        if (sectionPath.value[i] === sectionRef) {
            return goToPath(path);
        }
    }
    throw createError({ message: "Invalid section path" });
}

function clearSectionPath() {
    sectionPath.value = [];
    activeSections.value = project.value.sections;
}
</script>
<style scoped></style>
