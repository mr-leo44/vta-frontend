<template>
  <div class="space-y-6">
    <!-- Header avec navigation -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Vols du {{ formattedDate }}</CardTitle>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="previousDay">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" @click="goToToday">
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" @click="nextDay">
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" size="sm">
                  <Calendar class="h-4 w-4 mr-2" />
                  Sélectionner
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <CalendarComponent v-model="calendarValue" @update:model-value="handleCalendarChange" />
              </PopoverContent>
            </Popover>
            <Separator orientation="vertical" class="h-6" />
            <Button variant="outline" size="sm" @click="printTable" :disabled="flights.length === 0">
              <Printer class="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>
        <CardDescription>
          {{ totalFlights }} vol{{ totalFlights > 1 ? 's' : '' }} programmé{{ totalFlights > 1 ? 's' : '' }}
        </CardDescription>
      </CardHeader>
    </Card>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-64 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <!-- Tableaux par régime -->
    <div v-else-if="flights.length > 0" class="space-y-6">
      <!-- VOLS DOMESTIQUES -->
      <Card v-if="domesticFlights.length > 0">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-blue-500"></div>
            Vols Domestiques ({{ domesticFlights.length }})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FlightRegimeTable :flights="domesticFlights" regime="domestic" />
        </CardContent>
      </Card>

      <!-- VOLS INTERNATIONAUX -->
      <Card v-if="internationalFlights.length > 0">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-purple-500"></div>
            Vols Internationaux ({{ internationalFlights.length }})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FlightRegimeTable :flights="internationalFlights" regime="international" />
        </CardContent>
      </Card>
    </div>

    <!-- Empty state -->
    <Card v-else>
      <CardContent class="flex flex-col items-center justify-center py-12">
        <Calendar class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-lg font-medium mb-2">Aucun vol ce jour</p>
        <p class="text-muted-foreground">Aucun vol programmé pour cette date</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer } from 'lucide-vue-next'
import type { Flight } from '~/types/api'
import { type DateValue, CalendarDate, today, getLocalTimeZone } from '@internationalized/date'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import FlightRegimeTable from '@/components/modules/flight/FlightRegimeTable.vue'

const props = defineProps<{
  initialDate?: Date
}>()

const flightsStore = useFlightsStore()

// Convertir Date en CalendarDate pour le composant Calendar
const dateToCalendarDate = (date: Date): CalendarDate => {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
}

const calendarDateToDate = (calendarDate: DateValue): Date => {
  if ('year' in calendarDate && 'month' in calendarDate && 'day' in calendarDate) {
    return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day)
  }
  return new Date()
}

const selectedDate = ref(props.initialDate || new Date())
const calendarValue = ref<DateValue>(dateToCalendarDate(selectedDate.value))
const flights = ref<Flight[]>([])
const loading = ref(false)

const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const totalFlights = computed(() => flights.value.length)

// Séparer par régime
const domesticFlights = computed(() => {
  return flights.value.filter(f => f.flight_regime === 'domestic')
})

const internationalFlights = computed(() => {
  return flights.value.filter(f => f.flight_regime === 'international')
})

const fetchFlightsForDate = async () => {
  loading.value = true
  const dateString = selectedDate.value.toISOString().split('T')[0]
  const result = await flightsStore.fetchFlightsByDate(dateString)
  if (result.success) {
    flights.value = result.data || []
  }
  loading.value = false
}

const previousDay = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() - 1)
  selectedDate.value = newDate
  calendarValue.value = dateToCalendarDate(newDate)
}

const nextDay = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + 1)
  selectedDate.value = newDate
  calendarValue.value = dateToCalendarDate(newDate)
}

const goToToday = () => {
  selectedDate.value = new Date()
  calendarValue.value = dateToCalendarDate(selectedDate.value)
}

const handleCalendarChange = (date: DateValue) => {
  selectedDate.value = calendarDateToDate(date)
}

const printTable = () => {
  window.print()
}

watch(selectedDate, () => {
  fetchFlightsForDate()
}, { immediate: true })
</script>