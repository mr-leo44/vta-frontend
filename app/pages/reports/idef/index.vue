<template>
  <div class="space-y-6">
    <!-- ════════════════════════════════════════════════════════════════
         Header  (inchangé)
    ════════════════════════════════════════════════════════════════ -->
    <div
      class="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-teal-600 to-purple-600 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Package class="h-7 w-7" />
          </div>
          <div>
            <h1 class="text-4xl font-bold">Rapports IDEF-GOPASS</h1>
            <p class="text-white/90 text-sm mt-1">
              Statistiques des frets, exonérations et Go-pass
            </p>
          </div>
        </div>
      </div>
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════
         Types de rapports  (inchangé)
    ════════════════════════════════════════════════════════════════ -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Rapport Mensuel -->
      <Card class="group hover:shadow-xl transition-all border-2 hover:border-emerald-500/50 cursor-pointer"
        @click="monthlyDialogOpen = true">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div
              class="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Calendar class="h-6 w-6 text-white" />
            </div>
            <Badge variant="secondary">Mensuel</Badge>
          </div>
          <CardTitle class="mt-4">Rapport Mensuel IDEF-GOPASS</CardTitle>
          <CardDescription>
            Générer le rapport des frets pour un mois spécifique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button class="w-full" variant="outline">
            <Download class="mr-2 h-4 w-4" />
            Générer
          </Button>
        </CardContent>
      </Card>

      <!-- Rapport Annuel -->
      <Card class="group hover:shadow-xl transition-all border-2 hover:border-teal-500/50 cursor-pointer"
        @click="annualDialogOpen = true">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div
              class="h-12 w-12 rounded-xl bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <CalendarDays class="h-6 w-6 text-white" />
            </div>
            <Badge variant="secondary">Annuel</Badge>
          </div>
          <CardTitle class="mt-4">Rapport Annuel IDEF-GOPASS</CardTitle>
          <CardDescription>
            Générer le rapport des frets pour une année complète
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button class="w-full" variant="outline">
            <Download class="mr-2 h-4 w-4" />
            Générer
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- ════════════════════════════════════════════════════════════════
         SECTION : Frets payés IDEF  (nouveau)
    ════════════════════════════════════════════════════════════════ -->
    <div class="space-y-4">

      <!-- Barre de navigation mensuelle + actions -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold">Frets payés</h2>

          <!-- Navigation mois -->
          <div class="flex items-center gap-1 rounded-lg border bg-background px-1 py-1">
            <Button variant="ghost" size="icon" class="h-7 w-7" @click="prevMonth">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <span class="px-2 text-sm font-medium min-w-36 text-center">
              {{ currentMonthLabel }} {{ viewYear }}
            </span>
            <Button variant="ghost" size="icon" class="h-7 w-7" @click="nextMonth">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>

          <!-- Taux mensuel badge -->
          <Button
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs"
            @click="openMonthlyRateDialog"
          >
            <TrendingUp class="h-3.5 w-3.5" />
            <span v-if="currentMonthlyRate">
              Taux : <strong class="font-mono">{{ currentMonthlyRate.rate }}</strong> FC/$
            </span>
            <span v-else class="text-amber-600">Définir taux mensuel</span>
          </Button>
        </div>

        <!-- Bouton ajout frets -->
        <Button size="sm" @click="openFretDialog">
          <Plus class="h-4 w-4 mr-1.5" />
          Ajouter des frets
        </Button>
      </div>

      <!-- Tableau des frets du mois -->
      <Card>
        <CardContent class="p-0">
          <!-- Loading -->
          <div v-if="loadingFrets" class="flex justify-center py-12">
            <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
          </div>

          <!-- Vide -->
          <div v-else-if="!monthFrets.length" class="py-14 text-center text-sm text-muted-foreground">
            <Banknote class="h-9 w-9 mx-auto mb-3 opacity-30" />
            Aucun fret enregistré pour {{ currentMonthLabel }} {{ viewYear }}.
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b bg-muted/40">
                <tr>
                  <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Date</th>
                  <th class="px-5 py-3 text-right font-semibold text-muted-foreground">USD ($)</th>
                  <th class="px-5 py-3 text-right font-semibold text-muted-foreground">CDF (FC)</th>
                  <th class="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="fret in monthFrets"
                  :key="fret.id"
                  class="border-b last:border-0 hover:bg-muted/20 transition-colors group"
                >
                  <td class="px-5 py-2.5 font-medium">{{ formatDate(fret.date) }}</td>
                  <td class="px-5 py-2.5 text-right font-mono text-emerald-700 font-semibold">
                    {{ Number(fret.usd).toFixed(2) }}
                  </td>
                  <td class="px-5 py-2.5 text-right font-mono text-blue-700 font-semibold">
                    {{ Number(fret.cdf).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }}
                  </td>
                  <td class="px-4 py-2.5 text-right">
                    <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon" variant="ghost"
                        class="h-7 w-7 hover:text-blue-600"
                        @click="editFret(fret)"
                      >
                        <Pencil class="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        class="h-7 w-7 hover:text-red-500"
                        @click="confirmDelete(fret)"
                      >
                        <Trash2 class="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="border-t bg-muted/20">
                <tr>
                  <td class="px-5 py-2.5 font-bold text-sm">Total</td>
                  <td class="px-5 py-2.5 text-right font-mono font-bold text-emerald-700">
                    {{ totalUsd.toFixed(2) }}
                  </td>
                  <td class="px-5 py-2.5 text-right font-mono font-bold text-blue-700">
                    {{ totalCdf.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ════════════════════════════════════════════════════════════════
         Dialogs rapports  (inchangé)
    ════════════════════════════════════════════════════════════════ -->
    <GenericMonthlyReportDialog
      v-model:open="monthlyDialogOpen"
      :loading="loadingMonthly"
      title="Rapport Mensuel IDEF-GOPASS"
      description="Sélectionnez le mois, l'année pour générer le rapport"
      @generate="generateMonthlyReport"
    />

    <GenericAnnualReportDialog
      v-model:open="annualDialogOpen"
      :loading="loadingAnnual"
      title="Rapport Annuel IDEF-GOPASS"
      description="Sélectionnez l'année pour générer le rapport annuel"
      @generate="generateAnnualReport"
    />

    <!-- ════════════════════════════════════════════════════════════════
         Dialog : Saisie des frets (batch ou individuel)  (nouveau)
    ════════════════════════════════════════════════════════════════ -->
    <Dialog v-model:open="fretDialogOpen">
      <DialogContent class="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Banknote class="h-5 w-5 text-blue-600" />
            {{ editingFret ? 'Modifier le fret' : 'Saisir des frets payés' }}
          </DialogTitle>
          <DialogDescription>
            <span v-if="editingFret">
              Modification du fret du {{ formatDate(editingFret.date) }}.
            </span>
            <span v-else>
              Saisissez un ou plusieurs frets. Les dates déjà existantes seront mises à jour automatiquement.
            </span>
          </DialogDescription>
        </DialogHeader>

        <!-- Mode édition : formulaire simple -->
        <div v-if="editingFret" class="space-y-4 py-2">
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <Label>Date</Label>
              <Input v-model="editForm.date" type="date" />
            </div>
            <div class="space-y-1.5">
              <Label>USD ($)</Label>
              <Input v-model.number="editForm.usd" type="number" min="0" step="0.01" placeholder="0.00" class="font-mono" />
            </div>
            <div class="space-y-1.5">
              <Label>CDF (FC)</Label>
              <Input v-model.number="editForm.cdf" type="number" min="0" step="0.01" placeholder="0.00" class="font-mono" />
            </div>
          </div>
        </div>

        <!-- Mode saisie batch : tableau -->
        <div v-else class="flex flex-col gap-3 min-h-0 flex-1">

          <!-- Sélecteur mois pour pré-remplir -->
          <div class="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm shrink-0">
            <CalendarRange class="h-4 w-4 text-muted-foreground shrink-0" />
            <span class="font-medium">Pré-remplir les jours du mois :</span>

            <!-- Mois -->
            <Popover v-model:open="batchMonthOpen">
              <PopoverTrigger as-child>
                <Button variant="outline" size="sm" class="w-32 justify-between text-xs h-8">
                  {{ MONTH_NAMES_SELECT.find(m => m.value === batchMonth)?.label || 'Mois' }}
                  <ChevronsUpDown class="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-40 p-0" side="bottom" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-for="m in MONTH_NAMES_SELECT"
                        :key="m.value"
                        :value="m.value"
                        @select="() => { batchMonth = m.value; batchMonthOpen = false }"
                      >
                        <Check :class="cn('mr-2 h-3.5 w-3.5', batchMonth === m.value ? 'opacity-100' : 'opacity-0')" />
                        {{ m.label }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <!-- Année -->
            <Popover v-model:open="batchYearOpen">
              <PopoverTrigger as-child>
                <Button variant="outline" size="sm" class="w-24 justify-between text-xs h-8">
                  {{ batchYear || 'Année' }}
                  <ChevronsUpDown class="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-28 p-0" side="bottom" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-for="y in availableYears"
                        :key="y"
                        :value="String(y)"
                        @select="() => { batchYear = y; batchYearOpen = false }"
                      >
                        <Check :class="cn('mr-2 h-3.5 w-3.5', batchYear === y ? 'opacity-100' : 'opacity-0')" />
                        {{ y }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button size="sm" variant="outline" class="text-xs h-8" @click="prefillBatchRows">
              <RefreshCw class="h-3 w-3 mr-1" /> Générer
            </Button>
          </div>

          <!-- Table batch scrollable -->
          <div class="overflow-y-auto flex-1 rounded-lg border">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-muted/90 backdrop-blur z-10">
                <tr>
                  <th class="px-4 py-2 text-left font-semibold">Date</th>
                  <th class="px-4 py-2 text-left font-semibold">USD ($)</th>
                  <th class="px-4 py-2 text-left font-semibold">CDF (FC)</th>
                  <th class="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, i) in batchRows"
                  :key="i"
                  :class="existingDates.has(row.date) ? 'bg-amber-50/70' : 'hover:bg-muted/20'"
                  class="border-t transition-colors"
                >
                  <td class="px-4 py-1.5">
                    <div class="flex items-center gap-1">
                      <Input v-model="row.date" type="date" class="h-8 text-xs font-mono w-36" />
                      <span v-if="existingDates.has(row.date)" class="text-[10px] text-amber-600 font-semibold whitespace-nowrap">MAJ</span>
                    </div>
                  </td>
                  <td class="px-4 py-1.5">
                    <Input v-model.number="row.usd" type="number" min="0" step="0.01" placeholder="0.00" class="h-8 text-xs font-mono" />
                  </td>
                  <td class="px-4 py-1.5">
                    <Input v-model.number="row.cdf" type="number" min="0" step="0.01" placeholder="0.00" class="h-8 text-xs font-mono" />
                  </td>
                  <td class="px-2 py-1.5">
                    <Button size="icon" variant="ghost" class="h-7 w-7 hover:text-red-500" @click="batchRows.splice(i, 1)">
                      <X class="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Ajouter ligne + stats -->
          <div class="flex items-center justify-between shrink-0 flex-wrap gap-2">
            <Button variant="ghost" size="sm" class="text-xs" @click="addBatchRow">
              <Plus class="h-3.5 w-3.5 mr-1" /> Ajouter une ligne
            </Button>
            <div class="flex gap-2 text-xs flex-wrap">
              <span class="rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium">
                {{ batchNewCount }} à créer
              </span>
              <span v-if="batchUpdateCount" class="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 font-medium">
                {{ batchUpdateCount }} à mettre à jour
              </span>
              <span class="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 font-mono font-medium">
                ${{ batchTotalUsd.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter class="gap-2 shrink-0">
          <Button variant="outline" @click="closeFretDialog">Annuler</Button>
          <Button :disabled="loadingFretSave" class="min-w-28" @click="submitFretDialog">
            <Loader2 v-if="loadingFretSave" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ editingFret ? 'Mettre à jour' : `Enregistrer (${validBatchRows.length})` }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog : Taux mensuel  (nouveau) -->
    <Dialog v-model:open="monthlyRateDialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <TrendingUp class="h-5 w-5 text-emerald-600" />
            {{ currentMonthlyRate ? 'Modifier le taux mensuel' : 'Définir le taux mensuel' }}
          </DialogTitle>
          <DialogDescription>
            Taux de change pour {{ currentMonthLabel }} {{ viewYear }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="space-y-1.5">
            <Label>Taux (FC / $) <span class="text-red-500">*</span></Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">FC/$</span>
              <Input
                v-model.number="rateForm.rate"
                type="number" min="0" step="0.0001" placeholder="0.0000"
                class="pl-12 font-mono"
              />
            </div>
          </div>
          <div v-if="currentMonthlyRate" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Taux actuel : <strong class="font-mono">{{ currentMonthlyRate.rate }}</strong> — sera remplacé.
          </div>
        </div>

        <DialogFooter class="gap-2">
          <Button variant="outline" @click="monthlyRateDialogOpen = false">Annuler</Button>
          <Button :disabled="!rateForm.rate || loadingRateSave" class="min-w-28" @click="submitMonthlyRate">
            <Loader2 v-if="loadingRateSave" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ currentMonthlyRate ? 'Mettre à jour' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Confirmation suppression -->
    <AlertDialog :open="!!deletingFret" @update:open="deletingFret = null">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce fret ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le fret du <strong>{{ deletingFret ? formatDate(deletingFret.date) : '' }}</strong> sera définitivement supprimé.
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deletingFret = null">Annuler</AlertDialogCancel>
          <AlertDialogAction class="bg-red-600 hover:bg-red-700 text-white" @click="handleDelete">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Package, Calendar, CalendarDays, Download,
  ChevronLeft, ChevronRight, TrendingUp, Plus,
  Banknote, Pencil, Trash2, Loader2, Save, X,
  CalendarRange, RefreshCw, Check, ChevronsUpDown
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import {
  Command, CommandGroup, CommandItem, CommandList
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import GenericMonthlyReportDialog from '~/components/modules/report/GenericMonthlyReportDialog.vue'
import GenericAnnualReportDialog from '~/components/modules/report/GenericAnnualReportDialog.vue'

useHead({
  title: 'Rapports IDEF Fret | VTA',
  meta: [
    { name: 'description', content: 'Consultez les rapports IDEF Fret avec gestion des taux de change et analyse détaillée.' }
  ]
})

definePageMeta({ middleware: 'auth' })

const { success, error } = useToast()
const { apiFetch } = useApi()

// ── Types ──────────────────────────────────────────────────────────────────
interface IdefFret { id: number; date: string; usd: number; cdf: number }
interface MonthlyRate { id: number; month: string; rate: number }

// ── Noms des mois (existant) ───────────────────────────────────────────────
const MONTH_NAMES: Record<string, string> = {
  '1': 'JANVIER', '2': 'FEVRIER', '3': 'MARS', '4': 'AVRIL',
  '5': 'MAI', '6': 'JUIN', '7': 'JUILLET', '8': 'AOUT',
  '9': 'SEPTEMBRE', '10': 'OCTOBRE', '11': 'NOVEMBRE', '12': 'DECEMBRE'
}

const MONTH_NAMES_SELECT = [
  { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
]

// ── États dialogs rapports (existant) ─────────────────────────────────────
const monthlyDialogOpen = ref(false)
const annualDialogOpen = ref(false)
const loadingMonthly = ref(false)
const loadingAnnual = ref(false)

// ── Navigation mois/année ─────────────────────────────────────────────────
const now = new Date()
const viewMonth = ref(now.getMonth() + 1)   // 1-12
const viewYear = ref(now.getFullYear())

const availableYears = computed(() => {
  const years = []
  for (let i = 2025; i <= now.getFullYear() + 1; i++) years.push(i)
  return years.reverse()
})

// Popover open states for batch selectors
const batchMonthOpen = ref(false)
const batchYearOpen = ref(false)

const currentMonthLabel = computed(
  () => MONTH_NAMES_SELECT.find(m => parseInt(m.value) === viewMonth.value)?.label ?? ''
)

const daysInMonth = computed(() => new Date(viewYear.value, viewMonth.value, 0).getDate())

function prevMonth() {
  if (viewMonth.value === 1) { viewMonth.value = 12; viewYear.value-- }
  else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 12) { viewMonth.value = 1; viewYear.value++ }
  else viewMonth.value++
}

// ── Données frets ─────────────────────────────────────────────────────────
const allFrets = ref<IdefFret[]>([])
const monthlyRates = ref<MonthlyRate[]>([])
const loadingFrets = ref(false)

const monthFrets = computed(() =>
  allFrets.value.filter(f => {
    const d = new Date(f.date)
    return d.getFullYear() === viewYear.value && d.getMonth() + 1 === viewMonth.value
  })
)

const existingDates = computed(() =>
  new Set(allFrets.value.map(f => f.date.substring(0, 10)))
)

const totalUsd = computed(() => monthFrets.value.reduce((s, f) => s + Number(f.usd), 0))
const totalCdf = computed(() => monthFrets.value.reduce((s, f) => s + Number(f.cdf), 0))

const currentMonthlyRate = computed(() => {
  const key = `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}`
  return monthlyRates.value.find(r => r.month?.startsWith(key)) ?? null
})

async function loadFrets() {
  loadingFrets.value = true
  try {
    const mm = String(viewMonth.value).padStart(2, '0')
    const from = `${viewYear.value}-${mm}-01`
    const to = `${viewYear.value}-${mm}-${daysInMonth.value}`
    const data = await apiFetch<IdefFret[]>(`/idef-frets/range/${from}/${to}`)
    // Replace only records from this month, keep others
    allFrets.value = [
      ...allFrets.value.filter(f => {
        const d = new Date(f.date)
        return !(d.getFullYear() === viewYear.value && d.getMonth() + 1 === viewMonth.value)
      }),
      ...(data ?? [])
    ]
  } catch (err: any) {
    error('Erreur', err?.message ?? 'Impossible de charger les frets')
  } finally {
    loadingFrets.value = false
  }
}

async function loadMonthlyRates() {
  try {
    const data = await apiFetch<MonthlyRate[]>('/monthly-rates')
    monthlyRates.value = data ?? []
  } catch { /* silent */ }
}

watch([viewMonth, viewYear], loadFrets)
onMounted(() => { loadFrets(); loadMonthlyRates() })

// ── Dialog frets ──────────────────────────────────────────────────────────
const fretDialogOpen = ref(false)
const loadingFretSave = ref(false)
const editingFret = ref<IdefFret | null>(null)

// Edit form (mode édition individuelle)
const editForm = ref({ date: '', usd: 0, cdf: 0 })

// Batch form
interface BatchRow { date: string; usd: number; cdf: number }
const batchRows = ref<BatchRow[]>([])
const batchMonth = ref(String(now.getMonth() + 1).padStart(2, '0'))
const batchYear = ref(now.getFullYear())

function openFretDialog() {
  editingFret.value = null
  batchRows.value = [{ date: new Date().toISOString().substring(0, 10), usd: 0, cdf: 0 }]
  fretDialogOpen.value = true
}

function editFret(fret: IdefFret) {
  editingFret.value = fret
  editForm.value = { date: fret.date.substring(0, 10), usd: fret.usd, cdf: fret.cdf }
  fretDialogOpen.value = true
}

function closeFretDialog() {
  fretDialogOpen.value = false
  editingFret.value = null
}

function addBatchRow() {
  batchRows.value.push({ date: new Date().toISOString().substring(0, 10), usd: 0, cdf: 0 })
}

function prefillBatchRows() {
  const days = new Date(batchYear.value, parseInt(batchMonth.value), 0).getDate()
  batchRows.value = Array.from({ length: days }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    const date = `${batchYear.value}-${batchMonth.value}-${day}`
    const existing = allFrets.value.find(f => f.date.substring(0, 10) === date)
    return { date, usd: existing?.usd ?? 0, cdf: existing?.cdf ?? 0 }
  })
}

const validBatchRows = computed(() =>
  batchRows.value.filter(r => r.date && (r.usd > 0 || r.cdf > 0))
)

const batchNewCount = computed(() =>
  validBatchRows.value.filter(r => !existingDates.value.has(r.date)).length
)
const batchUpdateCount = computed(() =>
  validBatchRows.value.filter(r => existingDates.value.has(r.date)).length
)
const batchTotalUsd = computed(() =>
  validBatchRows.value.reduce((s, r) => s + (r.usd || 0), 0)
)

async function submitFretDialog() {
  loadingFretSave.value = true
  try {
    if (editingFret.value) {
      // Update individuel
      const updated = await apiFetch<IdefFret>(`/idef-frets/${editingFret.value.id}`, {
        method: 'PUT',
        body: editForm.value,
      })
      const idx = allFrets.value.findIndex(f => f.id === editingFret.value!.id)
      if (idx !== -1) allFrets.value[idx] = updated
      success('Fret mis à jour', `Fret du ${formatDate(updated.date)} modifié`)
    } else {
      // Batch upsert → POST /idef-frets/batch
      const payload = { entries: validBatchRows.value }
      const result = await apiFetch<{ created: IdefFret[]; updated: IdefFret[] }>(
        '/idef-frets/batch', { method: 'POST', body: payload }
      )
      // Merge résultats dans allFrets
      for (const f of result.updated) {
        const idx = allFrets.value.findIndex(x => x.id === f.id)
        if (idx !== -1) allFrets.value[idx] = f
      }
      for (const f of result.created) {
        allFrets.value.push(f)
      }
      allFrets.value.sort((a, b) => a.date.localeCompare(b.date))
      success(
        'Frets enregistrés',
        `${result.created.length} créé(s), ${result.updated.length} mis à jour`
      )
    }
    closeFretDialog()
  } catch (err: any) {
    const msg = err?.data?.errors
      ? Object.values(err.data.errors as Record<string, string[]>).flat().join(', ')
      : err?.message ?? 'Erreur lors de la sauvegarde'
    error('Erreur', msg)
  } finally {
    loadingFretSave.value = false
  }
}

// ── Suppression ───────────────────────────────────────────────────────────
const deletingFret = ref<IdefFret | null>(null)

function confirmDelete(fret: IdefFret) {
  deletingFret.value = fret
}

async function handleDelete() {
  if (!deletingFret.value) return
  try {
    await apiFetch(`/idef-frets/${deletingFret.value.id}`, { method: 'DELETE' })
    allFrets.value = allFrets.value.filter(f => f.id !== deletingFret.value!.id)
    success('Supprimé', 'Le fret a été supprimé')
  } catch (err: any) {
    error('Erreur', err?.message ?? 'Impossible de supprimer')
  } finally {
    deletingFret.value = null
  }
}

// ── Monthly Rate dialog ────────────────────────────────────────────────────
const monthlyRateDialogOpen = ref(false)
const loadingRateSave = ref(false)
const rateForm = ref({ rate: 0 })

function openMonthlyRateDialog() {
  rateForm.value.rate = currentMonthlyRate.value?.rate ?? 0
  monthlyRateDialogOpen.value = true
}

async function submitMonthlyRate() {
  loadingRateSave.value = true
  const monthKey = `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}`
  try {
    if (currentMonthlyRate.value) {
      const updated = await apiFetch<MonthlyRate>(`/monthly-rates/${currentMonthlyRate.value.id}`, {
        method: 'PUT',
        body: { month: monthKey, rate: rateForm.value.rate },
      })
      const idx = monthlyRates.value.findIndex(r => r.id === updated.id)
      if (idx !== -1) monthlyRates.value[idx] = updated
      success('Taux mis à jour', `Taux de ${currentMonthLabel.value} ${viewYear.value} modifié`)
    } else {
      const created = await apiFetch<MonthlyRate>('/monthly-rates', {
        method: 'POST',
        body: { month: monthKey + '-01', rate: rateForm.value.rate },
      })
      monthlyRates.value.push(created)
      success('Taux enregistré', `Taux de ${currentMonthLabel.value} ${viewYear.value} défini`)
    }
    monthlyRateDialogOpen.value = false
  } catch (err: any) {
    const msg = err?.data?.errors
      ? Object.values(err.data.errors as Record<string, string[]>).flat().join(', ')
      : err?.message ?? 'Erreur lors de la sauvegarde du taux'
    error('Erreur', msg)
  } finally {
    loadingRateSave.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ════════════════════════════════════════════════════════════════
// Génération rapports (inchangé)
// ════════════════════════════════════════════════════════════════
const generateMonthlyReport = async (form: { month: string; year: string }) => {
  loadingMonthly.value = true
  try {
    const url = `/idef-report/monthly/export/${form.month}/${form.year}`
    const response = await apiFetch(url, { method: 'GET', responseType: 'blob' })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    const monthName = MONTH_NAMES[form.month] || 'MOIS'
    link.download = `IDEF ${monthName} ${form.year}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Rapport généré', 'Le rapport mensuel IDEF-GOPASS a été téléchargé avec succès')
    monthlyDialogOpen.value = false
  } catch (err: any) {
    if (err.status === 400 || err.response?.status === 400) {
      error('Données indisponibles', 'Aucune donnée disponible pour la période sélectionnée. Veuillez vérifier l\'année et réessayer.')
    } else {
      error('Erreur', err.message || 'Impossible de générer le rapport')
    }
  } finally {
    loadingMonthly.value = false
  }
}

const generateAnnualReport = async (form: { year: string }) => {
  loadingAnnual.value = true
  try {
    const url = `/idef-report/yearly/export/${form.year}`
    const response = await apiFetch(url, { method: 'GET', responseType: 'blob' })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `RAPPORT ANNUEL IDEF ${form.year}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Rapport généré', 'Le rapport annuel IDEF-GOPASS a été téléchargé avec succès')
    annualDialogOpen.value = false
  } catch (err: any) {
    if (err.status === 400 || err.response?.status === 400) {
      error('Données indisponibles', 'Aucune donnée disponible pour la période sélectionnée. Veuillez vérifier l\'année et réessayer.')
    } else {
      error('Erreur', err.message || 'Impossible de générer le rapport')
    }
  } finally {
    loadingAnnual.value = false
  }
}
</script>