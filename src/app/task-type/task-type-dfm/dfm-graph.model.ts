export type DfmNodeType = 'FACT' | 'LEVEL' | 'DESCRIPTIVE';

export interface DfmNode {
  id: string;
  label: string;
  type: DfmNodeType;
  optional: boolean;
  details: string[];
}

export interface DfmEdge {
  source: string;
  target: string;
  connectionType: string;
  optional: boolean;
}

export interface DfmGraph {
  nodes: DfmNode[];
  edges: DfmEdge[];
}

/**
 * Error that is thrown if the DFM model could not be parsed by the task app.
 */
export class DfmParseError extends Error {
  constructor(message: string,
              readonly line: number | null = null,
              readonly column: number | null = null) {
    super(message);
    this.name = 'DfmParseError';
  }
}
