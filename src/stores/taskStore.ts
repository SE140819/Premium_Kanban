import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskService } from '@/services/taskService'
import type { Task } from '@/types/task'
import { notify } from '@/utils/notification'
import { broadcast, onSync, type SyncEvent } from '@/services/syncService'

export interface Column {
  id: string
  title: string
  archivedCount?: number
  wipLimit?: number | null
  tasks: Task[]
}

export interface Group {
  id: string
  title: string
  columns: Column[]
}

export const useTaskStore = defineStore('task', () => {
  const groups = ref<Group[]>([
    {
      id: 'group-todo',
      title: 'To do',
      columns: [
        {
          id: 'backlog',
          title: 'Backlog',
          archivedCount: 0,
          wipLimit: null,
          tasks: []
        },
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
  ])

  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const hiddenColumns = ref<string[]>(JSON.parse(localStorage.getItem('hiddenColumns') || '[]'))

  const findColumn = (colId: string): Column | null => {
    for (const group of groups.value) {
      const col = group.columns.find((c: Column) => c.id === colId)
      if (col) return col
    }
    return null
  }

  const fetchTasks = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const allTasks = await taskService.getAllTasks()
      groups.value = groups.value.map(group => ({
        ...group,
        columns: group.columns.map(col => ({
          ...col,
          tasks: allTasks.filter(t => t.columnId === col.id)
        }))
      }))
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks'
      notify.error(error.value || 'Failed to fetch tasks')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const addTask = async (columnId: string, taskData: Partial<Task>): Promise<void> => {
    try {
      const input = { ...taskData, columnId } as any
      const data = await taskService.createNewTask(input)
      
      groups.value = groups.value.map(group => ({
        ...group,
        columns: group.columns.map(col => 
          col.id === columnId 
            ? { ...col, tasks: [...col.tasks, data] }
            : col
        )
      }))

      notify.success(`Task "${data.title}" added successfully.`)
      broadcast('TASK_ADDED', { columnId, task: data })
    } catch (err: any) {
      notify.error(err.message || 'Failed to add new task.')
      console.error('Failed to add task:', err)
    }
  }

  const updateTask = async (taskId: string | number, updateData: Partial<Task>): Promise<void> => {
    try {
      const updatedTask = await taskService.updateExistingTask(String(taskId), updateData)
      
      groups.value = groups.value.map(group => ({
        ...group,
        columns: group.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(t => (String(t.id || t._id) === String(taskId)) ? updatedTask : t)
        }))
      }))

      notify.success('Task updated successfully.')
      broadcast('TASK_UPDATED', { taskId, updateData })
    } catch (err: any) {
      notify.error(err.message || 'Failed to update task.')
      console.error('Failed to update task:', err)
      await fetchTasks()
    }
  }

  const deleteTask = async (taskId: string | number): Promise<void> => {
    try {
      await taskService.deleteExistingTask(String(taskId))
      
      groups.value = groups.value.map(group => ({
        ...group,
        columns: group.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(t => String(t.id || t._id) !== String(taskId))
        }))
      }))

      notify.success('Task deleted successfully.')
      broadcast('TASK_DELETED', { taskId })
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete task.')
      console.error('Failed to delete task:', err)
    }
  }

  const moveTask = async (fromColId: string, toColId: string, taskId: string | number, newIndex: number): Promise<void> => {
    const fromCol = findColumn(fromColId)
    const toCol = findColumn(toColId)
    if (!fromCol || !toCol) return

    const targetId = String(taskId)
    const task = fromCol.tasks.find(t => String(t.id || t._id) === targetId)

    if (!task) {
      console.warn(`Task ${targetId} not found in column ${fromColId}`)
      return
    }

    // Local optimistic update (immutable)
    const updatedTask = { ...task, columnId: toColId }

    groups.value = groups.value.map(group => ({
      ...group,
      columns: group.columns.map(col => {
        const isFrom = col.id === fromColId
        const isTo = col.id === toColId
        
        if (isFrom && isTo) {
          const otherTasks = col.tasks.filter(t => String(t.id || t._id) !== targetId)
          const newTasks = [...otherTasks]
          newTasks.splice(newIndex, 0, updatedTask)
          return { ...col, tasks: newTasks }
        }
        
        if (isFrom) return { ...col, tasks: col.tasks.filter(t => String(t.id || t._id) !== targetId) }
        
        if (isTo) {
          const newTasks = [...col.tasks]
          newTasks.splice(newIndex, 0, updatedTask)
          return { ...col, tasks: newTasks }
        }
        
        return col
      })
    }))

    try {
      await taskService.updateExistingTask(targetId, { columnId: toColId })
      notify.success(`Moved to ${toCol.title}`)
      broadcast('TASK_MOVED', { fromColId, toColId, taskId: targetId, newIndex })
    } catch (err: any) {
      notify.error(err.message || 'Failed to save task position.')
      console.error('Failed to move task:', err)
      await fetchTasks()
    }
  }

  const toggleColumnVisibility = (columnId: string): void => {
    const index = hiddenColumns.value.indexOf(columnId)
    const newHidden = [...hiddenColumns.value]
    if (index === -1) {
      newHidden.push(columnId)
    } else {
      newHidden.splice(index, 1)
    }
    hiddenColumns.value = newHidden
    localStorage.setItem('hiddenColumns', JSON.stringify(newHidden))
  }

  const applyRemoteEvent = (event: SyncEvent): void => {
    const p = event.payload
    if (!p) return
    
    if (event.type === 'TASK_ADDED') {
      const taskInCol = findColumn(p.columnId)?.tasks.find(t => String(t.id || t._id) === String(p.task.id || p.task._id))
      if (!taskInCol) {
        groups.value = groups.value.map(group => ({
          ...group,
          columns: group.columns.map(col => 
            col.id === p.columnId ? { ...col, tasks: [...col.tasks, p.task] } : col
          )
        }))
      }
    } else if (event.type === 'TASK_UPDATED') {
      groups.value = groups.value.map(group => ({
        ...group,
        columns: group.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(t => (String(t.id || t._id) === String(p.taskId)) ? { ...t, ...p.updateData } : t)
        }))
      }))
    } else if (event.type === 'TASK_DELETED') {
      groups.value = groups.value.map(group => ({
        ...group,
        columns: group.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(t => String(t.id || t._id) !== String(p.taskId))
        }))
      }))
    } else if (event.type === 'TASK_MOVED') {
      fetchTasks()
    }
  }

  const setupSync = (): (() => void) => {
    return onSync(applyRemoteEvent)
  }

  return {
    groups,
    isLoading,
    error,
    hiddenColumns,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleColumnVisibility,
    setupSync
  }
})
