<template>
  <el-dialog
    v-model="visible"
    width="640px"
    @closed="handleClosed"
    class="premium-dialog"
    :show-close="false"
  >
    <template #header>
      <div class="custom-header">
        <h2 class="modal-title">{{ task ? 'Edit Task' : 'New Task' }}</h2>
        <div class="header-meta" v-if="task">
          <span class="task-id">SAT-{{ String(task._id || task.id).slice(-3).toUpperCase() }}</span>
        </div>
      </div>
    </template>

    <div class="modal-body">
      <el-form
        :model="form"
        label-position="top"
      >
        <el-form-item class="title-item">
          <el-input
            v-model="form.title"
            placeholder="Issue title"
            class="title-input"
          />
        </el-form-item>

        <el-form-item class="editor-item">
          <div class="editor-container">
            <QuillEditor
              :key="modalKey"
              v-model:content="form.description"
              content-type="html"
              theme="snow"
              placeholder="Add description..."
              :toolbar="['bold', 'italic', 'underline', { list: 'ordered' }, { list: 'bullet' }, 'link']"
            />
          </div>
        </el-form-item>

        <div class="form-grid">
          <div class="grid-item">
            <label class="item-label">
              <el-icon><WarningIcon /></el-icon> Priority
            </label>
            <el-select
              v-model="form.priority"
              placeholder="Priority"
              class="premium-select"
            >
              <el-option label="Low" value="low">
                <div class="option-content"><span class="dot low"></span> Low</div>
              </el-option>
              <el-option label="Medium" value="medium">
                <div class="option-content"><span class="dot medium"></span> Medium</div>
              </el-option>
              <el-option label="High" value="high">
                <div class="option-content"><span class="dot high"></span> High</div>
              </el-option>
            </el-select>
          </div>

          <div class="grid-item">
            <label class="item-label">
              <el-icon><Calendar /></el-icon> Due Date
            </label>
            <el-date-picker
              v-model="form.deadline"
              type="date"
              placeholder="Set due date"
              class="premium-datepicker"
            />
          </div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="left-actions">
          <el-button
            v-if="task"
            class="action-btn delete-btn"
            @click="handleDelete"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <div class="right-actions">
          <el-button class="action-btn secondary-btn" @click="visible = false">Cancel</el-button>
          <el-button
            class="action-btn primary-btn"
            @click="handleSave"
            :disabled="!form.title.trim()"
          >
            {{ task ? 'Update Title' : 'Create Issue' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue'
  import {Delete, Calendar } from '@element-plus/icons-vue'
  import type { Task, TaskCreateInput } from '@/types/task'

  interface Props {
    isOpen: boolean
    task: Task | null
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    (e: 'close'): void
    (e: 'save', data: Omit<TaskCreateInput, 'columnId'>): void
    (e: 'delete'): void
  }>()

  const visible = ref(false)
  const modalKey = ref(0)

  const form = reactive<Omit<TaskCreateInput, 'columnId'>>({
    title: '',
    description: '',
    priority: 'low',
    deadline: null
  })

  const resetForm = () => {
    form.title = ''
    form.description = ''
    form.priority = 'low'
    form.deadline = null
    modalKey.value++
  }

  watch(
    () => props.isOpen,
    (newVal) => {
      visible.value = newVal
      if (newVal && !props.task) {
        resetForm()
      }
    }
  )

  watch(visible, (newVal) => {
    if (!newVal) {
      emit('close')
    }
  })

  watch(
    () => props.task,
    (newTask) => {
      if (newTask) {
        form.title = newTask.title || ''
        form.description = newTask.description || ''
        form.priority = newTask.priority || 'low'
        form.deadline = newTask.deadline || null
        modalKey.value++
      }
    },
    { immediate: true }
  )
   
  const handleSave = () => {
    if (!form.title.trim()) return
    emit('save', { ...form })
    visible.value = false
  }

  const handleDelete = () => {
    emit('delete')
    visible.value = false
  }

  const handleClosed = () => {
    resetForm()
    emit('close')
  }
</script>

<style scoped>
  :global(.el-overlay) {
    backdrop-filter: blur(12px) !important;
    background-color: rgba(0, 0, 0, 0.4) !important;
  }

  :global(.premium-dialog) {
    background: #161616 !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.6) !important;
    padding: 0 !important;
    overflow: hidden;
  }

  :global(.premium-dialog .el-dialog__header) {
    margin-right: 0 !important;
    padding: 20px 24px 12px !important;
  }

  :global(.premium-dialog .el-dialog__body) {
    padding: 0 24px 20px !important;
  }

  :global(.premium-dialog .el-dialog__footer) {
    padding: 16px 24px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    background: rgba(255, 255, 255, 0.01);
  }

  .custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .task-id {
    font-size: 11px;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: monospace;
  }

  .title-item {
    margin-bottom: 8px !important;
  }

  :deep(.title-input .el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    border: none !important;
  }

  :deep(.title-input .el-input__inner) {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary) !important;
    height: 48px;
  }

  :deep(.title-input .el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.15);
  }

  .editor-container {
    background: transparent;
    border: none;
    margin-bottom: 24px;
  }

  :deep(.ql-toolbar) {
    border: none !important;
    padding: 8px 0 !important;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  :deep(.ql-toolbar:hover) {
    opacity: 1;
  }

  :deep(.ql-container) {
    border: none !important;
    font-family: 'Outfit', sans-serif !important;
    font-size: 15px !important;
    min-height: 120px;
  }

  :deep(.ql-editor) {
    padding: 12px 0 !important;
    color: #e2e8f0 !important;
  }

  :deep(.ql-editor.ql-blank::before) {
    color: rgba(255, 255, 255, 0.2) !important;
    font-style: normal;
    left: 0;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 12px;
  }

  .item-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :deep(.premium-select .el-input__wrapper),
  :deep(.premium-datepicker .el-input__wrapper) {
    background: rgba(255, 255, 255, 0.03) !important;
    box-shadow: none !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 8px !important;
    transition: all 0.2s;
  }

  :deep(.premium-select .el-input__wrapper:hover),
  :deep(.premium-datepicker .el-input__wrapper:hover) {
    border-color: rgba(255, 255, 255, 0.1) !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .right-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    border-radius: 8px !important;
    font-weight: 500 !important;
    font-size: 13px !important;
    height: 36px !important;
    padding: 0 16px !important;
    transition: all 0.2s;
  }

  .primary-btn {
    background: #4f46e5 !important;
    border: none !important;
    color: white !important;
  }

  .primary-btn:hover:not(.is-disabled) {
    background: #6366f1 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  .secondary-btn {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    color: var(--text-secondary) !important;
  }

  .secondary-btn:hover {
    background: rgba(255, 255, 255, 0.03) !important;
    color: var(--text-primary) !important;
  }

  .delete-btn {
    background: transparent !important;
    border: none !important;
    color: var(--text-secondary) !important;
    padding: 0 10px !important;
  }

  .delete-btn:hover {
    color: #ef4444 !important;
    background: rgba(239, 68, 68, 0.1) !important;
  }

  .option-content {
    display: flex;
    align-items: center;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .dot.low { background: #94a3b8; }
  .dot.medium { background: #eab308; }
  .dot.high { background: #ef4444; }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    :global(.premium-dialog) {
      width: 90% !important;
    }
  }
</style>
