import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  style,
  className = '',
}) => {
  return (
    <div
      className={`ep-skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
    />
  );
};

export const SkeletonStatCards: React.FC<{ count?: number; columns?: number }> = ({
  count = 4,
  columns,
}) => {
  const cols = columns || count;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '12px',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #ECECEC',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="45%" height="12px" />
            <Skeleton width="20%" height="12px" borderRadius="10px" />
          </div>
          <Skeleton width="60%" height="24px" style={{ marginTop: '4px' }} />
          <Skeleton width="35%" height="10px" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #ECECEC',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Skeleton width="60%" height="18px" />
          <Skeleton width="90%" height="12px" />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width="140px" height="32px" borderRadius="6px" />
          <Skeleton width="100px" height="32px" borderRadius="6px" />
        </div>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            padding: '12px 0',
            borderBottom: '1px solid #F1F5F9',
            gap: '12px',
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width="70%" height="12px" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              padding: '16px 0',
              borderBottom: r === rows - 1 ? 'none' : '1px solid #F8FAFC',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                width={c === 0 ? '80%' : c === columns - 1 ? '50%' : '60%'}
                height={c === 0 ? '16px' : '14px'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

