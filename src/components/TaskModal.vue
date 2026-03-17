<template>
  <el-dialog
    v-model="visible"
    :title="task ? 'Edit Task' : 'New Task'"
    width="500px"
    @closed="handleClosed"
    custom-class="premium-dialog"
  >
    <el-form
      :model="form"
      label-position="top"
    >
      <el-form-item label="Title">
        <el-input
          v-model="form.title"
          placeholder="What needs to be done?"
        />
      </el-form-item>
      <el-form-item label="Description">
        <div class="editor-container">
          <QuillEditor
            v-model:content="form.description"
            content-type="html"
            theme="snow"
            placeholder="Add more details..."
            :toolbar="['bold', 'italic', 'underline', { list: 'ordered' }, { list: 'bullet' }]"
          />
        </div>
      </el-form-item>
      <div class="form-row">
        <el-form-item
          label="Priority"
          class="flex-1"
        >
          <el-select
            v-model="form.priority"
            placeholder="Select Priority"
            style="width: 100%"
          >
            <el-option
              label="Low"
              value="low"
            >
              <span class="dot low"></span> Low
            </el-option>
            <el-option
              label="Medium"
              value="medium"
            >
              <span class="dot medium"></span> Medium
            </el-option>
            <el-option
              label="High"
              value="high"
            >
              <span class="dot high"></span> High
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="Deadline"
          class="flex-1"
        >
          <el-date-picker
            v-model="form.deadline"
            type="date"
            placeholder="Set deadline"
            style="width: 100%"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="task"
          type="danger"
          plain
          @click="handleDelete"
          >Delete</el-button
        >
        <div class="right-actions">
          <el-button @click="visible = false">Cancel</el-button>
          <el-button
            type="primary"
            @click="handleSave"
            :disabled="!form.title.trim()"
          >
            Save Task
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { reactive, watch, ref } from 'vue'

  const props = defineProps({
    isOpen: Boolean,
    task: Object
  })

  const emit = defineEmits(['close', 'save', 'delete'])

  const visible = ref(false)
  const form = reactive({
    title: '',
    description: '',
    priority: 'low',
    deadline: null
  })

  watch(
    () => props.isOpen,
    newVal => {
      visible.value = newVal
      if (newVal && !props.task) {
        form.title = ''
        form.description = ''
        form.priority = 'low'
        form.deadline = null
      }
    }
  )

  watch(visible, newVal => {
    if (!newVal) emit('close')
  })

  watch(
    () => props.task,
    newTask => {
      if (newTask) {
        form.title = newTask.title || ''
        form.description = newTask.description || ''
        form.priority = newTask.priority || 'low'
        form.deadline = newTask.deadline || null
      } else {
        form.title = ''
        form.description = ''
        form.priority = 'low'
        form.deadline = null
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
    emit('close')
  }
</script>

<style>
  .premium-dialog {
    background: var(--bg-primary) !important;
    backdrop-filter: blur(24px) !important;
    border-radius: 20px !important;
    border: 1px solid var(--glass-border) !important;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3) !important;
  }

  .premium-dialog .el-dialog__title {
    color: var(--text-primary) !important;
    font-weight: 700 !important;
  }

  .premium-dialog .el-form-item__label {
    color: var(--text-secondary) !important;
    font-weight: 600 !important;
  }

  .premium-dialog .el-input__inner,
  .premium-dialog .el-textarea__inner {
    background: var(--glass-bg) !important;
    border-color: var(--glass-border) !important;
    color: var(--text-primary) !important;
    border-radius: 12px !important;
  }

  .premium-dialog .el-input__inner:focus,
  .premium-dialog .el-textarea__inner:focus {
    border-color: var(--accent-blue) !important;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .right-actions {
    display: flex;
    gap: 12px;
  }

  .form-row {
    display: flex;
    gap: 20px;
  }

  .flex-1 {
    flex: 1;
  }

  /* Quill Editor Styles */
  .editor-container {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
  }

  :deep(.ql-toolbar) {
    border: none !important;
    border-bottom: 1px solid var(--glass-border) !important;
    background: rgba(0, 0, 0, 0.02) !important;
  }

  :deep(.ql-container) {
    border: none !important;
    min-height: 150px;
    font-family: 'Outfit', sans-serif !important;
    font-size: 14px !important;
  }

  :root[data-theme='dark'] :deep(.ql-editor) {
    color: #f1f5f9;
  }

  :root[data-theme='dark'] :deep(.ql-toolbar button .ql-stroke) {
    stroke: #94a3b8;
  }

  :root[data-theme='dark'] :deep(.ql-toolbar button .ql-fill) {
    fill: #94a3b8;
  }

  :root[data-theme='dark'] :deep(.ql-toolbar) {
    background: rgba(255, 255, 255, 0.05) !important;
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .dot.low {
    background: #64748b;
  }
  .dot.medium {
    background: #eab308;
  }
  .dot.high {
    background: #ef4444;
  }
</style>
