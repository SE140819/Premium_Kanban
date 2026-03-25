<template>
  <div
    class="task-card"
    :data-task-id="task.id || task._id"
  >
    <div class="card-top">
      <span class="task-id">SAT-{{ String(task.id || task._id).slice(-3).toUpperCase() }}</span>
      <div class="user-avatar-mini">
        <img
          v-if="task.avatar"
          :src="task.avatar"
          alt="Avatar"
        />
        <div
          v-else
          class="avatar-placeholder"
        >
          P
        </div>
      </div>
    </div>

    <div class="card-title">
      {{ task.title }}
    </div>

    <div class="card-meta">
      <div
        class="priority-icon"
        :class="task.priority || 'medium'"
      >
        <el-icon><InfoFilled /></el-icon>
      </div>

      <div class="labels">
        <span
          v-if="task.labels && task.labels.length"
          v-for="label in task.labels"
          :key="label"
          class="label-pill"
          >{{ label }}</span
        >
        <span
          v-else
          class="label-pill"
          >Feature</span
        >
        <span
          v-if="task.type"
          class="label-pill"
          >{{ task.type }}</span
        >
      </div>
    </div>

    <div
      class="card-date"
      v-if="task.deadline"
    >
      <span class="created-label">Created</span> {{ formatDate(task.deadline) }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { InfoFilled } from '@element-plus/icons-vue'
  import { computed } from 'vue'
  import type { Task } from '@/types/task'

  interface Props {
    task: Task
  }

  defineProps<Props>()

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
</script>

<style scoped>
  .task-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 0px; /* Removed redundant margin */
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .task-card:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background-color: var(--hover-bg);
  }

  /* Top Row: ID and Avatar */
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .task-id {
    font-size: 10px;
    color: var(--text-secondary);
    opacity: 0.5;
    font-weight: 500;
  }

  .user-avatar-mini {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    overflow: hidden;
  }

  .avatar-placeholder {
    background-color: #4b5563;
    color: white;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-weight: bold;
  }

  /* Title */
  .card-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
  }

  /* Meta Row: Priority, Labels */
  .card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    flex-wrap: wrap;
  }

  .priority-icon {
    font-size: 14px;
    display: flex;
    align-items: center;
    opacity: 0.8;
  }

  .priority-icon.high { color: #ef4444; }
  .priority-icon.medium { color: #f59e0b; }
  .priority-icon.low { color: #3b82f6; }

  .labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .label-pill {
    font-size: 10px;
    color: var(--text-primary);
    background-color: rgba(255, 255, 255, 0.08);
    padding: 1px 6px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    font-weight: 500;
  }

  /* Date */
  .card-date {
    font-size: 10px;
    color: var(--text-secondary);
    opacity: 0.5;
    margin-top: 4px;
  }

  .created-label {
    margin-right: 2px;
  }

  [data-theme='light'] .label-pill {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }
</style>
