<template>
  <div
    id="app"
    :data-theme="theme"
  >
    <div class="app-layout">
      <div
        v-if="sidebarOpen"
        class="mobile-overlay"
        @click="sidebarOpen = false"
      ></div>
      <Sidebar :is-open="sidebarOpen" />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition
            name="page"
            mode="out-in"
          >
            <component
              :is="Component"
              :current-theme="theme"
              @toggle-theme="toggleTheme"
              @toggle-sidebar="sidebarOpen = !sidebarOpen"
            />
          </transition>
        </router-view>
      </main>
    </div>
    <AIRobotAssistant />
    <TaskModal />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Sidebar from '@/components/Sidebar.vue'
  import AIRobotAssistant from '@/components/AIRobotAssistant.vue'
  import TaskModal from '@/components/TaskModal.vue'

  const theme = ref('dark')
  const sidebarOpen = ref(false)

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    theme.value = savedTheme
    updateTheme(savedTheme)
  })

  const toggleTheme = (event: MouseEvent) => {
    const isAppearanceTransition =
      typeof (document as any).startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nextTheme = theme.value === 'dark' ? 'light' : 'dark'

    if (!isAppearanceTransition) {
      theme.value = nextTheme
      updateTheme(nextTheme)
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transition = (document as any).startViewTransition(async () => {
      theme.value = nextTheme
      updateTheme(nextTheme)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      )
    })
  }

  const updateTheme = (val: string) => {
    document.documentElement.setAttribute('data-theme', val)
    if (val === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', val)
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  :root {
  /* Linear-style Dark Theme (Default) */
  --bg-primary: #0d0d0d;
  --bg-secondary: #161616;
  --sidebar-bg: #0d0d0d;
  --border-color: rgba(255, 255, 255, 0.08);
  --text-primary: #ffffff;
  --text-secondary: #8a8a8e;
  --accent-blue: #4f46e5;
  --accent-purple: #7c3aed;
  --card-bg: #161616;
  --hover-bg: rgba(255, 255, 255, 0.05);
}

[data-theme='light'] {
  --bg-primary: #ffffff;
  --bg-secondary: #f7f8f9;
  --sidebar-bg: #f7f8f9;
  --border-color: rgba(0, 0, 0, 0.08);
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent-blue: #3b82f6;
  --card-bg: #ffffff;
  --hover-bg: rgba(0, 0, 0, 0.03);
}

  body {
    margin: 0;
    padding: 0;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
  }
}

  #app {
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    background-color: var(--bg-primary);
  }

  .mesh-gradient {
    display: none;
  }

  .glass-overlay {
    display: none;
  }

  /* Page transitions */
  .page-enter-active,
  .page-leave-active {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }

  .page-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

  /* View Transition API styles */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  ::view-transition-old(root) {
    z-index: 1;
  }

  ::view-transition-new(root) {
    z-index: 2;
  }

  /* Global Element Plus overrides */
  .el-button {
    font-family: 'Outfit', sans-serif !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .el-button--primary.is-plain {
    background: rgba(59, 130, 246, 0.1) !important;
    border-color: rgba(59, 130, 246, 0.2) !important;
    color: var(--accent-blue) !important;
  }

  .el-button--primary.is-plain:hover {
    background: var(--accent-blue) !important;
    border-color: var(--accent-blue) !important;
    color: #fff !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .el-dialog {
    border-radius: 20px !important;
    background: var(--bg-primary) !important;
  }
</style>
