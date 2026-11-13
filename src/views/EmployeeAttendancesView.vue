<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const attendances = ref([])
const loading = ref(true)
const error = ref('')

async function loadAttendances() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/attendances')
    attendances.value = data.data || []
  } catch (err) {
    error.value = err.message || 'Gelen-giden sanawyny alyp bolmady.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAttendances)
</script>

<template>
  <main class="app-background min-h-screen">
    <div class="ambient-glow" aria-hidden="true"></div>
    <header class="glass-nav">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/employee" class="text-lg font-bold nav-brand">Ishgar paneli</RouterLink>
        <span class="text-sm font-medium text-theme-accent">Gelen-giden</span>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-5 px-6 py-10">
      <h1 class="text-2xl font-bold text-theme-primary">Gelen-giden sanawy</h1>
      <p v-if="error" role="alert" class="glass-error">{{ error }}</p>
      <div class="glass-table">
        <div v-if="loading" class="p-8 text-center text-sm text-theme-muted">Yuklenyar...</div>
        <div v-else-if="attendances.length === 0" class="p-8 text-center text-sm text-theme-muted">Gelen-giden ýazgysy ýok.</div>
        <table v-else class="w-full text-left text-sm">
          <thead class="table-head text-xs uppercase tracking-wide text-theme-muted">
            <tr><th class="px-5 py-3">Sene</th><th class="px-5 py-3">Ýagdaýy</th></tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="item in attendances" :key="item.id" class="text-theme-secondary">
              <td class="px-5 py-4">{{ item.date }}</td>
              <td class="px-5 py-4"><span :class="`badge badge-${item.status}`">{{ item.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
