import * as THREE from 'three'
import type { NodeInfo } from './useContextMenuDetector'

export interface MenuPosition {
  x: number
  y: number
}

export interface MenuConfig {
  width: number
  height: number
  offset: number
}

export function useContextMenuPositioning() {
  
  // 计算菜单位置
  function calculateMenuPosition(
    event: MouseEvent, 
    nodeInfo: NodeInfo,
    menuConfig: MenuConfig = { width: 200, height: 280, offset: 10 },
    camera?: THREE.Camera,
    renderer?: THREE.WebGLRenderer
  ): MenuPosition {
    const { width: MENU_WIDTH, height: MENU_HEIGHT, offset: OFFSET } = menuConfig
    
    let baseX = event.clientX
    let baseY = event.clientY
    
    // CSS2D 节点定位
    if (nodeInfo.isCSS2D && nodeInfo.element) {
      const rect = nodeInfo.element.getBoundingClientRect()
      baseX = rect.right + OFFSET
      baseY = rect.top + (rect.height / 2) - (MENU_HEIGHT / 2)
    }
    // 3D 节点定位
    else if (!nodeInfo.isCSS2D && nodeInfo.object3D && camera && renderer) {
      const screenPos = get3DNodeScreenPositionWithParams(
        nodeInfo.object3D, 
        camera, 
        renderer, 
        nodeInfo.intersection
      )
      if (screenPos) {
        baseX = screenPos.x + OFFSET
        baseY = screenPos.y - (MENU_HEIGHT / 2)
      }
    }
    
    // 边界检测和调整
    const finalPosition = adjustForScreenBounds(baseX, baseY, MENU_WIDTH, MENU_HEIGHT, OFFSET)
    
    return finalPosition
  }
  
  // 3D 节点屏幕位置计算
  function get3DNodeScreenPosition(object3D: THREE.Object3D, intersection?: any): { x: number; y: number } | null {
    // 这里需要访问全局的 camera 和 renderer
    // 在实际使用时，这些参数应该通过函数参数传入
    // 暂时返回 null，实际使用时应该调用 get3DNodeScreenPositionWithParams
    return null
  }
  
  // 带参数的 3D 节点屏幕位置计算
  function get3DNodeScreenPositionWithParams(
    object3D: THREE.Object3D, 
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    intersection?: any
  ) {
    // 如果有交点信息，使用交点位置
    if (intersection && intersection.point) {
      const screenPosition = intersection.point.clone()
      screenPosition.project(camera)
      
      const canvas = renderer.domElement
      const x = (screenPosition.x * 0.5 + 0.5) * canvas.clientWidth
      const y = (screenPosition.y * -0.5 + 0.5) * canvas.clientHeight
      
      const canvasRect = canvas.getBoundingClientRect()
      
      return {
        x: canvasRect.left + x,
        y: canvasRect.top + y
      }
    }
    
    // 否则使用对象中心位置
    const worldPosition = new THREE.Vector3()
    object3D.getWorldPosition(worldPosition)
    
    const screenPosition = worldPosition.clone()
    screenPosition.project(camera)
    
    const canvas = renderer.domElement
    const x = (screenPosition.x * 0.5 + 0.5) * canvas.clientWidth
    const y = (screenPosition.y * -0.5 + 0.5) * canvas.clientHeight
    
    const canvasRect = canvas.getBoundingClientRect()
    
    return {
      x: canvasRect.left + x,
      y: canvasRect.top + y
    }
  }
  
  // 屏幕边界调整
  function adjustForScreenBounds(
    x: number, 
    y: number, 
    menuWidth: number, 
    menuHeight: number, 
    offset: number
  ): MenuPosition {
    const finalX = Math.min(
      Math.max(x, offset), 
      window.innerWidth - menuWidth - offset
    )
    
    const finalY = Math.min(
      Math.max(y, offset), 
      window.innerHeight - menuHeight - offset
    )
    
    return { x: finalX, y: finalY }
  }
  
  return {
    calculateMenuPosition,
    get3DNodeScreenPosition,
    get3DNodeScreenPositionWithParams,
    adjustForScreenBounds
  }
} 