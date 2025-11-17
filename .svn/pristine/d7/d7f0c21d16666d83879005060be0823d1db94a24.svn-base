import { ref } from 'vue'
import * as THREE from 'three'

export interface NodeInfo {
  type: string
  element?: HTMLElement
  object3D?: any
  data: any
  isCSS2D: boolean
  intersection?: any
}

export function useContextMenuDetector() {
  
  // 检测点击的节点
  function detectClickedNode(
    event: MouseEvent, 
    nodeDataFinder?: (nodeId: string) => any,
    scene?: any,
    camera?: any,
    renderer?: any,
    nodeGroup?: any
  ): NodeInfo | null {
    console.log('detectClickedNode 被调用:', {
      event: event,
      target: event.target,
      nodeDataFinder: nodeDataFinder,
      scene: scene,
      camera: camera,
      renderer: renderer,
      nodeGroup: nodeGroup
    })
    
    const target = event.target as HTMLElement
    
    // 1. 检查 CSS2D 标签节点
    const css2dNode = target.closest('[data-node-type]')
    if (css2dNode) {
      console.log('检测到 CSS2D 节点:', css2dNode)
      const nodeType = css2dNode.getAttribute('data-node-type')
      const nodeId = css2dNode.getAttribute('data-node-id')
      
      return {
        type: nodeType || 'unknown',
        element: css2dNode as HTMLElement,
        data: nodeDataFinder ? nodeDataFinder(nodeId!) : { id: nodeId },
        isCSS2D: true
      }
    }
    
    // 2. 检查 3D Mesh 节点（通过射线检测）
    console.log('开始 3D 节点射线检测...')
    const intersectedNode = raycastForNode(event, scene, camera, renderer, nodeGroup)
    console.log('射线检测结果:', intersectedNode)
    
    if (intersectedNode) {
      // 根据现有的数据结构，检查 sequenceInfo.type 是否为 'node'
      const userData = intersectedNode.object.userData
      console.log('检查 userData:', userData)
      
      if (userData && userData.sequenceInfo?.type === 'node') {
        console.log('确认为审核节点，返回节点信息')
        return {
          type: 'review', // 工作流节点类型为 review
          object3D: intersectedNode.object,
          data: userData.nodeData || userData, // 使用 nodeData 或整个 userData
          isCSS2D: false,
          intersection: intersectedNode
        }
      } else {
        console.log('不是审核节点，userData.sequenceInfo?.type =', userData?.sequenceInfo?.type)
      }
    }
    
    console.log('未检测到任何节点')
    return null
  }
  
  // 射线检测节点
  function raycastForNode(event: MouseEvent, scene?: any, camera?: any, renderer?: any, nodeGroup?: any): THREE.Intersection | null {
    console.log('raycastForNode 开始执行')
    
    if (!scene || !camera || !renderer) {
      console.log('缺少必要的 Three.js 对象:', { scene, camera, renderer })
      return null
    }
    
    // 获取鼠标在画布上的标准化坐标
    const canvas = renderer.domElement
    const rect = canvas.getBoundingClientRect()
    
    const mouse = new THREE.Vector2()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    console.log('鼠标坐标计算:', {
      clientX: event.clientX,
      clientY: event.clientY,
      rect: rect,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
      normalizedMouse: mouse
    })
    
    // 创建射线
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    
    // 如果有节点组，只检测节点组；否则检测整个场景
    const targetObjects = nodeGroup ? nodeGroup.children : scene.children
    console.log('检测目标:', nodeGroup ? '节点组' : '整个场景', '对象数量:', targetObjects.length)
    
    const intersects = raycaster.intersectObjects(targetObjects, true)
    console.log('射线检测到的对象:', intersects.length, intersects)
    
    // 查找第一个有效的节点对象
    for (const intersect of intersects) {
      console.log('检查节点对象:', {
        object: intersect.object,
        userData: intersect.object.userData,
        name: intersect.object.name,
        type: intersect.object.type
      })
      
      const userData = intersect.object.userData
      
      // 严格验证是否为审核节点
      if (userData && 
          userData.sequenceInfo?.type === 'node' && 
          userData.nodeId && 
          userData.nodeData) {
        console.log('找到有效的审核节点:', userData)
        return intersect
      } else {
        console.log('跳过非审核节点对象:', {
          hasUserData: !!userData,
          sequenceType: userData?.sequenceInfo?.type,
          hasNodeId: !!userData?.nodeId,
          hasNodeData: !!userData?.nodeData
        })
      }
    }
    
    console.log('未找到有效的审核节点')
    return null
  }
  
  return {
    detectClickedNode,
    raycastForNode
  }
} 