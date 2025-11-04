<template>
  <div class="space-y-4">
    <!-- Graphique des vols par année -->
    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2">
          <TrendingUp class="h-4 w-4" />
          Évolution des vols
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <Line :data="flightsChartData" :options="chartOptions" />
        </div>
      </CardContent>
    </Card>

    <!-- Graphique de la flotte -->
    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2">
          <Plane class="h-4 w-4" />
          Composition de la flotte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <Doughnut :data="fleetChartData" :options="doughnutOptions" />
        </div>
      </CardContent>
    </Card>
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
import { TrendingUp, Plane } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OperatorKPIs } from '~/types/api'

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
  kpis: OperatorKPIs
}>()

const currentYear = new Date().getFullYear()

// Données pour le graphique des vols
const flightsChartData = computed(() => ({
  labels: [currentYear - 2, currentYear - 1, currentYear],
  datasets: [
    {
      label: 'Nombre de vols',
      data: [
        0, // On n'a pas les données pour il y a 2 ans
        props.kpis.total_flights_previous_year,
        props.kpis.total_flights_current_year
      ],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}))

// Données pour le graphique de la flotte
const fleetChartData = computed(() => ({
  labels: ['Aéronefs actifs', 'Aéronefs inactifs'],
  datasets: [
    {
      data: [
        props.kpis.active_aircrafts_count,
        props.kpis.inactive_aircrafts_count
      ],
      backgroundColor: [
        'rgb(34, 197, 94)',
        'rgb(156, 163, 175)'
      ],
      borderWidth: 0
    }
  ]
}))

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
      padding: 12
    }
  }
}
</script>