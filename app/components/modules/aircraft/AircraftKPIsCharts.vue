<template>
  <div class="space-y-4">
    <!-- Graphique des vols mensuels -->
    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2">
          <TrendingUp class="h-4 w-4" />
          Activité mensuelle ({{ currentYear }})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <Line :data="monthlyFlightsData" :options="chartOptions" />
        </div>
      </CardContent>
    </Card>

    <!-- Graphique de répartition des vols -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <PieChart class="h-4 w-4" />
            Répartition par statut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <Doughnut :data="statusChartData" :options="doughnutOptions" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <BarChart3 class="h-4 w-4" />
            Statistiques clés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4 py-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Total vols</span>
              <span class="text-2xl font-bold">{{ kpis.total_flights_current_year }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Moyenne mensuelle</span>
              <span class="text-2xl font-bold">{{ kpis.average_flights_per_month }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Ce mois-ci</span>
              <span class="text-2xl font-bold">{{ kpis.total_flights_current_month }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { TrendingUp, PieChart, BarChart3 } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AircraftKPIs } from '~/types/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  kpis: AircraftKPIs
  flights?: any[] // Vols de l'aéronef pour calculer les stats mensuelles
}>()

const currentYear = new Date().getFullYear()

// Calculer les vols par mois (données génériques si pas de vols fournis)
const monthlyFlightsData = computed(() => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  
  let monthlyData = new Array(12).fill(0)
  
  if (props.flights && props.flights.length > 0) {
    props.flights.forEach(flight => {
      const flightDate = new Date(flight.departure_time)
      if (flightDate.getFullYear() === currentYear) {
        const month = flightDate.getMonth()
        monthlyData[month]++
      }
    })
  }
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Nombre de vols',
        data: monthlyData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

// Données pour le graphique de statut
const statusChartData = computed(() => {
  if (!props.flights || props.flights.length === 0) {
    return {
      labels: ['Vols complétés', 'Vols prévus', 'Autres'],
      datasets: [
        {
          data: [0, 0, 100],
          backgroundColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 0
        }
      ]
    }
  }

  // Compter les statuts réels des vols
  const statusCount = {
    embarque: 0,
    prevu: 0,
    qrf: 0,
    annule: 0,
    detourne: 0
  }

  props.flights.forEach(flight => {
    if (statusCount.hasOwnProperty(flight.status)) {
      statusCount[flight.status as keyof typeof statusCount]++
    }
  })

  const total = props.flights.length
  const completedPercent = Math.round((statusCount.embarque / total) * 100)
  const scheduledPercent = Math.round(((statusCount.prevu + statusCount.qrf) / total) * 100)
  const otherPercent = 100 - completedPercent - scheduledPercent

  return {
    labels: ['Vols complétés', 'Vols prévus', 'Autres'],
    datasets: [
      {
        data: [completedPercent, scheduledPercent, otherPercent],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 0
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      callbacks: {
        label: function(context: any) {
          return `${context.label}: ${context.parsed}%`
        }
      }
    }
  }
}
</script>