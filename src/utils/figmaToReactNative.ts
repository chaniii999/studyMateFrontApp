import { FigmaNode } from './figmaApi';

interface StyleProperties {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  textAlign?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
}

interface ConvertedComponent {
  name: string;
  component: string;
  styles: StyleProperties;
  children?: ConvertedComponent[];
}

class FigmaToReactNativeConverter {
  /**
   * Figma 색상을 React Native 색상으로 변환
   */
  private convertColor(figmaColor: any): string {
    if (!figmaColor) return 'transparent';
    
    const { r, g, b, a = 1 } = figmaColor;
    const red = Math.round(r * 255);
    const green = Math.round(g * 255);
    const blue = Math.round(b * 255);
    
    if (a === 1) {
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      return `rgba(${red}, ${green}, ${blue}, ${a})`;
    }
  }

  /**
   * Figma 스타일을 React Native 스타일로 변환
   */
  private convertStyles(node: FigmaNode): StyleProperties {
    const styles: StyleProperties = {};

    // 기본 크기 설정
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;
      styles.width = width;
      styles.height = height;
    }

    // 배경색 설정
    if (node.backgroundColor) {
      styles.backgroundColor = this.convertColor(node.backgroundColor);
    }

    // 테두리 반경 설정
    if (node.cornerRadius) {
      styles.borderRadius = node.cornerRadius;
    }

    // 패딩 설정
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const padding = Math.max(
        node.paddingLeft || 0,
        node.paddingRight || 0,
        node.paddingTop || 0,
        node.paddingBottom || 0
      );
      if (padding > 0) {
        styles.padding = padding;
      }
    }

    // Flexbox 설정
    if (node.layoutMode) {
      styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
      
      if (node.primaryAxisAlignItems) {
        switch (node.primaryAxisAlignItems) {
          case 'CENTER':
            styles.justifyContent = 'center';
            break;
          case 'SPACE_BETWEEN':
            styles.justifyContent = 'space-between';
            break;
          case 'SPACE_AROUND':
            styles.justifyContent = 'space-around';
            break;
          case 'SPACE_EVENLY':
            styles.justifyContent = 'space-evenly';
            break;
        }
      }

      if (node.counterAxisAlignItems) {
        switch (node.counterAxisAlignItems) {
          case 'CENTER':
            styles.alignItems = 'center';
            break;
          case 'FLEX_START':
            styles.alignItems = 'flex-start';
            break;
          case 'FLEX_END':
            styles.alignItems = 'flex-end';
            break;
        }
      }
    }

    return styles;
  }

  /**
   * 텍스트 노드를 React Native Text 컴포넌트로 변환
   */
  private convertTextNode(node: FigmaNode): ConvertedComponent {
    const styles = this.convertStyles(node);
    
    // 텍스트 스타일 추가
    if (node.style) {
      if (node.style.fontSize) {
        styles.fontSize = node.style.fontSize;
      }
      if (node.style.fontWeight) {
        styles.fontWeight = node.style.fontWeight;
      }
      if (node.style.textAlignHorizontal) {
        styles.textAlign = node.style.textAlignHorizontal.toLowerCase();
      }
      if (node.style.fills && node.style.fills.length > 0) {
        styles.color = this.convertColor(node.style.fills[0].color);
      }
    }

    return {
      name: this.generateComponentName(node.name),
      component: 'Text',
      styles,
      children: node.characters ? [{ name: 'text', component: 'string', styles: {}, text: node.characters }] : undefined
    };
  }

  /**
   * 이미지 노드를 React Native Image 컴포넌트로 변환
   */
  private convertImageNode(node: FigmaNode): ConvertedComponent {
    const styles = this.convertStyles(node);
    
    return {
      name: this.generateComponentName(node.name),
      component: 'Image',
      styles,
      children: [{ name: 'source', component: 'string', styles: {}, uri: node.imageRef || '' }]
    };
  }

  /**
   * 컨테이너 노드를 React Native View 컴포넌트로 변환
   */
  private convertContainerNode(node: FigmaNode): ConvertedComponent {
    const styles = this.convertStyles(node);
    
    return {
      name: this.generateComponentName(node.name),
      component: 'View',
      styles,
      children: node.children ? node.children.map(child => this.convertNode(child)).filter(Boolean) : undefined
    };
  }

  /**
   * 노드 타입에 따라 적절한 변환 함수 호출
   */
  private convertNode(node: FigmaNode): ConvertedComponent | null {
    switch (node.type) {
      case 'TEXT':
        return this.convertTextNode(node);
      case 'RECTANGLE':
      case 'ELLIPSE':
      case 'POLYGON':
        return this.convertImageNode(node);
      case 'FRAME':
      case 'GROUP':
      case 'INSTANCE':
      case 'COMPONENT':
        return this.convertContainerNode(node);
      default:
        console.warn(`지원하지 않는 노드 타입: ${node.type}`);
        return null;
    }
  }

  /**
   * 컴포넌트 이름 생성
   */
  private generateComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '')
      .replace(/^./, (str) => str.toUpperCase());
  }

  /**
   * React Native 컴포넌트 코드 생성
   */
  private generateComponentCode(converted: ConvertedComponent, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const styleName = `${converted.name}Style`;
    
    let code = '';
    
    // 스타일 객체 생성
    if (Object.keys(converted.styles).length > 0) {
      code += `${indent}const ${styleName} = StyleSheet.create({\n`;
      code += `${indent}  container: {\n`;
      Object.entries(converted.styles).forEach(([key, value]) => {
        code += `${indent}    ${key}: ${typeof value === 'string' ? `'${value}'` : value},\n`;
      });
      code += `${indent}  },\n`;
      code += `${indent}});\n\n`;
    }

    // 컴포넌트 생성
    code += `${indent}const ${converted.name} = () => {\n`;
    code += `${indent}  return (\n`;
    
    if (converted.component === 'Text') {
      code += `${indent}    <Text style={${styleName}.container}>\n`;
      if (converted.children && converted.children[0]?.text) {
        code += `${indent}      ${converted.children[0].text}\n`;
      }
      code += `${indent}    </Text>\n`;
    } else if (converted.component === 'Image') {
      code += `${indent}    <Image\n`;
      code += `${indent}      style={${styleName}.container}\n`;
      if (converted.children && converted.children[0]?.uri) {
        code += `${indent}      source={{ uri: '${converted.children[0].uri}' }}\n`;
      }
      code += `${indent}    />\n`;
    } else {
      code += `${indent}    <View style={${styleName}.container}>\n`;
      if (converted.children) {
        converted.children.forEach(child => {
          if (child.component !== 'string') {
            code += this.generateComponentCode(child, depth + 1);
          }
        });
      }
      code += `${indent}    </View>\n`;
    }
    
    code += `${indent}  );\n`;
    code += `${indent}};\n\n`;
    
    return code;
  }

  /**
   * Figma 노드를 React Native 컴포넌트로 변환
   */
  convertToReactNative(node: FigmaNode): string {
    const converted = this.convertNode(node);
    if (!converted) {
      throw new Error('노드를 변환할 수 없습니다.');
    }

    let code = 'import React from "react";\n';
    code += 'import { View, Text, Image, StyleSheet } from "react-native";\n\n';
    
    code += this.generateComponentCode(converted);
    
    code += 'export default ' + converted.name + ';\n';
    
    return code;
  }

  /**
   * 여러 노드를 하나의 컴포넌트로 변환
   */
  convertMultipleNodes(nodes: FigmaNode[]): string {
    let code = 'import React from "react";\n';
    code += 'import { View, Text, Image, StyleSheet } from "react-native";\n\n';
    
    const convertedNodes = nodes.map(node => this.convertNode(node)).filter(Boolean);
    
    convertedNodes.forEach(converted => {
      if (converted) {
        code += this.generateComponentCode(converted);
      }
    });
    
    // 메인 컴포넌트 생성
    code += 'const MainComponent = () => {\n';
    code += '  return (\n';
    code += '    <View style={styles.container}>\n';
    convertedNodes.forEach(converted => {
      if (converted) {
        code += `      <${converted.name} />\n`;
      }
    });
    code += '    </View>\n';
    code += '  );\n';
    code += '};\n\n';
    
    code += 'const styles = StyleSheet.create({\n';
    code += '  container: {\n';
    code += '    flex: 1,\n';
    code += '  },\n';
    code += '});\n\n';
    
    code += 'export default MainComponent;\n';
    
    return code;
  }
}

export const figmaConverter = new FigmaToReactNativeConverter(); 