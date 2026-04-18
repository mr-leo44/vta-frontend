<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-start gap-3">
        <div
          class="h-10 w-10 rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shrink-0 mt-0.5">
          <Upload class="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Import de données</h1>
          <p class="text-sm text-muted-foreground mt-0.5">
            Importez des exploitants, aéronefs ou types depuis un fichier CSV ou Excel.
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" class="gap-2 shrink-0" @click="downloadTemplate">
        <FileDown class="h-4 w-4" />
        Modèle CSV
      </Button>
    </div>

    <!-- Layout 2 colonnes -->
    <div class="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

      <!-- ── Colonne principale : stepper ── -->
      <div class="space-y-3">

        <!-- ÉTAPE 1 — Type -->
        <div :class="cardClass(1)">
          <!-- En-tête étape -->
          <div class="flex items-center gap-3">
            <div :class="badgeClass(1)">1</div>
            <div class="flex-1">
              <p class="font-semibold text-sm">Que souhaitez-vous importer ?</p>
              <p v-if="currentStep > 1" class="text-xs text-muted-foreground mt-0.5">
                {{ currentType?.label }}
              </p>
            </div>
            <button v-if="currentStep > 1" type="button" class="text-xs text-primary hover:underline"
              @click="goToStep(1)">
              Modifier
            </button>
          </div>

          <!-- Corps de l'étape 1 -->
          <div v-if="currentStep === 1" class="mt-4 grid grid-cols-3 gap-3">
            <button v-for="type in importTypes" :key="type.id" type="button" @click="selectType(type.id)" :class="[
              'relative rounded-xl border-2 p-4 text-left transition-all duration-150',
              selectedType === type.id
                ? type.activeClass
                : 'border-border hover:border-muted-foreground/40 hover:bg-muted/40'
            ]">
              <div class="flex mb-3 justify-between">
                <div :class="['h-9 w-9 rounded-lg flex items-center justify-center', type.iconBg]">
                  <component :is="type.icon" :class="['h-5 w-5', type.iconColor]" />
                </div>
                <!-- Checkmark sélectionné -->
                <div v-if="selectedType === type.id"
                  class="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check class="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
              <p class="font-semibold text-sm">{{ type.label }}</p>
              <p class="text-xs text-muted-foreground mt-0.5 leading-tight">{{ type.description }}</p>
            </button>
          </div>
        </div>

        <!-- ÉTAPE 2 — Fichier -->
        <div :class="cardClass(2)">
          <div class="flex items-center gap-3">
            <div :class="badgeClass(2)">2</div>
            <div class="flex-1">
              <p class="font-semibold text-sm">Choisissez votre fichier</p>
              <p v-if="currentStep > 2 && file" class="text-xs text-muted-foreground mt-0.5">
                {{ file.name }} · {{ formatFileSize(file.size) }}
              </p>
            </div>
            <button v-if="currentStep > 2 && file" type="button" class="text-xs text-primary hover:underline"
              @click="goToStep(2)">
              Modifier
            </button>
          </div>

          <div v-if="currentStep === 2" class="mt-4 space-y-4">
            <!-- Dropzone -->
            <div :class="[
              'rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : file
                  ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                  : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20'
            ]" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop" @click="fileInputRef?.click()">
              <input ref="fileInputRef" type="file" :accept="acceptedFormats" class="hidden"
                @change="handleFileSelect" />

              <!-- Sans fichier -->
              <div v-if="!file" class="flex flex-col items-center justify-center py-10 gap-3 text-center px-6">
                <div class="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                  <Upload class="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p class="font-semibold text-sm">Déposer un fichier ici</p>
                  <p class="text-xs text-muted-foreground mt-0.5">ou cliquer pour parcourir</p>
                </div>
                <div class="flex gap-2">
                  <span class="text-xs px-2 py-0.5 rounded-full border font-mono bg-background">.csv</span>
                  <span class="text-xs px-2 py-0.5 rounded-full border font-mono bg-background">.xlsx</span>
                  <span class="text-xs px-2 py-0.5 rounded-full border font-mono bg-background">.xls</span>
                </div>
              </div>

              <!-- Fichier sélectionné -->
              <div v-else class="flex items-center gap-4 py-4 px-5" @click.stop>
                <div
                  class="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <component :is="fileExtension === 'csv' ? FileText : FileSpreadsheet"
                    class="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate">{{ file.name }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ formatFileSize(file.size) }} · {{ fileExtension.toUpperCase() }}
                  </p>
                </div>
                <button type="button" class="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  @click.stop="clearFile">
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Options CSV -->
            <div v-if="file && fileExtension === 'csv'"
              class="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border">
              <div class="space-y-1.5">
                <Label class="text-xs text-muted-foreground">Séparateur</Label>
                <Select v-model="csvOptions.delimiter">
                  <SelectTrigger class="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Virgule ,</SelectItem>
                    <SelectItem value=";">Point-virgule ;</SelectItem>
                    <SelectItem value="	">Tabulation</SelectItem>
                    <SelectItem value="|">Pipe |</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs text-muted-foreground">Encodage</Label>
                <Select v-model="csvOptions.encoding">
                  <SelectTrigger class="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTF-8">UTF-8</SelectItem>
                    <SelectItem value="ISO-8859-1">Latin-1</SelectItem>
                    <SelectItem value="Windows-1252">Windows-1252</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex items-end pb-0.5 gap-2">
                <Switch id="csv-header" v-model:checked="csvOptions.hasHeader" />
                <Label for="csv-header" class="text-xs cursor-pointer leading-tight">
                  1ère ligne = en-têtes
                </Label>
              </div>
            </div>

            <!-- Options Excel -->
            <div v-if="file && (fileExtension === 'xlsx' || fileExtension === 'xls')"
              class="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/40 border">
              <div class="space-y-1.5">
                <Label class="text-xs text-muted-foreground">Feuille</Label>
                <Select v-model="excelOptions.sheetName">
                  <SelectTrigger class="h-8 text-xs">
                    <SelectValue placeholder="Première feuille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__first__">Première (auto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex items-end pb-0.5 gap-2">
                <Switch id="xl-header" v-model:checked="excelOptions.hasHeader" />
                <Label for="xl-header" class="text-xs cursor-pointer leading-tight">
                  1ère ligne = en-têtes
                </Label>
              </div>
            </div>

            <!-- CTA continuer -->
            <Button class="w-full gap-2" :disabled="!file" @click="goToStep(3)">
              Continuer
              <ArrowRight class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- ÉTAPE 3 — Lancer -->
        <div :class="cardClass(3)">
          <div class="flex items-center gap-3">
            <div :class="badgeClass(3)">3</div>
            <p class="font-semibold text-sm">Lancer l'import</p>
          </div>

          <div v-if="currentStep === 3" class="mt-4 space-y-4">

            <!-- Pas encore importé : récap + bouton -->
            <template v-if="!importResult">
              <div class="rounded-xl border bg-muted/30 divide-y">
                <div class="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span class="text-muted-foreground">Type</span>
                  <div class="flex items-center gap-2 font-medium">
                    <div :class="['h-5 w-5 rounded flex items-center justify-center', currentType?.iconBg]">
                      <component :is="currentType?.icon" :class="['h-3 w-3', currentType?.iconColor]" />
                    </div>
                    {{ currentType?.label }}
                  </div>
                </div>
                <div class="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span class="text-muted-foreground">Fichier</span>
                  <span class="font-mono text-xs font-medium truncate max-w-[200px]">{{ file?.name
                  }}</span>
                </div>
                <div class="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span class="text-muted-foreground">Format</span>
                  <span class="font-mono text-xs uppercase font-medium">{{ fileExtension }}</span>
                </div>
                <div v-if="fileExtension === 'csv'" class="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span class="text-muted-foreground">Séparateur</span>
                  <span class="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">
                    {{ csvOptions.delimiter === '\t' ? 'TAB' : csvOptions.delimiter }}
                  </span>
                </div>
              </div>

              <Button
                class="w-full h-11 gap-2 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 font-semibold"
                :disabled="importing" @click="handleImport">
                <Loader2 v-if="importing" class="h-4 w-4 animate-spin" />
                <Upload v-else class="h-4 w-4" />
                {{ importing ? 'Import en cours...' : `Importer les ${currentTypeLabel}` }}
              </Button>
            </template>

            <!-- Résultats -->
            <template v-else>
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-xl border bg-green-50 dark:bg-green-950/30 p-3 text-center">
                  <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{
                    importResult.created }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">Créés</p>
                </div>
                <div class="rounded-xl border bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
                  <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{
                    importResult.updated }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">Mis à jour</p>
                </div>
                <div class="rounded-xl border bg-red-50 dark:bg-red-950/30 p-3 text-center">
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ importResult.failed
                  }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">Échecs</p>
                </div>
              </div>

              <!-- Succès total -->
              <div v-if="importResult.errors.length === 0"
                class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-xl p-3 border border-green-200 dark:border-green-800">
                <CheckCircle2 class="h-4 w-4 shrink-0" />
                Import réussi — aucune erreur.
              </div>

              <!-- Erreurs -->
              <div v-else class="space-y-2">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Détail des erreurs
                </p>
                <div class="max-h-44 overflow-y-auto space-y-1.5 rounded-xl border p-3 bg-red-50/50 dark:bg-red-950/10">
                  <div v-for="err in importResult.errors" :key="err.row" class="flex items-start gap-2 text-xs">
                    <span class="font-mono font-bold text-red-500 shrink-0">L.{{ err.row }}</span>
                    <span class="text-red-700 dark:text-red-300">{{ err.message }}</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" class="w-full gap-2" @click="resetImport">
                <RefreshCw class="h-4 w-4" />
                Nouvel import
              </Button>
            </template>
          </div>
        </div>
      </div>

      <!-- ── Colonne droite : aide contextuelle ── -->
      <div class="space-y-4 lg:sticky lg:top-6">

        <!-- Colonnes requises -->
        <Card class="border-2">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm flex items-center gap-2">
              <Table2 class="h-4 w-4 text-primary" />
              Colonnes attendues
              <span class="ml-auto text-xs font-normal px-2 py-0.5 rounded-full border bg-muted">
                {{ currentType?.label }}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0 space-y-3">
            <div v-for="col in currentColumns" :key="col.name">
              <div class="flex items-center gap-2">
                <span :class="[
                  'text-[10px] font-bold px-1.5 py-0.5 rounded',
                  col.required
                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                    : 'bg-muted text-muted-foreground'
                ]">
                  {{ col.required ? 'REQ' : 'OPT' }}
                </span>
                <span class="font-mono text-xs font-semibold">{{ col.name }}</span>
              </div>
              <p class="text-xs text-muted-foreground ml-9 mt-0.5 leading-relaxed">
                {{ col.description }}
              </p>
              <p v-if="col.example" class="text-[11px] text-muted-foreground/60 ml-9 font-mono">
                ex: {{ col.example }}
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Historique -->
        <Card class="border-2">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm flex items-center gap-2">
              <History class="h-4 w-4 text-primary" />
              Imports récents
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <p v-if="importHistory.length === 0" class="text-xs text-muted-foreground text-center py-3">
              Aucun import effectué
            </p>
            <div v-else class="space-y-3">
              <div v-for="entry in importHistory" :key="entry.id" class="flex items-center gap-2.5">
                <div :class="['h-7 w-7 rounded-lg flex items-center justify-center shrink-0', entry.typeColor]">
                  <component :is="entry.typeIcon" class="h-3.5 w-3.5" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium truncate">{{ entry.filename }}</p>
                  <p class="text-[11px] text-muted-foreground">{{ entry.date }}</p>
                </div>
                <span class="text-xs font-bold text-green-600 shrink-0">+{{ entry.created }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Upload, FileDown, FileText, FileSpreadsheet, Check, X,
  Loader2, Table2, CheckCircle2, RefreshCw, History,
  Building2, Plane, Layers, ArrowRight
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

useHead({
  title: 'Imports | VTA',
  meta: [
    { name: 'description', content: 'Importation de données en masse pour exploitants, aéronefs et vols.' }
  ]
})

definePageMeta({ middleware: 'auth' })

// ── Stores ───────────────────────────────────────────────────────
const operatorsStore = useOperatorsStore()
const aircraftsStore = useAircraftsStore()
const aircraftTypesStore = useAircraftTypesStore()
const { success: showSuccess, error: showError } = useToast()

// ── Stepper ──────────────────────────────────────────────────────
const currentStep = ref(1)

const goToStep = (n: number) => { currentStep.value = n }

// Classes de la carte d'étape — pas de pointer-events-none globaux
// Les étapes futures sont simplement grises mais TOUJOURS cliquables
const cardClass = (step: number) => {
  const base = 'rounded-2xl border-2 p-5 transition-all duration-200'
  if (currentStep.value === step) return `${base} border-primary/50 bg-card shadow-sm`
  if (currentStep.value > step) return `${base} border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10`
  // Étape future : visible mais corps masqué, pas pointer-events-none sur le conteneur
  return `${base} border-border bg-muted/20 opacity-60`
}

const badgeClass = (step: number) => {
  const base = 'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all'
  if (currentStep.value > step) return `${base} bg-green-500 text-white`
  if (currentStep.value === step) return `${base} bg-primary text-primary-foreground`
  return `${base} bg-muted text-muted-foreground`
}

// ── Types d'import ───────────────────────────────────────────────
type ImportTypeId = 'operators' | 'aircrafts' | 'aircraft-types'

const importTypes = [
  {
    id: 'operators' as ImportTypeId,
    label: 'Exploitants',
    description: 'Compagnies aériennes',
    icon: Building2,
    iconBg: 'bg-blue-100 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
    activeClass: 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-sm',
  },
  {
    id: 'aircrafts' as ImportTypeId,
    label: 'Aéronefs',
    description: 'Appareils & immatriculations',
    icon: Plane,
    iconBg: 'bg-indigo-100 dark:bg-indigo-950',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    activeClass: 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm',
  },
  {
    id: 'aircraft-types' as ImportTypeId,
    label: "Types d'aéronefs",
    description: 'Modèles (B737, A320…)',
    icon: Layers,
    iconBg: 'bg-purple-100 dark:bg-purple-950',
    iconColor: 'text-purple-600 dark:text-purple-400',
    activeClass: 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/30 shadow-sm',
  },
]

const selectedType = ref<ImportTypeId>('operators')
const currentType = computed(() => importTypes.find(t => t.id === selectedType.value))
const currentTypeLabel = computed(() => currentType.value?.label.toLowerCase() ?? '')

// Sélectionner un type ET avancer à l'étape 2
const selectType = (id: ImportTypeId) => {
  selectedType.value = id
  currentStep.value = 2
}

// ── Colonnes attendues ───────────────────────────────────────────
const columnsByType: Record<ImportTypeId, { name: string; description: string; required: boolean; example?: string }[]> = {
  operators: [
    { name: 'name', description: 'Nom complet', required: true, example: 'Air France' },
    { name: 'sigle', description: 'Sigle (max 10 car.)', required: true, example: 'AF' },
    { name: 'flight_type', description: 'regular ou non_regular', required: true, example: 'regular' },
    { name: 'iata_code', description: 'Code IATA (2–5 car.)', required: false, example: 'AF' },
    { name: 'icao_code', description: 'Code OACI (3–5 car.)', required: false, example: 'AFR' },
    { name: 'country', description: "Pays d'origine", required: false, example: 'France' },
  ],
  aircrafts: [
    { name: 'immatriculation', description: 'Immatriculation', required: true, example: 'F-HBXA' },
    { name: 'operator_sigle', description: "Sigle de l'exploitant", required: true, example: 'AF' },
    { name: 'aircraft_type_sigle', description: 'Sigle ICAO du type', required: true, example: 'B737' },
    { name: 'pmad', description: 'Poids max décollage (kg)', required: false, example: '79016' },
    { name: 'in_activity', description: '1 = actif, 0 = inactif', required: false, example: '1' },
  ],
  'aircraft-types': [
    { name: 'sigle', description: 'Sigle ICAO', required: true, example: 'B738' },
    { name: 'name', description: 'Nom complet du modèle', required: true, example: 'Boeing 737-800' },
    { name: 'default_pmad', description: 'PMAD par défaut (kg)', required: true, example: '79016' },
  ],
}

const currentColumns = computed(() => columnsByType[selectedType.value])

// ── Fichier ──────────────────────────────────────────────────────
const file = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const acceptedFormats = '.csv,.xlsx,.xls'

const fileExtension = computed(() => file.value?.name.split('.').pop()?.toLowerCase() ?? '')

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

const setFile = (f: File) => {
  const ext = f.name.split('.').pop()?.toLowerCase()
  if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
    showError('Format non supporté. Utilisez .csv, .xlsx ou .xls')
    return
  }
  file.value = f
  importResult.value = null
}

const handleFileSelect = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) setFile(f)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) setFile(f)
}

const clearFile = () => {
  file.value = null
  importResult.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ── Options ──────────────────────────────────────────────────────
const csvOptions = ref({ delimiter: ';', encoding: 'UTF-8', hasHeader: true })
const excelOptions = ref({ sheetName: '__first__', hasHeader: true })

// ── Import ───────────────────────────────────────────────────────
interface ImportResult {
  created: number
  updated: number
  failed: number
  errors: { row: number; message: string }[]
}

const importResult = ref<ImportResult | null>(null)
const importing = ref(false)

const handleImport = async () => {
  if (!file.value) return
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('type', selectedType.value)

    if (fileExtension.value === 'csv') {
      formData.append('delimiter', csvOptions.value.delimiter)
      formData.append('encoding', csvOptions.value.encoding)
      formData.append('has_header', csvOptions.value.hasHeader ? '1' : '0')
    } else {
      formData.append('sheet', excelOptions.value.sheetName)
      formData.append('has_header', excelOptions.value.hasHeader ? '1' : '0')
    }

    const { apiFetch } = useApi()
    const res = await apiFetch<ImportResult>('/imports', { method: 'POST', body: formData })

    importResult.value = {
      created: res.created ?? 0,
      updated: res.updated ?? 0,
      failed: res.failed ?? 0,
      errors: res.errors ?? [],
    }

    // Rafraîchir le store concerné
    if (selectedType.value === 'operators') await operatorsStore.fetchAllOperators()
    if (selectedType.value === 'aircrafts') await aircraftsStore.fetchAllAircrafts()
    if (selectedType.value === 'aircraft-types') await aircraftTypesStore.fetchAllAircraftTypes()

    // Historique de session
    const t = currentType.value!
    importHistory.value.unshift({
      id: ++historyId,
      filename: file.value.name,
      typeLabel: t.label,
      typeIcon: t.icon,
      typeColor: t.iconBg,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      created: importResult.value.created,
    })
    if (importHistory.value.length > 5) importHistory.value.pop()

    importResult.value.failed === 0
      ? showSuccess(`Import réussi — ${importResult.value.created} ${currentTypeLabel.value} créés`)
      : showError(`Import partiel — ${importResult.value.failed} erreur(s)`)
  } catch (e: any) {
    showError(e?.data?.message ?? e.message ?? "Erreur lors de l'import")
  } finally {
    importing.value = false
  }
}

const resetImport = () => {
  importResult.value = null
  clearFile()
  currentStep.value = 1
}

// ── Historique ───────────────────────────────────────────────────
let historyId = 0
const importHistory = ref<{
  id: number; filename: string; typeLabel: string
  typeIcon: any; typeColor: string; date: string; created: number
}[]>([])

// ── Modèle CSV téléchargeable ────────────────────────────────────
const downloadTemplate = () => {
  const templates: Record<ImportTypeId, string> = {
    operators:
      'name;sigle;flight_type;iata_code;icao_code;country\nAir France;AF;regular;AF;AFR;France\nCorsair;XK;non_regular;XK;CSS;France',
    aircrafts:
      'immatriculation;operator_sigle;aircraft_type_sigle;pmad;in_activity\nF-HBXA;AF;B738;79016;1\nTU-VAE;RW;DHC6;5670;1',
    'aircraft-types':
      'sigle;name;default_pmad\nB738;Boeing 737-800;79016\nA320;Airbus A320;77000',
  }
  const blob = new Blob([templates[selectedType.value]], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `modele_${selectedType.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showSuccess('Modèle téléchargé')
}
</script>