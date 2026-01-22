export interface SlideStructure {
  slide_index: number;
  slide_title: string;
  slide_description: string;
}

export interface Job {
  job_id: string;
  file_path: string;
  created_at: string;
  structure_model?: string;
  structure_input_tokens?: number;
  structure_output_tokens?: number;
  structure_cost?: number;
  total_cost?: number;
}

export interface SlideConfig {
  title: string;
  layout: {
    name: string;
    width: number;
    height: number;
  };
}

export interface ElementProps {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: string;
  valign?: string;
  fill?: { color: string };
  line?: { color: string; width: number };
  [key: string]: any;
}

export interface SlideElement {
  type: 'shape' | 'text' | 'table' | 'chart' | 'image';
  content?: string | any[];
  shapeType?: string;
  props: ElementProps;
  rows?: any[][];
  chartType?: string;
  data?: any[];
}

export interface SlideContent {
  slide_title: string;
  elements: SlideElement[];
}

export interface PPTXConfig {
  slideConfig: SlideConfig;
  slides: { [key: string]: SlideContent };
  font: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface LLMResponse<T = any> {
  result: T;
  usage: TokenUsage;
}