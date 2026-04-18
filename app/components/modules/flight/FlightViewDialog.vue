<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-5xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-linear-to-br from-sky-500 to-sky-600 flex items-center justify-center">
            <PlaneTakeoff class="h-5 w-5 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              {{ flight?.flight_number }}
              <Badge variant="secondary" class="font-mono">{{ flight?.status }}</Badge>
              <Badge variant="default" class="font-mono">{{ getFlightNature(flight) }}</Badge>
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              {{ formatDateTime(flight?.departure_time) }}
            </div>
          </div>
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques du vol
        </DialogDescription>
      </DialogHeader>

      <div v-if="flight" class="space-y-4">
        <!-- Itinéraire Principal -->
        <Card class="border-2 bg-linear-to-r from-sky-50/50 to-blue-50/50 dark:from-sky-950/20 dark:to-blue-950/20">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="text-sm text-muted-foreground mb-1">Départ</div>
                <div class="text-3xl font-bold text-sky-900 dark:text-sky-100">{{ formatLocationIata(flight.departure) }}</div>
                <div class="text-sm text-muted-foreground mt-2">{{ formatLocationName(flight.departure) }}</div>
                <div class="text-xs font-medium text-sky-700 dark:text-sky-400 mt-3">{{ formatTime(flight.departure_time) }}</div>
              </div>
              <div class="px-6">
                <div class="flex flex-col items-center gap-2">
                  <ArrowRight class="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  <div class="text-xs text-muted-foreground">Vol</div>
                </div>
              </div>
              <div class="flex-1 text-right">
                <div class="text-sm text-muted-foreground mb-1">Arrivée</div>
                <div class="text-3xl font-bold text-sky-900 dark:text-sky-100">{{ formatLocationIata(flight.arrival) }}</div>
                <div class="text-sm text-muted-foreground mt-2">{{ formatLocationName(flight.arrival) }}</div>
                <div class="text-xs font-medium text-sky-700 dark:text-sky-400 mt-3">{{ formatTime(flight.arrival_time) }}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Infos principales -->
        <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Card class="border-2 hover:shadow-md transition-all col-span-2">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Exploitant</div>
                  <div class="font-semibold truncate">{{ flight.operator?.name || 'N/A' }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card class="border-2 hover:shadow-md transition-all">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Plane class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Aéronef</div>
                  <div class="font-semibold truncate">{{ flight.aircraft?.immatriculation || 'N/A' }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card class="border-2 hover:shadow-md transition-all">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Globe class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Régime</div>
                  <div class="font-semibold truncate">{{ flight.flight_regime === 'domestic' ? 'Domestique' : 'International' }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card class="border-2 hover:shadow-md transition-all">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Type</div>
                  <div class="font-semibold truncate">{{ flight.flight_type === 'regular' ? 'Régulier' : 'Non Régulier' }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Statistiques passagers -->
        <Card v-if="flight.statistics">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Users class="h-4 w-4" />Statistiques passagers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-4">
              <div class="relative p-4 border-2 rounded-xl bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
                <div class="text-sm text-blue-600 dark:text-blue-400 font-medium">Total passagers</div>
                <div class="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{{ flight.statistics.passengers_count }}</div>
              </div>
              <div class="relative p-4 border-2 rounded-xl bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all">
                <div class="text-sm text-purple-600 dark:text-purple-400 font-medium">Pax Bus</div>
                <div class="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">{{ flight.statistics.pax_bus }}</div>
              </div>
              <div class="relative p-4 border-2 rounded-xl bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                <div class="text-sm text-green-600 dark:text-green-400 font-medium">Go pass</div>
                <div class="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{{ flight.statistics.go_pass_count }}</div>
              </div>
              <div class="relative p-4 border-2 rounded-xl hover:shadow-md transition-all" :class="getEcartClass(flight.statistics.passengers_ecart)">
                <div class="text-sm font-medium">Écart passagers</div>
                <div class="text-3xl font-bold mt-2">{{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}</div>
              </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2 mt-4">
              <div v-if="flight.statistics.fret_count" class="p-4 border-2 rounded-xl border-orange-200 dark:border-orange-800 bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20">
                <div class="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">Fret</div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <div class="text-xs text-muted-foreground">Départ</div>
                    <div class="text-lg font-bold">{{ flight.statistics.fret_count.departure > 0 ? `+${flight.statistics.fret_count.departure}` : '0' }} kg</div>
                  </div>
                  <div>
                    <div class="text-xs text-muted-foreground">Arrivée</div>
                    <div class="text-lg font-bold">{{ flight.statistics.fret_count.arrival > 0 ? `+${flight.statistics.fret_count.arrival}` : '0' }} kg</div>
                  </div>
                </div>
              </div>
              <div v-if="flight.statistics.excedents" class="p-4 border-2 rounded-xl border-pink-200 dark:border-pink-800 bg-linear-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/30 dark:to-pink-900/20">
                <div class="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">Excédents</div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <div class="text-xs text-muted-foreground">Départ</div>
                    <div class="text-lg font-bold">{{ flight.statistics.excedents.departure > 0 ? `+${flight.statistics.excedents.departure}` : '0' }} kg</div>
                  </div>
                  <div>
                    <div class="text-xs text-muted-foreground">Arrivée</div>
                    <div class="text-lg font-bold">{{ flight.statistics.excedents.arrival > 0 ? `+${flight.statistics.excedents.arrival}` : '0' }} kg</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Justification (lecture) -->
        <Card v-if="flight.statistics?.has_justification">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <AlertCircle class="h-4 w-4" />Justification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="flight.statistics.justification && Object.keys(flight.statistics.justification).length > 0">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div v-for="(value, key) in flight.statistics.justification" :key="key" class="p-3 border-2 rounded-lg bg-muted/50">
                  <div class="text-sm font-semibold">{{ key }}</div>
                  <div class="text-sm text-muted-foreground mt-1">{{ formatJustificationValue(value) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-muted-foreground text-center py-4">Justification requise mais non fournie</div>
          </CardContent>
        </Card>

        <!-- Remarques (lecture) -->
        <Card v-if="flight.remarks" class="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <AlertCircle class="h-4 w-4" />Remarques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm leading-relaxed">{{ flight.remarks }}</p>
          </CardContent>
        </Card>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="isOpen = false">
          <X class="mr-2 h-4 w-4" />Fermer
        </Button>
        <Button v-if="quickEditMode" variant="secondary" @click="openQuickEdit">
          <ClipboardEdit class="mr-2 h-4 w-4" />Saisie rapide
        </Button>
        <!-- Masqué pour les permanents -->
        <Button v-if="canFullEdit" @click="handleEdit">
          <Pencil class="mr-2 h-4 w-4" />Modifier
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══════════════════════════════════════
       VTA-PAXBUS
       ══════════════════════════════════════ -->
  <Dialog v-if="quickEditMode === 'paxbus'" v-model:open="quickEditOpen">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Bus class="h-4 w-4 text-purple-600" />
          </div>
          Saisie rapide — Pax Bus
        </DialogTitle>
        <DialogDescription>{{ flight?.flight_number }} · {{ formatDateTime(flight?.departure_time) }}</DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <!-- Operator readonly -->
        <div class="space-y-2">
          <Label class="text-sm font-medium flex items-center gap-2">
            <Building2 class="h-3.5 w-3.5" />Exploitant
          </Label>
          <div class="flex items-center h-10 px-3 border-2 rounded-md bg-muted/50 text-sm font-medium">
            {{ flight?.operator?.name || 'N/A' }}
            <span class="ml-2 text-xs text-muted-foreground">({{ flight?.operator?.sigle }})</span>
          </div>
        </div>

        <!-- Aéronef dynamique -->
        <div class="space-y-2">
          <div class="flex items-center justify-between mb-1">
            <Label class="text-base font-semibold flex items-center gap-2">
              <Plane class="h-4 w-4" />Aéronef
            </Label>
            <div class="flex items-center gap-1">
              <Button v-if="flight?.operator?.id && !showAllAircrafts" type="button" variant="ghost" size="sm"
                @click="showAllAircrafts = true" class="text-xs h-auto py-1">
                <Plus class="h-3 w-3 mr-1" />Choisir autre aéronef
              </Button>
              <Button v-if="showAllAircrafts" type="button" variant="ghost" size="sm"
                @click="showAllAircrafts = false" class="text-xs h-auto py-1">
                <X class="h-3 w-3 mr-1" />Uniquement opérateur
              </Button>
            </div>
          </div>
          <Popover v-model:open="aircraftPopoverOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" role="combobox" :aria-expanded="aircraftPopoverOpen"
                class="w-full justify-between h-10 text-base"
                :class="{ 'border-destructive': qeErrors.aircraft_id }">
                <span :class="{ 'text-muted-foreground': !qeAircraftLabel }">
                  {{ qeAircraftLabel || 'Sélectionner un aéronef' }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-full p-0">
              <Command v-model:search-term="aircraftSearchTerm">
                <CommandInput placeholder="Chercher aéronef..." />
                <CommandEmpty>
                  <p class="text-sm text-muted-foreground py-2 text-center">Aucun aéronef trouvé</p>
                </CommandEmpty>
                <CommandList>
                  <CommandGroup class="max-h-56 overflow-y-auto">
                    <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {{ showAllAircrafts ? 'Tous les aéronefs' : "Aéronefs de l'exploitant" }}
                    </div>
                    <CommandItem v-for="aircraft in filteredAircrafts" :key="aircraft.id"
                      :value="aircraft.id.toString()" @select="selectAircraft(aircraft)">
                      <Check :class="['mr-2 h-4 w-4', qeForm.aircraft_id === aircraft.id ? 'opacity-100' : 'opacity-0']" />
                      <div class="flex items-center gap-2 flex-1">
                        <span class="font-mono font-medium">{{ aircraft.immatriculation }}</span>
                        <Badge variant="secondary" class="text-xs">{{ aircraft.type?.sigle || aircraft.type?.name }}</Badge>
                        <span v-if="showAllAircrafts" class="text-xs text-muted-foreground ml-auto">{{ aircraft.operator?.sigle }}</span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="qeErrors.aircraft_id" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ qeErrors.aircraft_id }}
          </p>
          <p v-else-if="!showAllAircrafts && operatorAircrafts.length === 0" class="text-xs text-amber-600 dark:text-amber-400">
            Aucun aéronef pour cet exploitant —
            <button type="button" class="underline font-medium" @click="showAllAircrafts = true">afficher tous</button>
          </p>
        </div>

        <!-- Pax Bus -->
        <div class="space-y-2">
          <Label for="qe-pax-bus" class="text-sm font-medium flex items-center gap-2">
            <Users class="h-3.5 w-3.5" />Nombre Pax Bus
          </Label>
          <Input id="qe-pax-bus" v-model.number="qeForm.pax_bus" type="number" min="0"
            class="text-base font-semibold" :class="{ 'border-destructive': qeErrors.pax_bus }" placeholder="0" />
          <p v-if="qeErrors.pax_bus" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ qeErrors.pax_bus }}
          </p>
        </div>

        <!-- Observations -->
        <Card class="border-2 border-amber-200/50 dark:border-amber-800/50">
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-center gap-2">
              <AlertTriangle class="h-4 w-4 text-amber-600" />Observations
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Label for="qe-remarks-pax" class="text-sm font-medium">Remarques ou observations supplémentaires</Label>
            <textarea id="qe-remarks-pax" v-model="qeForm.remarks"
              placeholder="Ajouter des observations, notes spéciales, ou remarques sur le vol..."
              rows="3"
              class="w-full px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none" />
            <p class="text-xs text-muted-foreground">{{ qeForm.remarks?.length || 0 }} caractère(s)</p>
          </CardContent>
        </Card>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="quickEditOpen = false" :disabled="qeSaving">Annuler</Button>
        <Button @click="submitQuickEdit" :disabled="qeSaving">
          <span v-if="qeSaving" class="flex items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Enregistrement...
          </span>
          <span v-else class="flex items-center gap-2"><Save class="h-4 w-4" />Enregistrer</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══════════════════════════════════════
       VTA-IDEF
       ══════════════════════════════════════ -->
  <Dialog v-if="quickEditMode === 'idef'" v-model:open="quickEditOpen">
    <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <TrendingUp class="h-4 w-4 text-green-600" />
          </div>
          Saisie rapide — IDEF
        </DialogTitle>
        <DialogDescription>{{ flight?.flight_number }} · {{ formatDateTime(flight?.departure_time) }}</DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <!-- Operator readonly -->
        <div class="space-y-2">
          <Label class="text-sm font-medium flex items-center gap-2">
            <Building2 class="h-3.5 w-3.5" />Exploitant
          </Label>
          <div class="flex items-center h-10 px-3 border-2 rounded-md bg-muted/50 text-sm font-medium">
            {{ flight?.operator?.name || 'N/A' }}
            <span class="ml-2 text-xs text-muted-foreground">({{ flight?.operator?.sigle }})</span>
          </div>
        </div>

        <!-- Aéronef dynamique -->
        <div class="space-y-2">
          <div class="flex items-center justify-between mb-1">
            <Label class="text-base font-semibold flex items-center gap-2">
              <Plane class="h-4 w-4" />Aéronef
            </Label>
            <div class="flex items-center gap-1">
              <Button v-if="flight?.operator?.id && !showAllAircrafts" type="button" variant="ghost" size="sm"
                @click="showAllAircrafts = true" class="text-xs h-auto py-1">
                <Plus class="h-3 w-3 mr-1" />Choisir autre aéronef
              </Button>
              <Button v-if="showAllAircrafts" type="button" variant="ghost" size="sm"
                @click="showAllAircrafts = false" class="text-xs h-auto py-1">
                <X class="h-3 w-3 mr-1" />Uniquement opérateur
              </Button>
            </div>
          </div>
          <Popover v-model:open="aircraftPopoverOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" role="combobox" :aria-expanded="aircraftPopoverOpen"
                class="w-full justify-between h-10 text-base"
                :class="{ 'border-destructive': qeErrors.aircraft_id }">
                <span :class="{ 'text-muted-foreground': !qeAircraftLabel }">
                  {{ qeAircraftLabel || 'Sélectionner un aéronef' }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-full p-0">
              <Command v-model:search-term="aircraftSearchTerm">
                <CommandInput placeholder="Chercher aéronef..." />
                <CommandEmpty>
                  <p class="text-sm text-muted-foreground py-2 text-center">Aucun aéronef trouvé</p>
                </CommandEmpty>
                <CommandList>
                  <CommandGroup class="max-h-56 overflow-y-auto">
                    <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {{ showAllAircrafts ? 'Tous les aéronefs' : "Aéronefs de l'exploitant" }}
                    </div>
                    <CommandItem v-for="aircraft in filteredAircrafts" :key="aircraft.id"
                      :value="aircraft.id.toString()" @select="selectAircraft(aircraft)">
                      <Check :class="['mr-2 h-4 w-4', qeForm.aircraft_id === aircraft.id ? 'opacity-100' : 'opacity-0']" />
                      <div class="flex items-center gap-2 flex-1">
                        <span class="font-mono font-medium">{{ aircraft.immatriculation }}</span>
                        <Badge variant="secondary" class="text-xs">{{ aircraft.type?.sigle || aircraft.type?.name }}</Badge>
                        <span v-if="showAllAircrafts" class="text-xs text-muted-foreground ml-auto">{{ aircraft.operator?.sigle }}</span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="qeErrors.aircraft_id" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ qeErrors.aircraft_id }}
          </p>
          <p v-else-if="!showAllAircrafts && operatorAircrafts.length === 0" class="text-xs text-amber-600 dark:text-amber-400">
            Aucun aéronef pour cet exploitant —
            <button type="button" class="underline font-medium" @click="showAllAircrafts = true">afficher tous</button>
          </p>
        </div>

        <!-- Passagers + GoPass (identique Step4) -->
        <Card class="border-2 border-purple-200/50 dark:border-purple-800/50">
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-center gap-2">
              <Users class="h-4 w-4 text-purple-600" />Statistiques passagers
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-sm font-medium mb-2 block">Nombre de passagers</Label>
                <Input v-model.number="qeForm.passengers_count" type="number" min="0" placeholder="0"
                  class="text-base font-semibold" :class="{ 'border-destructive': qeErrors.passengers_count }" />
                <p v-if="qeErrors.passengers_count" class="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />{{ qeErrors.passengers_count }}
                </p>
              </div>
              <div>
                <Label class="text-sm font-medium mb-2 block">Go Pass Count</Label>
                <Input v-model.number="qeForm.go_pass_count" type="number" min="0" placeholder="0"
                  class="text-base font-semibold" :class="{ 'border-destructive': qeErrors.go_pass_count }" />
                <p v-if="qeErrors.go_pass_count" class="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />{{ qeErrors.go_pass_count }}
                </p>
              </div>
              <!-- Écart calculé readonly, identique Step4 -->
              <div class="col-span-2">
                <Label class="text-sm font-medium mb-2 block">Écart</Label>
                <div class="flex items-center h-10 px-3 border rounded-md bg-muted text-muted-foreground font-semibold">
                  {{ idefEcart > 0 ? '+' : '' }}{{ idefEcart }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- JustificationsSection — identique Step4, visible si écart > 0 -->
        <div v-if="idefEcart > 0" class="space-y-3">
          <Card class="border-2 border-amber-200/60 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/10">
            <CardHeader class="pb-3">
              <CardTitle class="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle class="h-4 w-4" />
                Justifications de l'écart
                <Badge variant="outline" class="ml-auto text-amber-700 border-amber-400 text-xs">
                  Écart : +{{ idefEcart }} pax
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <p class="text-xs text-muted-foreground">
                Répartissez les {{ idefEcart }} passager{{ idefEcart > 1 ? 's' : '' }} entre les motifs.
                Total :
                <span :class="justifTotal === idefEcart ? 'text-green-600 font-semibold' : 'text-destructive font-semibold'">
                  {{ justifTotal }}
                </span> / {{ idefEcart }}
              </p>

              <div v-if="justifications.length === 0" class="flex items-center gap-2 text-xs text-muted-foreground italic py-2">
                <div class="h-3 w-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                Chargement des justifications...
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="justif in justifications"
                  :key="justif.id"
                  class="flex items-center justify-between p-3 border-2 rounded-lg bg-white dark:bg-background transition-colors"
                  :class="(qeForm.justification[justif.id] ?? 0) > 0
                    ? 'border-amber-300 dark:border-amber-700'
                    : 'border-border hover:border-amber-200 dark:hover:border-amber-800'"
                >
                  <div class="text-sm font-medium flex-1">{{ justif.name }}</div>
                  <Input
                    v-model.number="qeForm.justification[justif.id]"
                    type="number" min="0" :max="idefEcart"
                    class="w-20 h-8 text-sm text-center font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>

              <p v-if="qeErrors.justification" class="text-xs text-destructive flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />{{ qeErrors.justification }}
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- Observations -->
        <Card class="border-2 border-amber-200/50 dark:border-amber-800/50">
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-center gap-2">
              <AlertTriangle class="h-4 w-4 text-amber-600" />Observations
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Label for="qe-remarks-idef" class="text-sm font-medium">Remarques ou observations supplémentaires</Label>
            <textarea id="qe-remarks-idef" v-model="qeForm.remarks"
              placeholder="Ajouter des observations, notes spéciales, ou remarques sur le vol..."
              rows="3"
              class="w-full px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none" />
            <p class="text-xs text-muted-foreground">{{ qeForm.remarks?.length || 0 }} caractère(s)</p>
          </CardContent>
        </Card>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="quickEditOpen = false" :disabled="qeSaving">Annuler</Button>
        <Button @click="submitQuickEdit" :disabled="qeSaving">
          <span v-if="qeSaving" class="flex items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Enregistrement...
          </span>
          <span v-else class="flex items-center gap-2"><Save class="h-4 w-4" />Enregistrer</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══════════════════════════════════════
       VTA-Trafic
       ══════════════════════════════════════ -->
  <Dialog v-if="quickEditMode === 'trafic'" v-model:open="quickEditOpen">
    <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <BarChart3 class="h-4 w-4 text-orange-600" />
          </div>
          Saisie rapide — Trafic
        </DialogTitle>
        <DialogDescription>{{ flight?.flight_number }} · {{ formatDateTime(flight?.departure_time) }}</DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <!-- Operator readonly -->
        <div class="space-y-2">
          <Label class="text-sm font-medium flex items-center gap-2">
            <Building2 class="h-3.5 w-3.5" />Exploitant
          </Label>
          <div class="flex items-center h-10 px-3 border-2 rounded-md bg-muted/50 text-sm font-medium">
            {{ flight?.operator?.name || 'N/A' }}
            <span class="ml-2 text-xs text-muted-foreground">({{ flight?.operator?.sigle }})</span>
          </div>
        </div>

        <!-- Passagers -->
        <div class="space-y-2">
          <Label for="qe-trafic-pax" class="text-sm font-medium flex items-center gap-2">
            <Users class="h-3.5 w-3.5" />Passagers
          </Label>
          <Input id="qe-trafic-pax" v-model.number="qeForm.passengers_count" type="number" min="0"
            class="text-base font-semibold" :class="{ 'border-destructive': qeErrors.passengers_count }" placeholder="0" />
          <p v-if="qeErrors.passengers_count" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ qeErrors.passengers_count }}
          </p>
        </div>

        <!-- Fret (identique Step3) -->
        <Card class="border-2">
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-center gap-2">
              <Package class="h-4 w-4" />Fret
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Alert v-if="isDomesticFlight" variant="default" class="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Info class="h-4 w-4 text-blue-600" />
              <AlertTitle class="text-blue-900 dark:text-blue-100">Vol national</AlertTitle>
              <AlertDescription class="text-blue-700 dark:text-blue-300">
                Les données à l'arrivée sont désactivées pour les vols nationaux.
              </AlertDescription>
            </Alert>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-sm font-medium mb-2 block">Au départ</Label>
                <Input v-model.number="qeForm.fret_count.departure" type="number" min="0" placeholder="0" class="text-base" />
              </div>
              <div class="relative">
                <Label class="text-sm font-medium mb-2 block flex items-center gap-2">
                  À l'arrivée
                  <Badge v-if="isDomesticFlight" variant="secondary" class="text-xs">Désactivé</Badge>
                </Label>
                <Input v-model.number="qeForm.fret_count.arrival" type="number" min="0" placeholder="0" class="text-base"
                  :disabled="isDomesticFlight" :class="{ 'bg-muted cursor-not-allowed opacity-60': isDomesticFlight }" />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Excédents (identique Step3) -->
        <Card class="border-2">
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-center gap-2">
              <AlertCircle class="h-4 w-4" />Excédents
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-sm font-medium mb-2 block">Au départ</Label>
                <Input v-model.number="qeForm.excedents.departure" type="number" min="0" placeholder="0" class="text-base" />
              </div>
              <div class="relative">
                <Label class="text-sm font-medium mb-2 block flex items-center gap-2">
                  À l'arrivée
                  <Badge v-if="isDomesticFlight" variant="secondary" class="text-xs">Désactivé</Badge>
                </Label>
                <Input v-model.number="qeForm.excedents.arrival" type="number" min="0" placeholder="0" class="text-base"
                  :disabled="isDomesticFlight" :class="{ 'bg-muted cursor-not-allowed opacity-60': isDomesticFlight }" />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Observations -->
        <Card class="border-2 border-amber-200/50 dark:border-amber-800/50">
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-center gap-2">
              <AlertTriangle class="h-4 w-4 text-amber-600" />Observations
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Label for="qe-remarks-trafic" class="text-sm font-medium">Remarques ou observations supplémentaires</Label>
            <textarea id="qe-remarks-trafic" v-model="qeForm.remarks"
              placeholder="Ajouter des observations, notes spéciales, ou remarques sur le vol..."
              rows="3"
              class="w-full px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none" />
            <p class="text-xs text-muted-foreground">{{ qeForm.remarks?.length || 0 }} caractère(s)</p>
          </CardContent>
        </Card>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="quickEditOpen = false" :disabled="qeSaving">Annuler</Button>
        <Button @click="submitQuickEdit" :disabled="qeSaving">
          <span v-if="qeSaving" class="flex items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Enregistrement...
          </span>
          <span v-else class="flex items-center gap-2"><Save class="h-4 w-4" />Enregistrer</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Pencil, PlaneTakeoff, Building2, Plane, ArrowRight, Users, AlertCircle,
  Globe, CheckCircle, X, ClipboardEdit, Save, Bus, TrendingUp, BarChart3,
  Package, Info, AlertTriangle, Plus, Check, ChevronsUpDown,
} from 'lucide-vue-next'
import { FLIGHT_NATURE_LABELS, type Flight, type FlightJustification } from '~/types/api'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandGroup, CommandItem, CommandEmpty, CommandList } from '@/components/ui/command'
import { useToast } from '@/composables/useToast'

// ─── Props / Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  flight: Flight | null
  open: boolean
  /** Même liste que celle passée à FlightStep1BasicInfo */
  aircrafts?: any[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [flight: Flight]
  updated: [flight: Flight]
}>()

// ─── Composables ──────────────────────────────────────────────────────────────

const { apiFetch } = useApi()
const { success: showSuccess, error: showError } = useToast()
const { userFunction, isPermanent, can } = usePermission()

// ─── Dialog principal ─────────────────────────────────────────────────────────

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

/**
 * "Modifier" — masqué pour les permanents.
 * Ils passent uniquement par la saisie rapide selon leur fonction.
 */
const canFullEdit = computed(
  () => !isPermanent.value && can(['flight.updateOwn', 'flight.updateAny']),
)

// ─── Mode saisie rapide ───────────────────────────────────────────────────────

const quickEditMode = computed<'paxbus' | 'idef' | 'trafic' | null>(() => {
  const fn = (userFunction.value ?? '').toUpperCase().replace(/\s/g, '')
  if (fn.includes('PAXBUS')) return 'paxbus'
  if (fn.includes('IDEF'))   return 'idef'
  if (fn.includes('TRAFIC')) return 'trafic'
  return null
})

const isDomesticFlight = computed(() => props.flight?.flight_regime === 'domestic')

// ─── Aircraft combobox state (partagé entre les 2 dialogs paxbus/idef) ────────

const aircraftPopoverOpen = ref(false)
const aircraftSearchTerm  = ref('')
const showAllAircrafts    = ref(false)

/** Aéronefs filtrés sur l'opérateur du vol courant */
const operatorAircrafts = computed(() => {
  if (!props.flight?.operator?.id || !props.aircrafts) return []
  return props.aircrafts.filter(
    a => (a.operator_id || a.operator?.id) === props.flight!.operator!.id,
  )
})

/** Liste active selon showAllAircrafts + terme de recherche */
const filteredAircrafts = computed(() => {
  const src = showAllAircrafts.value ? (props.aircrafts ?? []) : operatorAircrafts.value
  if (!aircraftSearchTerm.value) return src
  const q = aircraftSearchTerm.value.toLowerCase()
  return src.filter(
    a =>
      a.immatriculation.toLowerCase().includes(q) ||
      a.type?.sigle?.toLowerCase().includes(q) ||
      a.type?.name?.toLowerCase().includes(q) ||
      (showAllAircrafts.value && a.operator?.sigle?.toLowerCase().includes(q)),
  )
})

const selectAircraft = (aircraft: any) => {
  qeForm.value.aircraft_id = aircraft.id
  qeAircraftLabel.value = aircraft.immatriculation
  aircraftPopoverOpen.value = false
  aircraftSearchTerm.value = ''
}

// ─── Quick-edit form ──────────────────────────────────────────────────────────

const quickEditOpen   = ref(false)
const qeSaving        = ref(false)
const qeErrors        = ref<Record<string, string>>({})
const qeAircraftLabel = ref('')

const justifications  = ref<FlightJustification[]>([])

const qeForm = ref({
  aircraft_id:       0,
  passengers_count:  0,
  pax_bus:           0,
  go_pass_count:     0,
  fret_count:        { departure: 0, arrival: 0 },
  excedents:         { departure: 0, arrival: 0 },
  justification:     {} as Record<number, number>,
  remarks:           '' as string | null,
})

const idefEcart = computed(
  () => qeForm.value.passengers_count - qeForm.value.go_pass_count,
)

const justifTotal = computed(
  () => Object.values(qeForm.value.justification).reduce((s, v) => s + (Number(v) || 0), 0),
)

const syncForm = () => {
  if (!props.flight) return
  const s = props.flight.statistics
  qeForm.value = {
    aircraft_id:      props.flight.aircraft?.id ?? (props.flight as any).aircraft_id ?? 0,
    passengers_count: s?.passengers_count ?? 0,
    pax_bus:          s?.pax_bus ?? 0,
    go_pass_count:    s?.go_pass_count ?? 0,
    fret_count:       { departure: s?.fret_count?.departure ?? 0, arrival: s?.fret_count?.arrival ?? 0 },
    excedents:        { departure: s?.excedents?.departure ?? 0,  arrival: s?.excedents?.arrival ?? 0 },
    justification:    {},
    remarks:          props.flight.remarks ?? '',
  }
  qeAircraftLabel.value  = props.flight.aircraft?.immatriculation?.toString() ?? ''
  showAllAircrafts.value = false
  qeErrors.value         = {}
}

const openQuickEdit = async () => {
  syncForm()
  quickEditOpen.value = true
  if (quickEditMode.value === 'idef' && justifications.value.length === 0) {
    try {
      const res = await apiFetch<FlightJustification[]>('/flight-justifications')
      justifications.value = res
    } catch { /* non-blocking */ }
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

const validateQeForm = (): boolean => {
  qeErrors.value = {}
  const mode = quickEditMode.value

  if (mode === 'paxbus' || mode === 'idef') {
    if (!qeForm.value.aircraft_id)
      qeErrors.value.aircraft_id = "L'aéronef est requis"
  }

  if (mode === 'paxbus') {
    const maxPax = props.flight?.statistics?.passengers_count ?? Infinity
    if (qeForm.value.pax_bus < 0)
      qeErrors.value.pax_bus = 'La valeur ne peut pas être négative'
    else if (qeForm.value.pax_bus > maxPax)
      qeErrors.value.pax_bus = 'Le Pax Bus ne peut pas dépasser le nombre total de passagers'
  }

  if (mode === 'idef') {
    if (qeForm.value.passengers_count < 0)
      qeErrors.value.passengers_count = 'La valeur ne peut pas être négative'
    if (qeForm.value.go_pass_count < 0)
      qeErrors.value.go_pass_count = 'La valeur ne peut pas être négative'
    if (qeForm.value.go_pass_count > qeForm.value.passengers_count)
      qeErrors.value.go_pass_count = 'Le Go Pass ne peut pas dépasser le nombre de passagers'
    if (idefEcart.value > 0 && justifTotal.value !== idefEcart.value)
      qeErrors.value.justification =
        `La somme des justifications (${justifTotal.value}) doit égaler l'écart (${idefEcart.value})`
  }

  if (mode === 'trafic') {
    if (qeForm.value.passengers_count < 0)
      qeErrors.value.passengers_count = 'La valeur ne peut pas être négative'
  }

  return Object.keys(qeErrors.value).length === 0
}

// ─── Submit ───────────────────────────────────────────────────────────────────

const submitQuickEdit = async () => {
  if (!props.flight || !validateQeForm()) return
  qeSaving.value = true
  try {
    const mode = quickEditMode.value
    const existing = props.flight.statistics ?? {}
    let statisticsPatch: Record<string, any> = {}

    if (mode === 'paxbus') {
      statisticsPatch = { ...existing, pax_bus: qeForm.value.pax_bus }
    } else if (mode === 'idef') {
      const ecart = idefEcart.value
      statisticsPatch = {
        ...existing,
        passengers_count:  qeForm.value.passengers_count,
        go_pass_count:     qeForm.value.go_pass_count,
        passengers_ecart:  ecart,
        has_justification: ecart > 0,
        justification:     ecart > 0 ? buildJustificationPayload() : {},
      }
    } else if (mode === 'trafic') {
      statisticsPatch = {
        ...existing,
        passengers_count: qeForm.value.passengers_count,
        fret_count: {
          departure: qeForm.value.fret_count.departure,
          arrival:   isDomesticFlight.value ? 0 : qeForm.value.fret_count.arrival,
        },
        excedents: {
          departure: qeForm.value.excedents.departure,
          arrival:   isDomesticFlight.value ? 0 : qeForm.value.excedents.arrival,
        },
      }
    }

    const updated = await apiFetch<{ data: Flight }>(`/flights/${props.flight.id}`, {
      method: 'PUT',
      body: buildFlightPayload(statisticsPatch),
    })

    showSuccess('Vol mis à jour', 'Les données ont été enregistrées avec succès')
    quickEditOpen.value = false
    emit('updated', updated.data)
  } catch (err: any) {
    const msg = err?.data?.message ?? 'Erreur lors de la mise à jour du vol'
    const apiErrors = err?.data?.errors as Record<string, string[]> | undefined
    if (apiErrors) {
      Object.entries(apiErrors).forEach(([f, msgs]) => { qeErrors.value[f] = msgs[0] })
    }
    showError(msg)
  } finally {
    qeSaving.value = false
  }
}

const buildFlightPayload = (statisticsPatch: Record<string, any>) => {
  const f = props.flight!
  return {
    flight_number:  f.flight_number,
    operator_id:    f.operator?.id,
    aircraft_id:    qeForm.value.aircraft_id || f.aircraft?.id || (f as any).aircraft_id,
    departure:      f.departure,
    arrival:        f.arrival,
    departure_time: f.departure_time,
    arrival_time:   f.arrival_time,
    flight_regime:  f.flight_regime,
    flight_type:    typeof f.flight_type === 'object' ? (f.flight_type as any)?.value : f.flight_type,
    flight_nature:  typeof f.flight_nature === 'object' ? (f.flight_nature as any)?.value : f.flight_nature,
    status:         f.status,
    remarks:        qeForm.value.remarks,
    statistics:     statisticsPatch,
  }
}

const buildJustificationPayload = () => {
  const result: Record<string, any> = {}
  justifications.value.forEach((j) => {
    const count = Number(qeForm.value.justification[j.id]) || 0
    if (count > 0) result[j.name] = count
  })
  return result
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(() => props.flight, syncForm, { immediate: true })

// ─── Helpers d'affichage ──────────────────────────────────────────────────────

const formatLocationIata = (location: any): string => {
  if (!location) return 'Lieu introuvable'
  if (location.from && location.to) {
    const f = location.from?.iata, t = location.to?.iata
    return (f && t) ? `${f} → ${t}` : f || t || 'Lieu introuvable'
  }
  return location?.iata || location?.[0] || 'Lieu introuvable'
}

const formatLocationName = (location: any): string => {
  if (!location) return 'Lieu introuvable'
  if (location.from && location.to) {
    const f = location.from?.name, t = location.to?.name
    return (f && t) ? `${f} → ${t}` : f || t || 'Lieu introuvable'
  }
  return location?.name || 'Lieu introuvable'
}

const formatTime = (dt: string) =>
  new Date(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const formatDateTime = (dt?: string) => {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const getEcartClass = (ecart: number) => {
  if (ecart > 0) return 'bg-linear-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800'
  if (ecart < 0) return 'bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800'
  return 'bg-linear-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20 border-gray-200 dark:border-gray-800'
}

const formatJustificationValue = (value: any): string => {
  if (typeof value === 'object' && value !== null && 'sfr' in value)
    return value.sfr > 0 ? `${value.value || 0} dont ${value.sfr} sans feuille de route` : `${value.value || 0}`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const getFlightNature = (flight: Flight | null) =>
  flight ? (FLIGHT_NATURE_LABELS[flight.flight_nature] ?? FLIGHT_NATURE_LABELS.commercial) : ''

const handleEdit = () => {
  if (props.flight) {
    emit('edit', props.flight)
    isOpen.value = false
  }
}
</script>