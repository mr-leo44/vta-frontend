<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-600 via-gray-700 to-zinc-800 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Settings class="h-7 w-7" />
          </div>
          <div>
            <h1 class="text-4xl font-bold">Paramètres</h1>
            <p class="text-white/90 text-sm mt-1">
              Gérer les paramètres de votre compte et de l'application
            </p>
          </div>
        </div>
      </div>
      <!-- Decorative circles -->
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    </div>

    <!-- Settings Navigation Tabs -->
    <Card class="border-2 shadow-lg">
      <CardContent class="p-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="profile" class="gap-2">
              <User class="h-4 w-4" />
              <span class="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" class="gap-2">
              <Lock class="h-4 w-4" />
              <span class="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" class="gap-2">
              <Bell class="h-4 w-4" />
              <span class="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" class="gap-2">
              <Palette class="h-4 w-4" />
              <span class="hidden sm:inline">Apparence</span>
            </TabsTrigger>
          </TabsList>

          <!-- Profile Tab -->
          <TabsContent value="profile" class="space-y-6 mt-6">
            <Card class="border-2">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <User class="h-5 w-5" />
                  Informations du profil
                </CardTitle>
                <CardDescription>
                  Gérer vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <!-- Avatar -->
                <div class="flex items-center gap-6">
                  <div class="relative group">
                    <div class="h-24 w-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                      <User class="h-12 w-12 text-white" />
                    </div>
                    <Button size="sm" variant="secondary" class="absolute bottom-0 right-0 rounded-full shadow-lg">
                      <Camera class="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ authStore.user?.username }}</h3>
                    <p class="text-sm text-muted-foreground">Administrateur</p>
                    <Button variant="outline" size="sm" class="mt-2 gap-2">
                      <Upload class="h-3 w-3" />
                      Changer l'avatar
                    </Button>
                  </div>
                </div>

                <Separator />

                <!-- Form Fields -->
                <div class="grid gap-4 md:grid-cols-2">
                  <div class="space-y-2">
                    <Label>Nom d'utilisateur</Label>
                    <Input v-model="profileForm.username" placeholder="Votre nom d'utilisateur" />
                  </div>
                  <div class="space-y-2">
                    <Label>Email</Label>
                    <Input v-model="profileForm.email" type="email" placeholder="votre@email.com" />
                  </div>
                  <div class="space-y-2">
                    <Label>Prénom</Label>
                    <Input v-model="profileForm.firstName" placeholder="Votre prénom" />
                  </div>
                  <div class="space-y-2">
                    <Label>Nom</Label>
                    <Input v-model="profileForm.lastName" placeholder="Votre nom" />
                  </div>
                  <div class="space-y-2">
                    <Label>Téléphone</Label>
                    <Input v-model="profileForm.phone" type="tel" placeholder="+33 6 12 34 56 78" />
                  </div>
                  <div class="space-y-2">
                    <Label>Rôle</Label>
                    <Select v-model="profileForm.role" disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="flex justify-end gap-3">
                  <Button variant="outline">Annuler</Button>
                  <Button class="gap-2">
                    <Save class="h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Security Tab -->
          <TabsContent value="security" class="space-y-6 mt-6">
            <Card class="border-2">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Lock class="h-5 w-5" />
                  Changer le mot de passe
                </CardTitle>
                <CardDescription>
                  Mettre à jour votre mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <Input v-model="securityForm.currentPassword" type="password" />
                </div>
                <div class="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input v-model="securityForm.newPassword" type="password" />
                </div>
                <div class="space-y-2">
                  <Label>Confirmer le nouveau mot de passe</Label>
                  <Input v-model="securityForm.confirmPassword" type="password" />
                </div>

                <div class="flex justify-end gap-3">
                  <Button variant="outline">Annuler</Button>
                  <Button class="gap-2">
                    <Key class="h-4 w-4" />
                    Mettre à jour
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card class="border-2">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Shield class="h-5 w-5" />
                  Authentification à deux facteurs
                </CardTitle>
                <CardDescription>
                  Ajouter une couche de sécurité supplémentaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                      <AlertTriangle class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div class="font-medium">2FA désactivée</div>
                      <div class="text-sm text-muted-foreground">Activez pour plus de sécurité</div>
                    </div>
                  </div>
                  <Button variant="outline" class="gap-2">
                    <Shield class="h-4 w-4" />
                    Activer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card class="border-2">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <History class="h-5 w-5" />
                  Sessions actives
                </CardTitle>
                <CardDescription>
                  Gérer vos sessions connectées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                        <Monitor class="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div class="font-medium">Chrome sur Windows</div>
                        <div class="text-sm text-muted-foreground">Paris, France • Actif maintenant</div>
                      </div>
                    </div>
                    <Badge variant="default" class="gap-1">
                      <div class="h-2 w-2 rounded-full bg-green-200 animate-pulse"></div>
                      Actuel
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Notifications Tab -->
          <TabsContent value="notifications" class="space-y-6 mt-6">
            <Card class="border-2">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Bell class="h-5 w-5" />
                  Préférences de notifications
                </CardTitle>
                <CardDescription>
                  Choisir comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div class="space-y-0.5">
                      <Label class="text-base">Notifications email</Label>
                      <p class="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                    </div>
                    <input type="checkbox" v-model="notificationSettings.email" class="h-5 w-5 rounded" />
                  </div>

                  <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div class="space-y-0.5">
                      <Label class="text-base">Notifications push</Label>
                      <p class="text-sm text-muted-foreground">Recevoir des notifications push</p>
                    </div>
                    <input type="checkbox" v-model="notificationSettings.push" class="h-5 w-5 rounded" />
                  </div>

                  <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div class="space-y-0.5">
                      <Label class="text-base">Nouveaux vols</Label>
                      <p class="text-sm text-muted-foreground">Être notifié lors de l'ajout de nouveaux vols</p>
                    </div>
                    <input type="checkbox" v-model="notificationSettings.newFlights" class="h-5 w-5 rounded" />
                  </div>

                  <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div class="space-y-0.5">
                      <Label class="text-base">Modifications importantes</Label>
                      <p class="text-sm text-muted-foreground">Alertes pour les changements critiques</p>
                    </div>
                    <input type="checkbox" v-model="notificationSettings.critical" class="h-5 w-5 rounded" />
                  </div>

                  <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div class="space-y-0.5">
                      <Label class="text-base">Rapports hebdomadaires</Label>
                      <p class="text-sm text-muted-foreground">Recevoir un résumé hebdomadaire</p>
                    </div>
                    <input type="checkbox" v-model="notificationSettings.weekly" class="h-5 w-5 rounded" />
                  </div>
                </div>

                <div class="flex justify-end gap-3">
                  <Button variant="outline">Réinitialiser</Button>
                  <Button class="gap-2">
                    <Save class="h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Appearance Tab -->
          <TabsContent value="appearance" class="space-y-6 mt-6">
            <Card class="border-2">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Palette class="h-5 w-5" />
                  Thème de l'application
                </CardTitle>
                <CardDescription>
                  Personnaliser l'apparence de l'interface
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="grid gap-4 md:grid-cols-3">
                  <div class="cursor-pointer group" @click="appearanceSettings.theme = 'light'">
                    <div :class="[
                      'border-2 rounded-lg p-4 transition-all',
                      appearanceSettings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted'
                    ]">
                      <div class="h-32 rounded bg-white border-2 mb-3 flex items-center justify-center">
                        <Sun class="h-8 w-8 text-amber-500" />
                      </div>
                      <div class="font-medium text-center">Clair</div>
                    </div>
                  </div>

                  <div class="cursor-pointer group" @click="appearanceSettings.theme = 'dark'">
                    <div :class="[
                      'border-2 rounded-lg p-4 transition-all',
                      appearanceSettings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted'
                    ]">
                      <div class="h-32 rounded bg-gray-900 border-2 mb-3 flex items-center justify-center">
                        <Moon class="h-8 w-8 text-blue-400" />
                      </div>
                      <div class="font-medium text-center">Sombre</div>
                    </div>
                  </div>

                  <div class="cursor-pointer group" @click="appearanceSettings.theme = 'system'">
                    <div :class="[
                      'border-2 rounded-lg p-4 transition-all',
                      appearanceSettings.theme === 'system' ? 'border-primary bg-primary/5' : 'border-muted'
                    ]">
                      <div class="h-32 rounded bg-linear-to-r from-white to-gray-900 border-2 mb-3 flex items-center justify-center">
                        <Monitor class="h-8 w-8" />
                      </div>
                      <div class="font-medium text-center">Système</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div class="space-y-4">
                  <div>
                    <Label class="text-base mb-2 block">Langue de l'interface</Label>
                    <Select v-model="appearanceSettings.language">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label class="text-base mb-2 block">Densité de l'interface</Label>
                    <Select v-model="appearanceSettings.density">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comfortable">Confortable</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="spacious">Spacieux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="flex justify-end gap-3">
                  <Button variant="outline">Réinitialiser</Button>
                  <Button class="gap-2">
                    <Save class="h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- Danger Zone -->
    <Card class="border-2 border-destructive/50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-destructive">
          <AlertTriangle class="h-5 w-5" />
          Zone dangereuse
        </CardTitle>
        <CardDescription>
          Actions irréversibles sur votre compte
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div>
            <div class="font-medium">Supprimer mon compte</div>
            <div class="text-sm text-muted-foreground">Cette action est irréversible</div>
          </div>
          <Button variant="destructive" class="gap-2">
            <Trash2 class="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Settings,
  User,
  Lock,
  Bell,
  Palette,
  Camera,
  Upload,
  Save,
  Key,
  Shield,
  AlertTriangle,
  History,
  Monitor,
  Sun,
  Moon,
  Trash2
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
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

const authStore = useAuthStore()

const activeTab = ref('profile')

const profileForm = ref({
  username: authStore.user?.username || '',
  email: 'user@example.com',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'admin'
})

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = ref({
  email: true,
  push: true,
  newFlights: true,
  critical: true,
  weekly: false
})

const appearanceSettings = ref({
  theme: 'system',
  language: 'fr',
  density: 'comfortable'
})
</script>