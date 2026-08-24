import { useEffect, useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';

const SHEET_WIDTH_PX = 794; // 210mm at 96dpi
const SHEET_HEIGHT_PX = 1123; // 297mm at 96dpi

export default function Invoice({
    showSave = false,
    saving = false,
    onSave = () => {},
    onClose = null,
}) {
    const sheetRef = useRef(null);
    const [scale, setScale] = useState(0.5);

    useEffect(() => {
        const updateScale = () => {
            const chrome = 110; // modal padding + toolbar
            const availH = window.innerHeight - chrome;
            const availW = window.innerWidth - 40;
            const s = Math.min(
                availH / SHEET_HEIGHT_PX,
                availW / SHEET_WIDTH_PX,
                1,
            );
            setScale(Math.max(s, 0.2));
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const handlePrint = (e) => {
        e?.stopPropagation?.();
        const el = sheetRef.current;
        if (!el) return;
        const uid = 'ip-' + Date.now();
        el.dataset.printTarget = uid;
        const style = document.createElement('style');
        style.id = 'invoice-print-styles';
        style.textContent = `
            @media print {
                @page { size: A4 portrait; margin: 0; }
                html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                body > *:not([data-print-target="${uid}"]) { display: none !important; }
                [data-print-target="${uid}"] { display: block !important; position: relative !important; inset: auto !important; background: white !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 auto !important; box-sizing: border-box !important; }
                [data-print-target="${uid}"] .no-print { display: none !important; }
            }
        `;
        document.head.appendChild(style);
        const parent = el.parentNode;
        const placeholder = document.createComment('print-placeholder');
        parent.replaceChild(placeholder, el);
        document.body.appendChild(el);
        window.print();
        document.body.removeChild(el);
        placeholder.parentNode.replaceChild(el, placeholder);
        delete el.dataset.printTarget;
        const s = document.getElementById('invoice-print-styles');
        if (s) s.remove();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center gap-2 overflow-hidden bg-neutral-900/80 p-4 backdrop-blur-sm">
            <div className="no-print flex shrink-0 items-center justify-end">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handlePrint}
                        className="rounded-lg bg-emerald-600 p-1 text-white transition-colors hover:bg-emerald-700"
                        title="Print Invoice"
                    >
                        <Printer size={12} />
                    </button>
                    {showSave && (
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="rounded-lg bg-gradient-to-r from-green-950 via-emerald-900 to-green-900 px-3 py-1 text-xs font-medium text-emerald-100 transition-all duration-300 hover:from-green-800 hover:via-emerald-700 hover:to-green-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Sale'}
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="rounded-lg bg-neutral-700 p-1 text-white transition-colors hover:bg-neutral-600"
                            title="Close"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div
                className="shrink-0"
                style={{
                    width: `${SHEET_WIDTH_PX * scale}px`,
                    height: `${SHEET_HEIGHT_PX * scale}px`,
                }}
            >
                <div
                    ref={sheetRef}
                    className="absolute rounded-sm bg-white shadow-2xl"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {/* Outer frame */}
                    <div className="m-[8mm] min-h-[281mm] border border-black" />
                </div>
            </div>
        </div>
    );
}
