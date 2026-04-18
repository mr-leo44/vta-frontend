<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Journal d'audit</h1>
        <p class="text-sm text-muted-foreground mt-1">Traçabilité complète de toutes les actions</p>
      </div>
      <!-- Badge filtre actif -->
      <Button v-if="hasActiveFilters" variant="outline" size="sm" @click="resetFilters">
        <X class="h-3.5 w-3.5 mr-1.5" />
        Réinitialiser les filtres
      </Button>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card class="border-2" v-for="s in statCards" :key="s.label">
        <CardContent class="pt-6">
          <div class="text-3xl font-bold" :class="s.color">{{ s.value }}</div>
          <p class="text-xs text-muted-foreground mt-1">{{ s.label }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filtres -->
    <Card class="border-2">
      <CardContent class="pt-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

          <!-- Événement -->
          <div class="space-y-1.5">
            <Label class="text-xs">Événement</Label>
            <Select v-model="filters.event" @update:model-value="applyFilters">
              <SelectTrigger class="h-9" :class="filters.event ? 'border-primary' : ''">
                <SelectValue placeholder="Tous les événements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les événements</SelectItem>
                <SelectItem v-for="e in eventOptions" :key="e.value" :value="e.value">
                  <div class="flex items-center gap-2">
                    <span :class="eventDot(e.value)" class="h-2 w-2 rounded-full inline-block shrink-0" />
                    {{ e.label }}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Modèle -->
          <div class="space-y-1.5">
            <Label class="text-xs">Modèle</Label>
            <Select v-model="filters.model" @update:model-value="applyFilters">
              <SelectTrigger class="h-9" :class="filters.model ? 'border-primary' : ''">
                <SelectValue placeholder="Tous les modèles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modèles</SelectItem>
                <SelectItem v-for="m in modelOptions" :key="m" :value="m">{{ m }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Acteur -->
          <div class="space-y-1.5">
            <Label class="text-xs">Acteur</Label>
            <Select v-model="filters.actor_id" @update:model-value="applyFilters">
              <SelectTrigger class="h-9" :class="filters.actor_id ? 'border-primary' : ''">
                <SelectValue placeholder="Tous les acteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les acteurs</SelectItem>
                <SelectItem v-for="a in actors" :key="a.id" :value="String(a.id)">
                  {{ a.name }}
                  <span class="text-xs text-muted-foreground ml-1">@{{ a.username }}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Période -->
          <div class="space-y-1.5">
            <Label class="text-xs">Période</Label>
            <div class="flex gap-2">
              <Input v-model="filters.from" type="date" class="h-9 text-xs"
                :class="filters.from ? 'border-primary' : ''" @change="applyFilters" />
              <Input v-model="filters.to" type="date" class="h-9 text-xs" :class="filters.to ? 'border-primary' : ''"
                @change="applyFilters" />
            </div>
          </div>

        </div>

        <!-- Filtres actifs sous forme de badges -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <span class="text-xs text-muted-foreground self-center">Filtres actifs :</span>
          <span v-if="filters.event"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {{eventOptions.find(e => e.value === filters.event)?.label}}
            <button @click="filters.event = ''; applyFilters()" class="hover:opacity-70">
              <X class="h-3 w-3" />
            </button>
          </span>
          <span v-if="filters.model"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {{ filters.model }}
            <button @click="filters.model = ''; applyFilters()" class="hover:opacity-70">
              <X class="h-3 w-3" />
            </button>
          </span>
          <span v-if="filters.actor_id"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {{actors.find(a => String(a.id) === filters.actor_id)?.name}}
            <button @click="filters.actor_id = ''; applyFilters()" class="hover:opacity-70">
              <X class="h-3 w-3" />
            </button>
          </span>
          <span v-if="filters.from || filters.to"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {{ filters.from || '…' }} → {{ filters.to || '…' }}
            <button @click="filters.from = ''; filters.to = ''; applyFilters()" class="hover:opacity-70">
              <X class="h-3 w-3" />
            </button>
          </span>
        </div>
      </CardContent>
    </Card>

    <!-- Table -->
    <Card class="border-2">
      <CardContent class="p-0">
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>

        <div v-else-if="!logs.length" class="text-center py-16 text-muted-foreground">
          <Activity class="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucun événement{{ hasActiveFilters ? ' pour ces filtres' : '' }}</p>
          <Button v-if="hasActiveFilters" variant="link" size="sm" class="mt-2" @click="resetFilters">
            Effacer les filtres
          </Button>
        </div>

        <table v-else class="w-full text-sm">
          <thead class="border-b bg-muted/40">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground w-36">Date</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground w-36">Événement</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Acteur</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Détails</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-muted/30 transition-colors cursor-pointer"
              @click="openDetail(log)">
              <td class="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-4 py-3">
                <span :class="eventClass(log.event)"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                  {{ log.event_label }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="font-medium">{{ log.model_name?.name }}</span>
              </td>
              <td class="px-4 py-3">
                <div v-if="log.actor" class="text-sm">
                  {{ log.actor.name }}
                  <span class="text-xs text-muted-foreground block">{{ log.actor_ip }}</span>
                </div>
                <span v-else class="text-xs text-muted-foreground italic">Système</span>
              </td>
              <td class="px-4 py-3 text-xs text-muted-foreground font-mono max-w-xs truncate">
                {{ diffSummary(log) }}
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between px-6 py-4 border-t">
        <span class="text-sm text-muted-foreground">{{ meta.total }} événement{{ meta.total > 1 ? 's' : '' }}</span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" :disabled="meta.current_page === 1"
            @click="fetchLogs(meta.current_page - 1)">
            Précédent
          </Button>
          <Button variant="outline" size="sm" :disabled="meta.current_page === meta.last_page"
            @click="fetchLogs(meta.current_page + 1)">
            Suivant
          </Button>
        </div>
      </div>
    </Card>

    <!-- Détail du log -->
    <Dialog v-model:open="detailOpen">
      <DialogContent class="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            <span :class="eventClass(selectedLog?.event)"
              class="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium mr-2">
              {{ selectedLog?.event_label }}
            </span>
            {{ selectedLog?.model }} #{{ selectedLog?.model_id }}
          </DialogTitle>
          <DialogDescription>
            {{ formatDate(selectedLog?.created_at) }}
            · par {{ selectedLog?.actor?.name ?? 'Système' }}
            <span v-if="selectedLog?.actor_ip"> · {{ selectedLog.actor_ip }}</span>
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div v-if="selectedLog?.old_values" class="space-y-2">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avant</h4>
            <pre
              class="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-40">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
          </div>
          <div v-if="selectedLog?.new_values" class="space-y-2">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Après</h4>
            <pre
              class="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-40">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { Activity, X } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import {
  Card, CardContent,
  Button, Input, Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '#components'
import type { AuditLogEntry, AuditStats } from '~/types/api'
import { useToast } from '@/composables/useToast'

useHead({
  title: 'Audit | VTA',
  meta: [
    { name: 'description', content: 'Journal d\'audit complet de toutes les actions et modifications dans le système.' }
  ]
})

definePageMeta({ middleware: 'auth' })

const { apiFetch } = useApi()
const { error: showError } = useToast()

// ─────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────

const logs = ref<AuditLogEntry[]>([])
const stats = ref<AuditStats | null>(null)
const actors = ref<Array<{ id: number; name: string; username: string }>>([])
const loading = ref(true)
const meta = ref<any>(null)

const detailOpen = ref(false)
const selectedLog = ref<AuditLogEntry | null>(null)

// Valeurs '' = "tous" — évite d'envoyer "all" à l'API
const filters = ref({
  event: '',
  model: '',
  actor_id: '',
  from: '',
  to: '',
})

// ─────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────

const eventOptions = [
  { value: 'created', label: 'Créé' },
  { value: 'updated', label: 'Modifié' },
  { value: 'deleted', label: 'Supprimé' },
  { value: 'restored', label: 'Restauré' },
  { value: 'function_assigned', label: 'Fonction assignée' },
  { value: 'permission_granted', label: 'Permission accordée' },
  { value: 'permission_revoked', label: 'Permission révoquée' },
]

const modelOptions = ['Flight', 'Aircraft', 'AircraftType', 'Operator', 'User']

// ─────────────────────────────────────────────────────────────────────
// Filtres actifs
// ─────────────────────────────────────────────────────────────────────

const hasActiveFilters = computed(() =>
  !!filters.value.event ||
  !!filters.value.model ||
  !!filters.value.actor_id ||
  !!filters.value.from ||
  !!filters.value.to
)

const resetFilters = () => {
  filters.value = { event: '', model: '', actor_id: '', from: '', to: '' }
  fetchLogs(1)
}

// ─────────────────────────────────────────────────────────────────────
// Stats cards
// ─────────────────────────────────────────────────────────────────────

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Total', value: stats.value.total.toLocaleString(), color: 'text-foreground' },
    { label: "Aujourd'hui", value: stats.value.today.toLocaleString(), color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Cette semaine', value: stats.value.this_week.toLocaleString(), color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Ce mois', value: stats.value.this_month.toLocaleString(), color: 'text-green-600 dark:text-green-400' },
  ]
})

// ─────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────

const fetchLogs = async (page = 1) => {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page), per_page: '25' })

    // N'envoie les filtres que s'ils sont non vides ('' = pas de filtre)
    if (filters.value.event) params.set('event', filters.value.event)
    if (filters.value.model) params.set('model', filters.value.model)
    if (filters.value.actor_id) params.set('actor_id', filters.value.actor_id)
    if (filters.value.from) params.set('from', filters.value.from)
    if (filters.value.to) params.set('to', filters.value.to)

    const res = await apiFetch<any>(`/audit?${params}`)
    logs.value = res.data
    meta.value = res.meta
  } catch {
    showError('Impossible de charger les logs')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => { try { stats.value = await apiFetch<AuditStats>('/audit/stats') } catch { } }
const fetchActors = async () => { try { const r = await apiFetch<any>('/audit/actors'); actors.value = r.data } catch { } }

const applyFilters = () => fetchLogs(1)

// ─────────────────────────────────────────────────────────────────────
// Détail
// ─────────────────────────────────────────────────────────────────────

const openDetail = (log: AuditLogEntry) => {
  selectedLog.value = log
  detailOpen.value = true
}

// ─────────────────────────────────────────────────────────────────────
// Helpers visuels
// ─────────────────────────────────────────────────────────────────────

const eventClass = (event?: string) => ({
  created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  restored: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  function_assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  permission_granted: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  permission_revoked: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}[event ?? ''] ?? 'bg-secondary text-secondary-foreground')

// Petit point coloré dans le select
const eventDot = (event: string) => ({
  created: 'bg-green-500',
  updated: 'bg-blue-500',
  deleted: 'bg-red-500',
  restored: 'bg-yellow-500',
  function_assigned: 'bg-purple-500',
  permission_granted: 'bg-teal-500',
  permission_revoked: 'bg-orange-500',
}[event] ?? 'bg-gray-400')

const formatDate = (iso?: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const diffSummary = (log: AuditLogEntry): string => {
  if (log.event === 'function_assigned' && log.new_values)
    return `→ ${log.new_values.function} (${log.new_values.role})`
  if ((log.event === 'permission_granted' || log.event === 'permission_revoked') && log.new_values)
    return log.new_values.permission
  if (log.new_values)
    return `modifié : ${Object.keys(log.new_values).slice(0, 3).join(', ')}`
  return '—'
}

// ─────────────────────────────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([fetchLogs(), fetchStats(), fetchActors()])
})
</script>