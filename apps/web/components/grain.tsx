'use client';

import { useEffect } from 'react';
import { criarGrao } from './hero/motion/grao';

/** Um grão de filme só, por cima do site inteiro. */
export function Grain() {
  useEffect(() => criarGrao(), []);
  return null;
}
