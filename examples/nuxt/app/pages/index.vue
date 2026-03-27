<template>
  <ContentRenderer v-if="page" :value="page" />
</template>

<script setup lang="ts">
const { data: page } = await useAsyncData('home', () => queryCollection('content').path('/').first())
</script>
