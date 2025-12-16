<template>
  <transition
    name="collapse"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <div v-if="open" class="overflow-hidden">
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
}

defineProps<Props>()

const enter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.opacity = '0'
}

const afterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.opacity = '1'
  element.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  
  setTimeout(() => {
    element.style.height = 'auto'
  }, 300)
}

const leave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  
  setTimeout(() => {
    element.style.height = '0'
    element.style.opacity = '0'
  }, 10)
}

const afterLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = ''
  element.style.opacity = ''
  element.style.transition = ''
}
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s ease, opacity 0.3s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  height: 0;
  opacity: 0;
}
</style>