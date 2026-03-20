import { defineStore } from 'pinia'
import { ref } from 'vue'
import api, { type Task } from '../api'
import { notify } from '../utils/notification'

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
      const { data: allTasks } = await api.get('/tasks')
      groups.value.forEach(group => {
        group.columns.forEach(col => {
          col.tasks = []
        })
      })
      if (allTasks && Array.isArray(allTasks)) {
        allTasks.forEach((task: Task) => {
          const column = findColumn(task.columnId)
          if (column) {
            column.tasks.push(task)
          }
        })
      }
    } catch (err) {
      error.value = 'Failed to fetch tasks'
      notify.error('Could not load tasks from the server.')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const addTask = async (columnId: string, taskData: Partial<Task>): Promise<void> => {
    try {
      const newTask = {
        ...taskData,
        columnId,
        createdAt: new Date().toISOString()
      }
      const { data } = await api.post('/tasks', newTask)
      const column = findColumn(columnId)
      if (column && data) {
        column.tasks.push(data as Task)
      }
      notify.success(`Task "${data.title}" added successfully.`)
    } catch (err) {
      notify.error('Failed to add new task.')
      console.error('Failed to add task:', err)
    }
  }

  const updateTask = async (taskId: string | number, updateData: Partial<Task>): Promise<void> => {
    try {
      const { _id, ...data } = updateData
      await api.put(`/tasks/${taskId}`, data)
      for (const group of groups.value) {
        for (const col of group.columns) {
          const idx = col.tasks.findIndex(t => (t._id || t.id) === taskId)
          if (idx !== -1) {
            col.tasks[idx] = { ...col.tasks[idx], ...updateData } as Task
            notify.success('Task updated successfully.')
            return
          }
        }
      }
    } catch (err) {
      notify.error('Failed to update task.')
      console.error('Failed to update task:', err)
      await fetchTasks()
    }
  }

  const deleteTask = async (taskId: string | number): Promise<void> => {
    try {
      await api.delete(`/tasks/${taskId}`)
      for (const group of groups.value) {
        for (const col of group.columns) {
          const idx = col.tasks.findIndex(t => (t._id || t.id) === taskId)
          if (idx !== -1) {
            col.tasks.splice(idx, 1)
            notify.success('Task deleted successfully.')
            return
          }
        }   
      }
    } catch (err) {
      notify.error('Failed to delete task.')
      console.error('Failed to delete task:', err)
    }
  }

  const moveTask = async (fromColId: string, toColId: string, taskId: string | number, newIndex: number): Promise<void> => {
    const fromCol = findColumn(fromColId)
    const toCol = findColumn(toColId)
    if (!fromCol || !toCol) return

    const targetId = String(taskId)
    const taskIndex = fromCol.tasks.findIndex(t => String(t._id || t.id) === targetId)

    if (taskIndex === -1) {
      console.warn(`Task ${targetId} not found in column ${fromColId}`)
      return
    }

    const spliced = fromCol.tasks.splice(taskIndex, 1)
    const task = spliced[0]
    if (!task) return
    task.columnId = toColId
    toCol.tasks.splice(newIndex, 0, task)

    try {
      const id = task._id || task.id
      const { _id, ...updateData } = task as Task & { _id?: string }
      if(id) {
         await api.put(`/tasks/${id}`, updateData)
         notify.success(`Moved to ${toCol.title}`)
      }
    } catch (err) {
      notify.error('Failed to save task position.')
      console.error('Failed to move task:', err)
      await fetchTasks()
    }
  }

  const toggleColumnVisibility = (columnId: string): void => {
    const index = hiddenColumns.value.indexOf(columnId)
    if (index === -1) {
      hiddenColumns.value.push(columnId)
    } else {
      hiddenColumns.value.splice(index, 1)
    }
    localStorage.setItem('hiddenColumns', JSON.stringify(hiddenColumns.value))
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
    toggleColumnVisibility
  }
})
