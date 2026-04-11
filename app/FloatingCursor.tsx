type FloatingCursorProps = {
  x: number;
  y: number;
  label?: string;
};

export default function FloatingCursor({
  x,
  y,
  label = '다른 사용자',
}: FloatingCursorProps) {
  console.log(x, y);
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-2px, -2px)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 20,
          height: 20,
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '3px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '14px solid #3b82f6',
            transform: 'rotate(-45deg)',
            transformOrigin: 'top left',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 2,
          marginLeft: 12,
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: 9999,
          background: '#3b82f6',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {label}
      </div>
    </div>
  );
}
