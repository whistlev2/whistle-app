<template>
    <div>
        <EditAction
            v-for="(action, index) in actions"
            :key="index"
            :action="action"
            :refs="props.refs"
            @update="(value: ActionType) => updateAction(index, value)"
            @delete="(_: any) => deleteAction(index)"
        />
        <v-btn @click="addAction">Add Action</v-btn>
    </div>
</template>
<script setup lang="ts">
import { ActionType } from "~~/interfaces/types";

const props = defineProps(["actions", "refs"]);
const actions: Ref<ActionType[]> = ref(props.actions);
const emit = defineEmits(["update"]);

function updateAction(index: number, value: ActionType) {
    actions.value[index] = value;
    emit("update", actions.value);
}

function addAction() {
    actions.value.push({
        operation: "set",
        arguments: ["", ""]
    });
    emit("update", actions.value);
}

function deleteAction(index: number) {
    actions.value.splice(index, 1);
    emit("update", actions.value);
}
</script>
<style scoped></style>
