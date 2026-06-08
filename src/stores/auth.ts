import { ref } from 'vue'

export const currentUser = ref<{
  name: string
  role: 'user' | 'admin' | null
  department: string
}>({
  name: '',
  role: null,
  department: '',
})

export function login(role: 'user' | 'admin', name: string, department: string) {
  currentUser.value = { name, role, department }
}

export function logout() {
  currentUser.value = { name: '', role: null, department: '' }
}