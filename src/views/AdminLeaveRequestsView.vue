<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const requests = ref([])
const comments = ref({})
const loading = ref(true)
const actingId = ref(null)
const error = ref('')

function errorText(err) {
  if (err.errors) return Object.values(err.errors).flat().join(' ')
  return err.message || 'Something went wrong. Please try again.'
}

async function loadRequests() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/admin/leave-requests')
    requests.value = data.data || []
  } catch (err) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

async function decideRequest(item, status) {
  actingId.value = item.id
  error.value = ''
  try {
    await api(`/admin/leave-requests/${item.id}/decide`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        admin_comment: comments.value[item.id] || '',
      }),
    })
    await loadRequests()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    actingId.value = null
  }
}

onMounted(loadRequests)
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold text-slate-900">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Rugsat soraglary</span>
      </div>
    </header>

    <section class="mx-auto max-w-7xl space-y-6 px-6 py-10">
      <h1 class="text-2xl font-bold text-slate-900">Rugsat soraglary</h1>
      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Ýüklenýär...</div>
        <div v-else-if="requests.length === 0" class="p-8 text-center text-sm text-slate-500">Rugsat soragy ýok.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[1050px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th class="px-4 py-3">Işgär</th><th class="px-4 py-3">Başlangyç</th><th class="px-4 py-3">Gutarýan</th><th class="px-4 py-3">Sebäp</th><th class="px-4 py-3">Ýagdaýy</th><th class="px-4 py-3">Admin düşündirişi</th><th class="px-4 py-3"></th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in requests" :key="item.id" class="align-top text-slate-700">
                <td class="px-4 py-4 font-medium text-slate-900">{{ item.employee?.name || '—' }}</td>
                <td class="whitespace-nowrap px-4 py-4">{{ item.start_date }}</td>
                <td class="whitespace-nowrap px-4 py-4">{{ item.end_date }}</td>
                <td class="max-w-xs whitespace-pre-wrap px-4 py-4">{{ item.reason }}</td>
                <td class="px-4 py-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{{ item.status }}</span></td>
                <td class="min-w-56 px-4 py-4">
                  <textarea v-if="item.status === 'pending'" v-model="comments[item.id]" rows="2" maxlength="5000" class="w-full rounded-md border border-slate-300 px-2.5 py-2" placeholder="Comment (optional)" />
                  <span v-else>{{ item.admin_comment || '—' }}</span>
                </td>
                <td class="px-4 py-4">
                  <div v-if="item.status === 'pending'" class="flex gap-2">
                    <button type="button" :disabled="actingId === item.id" @click="decideRequest(item, 'approved')" class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">Tassykla</button>
                    <button type="button" :disabled="actingId === item.id" @click="decideRequest(item, 'rejected')" class="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">Ret et</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>
