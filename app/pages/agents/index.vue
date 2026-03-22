<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Gestion des utilisateurs</h1>
        <p class="text-sm text-muted-foreground mt-1">Assignez des fonctions et gérez les accès</p>
      </div>
      <Button v-if="can('user.create')" @click="openCreateModal">
        <Plus class="h-4 w-4 mr-2" />
        Nouvel utilisateur
      </Button>
    </div>

    <!-- Table -->
    <Card class="border-2">
      <CardContent class="p-0">
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>

        <div v-else-if="!users.length" class="text-center py-16 text-muted-foreground">
          <Users class="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucun utilisateur trouvé</p>
        </div>

        <table v-else class="w-full text-sm">
          <thead class="border-b bg-muted/40">
            <tr>
              <th class="text-left px-6 py-3 font-medium text-muted-foreground">Utilisateur</th>
              <th class="text-left px-6 py-3 font-medium text-muted-foreground">Fonction</th>
              <th class="text-left px-6 py-3 font-medium text-muted-foreground">Rôle</th>
              <th class="text-right px-6 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="u in users" :key="u.id" class="hover:bg-muted/30 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium">{{ u.name }}</div>
                <div class="text-xs text-muted-foreground">{{ u.username }}</div>
              </td>
              <td class="px-6 py-4">
                <span v-if="u.function" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium">
                  {{ u.function.label ?? u.function.value }}
                </span>
                <span v-else class="text-muted-foreground text-xs italic">Aucune fonction</span>
              </td>
              <td class="px-6 py-4">
                <span :class="roleClass(u.role)" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                  {{ roleLabel(u.role) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <Button
                    v-if="can('user.assignFunction')"
                    variant="outline"
                    size="sm"
                    @click="openAssignModal(u)"
                  >
                    <UserCog class="h-3.5 w-3.5 mr-1.5" />
                    Fonction
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="navigateTo(`/agents/${u.id}`)"
                  >
                    <Shield class="h-3.5 w-3.5 mr-1.5" />
                    Permissions
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between px-6 py-4 border-t">
        <span class="text-sm text-muted-foreground">
          {{ meta.total }} utilisateur{{ meta.total > 1 ? 's' : '' }}
        </span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" :disabled="meta.current_page === 1" @click="fetchUsers(meta.current_page - 1)">
            Précédent
          </Button>
          <Button variant="outline" size="sm" :disabled="meta.current_page === meta.last_page" @click="fetchUsers(meta.current_page + 1)">
            Suivant
          </Button>
        </div>
      </div>
    </Card>

    <!-- Modal : assigner une fonction -->
    <Dialog v-model:open="assignModal.open">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner une fonction</DialogTitle>
          <DialogDescription>
            {{ assignModal.user?.name }} — {{ assignModal.user?.username }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label>Fonction</Label>
            <Select v-model="assignModal.function">
              <SelectTrigger>
                <SelectValue placeholder="Choisir une fonction..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="fn in functionOptions" :key="fn.value" :value="fn.value">
                  <div class="flex items-center justify-between gap-6 w-full">
                    <span>{{ fn.label }}</span> | 
                    <span class="text-xs text-muted-foreground">{{ fn.role }}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Date de début</Label>
            <Input v-model="assignModal.startDate" type="date" :max="today" />
            <p class="text-xs text-muted-foreground">Laisser vide pour aujourd'hui</p>
          </div>

          <!-- Aperçu du rôle résultant -->
          <div v-if="assignModal.function" class="rounded-lg border bg-muted/40 p-3 text-sm">
            <span class="text-muted-foreground">Rôle résultant : </span>
            <span :class="roleClass(functionRole(assignModal.function))" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-1">
              {{ roleLabel(functionRole(assignModal.function)) }}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="assignModal.open = false">Annuler</Button>
          <Button :disabled="!assignModal.function || assignModal.saving" @click="submitAssign">
            <span v-if="assignModal.saving" class="flex items-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enregistrement...
            </span>
            <span v-else>Assigner</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { Plus, Users, UserCog, Shield } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import {
  Card, CardContent,
  Button,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Input, Label,
} from '#components'
import type { UserListItem } from '~/types/api'
import { useToast } from '@/composables/useToast'

definePageMeta({ middleware: 'auth' })

const { can } = usePermission()
const { apiFetch } = useApi()
const { success: showSuccess, error: showError } = useToast()

// ─────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────

const users   = ref<UserListItem[]>([])
const loading = ref(true)
const meta    = ref<any>(null)
const today   = new Date().toISOString().split('T')[0]

// ─────────────────────────────────────────────────────────────────────
// Données statiques des fonctions (depuis l'enum backend)
// ─────────────────────────────────────────────────────────────────────

const functionOptions = [
  { value: 'VTA-Encodeur', label: 'VTA-Encodeur',  role: 'admin' },
  { value: 'VTA-Sup',      label: 'VTA-Sup',       role: 'admin' },
  { value: 'CS',           label: 'CS',            role: 'manager' },
  { value: 'CS ai',        label: 'CS ai',         role: 'manager' },
  { value: 'CB-IDEF',      label: 'CB-IDEF',       role: 'manager' },
  { value: 'CB-IDEF ai',   label: 'CB-IDEF ai',    role: 'manager' },
  { value: 'CB Trafic',    label: 'CB Trafic',     role: 'manager' },
  { value: 'CB-Trafic ai', label: 'CB-Trafic ai',  role: 'manager' },
  { value: 'CB PAXBUS',    label: 'CB PAXBUS',     role: 'manager' },
  { value: 'CB-PAXBUS ai', label: 'CB-PAXBUS ai',  role: 'manager' },
  { value: 'CQ',           label: 'Québec',        role: 'manager' },
  { value: 'CQA',          label: 'Québec Alpha',  role: 'manager' },
  { value: 'VTA',          label: 'VTA',           role: 'agent' },
  { value: 'VTA-Trafic',   label: 'VTA-Trafic',   role: 'agent' },
  { value: 'VTA-IDEF',     label: 'VTA-IDEF',     role: 'agent' },
  { value: 'VTA-PAXBUS',   label: 'VTA-PAXBUS',   role: 'agent' },
]

const functionRole = (value: string) =>
  functionOptions.find(f => f.value === value)?.role ?? null

// ─────────────────────────────────────────────────────────────────────
// Modal assign
// ─────────────────────────────────────────────────────────────────────

const assignModal = ref({
  open:      false,
  user:      null as UserListItem | null,
  function:  '',
  startDate: '',
  saving:    false,
})

const openAssignModal = (u: UserListItem) => {
  assignModal.value = {
    open:      true,
    user:      u,
    function:  u.function?.value ?? '',
    startDate: '',
    saving:    false,
  }
}

const openCreateModal = () => {
  // TODO: implémenter la création
}

// ─────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────

const fetchUsers = async (page = 1) => {
  loading.value = true
  try {
    const res = await apiFetch<any>(`/users?page=${page}`)
    users.value = res.data
    meta.value  = res.meta
  } catch {
    showError('Impossible de charger les utilisateurs')
  } finally {
    loading.value = false
  }
}

const submitAssign = async () => {
  if (!assignModal.value.user || !assignModal.value.function) return

  assignModal.value.saving = true
  try {
    await apiFetch(`/agents/${assignModal.value.user.id}/assign-function`, {
      method: 'POST',
      body: {
        function:   assignModal.value.function,
        start_date: assignModal.value.startDate || undefined,
      },
    })

    showSuccess('Fonction assignée avec succès')
    assignModal.value.open = false
    await fetchUsers()
  } catch (e: any) {
    showError(e?.data?.message ?? 'Erreur lors de l\'assignation')
  } finally {
    assignModal.value.saving = false
  }
}

// ─────────────────────────────────────────────────────────────────────
// Helpers visuels
// ─────────────────────────────────────────────────────────────────────

const roleLabel = (role: string | null) => ({
  admin:   'Administrateur',
  manager: 'Manager',
  agent:   'Agent',
}[role ?? ''] ?? '—')

const roleClass = (role: string | null) => ({
  admin:   'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  agent:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}[role ?? ''] ?? 'bg-gray-100 text-gray-600')

// ─────────────────────────────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────────────────────────────

onMounted(() => fetchUsers())
</script>
