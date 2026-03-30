import type { Move } from './types';

export enum NodeType {
  EXACT = 0,
  ALPHA = 1,
  BETA = 2,
}

export interface TranspositionEntry {
  hash: bigint;
  depth: number;
  score: number;
  nodeType: NodeType;
  bestMove: Move | null;
}

export class TranspositionTable {
  private table: Map<string, TranspositionEntry>;
  private maxSize: number;

  constructor(maxSize: number = 1000000) {
    this.table = new Map();
    this.maxSize = maxSize;
  }

  public store(
    hash: bigint,
    depth: number,
    score: number,
    nodeType: NodeType,
    bestMove: Move | null
  ): void {
    const key = hash.toString();

    if (this.table.size >= this.maxSize) {
      const firstKey = this.table.keys().next().value;
      this.table.delete(firstKey);
    }

    this.table.set(key, {
      hash,
      depth,
      score,
      nodeType,
      bestMove,
    });
  }

  public probe(hash: bigint, depth: number): TranspositionEntry | null {
    const key = hash.toString();
    const entry = this.table.get(key);

    if (!entry) {
      return null;
    }

    if (entry.hash !== hash || entry.depth < depth) {
      return null;
    }

    return entry;
  }

  public clear(): void {
    this.table.clear();
  }

  public size(): number {
    return this.table.size;
  }
}
