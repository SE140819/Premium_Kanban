<template>
  <div
    class="board-column"
  >
    <div class="column-header">
      <div class="header-left">
        <div
          class="status-circle"
          :class="column.id"
        ></div>
        <h2 class="column-title">{{ column.title }}</h2>
        <el-icon class="priority-warn"><Warning /></el-icon>
        <span class="task-count">
          {{ column.tasks.length }}<span v-if="column.wipLimit"> / {{ column.wipLimit }}</span>
        </span>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click">
          <el-icon class="icon-btn"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu class="column-dropdown">
              <el-dropdown-item @click="store.toggleColumnVisibility(column.id)">
                Hide column
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-icon
          class="icon-btn add-btn"
          @click="$emit('add-task', column.id)"
          ><Plus
        /></el-icon>
      </div>
    </div>
    <div
      class="task-list"
      ref="taskList"
      :data-column-id="column.id"
    >
      <TaskCard
        v-for="task in column.tasks"
        :key="task._id || task.id"
        :task="task"
        @edit="$emit('edit-task', { columnId: column.id, task })"
      />
      <!-- Add button only at the bottom of the list -->
      <div
        class="add-task-hover-btn"
        @click="$emit('add-task', column.id)"
      >
        <el-icon><Plus /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Sortable, { type SortableEvent } from 'sortablejs'
  import { MoreFilled, Plus, Warning } from '@element-plus/icons-vue'
  import { useTaskStore } from '@/stores/taskStore'
  import TaskCard from '@/components/TaskCard.vue'

  const store = useTaskStore()

  const props = defineProps({
    column: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['add-task', 'edit-task', 'move-task'])
  const taskList = ref<HTMLElement | null>(null)

  onMounted(() => {
    if (!taskList.value) return
    Sortable.create(taskList.value, {
      group: 'tasks',
      animation: 200,
      ghostClass: 'ghost-card',
      filter: '.add-task-hover-btn', // Prevent dragging the add button
      onEnd: (evt: SortableEvent) => {
        emit('move-task', {
          fromColId: evt.from.dataset.columnId,
          toColId: evt.to.dataset.columnId,
          taskId: evt.item.dataset.taskId,
          newIndex: evt.newIndex
        })
      }
    })
  })
</script>

<style scoped>
  .board-column {
    min-width: 280px;
    width: 280px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 4px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-circle {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #6b7280;
  }

  /* Status circle colors */
  .status-circle.todo { border-color: #ef4444; }
  .status-circle.in-progress { border-color: #facc15; }
  .status-circle.in-review { border-color: #3b82f6; }
  .status-circle.ready-prd { border-color: #10b981; }

  .column-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .priority-warn {
    font-size: 14px;
    color: var(--text-secondary);
    opacity: 0.6;
    margin-left: 4px;
  }

  .task-count {
    font-size: 13px;
    color: var(--text-secondary);
    margin-left: 4px;
    opacity: 0.6;
    font-weight: 500;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .board-column:hover .header-right {
    opacity: 1;
  }

  .icon-btn {
    cursor: pointer;
    font-size: 14px;
  }

  .icon-btn:hover {
    color: var(--text-primary);
  }

  .task-list {
    flex: 1;
    padding: 4px 12px;
    min-height: 100px;
    overflow-y: overlay; /* Use overlay for cleaner look if supported */
    overflow-x: hidden; /* Prevent accidental horizontal scroll */
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Custom Scrollbar for a cleaner Linear look */
  .task-list::-webkit-scrollbar {
    width: 4px;
  }

  .task-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .task-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .task-list:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
  }

  .add-task-hover-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease-in-out;
    font-size: 16px;
    border: 1px solid transparent;
    flex-shrink: 0;
  }

  .board-column:hover .add-task-hover-btn {
    opacity: 1;
  }

  .add-task-hover-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .ghost-card {
    opacity: 0.1;
    background: #fff;
    border: 1px dashed var(--accent-blue);
    border-radius: 8px;
  }

  :root[data-theme='dark'] .ghost-card {
    background: var(--bg-secondary);
    opacity: 0.2;
  }
</style>
