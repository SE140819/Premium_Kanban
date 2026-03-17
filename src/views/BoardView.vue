<template>
  <div class="board-view">
    <div
      v-if="store.isLoading"
      class="loading-overlay"
    >
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Loading tasks...</span>
    </div>
    <div
      v-if="store.error"
      class="error-banner"
    >
      {{ store.error }}
      <el-button
        size="small"
        @click="store.fetchTasks"
        >Retry</el-button
      >
    </div>
    <div class="header-bar">
      <div class="header-left">
        <span class="logo-text">Premium Kanban</span>
      </div>
      <div class="header-right">
        <el-button
          class="theme-toggle"
          circle
          @click="$emit('toggle-theme', $event)"
          :icon="currentTheme === 'dark' ? 'Sunny' : 'Moon'"
        />
      </div>
    </div>
    <div class="board-container">
      <div class="groups-header">
        <div
          v-for="group in store.groups"
          :key="group.id"
          class="group-header-item"
          :style="{ gridColumn: `span ${group.columns.length}` }"
        >
          {{ group.title }}
        </div>
      </div>

      <div class="columns-container">
        <template
          v-for="group in store.groups"
          :key="'group-cols-' + group.id"
        >
          <BoardColumn
            v-for="column in group.columns"
            :key="column.id"
            :column="column"
            @add-task="openAddTaskModal"
            @edit-task="openEditTaskModal"
            @move-task="handleMoveTask"
          />
        </template>
      </div>
    </div>

    <TaskModal
      :is-open="isModalOpen"
      :task="selectedTask"
      @close="closeModal"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
    />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useTaskStore } from '../stores/taskStore'
  import BoardColumn from '../components/BoardColumn.vue'
  import TaskModal from '../components/TaskModal.vue'

  const props = defineProps({
    currentTheme: String
  })

  const store = useTaskStore()

  onMounted(() => {
    store.fetchTasks()
  })

  const isModalOpen = ref(false)
  const selectedTask = ref(null)
  const activeColumnId = ref(null)

  const openAddTaskModal = columnId => {
    activeColumnId.value = columnId
    selectedTask.value = null
    isModalOpen.value = true
  }

  const openEditTaskModal = ({ columnId, task }) => {
    activeColumnId.value = columnId
    selectedTask.value = { ...task }
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedTask.value = null
    activeColumnId.value = null
  }

  const handleSaveTask = async taskData => {
    if (selectedTask.value) {
      const id = selectedTask.value._id || selectedTask.value.id
      const updatedTask = { ...selectedTask.value, ...taskData }
      await store.updateTask(id, updatedTask)
    } else {
      await store.addTask(activeColumnId.value, taskData)
    }
    closeModal()
  }

  const handleDeleteTask = async () => {
    if (selectedTask.value) {
      const id = selectedTask.value._id || selectedTask.value.id
      await store.deleteTask(id)
    }
    closeModal()
  }

  const handleMoveTask = async ({ fromColId, toColId, taskId, newIndex }) => {
    await store.moveTask(fromColId, toColId, taskId, newIndex)
  }
</script>

<style scoped>
  .board-view {
    min-height: 100vh;
    padding: 0;
    background: #f4f5f7;
    overflow-x: auto;
  }

  :root[data-theme='dark'] .board-view {
    background: #0f172a;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    gap: 12px;
    color: #5e6c84;
  }

  :root[data-theme='dark'] .loading-overlay {
    background: rgba(15, 23, 42, 0.8);
    color: #e2e8f0;
  }

  .error-banner {
    background: #fee2e2;
    color: #b91c1c;
    padding: 8px 24px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    font-size: 14px;
  }

  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 24px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  :root[data-theme='dark'] .header-bar {
    background: #1e293b;
    border-color: #334155;
  }

  .logo-text {
    font-weight: 800;
    font-size: 14px;
    color: #5e6c84;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  :root[data-theme='dark'] .logo-text {
    color: #e2e8f0;
  }

  .theme-toggle {
    background: transparent !important;
    border: none !important;
    font-size: 18px !important;
    color: #5e6c84 !important;
  }

  :root[data-theme='dark'] .theme-toggle {
    color: #e2e8f0 !important;
  }

  .board-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    border-left: 1px solid #e0e0e0;
  }

  :root[data-theme='dark'] .board-container {
    border-color: #334155;
  }

  .groups-header {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    min-width: 1200px;
  }

  .group-header-item {
    padding: 12px;
    text-align: center;
    font-weight: 700;
    color: #5e6c84;
    font-size: 16px;
    border: 1px solid #e0e0e0;
    border-left: none;
    background: #fff;
  }

  :root[data-theme='dark'] .group-header-item {
    background: #1e293b;
    color: #e2e8f0;
    border-color: #334155;
  }

  .columns-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    min-width: 1200px;
  }
</style>
