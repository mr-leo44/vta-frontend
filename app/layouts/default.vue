<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">

    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-14">

          <!-- Logo + Nav -->
          <div class="flex items-center gap-8">
            <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0">
              <div class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <span class="text-sm font-black text-white tracking-tight">VTA</span>
              </div>
              <span class="text-base font-bold text-gray-900 dark:text-white hidden sm:block">VTA System</span>
            </NuxtLink>

            <!-- Nav desktop -->
            <nav class="hidden lg:flex items-center gap-1">

              <NuxtLink to="/" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150" :class="$route.path === '/' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
                <Home class="h-3.5 w-3.5" />
                Tableau de bord
              </NuxtLink>

              <NuxtLink v-if="nav.operators" to="/operators" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                :class="$route.path.startsWith('/operators') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
                <Building2 class="h-3.5 w-3.5" />
                Exploitants
              </NuxtLink>

              <DropdownMenu v-if="nav.aircrafts || nav.aircraftTypes">
                <DropdownMenuTrigger as-child>
                  <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150" :class="$route.path.startsWith('/aircrafts') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
                    <Plane class="h-3.5 w-3.5" />
                    Aéronefs
                    <ChevronDown class="h-3 w-3 ml-0.5 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-48">
                  <DropdownMenuItem v-if="nav.aircraftTypes" as-child>
                    <NuxtLink to="/aircrafts/types" class="flex items-center gap-2 cursor-pointer">
                      <Layers class="h-4 w-4 text-gray-400" />
                      Types d'aéronefs
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem v-if="nav.aircrafts" as-child>
                    <NuxtLink to="/aircrafts" class="flex items-center gap-2 cursor-pointer">
                      <Plane class="h-4 w-4 text-gray-400" />
                      Aéronefs
                    </NuxtLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NuxtLink v-if="nav.flights" to="/flights" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                :class="$route.path.startsWith('/flights') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
                <PlaneTakeoff class="h-3.5 w-3.5" />
                Vols
              </NuxtLink>

              <DropdownMenu v-if="nav.agents || nav.imports || nav.reports || nav.permissions">
                <DropdownMenuTrigger as-child>
                  <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150">
                    <MoreHorizontal class="h-3.5 w-3.5" />
                    Plus
                    <ChevronDown class="h-3 w-3 ml-0.5 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-48">

                  <DropdownMenuItem v-if="nav.agents" as-child>
                    <NuxtLink to="/agents/" class="flex items-center gap-2 cursor-pointer">
                      <Users class="h-4 w-4 text-gray-400" />
                      Agents
                    </NuxtLink>
                  </DropdownMenuItem>

                  <DropdownMenuItem v-if="nav.imports" as-child>
                    <NuxtLink to="/imports" class="flex items-center gap-2 cursor-pointer">
                      <Upload class="h-4 w-4 text-gray-400" />
                      Imports
                    </NuxtLink>
                  </DropdownMenuItem>

                  <DropdownMenuSub v-if="nav.reports">
                    <DropdownMenuSubTrigger class="flex items-center gap-2 cursor-pointer">
                      <FileText class="h-4 w-4 text-gray-400" />
                      Rapports
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent class="w-44">
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports" class="flex items-center gap-2 cursor-pointer">
                          <BarChart3 class="h-4 w-4 text-gray-400" />
                          Tous les rapports
                        </NuxtLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports/traffic" class="flex items-center gap-2 cursor-pointer">
                          <PlaneTakeoff class="h-4 w-4 text-gray-400" />
                          Trafic
                        </NuxtLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports/pax-bus" class="flex items-center gap-2 cursor-pointer">
                          <Users class="h-4 w-4 text-gray-400" />
                          Pax-Bus
                        </NuxtLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem as-child>
                        <NuxtLink to="/reports/idef" class="flex items-center gap-2 cursor-pointer">
                          <Package class="h-4 w-4 text-gray-400" />
                          IDEF
                        </NuxtLink>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator v-if="nav.agents || nav.imports || nav.reports" />

                  <DropdownMenuItem as-child>
                    <NuxtLink to="/permissions" class="flex items-center gap-2 cursor-pointer">
                      <Shield class="h-4 w-4 text-gray-400" />
                      Permissions
                    </NuxtLink>
                  </DropdownMenuItem>

                  <DropdownMenuItem v-if="nav.logs" as-child>
                    <NuxtLink to="/audit" class="flex items-center gap-2 cursor-pointer">
                      <ScrollText class="h-4 w-4 text-gray-400" />
                      Logs
                    </NuxtLink>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

            </nav>
          </div>

          <!-- Droite -->
          <div class="flex items-center gap-2">

            <!-- User pill (desktop) -->
            <div v-if="authStore.user" class="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div class="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                <span class="text-[10px] font-bold text-white uppercase">{{ authStore.user.name.charAt(0) }}</span>
              </div>
              <div class="text-xs leading-tight">
                <div class="font-semibold text-gray-900 dark:text-white">{{ authStore.user.name }}</div>
                <div class="text-gray-500 dark:text-gray-400">{{ authStore.user.function ?? 'VTA' }}</div>
              </div>
              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded" :class="roleBadgeClass">
                {{ roleLabel }}
              </span>
            </div>

            <!-- Mobile menu toggle -->
            <Button variant="ghost" size="sm" class="lg:hidden h-8 w-8 p-0" @click="mobileMenuOpen = !mobileMenuOpen">
              <Menu v-if="!mobileMenuOpen" class="h-4 w-4" />
              <X v-else class="h-4 w-4" />
            </Button>

            <!-- Settings dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" class="h-8 w-8 p-0 rounded-lg">
                  <Settings class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-52">
                <DropdownMenuLabel class="font-normal">
                  <div class="flex items-center gap-2.5 py-1">
                    <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <span class="text-xs font-bold text-white uppercase">{{ authStore.user?.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <div class="font-semibold text-sm text-gray-900 dark:text-white">{{ authStore.user?.name }}</div>
                      <div class="text-xs italic text-gray-500">{{ authStore.user?.username }}</div>
                      <div class="text-xs text-gray-500">{{ roleLabel }}</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child>
                  <NuxtLink to="/settings" class="flex items-center gap-2 cursor-pointer">
                    <User class="h-4 w-4 text-gray-400" />
                    Mon profil
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout" class="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600">
                  <LogOut class="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>

        <!-- Mobile nav -->
        <Transition name="slide-fade">
          <nav v-if="mobileMenuOpen" class="lg:hidden pb-3 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-0.5 mt-1">

            <NuxtLink to="/" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150" :class="$route.path === '/' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
              <Home class="h-4 w-4" /> Tableau de bord
            </NuxtLink>

            <NuxtLink v-if="nav.operators" to="/operators" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
              :class="$route.path.startsWith('/operators') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
              <Building2 class="h-4 w-4" /> Exploitants
            </NuxtLink>

            <template v-if="nav.aircrafts || nav.aircraftTypes">
              <div class="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Aéronefs</div>
              <NuxtLink v-if="nav.aircraftTypes" to="/aircrafts/types" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ml-3"
                :class="$route.path === '/aircrafts/types' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
                <Layers class="h-4 w-4" /> Types d'aéronefs
              </NuxtLink>
              <NuxtLink v-if="nav.aircrafts" to="/aircrafts" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ml-3"
                :class="$route.path === '/aircrafts' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
                <Plane class="h-4 w-4" /> Aéronefs
              </NuxtLink>
            </template>

            <NuxtLink v-if="nav.flights" to="/flights" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
              :class="$route.path.startsWith('/flights') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''">
              <PlaneTakeoff class="h-4 w-4" /> Vols
            </NuxtLink>

            <template v-if="nav.agents || nav.imports">
              <div class="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Administration</div>
              <NuxtLink v-if="nav.agents" to="/agents/" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ml-3">
                <Users class="h-4 w-4" /> Agents
              </NuxtLink>
              <NuxtLink v-if="nav.imports" to="/imports" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ml-3">
                <Upload class="h-4 w-4" /> Imports
              </NuxtLink>
            </template>

            <template v-if="nav.reports">
              <div class="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Rapports</div>
              <NuxtLink to="/reports/traffic" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ml-3">
                <PlaneTakeoff class="h-4 w-4" /> Trafic
              </NuxtLink>
              <NuxtLink to="/reports/pax-bus" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ml-3">
                <Users class="h-4 w-4" /> Pax-Bus
              </NuxtLink>
              <NuxtLink to="/reports/idef" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ml-3">
                <Package class="h-4 w-4" /> IDEF
              </NuxtLink>
            </template>

            <NuxtLink to="/permissions" @click="mobileMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150">
              <Shield class="h-4 w-4" /> Permissions
            </NuxtLink>

          </nav>
        </Transition>
      </div>
    </header>

    <!-- Main -->
    <main class="container mx-auto px-4 py-6 pb-24">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="fixed bottom-0 inset-x-0 py-1.5 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
      <div class="container mx-auto px-4 h-10 flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm lg:text-base text-gray-400">
          <div class="h-4 w-4 rounded bg-blue-600 flex items-center justify-center">
            <span class="text-[8px] font-bold text-white">V</span>
          </div>
          © {{ new Date().getFullYear() }} VTA System
        </div>
        <div class="flex items-center gap-3 text-sm lg:text-base text-gray-400">
          <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Documentation</a>
          <span>·</span>
          <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Support</a>
          <span>·</span>
          <span class="font-mono">v1.0.0</span>
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
  MoreHorizontal, Menu, X, Package, Upload, ScrollText
} from 'lucide-vue-next'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const authStore      = useAuthStore()
const mobileMenuOpen = ref(false)
const { success, error } = useToast()
const { nav }        = usePermission()

const roleLabel = computed(() => ({
  admin:     'Admin',
  manager:   'Manager',
  permanent: 'Permanent',
  agent:     'Agent',
}[authStore.user?.role ?? ''] ?? ''))

const roleBadgeClass = computed(() => ({
  admin:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  manager:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  permanent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  agent:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}[authStore.user?.role ?? ''] ?? 'bg-gray-100 text-gray-600'))

const handleLogout = async () => {
  try {
    await authStore.logout()
    success('Déconnexion réussie')
  } catch {
    error('Erreur lors de la déconnexion')
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter-from,
.slide-fade-leave-to { transform: translateY(-8px); opacity: 0; }
</style>