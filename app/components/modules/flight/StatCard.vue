<template>
  <Card :class="[
    'border-2 hover:shadow-lg transition-shadow',
    colorClasses[color as keyof typeof colorClasses]?.card || colorClasses.blue.card
  ]">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-semibold" :class="colorClasses[color as keyof typeof colorClasses]?.title || colorClasses.blue.title">
        {{ title }}
      </CardTitle>
      <div :class="['h-10 w-10 rounded-lg flex items-center justify-center shadow-md', colorClasses[color as keyof typeof colorClasses]?.icon || colorClasses.blue.icon]">
        <component :is="iconComponent" class="h-5 w-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div :class="['text-3xl font-bold', colorClasses[color as keyof typeof colorClasses]?.value || colorClasses.blue.value]">
        {{ value }}
      </div>
      <p :class="['text-xs mt-1 flex items-center gap-1', colorClasses[color as keyof typeof colorClasses]?.subtitle || colorClasses.blue.subtitle]">
        <component :is="iconComponent" class="h-3 w-3" />
        {{ subtitle }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  AlertCircle,
  Users,
  Zap
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  subtitle?: string
  icon: 'plane' | 'plane-landing' | 'clock' | 'alert-circle' | 'users' | 'zap'
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  subtitle: ''
})

const colorClasses = {
  blue: {
    card: 'bg-linear-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800',
    title: 'text-blue-900 dark:text-blue-100',
    icon: 'bg-blue-500 dark:bg-blue-600',
    value: 'text-blue-900 dark:text-blue-100',
    subtitle: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    card: 'bg-linear-to-br from-green-50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800',
    title: 'text-green-900 dark:text-green-100',
    icon: 'bg-green-500 dark:bg-green-600',
    value: 'text-green-900 dark:text-green-100',
    subtitle: 'text-green-600 dark:text-green-400'
  },
  purple: {
    card: 'bg-linear-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800',
    title: 'text-purple-900 dark:text-purple-100',
    icon: 'bg-purple-500 dark:bg-purple-600',
    value: 'text-purple-900 dark:text-purple-100',
    subtitle: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    card: 'bg-linear-to-br from-orange-50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800',
    title: 'text-orange-900 dark:text-orange-100',
    icon: 'bg-orange-500 dark:bg-orange-600',
    value: 'text-orange-900 dark:text-orange-100',
    subtitle: 'text-orange-600 dark:text-orange-400'
  },
  cyan: {
    card: 'bg-linear-to-br from-cyan-50 to-cyan-100/30 dark:from-cyan-950/20 dark:to-cyan-900/10 border-cyan-200 dark:border-cyan-800',
    title: 'text-cyan-900 dark:text-cyan-100',
    icon: 'bg-cyan-500 dark:bg-cyan-600',
    value: 'text-cyan-900 dark:text-cyan-100',
    subtitle: 'text-cyan-600 dark:text-cyan-400'
  }
}

const iconMap = {
  'plane': PlaneTakeoff,
  'plane-landing': PlaneLanding,
  'clock': Clock,
  'alert-circle': AlertCircle,
  'users': Users,
  'zap': Zap
}

const iconComponent = computed(() => {
  return iconMap[props.icon] || PlaneTakeoff
})
</script>
