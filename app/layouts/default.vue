<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span class="text-sm font-bold text-primary-foreground">VTA</span>
            </div>
            <h1 class="text-xl font-bold">VTA</h1>
          </div>
          <nav class="hidden md:flex space-x-1">
            <NuxtLink 
              to="/" 
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted"
              active-class="bg-muted"
            >
              Tableau de bord
            </NuxtLink>
            <NuxtLink 
              to="/operators" 
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted"
              active-class="bg-muted"
            >
              Exploitants
            </NuxtLink>
            
            <!-- Dropdown Aéronefs -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button 
                  variant="ghost" 
                  size="sm"
                  class="px-3 py-2 h-auto font-medium hover:bg-muted"
                >
                  Aéronefs
                  <ChevronDown class="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-48">
                <DropdownMenuItem as-child>
                  <NuxtLink to="/aircrafts/types" class="cursor-pointer">
                    <Layers class="mr-2 h-4 w-4" />
                    Types d'aéronefs
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/aircrafts" class="cursor-pointer">
                    <Plane class="mr-2 h-4 w-4" />
                    Voir les aéronefs
                  </NuxtLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <NuxtLink 
              to="/flights" 
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted"
              active-class="bg-muted"
            >
              Vols
            </NuxtLink>
            <NuxtLink 
              to="/agents" 
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted"
              active-class="bg-muted"
            >
              Agents
            </NuxtLink>
            <NuxtLink 
              to="/reports" 
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted"
              active-class="bg-muted"
            >
              Rapports
            </NuxtLink>
            <NuxtLink 
              to="/permissions" 
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted"
              active-class="bg-muted"
            >
              Permissions
            </NuxtLink>
          </nav>
        </div>
        
        <div class="flex items-center gap-4">
          <div v-if="authStore.user" class="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <User class="h-4 w-4" />
            <span>{{ authStore.user.username }}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm">
                <Settings class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuLabel>
                {{ authStore.user?.username || 'Utilisateur' }}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleLogout" class="text-destructive cursor-pointer">
                <LogOut class="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>
    
    <Toaster position="top-right" richColors />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import { User, LogOut, Settings, ChevronDown, Layers, Plane } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const { success: showSuccess } = useToast()

const handleLogout = async () => {
  await authStore.logout()
  showSuccess('Déconnexion réussie')
}
</script>