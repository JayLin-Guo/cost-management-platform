<template>
  <div ref="particleContainer" class="particle-background"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 粒子容器引用
const particleContainer = ref<HTMLElement | null>(null)

// 粒子系统配置
interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

// 粒子数组
let particles: Particle[] = []

// 动画帧ID
let animationFrameId: number | null = null

// 鼠标位置
let mouseX = 0
let mouseY = 0

// 画布和上下文
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

// 初始化粒子系统
const initParticles = () => {
  if (!particleContainer.value) {
    return
  }

  // 创建画布
  canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.zIndex = '1'

  // 获取上下文
  ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  // 添加到容器
  particleContainer.value.appendChild(canvas)

  // 创建粒子
  const particleCount = Math.min(Math.floor(window.innerWidth * 0.05), 150) // 根据屏幕宽度调整粒子数量，但不超过150

  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle())
  }

  // 监听鼠标移动
  window.addEventListener('mousemove', handleMouseMove)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 开始动画循环
  startAnimation()
}

// 创建单个粒子
const createParticle = (): Particle => {
  // 生成随机颜色 - 蓝色和青色系列
  const hue =
    Math.random() < 0.7
      ? Math.floor(210 + Math.random() * 30) // 70%概率是蓝色系
      : Math.floor(170 + Math.random() * 30) // 30%概率是青色系

  const saturation = 70 + Math.random() * 30
  const lightness = 50 + Math.random() * 30

  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 1 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    opacity: 0.1 + Math.random() * 0.4,
    color: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`,
  }
}

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  mouseX = event.clientX
  mouseY = event.clientY
}

// 处理窗口大小变化
const handleResize = () => {
  if (!canvas || !ctx) {
    return
  }

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 重新调整粒子位置
  particles.forEach((particle) => {
    if (particle.x > window.innerWidth) {
      particle.x = Math.random() * window.innerWidth
    }
    if (particle.y > window.innerHeight) {
      particle.y = Math.random() * window.innerHeight
    }
  })
}

// 开始动画
const startAnimation = () => {
  if (!ctx || !canvas) {
    return
  }

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 更新并绘制每个粒子
  particles.forEach((particle, index) => {
    // 更新位置
    particle.x += particle.speedX
    particle.y += particle.speedY

    // 边界检查
    if (canvas && (particle.x < 0 || particle.x > canvas.width)) {
      particle.speedX = -particle.speedX
    }

    if (canvas && (particle.y < 0 || particle.y > canvas.height)) {
      particle.speedY = -particle.speedY
    }

    // 确保 ctx 非空
    if (ctx) {
      // 绘制粒子
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.opacity
      ctx.fill()

      // 绘制连接线
      connectParticles(particle, index)
    }

    // 鼠标交互 - 当鼠标靠近时，粒子会被吸引
    const dx = mouseX - particle.x
    const dy = mouseY - particle.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 150) {
      const forceDirectionX = dx / distance
      const forceDirectionY = dy / distance
      const force = (150 - distance) / 150

      particle.speedX += forceDirectionX * force * 0.02
      particle.speedY += forceDirectionY * force * 0.02
    }

    // 限制最大速度
    const maxSpeed = 1.5
    const currentSpeed = Math.sqrt(
      particle.speedX * particle.speedX + particle.speedY * particle.speedY,
    )

    if (currentSpeed > maxSpeed) {
      const ratio = maxSpeed / currentSpeed
      particle.speedX *= ratio
      particle.speedY *= ratio
    }
  })

  // 继续动画循环
  animationFrameId = requestAnimationFrame(startAnimation)
}

// 连接粒子
const connectParticles = (particle: Particle, index: number) => {
  if (!ctx) {
    return
  }

  for (let i = index + 1; i < particles.length; i++) {
    const otherParticle = particles[i]
    const dx = particle.x - otherParticle.x
    const dy = particle.y - otherParticle.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 当粒子距离小于一定值时，绘制连接线
    if (distance < 150) {
      // 线条透明度随距离变化
      const opacity = 1 - distance / 150

      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(otherParticle.x, otherParticle.y)
      ctx.strokeStyle = `rgba(100, 150, 255, ${opacity * 0.2})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }
}

// 清理资源
const cleanup = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)

  if (canvas && particleContainer.value) {
    particleContainer.value.removeChild(canvas)
  }

  particles = []
}

// 组件挂载时初始化
onMounted(() => {
  initParticles()
})

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.particle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none; /* 允许点击穿透 */
}
</style>
