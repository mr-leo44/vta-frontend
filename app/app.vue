import { NuxtPage } from '../.nuxt/components';
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script>
import { NuxtLoadingIndicator } from '#components';
</script>