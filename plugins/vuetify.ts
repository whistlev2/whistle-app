import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; //TODO: Only import necessary components
import * as directives from 'vuetify/directives'; //TODO: Only import necessary directives

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        components,
        directives,
    });

    nuxtApp.vueApp.use(vuetify);
})