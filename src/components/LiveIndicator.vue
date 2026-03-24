<template>
  <div
    class="live-indicator"
    :class="{ flashing: isFlashing }"
    :title="`${tabCount + 1} tab(s) đang mở`"
  >
    <span class="live-dot" />
    <span class="live-label">LIVE</span>
    <span
      v-if="tabCount > 0"
      class="tab-badge"
    >{{ tabCount + 1 }} tabs</span>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { syncService } from '@/services/syncService'

  const tabCount = ref(0)
  const isFlashing = ref(false)

  let cleanupList: Array<() => void> = []

  async function refreshTabCount() {
    tabCount.value = await syncService.getActiveTabs()
  }

  function flashBadge() {
    isFlashing.value = true
    setTimeout(() => (isFlashing.value = false), 800)
  }

  onMounted(async () => {
    const cleanupSync = syncService.init()
    const cleanupListener = syncService.onSync(event => {
      if (!['PING', 'PONG'].includes(event.type)) {
        flashBadge()
      }
      if (event.type === 'PING') {
        refreshTabCount()
      }
    })

    cleanupList = [cleanupSync, cleanupListener]
    await refreshTabCount()

    // Refresh tab count every 5s
    const interval = setInterval(refreshTabCount, 5000)
    cleanupList.push(() => clearInterval(interval))
  })

  onUnmounted(() => {
    cleanupList.forEach(fn => fn())
  })
</script>

<style scoped>
  .live-indicator {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.08);
    cursor: default;
    transition: background 0.3s;
    user-select: none;
  }

  .live-indicator.flashing {
    background: rgba(34, 197, 94, 0.25);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
    animation: pulse-dot 1.8s infinite;
    flex-shrink: 0;
  }

  .live-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #22c55e;
  }

  .tab-badge {
    font-size: 10px;
    color: rgba(34, 197, 94, 0.7);
    font-weight: 500;
    border-left: 1px solid rgba(34, 197, 94, 0.3);
    padding-left: 6px;
    margin-left: 1px;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }
</style>
