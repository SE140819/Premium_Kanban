<template>
  <div
    id="app"
    :data-theme="theme"
  >
    <div class="mesh-gradient"></div>
    <div class="glass-overlay"></div>
    <router-view v-slot="{ Component }">
      <transition
        name="page"
        mode="out-in"
      >
        <component
          :is="Component"
          @toggle-theme="toggleTheme"
          :current-theme="theme"
        />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const theme = ref('dark')

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    theme.value = savedTheme
    updateTheme(savedTheme)
  })

  const toggleTheme = event => {
    const isAppearanceTransition =
      document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nextTheme = theme.value === 'dark' ? 'light' : 'dark'

    if (!isAppearanceTransition) {
      theme.value = nextTheme
      updateTheme(nextTheme)
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transition = document.startViewTransition(async () => {
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

  const updateTheme = val => {
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
    /* Default: Light Theme */
    --bg-primary: #f8fafc;
    --bg-mesh-1: rgba(59, 130, 246, 0.1);
    --bg-mesh-2: rgba(139, 92, 246, 0.05);
    --bg-mesh-3: rgba(236, 72, 153, 0.05);
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(0, 0, 0, 0.08);
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --accent-blue: #2563eb;
    --accent-purple: #7c3aed;
    --accent-pink: #db2777;
  }

  [data-theme='dark'],
  .dark {
    --bg-primary: #0f172a;
    --bg-mesh-1: rgba(59, 130, 246, 0.15);
    --bg-mesh-2: rgba(139, 92, 246, 0.15);
    --bg-mesh-3: rgba(236, 72, 153, 0.15);
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.1);
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.5);
    --accent-blue: #3b82f6;
    --accent-purple: #8b5cf6;
    --accent-pink: #ec4899;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Outfit', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
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
