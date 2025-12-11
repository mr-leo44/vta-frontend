<template>
    <Toaster position="top-right" :duration="5000" rich-colors closeButton />
</template>
<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'
</script>