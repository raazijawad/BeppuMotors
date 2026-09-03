import { useEffect, useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';

const SHEET_WIDTH_PX = 794;
const SHEET_HEIGHT_PX = 1123;
const ROW_COUNT = 15;

export default function Ledger({ customer = null, onClose = null }) {
    const sheetRef = useRef(null);
    const [scale, setScale] = useState(0.5);

    useEffect(() => {
        const updateScale = () => {
            const chrome = 110;
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
        const uid = 'lp-' + Date.now();
        el.dataset.printTarget = uid;
        const style = document.createElement('style');
        style.id = 'ledger-print-styles';
        style.textContent = `
            @media print {
                @page { size: A4 portrait; margin: 0; }
                html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; width: 210mm !important; height: 297mm !important; }
                body > *:not([data-print-target="${uid}"]) { display: none !important; }
                [data-print-target="${uid}"] { display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 210mm !important; height: 297mm !important; min-height: 297mm !important; transform: none !important; transform-origin: top left !important; background: white !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important; box-sizing: border-box !important; }
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
        const s = document.getElementById('ledger-print-styles');
        if (s) s.remove();
    };

    const fmtAmt = (n) => {
        const v = parseFloat(n) || 0;
        return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    const saleGroups = [];
    const bySale = new Map();
    for (const inv of customer?.invoices || []) {
        const key = inv.sale_id || inv.date;
        if (!bySale.has(key)) {
            const g = { key, date: inv.date, invoices: [] };
            bySale.set(key, g);
            saleGroups.push(g);
        }
        bySale.get(key).invoices.push(inv);
    }

    const entries = [
        ...saleGroups.map((g) => ({
            id: g.key,
            date: g.date,
            created_at: g.invoices.reduce(
                (max, inv) =>
                    Math.max(
                        max,
                        new Date(inv.created_at || 0).getTime() || 0,
                    ),
                0,
            ),
            bill:
                g.invoices
                    .map((inv) => inv.bill_number)
                    .filter(Boolean)[0] ||
                g.invoices
                    .map((inv) => inv.stock?.name)
                    .filter(Boolean)
                    .join(', ') ||
                'Vehicle Sale',
            plus: g.invoices.reduce(
                (s, inv) => s + (parseFloat(inv.amount) || 0),
                0,
            ),
            minus: null,
        })),
        ...(customer?.incomes || []).map((i) => ({
            id: 'inc-' + i.id,
            date: i.date,
            created_at: new Date(i.created_at || 0).getTime() || 0,
            bill: i.income_name || '',
            plus: null,
            minus: parseFloat(i.amount) || 0,
        })),
        ...(customer?.expenses || []).map((e) => ({
            id: 'exp-' + e.id,
            date: e.date,
            created_at: new Date(e.created_at || 0).getTime() || 0,
            bill: e.expense_name || '',
            plus: parseFloat(e.amount) || 0,
            minus: null,
        })),
    ]
        .sort((a, b) => {
            const da = String(a.date || '');
            const db = String(b.date || '');
            if (da !== db) return da.localeCompare(db);
            const ca = a.created_at || 0;
            const cb = b.created_at || 0;
            if (ca !== cb) return ca - cb;
            return String(a.id).localeCompare(String(b.id));
        })
        .slice(-ROW_COUNT);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center gap-2 overflow-hidden bg-neutral-900/80 p-4 backdrop-blur-sm">
            <div className="no-print flex shrink-0 items-center justify-end">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handlePrint}
                        className="rounded-lg bg-emerald-600 p-1 text-white transition-colors hover:bg-emerald-700"
                        title="Print Ledger"
                    >
                        <Printer size={12} />
                    </button>
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
                        height: '297mm',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}
                >
                    <div className="h-full p-[6mm]">
                        <table
                            className="h-full w-full border-collapse"
                            style={{
                                fontFamily: '"Times New Roman", Times, serif',
                            }}
                        >
                            <thead>
                                <tr className="h-[20mm]">
                                    <th className="w-[25%] border border-black p-0 text-center text-[24px] font-bold">
                                        Date
                                    </th>
                                    <th className="w-[25%] border border-black p-0 text-center text-[24px] font-bold">
                                        Bill Number
                                    </th>
                                    <th className="w-[25%] border border-black p-0 text-center text-[24px] font-bold">
                                        +
                                    </th>
                                    <th className="w-[25%] border border-black p-0 text-center text-[24px] font-bold">
                                        −
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: ROW_COUNT }).map(
                                    (_, i) => {
                                        const e = entries[i];
                                        return (
                                            <tr key={i} className="h-0">
                                                <td className="border border-black p-0 text-center text-[16px] leading-none">
                                                    {e?.date || '\u00A0'}
                                                </td>
                                                <td className="border border-black p-0 text-center text-[16px] leading-none">
                                                    {e?.bill || '\u00A0'}
                                                </td>
                                                <td className="border border-black p-0 text-center text-[16px] leading-none">
                                                    {e?.plus
                                                        ? fmtAmt(e.plus)
                                                        : '\u00A0'}
                                                </td>
                                                <td className="border border-black p-0 text-center text-[16px] leading-none">
                                                    {e?.minus
                                                        ? fmtAmt(e.minus)
                                                        : '\u00A0'}
                                                </td>
                                            </tr>
                                        );
                                    },
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
