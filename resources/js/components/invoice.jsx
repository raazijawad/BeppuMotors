import { useRef, useState } from 'react';
import { X, Plus, Trash2, Printer } from 'lucide-react';

export default function Invoice({ customer, lines = [], invoiceNo = '', date = '', showSave = false, saving = false, onSave = () => {}, onClose = null, onAmountChange = () => {}, onRemove = null, stocks = [], onAddVehicle = null }) {
    const ROW_COUNT = 8;
    const invoiceRef = useRef(null);
    const [showAddRow, setShowAddRow] = useState(false);
    const [discount, setDiscount] = useState('');

    const splitAmount = (amount) => {
        const a = parseFloat(amount) || 0;
        return { rs: Math.floor(a), cts: Math.round((a - Math.floor(a)) * 100).toString().padStart(2, '0') };
    };
    const subTotal = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
    const netTotal = subTotal - (parseFloat(discount) || 0);
    const rows = Array.from({ length: Math.max(ROW_COUNT, lines.length) }, (_, i) => lines[i] || null);
    const availableStocks = (stocks || []).filter((s) => !lines.some((l) => l.id === s.id));
    const dateParts = (date || '').split('-');

    const handlePrint = (e) => {
        e?.stopPropagation?.();
        const el = invoiceRef.current;
        if (!el) return;
        const uid = 'ip-' + Date.now();
        el.dataset.printTarget = uid;
        const style = document.createElement('style');
        style.id = 'invoice-print-styles';
        style.textContent = `
            @media print {
                @page { size: A5 portrait; margin: 0; }
                html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                body > *:not([data-print-target="${uid}"]) { display: none !important; }
                [data-print-target="${uid}"] { display: block !important; position: relative !important; inset: auto !important; background: white !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 auto !important; width: 148mm !important; box-sizing: border-box !important; }
                [data-print-target="${uid}"] .no-print { display: none !important; }
            }
        `;
        document.head.appendChild(style);
        const parent = el.parentNode;
        const placeholder = document.createComment('print-placeholder');
        parent.replaceChild(placeholder, el);
        document.body.appendChild(el);
        el.style.setProperty('display', 'block', 'important');
        window.print();
        document.body.removeChild(el);
        placeholder.parentNode.replaceChild(el, placeholder);
        el.style.removeProperty('display');
        delete el.dataset.printTarget;
        const s = document.getElementById('invoice-print-styles');
        if (s) s.remove();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-900/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[560px]">
                <div className="mb-1 flex items-center justify-between no-print">
                    <h2 className="text-sm font-bold text-white">New Sales Invoice</h2>
                    <div className="flex items-center gap-1.5">
                        <button onClick={handlePrint} className="rounded-lg bg-emerald-600 p-1 text-white transition-colors hover:bg-emerald-700" title="Print Invoice">
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
                            <button onClick={onClose} className="rounded-lg bg-neutral-700 p-1 text-white transition-colors hover:bg-neutral-600" title="Close">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow-2xl" ref={invoiceRef}>
                    <div className="p-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-900 to-blue-700">
                                    <span className="text-xs font-bold text-white">B</span>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-neutral-900">BEPPU MOTORS</h3>
                                    <p className="text-[7px] italic text-blue-900">Motor Vehicle Sales &amp; Service</p>
                                </div>
                            </div>
                            <div className="text-right text-[6px] leading-tight">
                                <p className="font-semibold text-neutral-700">CUSTOMER COPY</p>
                                <p>INVOICE NO: {invoiceNo}</p>
                                <p>DATE: {date}</p>
                            </div>
                        </div>

                        <p className="mb-1 text-[6px] leading-tight text-neutral-600">New &amp; Used Motor Vehicle Sales, Imports, Exports &amp; Service</p>

                        <div className="mb-1.5 flex items-center gap-1">
                            <div className="flex-1 rounded bg-[#1a237e] px-1.5 py-0.5 text-[6px] text-white">
                                <span>BEPPU MOTORS - VEHICLE SALES &amp; SERVICE</span>
                            </div>
                            <div className="flex-1 text-right text-[6px] leading-tight text-neutral-600">
                                <p>Vehicle Sale Invoice</p>
                                <p>INVOICE NO: {invoiceNo}</p>
                            </div>
                        </div>

                        <div className="mb-1 flex gap-2 text-xs">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-1">
                                    <span className="whitespace-nowrap text-[10px] font-semibold text-neutral-700">Name<span className="ml-0.5 text-red-500">*</span></span>
                                    <input type="text" value={customer?.name || ''} readOnly className="w-full border-b border-neutral-400 px-0.5 py-0 text-[15px] outline-none focus:border-blue-900" placeholder="........" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="whitespace-nowrap text-[10px] font-semibold text-neutral-700">Address<span className="ml-0.5 text-red-500">*</span></span>
                                    <input type="text" value={customer?.address || ''} readOnly className="flex-1 border-b border-neutral-400 px-0.5 py-0 text-[15px] outline-none focus:border-blue-900" placeholder="........" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex flex-1 items-center gap-1">
                                        <span className="whitespace-nowrap text-[10px] font-semibold text-neutral-700">T.P<span className="ml-0.5 text-red-500">*</span></span>
                                        <input type="tel" value={customer?.phone || ''} readOnly className="flex-1 border-b border-neutral-400 px-0.5 py-0 text-[15px] outline-none focus:border-blue-900" placeholder="........" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-0.5">
                                            <span className="mr-0.5 text-[7px] font-semibold text-neutral-700">Date</span>
                                            <input type="text" value={dateParts[0] || ''} readOnly className="w-7 border border-neutral-400 px-0 py-0 text-center text-[9px] outline-none" maxLength="4" />
                                            <span className="text-[7px] text-neutral-400">/</span>
                                            <input type="text" value={dateParts[1] || ''} readOnly className="w-5 border border-neutral-400 px-0 py-0 text-center text-[9px] outline-none" maxLength="2" />
                                            <span className="text-[7px] text-neutral-400">/</span>
                                            <input type="text" value={dateParts[2] || ''} readOnly className="w-5 border border-neutral-400 px-0 py-0 text-center text-[9px] outline-none" maxLength="2" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-1.5 overflow-hidden rounded border border-black">
                            <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '8px' }}>
                                <thead>
                                    <tr className="bg-neutral-100">
                                        <th className="w-[40px] border border-black px-1 py-0 text-[6px] font-semibold">QTY</th>
                                        <th className="border border-black px-1 py-0 text-[6px] font-semibold">DESCRIPTION</th>
                                        <th className="w-[55px] border border-black px-1 py-0 text-[6px] font-semibold">RATE</th>
                                        <th className="w-[55px] border border-black px-1 py-0 text-[6px] font-semibold">RS.</th>
                                        <th className="w-[30px] border border-black px-1 py-0 text-[6px] font-semibold">CTS.</th>
                                        <th className="w-[20px] border border-black px-1 py-0 text-[6px] font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((l, i) => {
                                        const total = l ? parseFloat(l.amount) || 0 : 0;
                                        const { cts } = splitAmount(total);
                                        const detail = l ? [l.company, l.colour, l.chassisnumber].filter(Boolean) : [];
                                        return (
                                            <tr key={l?.id ?? i} className="hover:bg-neutral-50">
                                                <td className="border border-black p-0">
                                                    <input type="text" value={l ? '1' : ''} readOnly className="w-full px-1 py-0.5 text-center text-[15px] outline-none" />
                                                </td>
                                                <td className="relative border border-black p-0">
                                                    <div className="flex flex-col px-1 py-0.5">
                                                        <input type="text" value={l ? l.name : ''} readOnly className="w-full text-[15px] outline-none" />
                                                        {detail.length > 0 && (
                                                            <span className="text-[7px] text-neutral-500">{detail.join(' \u00b7 ')}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="border border-black p-0">
                                                    <input
                                                        type="text"
                                                        value={l ? l.amount : ''}
                                                        readOnly={!l}
                                                        onChange={(e) => onAmountChange(l.id, e.target.value)}
                                                        className="w-full px-1 py-0.5 text-right text-[15px] outline-none"
                                                    />
                                                </td>
                                                <td className="border border-black p-0">
                                                    <input
                                                        type="text"
                                                        value={l ? l.amount : ''}
                                                        readOnly={!l}
                                                        onChange={(e) => onAmountChange(l.id, e.target.value)}
                                                        className="w-full px-0 py-0.5 text-right text-[15px] outline-none"
                                                    />
                                                </td>
                                                <td className="border-l-2 border-black border-y-0 border-r-0 px-0.5 py-0.5 text-center text-[15px] text-neutral-800">{l ? cts : ''}</td>
                                                <td className="w-6 border border-black p-0 text-center">
                                                    {l && onRemove && (
                                                        <button onClick={() => onRemove(l.id)} className="rounded p-0.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Remove item">
                                                            <Trash2 size={10} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr>
                                        <td colSpan="2" rowSpan="3" className="relative w-1/2 border border-black bg-neutral-50 p-1 align-top" style={{ height: '82px' }}>
                                            <span className="mb-0 block text-[7px] font-semibold text-neutral-700">Description</span>
                                            <div className="h-[82px] rounded bg-white"></div>
                                        </td>
                                        <td className="border border-black bg-neutral-50 px-1.5 py-0.5 text-right text-[10px] font-semibold">SUB TOTAL</td>
                                        <td className="border border-black bg-neutral-50 px-0.5 py-0.5 text-left text-[13px] font-semibold">
                                            {splitAmount(subTotal).rs}
                                            <span className="ml-0.5 text-[7px] text-neutral-500">.{splitAmount(subTotal).cts}</span>
                                        </td>
                                        <td rowSpan="3" className="border-l-2 border-black"></td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black bg-neutral-50 px-1.5 py-0.5 text-right text-[10px] font-semibold">DISCOUNT</td>
                                        <td className="border border-black bg-neutral-50">
                                            <input type="text" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full px-0.5 py-0.5 text-left text-[13px] font-semibold outline-none" />
                                        </td>
                                    </tr>
                                    <tr className="bg-blue-50">
                                        <td className="border border-black px-1.5 py-0.5 text-right text-[10px] font-semibold">NET TOTAL</td>
                                        <td className="border border-black px-0.5 py-0.5 text-left text-[13px] font-semibold">
                                            {splitAmount(netTotal).rs}
                                            <span className="ml-0.5 text-[7px]">.{splitAmount(netTotal).cts}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {showSave && (
                            <div className="no-print relative mb-1">
                                <button onClick={() => setShowAddRow((v) => !v)} className="flex items-center gap-1 rounded bg-blue-50 px-1 py-0 text-[7px] font-medium text-blue-900 transition-colors hover:bg-blue-100">
                                    <Plus size={8} /> Add Row
                                </button>
                                {showAddRow && (
                                    <div className="absolute left-0 top-full z-50 mt-1 max-h-40 w-64 overflow-y-auto rounded border border-neutral-300 bg-white shadow-lg">
                                        {availableStocks.length === 0 ? (
                                            <div className="px-2 py-1.5 text-[10px] text-neutral-400">No available vehicles.</div>
                                        ) : (
                                            availableStocks.map((s) => (
                                                <div
                                                    key={s.id}
                                                    onMouseDown={() => {
                                                        if (onAddVehicle) onAddVehicle(s);
                                                        setShowAddRow(false);
                                                    }}
                                                    className="flex cursor-pointer items-center justify-between border-b border-neutral-100 px-2 py-1.5 text-[10px] hover:bg-blue-50 last:border-0"
                                                >
                                                    <span className="font-medium text-neutral-800">{s.name}</span>
                                                    <span className="ml-2 whitespace-nowrap text-[8px] text-neutral-400">{parseFloat(s.price)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-end justify-between border-t border-black pt-1">
                            <div className="w-32 text-center">
                                <div className="mb-0 h-8 border-b border-neutral-400"></div>
                                <p className="text-[11px] text-neutral-500">Sale rep Signature</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[7px] text-neutral-600">
                                    No. <span className="font-bold text-red-600">{invoiceNo}</span>
                                </p>
                            </div>
                            <div className="w-32 text-center">
                                <div className="mb-0 h-8 border-b border-neutral-400"></div>
                                <p className="text-[11px] text-neutral-500">Customer Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
