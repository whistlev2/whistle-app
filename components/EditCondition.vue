<template>
    <div>
        <v-select
            v-model="condition.operation"
            :items="allowedOperations"
            label="Operation"
            outlined
            dense
        />
        <v-select
            v-if="condition.operation === 'equals'"
            v-model="condition.arguments[0]"
            @update:model-value="updateCondition()"
            :items="props.refs"
            label="Ref"
            outlined
            dense
        />
        <v-text-field
            v-if="condition.operation === 'equals'"
            v-model="condition.arguments[1]"
            @update:model-value="updateCondition()"
            label="Value"
            outlined
            dense
        />
        <v-btn @click="deleteCondition">Delete Condition</v-btn>
    </div>
</template>
<script setup lang="ts">
import { ConditionType } from "~~/interfaces/types";

const props = defineProps(["condition", "refs"]);
const condition: Ref<ConditionType> = ref(props.condition);
const emit = defineEmits(["update", "delete"]);
const allowedOperations = ["equals", "contains", "includes"];
function updateCondition() {
    emit("update", condition.value);
}

function deleteCondition() {
    emit("delete");
}
</script>
<style scoped></style>
