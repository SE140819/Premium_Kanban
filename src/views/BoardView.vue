<template>
  <div class="board-view">
    <div
      v-if="store.isLoading"
      class="loading-overlay"
    >
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Loading tasks...</span>
    </div>

    <!-- Top Navigation / Breadcrumbs -->
    <header class="view-header">
      <div class="breadcrumb">
        <el-icon
          class="mobile-menu-btn"
          @click="$emit('toggle-sidebar')"
        >
          <Menu />
        </el-icon>
        <el-icon class="brand-icon"><Platform /></el-icon>
        <span class="breadcrumb-item hidden-mobile">Fastboy</span>
        <span class="separator hidden-mobile">/</span>
        <span class="breadcrumb-item active">Todo app</span>
      </div>
      <div class="header-actions">
        <el-dropdown trigger="click" :hide-on-click="false">
          <span class="icon-btn view-btn">
            <el-icon><View /></el-icon>
            <span class="hidden-mobile">View</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu class="view-settings-dropdown">
              <div class="dropdown-header">Columns</div>
              <el-dropdown-item
                v-for="column in allColumns"
                :key="'toggle-'+column.id"
              >
                <el-checkbox
                  :model-value="!store.hiddenColumns.includes(column.id)"
                  @change="store.toggleColumnVisibility(column.id)"
                >
                  {{ column.title }}
                </el-checkbox>
              </el-dropdown-item>
              <div v-if="store.hiddenColumns.length > 0" class="dropdown-divider"></div>
              <el-dropdown-item
                v-if="store.hiddenColumns.length > 0"
                @click="resetColumns"
                class="reset-btn"
              >
                Show all columns
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button
          class="theme-toggle"
          circle
          @click="$emit('toggle-theme', $event)"
          :icon="currentTheme === 'dark' ? 'Sunny' : 'Moon'"
        />
        <el-icon class="icon-btn" @click="comingSoon"><Share /></el-icon>
        <el-icon class="icon-btn" @click="comingSoon"><MoreFilled /></el-icon>
        <LiveIndicator />
      </div>
    </header>


    <div class="board-scroller">
      <div class="board-container">
        <div class="columns-container">
          <template
            v-for="group in store.groups"
            :key="'group-cols-' + group.id"
          >
            <BoardColumn
              v-for="column in group.columns.filter(c => !store.hiddenColumns.includes(c.id))"
              :key="column.id"
              :column="column"
              @add-task="openAddTaskModal"
              @edit-task="openEditTaskModal"
              @move-task="handleMoveTask"
            />
          </template>
        </div>
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

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useTaskStore } from '@/stores/taskStore'
  import type { Task, TaskCreateInput } from '@/types/task'
  import { Platform, Share, MoreFilled, Close, ArrowRight, Menu, View } from '@element-plus/icons-vue'
  import { notify } from '@/utils/notification'
  import BoardColumn from '@/components/BoardColumn.vue'
  import TaskModal from '@/components/TaskModal.vue'
  import LiveIndicator from '@/components/LiveIndicator.vue'

  const props = defineProps({
    currentTheme: String
  })

  const store = useTaskStore()

  const allColumns = computed(() => {
    return store.groups.flatMap(g => g.columns)
  })

  const resetColumns = () => {
    store.hiddenColumns = []
    localStorage.setItem('hiddenColumns', JSON.stringify([]))
  }

  const comingSoon = () => {
    notify.info('This feature is coming soon!')
  }

  onMounted(() => {
    store.fetchTasks()
    store.setupSync()
  })

  const isModalOpen = ref<boolean>(false)
  const selectedTask = ref<Task | null>(null)
  const activeColumnId = ref<string | null>(null)

  const openAddTaskModal = (columnId: string) => {
    activeColumnId.value = columnId
    selectedTask.value = null
    isModalOpen.value = true
  }

  const openEditTaskModal = ({ columnId, task }: { columnId: string; task: Task }) => {
    activeColumnId.value = columnId
    selectedTask.value = { ...task }
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedTask.value = null
    activeColumnId.value = null
  }

  const handleSaveTask = async (taskData: Omit<TaskCreateInput, 'columnId'>) => {
    if (selectedTask.value) {
      const id = selectedTask.value._id || selectedTask.value.id
      const updatedTask = { ...selectedTask.value, ...taskData }
      await store.updateTask(id, updatedTask)
    } else {
      await store.addTask(activeColumnId.value!, taskData)
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

  const handleMoveTask = async ({ fromColId, toColId, taskId, newIndex }: { fromColId: string; toColId: string; taskId: string; newIndex: number }) => {
    await store.moveTask(fromColId, toColId, taskId, newIndex)
  }
</script>

<style scoped>
  .board-view {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    gap: 12px;
    color: #fff;
  }

  /* Header / Breadcrumbs */
  .view-header {
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .breadcrumb .el-icon {
    font-size: 14px;
    color: #f59e0b; /* Orange-ish icon like in sample */
  }

  .breadcrumb-item.active {
    color: var(--text-primary);
    font-weight: 500;
  }

  .separator {
    opacity: 0.3;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--text-secondary);
  }

  .icon-btn {
    cursor: pointer;
    font-size: 16px;
  }

  .icon-btn:hover {
    color: var(--text-primary);
  }

  .view-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.03);
  }

  .view-btn:hover {
    background: var(--hover-bg);
  }

  .view-settings-dropdown {
    min-width: 180px;
    padding: 8px 0;
    background-color: var(--bg-secondary) !important;
    border: 1px solid var(--border-color) !important;
  }

  .dropdown-header {
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .dropdown-divider {
    height: 1px;
    background-color: var(--border-color);
    margin: 8px 0;
  }

  .reset-btn {
    color: var(--accent-blue) !important;
    font-size: 12px !important;
  }

  .theme-toggle {
    background: transparent !important;
    border: none !important;
    padding: 4px !important;
    color: var(--text-secondary) !important;
  }

  .theme-toggle:hover {
    color: var(--text-primary) !important;
  }


  /* Filter Bar */
  .filter-bar {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    font-size: 12px;
    color: var(--text-primary);
  }

  .avatar-mini, .avatar-user {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4f46e5;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .filter-val {
    color: var(--text-secondary);
    font-style: italic;
  }

  .close-icon {
    font-size: 12px;
    cursor: pointer;
    opacity: 0.6;
  }

  .filter-add {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 18px;
  }

  .filter-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .clear-btn {
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .save-btn {
    background-color: var(--accent-blue) !important;
    border: none !important;
    border-radius: 6px !important;
  }

  /* Board Area */
  .board-scroller {
    flex: 1;
    overflow-x: auto;
    background-color: var(--bg-primary);
  }

  .board-container {
    min-width: fit-content;
    height: 100%;
    padding: 20px;
  }

  .columns-container {
    display: flex;
    gap: 16px;
    height: 100%;
  }

  .mobile-menu-btn {
    display: none;
    cursor: pointer;
    font-size: 20px;
    margin-right: 8px;
    color: var(--text-primary);
  }

  .brand-icon {
    color: #f59e0b;
  }

  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: flex;
    }

    .hidden-mobile {
      display: none;
    }

    .view-header {
      padding: 10px 16px;
    }

    .board-container {
      padding: 12px;
    }

    .columns-container {
      gap: 12px;
    }

    .board-scroller {
      -webkit-overflow-scrolling: touch;
    }
  }

  .column-placeholder {
    width: 240px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    height: fit-content;
  }

  .column-placeholder:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }
</style>
