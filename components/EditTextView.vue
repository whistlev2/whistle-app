<template>
    <v-card color="#d0ecf2">
        <v-form>
            <v-card-subtitle>
                <v-row cols="12" md="6">
                    <v-col cols="6" md="6"> Reference: {{ view.ref }} </v-col>
                    <v-col cols="12" md="6"> Type: {{ view.type }} </v-col>
                </v-row>
            </v-card-subtitle>
            <v-row cols="12" md="6">
                <v-col cols="10" md="10">
                    <v-textarea
                        v-model="view.body.contents"
                        label="Contents"
                        auto-grow
                        @update:model-value="($event) => emitToParent()"
                    ></v-textarea>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <h4>Show Conditions:</h4>
                </v-col>
            </v-row>
            <v-row cols="12" md="6">
                <v-col cols="10" md="10">
                    <EditConditions
                        :conditions="view.show"
                        :refs="refs"
                        @update="updateConditions"
                    />
                </v-col>
            </v-row>
            <v-card-actions>
                <v-switch
                    v-model="hasInput"
                    @update:model-value="emitToParent()"
                    label="Has input field"
                />
                <v-spacer />
                <v-btn
                    v-if="hasInput"
                    :icon="showInput ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    @click="showInput = !showInput"
                ></v-btn>
            </v-card-actions>
            <v-expand-transition>
                <div v-show="showInput">
                    <v-divider></v-divider>
                    <EditInput
                        :input="view.input"
                        :refs="refs"
                        @update="(value: InputType) => updateInput(value)"
                    />
                </div>
            </v-expand-transition>
        </v-form>
    </v-card>
</template>
<script setup lang="ts">
import { ConditionType, InputType, ViewType } from "~~/interfaces/types";

const props = defineProps<{
    view: ViewType;
    refs: string[];
}>();
const view: Ref<ViewType> = ref(props.view);
const emit = defineEmits(["update"]);
const hasInput = ref(view.value.input != null);
const showInput = ref(false);

function updateInput(input: InputType) {
    view.value.input = input;
    emitToParent();
}

function updateHasInput() {
    if (hasInput) {
        view.value.input = {
            type: "text",
            actions: [],
            validations: []
        };
    } else {
        view.value.input = undefined;
    }
    emitToParent();
}

function updateConditions(conditions: ConditionType[]) {
    view.value.show = conditions;
    emitToParent();
}

function emitToParent() {
    emit("update", view.value);
}
</script>
<style scoped></style>
