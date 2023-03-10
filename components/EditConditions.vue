<template>
    <div>
        <EditCondition
            v-for="(condition, index) in conditions"
            :key="index"
            :condition="condition"
            :refs="props.refs"
            @update="(value: ConditionType) => updateCondition(index, value)"
            @delete="(_: any) => deleteCondition(index)"
        />
        <v-btn @click="addCondition">Add Condition</v-btn>
    </div>
</template>
<script setup lang="ts">
import { ConditionType } from "~~/interfaces/types";

const props = defineProps(["conditions", "refs"]);
const conditions: Ref<ConditionType[]> = ref(props.conditions);
const emit = defineEmits(["update"]);

function updateCondition(index: number, value: ConditionType) {
    conditions.value[index] = value;
    emit("update", conditions.value);
}

function addCondition() {
    conditions.value.push({
        operation: "equals",
        arguments: ["", ""]
    });
    emit("update", conditions.value);
}

function deleteCondition(index: number) {
    conditions.value.splice(index, 1);
    emit("update", conditions.value);
}
</script>
<style scoped></style>
