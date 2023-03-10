<template>
    <div>
        <v-select
            v-model="action.operation"
            :items="allowedOperations"
            label="Operation"
            outlined
            dense
        />
        <v-combobox
            v-if="action.operation === 'set'"
            v-model="action.arguments[0]"
            @update:model-value="updateAction()"
            :items="props.refs"
            label="Reference"
            outlined
            dense
        />
        <v-text-field
            v-if="action.operation === 'set'"
            v-model="action.arguments[1]"
            @update:model-value="updateAction()"
            label="Value"
            outlined
            dense
        />
        <v-btn @click="deleteAction">Delete Action</v-btn>
    </div>
</template>
<script setup lang="ts">
import { ActionType } from "~~/interfaces/types";

const props = defineProps(["action", "refs"]);
const action: Ref<ActionType> = ref(props.action);
const emit = defineEmits(["update", "delete"]);
const allowedOperations = ["set", "jump", "send"];
function updateAction() {
    emit("update", action.value);
}

function deleteAction() {
    emit("delete");
}
</script>
<style scoped></style>
