<template>
  <div class="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
    <!-- Modern Header with linear -->
    <header class="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo and Brand -->
          <div class="flex items-center space-x-6">
            <NuxtLink to="/" class="flex items-center gap-3 group">
              <div class="relative">
                <div class="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div class="relative h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span class="text-lg font-black text-white">VTA</span>
                </div>
              </div>
              <h1 class="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                VTA System
              </h1>
            </NuxtLink>
            
            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex items-center space-x-1">
              <NuxtLink 
                to="/" 
                class="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm flex items-center gap-2"
                :class="$route.path === '/' ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''"
              >
                <Home class="h-4 w-4" />
                <span>Tableau de bord</span>
              </NuxtLink>

              <NuxtLink 
                to="/operators" 
                class="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm flex items-center gap-2"
                :class="$route.path.startsWith('/operators') ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''"
              >
                <Building2 class="h-4 w-4" />
                <span>Exploitants</span>
              </NuxtLink>
              
              <!-- Aircrafts Dropdown -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    class="px-4 py-2 h-auto font-medium rounded-lg hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm"
                    :class="$route.path.startsWith('/aircrafts') ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''"
                  >
                    <Plane class="h-4 w-4 mr-2" />
                    Aéronefs
                    <ChevronDown class="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-56 border-2">
                  <DropdownMenuItem as-child>
                    <NuxtLink to="/aircrafts/types" class="cursor-pointer flex items-center">
                      <Layers class="mr-2 h-4 w-4" />
                      <span>Types d'aéronefs</span>
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem as-child>
                    <NuxtLink to="/aircrafts" class="cursor-pointer flex items-center">
                      <Plane class="mr-2 h-4 w-4" />
                      <span>Voir les aéronefs</span>
                    </NuxtLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NuxtLink 
                to="/flights" 
                class="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm flex items-center gap-2"
                :class="$route.path.startsWith('/flights') ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-primary shadow-sm' : ''"
              >
                <PlaneTakeoff class="h-4 w-4" />
                <span>Vols</span>
              </NuxtLink>

              <!-- More Dropdown -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    class="px-4 py-2 h-auto font-medium rounded-lg hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-sm"
                  >
                    <MoreHorizontal class="h-4 w-4 mr-2" />
                    Plus
                    <ChevronDown class="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-56 border-2">
                  <DropdownMenuItem as-child>
                    <NuxtLink to="/agents" class="cursor-pointer flex items-center">
                      <Users class="mr-2 h-4 w-4" />
                      <span>Agents</span>
                      <Badge variant="secondary" class="ml-auto text-xs">Bientôt</Badge>
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem as-child>
                    <NuxtLink to="/reports" class="cursor-pointer flex items-center">
                      <FileText class="mr-2 h-4 w-4" />
                      <span>Rapports</span>
                      <Badge variant="secondary" class="ml-auto text-xs">Bientôt</Badge>
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem as-child>
                    <NuxtLink to="/permissions" class="cursor-pointer flex items-center">
                      <Shield class="mr-2 h-4 w-4" />
                      <span>Permissions</span>
                    </NuxtLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          
          <!-- Right Side Actions -->
          <div class="flex items-center gap-3">
            <!-- User Info (Desktop) -->
            <div v-if="authStore.user" class="hidden md:flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
              <div class="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <User class="h-4 w-4 text-white" />
              </div>
              <div class="text-sm">
                <div class="font-semibold">{{ authStore.user.username }}</div>
                <div class="text-xs text-muted-foreground">Administrateur</div>
              </div>
            </div>

            <!-- Mobile Menu Button -->
            <Button 
              variant="outline" 
              size="sm" 
              class="lg:hidden"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <Menu v-if="!mobileMenuOpen" class="h-4 w-4" />
              <X v-else class="h-4 w-4" />
            </Button>
            
            <!-- Settings Dropdown -->
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
                    <div class="font-semibold">{{ authStore.user?.username || 'Utilisateur' }}</div>
                    <div class="text-xs text-muted-foreground font-normal">Administrateur</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="cursor-pointer">
                  <NuxtLink to="/settings" class="cursor-pointer flex items-center">
                    <User class="mr-2 h-4 w-4" />
                    Mon profil
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem class="cursor-pointer">
                  <NuxtLink to="/preferences" class="cursor-pointer flex items-center">
                    <Settings class="mr-2 h-4 w-4" />
                    Préférences
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

        <!-- Mobile Navigation -->
        <Transition name="slide-fade">
          <nav v-if="mobileMenuOpen" class="lg:hidden mt-4 pt-4 border-t space-y-1">
            <NuxtLink 
              to="/" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
              :class="$route.path === '/' ? 'bg-muted text-primary' : ''"
            >
              <Home class="h-4 w-4" />
              <span>Tableau de bord</span>
            </NuxtLink>

            <NuxtLink 
              to="/operators" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
              :class="$route.path.startsWith('/operators') ? 'bg-muted text-primary' : ''"
            >
              <Building2 class="h-4 w-4" />
              <span>Exploitants</span>
            </NuxtLink>

            <div class="px-4 py-2 text-xs font-semibold text-muted-foreground">AÉRONEFS</div>
            
            <NuxtLink 
              to="/aircrafts/types" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted ml-4"
              :class="$route.path === '/aircrafts/types' ? 'bg-muted text-primary' : ''"
            >
              <Layers class="h-4 w-4" />
              <span>Types d'aéronefs</span>
            </NuxtLink>

            <NuxtLink 
              to="/aircrafts" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted ml-4"
              :class="$route.path === '/aircrafts' ? 'bg-muted text-primary' : ''"
            >
              <Plane class="h-4 w-4" />
              <span>Voir les aéronefs</span>
            </NuxtLink>

            <NuxtLink 
              to="/flights" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
              :class="$route.path.startsWith('/flights') ? 'bg-muted text-primary' : ''"
            >
              <PlaneTakeoff class="h-4 w-4" />
              <span>Vols</span>
            </NuxtLink>

            <div class="px-4 py-2 text-xs font-semibold text-muted-foreground">AUTRES</div>

            <NuxtLink 
              to="/agents" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
            >
              <Users class="h-4 w-4" />
              <span>Agents</span>
              <Badge variant="secondary" class="ml-auto text-xs">Bientôt</Badge>
            </NuxtLink>

            <NuxtLink 
              to="/reports" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
            >
              <FileText class="h-4 w-4" />
              <span>Rapports</span>
              <Badge variant="secondary" class="ml-auto text-xs">Bientôt</Badge>
            </NuxtLink>

            <NuxtLink 
              to="/permissions" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-muted"
            >
              <Shield class="h-4 w-4" />
              <span>Permissions</span>
            </NuxtLink>
          </nav>
        </Transition>
      </div>
    </header>
    
    <!-- Main Content with subtle pattern -->
    <main class="container mx-auto px-4 py-6 relative">
      <div class="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div class="relative">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm mt-auto">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <div class="h-6 w-6 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span class="text-xs font-bold text-white">V</span>
            </div>
            <span>© 2024 VTA System. Tous droits réservés.</span>
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
    
    <Toaster position="top-right" richColors />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Layers, 
  Plane,
  Building2,
  Home,
  PlaneTakeoff,
  MapPin,
  Users,
  FileText,
  Shield,
  MoreHorizontal,
  Menu,
  X
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const handleLogout = async () => {
  try {
    await authStore.logout()
    toast.success('Déconnexion réussie', {
      description: 'Vous avez été déconnecté avec succès'
    })
  } catch (error) {
    toast.error('Erreur', {
      description: 'Une erreur est survenue lors de la déconnexion'
    })
  }
}
</script>

<style scoped>
.bg-grid-pattern {
  background-image: 
    linear-linear(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-linear(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>