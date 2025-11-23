<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-3xl max-h-[95vh] overflow-y-auto p-0">
      <div class="sticky top-0 z-50 bg-background border-b">
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <DialogTitle class="text-2xl font-bold">
                {{ isEdit ? '✏️ Modifier le vol' : '✈️ Nouveau vol' }}
              </DialogTitle>
              <DialogDescription class="text-sm mt-1">
                {{ stepTitles[currentStep - 1] }}
              </DialogDescription>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm font-semibold text-muted-foreground">
                Étape {{ currentStep }}/4
              </div>
              <Button type="button" variant="ghost" size="sm" @click="isOpen = false"
                class="text-muted-foreground hover:text-foreground">
                <X class="h-5 w-5" />
              </Button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-3">
            <div class="flex justify-between gap-2">
              <div v-for="(title, idx) in stepTitles" :key="idx" class="flex-1 text-xs text-center"
                :class="idx + 1 <= currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'">
                <div class="flex items-center justify-center mb-1">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    :class="[
                      idx + 1 <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    ]">
                    {{ idx + 1 <= currentStep ? '✓' : idx + 1 }} </div>
                  </div>
                  <span class="hidden sm:inline">{{ title }}</span>
                </div>
              </div>
              <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                  :style="{ width: `${(currentStep / 4) * 100}%` }" />
              </div>
            </div>
            <!-- Status Select (Outside Steps) - Only in Edit Mode -->
            <Transition name="slide-fade">
              <div v-if="isEdit" class="mt-4 pt-4 border-t">
                <Label class="text-sm font-medium mb-2 block">Statut du vol</Label>
                <Select v-model="formData.status">
                  <SelectTrigger class="h-10">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prevu">
                      <span class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                        Prévu
                      </span>
                    </SelectItem>
                    <SelectItem value="atteri">
                      <span class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        Atterri
                      </span>
                    </SelectItem>
                    <SelectItem value="qrf">
                      <span class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                        QRF
                      </span>
                    </SelectItem>
                    <SelectItem value="annule">
                      <span class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-red-500"></div>
                        Annulé
                      </span>
                    </SelectItem>
                    <SelectItem value="detourne">
                      <span class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                        Détourné
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Transition>
          </div>
        </div>
        <form @submit.prevent="handleSubmit" class="px-6 py-6 space-y-6">
          <!-- STEP 1: Flight Info -->
          <Transition name="fade" mode="out-in">
            <div v-if="currentStep === 1" key="step1" class="space-y-5 animate-in fade-in-50">
              <div class="space-y-2">
                <Label for="flight_number" class="text-base font-semibold flex items-center gap-2">
                  <Plane class="h-4 w-4" />
                  Numéro de vol
                </Label>
                <Input id="flight_number" v-model="formData.flight_number" placeholder="AF1234, BA567, etc."
                  class="text-base" :class="{ 'border-destructive': errors.flight_number }" />
                <p v-if="errors.flight_number" class="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />{{ errors.flight_number }}
                </p>
              </div>

              <!-- Operator Selection -->
              <div class="space-y-2">
                <Label class="text-base font-semibold flex items-center gap-2">
                  <Building2 class="h-4 w-4" />
                  Exploitant
                </Label>
                <Popover v-model:open="operatorPopoverOpen">
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" :aria-expanded="operatorPopoverOpen"
                      class="w-full justify-between h-10 text-base"
                      :class="{ 'border-destructive': errors.operator_id }">
                      <span :class="{ 'text-muted-foreground': !selectedOperatorLabel }">
                        {{ selectedOperatorLabel || 'Sélectionner un exploitant' }}
                      </span>
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Chercher exploitant..." />
                      <CommandEmpty>Aucun exploitant trouvé</CommandEmpty>
                      <CommandGroup class="max-h-64 overflow-y-auto">
                        <CommandItem v-for="operator in operators" :key="operator.id" :value="operator.id.toString()"
                          @select="
                            formData.operator_id = operator.id,
                            selectedOperatorLabel = `${operator.name} (${operator.sigle})`,
                            operatorPopoverOpen = false
                            ">
                          <Check :class="[
                            'mr-2 h-4 w-4',
                            formData.operator_id === operator.id ? 'opacity-100' : 'opacity-0'
                          ]" />
                          <div class="flex-1">
                            <div class="font-medium">{{ operator.name }}</div>
                            <div class="text-xs text-muted-foreground">{{ operator.sigle }}</div>
                          </div>
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p v-if="errors.operator_id" class="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />{{ errors.operator_id }}
                </p>
              </div>

              <!-- Aircraft Selection -->
              <div class="space-y-2">
                <Label class="text-base font-semibold flex items-center gap-2">
                  <Plane class="h-4 w-4" />
                  Aéronef
                </Label>
                <Popover v-model:open="aircraftPopoverOpen">
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" :aria-expanded="aircraftPopoverOpen"
                      class="w-full justify-between h-10 text-base"
                      :class="{ 'border-destructive': errors.aircraft_id }">
                      <span :class="{ 'text-muted-foreground': !selectedAircraftLabel }">
                        {{ selectedAircraftLabel || 'Sélectionner un aéronef' }}
                      </span>
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Chercher aéronef..." />
                      <CommandEmpty>Aucun aéronef trouvé</CommandEmpty>
                      <CommandGroup class="max-h-64 overflow-y-auto">
                        <CommandItem v-for="aircraft in aircrafts" :key="aircraft.id" :value="aircraft.id.toString()"
                          @select="
                            formData.aircraft_id = aircraft.id,
                            selectedAircraftLabel = `${aircraft.immatriculation}`,
                            aircraftPopoverOpen = false
                            ">
                          <Check :class="[
                            'mr-2 h-4 w-4',
                            formData.aircraft_id === aircraft.id ? 'opacity-100' : 'opacity-0'
                          ]" />
                          <div class="flex-1">
                            <div class="font-medium">{{ aircraft.immatriculation }}</div>
                            <div class="text-xs text-muted-foreground">{{ aircraft.type?.name }}</div>
                          </div>
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p v-if="errors.aircraft_id" class="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />{{ errors.aircraft_id }}
                </p>
              </div>

              <!-- Flight Regime -->
              <div class="space-y-2">
                <Label class="text-base font-semibold flex items-center gap-2">
                  Régime du vol
                </Label>
                <Select v-model="formData.flight_regime">
                  <SelectTrigger class="h-10">
                    <SelectValue placeholder="Sélectionner un régime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Domestique</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Transition>

          <!-- STEP 2: Itinerary -->
          <Transition name="fade" mode="out-in">
            <div v-if="currentStep === 2" key="step2" class="space-y-5 animate-in fade-in-50">
              <div
                class="grid gap-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <div class="space-y-3">
                  <Label class="text-base font-semibold flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-blue-600" />
                    Aéroport de départ
                  </Label>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <Label class="text-xs text-muted-foreground mb-1 block">Code IATA</Label>
                      <Input v-model="formData.departure.iata" placeholder="CDG" maxlength="3"
                        class="text-base font-semibold" :class="{ 'border-destructive': errors['departure.iata'] }" />
                      <p v-if="errors['departure.iata']" class="text-xs text-destructive mt-1">
                        {{ errors['departure.iata'] }}
                      </p>
                    </div>
                    <div>
                      <Label class="text-xs text-muted-foreground mb-1 block">Nom</Label>
                      <Input v-model="formData.departure.name" placeholder="Paris CDG" class="text-base"
                        :class="{ 'border-destructive': errors['departure.name'] }" />
                      <p v-if="errors['departure.name']" class="text-xs text-destructive mt-1">
                        {{ errors['departure.name'] }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="grid gap-6 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <div class="space-y-3">
                  <Label class="text-base font-semibold flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-green-600" />
                    Aéroport d'arrivée
                  </Label>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <Label class="text-xs text-muted-foreground mb-1 block">Code IATA</Label>
                      <Input v-model="formData.arrival.iata" placeholder="JFK" maxlength="3"
                        class="text-base font-semibold" :class="{ 'border-destructive': errors['arrival.iata'] }" />
                      <p v-if="errors['arrival.iata']" class="text-xs text-destructive mt-1">
                        {{ errors['arrival.iata'] }}
                      </p>
                    </div>
                    <div>
                      <Label class="text-xs text-muted-foreground mb-1 block">Nom</Label>
                      <Input v-model="formData.arrival.name" placeholder="New York JFK" class="text-base"
                        :class="{ 'border-destructive': errors['arrival.name'] }" />
                      <p v-if="errors['arrival.name']" class="text-xs text-destructive mt-1">
                        {{ errors['arrival.name'] }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Times -->
              <div class="space-y-3">
                <Label class="text-sm font-semibold flex items-center gap-2">
                  <Clock class="h-4 w-4" />
                  Horaires
                </Label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label for="departure_time" class="text-xs text-muted-foreground mb-1 block">Départ</Label>
                    <Input id="departure_time" v-model="formData.departure_time" type="datetime-local" class="text-base"
                      :class="{ 'border-destructive': errors.departure_time }" />
                    <p v-if="errors.departure_time" class="text-xs text-destructive mt-1">
                      {{ errors.departure_time }}
                    </p>
                  </div>
                  <div>
                    <Label for="arrival_time" class="text-xs text-muted-foreground mb-1 block">Arrivée</Label>
                    <Input id="arrival_time" v-model="formData.arrival_time" type="datetime-local" class="text-base"
                      :class="{ 'border-destructive': errors.arrival_time }" />
                    <p v-if="errors.arrival_time" class="text-xs text-destructive mt-1">
                      {{ errors.arrival_time }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <!-- STEP 3: Freights -->
          <Transition name="fade" mode="out-in">
            <div v-if="currentStep === 3" key="step3" class="space-y-5 animate-in fade-in-50">
              <Card class="border-2">
                <CardHeader class="pb-3">
                  <CardTitle class="text-base flex items-center gap-2">
                    <Package class="h-4 w-4" />
                    Fret
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <Label class="text-sm font-medium mb-2 block">Au départ</Label>
                      <Input v-model.number="formData.statistics!.fret_count!.departure" type="number" min="0"
                        placeholder="0" class="text-base" />
                    </div>
                    <div>
                      <Label class="text-sm font-medium mb-2 block">À l'arrivée</Label>
                      <Input v-model.number="formData.statistics!.fret_count!.arrival" type="number" min="0"
                        placeholder="0" class="text-base" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card class="border-2">
                <CardHeader class="pb-3">
                  <CardTitle class="text-base flex items-center gap-2">
                    <AlertCircle class="h-4 w-4" />
                    Excédents
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <Label class="text-sm font-medium mb-2 block">Au départ</Label>
                      <Input v-model.number="formData.statistics!.excedents!.departure" type="number" min="0"
                        placeholder="0" class="text-base" />
                    </div>
                    <div>
                      <Label class="text-sm font-medium mb-2 block">À l'arrivée</Label>
                      <Input v-model.number="formData.statistics!.excedents!.arrival" type="number" min="0"
                        placeholder="0" class="text-base" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Transition>

          <!-- STEP 4: Passengers & Justifications -->
          <Transition name="fade" mode="out-in">
            <div v-if="currentStep === 4" key="step4" class="space-y-5 animate-in fade-in-50">
              <Card class="border-2 border-purple-200/50 dark:border-purple-800/50">
                <CardHeader class="pb-3">
                  <CardTitle class="text-base flex items-center gap-2">
                    <Users class="h-4 w-4 text-purple-600" />
                    Statistiques passagers
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <Label class="text-sm font-medium mb-2 block">Nombre de passagers</Label>
                      <Input v-model.number="formData.statistics!.passengers_count" type="number" min="0"
                        placeholder="0" class="text-base font-semibold" />
                    </div>
                    <div>
                      <Label class="text-sm font-medium mb-2 block">Go Pass Count</Label>
                      <Input v-model.number="formData.statistics!.go_pass_count" type="number" min="0" placeholder="0"
                        class="text-base font-semibold" />
                    </div>
                    <div>
                      <Label class="text-sm font-medium mb-2 block">Pax bus</Label>
                      <Input v-model.number="formData.statistics!.pax_bus" type="number" min="0" placeholder="0"
                        class="text-base" />
                    </div>
                    <div>
                      <Label class="text-sm font-medium mb-2 block">Écart</Label>
                      <div
                        class="flex items-center h-10 px-3 border rounded-md bg-muted text-muted-foreground font-semibold">
                        {{ formData_passengers_ecart > 0 ? '+' : '' }}{{ formData_passengers_ecart }}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Justifications Section - Conditional Display -->
              <Transition name="slide-fade">
                <Card v-if="formData.statistics!.passengers_count > formData.statistics!.go_pass_count"
                  class="border-2 border-blue-200/50 dark:border-blue-800/50">
                  <CardHeader class="pb-3">
                    <div class="flex items-center gap-3">
                      <div class="flex items-center space-x-2">
                        <input id="hasJustification" v-model="formData.statistics!.has_justification" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer" />
                        <Label for="hasJustification" class="text-base font-semibold cursor-pointer">
                          Ajouter des justifications
                        </Label>
                      </div>
                    </div>
                  </CardHeader>

                  <!-- Justifications Inputs -->
                  <Transition name="slide-fade">
                    <CardContent v-if="formData.statistics!.has_justification" class="space-y-4 border-t pt-4">
                      <div v-for="(idx) in justificationCount" :key="idx"
                        class="space-y-3 p-4 bg-muted/30 rounded-lg border border-blue-200/30">
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-sm font-semibold">Justification {{ idx }}</span>
                          <Button type="button" variant="ghost" size="sm" @click="removeJustification(idx - 1)"
                            class="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Minus class="h-4 w-4" />
                          </Button>
                        </div>

                        <div class="space-y-2">
                          <Label class="text-sm font-medium">Type de justification</Label>
                          <Popover v-model:open="justificationPopovers[idx - 1]">
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" class="w-full justify-between h-10">
                                <span :class="{ 'text-muted-foreground': !justificationNames[idx - 1] }">
                                  {{ justificationNames[idx - 1] || 'Sélectionner...' }}
                                </span>
                                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-full p-0">
                              <Command :filter-fn="filterJustifications">
                                <CommandInput v-model="justificationSearches[idx - 1]"
                                  placeholder="Chercher ou créer..." :disabled="justificationsLoading" />
                                <CommandEmpty>
                                  <div v-if="justificationsLoading"
                                    class="p-2 text-xs text-muted-foreground text-center">
                                    Chargement des justifications...
                                  </div>
                                  <Button v-else variant="ghost" class="w-full justify-start text-left"
                                    @click="createNewJustificationItem(idx - 1)"
                                    :disabled="!justificationSearches[idx - 1]">
                                    <Plus class="mr-2 h-4 w-4" />
                                    Créer: "{{ justificationSearches[idx - 1] }}"
                                  </Button>
                                </CommandEmpty>
                                <CommandGroup class="max-h-64 overflow-y-auto">
                                  <CommandItem v-for="j in justifications" :key="j.id" :value="j.name"
                                    @select="selectJustificationItem(idx - 1, j.name)">
                                    <Check :class="[
                                      'mr-2 h-4 w-4',
                                      justificationNames[idx - 1] === j.name ? 'opacity-100' : 'opacity-0'
                                    ]" />
                                    {{ j.name }}
                                  </CommandItem>
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div class="space-y-2">
                          <div class="flex items-center justify-between">
                            <Label class="text-sm font-medium">Valeur</Label>
                            <span class="text-xs text-muted-foreground">
                              Total: {{ justificationsTotalValue }} / {{ Math.abs(formData_passengers_ecart) }}
                            </span>
                          </div>
                          <Input v-model.number="justificationValues[idx - 1]" type="number" min="0" placeholder="0"
                            class="text-base" :class="{ 'border-destructive': justificationsExceedLimit }" />
                          <p v-if="justificationsExceedLimit" class="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle class="h-3 w-3" />
                            La somme des justifications ({{ justificationsTotalValue }}) dépasse l'écart ({{
                              Math.abs(formData_passengers_ecart) }})
                          </p>
                        </div>

                        <!-- SFR Input (conditional for Militaires) -->
                        <Transition name="slide-fade">
                          <div v-if="justificationNames[idx - 1] === 'Militaires'" class="space-y-2">
                            <Label class="text-sm font-medium">SFR</Label>
                            <Input v-model="justificationSfr[idx - 1]" type="text" placeholder="SFR value"
                              class="text-base" />
                          </div>
                        </Transition>
                      </div>

                      <Button type="button" variant="outline" @click="addJustification" class="w-full gap-2">
                        <Plus class="h-4 w-4" />
                        Ajouter une justification
                      </Button>

                      <p v-if="errors.justification" class="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle class="h-3 w-3" />{{ errors.justification }}
                      </p>
                    </CardContent>
                  </Transition>
                </Card>
              </Transition>

              <!-- Observations / Remarks -->
              <Card class="border-2 border-amber-200/50 dark:border-amber-800/50">
                <CardHeader class="pb-3">
                  <CardTitle class="text-base flex items-center gap-2">
                    <AlertTriangle class="h-4 w-4 text-amber-600" />
                    Observations
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-3">
                  <Label for="remarks" class="text-sm font-medium">Remarques ou observations supplémentaires</Label>
                  <textarea id="remarks" v-model="formData.remarks"
                    placeholder="Ajouter des observations, notes spéciales, ou remarques sur le vol..." rows="4"
                    class="w-full px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"></textarea>
                  <p class="text-xs text-muted-foreground">{{ formData.remarks?.length || 0 }} caractère(s)</p>
                </CardContent>
              </Card>
            </div>
          </Transition>

          <!-- Navigation Buttons -->
          <div class="flex gap-3 pt-6 border-t sticky bottom-0 bg-background">
            <Button type="button" variant="outline" :disabled="currentStep === 1" @click="previousStep" class="flex-1">
              <ChevronLeft class="mr-2 h-4 w-4" />
              Précédent
            </Button>

            <Button type="button" v-if="currentStep < 4" @click="nextStep"
              class="flex-1 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Suivant
              <ChevronRight class="ml-2 h-4 w-4" />
            </Button>
            <Button v-else type="submit"
              class="flex-1 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Check class="mr-2 h-4 w-4" />
              {{ isEdit ? 'Modifier' : 'Créer' }}
            </Button>
          </div>
        </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Plane,
  Building2,
  MapPin,
  Clock,
  Package,
  AlertCircle,
  AlertTriangle,
  Users,
  ChevronsUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { FlightFormData, Flight } from '~/types/api'

interface Props {
  open?: boolean
  flight?: Flight
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit', data: FlightFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<Emits>()

const flightsStore = useFlightsStore()
const aircraftsStore = useAircraftsStore()
const operatorsStore = useOperatorsStore()
const justificationsStore = useFlightJustificationsStore()
const { success: showSuccess, error: showError } = useToast()

// State
const currentStep = ref(1)
const stepTitles = ['Infos de base', 'Itinéraire', 'Frets & Excédents', 'Passagers & Justifications']
const isEdit = computed(() => !!props.flight)
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const formData = ref<FlightFormData>({
  flight_number: '',
  operator_id: 0,
  aircraft_id: 0,
  departure: { iata: '', name: '' },
  arrival: { iata: '', name: '' },
  departure_time: '',
  arrival_time: '',
  flight_regime: 'domestic',
  flight_type: 'regular',
  flight_nature: 'commercial',
  status: 'prevu',
  remarks: '',
  statistics: {
    passengers_count: 0,
    pax_bus: 0,
    go_pass_count: 0,
    fret_count: { departure: 0, arrival: 0 },
    excedents: { departure: 0, arrival: 0 },
    passengers_ecart: 0,
    has_justification: false,
    justification: {}
  }
})

const operatorPopoverOpen = ref(false)
const aircraftPopoverOpen = ref(false)
const selectedOperatorLabel = ref('')
const selectedAircraftLabel = ref('')
const errors = ref<Record<string, string>>({})

// Justification state
const justificationCount = ref(1)
const justificationNames = ref<string[]>([''])
const justificationValues = ref<number[]>([0])
const justificationSfr = ref<string[]>([''])
const justificationPopovers = ref<boolean[]>([false])
const justificationSearches = ref<string[]>([''])

const operators = computed(() => operatorsStore.allOperators)
const aircrafts = computed(() => aircraftsStore.allAircrafts)
const justifications = computed(() => justificationsStore.justifications)
const justificationsLoading = computed(() => justificationsStore.loading)

const formData_passengers_ecart = computed(() => {
  if (!formData.value.statistics) return 0
  const ecart = formData.value.statistics.passengers_count - formData.value.statistics.go_pass_count
  return ecart
})

const justificationsTotalValue = computed(() => {
  let total = 0
  for (let i = 0; i < justificationCount.value; i++) {
    total += justificationValues.value[i] || 0
  }
  return total
})

const justificationsExceedLimit = computed(() => {
  return justificationsTotalValue.value > Math.abs(formData_passengers_ecart.value)
})

const addJustification = () => {
  justificationCount.value++
  justificationNames.value.push('')
  justificationValues.value.push(0)
  justificationSfr.value.push('')
  justificationPopovers.value.push(false)
  justificationSearches.value.push('')
}

const removeJustification = (index: number) => {
  justificationCount.value--
  justificationNames.value.splice(index, 1)
  justificationValues.value.splice(index, 1)
  justificationSfr.value.splice(index, 1)
  justificationPopovers.value.splice(index, 1)
  justificationSearches.value.splice(index, 1)
}

const selectJustificationItem = (index: number, name: string) => {
  justificationNames.value[index] = name
  justificationPopovers.value[index] = false
}

const createNewJustificationItem = async (index: number) => {
  const name = justificationSearches.value[index].trim()
  if (name) {
    // Tenter de créer la justification via l'API
    const result = await justificationsStore.createJustification(name)
    if (result.success && result.data) {
      justificationNames.value[index] = result.data.name
      justificationPopovers.value[index] = false
      justificationSearches.value[index] = ''
    } else {
      // En cas d'erreur, l'ajouter localement quand même
      justificationNames.value[index] = name
      justificationPopovers.value[index] = false
      justificationSearches.value[index] = ''
    }
  }
}

const filterJustifications = (list: any[], search: string) => {
  if (!search) return list
  return list.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
}

const buildJustificationData = () => {
  const stats = formData.value.statistics

  // Si pas de justifications => vider l'objet
  if (!stats?.has_justification) {
    stats!.justification = {}
    return
  }

  const output: Record<string, any> = {}

  for (let i = 0; i < justificationCount.value; i++) {
    const name = justificationNames.value[i]
    const value = justificationValues.value[i]
    const sfr = justificationSfr.value[i]

    if (!name) continue

    // --- CAS MILITAIRES ---
    if (name === "Militaires") {
      output[name] = {
        sfr: sfr || "",
        value: value || 0,
      }
      continue
    }

    // --- CAS NORMAL : { "INAD": 3 } ---
    output[name] = value || 0
  }

  stats!.justification = output
}


const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  try {
    errors.value = {}

    // Build justification data
    buildJustificationData()
    
    // Calculate and add passengers_ecart
    formData.value.statistics!.passengers_ecart = formData_passengers_ecart.value

    // Validation
    if (!formData.value.flight_number.trim()) {
      errors.value.flight_number = 'Le numéro de vol est requis'
    }
    if (!formData.value.operator_id) {
      errors.value.operator_id = 'L\'exploitant est requis'
    }
    if (!formData.value.aircraft_id) {
      errors.value.aircraft_id = 'L\'aéronef est requis'
    }
    if (!formData.value.flight_regime) {
      errors.value.flight_regime = 'Le régime du vol est requis'
    }
    if (!formData.value.flight_type) {
      errors.value.flight_type = 'Le type de vol est requis'
    }
    if (!formData.value.flight_nature) {
      errors.value.flight_nature = 'La nature du vol est requise'
    }
    if (!formData.value.status) {
      errors.value.status = 'Le statut du vol est requis'
    }
    if (!formData.value.departure.iata) {
      errors.value['departure.iata'] = 'Code IATA de départ requis'
    }
    if (!formData.value.departure.name) {
      errors.value['departure.name'] = 'Nom de l\'aéroport de départ requis'
    }
    if (!formData.value.arrival.iata) {
      errors.value['arrival.iata'] = 'Code IATA d\'arrivée requis'
    }
    if (!formData.value.arrival.name) {
      errors.value['arrival.name'] = 'Nom de l\'aéroport d\'arrivée requis'
    }
    if (!formData.value.departure_time) {
      errors.value.departure_time = 'Heure de départ requise'
    }
    if (!formData.value.arrival_time) {
      errors.value.arrival_time = 'Heure d\'arrivée requise'
    }

    // Validation pour les justifications
    if (formData.value.statistics?.has_justification && justificationsExceedLimit.value) {
      errors.value.justification = `La somme des justifications (${justificationsTotalValue.value}) dépasse l'écart passagers (${Math.abs(formData_passengers_ecart.value)})`
    }

    if (Object.keys(errors.value).length > 0) {
      return
    }

    if (isEdit.value && props.flight) {
      await flightsStore.updateFlight(props.flight.id, formData.value)
    } else {
      await flightsStore.createFlight(formData.value)
    }

    showSuccess(isEdit.value ? 'Vol modifié avec succès' : 'Vol créé avec succès')
    emit('submit', formData.value)
    emit('update:open', false)
  } catch (error: any) {
    showError(error.message || 'Une erreur est survenue')
  }
}

const formatDateTimeForInput = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.toISOString().slice(0, 16)
}

const initializeForm = () => {
  if (isEdit.value && props.flight) {
    formData.value = {
      flight_number: props.flight.flight_number,
      operator_id: props.flight.operator?.id || 0,
      aircraft_id: props.flight.aircraft?.id || 0,
      departure: props.flight.departure || { iata: '', name: '' },
      arrival: props.flight.arrival || { iata: '', name: '' },
      departure_time: formatDateTimeForInput(props.flight.departure_time),
      arrival_time: formatDateTimeForInput(props.flight.arrival_time),
      flight_regime: props.flight.flight_regime,
      flight_type: typeof props.flight.flight_type === 'string' 
        ? props.flight.flight_type 
        : (props.flight.flight_type as any)?.value ?? 'regular',
      flight_nature: typeof props.flight.flight_nature === 'string' 
        ? props.flight.flight_nature 
        : (props.flight.flight_nature as any)?.value ?? 'commercial',
      status: props.flight.status,
      remarks: props.flight.remarks,
      statistics: props.flight.statistics ? {
        passengers_count: props.flight.statistics.passengers_count,
        pax_bus: props.flight.statistics.pax_bus,
        go_pass_count: props.flight.statistics.go_pass_count,
        fret_count: props.flight.statistics.fret_count || { departure: 0, arrival: 0 },
        excedents: props.flight.statistics.excedents || { departure: 0, arrival: 0 },
        passengers_ecart: props.flight.statistics.passengers_ecart,
        has_justification: props.flight.statistics.has_justification,
        justification: props.flight.statistics.justification || {}
      } : {
        passengers_count: 0,
        pax_bus: 0,
        go_pass_count: 0,
        fret_count: { departure: 0, arrival: 0 },
        excedents: { departure: 0, arrival: 0 },
        passengers_ecart: 0,
        has_justification: false,
        justification: {}
      }
    }

    selectedOperatorLabel.value = props.flight.operator
      ? `${props.flight.operator.name} (${props.flight.operator.sigle})`
      : ''
    selectedAircraftLabel.value = String(props.flight.aircraft?.immatriculation || '')

    // Load justifications from existing data
    if (props.flight.statistics?.has_justification && props.flight.statistics?.justification) {
      const justif = props.flight.statistics.justification
      justificationCount.value = 0
      justificationNames.value = []
      justificationValues.value = []
      justificationSfr.value = []

      for (const [key, value] of Object.entries(justif)) {
        justificationNames.value.push(key)

        if (key === 'Militaires' && typeof value === 'object' && value !== null) {
          justificationValues.value.push((value as any).value || 0)
          justificationSfr.value.push((value as any).sfr || '')
        } else {
          justificationValues.value.push(typeof value === 'number' ? value : 0)
          justificationSfr.value.push('')
        }

        justificationCount.value++
      }

      if (justificationCount.value === 0) {
        justificationCount.value = 1
        justificationNames.value = ['']
        justificationValues.value = [0]
        justificationSfr.value = ['']
      }
    } else {
      justificationCount.value = 1
      justificationNames.value = ['']
      justificationValues.value = [0]
      justificationSfr.value = ['']
    }

    justificationPopovers.value = Array(justificationCount.value).fill(false)
    justificationSearches.value = Array(justificationCount.value).fill('')
  } else {
    formData.value = {
      flight_number: '',
      operator_id: 0,
      aircraft_id: 0,
      departure: { iata: '', name: '' },
      arrival: { iata: '', name: '' },
      departure_time: '',
      arrival_time: '',
      flight_regime: 'domestic',
      flight_type: 'regular',
      flight_nature: 'commercial',
      status: 'prevu',
      remarks: '',
      statistics: {
        passengers_count: 0,
        pax_bus: 0,
        go_pass_count: 0,
        fret_count: { departure: 0, arrival: 0 },
        excedents: { departure: 0, arrival: 0 },
        passengers_ecart: 0,
        has_justification: false,
        justification: {}
      }
    }
    selectedOperatorLabel.value = ''
    selectedAircraftLabel.value = ''

    // Reset justifications
    justificationCount.value = 1
    justificationNames.value = ['']
    justificationValues.value = [0]
    justificationSfr.value = ['']
    justificationPopovers.value = [false]
    justificationSearches.value = ['']
  }
  currentStep.value = 1
  errors.value = {}
}

watch(isOpen, async (newVal) => {
  if (newVal) {
    // Charger les opérateurs et aéronefs si pas encore chargés
    if (operatorsStore.allOperators.length === 0) {
      await operatorsStore.fetchAllOperators()
    }
    if (aircraftsStore.allAircrafts.length === 0) {
      await aircraftsStore.fetchAllAircrafts()
    }

    // Charger les justifications si elles ne sont pas encore chargées
    if (justificationsStore.justifications.length === 0) {
      await justificationsStore.fetchJustifications()
    }

    initializeForm()
  }
})

watch(() => formData.value.operator_id, async (newId) => {
  if (!newId) return

  // Reset aircraft selection when operator changes
  formData.value.aircraft_id = 0
  selectedAircraftLabel.value = ''

  // Fetch full operator resource via API
  const response = await operatorsStore.fetchOperator(newId)

  if (response.success && response.data) {
    const operator = response.data

    if (operator) {
      // Handle both string and object formats for flight_type and flight_nature
      const flightType = typeof operator.flight_type === 'string' 
        ? operator.flight_type 
        : operator.flight_type?.value ?? 'regular'
      
      const flightNature = typeof operator.flight_nature === 'string' 
        ? operator.flight_nature 
        : operator.flight_nature?.value ?? 'commercial'
      
      formData.value.flight_type = flightType
      formData.value.flight_nature = flightNature
    }
  }
})
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
