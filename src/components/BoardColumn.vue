<template>
  <div
    class="board-column"
    :class="{ 'layout-grid': column.layout === 'grid' }"
  >
    <div class="column-header">
      <div class="header-main">
        <h2 class="column-title">{{ column.title }}</h2>
        <div
          v-if="column.wipLimit"
          class="wip-limit"
          :class="{ 'over-limit': column.tasks.length > column.wipLimit }"
        >
          {{ column.tasks.length }} / {{ column.wipLimit }}
        </div>
      </div>
    </div>

    <div class="column-actions">
      <button
        class="add-task-link"
        @click="$emit('add-task', column.id)"
      >
        + add task
      </button>
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
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import Sortable from 'sortablejs'
  import TaskCard from './TaskCard.vue'

  const props = defineProps({
    column: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['add-task', 'edit-task', 'move-task'])
  const taskList = ref(null)

  onMounted(() => {
    Sortable.create(taskList.value, {
      group: 'tasks',
      animation: 200,
      ghostClass: 'ghost-card',
      onEnd: evt => {
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
    background: #fff;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  :root[data-theme='dark'] .board-column {
    background: #1e293b;
    border-color: #334155;
  }

  .column-header {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    background: #fff;
  }

  :root[data-theme='dark'] .column-header {
    background: #1e293b;
    border-color: #334155;
  }

  .header-main {
    text-align: center;
  }

  .column-title {
    font-size: 16px;
    font-weight: 700;
    color: #4b5563;
    margin: 0;
  }

  :root[data-theme='dark'] .column-title {
    color: #e2e8f0;
  }

  .wip-limit {
    font-size: 12px;
    font-weight: 700;
    color: #10b981;
    margin-top: 4px;
  }

  .wip-limit.over-limit {
    color: #ef4444;
  }

  .column-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 8px 12px;
    gap: 8px;
  }

  .archived-text {
    font-size: 11px;
    color: #9ca3af;
  }

  .add-task-link {
    background: none;
    border: none;
    font-size: 11px;
    color: #9ca3af;
    cursor: pointer;
  }

  .add-task-link:hover {
    text-decoration: underline;
  }

  .task-list {
    flex-grow: 1;
    padding: 12px;
    min-height: 200px;
    border-right: 1px dashed #e5e7eb;
  }

  :root[data-theme='dark'] .task-list {
    border-color: #334155;
  }

  /* Backlog grid layout */
  .layout-grid .task-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    align-content: flex-start;
  }

  .ghost-card {
    opacity: 0.4;
    background: #f3f4f6;
    border: 1px dashed #9ca3af;
  }
</style>
