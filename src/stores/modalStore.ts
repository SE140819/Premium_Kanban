import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/types/task'

export const useModalStore = defineStore('modal', () => {
  const isTaskModalOpen = ref(false)
  const selectedTask = ref<Task | null>(null)
  const activeColumnId = ref<string | null>(null)

  const openAddTaskModal = (columnId: string) => {
    activeColumnId.value = columnId
    selectedTask.value = null
    isTaskModalOpen.value = true
  }

  const openEditTaskModal = (columnId: string, task: Task) => {
    activeColumnId.value = columnId
    selectedTask.value = { ...task }
    isTaskModalOpen.value = true
  }

  const closeModal = () => {
    isTaskModalOpen.value = false
    selectedTask.value = null
    activeColumnId.value = null
  }

  return {
    isTaskModalOpen,
    selectedTask,
    activeColumnId,
    openAddTaskModal,
    openEditTaskModal,
    closeModal
  }
})
