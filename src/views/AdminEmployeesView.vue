<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const employees = ref([])
const departments = ref([])
const loading = ref(true)
const saving = ref(false)
const deletingId = ref(null)
const editingEmployee = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const departmentId = ref('')
const position = ref('')
const baseSalary = ref('')
const hiredAt = ref('')
const error = ref('')

function errorText(err) {
  if (err.errors) return Object.values(err.errors).flat().join(' ')
  return err.message || 'Amal ýerine ýetirilmedi. Täzeden synanyşyň.'
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [employeeData, departmentData] = await Promise.all([
      api('/admin/employees'),
      api('/admin/departments'),
    ])
    employees.value = employeeData.data || []
    departments.value = departmentData.data || []
  } catch (err) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

function startEdit(employee) {
  editingEmployee.value = employee
  name.value = employee.user?.name || employee.name || ''
  email.value = employee.user?.email || employee.email || ''
  password.value = ''
  departmentId.value = employee.department?.id || employee.department_id || ''
  position.value = employee.position || ''
  baseSalary.value = Number(employee.base_salary)
  hiredAt.value = employee.hired_at || ''
  error.value = ''
}

function resetForm() {
  editingEmployee.value = null
  name.value = ''
  email.value = ''
  password.value = ''
  departmentId.value = ''
  position.value = ''
  baseSalary.value = ''
  hiredAt.value = ''
}

async function saveEmployee() {
  saving.value = true
  error.value = ''
  const body = {
    name: name.value,
    email: email.value,
    department_id: Number(departmentId.value),
    position: position.value,
    base_salary: Number(baseSalary.value),
    hired_at: hiredAt.value,
  }
  if (!editingEmployee.value || password.value) body.password = password.value

  try {
    if (editingEmployee.value) {
      await api(`/admin/employees/${editingEmployee.value.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    } else {
      await api('/admin/employees', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    }
    resetForm()
    await loadData()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    saving.value = false
  }
}

async function deleteEmployee(employee) {
  const employeeName = employee.user?.name || employee.name || employee.user?.email || ''
  if (!window.confirm(`Delete employee "${employeeName}"?`)) return

  deletingId.value = employee.id
  error.value = ''
  try {
    await api(`/admin/employees/${employee.id}`, { method: 'DELETE' })
    await loadData()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    deletingId.value = null
  }
}

onMounted(loadData)
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold text-slate-900">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Employees</span>
      </div>
    </header>

    <section class="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">{{ editingEmployee ? 'Redaktirle' : 'Täze işgär' }}</h1>
        <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveEmployee">
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">Ady
            <input v-model="name" type="text" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">Email
            <input v-model="email" type="email" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">{{ editingEmployee ? 'Täze parol (islege görä)' : 'Parol' }}
            <input v-model="password" type="password" :required="!editingEmployee" minlength="8" autocomplete="new-password" class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">Bölüm
            <select v-model="departmentId" required class="rounded-lg border border-slate-300 bg-white px-3 py-2.5">
              <option value="" disabled>Bölümi saýlaň</option>
              <option v-for="department in departments" :key="department.id" :value="department.id">{{ department.name }}</option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">Wezipesi
            <input v-model="position" type="text" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">Esasy aýlyk
            <input v-model.number="baseSalary" type="number" min="0" step="0.01" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">Işe başlan senesi
            <input v-model="hiredAt" type="date" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <div class="flex items-end gap-3">
            <button type="submit" :disabled="saving || departments.length === 0" class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {{ saving ? 'Saklanyar...' : editingEmployee ? 'Üýtgetmäni sakla' : 'Işgär döret' }}
            </button>
            <button v-if="editingEmployee" type="button" @click="resetForm" class="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">Ýatyr</button>
          </div>
        </form>
      </div>

      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Ýüklenýär...</div>
        <div v-else-if="employees.length === 0" class="p-8 text-center text-sm text-slate-500">Işgär ýok.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[1000px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th class="px-4 py-3">Ady</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Bölüm</th><th class="px-4 py-3">Wezipesi</th><th class="px-4 py-3">Esasy aýlyk</th><th class="px-4 py-3">Işe başlady</th><th class="px-4 py-3"></th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="employee in employees" :key="employee.id" class="text-slate-700">
                <td class="px-4 py-4 font-medium text-slate-900">{{ employee.user?.name || employee.name || '—' }}</td>
                <td class="px-4 py-4">{{ employee.user?.email || employee.email || '—' }}</td>
                <td class="px-4 py-4">{{ employee.department?.name || '—' }}</td>
                <td class="px-4 py-4">{{ employee.position }}</td>
                <td class="px-4 py-4">{{ employee.base_salary }}</td>
                <td class="px-4 py-4">{{ employee.hired_at }}</td>
                <td class="px-4 py-4">
                  <div class="flex gap-2">
                    <button type="button" @click="startEdit(employee)" class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Redaktirle</button>
                    <button type="button" :disabled="deletingId === employee.id" @click="deleteEmployee(employee)" class="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                      {{ deletingId === employee.id ? 'Pozulýar...' : 'Poz' }}
                    </button>
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
