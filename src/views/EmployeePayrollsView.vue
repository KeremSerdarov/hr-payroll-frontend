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
  <main class="app-background min-h-screen">
    <div class="ambient-glow" aria-hidden="true"></div>
    <header class="glass-nav">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/employee" class="text-lg font-bold nav-brand">Ishgar paneli</RouterLink>
        <span class="text-sm font-medium text-theme-accent">Payrolls</span>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-theme-primary">{{ isDetail ? 'Payroll details' : 'My payrolls' }}</h1>
        <RouterLink v-if="isDetail" to="/employee/payrolls" class="text-sm font-medium text-theme-accent nav-link">Back to payrolls</RouterLink>
      </div>

      <p v-if="error" role="alert" class="glass-error">{{ error }}</p>
      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-theme-muted">Loading payrolls...</div>

      <div v-else-if="isDetail && payroll" class="glass-card p-6">
        <dl class="grid gap-5 sm:grid-cols-2">
          <div><dt class="text-sm text-theme-muted">Month / Year</dt><dd class="mt-1 font-semibold text-theme-primary">{{ payroll.month }} / {{ payroll.year }}</dd></div>
          <div><dt class="text-sm text-theme-muted">Status</dt><dd class="mt-1 font-semibold capitalize text-theme-primary">{{ payroll.status }}</dd></div>
          <div><dt class="text-sm text-theme-muted">Base salary</dt><dd class="mt-1 font-semibold text-theme-primary">{{ payroll.base_salary }}</dd></div>
          <div><dt class="text-sm text-theme-muted">Bonus</dt><dd class="mt-1 font-semibold text-theme-primary">{{ payroll.bonus }}</dd></div>
          <div><dt class="text-sm text-theme-muted">Deduction</dt><dd class="mt-1 font-semibold text-theme-primary">{{ payroll.deduction }}</dd></div>
          <div><dt class="text-sm text-theme-muted">Tax</dt><dd class="mt-1 font-semibold text-theme-primary">{{ payroll.tax }}</dd></div>
          <div><dt class="text-sm text-theme-muted">Net salary</dt><dd class="mt-1 font-semibold text-theme-primary">{{ payroll.net_salary }}</dd></div>
        </dl>
      </div>

      <div v-else-if="!isDetail && payrolls.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-theme-muted">No payroll records yet.</div>

      <div v-else-if="!isDetail" class="glass-table">
        <table class="w-full text-left text-sm">
          <thead class="table-head text-xs uppercase tracking-wide text-theme-muted">
            <tr><th class="px-5 py-3">Month / Year</th><th class="px-5 py-3">Net salary</th><th class="px-5 py-3">Status</th></tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="item in payrolls" :key="item.id" class="cursor-pointer text-theme-secondary hover:bg-white/10" tabindex="0"
              @click="$router.push(`/employee/payrolls/${item.id}`)" @keydown.enter="$router.push(`/employee/payrolls/${item.id}`)">
              <td class="px-5 py-4 font-medium text-theme-primary">{{ item.month }} / {{ item.year }}</td>
              <td class="px-5 py-4">{{ item.net_salary }}</td>
              <td class="px-5 py-4"><span :class="`badge badge-${item.status}`">{{ item.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
