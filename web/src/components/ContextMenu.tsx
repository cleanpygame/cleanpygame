import React, {useEffect} from 'react';

export type ContextMenuProps = {
    options: { id: string; label: string; correct: boolean }[];
    position?: { x: number; y: number };
    onSelect: (optionId: string) => void;
    onClose: () => void;
};

export function ContextMenu({options, position, onSelect, onClose}: ContextMenuProps): React.ReactElement {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Close when clicking outside
        if ((e.target as HTMLElement).dataset?.backdrop) onClose();
    };

    const style: React.CSSProperties = position
        ? {position: 'absolute', left: position.x, top: position.y}
        : {position: 'absolute', right: 24, top: 24};

    return (
        <div
            data-backdrop
            onClick={handleBackdropClick}
            style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)'}}
        >
            <div style={{
                ...style,
                background: '#252526',
                border: '1px solid #3c3c3c',
                borderRadius: 4,
                minWidth: 220,
                zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }}>
                <div
                    style={{padding: '8px 12px', color: '#848484'}}
                >Choose your action:
                </div>
                {options.map(opt => (
                    <div
                        key={opt.id}
                        onClick={() => onSelect(opt.id)}
                        className="hover:bg-[#37373d]"
                        style={{padding: '8px 12px', cursor: 'pointer', color: '#d4d4d4', userSelect: 'none'}}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {opt.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
