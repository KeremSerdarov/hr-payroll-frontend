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
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold text-slate-900">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Payrolls</span>
      </div>
    </header>

    <section class="mx-auto max-w-7xl space-y-6 px-6 py-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">Payrolls</h1>
        <form class="mt-5 flex flex-wrap items-end gap-4" @submit.prevent="generatePayrolls">
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Month
            <select v-model="month" class="rounded-lg border border-slate-300 bg-white px-3 py-2.5">
              <option v-for="number in 12" :key="number" :value="number">{{ number }}</option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Year
            <input v-model="year" type="number" min="2000" max="2200" required class="w-32 rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <button type="submit" :disabled="submitting" class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {{ submitting ? 'Generating...' : 'Generate' }}
          </button>
        </form>
      </div>

      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Loading payrolls...</div>
        <div v-else-if="payrolls.length === 0" class="p-8 text-center text-sm text-slate-500">No payroll records yet.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[1000px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">Employee</th><th class="px-4 py-3">Month / Year</th>
                <th class="px-4 py-3">Base salary</th><th class="px-4 py-3">Bonus</th>
                <th class="px-4 py-3">Deduction</th><th class="px-4 py-3">Tax</th>
                <th class="px-4 py-3">Net salary</th><th class="px-4 py-3">Status</th><th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="payroll in payrolls" :key="payroll.id" class="text-slate-700">
                <td class="px-4 py-3 font-medium text-slate-900">{{ payroll.employee?.name || '—' }}</td>
                <td class="px-4 py-3">{{ payroll.month }} / {{ payroll.year }}</td>
                <td class="px-4 py-3">{{ payroll.base_salary }}</td><td class="px-4 py-3">{{ payroll.bonus }}</td>
                <td class="px-4 py-3">{{ payroll.deduction }}</td><td class="px-4 py-3">{{ payroll.tax }}</td>
                <td class="px-4 py-3 font-medium">{{ payroll.net_salary }}</td>
                <td class="px-4 py-3"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{{ payroll.status }}</span></td>
                <td class="px-4 py-3">
                  <button v-if="payroll.status === 'draft'" type="button" :disabled="payingId === payroll.id" @click="payPayroll(payroll.id)"
                    class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
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
