<template>
    <div>
        <h3>{{ section.title }}</h3>
        <h4>Show Conditions</h4>
        <EditConditions
            :conditions="section.conditions"
            :refs="refs"
            @update="(_: any, conditions) => updateConditions(conditions)"
        />
        <v-btn @click="$emit('expand')">Expand Section</v-btn>
    </div>
</template>
<script setup lang="ts">
import { ConditionType } from "~~/interfaces/types";

const { section, refs } = defineProps(["section", "refs"]);
const emit = defineEmits(["update", "expand"]);

function updateConditions(conditions: ConditionType[]) {
    section.conditions = conditions;
    emit("update", section);
}
</script>
<style scoped></style>
