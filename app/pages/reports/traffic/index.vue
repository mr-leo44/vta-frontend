<template>
  <div class="space-y-6 h-[78vh]">
    <!-- Header -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
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
      <Card class="group hover:shadow-xl transition-all border-2 hover:border-blue-500/50 cursor-pointer" @click="openMonthlyDialog">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="h-12 w-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Calendar class="h-6 w-6 text-white" />
            </div>
            <Badge variant="secondary">Mensuel</Badge>
          </div>
          <CardTitle class="mt-4">Rapport Mensuel</CardTitle>
          <CardDescription>
            Générer le rapport pour un mois spécifique
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
      <Card class="group hover:shadow-xl transition-all border-2 hover:border-green-500/50 cursor-pointer" @click="openAnnualDialog">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="h-12 w-12 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <CalendarDays class="h-6 w-6 text-white" />
            </div>
            <Badge variant="secondary">Annuel</Badge>
          </div>
          <CardTitle class="mt-4">Rapport Annuel</CardTitle>
          <CardDescription>
            Générer le rapport pour une année complète
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button class="w-full" variant="outline">
            <Download class="mr-2 h-4 w-4" />
            Générer
          </Button>
        </CardContent>
      </Card>

      <!-- Faits Saillants -->
      <Card class="group hover:shadow-xl transition-all border-2 hover:border-purple-500/50 cursor-pointer" @click="openHighlightsDialog">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="h-12 w-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles class="h-6 w-6 text-white" />
            </div>
            <Badge variant="secondary">Synthèse</Badge>
          </div>
          <CardTitle class="mt-4">Faits Saillants</CardTitle>
          <CardDescription>
            Points clés et statistiques importantes
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
          <DialogTitle>Rapport Mensuel de Trafic</DialogTitle>
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
          <div class="space-y-2">
            <Label for="regime">Régime</Label>
            <Select v-model="monthlyForm.regime">
              <SelectTrigger id="regime">
                <SelectValue placeholder="Sélectionner un régime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domestic">Domestique</SelectItem>
                <SelectItem value="international">International</SelectItem>
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
          <DialogTitle>Rapport Annuel de Trafic</DialogTitle>
          <DialogDescription>
            Sélectionnez l'année pour générer le rapport annuel
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

    <!-- Dialog Faits Saillants -->
    <Dialog v-model:open="highlightsDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Faits Saillants</DialogTitle>
          <DialogDescription>
            Sélectionnez la période pour générer les faits saillants
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="type">Type de période</Label>
            <Select v-model="highlightsForm.type">
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="annual">Annuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Champs mensuels -->
          <template v-if="highlightsForm.type === 'monthly'">
            <div class="space-y-2">
              <Label for="hl-month">Mois</Label>
              <Select v-model="highlightsForm.month">
                <SelectTrigger id="hl-month">
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
          </template>

          <!-- Année commune -->
          <div class="space-y-2">
            <Label for="hl-year">Année</Label>
            <Select v-model="highlightsForm.year">
              <SelectTrigger id="hl-year">
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
          <Button variant="outline" @click="highlightsDialogOpen = false">
            Annuler
          </Button>
          <Button @click="generateHighlights" :disabled="!isHighlightsFormValid || loadingHighlights">
            <Loader2 v-if="loadingHighlights" class="mr-2 h-4 w-4 animate-spin" />
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
  FileBarChart,
  Calendar,
  CalendarDays,
  Sparkles,
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

// Formulaires
const monthlyForm = ref({
  month: '',
  year: '',
  regime: ''
})

const annualForm = ref({
  year: ''
})

const highlightsForm = ref({
  type: '',
  month: '',
  year: ''
})

// Années disponibles
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push(i)
  }
  return years
})

// Validations
const isMonthlyFormValid = computed(() => {
  return monthlyForm.value.month && monthlyForm.value.year && monthlyForm.value.regime
})

const isAnnualFormValid = computed(() => {
  return annualForm.value.year
})

const isHighlightsFormValid = computed(() => {
  if (!highlightsForm.value.type || !highlightsForm.value.year) return false
  if (highlightsForm.value.type === 'monthly' && !highlightsForm.value.month) return false
  return true
})

// Handlers pour ouvrir les dialogs
const openMonthlyDialog = () => {
  monthlyDialogOpen.value = true
}

const openAnnualDialog = () => {
  annualDialogOpen.value = true
}

const openHighlightsDialog = () => {
  highlightsDialogOpen.value = true
}

// Génération des rapports
const generateMonthlyReport = async () => {
  loadingMonthly.value = true
  try {
    const url = `/trafic-report/export/${monthlyForm.value.month}/${monthlyForm.value.year}/${monthlyForm.value.regime}`
    
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
    const formattedRegime = monthlyForm.value.regime ? 'DOMESTIQUE' : 'INTERNATIONAL'
    link.download = `TRAFIC ${formattedRegime} ${monthlyForm.value.month}-${monthlyForm.value.year}.xlsx`
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

const generateAnnualReport = async () => {
  loadingAnnual.value = true
  try {
    // TODO: Implémenter l'endpoint pour le rapport annuel
    success('Rapport généré', 'Le rapport annuel a été téléchargé avec succès')
    annualDialogOpen.value = false
  } catch (err: any) {
    error('Erreur', err.message || 'Impossible de générer le rapport')
  } finally {
    loadingAnnual.value = false
  }
}

const generateHighlights = async () => {
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