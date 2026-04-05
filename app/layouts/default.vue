<template>
  <div class="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">

    <!-- Header -->
    <header class="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">

          <!-- Logo -->
          <div class="flex items-center space-x-6">
            <NuxtLink to="/" class="flex items-center gap-3 group">
              <div class="relative">
                <div class="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <div class="relative h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span class="text-lg font-black text-white">VTA</span>
                </div>
              </div>
              <h1 class="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                VTA System
              </h1>
            </NuxtLink>

            <!-- Navigation desktop -->
            <nav class="hidden lg:flex items-center space-x-1">

              <!-- Tableau de bord — toujours visible -->
              <NuxtLink to="/"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm flex items-center gap-2"
                :class="$route.path === '/' ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''">
                <Home class="h-4 w-4" />
                <span>Tableau de bord</span>
              </NuxtLink>

              <!-- Exploitants -->
              <NuxtLink v-if="nav.operators" to="/operators"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm flex items-center gap-2"
                :class="$route.path.startsWith('/operators') ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''">
                <Building2 class="h-4 w-4" />
                <span>Exploitants</span>
              </NuxtLink>

              <!-- Aéronefs (dropdown) -->
              <DropdownMenu v-if="nav.aircrafts || nav.aircraftTypes">
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm"
                    class="px-4 py-2 h-auto font-medium rounded-lg hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm"
                    :class="$route.path.startsWith('/aircrafts') ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''">
                    <Plane class="h-4 w-4 mr-2" />
                    Aéronefs
                    <ChevronDown class="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-56 border-2">
                  <DropdownMenuItem v-if="nav.aircraftTypes" as-child>
                    <NuxtLink to="/aircrafts/types" class="cursor-pointer flex items-center">
                      <Layers class="mr-2 h-4 w-4" />
                      <span>Types d'aéronefs</span>
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem v-if="nav.aircrafts" as-child>
                    <NuxtLink to="/aircrafts" class="cursor-pointer flex items-center">
                      <Plane class="mr-2 h-4 w-4" />
                      <span>Voir les aéronefs</span>
                    </NuxtLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <!-- Vols -->
              <NuxtLink v-if="nav.flights" to="/flights"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm flex items-center gap-2"
                :class="$route.path.startsWith('/flights') ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''">
                <PlaneTakeoff class="h-4 w-4" />
                <span>Vols</span>
              </NuxtLink>

              <!-- Plus (dropdown) — visible si au moins un item est accessible -->
              <DropdownMenu v-if="nav.agents || nav.imports || nav.reports || nav.permissions">
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm"
                    class="px-4 py-2 h-auto font-medium rounded-lg hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm">
                    <MoreHorizontal class="h-4 w-4 mr-2" />
                    Plus
                    <ChevronDown class="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-56 border-2">

                  <DropdownMenuItem v-if="nav.agents" as-child>
                    <NuxtLink to="/agents/" class="cursor-pointer flex items-center">
                      <Users class="mr-2 h-4 w-4" />
                      <span>Agents</span>
                    </NuxtLink>
                  </DropdownMenuItem>

                  <DropdownMenuItem v-if="nav.imports" as-child>
                    <NuxtLink to="/imports" class="cursor-pointer flex items-center">
                      <Upload class="mr-2 h-4 w-4" />
                      <span>Imports</span>
                    </NuxtLink>
                  </DropdownMenuItem>

                  <!-- Rapports -->
                  <DropdownMenuSub v-if="nav.reports">
                    <DropdownMenuSubTrigger class="cursor-pointer">
                      <FileText class="mr-2 h-4 w-4" />
                      <span>Rapports</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent class="w-48">
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports" class="cursor-pointer flex items-center">
                          <BarChart3 class="mr-2 h-4 w-4" />
                          <span>Tous les Rapports</span>
                        </NuxtLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports/traffic" class="cursor-pointer flex items-center">
                          <PlaneTakeoff class="mr-2 h-4 w-4" />
                          <span>Trafic</span>
                        </NuxtLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports/pax-bus" class="cursor-pointer flex items-center">
                          <Users class="mr-2 h-4 w-4" />
                          <span>Pax-Bus</span>
                        </NuxtLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports/idef" class="cursor-pointer flex items-center">
                          <Package class="mr-2 h-4 w-4" />
                          <span>IDEF</span>
                        </NuxtLink>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator v-if="nav.permissions && (nav.agents || nav.imports || nav.reports)" />

                  <DropdownMenuItem v-if="nav.permissions" as-child>
                    <NuxtLink to="/permissions" class="cursor-pointer flex items-center">
                      <Shield class="mr-2 h-4 w-4" />
                      <span>Permissions</span>
                    </NuxtLink>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

            </nav>
          </div>

          <!-- Droite : user + settings -->
          <div class="flex items-center gap-3">

            <!-- Infos user (desktop) -->
            <div v-if="authStore.user" class="hidden md:flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
              <div class="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <User class="h-4 w-4 text-white" />
              </div>
              <div class="text-sm">
                <div class="font-semibold">{{ authStore.user.username }}</div>
                <div class="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>{{ authStore.user.function ?? 'Agent VTA' }}</span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold" :class="roleBadgeClass">
                    {{ roleLabel }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bouton menu mobile -->
            <Button variant="outline" size="sm" class="lg:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
              <Menu v-if="!mobileMenuOpen" class="h-4 w-4" />
              <X v-else class="h-4 w-4" />
            </Button>

            <!-- Settings dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" class="gap-2">
                  <Settings class="h-4 w-4" />
                  <span class="hidden sm:inline">Paramètres</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56 border-2">
                <DropdownMenuLabel class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User class="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div class="font-semibold">{{ authStore.user?.username ?? 'Utilisateur' }}</div>
                    <div class="text-xs text-muted-foreground font-normal">{{ roleLabel }}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="cursor-pointer" as-child>
                  <NuxtLink to="/settings" class="flex items-center">
                    <User class="mr-2 h-4 w-4" />
                    Mon profil
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout" class="text-destructive cursor-pointer">
                  <LogOut class="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>

        <!-- Navigation mobile -->
        <Transition name="slide-fade">
          <nav v-if="mobileMenuOpen" class="lg:hidden mt-4 pt-4 border-t space-y-1">

            <NuxtLink to="/" @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
              :class="$route.path === '/' ? 'bg-muted text-primary' : ''">
              <Home class="h-4 w-4" />
              <span>Tableau de bord</span>
            </NuxtLink>

            <NuxtLink v-if="nav.operators" to="/operators" @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
              :class="$route.path.startsWith('/operators') ? 'bg-muted text-primary' : ''">
              <Building2 class="h-4 w-4" />
              <span>Exploitants</span>
            </NuxtLink>

            <template v-if="nav.aircrafts || nav.aircraftTypes">
              <div class="px-4 py-2 text-xs font-semibold text-muted-foreground">AÉRONEFS</div>
              <NuxtLink v-if="nav.aircraftTypes" to="/aircrafts/types" @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted ml-4"
                :class="$route.path === '/aircrafts/types' ? 'bg-muted text-primary' : ''">
                <Layers class="h-4 w-4" />
                <span>Types d'aéronefs</span>
              </NuxtLink>
              <NuxtLink v-if="nav.aircrafts" to="/aircrafts" @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted ml-4"
                :class="$route.path === '/aircrafts' ? 'bg-muted text-primary' : ''">
                <Plane class="h-4 w-4" />
                <span>Voir les aéronefs</span>
              </NuxtLink>
            </template>

            <NuxtLink v-if="nav.flights" to="/flights" @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
              :class="$route.path.startsWith('/flights') ? 'bg-muted text-primary' : ''">
              <PlaneTakeoff class="h-4 w-4" />
              <span>Vols</span>
            </NuxtLink>

            <template v-if="nav.agents || nav.imports">
              <div class="px-4 py-2 text-xs font-semibold text-muted-foreground">ADMINISTRATION</div>
              <NuxtLink v-if="nav.agents" to="/agents/" @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted">
                <Users class="h-4 w-4" />
                <span>Agents</span>
              </NuxtLink>
              <NuxtLink v-if="nav.imports" to="/imports" @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
                :class="$route.path.startsWith('/imports') ? 'bg-muted text-primary' : ''">
                <Upload class="h-4 w-4" />
                <span>Imports</span>
              </NuxtLink>
            </template>

            <template v-if="nav.reports">
              <div class="px-4 py-2 text-xs font-semibold text-muted-foreground">RAPPORTS</div>
              <NuxtLink to="/reports/traffic" @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted ml-4">
                <PlaneTakeoff class="h-4 w-4" />
                <span>Trafic</span>
              </NuxtLink>
              <NuxtLink to="/reports/pax-bus" @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted ml-4">
                <Users class="h-4 w-4" />
                <span>Pax-Bus</span>
              </NuxtLink>
              <NuxtLink to="/reports/idef" @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted ml-4">
                <Package class="h-4 w-4" />
                <span>IDEF</span>
              </NuxtLink>
            </template>

            <NuxtLink v-if="nav.permissions" to="/permissions" @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted">
              <Shield class="h-4 w-4" />
              <span>Permissions</span>
            </NuxtLink>

          </nav>
        </Transition>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="min-h-screen container mx-auto px-4 py-6 md:pb-24 md:pt-16 relative">
      <div class="relative">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm bottom-0 fixed w-full">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <div class="h-6 w-6 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span class="text-xs font-bold text-white">V</span>
            </div>
            <span>© {{ new Date().getFullYear() }} VTA System. Tous droits réservés.</span>
          </div>
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" class="hover:text-primary transition-colors">Documentation</a>
            <span>•</span>
            <a href="#" class="hover:text-primary transition-colors">Support</a>
            <span>•</span>
            <span class="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>

    <AppToaster />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppToaster from '@/components/modules/toaster/AppToaster.vue'
import {
  BarChart3, User, LogOut, Settings, ChevronDown, Layers, Plane,
  Building2, Home, PlaneTakeoff, Users, FileText, Shield,
  MoreHorizontal, Menu, X, Package, Upload
} from 'lucide-vue-next'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const authStore     = useAuthStore()
const mobileMenuOpen = ref(false)
const { success, error } = useToast()

// nav est un computed réactif — se met à jour automatiquement
// dès que authStore.user change (ex: après refreshMe())
const { nav } = usePermission()

// ── Label et badge du rôle courant ────────────────────────────────────────────

const roleLabel = computed(() => ({
  admin:     'Administrateur',
  manager:   'Manager',
  permanent: 'Permanent',
  agent:     'Agent',
}[authStore.user?.role ?? ''] ?? ''))

const roleBadgeClass = computed(() => ({
  admin:     'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  manager:   'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  permanent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  agent:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}[authStore.user?.role ?? ''] ?? 'bg-gray-100 text-gray-600'))

// ── Déconnexion ───────────────────────────────────────────────────────────────

const handleLogout = async () => {
  try {
    await authStore.logout()
    success('Déconnexion réussie', 'Vous avez été déconnecté avec succès')
  } catch {
    error('Erreur', 'Une erreur est survenue lors de la déconnexion')
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>