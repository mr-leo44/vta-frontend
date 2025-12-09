<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-5xl max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Fiche Journalière de Trafic</DialogTitle>
        <DialogDescription>
          Statistiques des vols atterris pour le {{ formatDisplayDate(selectedDate) }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Sélection de la date et bouton actualiser -->
        <div class="flex gap-4">
          <div class="flex-1 space-y-2">
            <Label for="daily-date">Date</Label>
            <div class="flex gap-2">
              <Input 
                id="daily-date" 
                type="date" 
                v-model="selectedDate"
                class="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                @click="loadData"
                :disabled="isLoading || !selectedDate"
                title="Actualiser les données"
              >
                <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                <RefreshCw v-else class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div class="flex-1 space-y-2">
            <Label for="export-format">Format d'export</Label>
            <Select v-model="exportFormat">
              <SelectTrigger id="export-format">
                <SelectValue placeholder="Sélectionner un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div class="flex items-center gap-2">
                    <FileSpreadsheet class="h-4 w-4 text-green-600" />
                    <span>Excel (.xlsx)</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div class="flex items-center gap-2">
                    <FileText class="h-4 w-4 text-red-600" />
                    <span>PDF (.pdf)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Message de chargement -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
          <span class="ml-2">Chargement des données...</span>
        </div>

        <!-- Tabs par régime -->
        <Tabs v-else v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="domestic">
              <Home class="h-4 w-4 mr-2" />
              Domestique
            </TabsTrigger>
            <TabsTrigger value="international">
              <Globe class="h-4 w-4 mr-2" />
              International
            </TabsTrigger>
          </TabsList>

          <!-- Tab Domestique -->
          <TabsContent value="domestic" class="space-y-4 mt-4">
            <ScrollArea class="h-[400px] rounded-md border">
              <div class="p-4 space-y-6">
                <DailyFlightTable
                  title="Commercial"
                  :icon="Plane"
                  icon-color="text-blue-600"
                  :flights="domesticCommercial"
                  :totals="domesticCommercialTotals"
                  total-label="Total Commercial"
                  total-row-class="bg-blue-50"
                  empty-message="Aucun vol commercial domestique atterri pour cette date"
                />

                <DailyFlightTable
                  title="Non-Commercial"
                  :icon="PlaneTakeoff"
                  icon-color="text-gray-600"
                  :flights="domesticNonCommercial"
                  :totals="domesticNonCommercialTotals"
                  total-label="Total Non-Commercial"
                  total-row-class="bg-gray-50"
                  empty-message="Aucun vol non-commercial domestique atterri pour cette date"
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <!-- Tab International -->
          <TabsContent value="international" class="space-y-4 mt-4">
            <ScrollArea class="h-[400px] rounded-md border">
              <div class="p-4 space-y-6">
                <DailyFlightTable
                  title="Commercial"
                  :icon="Plane"
                  icon-color="text-blue-600"
                  :flights="internationalCommercial"
                  :totals="internationalCommercialTotals"
                  total-label="Total Commercial"
                  total-row-class="bg-blue-50"
                  empty-message="Aucun vol commercial international atterri pour cette date"
                  is-international
                />

                <DailyFlightTable
                  title="Non-Commercial"
                  :icon="PlaneTakeoff"
                  icon-color="text-gray-600"
                  :flights="internationalNonCommercial"
                  :totals="internationalNonCommercialTotals"
                  total-label="Total Non-Commercial"
                  total-row-class="bg-gray-50"
                  empty-message="Aucun vol non-commercial international atterri pour cette date"
                  is-international
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">
          Fermer
        </Button>
        <Button @click="handleExport" :disabled="!selectedDate || !exportFormat || loading">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          <Download v-else class="mr-2 h-4 w-4" />
          Exporter {{ exportFormat === 'pdf' ? 'PDF' : 'Excel' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  RefreshCw,
  Loader2,
  FileSpreadsheet,
  FileText,
  Home,
  Globe,
  Plane,
  PlaneTakeoff,
  Download
} from 'lucide-vue-next'
import DailyFlightTable from '@/components/modules/report/traffic/DailyFlightTable.vue'
import { useFlightsStore } from '@/stores/flights'

interface Props {
  open: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'export': [params: { date: string; format: string }]
}>()

const { success, error } = useToast()
const flightsStore = useFlightsStore()

const activeTab = ref('domestic')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const exportFormat = ref('')
const isLoading = ref(false)

// Données des vols
const domesticCommercial = ref([])
const domesticNonCommercial = ref([])
const internationalCommercial = ref([])
const internationalNonCommercial = ref([])

// Totaux
const domesticCommercialTotals = computed(() => {
  return domesticCommercial.value.reduce((acc, flight) => ({
    passengers: acc.passengers + (flight.passengers || 0),
    fret: acc.fret + (flight.fret || 0),
    excedent: acc.excedent + (flight.excedent || 0)
  }), { passengers: 0, fret: 0, excedent: 0 })
})

const domesticNonCommercialTotals = computed(() => {
  return domesticNonCommercial.value.reduce((acc, flight) => ({
    passengers: acc.passengers + (flight.passengers || 0),
    fret: acc.fret + (flight.fret || 0),
    excedent: acc.excedent + (flight.excedent || 0)
  }), { passengers: 0, fret: 0, excedent: 0 })
})

const internationalCommercialTotals = computed(() => {
  return internationalCommercial.value.reduce((acc, flight) => ({
    passengers: acc.passengers + (flight.passengers || 0),
    fret_arrivee: acc.fret_arrivee + (flight.fret_arrivee || 0),
    fret_depart: acc.fret_depart + (flight.fret_depart || 0),
    excedent_arrivee: acc.excedent_arrivee + (flight.excedent_arrivee || 0),
    excedent_depart: acc.excedent_depart + (flight.excedent_depart || 0)
  }), { passengers: 0, fret_arrivee: 0, fret_depart: 0, excedent_arrivee: 0, excedent_depart: 0 })
})

const internationalNonCommercialTotals = computed(() => {
  return internationalNonCommercial.value.reduce((acc, flight) => ({
    passengers: acc.passengers + (flight.passengers || 0),
    fret_arrivee: acc.fret_arrivee + (flight.fret_arrivee || 0),
    fret_depart: acc.fret_depart + (flight.fret_depart || 0),
    excedent_arrivee: acc.excedent_arrivee + (flight.excedent_arrivee || 0),
    excedent_depart: acc.excedent_depart + (flight.excedent_depart || 0)
  }), { passengers: 0, fret_arrivee: 0, fret_depart: 0, excedent_arrivee: 0, excedent_depart: 0 })
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const formatDisplayDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadData = async () => {
  if (!selectedDate.value) {
    error('Erreur', 'Veuillez sélectionner une date')
    return
  }

  isLoading.value = true

  // Réinitialiser
  domesticCommercial.value = []
  domesticNonCommercial.value = []
  internationalCommercial.value = []
  internationalNonCommercial.value = []

  try {
    const result = await flightsStore.fetchFlightsByDate(selectedDate.value)

    if (!result.success) {
      error('Erreur', result.message || 'Impossible de charger les données')
      return
    }

    const flights = result.data || []
    const landedFlights = flights.filter(f => f.status === 'atteri')

    // Séparer par régime et nature
    domesticCommercial.value = landedFlights
      .filter(f => f.flight_regime === 'domestic' && f.flight_nature === 'commercial')
      .map(f => ({
        id: f.id,
        immatriculation: f.aircraft?.immatriculation || 'N/A',
        operator: f.operator?.name || 'N/A',
        passengers: f.statistics?.passengers_count || 0,
        fret: f.statistics?.fret_count?.departure || 0,
        excedent: f.statistics?.excedents?.departure || 0
      }))

    domesticNonCommercial.value = landedFlights
      .filter(f => f.flight_regime === 'domestic' && f.flight_nature === 'non_commercial')
      .map(f => ({
        id: f.id,
        immatriculation: f.aircraft?.immatriculation || 'N/A',
        operator: f.operator?.name || 'N/A',
        passengers: f.statistics?.passengers_count || 0,
        fret: f.statistics?.fret_count?.departure || 0,
        excedent: f.statistics?.excedents?.departure || 0
      }))

    internationalCommercial.value = landedFlights
      .filter(f => f.flight_regime === 'international' && f.flight_nature === 'commercial')
      .map(f => ({
        id: f.id,
        immatriculation: f.aircraft?.immatriculation || 'N/A',
        operator: f.operator?.name || 'N/A',
        passengers: f.statistics?.passengers_count || 0,
        fret_arrivee: f.statistics?.fret_count?.arrival || 0,
        fret_depart: f.statistics?.fret_count?.departure || 0,
        excedent_arrivee: f.statistics?.excedents?.arrival || 0,
        excedent_depart: f.statistics?.excedents?.departure || 0
      }))

    internationalNonCommercial.value = landedFlights
      .filter(f => f.flight_regime === 'international' && f.flight_nature === 'non_commercial')
      .map(f => ({
        id: f.id,
        immatriculation: f.aircraft?.immatriculation || 'N/A',
        operator: f.operator?.name || 'N/A',
        passengers: f.statistics?.passengers_count || 0,
        fret_arrivee: f.statistics?.fret_count?.arrival || 0,
        fret_depart: f.statistics?.fret_count?.departure || 0,
        excedent_arrivee: f.statistics?.excedents?.arrival || 0,
        excedent_depart: f.statistics?.excedents?.departure || 0
      }))

    const totalFlights = landedFlights.length
    if (totalFlights === 0) {
      error('Aucun vol', 'Aucun vol atterri trouvé pour cette date')
    } else {
      success('Données chargées', `${totalFlights} vol(s) atterri(s) trouvé(s) pour cette date`)
    }
  } catch (err: any) {
    error('Erreur', err.message || 'Impossible de charger les données')
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  emit('update:open', false)
}

const handleExport = () => {
  emit('export', {
    date: selectedDate.value,
    format: exportFormat.value
  })
}

// Watcher pour charger les données à l'ouverture
watch(() => props.open, async (newValue) => {
  if (newValue) {
    selectedDate.value = new Date().toISOString().split('T')[0]
    await nextTick()
    loadData()
  } else {
    // Reset au fermeture
    exportFormat.value = ''
  }
})

// Watcher pour recharger quand la date change
watch(() => selectedDate.value, (newDate, oldDate) => {
  if (isOpen.value && newDate && newDate !== oldDate) {
    loadData()
  }
})
</script>