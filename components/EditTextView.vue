<template>
    <v-card>
        <v-form>
            <v-card-subtitle>
                <v-row cols="12" md="6">
                    <v-col cols="6" md="6"> Reference: {{ view.ref }} </v-col>
                    <v-col cols="12" md="6"> Type: {{ view.type }} </v-col>
                </v-row>
            </v-card-subtitle>
            <v-row cols="12" md="6">
                <v-col cols="10" md="10">
                    <v-text-field
                        v-model="view.body.contents"
                        label="Contents"
                        auto-grow
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-card-actions>
                <v-switch
                    v-model="hasInput"
                    @update:model-value="updateHasInput()"
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
                    <div>
                        <v-row cols="12" md="6">
                            <v-col cols="12" md="6">
                                Type: {{ view.input?.type }}
                            </v-col>
                            <v-col cols="12" md="6">
                                Actions: {{ view.input?.actions }}
                            </v-col>
                            <v-col cols="12" md="6">
                                Validations: {{ view.input?.validations }}
                            </v-col>
                        </v-row>
                    </div>
                </div>
            </v-expand-transition>
        </v-form>
    </v-card>
</template>
<script setup lang="ts">
import { ViewType } from "~~/interfaces/types";

const { view } = defineProps<{
    view: ViewType;
}>();
const emit = defineEmits(["update"]);
const hasInput = ref(view.input != null);
const showInput = ref(false);
function updateHasInput() {
    if (hasInput) {
        view.input = {
            type: "text",
            actions: [],
            validations: []
        };
    } else {
        view.input = undefined;
    }
    emitToParent();
}

function emitToParent() {
    emit("update", view);
}
</script>
<style scoped></style>
