import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskService } from '@/services/taskService'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'
import type { Column, Group } from '@/types/board'
import { notify } from '@/utils/notification'
import { syncService } from '@/services/syncService'
import type { SyncEvent } from '@/types/sync'

const INITIAL_GROUPS: Group[] = [
  {
    id: 'group-todo',
    title: 'To do',
    columns: [
      { id: 'backlog', title: 'Backlog', archivedCount: 0, wipLimit: null, tasks: [] },
      { id: 'waiting', title: 'Waiting', archivedCount: 0, wipLimit: null, tasks: [] },
      { id: 'ready', title: 'Ready', archivedCount: 9, wipLimit: null, tasks: [] }
    ]
  },
  {
    id: 'group-progress',
    title: 'In progress',
    columns: [{ id: 'in-progress', title: 'In progress', wipLimit: 3, tasks: [] }]
  },
  {
    id: 'group-done',
    title: 'Done',
    columns: [{ id: 'done', title: 'Done', archivedCount: 2, tasks: [] }]
  }
]

export const useTaskStore = defineStore('task', () => {
  const groups = ref<Group[]>(INITIAL_GROUPS)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const hiddenColumns = ref<string[]>(JSON.parse(localStorage.getItem('hiddenColumns') || '[]'))
  
  const updateColumns = (callback: (col: Column) => Column) => {
    groups.value = groups.value.map(g => ({
      ...g,
      columns: g.columns.map(callback)
    }))
  }

  const findColumn = (colId: string): Column | null => {
    for (const group of groups.value) {
      const col = group.columns.find((c: Column) => c.id === colId)
      if (col) return col
    }
    return null
  }

  const getTaskId = (t: Task) => String(t.id || t._id)

  const fetchTasks = async (): Promise<void> => {
    isLoading.value = true
    try {
      const allTasks = await taskService.getAllTasks()
      updateColumns(col => ({
        ...col,
        tasks: allTasks.filter(t => t.columnId === col.id)
      }))
    } catch (err: any) {
      error.value = err.message
      notify.error(error.value || 'Failed to fetch tasks')
    } finally {
      isLoading.value = false
    }
  }

  const addTask = async (columnId: string, taskData: Omit<TaskCreateInput, 'columnId'>): Promise<void> => {
    try {
      const data = await taskService.createNewTask({ ...taskData, columnId } as TaskCreateInput)
      updateColumns(col => col.id === columnId ? { ...col, tasks: [...col.tasks, data] } : col)
      notify.success(`Task "${data.title}" added.`)
      syncService.broadcast('TASK_ADDED', { columnId, task: data })
    } catch (err: any) {
      notify.error(err.message || 'Failed to add task.')
    }
  }

  const updateTask = async (taskId: string | number, updateData: TaskUpdateInput): Promise<void> => {
    const targetId = String(taskId)
    try {
      const data = await taskService.updateExistingTask(targetId, updateData)
      updateColumns(col => ({
        ...col,
        tasks: col.tasks.map(t => getTaskId(t) === targetId ? data : t)
      }))
      notify.success('Task updated.')
      syncService.broadcast('TASK_UPDATED', { taskId: targetId, updateData })
    } catch (err: any) {
      notify.error(err.message || 'Update failed.')
      await fetchTasks()
    }
  }

  const deleteTask = async (taskId: string | number): Promise<void> => {
    const targetId = String(taskId)
    try {
      await taskService.deleteExistingTask(targetId)
      updateColumns(col => ({
        ...col,
        tasks: col.tasks.filter(t => getTaskId(t) !== targetId)
      }))
      notify.success('Task deleted.')
      syncService.broadcast('TASK_DELETED', { taskId: targetId })
    } catch (err: any) {
      notify.error(err.message || 'Delete failed.')
    }
  }

  const moveTask = async (fromColId: string, toColId: string, taskId: string | number, newIndex: number): Promise<void> => {
    const targetId = String(taskId)
    const task = findColumn(fromColId)?.tasks.find(t => getTaskId(t) === targetId)
    if (!task) return

    const updatedTask = { ...task, columnId: toColId }
    
    updateColumns(col => {
      const isFrom = col.id === fromColId
      const isTo = col.id === toColId
      
      if (isFrom && isTo) {
        const others = col.tasks.filter(t => getTaskId(t) !== targetId)
        others.splice(newIndex, 0, updatedTask)
        return { ...col, tasks: others }
      }
      if (isFrom) return { ...col, tasks: col.tasks.filter(t => getTaskId(t) !== targetId) }
      if (isTo) {
        const nextTasks = [...col.tasks]
        nextTasks.splice(newIndex, 0, updatedTask)
        return { ...col, tasks: nextTasks }
      }
      return col
    })

    try {
      await taskService.updateExistingTask(targetId, { columnId: toColId })
      syncService.broadcast('TASK_MOVED', { fromColId, toColId, taskId: targetId, newIndex })
    } catch (err: any) {
      notify.error('Move failed.')
      await fetchTasks()
    }
  }

  const toggleColumnVisibility = (columnId: string): void => {
    const newHidden = hiddenColumns.value.includes(columnId)
      ? hiddenColumns.value.filter(id => id !== columnId)
      : [...hiddenColumns.value, columnId]
    hiddenColumns.value = newHidden
    localStorage.setItem('hiddenColumns', JSON.stringify(newHidden))
  }

  const applyRemoteEvent = (event: SyncEvent): void => {
    const p = event.payload
    if (!p) return
    
    switch (event.type) {
      case 'TASK_ADDED':
        if (!findColumn(p.columnId)?.tasks.some(t => getTaskId(t) === getTaskId(p.task))) {
          updateColumns(col => col.id === p.columnId ? { ...col, tasks: [...col.tasks, p.task] } : col)
        }
        break
      case 'TASK_UPDATED':
        updateColumns(col => ({
          ...col,
          tasks: col.tasks.map(t => getTaskId(t) === String(p.taskId) ? { ...t, ...p.updateData } : t)
        }))
        break
      case 'TASK_DELETED':
        updateColumns(col => ({
          ...col,
          tasks: col.tasks.filter(t => getTaskId(t) !== String(p.taskId))
        }))
        break
      case 'TASK_MOVED':
        fetchTasks()
        break
    }
  }

  return {
    groups, isLoading, error, hiddenColumns,
    fetchTasks, addTask, updateTask, deleteTask, moveTask,
    toggleColumnVisibility, setupSync: () => syncService.onSync(applyRemoteEvent)
  }
})
