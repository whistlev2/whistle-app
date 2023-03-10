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
            <span v-for="(section, index) in activeSections" :key="index">
                <br />
                <EditSection
                    v-if="section && section.type == 'section'"
                    :section="section"
                    :refs="refs"
                    @update="(value: ViewType) => updateSection(index, value)"
                    @expand="expandSection(section)"
                />
                <!-- TODO: Put all view types in same component -->
                <EditTextView
                    v-else-if="section && section.type == 'text'"
                    :view="section"
                    :refs="refs"
                    @update="(value: ViewType) => updateSection(index, value)"
                />
                <EditCustomView
                    v-else-if="section && section.type == 'custom'"
                    :view="section"
                    :refs="refs"
                    @update="(value: ViewType) => updateSection(index, value)"
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

const props = defineProps(["project", "refs"]);
const project = ref(props.project as ProjectType);
//const activeSections: Ref<Array<SectionBodyType>> = ref(project.value.sections);
const sectionPath: Ref<string[]> = ref([]);
const emit = defineEmits(["update"]);

const activeSections: Ref<Array<SectionBodyType>> = computed(() => {
    if (sectionPath.value.length == 0) {
        return project.value.sections;
    }
    let sections: SectionBodyType[] = project.value.sections;
    for (let i = 0; i < sectionPath.value.length; i++) {
        for (let j = 0; j < sections.length; j++) {
            if (sections[j].ref === sectionPath.value[i]) {
                if (!(sections[j].type == "section")) {
                    throw createError({ message: "Invalid path" });
                }
                if (!sections[j].body) {
                    throw createError({ message: "Invalid path" });
                }
                return sections[j].body as SectionBodyType[];
            }
        }
    }
    throw createError({ message: "Invalid path" });
});

function expandSection(section: SectionType) {
    sectionPath.value.push(section.ref);
    activeSections.value = section.body;
}

function updateSection(index: number, value: SectionBodyType) {
    activeSections.value[index] = value;
    emit("update", project.value.sections);
}

function goToPathSection(sectionRef: string) {
    let path = [];
    for (let i = 0; i < sectionPath.value.length; i++) {
        path.push(sectionPath.value[i]);
        if (sectionPath.value[i] === sectionRef) {
            sectionPath.value = path;
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
