import { useEffect, useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

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
            const chrome = 130; // modal padding + toolbar
            const availH = window.innerHeight - chrome;
            const availW = window.innerWidth - 40;
            const s =
                Math.min(availH / SHEET_HEIGHT_PX, availW / SHEET_WIDTH_PX, 1) *
                0.85;
            setScale(Math.max(s, 0.2));
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const handleGeneratePdf = async (e) => {
        e?.stopPropagation?.();
        const el = sheetRef.current;
        if (!el) return;

        const clone = el.cloneNode(true);
        const srcInputs = el.querySelectorAll('input');
        const cloneInputs = clone.querySelectorAll('input');
        srcInputs.forEach((input, i) => {
            if (cloneInputs[i]) cloneInputs[i].value = input.value;
        });
        Object.assign(clone.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '-1',
            transform: 'none',
            transformOrigin: 'top left',
            margin: '0',
        });
        document.body.appendChild(clone);
        try {
            const canvas = await html2canvas(clone, {
                scale: 2,
                width: SHEET_WIDTH_PX,
                height: SHEET_HEIGHT_PX,
                windowWidth: 1280,
                windowHeight: 1280,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');

            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 0;
            const usableWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * usableWidth) / canvas.width;
            const contentHeight = pageHeight - margin * 2;

            doc.addImage(
                imgData,
                'PNG',
                margin,
                margin,
                usableWidth,
                imgHeight,
            );

            let remaining = imgHeight - contentHeight;
            let offset = margin;
            while (remaining > 1) {
                offset -= contentHeight;
                doc.addPage();
                doc.addImage(
                    imgData,
                    'PNG',
                    margin,
                    offset,
                    usableWidth,
                    imgHeight,
                );
                remaining -= contentHeight;
            }

            const safeNo = String(invoiceNo || '')
                .trim()
                .replace(/[^\w-]+/g, '_');
            doc.save(safeNo ? `invoice-${safeNo}.pdf` : 'invoice.pdf');
        } finally {
            clone.remove();
        }
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
        <div className="fixed inset-0 z-50 flex flex-col items-center gap-2 overflow-hidden bg-neutral-900/80 px-4 pt-[8vh] pb-4 backdrop-blur-sm">
            <div className="no-print flex shrink-0 items-center justify-end">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleGeneratePdf}
                        className="rounded-lg bg-emerald-600 p-1 text-white transition-colors hover:bg-emerald-700"
                        title="Download PDF"
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
                                    className="mt-[-1mm] text-[32px] font-bold text-red-600"
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
                                    className="mt-[-4mm] text-[29px] font-black text-red-600"
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
                                                colSpan={4}
                                                className="border border-black text-[15px] font-bold"
                                            >
                                                <div className="flex items-stretch">
                                                    <div className="flex-1 py-[2mm] pr-[2mm] text-right">
                                                        &nbsp;TOTAL AMOUNT
                                                    </div>
                                                    <div className="relative w-[64mm] shrink-0 py-[2mm] text-center">
                                                        {fmtYen(total)}
                                                        <div
                                                            className="absolute top-0 bottom-0"
                                                            style={{
                                                                left: '12mm',
                                                                borderLeft:
                                                                    '1px solid black',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
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
