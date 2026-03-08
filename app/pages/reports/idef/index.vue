<template>
  <div class="space-y-6 h-[78vh]">
    <!-- Header -->
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

    <!-- Types de rapports -->
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

    <!-- Dialogs -->
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Package,
  Calendar,
  CalendarDays,
  Download
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import GenericMonthlyReportDialog from '~/components/modules/report/GenericMonthlyReportDialog.vue'
import GenericAnnualReportDialog from '~/components/modules/report/GenericAnnualReportDialog.vue'

definePageMeta({
  middleware: 'auth'
})

const { success, error } = useToast()
const { apiFetch } = useApi()

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

// États des dialogs
const monthlyDialogOpen = ref(false)
const annualDialogOpen = ref(false)

// États de chargement
const loadingMonthly = ref(false)
const loadingAnnual = ref(false)

// Génération des rapports
const generateMonthlyReport = async (form: { month: string; year: string }) => {
  loadingMonthly.value = true
  try {
    const url = `/idef-report/monthly/export/${form.month}/${form.year}`
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