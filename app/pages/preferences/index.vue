<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Sliders class="h-7 w-7" />
          </div>
          <div>
            <h1 class="text-4xl font-bold">Préférences</h1>
            <p class="text-white/90 text-sm mt-1">
              Personnaliser votre expérience utilisateur
            </p>
          </div>
        </div>
      </div>
      <!-- Decorative circles -->
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Display Preferences -->
      <Card class="border-2 shadow-lg">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Monitor class="h-5 w-5" />
            Préférences d'affichage
          </CardTitle>
          <CardDescription>
            Configurer l'affichage des données
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label>Vue par défaut des listes</Label>
            <Select v-model="displayPrefs.defaultView">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div class="flex items-center gap-2">
                    <LayoutGrid class="h-4 w-4" />
                    Grille
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div class="flex items-center gap-2">
                    <List class="h-4 w-4" />
                    Liste
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Éléments par page</Label>
            <Select v-model="displayPrefs.itemsPerPage">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Format de date</Label>
            <Select v-model="displayPrefs.dateFormat">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">JJ/MM/AAAA</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/JJ/AAAA</SelectItem>
                <SelectItem value="yyyy-mm-dd">AAAA-MM-JJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Format d'heure</Label>
            <Select v-model="displayPrefs.timeFormat">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 heures</SelectItem>
                <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Animations</Label>
              <p class="text-sm text-muted-foreground">Activer les animations de l'interface</p>
            </div>
            <input type="checkbox" v-model="displayPrefs.animations" class="h-5 w-5 rounded" />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Mode compact</Label>
              <p class="text-sm text-muted-foreground">Réduire l'espacement</p>
            </div>
            <input type="checkbox" v-model="displayPrefs.compactMode" class="h-5 w-5 rounded" />
          </div>
        </CardContent>
      </Card>

      <!-- Data Preferences -->
      <Card class="border-2 shadow-lg">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Database class="h-5 w-5" />
            Préférences des données
          </CardTitle>
          <CardDescription>
            Configurer le comportement des données
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label>Tri par défaut</Label>
            <Select v-model="dataPrefs.defaultSort">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
                <SelectItem value="name_desc">Nom (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Chargement automatique</Label>
            <Select v-model="dataPrefs.autoLoad">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Activé</SelectItem>
                <SelectItem value="disabled">Désactivé</SelectItem>
                <SelectItem value="wifi-only">Wifi uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Mise en cache</Label>
            <Select v-model="dataPrefs.caching">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aggressive">Agressive</SelectItem>
                <SelectItem value="moderate">Modérée</SelectItem>
                <SelectItem value="minimal">Minimale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Actualisation auto</Label>
              <p class="text-sm text-muted-foreground">Rafraîchir automatiquement</p>
            </div>
            <input type="checkbox" v-model="dataPrefs.autoRefresh" class="h-5 w-5 rounded" />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Confirmation de suppression</Label>
              <p class="text-sm text-muted-foreground">Toujours demander confirmation</p>
            </div>
            <input type="checkbox" v-model="dataPrefs.deleteConfirmation" class="h-5 w-5 rounded" />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Sauvegarde automatique</Label>
              <p class="text-sm text-muted-foreground">Sauvegarder les brouillons</p>
            </div>
            <input type="checkbox" v-model="dataPrefs.autoSave" class="h-5 w-5 rounded" />
          </div>
        </CardContent>
      </Card>

      <!-- Dashboard Preferences -->
      <Card class="border-2 shadow-lg">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <LayoutDashboard class="h-5 w-5" />
            Tableau de bord
          </CardTitle>
          <CardDescription>
            Personnaliser votre tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            <Label>Widgets à afficher</Label>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center gap-2">
                <TrendingUp class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Statistiques</span>
              </div>
              <input type="checkbox" v-model="dashboardPrefs.showStats" class="h-4 w-4 rounded" />
            </div>

            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center gap-2">
                <Activity class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Activités récentes</span>
              </div>
              <input type="checkbox" v-model="dashboardPrefs.showActivity" class="h-4 w-4 rounded" />
            </div>

            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center gap-2">
                <Zap class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Accès rapide</span>
              </div>
              <input type="checkbox" v-model="dashboardPrefs.showQuickAccess" class="h-4 w-4 rounded" />
            </div>

            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center gap-2">
                <BarChart3 class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Graphiques</span>
              </div>
              <input type="checkbox" v-model="dashboardPrefs.showCharts" class="h-4 w-4 rounded" />
            </div>
          </div>

          <Separator />

          <div class="space-y-2">
            <Label>Page d'accueil</Label>
            <Select v-model="dashboardPrefs.homePage">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Tableau de bord</SelectItem>
                <SelectItem value="flights">Vols</SelectItem>
                <SelectItem value="operators">Exploitants</SelectItem>
                <SelectItem value="aircrafts">Aéronefs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <!-- Export/Import Preferences -->
      <Card class="border-2 shadow-lg">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Download class="h-5 w-5" />
            Export / Import
          </CardTitle>
          <CardDescription>
            Gérer vos préférences
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label>Format d'export par défaut</Label>
            <Select v-model="exportPrefs.defaultFormat">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div class="space-y-3">
            <Button variant="outline" class="w-full gap-2">
              <Download class="h-4 w-4" />
              Exporter mes préférences
            </Button>
            <Button variant="outline" class="w-full gap-2">
              <Upload class="h-4 w-4" />
              Importer des préférences
            </Button>
            <Button variant="outline" class="w-full gap-2 text-destructive hover:text-destructive">
              <RotateCcw class="h-4 w-4" />
              Réinitialiser tout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Save Actions -->
    <Card class="border-2 shadow-lg">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Info class="h-4 w-4" />
            <span>Vos modifications seront appliquées immédiatement</span>
          </div>
          <div class="flex gap-3">
            <Button variant="outline" class="gap-2">
              <X class="h-4 w-4" />
              Annuler
            </Button>
            <Button class="gap-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Save class="h-4 w-4" />
              Enregistrer toutes les préférences
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Sliders,
  Monitor,
  Database,
  LayoutDashboard,
  Download,
  Upload,
  Save,
  X,
  Info,
  LayoutGrid,
  List,
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  RotateCcw
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

definePageMeta({
  middleware: 'auth'
})

const displayPrefs = ref({
  defaultView: 'grid',
  itemsPerPage: '25',
  dateFormat: 'dd/mm/yyyy',
  timeFormat: '24h',
  animations: true,
  compactMode: false
})

const dataPrefs = ref({
  defaultSort: 'newest',
  autoLoad: 'enabled',
  caching: 'moderate',
  autoRefresh: true,
  deleteConfirmation: true,
  autoSave: true
})

const dashboardPrefs = ref({
  showStats: true,
  showActivity: true,
  showQuickAccess: true,
  showCharts: true,
  homePage: 'dashboard'
})

const exportPrefs = ref({
  defaultFormat: 'excel'
})
</script>