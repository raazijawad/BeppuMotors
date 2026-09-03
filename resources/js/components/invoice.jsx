import { useEffect, useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';

const SHEET_WIDTH_PX = 794; // 210mm at 96dpi
const SHEET_HEIGHT_PX = 1123; // 297mm at 96dpi

export default function Invoice({
    lines = [],
    customer = null,
    invoiceNo = '',
    date = '',
    showSave = false,
    saving = false,
    onSave = () => {},
    onClose = null,
    onAmountChange = null,
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
        const s = document.getElementById('invoice-print-styles');
        if (s) s.remove();
    };

    const total = (lines || []).reduce(
        (sum, l) => sum + (parseFloat(l.amount) || 0),
        0,
    );
    const fmtYen = (n) =>
        '¥' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    const fmtDate = (d) => {
        if (!d) return '';
        const [y, m, day] = String(d).slice(0, 10).split('-');
        if (!y || !m || !day) return d;
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
    };
    const editable = typeof onAmountChange === 'function';

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
                    <div className="m-[5mm] min-h-[287mm] border border-black p-[6mm]">
                        <div className="relative flex min-h-[40mm] items-center justify-center">
                            <img
                                src="/beppumotors%20logo.jpeg"
                                alt="Beppu Motors"
                                className="absolute top-0 left-0 h-[45mm] w-auto object-contain mix-blend-multiply"
                            />
                            <div className="flex flex-col items-center">
                                <h1
                                    className="text-[55px] font-bold"
                                    style={{
                                        fontFamily: 'Georgia, serif',
                                        transform:
                                            'translateY(3mm) scaleX(0.75)',
                                    }}
                                >
                                    Beppu Motors
                                </h1>
                                <p
                                    className="mt-[2mm] text-center text-[16px] italic"
                                    style={{
                                        transform:
                                            'translateY(0mm) scaleX(0.75)',
                                    }}
                                >
                                    Exports And Dealers in Motor Vehicles,
                                    <br />
                                    Machineries &amp; Spare Parts
                                </p>
                            </div>
                            <div className="absolute top-[2mm] right-0 text-left text-[14px] leading-snug">
                                <p className="text-[16px] font-black font-bold">
                                    Beppu Motors Co.Ltd.
                                </p>
                                <br />
                                <p>874-0004</p>
                                <p>Oita-Ken,Beppu Shi</p>
                                <p>Oazo Noda 1015-1 Japan</p>
                                <br />
                                <p className="mt-[1mm]">TEL0977-76-7035</p>
                                <p>FAX0977-76-7036</p>
                            </div>
                        </div>
                        <hr
                            className="mt-[5mm] border-black"
                            style={{ borderWidth: '1px' }}
                        />
                        <h2
                            className="mt-[1mm] text-center text-[28px] font-bold"
                            style={{ fontFamily: 'Georgia, serif' }}
                        >
                            INVOICE
                        </h2>
                        <div className="relative">
                            <p
                                className="ml-10 text-center text-[26px] text-blue-800"
                                style={{ letterSpacing: '0.8em' }}
                            >
                                請求書（控）
                            </p>
                            <div
                                className="absolute top-[-4mm] right-[2mm] flex flex-col items-center justify-center rounded-md border-[2px] border-red-600 text-center"
                                style={{ width: '30mm', height: '30mm' }}
                            >
                                <p
                                    className="mt-[-1mm] text-[32px] font-medium text-red-600"
                                    style={{
                                        fontFamily: 'serif',
                                        letterSpacing: '0.3em',
                                    }}
                                >
                                    別府
                                </p>
                                <p
                                    className="mt-[-4mm] text-[28px] font-bold text-red-600"
                                    style={{
                                        fontFamily: 'serif',
                                        letterSpacing: '0em',
                                        whiteSpace: 'nowrap',
                                        transform: 'scaleX(0.7)',
                                    }}
                                >
                                    モータース
                                </p>
                                <p
                                    className="mt-[-4mm] text-[29px] font-bold text-red-600"
                                    style={{
                                        fontFamily: 'serif',
                                        letterSpacing: '0.1em',
                                        whiteSpace: 'nowrap',
                                        transform: 'scaleX(0.8)',
                                    }}
                                >
                                    株式会社
                                </p>
                            </div>
                            <div className="absolute top-[15mm] left-0">
                                <p
                                    className="text-[16px] font-light"
                                    style={{ fontFamily: 'Georgia, serif' }}
                                >
                                    To,
                                </p>
                                <p
                                    className="mt-2 text-[20px] font-bold"
                                    style={{
                                        fontFamily: 'Georgia, serif',
                                        borderBottom: '1px solid black',
                                        display: 'inline-block',
                                    }}
                                >
                                    {customer?.name || ''}
                                </p>
                                <p
                                    className="mt-[2mm] text-[14px]"
                                    style={{ fontFamily: 'Georgia, serif' }}
                                >
                                    Thank you very much for your business with
                                    us.
                                    <br />
                                    We are pleased to submit our
                                    <br />
                                    invoice as follows:
                                </p>
                                <table
                                    className="mt-[3mm] w-[192mm] border-collapse"
                                    style={{
                                        fontFamily:
                                            '"Times New Roman", Times, serif',
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th className="border border-black p-[1mm] text-center text-[14px] font-bold">
                                                No
                                            </th>
                                            <th className="border border-black p-[1mm] text-center text-[14px] font-bold">
                                                Vehicle Name
                                            </th>
                                            <th className="border border-black p-[1mm] text-center text-[14px] font-bold">
                                                Chassis No.
                                            </th>
                                            <th className="border border-black p-[1mm] text-center text-[14px] font-bold">
                                                Amount (¥)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((v, idx) => (
                                            <tr key={v.id ?? idx}>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    {idx + 1}
                                                </td>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    {v.name}
                                                </td>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    {v.chassisnumber}
                                                </td>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    {editable ? (
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={v.amount}
                                                            onChange={(e) =>
                                                                onAmountChange(
                                                                    v.id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-[60mm] bg-transparent text-center text-[20px] leading-none focus:outline-none"
                                                        />
                                                    ) : parseFloat(v.amount) ? (
                                                        fmtYen(
                                                            parseFloat(
                                                                v.amount,
                                                            ),
                                                        )
                                                    ) : (
                                                        '\u00A0'
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {Array.from({
                                            length: Math.max(
                                                0,
                                                11 - lines.length,
                                            ),
                                        }).map((_, i) => (
                                            <tr key={`empty-${i}`}>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    &nbsp;
                                                </td>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    &nbsp;
                                                </td>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    &nbsp;
                                                </td>
                                                <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                    &nbsp;
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="border-y border-l border-black p-[2mm] text-right text-[15px] font-bold"
                                            >
                                                &nbsp;TOTAL AMOUNT
                                            </td>
                                            <td className="relative border-y border-r border-black p-[2mm] text-center text-[15px] font-bold">
                                                {fmtYen(total)}
                                                <div
                                                    className="absolute top-0 bottom-0"
                                                    style={{
                                                        left: '12mm',
                                                        borderLeft:
                                                            '1px solid black',
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table
                                    className="mt-[4mm] w-[192mm] border-collapse"
                                    style={{
                                        fontFamily:
                                            '"Times New Roman", Times, serif',
                                    }}
                                >
                                    <tbody>
                                        <tr>
                                            <td
                                                className="border border-black p-[2mm] pl-[5mm] text-[20px] font-medium"
                                                style={{ width: '150mm' }}
                                            >
                                                1. &nbsp;10% of Total amount
                                            </td>
                                            <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                {fmtYen(total * 0.1)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td
                                                className="border border-black p-[2mm] pl-[5mm] text-[20px] font-medium"
                                                style={{ width: '150mm' }}
                                            >
                                                2. &nbsp;Amount After Text
                                                Deduction (Total -10%)
                                            </td>
                                            <td className="border border-black p-[2mm] text-center text-[20px] leading-none">
                                                {fmtYen(total * 0.9)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td
                                                className="border border-black p-[2mm] pl-[5mm] text-[20px] font-bold"
                                                style={{ width: '150mm' }}
                                            >
                                                3. &nbsp;Final Total Amount
                                            </td>
                                            <td className="border border-black p-[2mm] text-center text-[20px] font-bold">
                                                {fmtYen(total)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="absolute top-[23mm] left-[100mm] text-left">
                                <p
                                    className="text-[16px]"
                                    style={{
                                        fontFamily:
                                            '"Times New Roman", Times, serif',
                                    }}
                                >
                                    Date : {fmtDate(date)}
                                </p>
                                <p
                                    className="text-[16px]"
                                    style={{
                                        fontFamily:
                                            '"Times New Roman", Times, serif',
                                    }}
                                >
                                    Invoice No. : T8320001016146
                                </p>
                                <p
                                    className="text-[16px]"
                                    style={{
                                        fontFamily:
                                            '"Times New Roman", Times, serif',
                                    }}
                                >
                                    Bill No. : {invoiceNo || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
