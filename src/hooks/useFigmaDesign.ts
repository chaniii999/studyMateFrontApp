import { useState, useEffect, useCallback } from 'react';
import { figmaAPI, FigmaNode } from '../utils/figmaApi';
import { figmaConverter } from '../utils/figmaToReactNative';

interface UseFigmaDesignOptions {
  fileId: string;
  nodeId?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

interface UseFigmaDesignReturn {
  // 데이터
  file: any;
  node: FigmaNode | null;
  components: any[];
  isLoading: boolean;
  error: string | null;
  
  // 액션
  fetchFile: () => Promise<void>;
  fetchNode: (nodeId: string) => Promise<void>;
  exportImages: (nodeIds: string[], format?: string, scale?: number) => Promise<any>;
  convertToReactNative: (nodeId?: string) => string;
  
  // 상태
  lastSync: Date | null;
  isConnected: boolean;
}

export const useFigmaDesign = ({
  fileId,
  nodeId,
  autoSync = false,
  syncInterval = 30000, // 30초
}: UseFigmaDesignOptions): UseFigmaDesignReturn => {
  const [file, setFile] = useState<any>(null);
  const [node, setNode] = useState<FigmaNode | null>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Figma 파일 가져오기
  const fetchFile = useCallback(async () => {
    if (!fileId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fileData = await figmaAPI.getFile(fileId);
      setFile(fileData);
      setLastSync(new Date());
      setIsConnected(true);
      
      // 컴포넌트 목록 가져오기
      const componentsData = await figmaAPI.getFileComponents(fileId);
      setComponents(componentsData.meta?.components || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일을 가져오는 중 오류가 발생했습니다.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  // 특정 노드 가져오기
  const fetchNode = useCallback(async (targetNodeId: string) => {
    if (!fileId || !targetNodeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const nodeData = await figmaAPI.getNode(fileId, targetNodeId);
      const nodeInfo = nodeData.nodes[targetNodeId];
      
      if (nodeInfo) {
        setNode(nodeInfo.document);
      } else {
        setError('노드를 찾을 수 없습니다.');
      }
      
      setLastSync(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '노드를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  // 이미지 내보내기
  const exportImages = useCallback(async (
    nodeIds: string[], 
    format: string = 'png', 
    scale: number = 1
  ) => {
    if (!fileId || nodeIds.length === 0) return null;
    
    try {
      const result = await figmaAPI.exportImages(fileId, nodeIds, format, scale);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 내보내기 중 오류가 발생했습니다.');
      return null;
    }
  }, [fileId]);

  // React Native 컴포넌트로 변환
  const convertToReactNative = useCallback((targetNodeId?: string) => {
    try {
      const targetNode = targetNodeId ? 
        figmaAPI.findNodesByType(file?.document, targetNodeId)[0] : 
        node;
      
      if (!targetNode) {
        throw new Error('변환할 노드를 찾을 수 없습니다.');
      }
      
      return figmaConverter.convertToReactNative(targetNode);
    } catch (err) {
      setError(err instanceof Error ? err.message : '컴포넌트 변환 중 오류가 발생했습니다.');
      return '';
    }
  }, [file, node]);

  // 자동 동기화 설정
  useEffect(() => {
    if (!autoSync || !fileId) return;
    
    // 초기 로드
    fetchFile();
    
    // 주기적 동기화
    const interval = setInterval(fetchFile, syncInterval);
    
    return () => clearInterval(interval);
  }, [autoSync, fileId, syncInterval, fetchFile]);

  // 특정 노드 로드
  useEffect(() => {
    if (nodeId && fileId) {
      fetchNode(nodeId);
    }
  }, [nodeId, fileId, fetchNode]);

  // 연결 상태 확인
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await figmaAPI.getMe();
        setIsConnected(true);
      } catch (err) {
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  return {
    // 데이터
    file,
    node,
    components,
    isLoading,
    error,
    
    // 액션
    fetchFile,
    fetchNode,
    exportImages,
    convertToReactNative,
    
    // 상태
    lastSync,
    isConnected,
  };
}; 