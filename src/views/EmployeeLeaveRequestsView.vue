<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const requests = ref([])
const startDate = ref('')
const endDate = ref('')
const reason = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

function errorText(err) {
  if (err.errors) return Object.values(err.errors).flat().join(' ')
  return err.message || 'Something went wrong. Please try again.'
}

async function loadRequests() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/leave-requests')
    requests.value = data.data || []
  } catch (err) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

async function submitRequest() {
  submitting.value = true
  error.value = ''
  try {
    await api('/leave-requests', {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate.value,
        end_date: endDate.value,
        reason: reason.value,
      }),
    })
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
    await loadRequests()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    submitting.value = false
  }
}

onMounted(loadRequests)
</script>

<template>
  <main class="app-background min-h-screen">
    <div class="ambient-glow" aria-hidden="true"></div>
    <header class="glass-nav">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/employee" class="text-lg font-bold nav-brand">Ishgar paneli</RouterLink>
        <span class="text-sm font-medium text-theme-accent">Rugsat soraglary</span>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div class="glass-card p-6">
        <h1 class="text-2xl font-bold text-theme-primary">Rugsat soragy</h1>
        <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="submitRequest">
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Başlangyç senesi
            <input v-model="startDate" type="date" required class="glass-input" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Gutarýan senesi
            <input v-model="endDate" type="date" required class="glass-input" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary sm:col-span-2">
            Sebäp
            <textarea v-model="reason" required maxlength="5000" rows="4" class="glass-input" />
          </label>
          <div class="sm:col-span-2">
            <button type="submit" :disabled="submitting" class="btn-primary">
              {{ submitting ? 'Iberilýär...' : 'Sorag iber' }}
            </button>
          </div>
        </form>
      </div>

      <p v-if="error" role="alert" class="glass-error">{{ error }}</p>

      <section class="glass-table">
        <h2 class="px-5 pt-5 text-lg font-semibold text-theme-primary">Meniň soraglarym</h2>
        <div v-if="loading" class="p-8 text-center text-sm text-theme-muted">Ýüklenýär...</div>
        <div v-else-if="requests.length === 0" class="p-8 text-center text-sm text-theme-muted">Entäk rugsat soragy ýok.</div>
        <div v-else class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[750px] text-left text-sm">
            <thead class="table-head text-xs uppercase tracking-wide text-theme-muted">
              <tr><th class="px-5 py-3">Başlangyç</th><th class="px-5 py-3">Gutarýan</th><th class="px-5 py-3">Sebäp</th><th class="px-5 py-3">Ýagdaýy</th><th class="px-5 py-3">Admin düşündirişi</th></tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="item in requests" :key="item.id" class="text-theme-secondary">
                <td class="px-5 py-4">{{ item.start_date }}</td>
                <td class="px-5 py-4">{{ item.end_date }}</td>
                <td class="max-w-xs whitespace-pre-wrap px-5 py-4">{{ item.reason }}</td>
                <td class="px-5 py-4"><span :class="`badge badge-${item.status}`">{{ item.status }}</span></td>
                <td class="px-5 py-4">{{ item.admin_comment || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</template>
