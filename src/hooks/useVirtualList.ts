import { useRef, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface UseVirtualListOptions<T> {
  items: T[];
  estimateSize: number;
  overscan?: number;
}

export function useVirtualList<T>({
  items,
  estimateSize,
  overscan = 5,
}: UseVirtualListOptions<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  const getVirtualItem = useCallback(
    (index: number) => items[index],
    [items]
  );

  const paddingTop = useMemo(
    () => (virtualItems.length > 0 ? virtualItems[0].start : 0),
    [virtualItems]
  );

  const paddingBottom = useMemo(
    () =>
      virtualItems.length > 0
        ? totalSize - virtualItems[virtualItems.length - 1].end
        : 0,
    [virtualItems, totalSize]
  );

  return {
    parentRef,
    virtualItems,
    totalSize,
    getVirtualItem,
    paddingTop,
    paddingBottom,
    virtualizer,
  };
}
