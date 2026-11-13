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
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/employee" class="text-lg font-bold text-slate-900">Ishgar paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Gelen-giden</span>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-5 px-6 py-10">
      <h1 class="text-2xl font-bold text-slate-900">Gelen-giden sanawy</h1>
      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Yuklenyar...</div>
        <div v-else-if="attendances.length === 0" class="p-8 text-center text-sm text-slate-500">Gelen-giden ýazgysy ýok.</div>
        <table v-else class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th class="px-5 py-3">Sene</th><th class="px-5 py-3">Ýagdaýy</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in attendances" :key="item.id" class="text-slate-700">
              <td class="px-5 py-4">{{ item.date }}</td>
              <td class="px-5 py-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{{ item.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
