<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const departments = ref([])
const loading = ref(true)
const saving = ref(false)
const deletingId = ref(null)
const editingDepartment = ref(null)
const name = ref('')
const description = ref('')
const error = ref('')

function errorText(err) {
  if (err.errors) return Object.values(err.errors).flat().join(' ')
  return err.message || 'Amal ýerine ýetirilmedi. Täzeden synanyşyň.'
}

async function loadDepartments() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/admin/departments')
    departments.value = data.data || []
  } catch (err) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

function startEdit(department) {
  editingDepartment.value = department
  name.value = department.name
  description.value = department.description || ''
  error.value = ''
}

function resetForm() {
  editingDepartment.value = null
  name.value = ''
  description.value = ''
}

async function saveDepartment() {
  saving.value = true
  error.value = ''
  const body = JSON.stringify({ name: name.value, description: description.value })

  try {
    if (editingDepartment.value) {
      await api(`/admin/departments/${editingDepartment.value.id}`, { method: 'PATCH', body })
    } else {
      await api('/admin/departments', { method: 'POST', body })
    }
    resetForm()
    await loadDepartments()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    saving.value = false
  }
}

async function deleteDepartment(department) {
  if (!window.confirm(`Delete department "${department.name}"?`)) return

  deletingId.value = department.id
  error.value = ''
  try {
    await api(`/admin/departments/${department.id}`, { method: 'DELETE' })
    await loadDepartments()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    deletingId.value = null
  }
}

onMounted(loadDepartments)
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold text-slate-900">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Departments</span>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">{{ editingDepartment ? 'Redaktirle' : 'Täze bölüm' }}</h1>
        <form class="mt-5 grid gap-4" @submit.prevent="saveDepartment">
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Ady
            <input v-model="name" type="text" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Düşündiriş
            <textarea v-model="description" rows="3" class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <div class="flex gap-3">
            <button type="submit" :disabled="saving" class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {{ saving ? 'Saklanyar...' : editingDepartment ? 'Üýtgetmäni sakla' : 'Bölüm döret' }}
            </button>
            <button v-if="editingDepartment" type="button" @click="resetForm" class="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">Ýatyr</button>
          </div>
        </form>
      </div>

      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Ýüklenýär...</div>
        <div v-else-if="departments.length === 0" class="p-8 text-center text-sm text-slate-500">Bölüm ýok.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[650px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th class="px-5 py-3">Ady</th><th class="px-5 py-3">Düşündiriş</th><th class="px-5 py-3">Işgär sany</th><th class="px-5 py-3"></th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="department in departments" :key="department.id" class="text-slate-700">
                <td class="px-5 py-4 font-medium text-slate-900">{{ department.name }}</td>
                <td class="px-5 py-4">{{ department.description || '—' }}</td>
                <td class="px-5 py-4">{{ department.employees_count ?? 0 }}</td>
                <td class="px-5 py-4">
                  <div class="flex gap-2">
                    <button type="button" @click="startEdit(department)" class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Redaktirle</button>
                    <button type="button" :disabled="deletingId === department.id" @click="deleteDepartment(department)" class="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                      {{ deletingId === department.id ? 'Pozulýar...' : 'Poz' }}
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
