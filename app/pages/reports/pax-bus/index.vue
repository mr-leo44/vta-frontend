<template>
  <div class="p-8 max-w-7xl mx-auto space-y-8">
    <ReportHeader />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCardItem
        title="Rapport Quinzaine"
        description="Générer le rapport par quinzaine (Q1 ou Q2) pour Paxbus"
        badge="Hebdomadaire"
        :icon="CalendarRange"
        gradient-class="bg-linear-to-br from-orange-500 to-amber-600"
        hover-border-class="hover:border-orange-200"
        @click="isBiMonthlyDialogOpen = true"
      />

      <ReportCardItem
        title="Rapport Mensuel"
        description="Générer le rapport récapitulatif mensuel Paxbus"
        badge="Mensuel"
        :icon="CalendarDays"
        gradient-class="bg-linear-to-br from-blue-500 to-indigo-600"
        hover-border-class="hover:border-blue-200"
        @click="isMonthlyDialogOpen = true"
      />

      <ReportCardItem
        title="Rapport Annuel"
        description="Générer le rapport de performance annuel Paxbus"
        badge="Annuel"
        :icon="BarChart3"
        gradient-class="bg-linear-to-br from-purple-500 to-pink-600"
        hover-border-class="hover:border-purple-200"
        @click="isAnnualDialogOpen = true"
      />
    </div>

    <BiMonthlyReportDialog
      v-model:open="isBiMonthlyDialogOpen"
      :loading="loading"
      @generate="handleGenerateBiMonthly"
    />

    <MonthlyReportDialog
      v-model:open="isMonthlyDialogOpen"
      :loading="loading"
      @generate="handleGenerateMonthly"
    />

    <AnnualReportDialog
      v-model:open="isAnnualDialogOpen"
      :loading="loading"
      @generate="handleGenerateAnnual"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CalendarDays, CalendarRange, BarChart3 } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import ReportHeader from '@/components/modules/report/paxbus/ReportHeader.vue'
import ReportCardItem from '@/components/modules/report/ReportCardItem.vue'
import MonthlyReportDialog from '@/components/modules/report/paxbus/MonthlyReportDIalog.vue'
import AnnualReportDialog from '@/components/modules/report/paxbus/AnnualReportDialog.vue'
import BiMonthlyReportDialog from '@/components/modules/report/paxbus/BiMonthlyReportDialog.vue'

const { success, error } = useToast()
const loading = ref(false)
const { apiFetch } = useApi()

// États des Dialogues
const isMonthlyDialogOpen = ref(false)
const isBiMonthlyDialogOpen = ref(false)
const isAnnualDialogOpen = ref(false)

/**
 * Logique de téléchargement de fichier
 */
const downloadFile = async (endpoint: string, fileName: string) => {
  loading.value = true
  try {
    // Note: Remplacez par votre logique d'appel API réelle ($fetch ou apiFetch)
    const response = await apiFetch(endpoint, {
      responseType: 'blob',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    
    const url = window.URL.createObjectURL(new Blob([response as any]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    success("Génération réussie", `Le fichier ${fileName} a été téléchargé.` )
  } catch (error) {
    error("Erreur", "Une erreur est survenue lors de la génération du rapport.")
  } finally {
    loading.value = false
  }
}

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

const handleGenerateBiMonthly = (form: { period: string; month: string; year: string }) => {
  const monthName = MONTH_NAMES[form.month] || 'MOIS'
  downloadFile(
    `/paxbus-report/weekly/export/${form.period}/${form.month}/${form.year}`,
    `RAPPORT HEBDOMADAIRE PAX BUS ${form.period} ${monthName} ${form.year}.xlsx`
  )
  isBiMonthlyDialogOpen.value = false
}

const handleGenerateMonthly = (form: { month: string; year: string }) => {
  const monthName = MONTH_NAMES[form.month] || 'MOIS'
  downloadFile(
    `/paxbus-report/export/${form.month}/${form.year}`,
    `RAPPORT MENSUEL PAX BUS ${monthName}_${form.year}.xlsx`
  )
  isMonthlyDialogOpen.value = false
}

const handleGenerateAnnual = (form: { year: string }) => {
  downloadFile(
    `/paxbus-report/export/${form.year}`,
    `RAPPORT ANNUEL PAX BUS ${form.year}.xlsx`
  )
  isAnnualDialogOpen.value = false
}
</script>