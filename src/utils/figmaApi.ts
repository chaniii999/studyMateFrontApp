import config from '../../figma-config.json';
import axios from 'axios';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundColor?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  cornerRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  layoutMode?: 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: 'CENTER' | 'SPACE_BETWEEN' | 'SPACE_AROUND' | 'SPACE_EVENLY';
  counterAxisAlignItems?: 'CENTER' | 'FLEX_START' | 'FLEX_END';
  characters?: string;
  style?: {
    fontSize?: number;
    fontWeight?: string;
    textAlignHorizontal?: string;
    fills?: Array<{
      color: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    }>;
  };
  imageRef?: string;
}

interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
}

class FigmaAPI {
  private apiKey: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor() {
    this.apiKey = process.env.FIGMA_API_KEY || config.figmaApiKey || '';
    
    if (!this.apiKey) {
      console.warn('Figma API 키가 설정되지 않았습니다. 환경 변수 FIGMA_API_KEY를 설정하거나 figma-config.json에 추가하세요.');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Figma API 키가 설정되지 않았습니다.');
    }

    const response = await axios.get(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Figma API 요청 실패: ${response.status} ${response.statusText}`);
    }

    return response.data;
  }

  /**
   * Figma 파일 정보를 가져옵니다
   */
  async getFile(fileId: string): Promise<FigmaFile> {
    return this.makeRequest(`/files/${fileId}`);
  }

  /**
   * 특정 노드의 정보를 가져옵니다
   */
  async getNode(fileId: string, nodeId: string): Promise<any> {
    return this.makeRequest(`/files/${fileId}/nodes?ids=${nodeId}`);
  }

  /**
   * 이미지를 내보냅니다
   */
  async exportImages(fileId: string, nodeIds: string[], format: string = 'png', scale: number = 1): Promise<any> {
    const ids = nodeIds.join(',');
    return this.makeRequest(`/images/${fileId}?ids=${ids}&format=${format}&scale=${scale}`);
  }

  /**
   * 파일의 모든 컴포넌트를 가져옵니다
   */
  async getFileComponents(fileId: string): Promise<any> {
    return this.makeRequest(`/files/${fileId}/components`);
  }

  /**
   * 팀의 프로젝트 목록을 가져옵니다
   */
  async getTeamProjects(teamId: string): Promise<any> {
    return this.makeRequest(`/teams/${teamId}/projects`);
  }

  /**
   * 프로젝트의 파일 목록을 가져옵니다
   */
  async getProjectFiles(projectId: string): Promise<any> {
    return this.makeRequest(`/projects/${projectId}/files`);
  }

  /**
   * 사용자 정보를 가져옵니다
   */
  async getMe(): Promise<any> {
    return this.makeRequest('/me');
  }

  /**
   * 노드 트리를 재귀적으로 탐색합니다
   */
  traverseNodes(node: FigmaNode, callback: (node: FigmaNode, depth: number) => void, depth: number = 0): void {
    callback(node, depth);
    
    if (node.children) {
      node.children.forEach(child => {
        this.traverseNodes(child, callback, depth + 1);
      });
    }
  }

  /**
   * 특정 타입의 노드들을 찾습니다
   */
  findNodesByType(node: FigmaNode, type: string): FigmaNode[] {
    const results: FigmaNode[] = [];
    
    this.traverseNodes(node, (currentNode) => {
      if (currentNode.type === type) {
        results.push(currentNode);
      }
    });
    
    return results;
  }
}

// 싱글톤 인스턴스 생성
export const figmaAPI = new FigmaAPI();

// 타입 정의 내보내기
export type { FigmaNode, FigmaFile }; 