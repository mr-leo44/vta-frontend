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
        @click="openMonthlyDialog">
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
        @click="openAnnualDialog">
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

    <!-- Dialog Rapport Mensuel -->
    <Dialog v-model:open="monthlyDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rapport Mensuel IDEF-GOPASS</DialogTitle>
          <DialogDescription>
            Sélectionnez le mois, l'année et le régime pour générer le rapport
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="month">Mois</Label>
            <Select v-model="monthlyForm.month">
              <SelectTrigger id="month">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Janvier</SelectItem>
                <SelectItem value="2">Février</SelectItem>
                <SelectItem value="3">Mars</SelectItem>
                <SelectItem value="4">Avril</SelectItem>
                <SelectItem value="5">Mai</SelectItem>
                <SelectItem value="6">Juin</SelectItem>
                <SelectItem value="7">Juillet</SelectItem>
                <SelectItem value="8">Août</SelectItem>
                <SelectItem value="9">Septembre</SelectItem>
                <SelectItem value="10">Octobre</SelectItem>
                <SelectItem value="11">Novembre</SelectItem>
                <SelectItem value="12">Décembre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="year">Année</Label>
            <Select v-model="monthlyForm.year">
              <SelectTrigger id="year">
                <SelectValue placeholder="Sélectionner une année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="year in availableYears" :key="year" :value="String(year)">
                  {{ year }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="monthlyDialogOpen = false">
            Annuler
          </Button>
          <Button @click="generateMonthlyReport" :disabled="!isMonthlyFormValid || loadingMonthly">
            <Loader2 v-if="loadingMonthly" class="mr-2 h-4 w-4 animate-spin" />
            <Download v-else class="mr-2 h-4 w-4" />
            Générer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog Rapport Annuel -->
    <Dialog v-model:open="annualDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rapport Annuel IDEF-GPASS</DialogTitle>
          <DialogDescription>
            Sélectionnez l'année et le régime pour générer le rapport annuel
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="annual-year">Année</Label>
            <Select v-model="annualForm.year">
              <SelectTrigger id="annual-year">
                <SelectValue placeholder="Sélectionner une année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="year in availableYears" :key="year" :value="String(year)">
                  {{ year }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="annualDialogOpen = false">
            Annuler
          </Button>
          <Button @click="generateAnnualReport" :disabled="!isAnnualFormValid || loadingAnnual">
            <Loader2 v-if="loadingAnnual" class="mr-2 h-4 w-4 animate-spin" />
            <Download v-else class="mr-2 h-4 w-4" />
            Générer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Package,
  Calendar,
  CalendarDays,
  Download,
  Loader2
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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


definePageMeta({
  middleware: 'auth'
})

const { success, error } = useToast()
const { apiFetch } = useApi()

// États des dialogs
const monthlyDialogOpen = ref(false)
const annualDialogOpen = ref(false)

// États de chargement
const loadingMonthly = ref(false)
const loadingAnnual = ref(false)

// Formulaires
const monthlyForm = ref({
  month: '',
  year: '',
})

const annualForm = ref({
  year: '',
})

// Années disponibles
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 2025; i <= currentYear; i++) {
    years.push(i)
  }
  return years.reverse()
})

// Validations
const isMonthlyFormValid = computed(() => {
  return monthlyForm.value.month && monthlyForm.value.year
})

const isAnnualFormValid = computed(() => {
  return annualForm.value.year
})

// Handlers
const openMonthlyDialog = () => {
  monthlyDialogOpen.value = true
}

const openAnnualDialog = () => {
  annualDialogOpen.value = true
}

// Génération des rapports
const generateMonthlyReport = async () => {
  loadingMonthly.value = true
  try {
    // TODO: Implémenter l'endpoint pour le rapport mensuel IDEF-GOPASS
    const url = `/idef-report/monthly/export/${monthlyForm.value.month}/${monthlyForm.value.year}`

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
    const monthName = MONTH_NAMES[monthlyForm.value.month] || 'MOIS'
    link.download = `IDEF ${monthName} ${monthlyForm.value.year}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    success('Rapport généré', 'Le rapport mensuel IDEF-GO PASS a été téléchargé avec succès')
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

const generateAnnualReport = async () => {
  loadingAnnual.value = true
  try {
    // TODO: Implémenter l'endpoint pour le rapport annuel IDEF-GOPASS
    const url = `/idef-report/yearly/export/${annualForm.value.year}`

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
    link.download = `IDEF_FRET_ANNUEL_${annualForm.value.year}.xlsx`
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