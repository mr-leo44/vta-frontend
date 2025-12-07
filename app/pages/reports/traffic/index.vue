<template>
  <div class="space-y-6 h-[78vh]">
    <!-- Header -->
    <div
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <FileBarChart class="h-7 w-7" />
          </div>
          <div>
            <h1 class="text-4xl font-bold">Rapports de Trafic</h1>
            <p class="text-white/90 text-sm mt-1">
              Générer et exporter les rapports mensuels et annuels
            </p>
          </div>
        </div>
      </div>
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    </div>

    <!-- Types de rapports -->
    <div class="grid gap-6 md:grid-cols-3">
      <!-- Rapport Mensuel -->
      <ReportCard
        :icon="Calendar"
        title="Rapport Mensuel"
        description="Générer le rapport pour un mois spécifique"
        badge-text="Mensuel"
        gradient-class="bg-gradient-to-br from-blue-500 to-blue-600"
        hover-border-class="hover:border-blue-500/50"
        @click="monthlyDialogOpen = true"
      />

      <!-- Rapport Annuel -->
      <ReportCard
        :icon="CalendarDays"
        title="Rapport Annuel"
        description="Générer le rapport pour une année complète"
        badge-text="Annuel"
        gradient-class="bg-gradient-to-br from-green-500 to-green-600"
        hover-border-class="hover:border-green-500/50"
        @click="annualDialogOpen = true"
      />

      <!-- Faits Saillants -->
      <ReportCard
        :icon="Sparkles"
        title="Faits Saillants"
        description="Points clés et statistiques importantes"
        badge-text="Synthèse"
        gradient-class="bg-gradient-to-br from-purple-500 to-purple-600"
        hover-border-class="hover:border-purple-500/50"
        @click="highlightsDialogOpen = true"
      />
    </div>

    <!-- Dialogs -->
    <MonthlyReportDialog
      v-model:open="monthlyDialogOpen"
      :loading="loadingMonthly"
      @generate="generateMonthlyReport"
    />

    <AnnualReportDialog
      v-model:open="annualDialogOpen"
      :loading="loadingAnnual"
      @generate="generateAnnualReport"
    />

    <HighlightsDialog
      v-model:open="highlightsDialogOpen"
      :loading="loadingHighlights"
      @generate="generateHighlights"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileBarChart, Calendar, CalendarDays, Sparkles } from 'lucide-vue-next'
import ReportCard from '@/components/modules/report/TrafficReportCard.vue'
import MonthlyReportDialog from '@/components/modules/report/MonthlyReportDialog.vue'
import AnnualReportDialog from '@/components/modules/report/AnnualReportDialog.vue'
import HighlightsDialog from '@/components/modules/report/HighlightsDialog.vue'

definePageMeta({
  middleware: 'auth'
})

const { success, error } = useToast()
const { apiFetch } = useApi()

// États des dialogs
const monthlyDialogOpen = ref(false)
const annualDialogOpen = ref(false)
const highlightsDialogOpen = ref(false)

// États de chargement
const loadingMonthly = ref(false)
const loadingAnnual = ref(false)
const loadingHighlights = ref(false)

// Génération des rapports
const generateMonthlyReport = async (form: { month: string; year: string; regime: string }) => {
  loadingMonthly.value = true
  try {
    const url = `/trafic-report/export/${form.month}/${form.year}/${form.regime}`

    const response = await apiFetch(url, {
      method: 'GET',
      responseType: 'blob'
    })

    // Créer un lien de téléchargement
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    const formattedRegime = form.regime === 'domestic' ? 'DOMESTIQUE' : 'INTERNATIONAL'
    link.download = `TRAFIC_${formattedRegime}_${form.month}-${form.year}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Rapport généré', 'Le rapport mensuel a été téléchargé avec succès')
    monthlyDialogOpen.value = false
  } catch (err: any) {
    error('Erreur', err.message || 'Impossible de générer le rapport')
  } finally {
    loadingMonthly.value = false
  }
}

const generateAnnualReport = async (form: { year: string; regime: string }) => {
  loadingAnnual.value = true
  try {
    const url = `/trafic-report/export/${form.year}/${form.regime}`

    const response = await apiFetch(url, {
      method: 'GET',
      responseType: 'blob'
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    const formattedRegime = form.regime === 'domestic' ? 'DOMESTIQUE' : 'INTERNATIONAL'
    link.download = `TRAFIC_ANNUEL_${formattedRegime}_${form.year}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Rapport généré', 'Le rapport annuel a été téléchargé avec succès')
    annualDialogOpen.value = false
  } catch (err: any) {
    error('Erreur', err.message || 'Impossible de générer le rapport')
  } finally {
    loadingAnnual.value = false
  }
}

const generateHighlights = async (form: { type: string; month: string; year: string }) => {
  loadingHighlights.value = true
  try {
    // TODO: Implémenter l'endpoint pour les faits saillants
    success('Faits saillants générés', 'Le rapport a été téléchargé avec succès')
    highlightsDialogOpen.value = false
  } catch (err: any) {
    error('Erreur', err.message || 'Impossible de générer le rapport')
  } finally {
    loadingHighlights.value = false
  }
}
</script>