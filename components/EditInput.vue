<template>
    <div>
        <template v-if="input">
            <v-select
                v-model="input.type"
                :items="allowedTypes"
                label="Type"
                @update:model-value="emitToParent()"
                outlined
                dense
            />
            <div v-if="input.type == 'multiple'">
                <div v-for="(option, index) in input.options">
                    <v-text-field
                        v-model="input.options[index]"
                        :label="`Option ${index + 1}`"
                        @update:model-value="emitToParent()"
                        outlined
                        dense
                    />
                    <v-btn @click="deleteOption(index)">Delete</v-btn>
                </div>
                <v-btn @click="addOption()">Add Option</v-btn>
                <v-divider />
                <v-switch
                    v-model="input.allowMultiple"
                    label="Allow multiple selections"
                    @update:model-value="emitToParent()"
                    dense
                />
                <v-switch
                    v-model="input.allowOther"
                    label="Allow other"
                    dense
                    @update:model-value="emitToParent()"
                />
            </div>
            <v-divider />
            Actions:
            <EditActions
                :actions="input.actions"
                :refs="props.refs"
                @update="(value: ActionType[]) => updateActions(value)"
            />
        </template>
    </div>
</template>
<script setup lang="ts">
import { ActionType, InputType } from "~~/interfaces/types";

const props = defineProps(["input", "refs"]);
const input: Ref<InputType> = ref(props.input);
const allowedTypes = ["text", "multiple"];
const emit = defineEmits(["update"]);
function addOption() {
    input.value.options?.push("");
    emitToParent();
}

function deleteOption(index: number) {
    input.value.options?.splice(index, 1);
    emitToParent();
}

function updateActions(actions: ActionType[]) {
    input.value.actions = actions;
    emitToParent();
}

function emitToParent() {
    emit("update", input.value);
}
</script>
<style scoped></style>
