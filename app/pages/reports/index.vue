<template>
  <div class="space-y-8">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-800 via-slate-700 to-slate-900 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-[radial-linear(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/10">
            <BarChart3 class="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Rapports & Statistiques</h1>
            <p class="text-white/70 text-sm mt-1">Trafic aérien · Fret · IDEF · PAX BUS</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-white/60 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
          <CalendarDays class="h-3.5 w-3.5" />
          <span>{{ currentPeriodLabel }}</span>
        </div>
      </div>
      <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div class="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
    </div>

    <!-- ── Section : Rapports détaillés ────────────────────────────────────── -->
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <div class="h-1 w-6 rounded-full bg-linear-to-r from-blue-500 to-indigo-500" />
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rapports détaillés</h2>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <!-- Traffic Report -->
        <NuxtLink to="/reports/traffic">
          <Card class="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500/60 cursor-pointer h-full">
            <div class="absolute inset-0 bg-linear-to-br from-blue-500/0 to-blue-500/5 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300" />
            <CardContent class="relative p-6 flex flex-col gap-4 h-full">
              <div class="flex items-start justify-between">
                <div class="h-12 w-12 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 class="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" class="text-[10px] font-medium">Trafic</Badge>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors">Rapport de Trafic</h3>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  PAX, fret et excédents — mensuel, annuel, fiche journalière
                </p>
              </div>
              <div class="flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ouvrir</span>
                <ArrowRight class="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </NuxtLink>

        <!-- IDEF Report -->
        <NuxtLink to="/reports/idef">
          <Card class="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-teal-500/60 cursor-pointer h-full">
            <div class="absolute inset-0 bg-linear-to-br from-teal-500/0 to-teal-500/5 group-hover:from-teal-500/5 group-hover:to-teal-500/10 transition-all duration-300" />
            <CardContent class="relative p-6 flex flex-col gap-4 h-full">
              <div class="flex items-start justify-between">
                <div class="h-12 w-12 rounded-2xl bg-linear-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package class="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" class="text-[10px] font-medium">IDEF</Badge>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-base mb-1 group-hover:text-teal-600 transition-colors">Rapport IDEF-GOPASS</h3>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  Frets payés, Go-Pass, exonérations et taux mensuels
                </p>
              </div>
              <div class="flex items-center gap-1 text-xs text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ouvrir</span>
                <ArrowRight class="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </NuxtLink>

        <!-- PAX BUS Report -->
        <NuxtLink to="/reports/pax-bus">
          <Card class="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/60 cursor-pointer h-full">
            <div class="absolute inset-0 bg-linear-to-br from-purple-500/0 to-purple-500/5 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all duration-300" />
            <CardContent class="relative p-6 flex flex-col gap-4 h-full">
              <div class="flex items-start justify-between">
                <div class="h-12 w-12 rounded-2xl bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bus class="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" class="text-[10px] font-medium">PAX BUS</Badge>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-base mb-1 group-hover:text-purple-600 transition-colors">Rapport PAX BUS</h3>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  Passagers par bus, aéronefs domestiques et internationaux
                </p>
              </div>
              <div class="flex items-center gap-1 text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ouvrir</span>
                <ArrowRight class="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </NuxtLink>
      </div>
    </div>

    <!-- ── Section : Statistiques rapides ──────────────────────────────────── -->
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <div class="h-1 w-6 rounded-full bg-linear-to-r from-emerald-500 to-teal-500" />
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Statistiques rapides</h2>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">

        <!-- Card : Évolution du trafic -->
        <Card
          class="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-500/60 cursor-pointer"
          @click="trafficDialogOpen = true"
        >
          <div class="absolute inset-0 bg-linear-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/5 transition-all duration-300" />
          <CardContent class="relative p-6">
            <div class="flex items-start gap-4">
              <div class="h-12 w-12 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp class="h-6 w-6 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <h3 class="font-semibold text-base group-hover:text-indigo-600 transition-colors">
                    Évolution du trafic
                  </h3>
                  <Badge class="bg-indigo-100 text-indigo-700 border-0 text-[10px]">PAX · Fret</Badge>
                </div>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  Vue consolidée PAX (trafic, Go-Pass, PAX Bus), fret et excédents — national et international.
                  Mensuel ou annuel avec export Excel.
                </p>
                <div class="flex items-center gap-3 mt-3">
                  <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Globe class="h-3 w-3" /> National + International
                  </span>
                  <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <FileSpreadsheet class="h-3 w-3" /> Export Excel
                  </span>
                </div>
              </div>
              <ChevronRight class="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 shrink-0 transition-colors" />
            </div>
          </CardContent>
        </Card>

        <!-- Card : Synthèse PAX -->
        <Card
          class="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500/60 cursor-pointer"
          @click="paxDialogOpen = true"
        >
          <div class="absolute inset-0 bg-linear-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300" />
          <CardContent class="relative p-6">
            <div class="flex items-start gap-4">
              <div class="h-12 w-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Users class="h-6 w-6 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <h3 class="font-semibold text-base group-hover:text-blue-600 transition-colors">
                    Synthèse PAX
                  </h3>
                  <Badge class="bg-blue-100 text-blue-700 border-0 text-[10px]">Par exploitants</Badge>
                </div>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  Répartition du trafic passagers par compagnie avec quantités et pourcentages.
                  Séparation commerciaux / non-commerciaux.
                </p>
                <div class="flex items-center gap-3 mt-3">
                  <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Building2 class="h-3 w-3" /> Par opérateur
                  </span>
                  <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <FileSpreadsheet class="h-3 w-3" /> Export Excel
                  </span>
                </div>
              </div>
              <ChevronRight class="h-4 w-4 text-muted-foreground group-hover:text-blue-600 shrink-0 transition-colors" />
            </div>
          </CardContent>
        </Card>

        <!-- Card : Synthèse des frets -->
        <Card
          class="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-500/60 cursor-pointer"
          @click="freightDialogOpen = true"
        >
          <div class="absolute inset-0 bg-linear-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300" />
          <CardContent class="relative p-6">
            <div class="flex items-start gap-4">
              <div class="h-12 w-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Package class="h-6 w-6 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <h3 class="font-semibold text-base group-hover:text-emerald-600 transition-colors">
                    Synthèse des frets
                  </h3>
                  <Badge class="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Par exploitants</Badge>
                </div>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  Répartition du fret et des excédents par compagnie avec quantités et pourcentages.
                  Séparation commerciaux / non-commerciaux.
                </p>
                <div class="flex items-center gap-3 mt-3">
                  <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Building2 class="h-3 w-3" /> Par opérateur
                  </span>
                  <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <FileSpreadsheet class="h-3 w-3" /> Export Excel
                  </span>
                </div>
              </div>
              <ChevronRight class="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 shrink-0 transition-colors" />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>

    <!-- ── Dialogs ──────────────────────────────────────────────────────────── -->
    <TrafficStatsDialog v-model:open="trafficDialogOpen" />
    <PaxSynthDialog     v-model:open="paxDialogOpen" />
    <FreightSynthDialog v-model:open="freightDialogOpen" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BarChart3, CalendarDays, Package, Bus,
  TrendingUp, ArrowRight, ChevronRight,
  Globe, FileSpreadsheet, Building2, Users,
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TrafficStatsDialog from '~/components/modules/report/TrafficStatsDialog.vue'
import PaxSynthDialog     from '~/components/modules/report/PAXSynthDialog.vue'
import FreightSynthDialog from '~/components/modules/report/FreightSynthDialog.vue'

useHead({
  title: 'Rapports | VTA',
  meta: [
    { name: 'description', content: 'Accès à tous les rapports de trafic aérien, fret et passagers avec visualisations et statistiques.' }
  ]
})

definePageMeta({ middleware: 'auth' })

const trafficDialogOpen = ref(false)
const paxDialogOpen     = ref(false)
const freightDialogOpen = ref(false)

const currentPeriodLabel = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})
</script>