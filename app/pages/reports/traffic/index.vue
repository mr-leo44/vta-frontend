<template>
  <div class="space-y-6 h-full md:h-[78vh]">
    <!-- Header -->
    <ReportHeader />

    <!-- Types de rapports -->
    <div class="grid gap-6 md:grid-cols-4">
      <ReportCardItem
        :icon="Calendar"
        title="Rapport Mensuel"
        description="Générer le rapport pour un mois spécifique"
        badge="Mensuel"
        gradient-class="bg-gradient-to-br from-blue-500 to-blue-600"
        hover-border-class="hover:border-blue-500/50"
        @click="monthlyDialogOpen = true"
      />

      <ReportCardItem
        :icon="CalendarDays"
        title="Rapport Annuel"
        description="Générer le rapport pour une année complète"
        badge="Annuel"
        gradient-class="bg-gradient-to-br from-green-500 to-green-600"
        hover-border-class="hover:border-green-500/50"
        @click="annualDialogOpen = true"
      />

      <ReportCardItem
        :icon="ClipboardList"
        title="Fiche Journalière"
        description="Détail du trafic par jour"
        badge="Journalier"
        gradient-class="bg-gradient-to-br from-orange-500 to-orange-600"
        hover-border-class="hover:border-orange-500/50"
        @click="dailySheetDialogOpen = true"
      />

      <ReportCardItem
        :icon="Sparkles"
        title="Faits Saillants"
        description="Points clés et statistiques importantes"
        badge="Synthèse"
        gradient-class="bg-gradient-to-br from-purple-500 to-purple-600"
        hover-border-class="hover:border-purple-500/50"
        @click="highlightsDialogOpen = true"
      />
    </div>

    <!-- Dialogs -->
    <GenericMonthlyReportDialog
      v-model:open="monthlyDialogOpen"
      :loading="loadingMonthly"
      title="Rapport Mensuel de Trafic"
      description="Sélectionnez le mois et l'année pour générer le rapport"
      @generate="generateMonthlyReport"
    />

    <GenericAnnualReportDialog
      v-model:open="annualDialogOpen"
      :loading="loadingAnnual"
      title="Rapport Annuel de Trafic"
      description="Sélectionnez l'année pour générer le rapport annuel"
      @generate="generateAnnualReport"
    />

    <DailyReportDialog
      v-model:open="dailySheetDialogOpen"
      :loading="loadingDailySheet"
      @export="exportDailySheet"
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
import { Calendar, CalendarDays, ClipboardList, Sparkles } from 'lucide-vue-next'
import ReportHeader from '@/components/modules/report/traffic/ReportHeader.vue'
import ReportCardItem from '~/components/modules/report/ReportCardItem.vue'
import GenericMonthlyReportDialog from '~/components/modules/report/GenericMonthlyReportDialog.vue'
import GenericAnnualReportDialog from '~/components/modules/report/GenericAnnualReportDialog.vue'
import DailyReportDialog from '~/components/modules/report/traffic/DailyReportDialog.vue'
import HighlightsDialog from '~/components/modules/report/traffic/HighlightsDialog.vue'

useHead({
  title: 'Rapports de trafic | VTA',
  meta: [
    { name: 'description', content: 'Consultez les rapports de trafic aérien détaillés avec graphiques et statistiques.' }
  ]
})

definePageMeta({
  middleware: 'auth'
})

const { success, error } = useToast()
const { apiFetch } = useApi()

// États des dialogs
const monthlyDialogOpen = ref(false)
const annualDialogOpen = ref(false)
const dailySheetDialogOpen = ref(false)
const highlightsDialogOpen = ref(false)

// États de chargement
const loadingMonthly = ref(false)
const loadingAnnual = ref(false)
const loadingDailySheet = ref(false)
const loadingHighlights = ref(false)

// Noms des mois en français
const MONTH_NAMES: Record<string, string> = {
  '1': 'JANVIER',
  '2': 'FEVRIER',
  '3': 'MARS',
  '4': 'AVRIL',
  '5': 'MAI',
  '6': 'JUIN',
  '7': 'JUILLET',
  '8': 'AOUT',
  '9': 'SEPTEMBRE',
  '10': 'OCTOBRE',
  '11': 'NOVEMBRE',
  '12': 'DECEMBRE'
}

// Génération du rapport mensuel
const generateMonthlyReport = async (form: { month: string; year: string }) => {
  loadingMonthly.value = true
  try {
    const url = `/trafic-report/monthly/export/${form.month}/${form.year}`

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
    const monthName = MONTH_NAMES[form.month] || 'MOIS'
    link.download = `TRAFIC ${monthName} ${form.year}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Rapport généré', 'Le rapport mensuel a été téléchargé avec succès')
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

// Génération du rapport annuel
const generateAnnualReport = async (form: { year: string }) => {
  loadingAnnual.value = true
  try {
    const url = `/trafic-report/yearly/export/${form.year}`

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
    link.download = `TRAFIC ANNUEL ${form.year}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Rapport généré', 'Le rapport annuel a été téléchargé avec succès')
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

// Export de la fiche journalière
const exportDailySheet = async (params: { date: string; format: string }) => {
  loadingDailySheet.value = true
  try {
    const queryParams = new URLSearchParams({
      date: params.date,
      format: params.format
    })

    const url = `/trafic-report/daily/export?${queryParams.toString()}`

    const response = await apiFetch(url, {
      method: 'GET',
      responseType: 'blob'
    })

    let mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    let extension = 'xlsx'

    if (params.format === 'pdf') {
      mimeType = 'application/pdf'
      extension = 'pdf'
    }

    const blob = new Blob([response], { type: mimeType })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    
    // Format date pour le nom de fichier
    const dateObj = new Date(params.date)
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = MONTH_NAMES[String(dateObj.getMonth() + 1)] || 'MOIS'
    const year = dateObj.getFullYear()
    
    link.download = `FICHE JOURNALIERE ${day} ${month} ${year}.${extension}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Fiche exportée', 'La fiche journalière a été téléchargée avec succès')
    dailySheetDialogOpen.value = false
  } catch (err: any) {
    if (err.status === 400 || err.response?.status === 400) {
      error('Données indisponibles', 'Aucune donnée disponible pour la date sélectionnée. Veuillez vérifier la date et réessayer.')
    } else {
      console.error('Daily sheet error:', err)
      error('Erreur', err.message || 'Impossible d\'exporter la fiche')
    }
  } finally {
    loadingDailySheet.value = false
  }
}

// Génération des faits saillants
const generateHighlights = async (form: { type: string; month: string; year: string }) => {
  loadingHighlights.value = true
  try {
    // TODO: Implémenter l'endpoint pour les faits saillants
    success('Faits saillants générés', 'Le rapport a été téléchargé avec succès')
    highlightsDialogOpen.value = false
  } catch (err: any) {
    if (err.status === 400 || err.response?.status === 400) {
      error('Données indisponibles', 'Aucune donnée disponible pour la période sélectionnée. Veuillez vérifier l\'année et réessayer.')
    } else {
      error('Erreur', err.message || 'Impossible de générer le rapport')
    }
  } finally {
    loadingHighlights.value = false
  }
}
</script>