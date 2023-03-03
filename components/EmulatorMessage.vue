<template>
    <div>
        <VCard
            :class="message.incoming ? 'incoming' : 'outgoing'"
            :text="message.body"
        />
        <br />
    </div>
</template>

<script setup>
const { message } = defineProps(["message"]);
</script>

<style scoped>
.outgoing {
    background-color: #4bb868;
    border-radius: 20px 20px 0 20px;
    text-align: left;
    width: 80%;
    margin-left: 10px;
}
.incoming {
    background-color: #adc9b5;
    border-radius: 20px 20px 20px 0;
    text-align: right;
    width: 80%;
    margin-right: 10px;
}
</style>
