<template>
  <div class="workflow-animation-page">
    <div class="header">
      <h1>工作流程动画展示</h1>
     
     
    </div>
    
    <div class="content">
      <!-- 3D视图 -->
      <div class="view-container" v-if="showAnimation">
        <WorkflowView canvas-container
          :nodeData="workflowNodes" 
          :reviewers="reviewers" 
          :timePoints="timePoints"
          
        />
      </div>
      
    
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import WorkflowView from './components/WorkflowView.vue';
import { 
  getWorkflowNodes, 
  getWorkflowTimePoints, 
  getWorkflowReviewers 
} from '@/api/newWorkflow';

export default defineComponent({
  name: 'WorkflowAnimation',
  components: {
    WorkflowView,
  },
  setup() {
    // 数据状态
    const workflowNodes = ref<any[]>([]);
    const reviewers = ref<any[]>([]);
    const timePoints = ref<any[]>([]);
    const loading = ref<boolean>(true);
    
    // 控制显示动画或数据视图
    const showAnimation = ref(true);
    
    // 切换视图
    const toggleView = () => {
      showAnimation.value = !showAnimation.value;
    };
    
    // 加载数据
    const loadData = async () => {
      loading.value = true;
      try {
        // 项目ID，可以从路由参数或其他地方获取
        const projectId = '1'; // 示例项目ID，根据实际情况修改
        
        try {
          // 并行获取数据
          const [nodesData, reviewersData, timePointsData] = await Promise.all([
            getWorkflowNodes(projectId),
            getWorkflowReviewers(projectId),
            getWorkflowTimePoints(projectId)
          ]);
          console.log('nodesData================》》》',nodesData);
          workflowNodes.value = nodesData.data || [];
          reviewers.value = reviewersData.data || [];
          timePoints.value = timePointsData.data || [];
        } catch (error) {
          console.error('无法从API获取数据，使用模拟数据:', error);
   
        }
      } catch (error) {
        console.error('加载工作流数据失败:', error);
 
      } finally {
        // 确保在数据处理完成后再设置loading为false
          loading.value = false;
          console.log('数据加载完成，loading状态:', loading.value);
      }
    };
    

    // 组件挂载时加载数据
    onMounted(() => {
      loadData();
    });
    
    // 提取所有连接
    const connections = computed(() => {
      const allConnections: any[] = [];
      
      workflowNodes.value.forEach(node => {
        if (node.connections && node.connections.length > 0) {
          node.connections.forEach((conn: any) => {
            allConnections.push({
              ...conn,
              key: conn.id,
              fromNodeId: node.id,
              fromNodeTitle: node.title,
              toNodeTitle: workflowNodes.value.find(n => n.id === conn.toNodeId)?.title || '未知节点',
            });
          });
        }
      });
      
      return allConnections;
    });
    
    return {
      showAnimation,
      toggleView,
      workflowNodes,
      connections,
      reviewers,
      timePoints,
      loading
    };
  },
});
</script>

<style scoped>
.workflow-animation-page {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 使用视口高度 */
  padding: 16px;
  background-color: #f0f2f5;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  height: 50px; /* 固定头部高度 */
}

.content {
  flex: 1;
  overflow: hidden;
  min-height: calc(100vh - 82px); /* 视口高度减去头部高度和内边距 */
}

.view-container {
  height: 100%; /* 使用父容器的全部高度 */
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.data-container {
  height: 100%; /* 使用父容器的全部高度 */
  overflow: auto;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>