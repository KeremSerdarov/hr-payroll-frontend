<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const payrolls = ref([])
const loading = ref(true)
const submitting = ref(false)
const payingId = ref(null)
const error = ref('')
const month = ref(new Date().getMonth() + 1)
const year = ref(new Date().getFullYear())

function errorText(err) {
  if (err.errors) return Object.values(err.errors).flat().join(' ')
  return err.message || 'Something went wrong. Please try again.'
}

async function loadPayrolls() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/admin/payrolls')
    payrolls.value = data.data || []
  } catch (err) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

async function generatePayrolls() {
  submitting.value = true
  error.value = ''
  try {
    await api('/admin/payrolls/generate', {
      method: 'POST',
      body: JSON.stringify({ month: Number(month.value), year: Number(year.value) }),
    })
    await loadPayrolls()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    submitting.value = false
  }
}

async function payPayroll(id) {
  payingId.value = id
  error.value = ''
  try {
    await api(`/admin/payrolls/${id}/pay`, { method: 'PATCH' })
    await loadPayrolls()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    payingId.value = null
  }
}

onMounted(loadPayrolls)
</script>

<template>
  <main class="app-background min-h-screen">
    <div class="ambient-glow" aria-hidden="true"></div>
    <header class="glass-nav">
      <div class="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold nav-brand">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-theme-accent">Payrolls</span>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
      </div>
    </header>

    <section class="mx-auto max-w-7xl space-y-6 px-6 py-10">
      <div class="glass-card p-6">
        <h1 class="text-2xl font-bold text-theme-primary">Payrolls</h1>
        <form class="mt-5 flex flex-wrap items-end gap-4" @submit.prevent="generatePayrolls">
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Month
            <select v-model="month" class="glass-input">
              <option v-for="number in 12" :key="number" :value="number">{{ number }}</option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Year
            <input v-model="year" type="number" min="2000" max="2200" required class="w-32 glass-input" />
          </label>
          <button type="submit" :disabled="submitting" class="btn-primary">
            {{ submitting ? 'Generating...' : 'Generate' }}
          </button>
        </form>
      </div>

      <p v-if="error" role="alert" class="glass-error">{{ error }}</p>

      <div class="glass-table">
        <div v-if="loading" class="p-8 text-center text-sm text-theme-muted">Loading payrolls...</div>
        <div v-else-if="payrolls.length === 0" class="p-8 text-center text-sm text-theme-muted">No payroll records yet.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[1000px] text-left text-sm">
            <thead class="table-head text-xs uppercase tracking-wide text-theme-muted">
              <tr>
                <th class="px-4 py-3">Employee</th><th class="px-4 py-3">Month / Year</th>
                <th class="px-4 py-3">Base salary</th><th class="px-4 py-3">Bonus</th>
                <th class="px-4 py-3">Deduction</th><th class="px-4 py-3">Tax</th>
                <th class="px-4 py-3">Net salary</th><th class="px-4 py-3">Status</th><th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="payroll in payrolls" :key="payroll.id" class="text-theme-secondary">
                <td class="px-4 py-3 font-medium text-theme-primary">{{ payroll.employee?.name || '—' }}</td>
                <td class="px-4 py-3">{{ payroll.month }} / {{ payroll.year }}</td>
                <td class="px-4 py-3">{{ payroll.base_salary }}</td><td class="px-4 py-3">{{ payroll.bonus }}</td>
                <td class="px-4 py-3">{{ payroll.deduction }}</td><td class="px-4 py-3">{{ payroll.tax }}</td>
                <td class="px-4 py-3 font-medium">{{ payroll.net_salary }}</td>
                <td class="px-4 py-3"><span :class="`badge badge-${payroll.status}`">{{ payroll.status }}</span></td>
                <td class="px-4 py-3">
                  <button v-if="payroll.status === 'draft'" type="button" :disabled="payingId === payroll.id" @click="payPayroll(payroll.id)"
                    class="btn-success btn-small">
                    {{ payingId === payroll.id ? 'Paying...' : 'Töle' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>
