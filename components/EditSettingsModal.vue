<template>
    <v-dialog
        v-model="show"
        fullscreen
        :scrim="false"
        transition="dialog-bottom-transition"
    >
        <v-card>
            <v-toolbar dark color="primary">
                <v-btn icon dark @click="showSettings(false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Settings</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn variant="text" @click="saveSettings()">
                        <v-icon>mdi-content-save</v-icon> Save
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-form>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-switch
                            v-model="settings.published"
                            @update:model-value="update()"
                            label="Published?"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="settings.errorMessage"
                            @update:model-value="update()"
                            label="Error message"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="settings.parsingErrorMessage"
                            @update:model-value="update()"
                            label="Parsing rror message"
                        />
                    </v-col>
                </v-row>
                <v-row cols="12" md="6">
                    <v-col cols="12" md="6">
                        <EditTextView
                            v-if="settings.finalView.type == 'text'"
                            :view="settings.finalView"
                            @update="(_: any, value: ViewType) => updateFinalView(value)"
                        />
                    </v-col>
                </v-row>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { MessagingSettingsType, ViewType } from "~~/interfaces/types";
const { settings } = defineProps<{
    settings: MessagingSettingsType;
}>();
const show = ref(false);
const emit = defineEmits(["save", "update"]);
const showSettings = (value: boolean) => {
    console.log("SHOWING");
    show.value = value;
};

defineExpose({
    showSettings
});
//TODO: Add settings for web

function saveSettings() {
    emit("save");
}

function updateFinalView(value: ViewType) {
    settings.finalView = value;
    update();
}

function update() {
    emit("update", settings);
}
</script>

<style scoped></style>
