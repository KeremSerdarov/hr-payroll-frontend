<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const payrolls = ref([])
const payroll = ref(null)
const loading = ref(true)
const error = ref('')
const isDetail = computed(() => Boolean(route.params.id))

async function loadPayrolls() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/payrolls')
    payrolls.value = data.data || []
  } catch (err) {
    error.value = err.message || 'Could not load payrolls.'
  } finally {
    loading.value = false
  }
}

async function loadPayroll(id) {
  loading.value = true
  error.value = ''
  payroll.value = null
  try {
    const data = await api(`/payrolls/${id}`)
    payroll.value = data.data
  } catch (err) {
    error.value = err.message || 'Could not load payroll details.'
  } finally {
    loading.value = false
  }
}

function loadPage() {
  return isDetail.value ? loadPayroll(route.params.id) : loadPayrolls()
}

watch(() => route.params.id, loadPage)
onMounted(loadPage)
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/employee" class="text-lg font-bold text-slate-900">Ishgar paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Payrolls</span>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">{{ isDetail ? 'Payroll details' : 'My payrolls' }}</h1>
        <RouterLink v-if="isDetail" to="/employee/payrolls" class="text-sm font-medium text-indigo-600 hover:text-indigo-700">Back to payrolls</RouterLink>
      </div>

      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>
      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading payrolls...</div>

      <div v-else-if="isDetail && payroll" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl class="grid gap-5 sm:grid-cols-2">
          <div><dt class="text-sm text-slate-500">Month / Year</dt><dd class="mt-1 font-semibold text-slate-900">{{ payroll.month }} / {{ payroll.year }}</dd></div>
          <div><dt class="text-sm text-slate-500">Status</dt><dd class="mt-1 font-semibold capitalize text-slate-900">{{ payroll.status }}</dd></div>
          <div><dt class="text-sm text-slate-500">Base salary</dt><dd class="mt-1 font-semibold text-slate-900">{{ payroll.base_salary }}</dd></div>
          <div><dt class="text-sm text-slate-500">Bonus</dt><dd class="mt-1 font-semibold text-slate-900">{{ payroll.bonus }}</dd></div>
          <div><dt class="text-sm text-slate-500">Deduction</dt><dd class="mt-1 font-semibold text-slate-900">{{ payroll.deduction }}</dd></div>
          <div><dt class="text-sm text-slate-500">Tax</dt><dd class="mt-1 font-semibold text-slate-900">{{ payroll.tax }}</dd></div>
          <div><dt class="text-sm text-slate-500">Net salary</dt><dd class="mt-1 font-semibold text-slate-900">{{ payroll.net_salary }}</dd></div>
        </dl>
      </div>

      <div v-else-if="!isDetail && payrolls.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No payroll records yet.</div>

      <div v-else-if="!isDetail" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th class="px-5 py-3">Month / Year</th><th class="px-5 py-3">Net salary</th><th class="px-5 py-3">Status</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in payrolls" :key="item.id" class="cursor-pointer text-slate-700 hover:bg-slate-50" tabindex="0"
              @click="$router.push(`/employee/payrolls/${item.id}`)" @keydown.enter="$router.push(`/employee/payrolls/${item.id}`)">
              <td class="px-5 py-4 font-medium text-slate-900">{{ item.month }} / {{ item.year }}</td>
              <td class="px-5 py-4">{{ item.net_salary }}</td>
              <td class="px-5 py-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{{ item.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
