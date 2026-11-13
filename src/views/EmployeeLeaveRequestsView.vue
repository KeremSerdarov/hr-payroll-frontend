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
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/employee" class="text-lg font-bold text-slate-900">Ishgar paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Rugsat soraglary</span>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">Rugsat soragy</h1>
        <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="submitRequest">
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Başlangyç senesi
            <input v-model="startDate" type="date" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Gutarýan senesi
            <input v-model="endDate" type="date" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            Sebäp
            <textarea v-model="reason" required maxlength="5000" rows="4" class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <div class="sm:col-span-2">
            <button type="submit" :disabled="submitting" class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {{ submitting ? 'Iberilýär...' : 'Sorag iber' }}
            </button>
          </div>
        </form>
      </div>

      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 class="px-5 pt-5 text-lg font-semibold text-slate-900">Meniň soraglarym</h2>
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Ýüklenýär...</div>
        <div v-else-if="requests.length === 0" class="p-8 text-center text-sm text-slate-500">Entäk rugsat soragy ýok.</div>
        <div v-else class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[750px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th class="px-5 py-3">Başlangyç</th><th class="px-5 py-3">Gutarýan</th><th class="px-5 py-3">Sebäp</th><th class="px-5 py-3">Ýagdaýy</th><th class="px-5 py-3">Admin düşündirişi</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in requests" :key="item.id" class="text-slate-700">
                <td class="px-5 py-4">{{ item.start_date }}</td>
                <td class="px-5 py-4">{{ item.end_date }}</td>
                <td class="max-w-xs whitespace-pre-wrap px-5 py-4">{{ item.reason }}</td>
                <td class="px-5 py-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{{ item.status }}</span></td>
                <td class="px-5 py-4">{{ item.admin_comment || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</template>
