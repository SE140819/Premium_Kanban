<template>
  <div
    class="task-card"
    :class="[`bg-${task.color || 'gray'}`]"
    :data-task-id="task._id || task.id"
    @click="$emit('edit', task)"
  >
    <div class="card-header">
      <div
        v-if="task.priority"
        class="priority-badge"
        :class="task.priority"
      >
        <el-icon><info-filled /></el-icon>
        {{ task.priority.toUpperCase() }}
      </div>
      <div
        class="header-right"
        v-if="task.id && String(task.id).includes('/')"
      >
        <span class="task-id">{{ task.id }}</span>
      </div>
    </div>

    <div class="card-body">
      <p class="task-title">{{ task.title }}</p>
      <div
        v-if="task.description"
        class="task-desc-snippet"
        v-html="task.description"
      ></div>
    </div>

    <div
      class="card-footer"
      v-if="task.deadline"
    >
      <div class="deadline-info">
        <el-icon><calendar /></el-icon>
        <span>{{ formatDate(task.deadline) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    task: {
      type: Object,
      required: true
    }
  })

  defineEmits(['edit'])

  const formatDate = date => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
</script>

<style scoped>
  .task-card {
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    border-left: 2px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  /* Colors based on image */
  .bg-gray {
    background-color: #f1f5f9;
    color: #475569;
  }
  .bg-cyan {
    background-color: #06b6d4;
    color: #fff;
  }
  .bg-lime {
    background-color: #a3e635;
    color: #365314;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .priority-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .priority-badge.low {
    background: #e2e8f0;
    color: #64748b;
  }
  .priority-badge.medium {
    background: #fef9c3;
    color: #854d0e;
  }
  .priority-badge.high {
    background: #fee2e2;
    color: #991b1b;
  }

  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .priority-icon {
    color: #ef4444;
    font-weight: bold;
  }
  .type-icon {
    font-size: 12px;
    opacity: 0.6;
  }

  .task-id {
    font-size: 10px;
    opacity: 0.6;
    font-weight: 600;
  }

  .task-title {
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
    font-weight: 500;
    color: #1e293b;
  }

  .task-desc-snippet {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }

  :root[data-theme='dark'] .task-desc-snippet {
    color: #94a3b8;
  }

  .card-footer {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .deadline-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #64748b;
  }

  .deadline-info .el-icon {
    font-size: 14px;
  }

  /* Dark mode adjustments */
  :root[data-theme='dark'] .task-card {
    background-color: rgba(30, 41, 59, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  :root[data-theme='dark'] .task-title {
    color: #f1f5f9;
  }
  :root[data-theme='dark'] .deadline-info {
    color: #94a3b8;
  }
  :root[data-theme='dark'] .card-footer {
    border-color: rgba(255, 255, 255, 0.05);
  }

  :root[data-theme='dark'] .bg-gray {
    background-color: #334155;
    color: #f1f5f9;
  }
  :root[data-theme='dark'] .bg-cyan {
    background-color: #0891b2;
    color: #fff;
  }
  :root[data-theme='dark'] .bg-lime {
    background-color: #84cc16;
    color: #1e293b;
  }
</style>
