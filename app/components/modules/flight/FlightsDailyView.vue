<template>
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
              <CalendarComponent v-model="selectedDate" />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <CardDescription>
        {{ totalFlights }} vol{{ totalFlights > 1 ? 's' : '' }} programmé{{ totalFlights > 1 ? 's' : '' }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <Skeleton v-for="i in 5" :key="i" class="h-24 w-full" />
      </div>

      <!-- Vols groupés par statut -->
      <div v-else-if="flights.length > 0" class="space-y-6">
        <!-- Vols atterris -->
        <div v-if="landedFlights.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="h-2 w-2 rounded-full bg-green-500"></div>
            <h3 class="text-sm font-medium">Atterris ({{ landedFlights.length }})</h3>
          </div>
          <div class="space-y-2">
            <FlightDayCard 
              v-for="flight in landedFlights" 
              :key="flight.id" 
              :flight="flight"
              @view="$emit('view', flight)"
            />
          </div>
        </div>

        <!-- Vols prévus -->
        <div v-if="scheduledFlights.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="h-2 w-2 rounded-full bg-blue-500"></div>
            <h3 class="text-sm font-medium">Prévus ({{ scheduledFlights.length }})</h3>
          </div>
          <div class="space-y-2">
            <FlightDayCard 
              v-for="flight in scheduledFlights" 
              :key="flight.id" 
              :flight="flight"
              @view="$emit('view', flight)"
            />
          </div>
        </div>

        <!-- Vols QRF -->
        <div v-if="qrfFlights.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="h-2 w-2 rounded-full bg-gray-500"></div>
            <h3 class="text-sm font-medium">QRF ({{ qrfFlights.length }})</h3>
          </div>
          <div class="space-y-2">
            <FlightDayCard 
              v-for="flight in qrfFlights" 
              :key="flight.id" 
              :flight="flight"
              @view="$emit('view', flight)"
            />
          </div>
        </div>

        <!-- Vols annulés -->
        <div v-if="cancelledFlights.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="h-2 w-2 rounded-full bg-red-500"></div>
            <h3 class="text-sm font-medium">Annulés ({{ cancelledFlights.length }})</h3>
          </div>
          <div class="space-y-2">
            <FlightDayCard 
              v-for="flight in cancelledFlights" 
              :key="flight.id" 
              :flight="flight"
              @view="$emit('view', flight)"
            />
          </div>
        </div>

        <!-- Vols détournés -->
        <div v-if="divertedFlights.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="h-2 w-2 rounded-full bg-orange-500"></div>
            <h3 class="text-sm font-medium">Détournés ({{ divertedFlights.length }})</h3>
          </div>
          <div class="space-y-2">
            <FlightDayCard 
              v-for="flight in divertedFlights" 
              :key="flight.id" 
              :flight="flight"
              @view="$emit('view', flight)"
            />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-center">
        <Calendar class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-lg font-medium mb-2">Aucun vol ce jour</p>
        <p class="text-muted-foreground">Aucun vol programmé pour cette date</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-vue-next'
import type { Flight } from '~/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import FlightDayCard from '~/components/modules/flight/FlightDayCard.vue'

const props = defineProps<{
  initialDate?: Date
}>()

const emit = defineEmits<{
  view: [flight: Flight]
}>()

const flightsStore = useFlightsStore()

const selectedDate = ref(props.initialDate || new Date())
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

// Grouper les vols par statut
const landedFlights = computed(() => flights.value.filter(f => f.status === 'atteri'))
const scheduledFlights = computed(() => flights.value.filter(f => f.status === 'prevu'))
const qrfFlights = computed(() => flights.value.filter(f => f.status === 'qrf'))
const cancelledFlights = computed(() => flights.value.filter(f => f.status === 'annule'))
const divertedFlights = computed(() => flights.value.filter(f => f.status === 'detourne'))

const fetchFlightsForDate = async () => {
  loading.value = true
  const dateString = selectedDate.value.toISOString().split('T')[0] // YYYY-MM-DD
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
}

const nextDay = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + 1)
  selectedDate.value = newDate
}

const goToToday = () => {
  selectedDate.value = new Date()
}

watch(selectedDate, () => {
  fetchFlightsForDate()
}, { immediate: true })
</script>