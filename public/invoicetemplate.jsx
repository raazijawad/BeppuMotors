import { useState, useEffect, useRef, Fragment } from 'react'
import { X, Plus, Trash2, Printer, RefreshCw, Camera, Loader2, Upload, ScanLine, AlertCircle, CheckCircle } from 'lucide-react'
import OldCreditLedger from '@/components/OldCreditLedger'
import { api } from '@/utils/api'

const SRI_LANKA_BANKS = [
  'Amana Bank PLC',
  'Bank of Ceylon',
  'Bank of China Ltd',
  'Cargills Bank PLC',
  'Citibank, N.A.',
  'Commercial Bank of Ceylon PLC',
  'Deutsche Bank AG',
  'DFCC Bank PLC',
  'Habib Bank Ltd',
  'Hatton National Bank PLC',
  'Indian Bank',
  'Indian Overseas Bank',
  'MCB Bank Ltd',
  'National Development Bank PLC',
  'Nations Trust Bank PLC',
  'Pan Asia Banking Corporation PLC',
  "People's Bank",
  'Public Bank Berhad',
  'Sampath Bank PLC',
  'Seylan Bank PLC',
  'Standard Chartered Bank',
  'State Bank of India',
  'The Hongkong and Shanghai Banking Corporation Limited (HSBC)',
  'Union Bank of Colombo PLC',
]

let _allProducts = []

const loadProducts = async () => {
  if (_allProducts.length) return _allProducts
  try {
    const data = await api.get('/api/products')
    _allProducts = data
    return data
  } catch { return [] }
}

const loadRates = async () => {
  try {
    const data = await api.get('/api/product-rates')
    const rates = {}
    data.forEach(r => { rates[`${r.shop_name}::${r.product_name}`] = String(r.rate) })
    return rates
  } catch { return {} }
}

const getProducts = () => _allProducts

const findProduct = (desc) => {
  if (!desc || !desc.trim()) return null
  const q = desc.trim().toLowerCase()
  return _allProducts.find(p => p.name.toLowerCase() === q) || null
}

const getConversionQty = (item) => {
  if (item._product?.conversionQty) return item._product.conversionQty
  const product = findProduct(item.description)
  return product?.conversionQty || 1
}

const saveLastProductRate = async (shopName, productName, rate) => {
  if (!shopName || !productName) return
  try {
    await api.post('/api/product-rates', { shop_name: shopName, product_name: productName, rate: parseFloat(rate) || 0 })
  } catch {}
}

const InvoiceForm = ({ onClose, onDone, onUpdate, viewData, hideBackdrop, onNameChange, onCustomerSelect, viewTrip, pendingPayments, selectedDate, onPendingPayments }) => {
  const [isEditing, setIsEditing] = useState(false)
  const isView = !!viewData && !isEditing
  const [showLedger, setShowLedger] = useState(false)
  const [customer, setCustomer] = useState(
    viewData?.customer || { name: '', address: '', phone: '', date: selectedDate, invoiceNo: '68902' }
  )
  const [items, setItems] = useState(
    viewData?.items && viewData.items.length > 0
      ? viewData.items
      : Array(8).fill(null).map(() => ({ qty: '', description: '', rate: '', rs: '' }))
  )
  const [discount, setDiscount] = useState(viewData?.discount || 0)
  const [paymentMode, setPaymentMode] = useState(viewData?.paymentMode || 'cash')
  const [cashGiven, setCashGiven] = useState(viewData?.cashGiven || '')
  const [balanceGiven, setBalanceGiven] = useState(viewData?.balanceGiven || '')
  const [chequeShop, setChequeShop] = useState(viewData?.chequeShop || '')
  const [chequeAccount, setChequeAccount] = useState(viewData?.chequeAccount || '')
  const [chequeNumber, setChequeNumber] = useState(viewData?.chequeNumber || '')
  const [chequeBank, setChequeBank] = useState(viewData?.chequeBank || '')
  const [chequeAmount, setChequeAmount] = useState(viewData?.chequeAmount || '')
  const [chequeAccountName, setChequeAccountName] = useState(viewData?.chequeAccountName || '')
  const [chequeBranch, setChequeBranch] = useState(viewData?.chequeBranch || '')
  const [chequeDate, setChequeDate] = useState(viewData?.chequeDate || '')
  const [receivedDate, setReceivedDate] = useState(viewData?.receivedDate || '')
  const [btBankName, setBtBankName] = useState(viewData?.btBankName || '')
  const [btAmount, setBtAmount] = useState(viewData?.btAmount || '')
  const [btBalance, setBtBalance] = useState(viewData?.btBalance || '')
  const resetForm = () => {
    setCustomer(viewData?.customer || { name: '', address: '', phone: '', date: selectedDate, invoiceNo: '68902' })
    setItems(viewData?.items && viewData.items.length > 0 ? viewData.items : Array(8).fill(null).map(() => ({ qty: '', description: '', rate: '', rs: '' })))
    setDiscount(viewData?.discount || 0)
    setPaymentMode(viewData?.paymentMode || 'cash')
    setCashGiven(viewData?.cashGiven || '')
    setBalanceGiven(viewData?.balanceGiven || '')
    setChequeShop(viewData?.chequeShop || '')
    setChequeAccount(viewData?.chequeAccount || '')
    setChequeNumber(viewData?.chequeNumber || '')
    setChequeBank(viewData?.chequeBank || '')
    setChequeAmount(viewData?.chequeAmount || '')
    setChequeAccountName(viewData?.chequeAccountName || '')
    setChequeBranch(viewData?.chequeBranch || '')
    setChequeDate(viewData?.chequeDate || '')
    setReceivedDate(viewData?.receivedDate || '')
    setBtBankName(viewData?.btBankName || '')
    setBtAmount(viewData?.btAmount || '')
    setBtBalance(viewData?.btBalance || '')
    setShowCashBt(!!viewData?.btBankName)
    setShowCashCheque(!!viewData?.chequeNumber)
    setChequeImagePreview(viewData?.chequeImage || '')
    setChequeImage(null)
  }
  const [showCashBt, setShowCashBt] = useState(isView ? !!viewData?.btBankName : false)
  const [showCashCheque, setShowCashCheque] = useState(isView ? !!viewData?.chequeNumber : false)
  const [chequeImage, setChequeImage] = useState(null)
  const [chequeImagePreview, setChequeImagePreview] = useState(viewData?.chequeImage || '')
  const [saving, setSaving] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [showChequePreview, setShowChequePreview] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const invoiceRef = useRef(null)
  const [pastBills, setPastBills] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [chequeOldCredits, setChequeOldCredits] = useState([])
  const [chequeSelectedOldCreditIds, setChequeSelectedOldCreditIds] = useState(new Set())
  const debounceRef = useRef(null)
  const nameRef = useRef(null)
  const suggestionsRef = useRef(null)
  const [bankSuggestions, setBankSuggestions] = useState([])
  const [showBankSuggestions, setShowBankSuggestions] = useState(false)
  const bankDebounceRef = useRef(null)
  const bankInputRef = useRef(null)
  const bankSuggestionsRef = useRef(null)
  const [productSuggestions, setProductSuggestions] = useState([])
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [activeDescIndex, setActiveDescIndex] = useState(null)
  const productSuggestionsRef = useRef(null)

  useEffect(() => {
    if (!hideBackdrop) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = 'auto' }
    }
  }, [hideBackdrop])

  useEffect(() => {
    loadProducts()
    loadRates()
  }, [])

  useEffect(() => {
    if (onNameChange) onNameChange(customer.name)
  }, [customer.name])

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [showCamera])

  useEffect(() => {
    const q = customer.name.trim()
    if (isView || !q) {
      setSuggestions([])
      setShowSuggestions(false)
      setPastBills([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      api.get(`/api/trips/search?name=${encodeURIComponent(q)}`).then(trips => {
          const filtered = trips.filter(trip => trip.form_data)
          const names = [...new Set(filtered.map(t => t.form_data?.customer?.name).filter(Boolean))]
          setSuggestions(names)
          const exact = names.some(n => n.toLowerCase() === q.toLowerCase())
          setShowSuggestions(!exact && names.length > 0)
          if (exact) {
            setPastBills(filtered.filter(t =>
              t.form_data?.customer?.name?.toLowerCase() === q.toLowerCase()
            ))
          } else {
            setPastBills([])
          }
        })
        .catch(() => { setSuggestions([]); setShowSuggestions(false) })
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [customer.name, isView])

  useEffect(() => {
    const handleClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          nameRef.current && !nameRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!customer.name || paymentMode !== 'cheque' || isView) {
      setChequeOldCredits([])
      setChequeSelectedOldCreditIds(new Set())
      return
    }
    api.get(`/api/trips/search?name=${encodeURIComponent(customer.name.trim())}`).then(trips => {
      const due = trips.filter(trip => {
        const fd = trip.form_data
        if (!fd || trip.id === viewTrip?.id) return false
        let paid
        if (fd.paymentMode === 'cash' && (fd.cashGiven === '' || fd.cashGiven == null)) {
          paid = parseFloat(fd.netTotal) || 0
        } else {
          paid = (parseFloat(fd.cashGiven) || 0) + (parseFloat(fd.btAmount) || 0) + (parseFloat(fd.chequeAmount) || 0) + (fd.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
        }
        return (parseFloat(fd.netTotal) || 0) - paid > 0.01
      })
      setChequeOldCredits(due)
    }).catch(() => {})
  }, [customer.name, paymentMode, isView, viewTrip?.id])

  const showProductSuggestionsFor = async (index, query) => {
    await loadProducts()
    const products = getProducts()
    const filtered = query ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : products
    setProductSuggestions(filtered)
    setShowProductSuggestions(filtered.length > 0)
    setActiveDescIndex(index)
  }

  const selectProduct = async (index, product) => {
    setShowProductSuggestions(false)
    setActiveDescIndex(null)
    const ratesData = await loadRates()
    let lastRate = null
    for (const [k, v] of Object.entries(ratesData)) {
      const [sn, pn] = k.split('::')
      if (sn?.toLowerCase().trim() === customer.name.toLowerCase().trim() &&
          pn?.toLowerCase().trim() === product.name.toLowerCase().trim()) {
        lastRate = v
      }
    }
    const rate = lastRate || String(product.price)
    const newItems = [...items]
    newItems[index] = { ...newItems[index], description: product.name, qty: '1', rate }
    newItems[index]._product = { conversionQty: product.conversionQty, convertedUnit: product.convertedUnit, baseUnit: product.baseUnit, name: product.name }
    const q = 1
    const r = parseFloat(rate) || 0
    newItems[index].rs = String(q * product.conversionQty * r)
    setItems(newItems)
  }

  const selectSuggestion = (name) => {
    setShowSuggestions(false)
    setSuggestions([])
    setChequeShop(name)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = name.trim()
    setCustomer(prev => ({ ...prev, name: q }))
    api.get(`/api/trips/search?name=${encodeURIComponent(q)}`).then(trips => {
        const match = trips.find(t => t.form_data?.customer?.name?.toLowerCase() === q.toLowerCase())
        const address = match?.form_data?.customer?.address || ''
        const phone = match?.form_data?.customer?.phone || ''
        setCustomer(prev => ({ ...prev, address, phone }))
        setPastBills(trips.filter(t => {
          const fd = t.form_data
          return fd && fd.customer?.name?.toLowerCase() === q.toLowerCase()
        }))
        if (onCustomerSelect) onCustomerSelect(q, address, phone)
      })
      .catch(() => setPastBills([]))
  }

  useEffect(() => {
    const q = btBankName.trim()
    if (isView || !q || (paymentMode !== 'bank_transfer' && !(paymentMode === 'cash' && showCashBt))) {
      setBankSuggestions([])
      setShowBankSuggestions(false)
      return
    }
    if (bankDebounceRef.current) clearTimeout(bankDebounceRef.current)
    bankDebounceRef.current = setTimeout(() => {
      const filtered = SRI_LANKA_BANKS.filter(b => b.toLowerCase().includes(q.toLowerCase()))
      setBankSuggestions(filtered)
      setShowBankSuggestions(filtered.length > 0)
    }, 100)
    return () => { if (bankDebounceRef.current) clearTimeout(bankDebounceRef.current) }
  }, [btBankName, isView, paymentMode])

  useEffect(() => {
    const handleClick = (e) => {
      if (bankSuggestionsRef.current && !bankSuggestionsRef.current.contains(e.target) &&
          bankInputRef.current && !bankInputRef.current.contains(e.target)) {
        setShowBankSuggestions(false)
      }
      if (productSuggestionsRef.current && !productSuggestionsRef.current.contains(e.target)) {
        setShowProductSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const [scanError, setScanError] = useState('')
  const [scanSuccess, setScanSuccess] = useState(false)
  const [scanResults, setScanResults] = useState(null)

  const handleChequeImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setChequeImage(file)
    setScanError('')
    setScanSuccess(false)
    setScanResults(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setChequeImagePreview(ev.target.result)
      setShowChequePreview(true)
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } })
      streamRef.current = stream
      setShowCamera(true)
    } catch (err) {
      console.error('Camera error:', err)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      const file = new File([blob], `cheque_${Date.now()}.jpg`, { type: 'image/jpeg' })
      handleChequeImageUpload({ target: { files: [file] } })
      stopCamera()
    }, 'image/jpeg', 0.95)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const runAiScan = async () => {
    if (!chequeImagePreview) return
    setOcrLoading(true)
    setScanError('')
    setScanSuccess(false)
    setScanResults(null)
    try {
      const data = await api.post('/api/cheque/scan', { image: chequeImagePreview })
      const fields = {
        bank_name: data.bank_name || '',
        branch_name: data.branch_name || '',
        cheque_no: data.cheque_no || '',
        account_number: data.account_number || '',
        account_name: data.account_name || '',
        cheque_amount: data.cheque_amount || '',
        cheque_date: data.cheque_date || '',
      }
      setScanResults(fields)
      if (fields.bank_name) setChequeBank(fields.bank_name)
      if (fields.branch_name) setChequeBranch(fields.branch_name)
      if (fields.cheque_no) setChequeNumber(fields.cheque_no)
      if (fields.account_number) setChequeAccount(fields.account_number)
      if (fields.account_name) {
        setChequeAccountName(fields.account_name)
        if (!receivedDate) setReceivedDate(fields.account_name)
      }
      if (fields.cheque_amount) setChequeAmount(fields.cheque_amount)
      if (fields.cheque_date) {
        const parts = fields.cheque_date.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
        if (parts) {
          setChequeDate(`${parts[3]}-${parts[2]}-${parts[1]}`)
        } else {
          setChequeDate(fields.cheque_date)
        }
      }
      setScanSuccess(true)
    } catch (err) {
      setScanError(err.message || 'Failed to connect to scan service. Please try again.')
    } finally {
      setOcrLoading(false)
    }
  }

  const parseQty = (qtyStr, product) => {
    if (!qtyStr || !qtyStr.trim()) return 0
    const s = qtyStr.trim()
    if (s.includes('/')) {
      const parts = s.split('/')
      const boxes = parseFloat(parts[0]) || 0
      const extraUnits = parseFloat(parts[1]) || 0
      if (product && product.conversionQty > 0) return boxes * product.conversionQty + extraUnits
      return boxes + extraUnits
    }
    const val = parseFloat(s) || 0
    if (product && product.conversionQty > 0) return val * product.conversionQty
    return val
  }

  const calculateRow = (item) => {
    const { qty, rate, rs, _product } = item
    if (rs !== '') return parseFloat(rs) || 0
    const r = parseFloat(rate) || 0
    const totalUnits = parseQty(qty, _product)
    if (_product && totalUnits > 0 && r > 0) return totalUnits * r
    return totalUnits * r
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    let effectiveRate
    if (field === 'rate') {
      const convQty = getConversionQty(newItems[index])
      effectiveRate = (parseFloat(value) || 0) / convQty
      newItems[index] = { ...newItems[index], rate: String(effectiveRate) }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    if (field === 'qty' || field === 'rate') {
      const qtyVal = field === 'qty' ? value : newItems[index].qty
      const r = field === 'rate' ? effectiveRate : (parseFloat(newItems[index].rate) || 0)
      const prod = newItems[index]._product
      const totalUnits = parseQty(qtyVal, prod)
      newItems[index].rs = String(prod && totalUnits > 0 && r > 0 ? totalUnits * r : (parseFloat(qtyVal) || 0) * r)
    }
    setItems(newItems)
  }

  const addItem = () => setItems([...items, { qty: '', description: '', rate: '', rs: '' }])
  const removeItem = (index) => setItems(items.map((item, i) => i === index ? { qty: '', description: '', rate: '', rs: '' } : item))

  const subTotal = items.reduce((sum, item) => sum + calculateRow(item), 0)
  const netTotal = subTotal - (parseFloat(discount) || 0)
  const btPaid = paymentMode === 'cash' && showCashBt ? (parseFloat(btAmount) || 0) : 0
  const chequePaid = paymentMode === 'cash' && showCashCheque ? (parseFloat(chequeAmount) || 0) : 0
  const chequeOldCreditTotal = chequeOldCredits.filter(b => chequeSelectedOldCreditIds.has(b.id)).reduce((sum, b) => {
    const fd = b.form_data
    let paid
    if (fd.paymentMode === 'cash' && (fd.cashGiven === '' || fd.cashGiven == null)) {
      paid = parseFloat(fd.netTotal) || 0
    } else {
      paid = (parseFloat(fd.cashGiven) || 0) + (parseFloat(fd.btAmount) || 0) + (parseFloat(fd.chequeAmount) || 0) + (fd.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
    }
    return sum + (parseFloat(fd.netTotal) || 0) - paid
  }, 0)
  const effectiveChequeOldCredit = isView ? (parseFloat(viewData?.chequeOldCreditTotal) || 0) : chequeOldCreditTotal
  const chequeNetPaid = paymentMode === 'cheque' ? Math.max(0, (parseFloat(chequeAmount) || 0) - effectiveChequeOldCredit) : (paymentMode === 'cash' && showCashCheque ? (parseFloat(chequeAmount) || 0) : 0)
  const balance = (cashGiven || chequeNetPaid || btPaid) ? netTotal - (parseFloat(cashGiven) || 0) - chequeNetPaid - btPaid : ''
  const paidMerged = paymentMode === 'cash' ? (parseFloat(cashGiven) || 0) + (showCashBt ? (parseFloat(btAmount) || 0) : 0) + (showCashCheque ? (parseFloat(chequeAmount) || 0) : 0) : paymentMode === 'bank_transfer' ? (parseFloat(btAmount) || 0) : 0
  const savedPaymentsMerged = (viewData?.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const ppMerged = (pendingPayments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const showMerged = paidMerged > 0 || ppMerged > 0

  const splitAmount = (amount) => {
    const a = parseFloat(amount) || 0
    return { rs: Math.floor(a), cts: Math.round((a - Math.floor(a)) * 100).toString().padStart(2, '0') }
  }

  const handlePrint = (e) => {
    if (e?.stopPropagation) e.stopPropagation()
    const el = invoiceRef.current
    if (!el) return
    const uid = 'ip-' + Date.now()
    el.dataset.printTarget = uid
    const style = document.createElement('style')
    style.id = 'invoice-print-styles'
    style.textContent = `
      @media print {
        @page { size: A5 portrait; margin: 0; }
        html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
        body > *:not([data-print-target="${uid}"]) { display: none !important; }
        [data-print-target="${uid}"] { display: block !important; position: relative !important; inset: auto !important; background: white !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 auto !important; width: 148mm !important; box-sizing: border-box !important; }
        [data-print-target="${uid}"] .no-print { display: none !important; }
      }
    `
    document.head.appendChild(style)
    const parent = el.parentNode
    const placeholder = document.createComment('print-placeholder')
    parent.replaceChild(placeholder, el)
    document.body.appendChild(el)
    el.style.setProperty('display', 'block', 'important')
    window.print()
    document.body.removeChild(el)
    placeholder.parentNode.replaceChild(el, placeholder)
    el.style.removeProperty('display')
    delete el.dataset.printTarget
    const s = document.getElementById('invoice-print-styles')
    if (s) s.remove()
  }

  return (
    <div className={`fixed inset-0 z-50 ${hideBackdrop ? '' : 'bg-neutral-900/80 backdrop-blur-sm'} flex items-center justify-center p-4 overflow-y-auto md:overflow-hidden lg:overflow-y-auto`}>
      <div className="w-full max-w-[740px] md:scale-[0.75] md:origin-center lg:scale-100 lg:origin-center md:translate-x-6 lg:translate-x-0 flex md:gap-1.5 lg:gap-4 items-start relative">

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 no-print">
            <h2 className="font-display text-sm font-bold text-white">{isView ? 'Invoice Details' : (isEditing ? 'Editing Invoice' : 'New Sales Invoice')}</h2>
              <div className="flex items-center gap-1.5">
                <button onClick={handlePrint} className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors" title="Print Invoice">
                  <Printer size={12} />
                </button>
                {!isView && !viewData && (
                  <>
                    <button onClick={async () => {
                    if (saving || !customer.name.trim() || !customer.address.trim() || !customer.phone.trim()) return
                    const hasItems = items.some(item => item.description && item.description.trim() && item.qty && item.qty.toString().trim())
                    if (!hasItems) { alert('Invoice is empty — add at least one product'); return }
                    setSaving(true)
                    try {
                      let chequeImg = chequeImagePreview
                      if (chequeImage && chequeImagePreview && !chequeImg.startsWith('http') && !chequeImg.startsWith('/')) {
                        try {
                          const formData = new FormData()
                          formData.append('image', chequeImage)
                          const uploadData = await api.upload('/api/cheque/upload-image', formData)
                          if (uploadData) chequeImg = uploadData.url
                        } catch {}
                      }
                      const effectiveCashGiven = paymentMode === 'cash' && (cashGiven === '' || cashGiven == null) ? String(netTotal) : cashGiven
                      const chequeOldCreditTotalVal = paymentMode === 'cheque' ? chequeOldCreditTotal : 0
                      if (paymentMode === 'cheque' && chequeOldCreditTotalVal > 0 && (parseFloat(chequeAmount) || 0) < netTotal + chequeOldCreditTotalVal) {
                        alert('Cheque amount is not enough to cover the invoice and selected old credit'); setSaving(false); return
                      }
                      const chequeOldCreditsData = chequeOldCredits.filter(b => chequeSelectedOldCreditIds.has(b.id)).map(b => {
                        const fd = b.form_data
                        const paid = (parseFloat(fd.cashGiven) || 0) + (parseFloat(fd.btAmount) || 0) + (parseFloat(fd.chequeAmount) || 0) + (fd.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                        return { id: b.id, amount: parseFloat(((parseFloat(fd.netTotal) || 0) - paid).toFixed(2)), form_data: fd }
                      })
                      await onDone({ customer, items, discount, subTotal, netTotal, paymentMode, cashGiven: effectiveCashGiven, balanceGiven, chequeShop, chequeAccount, chequeNumber, chequeBank, chequeAmount, chequeAccountName, chequeBranch, chequeDate, receivedDate, chequeImage: chequeImg, btBankName, btAmount, btBalance, chequeOldCreditTotal: chequeOldCreditTotalVal, chequeOldCredits: chequeOldCreditsData })
                      items.forEach(item => {
                        if (item.description && item.rate) {
                          saveLastProductRate(customer.name, item.description, item.rate)
                        }
                      })
                    } finally {
                      setSaving(false)
                    }
                  }} disabled={saving} className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-950 via-emerald-900 to-green-900 hover:from-green-800 hover:via-emerald-700 hover:to-green-800 text-emerald-100 hover:text-white text-xs font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Saving...' : 'Done'}
                  </button>
                </>
              )}
              {isView && !isEditing && onUpdate && (
                <button onClick={() => setIsEditing(true)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-950 via-amber-800 to-amber-900 hover:from-amber-800 hover:via-amber-700 hover:to-amber-800 text-amber-100 hover:text-white text-xs font-medium transition-all duration-300 flex items-center gap-1">
                  Edit
                </button>
              )}
              {isEditing && (
                <>
                  <button onClick={() => { resetForm(); setIsEditing(false); setSaving(false) }} className="px-3 py-1 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-medium transition-all duration-300">
                    Cancel
                  </button>
                  <button onClick={async () => {
                    if (saving) return
                    setSaving(true)
                    try {
                      await onUpdate({ customer, items, discount, subTotal, netTotal, paymentMode, cashGiven, balanceGiven, chequeShop, chequeAccount, chequeNumber, chequeBank, chequeAmount, chequeAccountName, chequeBranch, chequeDate, receivedDate, chequeImage: chequeImagePreview, btBankName, btAmount, btBalance })
                      items.forEach(item => {
                        if (item.description && item.rate) {
                          saveLastProductRate(customer.name, item.description, item.rate)
                        }
                      })
                      setIsEditing(false)
                    } catch {
                      alert('Failed to update invoice. Please try again.')
                    } finally {
                      setSaving(false)
                    }
                  }} disabled={saving} className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-950 via-blue-800 to-blue-900 hover:from-blue-800 hover:via-blue-700 hover:to-blue-800 text-blue-100 hover:text-white text-xs font-medium transition-all duration-300 flex items-center gap-1">
                    {saving ? 'Saving...' : 'Update'}
                  </button>
                </>
              )}
              <button onClick={onClose} className="p-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-2xl" ref={invoiceRef}>
            <div className="p-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">i</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">IMPALA Enterprises</h3>
                  <p className="text-[7px] italic text-blue-900">innovation is our strength</p>
                </div>
              </div>
              <div className="text-right text-[6px] leading-tight">
                <p className="font-semibold text-neutral-700">CUSTOMER COPY</p>
                <p>Mob: 071-5601517 / 077-7212184</p>
                <p>077-7688367</p>
                <p>EMAIL: impent01@yahoo.com</p>
              </div>
            </div>

            <p className="text-[6px] text-neutral-600 mb-1 leading-tight">Manufacturing &amp; Marketing Company of Soap, Washing Powder, Washing Liquid,<br />Hand Wash, Car Wash, Toilet Bowl Cleaner,<br />Tile Cleaner, Dish Wash &amp; Air Freshener</p>

            <div className="flex items-center gap-1 mb-1.5">
              <div className="flex-1 bg-[#1a237e] text-white px-1.5 py-0.5 text-[6px] rounded">
                <span>No: 74/A, DUNUWILA ROAD, AKURANA, KANDY.</span>
              </div>
              <div className="flex-1 text-right text-[6px] leading-tight text-neutral-600">
                <p>Web: www.impala.lk</p>
                <p>EMAIL: impent01@yahoo.com</p>
              </div>
            </div>

            <div className="flex gap-2 mb-1 text-xs">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-neutral-700 text-[10px] whitespace-nowrap">Name<span className="text-red-500 ml-0.5">*</span></span>
                  <div className="flex-1 relative">
                    <input ref={nameRef} type="text" value={customer.name} readOnly={isView} onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }} onChange={(e) => {
                      if (isView) return
                      const val = e.target.value
                      setCustomer({...customer, name: val})
                      setChequeShop(val)
                      if (!val.trim()) setPastBills([])
                    }} className="w-full border-b border-neutral-400 px-0.5 py-0 outline-none focus:border-blue-900" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }} placeholder="........" />
                    {showSuggestions && (
                      <div ref={suggestionsRef} className="absolute z-50 top-full left-0 right-0 bg-white border border-neutral-300 rounded shadow-lg max-h-48 overflow-y-auto">
                        {suggestions.map(name => (
                          <div key={name} onClick={() => selectSuggestion(name)} className="px-2 py-1.5 text-xs hover:bg-blue-50 cursor-pointer border-b border-neutral-100 last:border-0">
                            {name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-neutral-700 text-[10px] whitespace-nowrap">Address<span className="text-red-500 ml-0.5">*</span></span>
                  <input type="text" value={customer.address} readOnly={isView} onChange={(e) => !isView && setCustomer({...customer, address: e.target.value})} className="flex-1 border-b border-neutral-400 px-0.5 py-0 outline-none focus:border-blue-900" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }} placeholder="........" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="font-semibold text-neutral-700 text-[10px] whitespace-nowrap">T.P<span className="text-red-500 ml-0.5">*</span></span>
                    <input type="tel" value={customer.phone} readOnly={isView} onChange={(e) => !isView && setCustomer({...customer, phone: e.target.value})} className="flex-1 border-b border-neutral-400 px-0.5 py-0 outline-none focus:border-blue-900" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }} placeholder="........" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-0.5">
                      <span className="font-semibold text-neutral-700 text-[7px] mr-0.5">Date</span>
                      <input type="text" value={customer.date.split('-')[0] || ''} readOnly={isView} onChange={(e) => {
                        if (isView) return
                        const parts = customer.date.split('-')
                        setCustomer({...customer, date: `${e.target.value}-${parts[1] || ''}-${parts[2] || ''}`})
                      }} className="w-7 text-center border border-neutral-400 px-0 py-0 outline-none focus:border-blue-900" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }} maxLength="4" />
                      <span className="text-neutral-400 text-[7px]">/</span>
                      <input type="text" value={customer.date.split('-')[1] || ''} readOnly={isView} onChange={(e) => {
                        if (isView) return
                        const parts = customer.date.split('-')
                        setCustomer({...customer, date: `${parts[0] || ''}-${e.target.value}-${parts[2] || ''}`})
                      }} className="w-5 text-center border border-neutral-400 px-0 py-0 outline-none focus:border-blue-900" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }} maxLength="2" />
                      <span className="text-neutral-400 text-[7px]">/</span>
                      <input type="text" value={customer.date.split('-')[2] || ''} readOnly={isView} onChange={(e) => {
                        if (isView) return
                        const parts = customer.date.split('-')
                        setCustomer({...customer, date: `${parts[0] || ''}-${parts[1] || ''}-${e.target.value}`})
                      }} className="w-5 text-center border border-neutral-400 px-0 py-0 outline-none focus:border-blue-900" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }} maxLength="2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-black rounded overflow-hidden mb-1.5">
              <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '8px' }}>
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-black px-1 py-0 font-semibold text-[6px] w-[40px]">QTY</th>
                    <th className="border border-black px-1 py-0 font-semibold text-[6px]">DESCRIPTION</th>
                    <th className="border border-black px-1 py-0 font-semibold text-[6px] w-[55px]">RATE</th>
                    <th className="border border-black px-1 py-0 font-semibold text-[6px] w-[55px]">RS.</th>
                    <th className="border border-black px-1 py-0 font-semibold text-[6px] w-[30px]">CTS.</th>
                    {!isView && <th className="border border-black px-1 py-0 font-semibold text-[6px] w-[20px]"></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const total = calculateRow(item)
                    const { cts } = splitAmount(total)
                    return (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="border border-black p-0">
                          <input type="text" value={item.qty} readOnly={isView} onChange={(e) => !isView && updateItem(index, 'qty', e.target.value)} className="w-full px-1 py-0.5 outline-none text-center" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }} />
                        </td>
                        <td className="border border-black p-0 relative">
                          <input type="text" value={item.description} readOnly={isView} onFocus={() => !isView && showProductSuggestionsFor(index, item.description)} onClick={() => !isView && showProductSuggestionsFor(index, item.description)} onChange={(e) => {
                            if (isView) return
                            const val = e.target.value
                            updateItem(index, 'description', val)
                            showProductSuggestionsFor(index, val)
                          }} className="w-full px-1 py-0.5 outline-none" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }} />
                          {item._product && (
                            <span className="absolute right-0.5 top-0.5 text-[5px] font-semibold text-emerald-600 bg-emerald-50 px-0.5 rounded leading-tight" title={`1 ${item._product.convertedUnit} = ${item._product.conversionQty} ${item._product.baseUnit}s`}>
                              {item._product.conversionQty}/{item._product.convertedUnit}
                            </span>
                          )}
                          {showProductSuggestions && activeDescIndex === index && (
                            <div ref={productSuggestionsRef} className="absolute z-50 top-full left-0 right-0 bg-white border border-neutral-400 rounded shadow-lg max-h-48 overflow-y-auto" style={{ minWidth: '200px' }}>
                              {productSuggestions.map(p => (
                                <div key={p.id} onMouseDown={() => selectProduct(index, p)} className="px-2 py-1.5 text-xs hover:bg-emerald-50 cursor-pointer border-b border-neutral-100 last:border-0 flex items-center justify-between">
                                  <span className="font-medium text-neutral-800">{p.name}</span>
                                  <span className="text-[8px] text-emerald-600 ml-2 whitespace-nowrap">{p.conversionQty} {p.baseUnit}{p.conversionQty > 1 ? 's' : ''} / {p.convertedUnit}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="border border-black p-0">
                          <input type="text" value={item.rate !== '' && item.rate != null ? String((parseFloat(item.rate) || 0) * getConversionQty(item)) : ''} readOnly={isView} onChange={(e) => !isView && updateItem(index, 'rate', e.target.value)} className="w-full px-1 py-0.5 outline-none text-right" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }} />
                        </td>
                        <td className="border border-black p-0">
                          <input type="text" value={item.rs} readOnly={isView} onChange={(e) => !isView && updateItem(index, 'rs', e.target.value)} className="w-full px-0 py-0.5 outline-none text-right" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }} />
                        </td>
                        <td className="border-l-2 border-black border-t-0 border-b-0 border-r-0 px-0.5 py-0.5 text-center text-neutral-800" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }}>{cts}</td>
                        {!isView && (
                          <td className="border border-black p-0 w-6 text-center">
                            <button onClick={() => removeItem(index)} className="p-0.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors" title="Remove item">
                              <Trash2 size={10} />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                  <tr>
                    <td colSpan="2" rowSpan="3" className={`${showMerged ? 'border border-black border-t-0' : 'border border-black'} p-1 bg-neutral-50 align-top w-1/2 relative overflow-visible`} style={{ height: '82px' }}>
                      {(() => {
                        const total = parseFloat(netTotal) || 0
                        let paid = 0
                        if (paymentMode === 'cash') paid = (parseFloat(cashGiven) || parseFloat(netTotal) || 0) + (showCashBt ? (parseFloat(btAmount) || 0) : 0) + (showCashCheque ? (parseFloat(chequeAmount) || 0) : 0)
                        else if (paymentMode === 'bank_transfer') paid = parseFloat(btAmount) || 0
                        else if (paymentMode === 'cheque') paid = Math.max(0, (parseFloat(chequeAmount) || 0) - effectiveChequeOldCredit)
                        else if (paymentMode === 'credit') paid = parseFloat(cashGiven) || 0
                        const initialCash = paid
                        const due = total - initialCash
                        const allPayments = [
                          ...(viewData?.payments || []),
                          ...(pendingPayments || []),
                        ]
                        const showCalc = paid > 0 || allPayments.length > 0
                        if (showCalc) {
                          const showLines = []
                          const cashVal = parseFloat(cashGiven) || 0
                          const btVal = showCashBt ? (parseFloat(btAmount) || 0) : 0
                          const chqVal = parseFloat(chequeAmount) || 0
                          const chequeVal = paymentMode === 'cheque' ? chqVal : (showCashCheque ? chqVal : 0)
                          return (
                            <div className="absolute bottom-0 left-0 right-0 text-right leading-tight z-10">
                              <div className="px-1 pt-1">
                              <div className="font-bold text-[11px]">{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                              {paymentMode === 'cash' && (
                                <>
                                  {cashVal > 0 && <div className="font-bold text-[8px] text-red-600 leading-[10px]">&minus; {cashVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>}
                                  {btVal > 0 && <div className="font-bold text-[8px] text-red-600 leading-[10px]">&minus; {btVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>}
                                  {chqVal > 0 && <div className="font-bold text-[8px] text-red-600 leading-[10px]">&minus; {chqVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>}
                                </>
                              )}
                              {paymentMode === 'cheque' && chequeVal > 0 && <div className="font-bold text-[8px] text-red-600 leading-[10px]">&minus; {chequeVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>}
                              {paymentMode !== 'cash' && paymentMode !== 'cheque' && initialCash > 0 && <div className="font-bold text-[11px] text-red-600">{initialCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>}
                              <div className="border-t border-neutral-300 mb-0.5 mt-0.5"></div>
                              <div className="font-bold text-[11px]">{due.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                              {allPayments.length > 0 && allPayments.map((p, i) => {
                                const amt = parseFloat(p.amount) || 0
                                const cumulativePaid = paid + allPayments.slice(0, i + 1).reduce((s, v) => s + (parseFloat(v.amount) || 0), 0)
                                const bal = total - cumulativePaid
                                const isLast = i === allPayments.length - 1
                                return (
                                  <Fragment key={i}>
                                    <div className="font-bold text-[8px] text-red-600 leading-[10px]"><span className="text-[6px] text-neutral-400 font-medium">{p.date || ''}</span> &minus; {amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                    <div className="border-t border-neutral-300 mb-0.5 mt-0.5"></div>
                                    <div className={isLast ? "border-t border-neutral-400 pt-[1px] mt-[1px] font-extrabold text-[10px]" : "font-bold text-[11px]"}>{isLast ? '= ' : ''}{bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                  </Fragment>
                                )
                              })}
                              </div>
                            </div>
                          )
                        }
                        return null
                      })()}
                      {(() => {
                        const total = parseFloat(netTotal) || 0
                        let paid = 0
                        if (paymentMode === 'cash') paid = (parseFloat(cashGiven) || parseFloat(netTotal) || 0) + (showCashBt ? (parseFloat(btAmount) || 0) : 0) + (showCashCheque ? (parseFloat(chequeAmount) || 0) : 0)
                        else if (paymentMode === 'bank_transfer') paid = parseFloat(btAmount) || 0
                        else if (paymentMode === 'cheque') paid = Math.max(0, (parseFloat(chequeAmount) || 0) - effectiveChequeOldCredit)
                        const savedPayments = (viewData?.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                        const pp = (pendingPayments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                        const hasPayment = paid > 0 || savedPayments > 0 || pp > 0
                        if (!hasPayment) return (
                          <>
                            <span className="font-semibold text-neutral-700 text-[7px] block mb-0">Description</span>
                            <div className="h-[82px] bg-white rounded"></div>
                          </>
                        )
                        return null
                      })()}
                    </td>
                    <td className="border border-black px-1.5 py-0.5 font-semibold text-right text-[10px] bg-neutral-50">SUB TOTAL</td>
                    <td className="border border-black px-0.5 py-0.5 font-semibold text-left text-[13px] bg-neutral-50" style={{ fontFamily: "'Inter', sans-serif" }}>{splitAmount(subTotal).rs}<span className="ml-0.5 text-neutral-500 text-[7px]">.{splitAmount(subTotal).cts}</span></td>
                    <td rowSpan="3" className="border-l-2 border-black"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-1.5 py-0.5 font-semibold text-right text-[10px] bg-neutral-50">DISCOUNT</td>
                    <td className="border border-black bg-neutral-50">
                      <input type="text" value={discount} readOnly={isView} onChange={(e) => !isView && setDiscount(e.target.value)} className="w-full px-0.5 py-0.5 outline-none text-left font-semibold text-[13px]" style={{ fontFamily: "'Inter', sans-serif" }} />
                    </td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-black px-1.5 py-0.5 font-semibold text-right text-[10px]">NET TOTAL</td>
                    <td className="border border-black px-0.5 py-0.5 font-semibold text-left text-[13px]" style={{ fontFamily: "'Inter', sans-serif" }}>{splitAmount(netTotal).rs}<span className="ml-0.5 text-[7px]">.{splitAmount(netTotal).cts}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {!isView && (
              <div className="no-print mb-1">
                <button onClick={addItem} className="flex items-center gap-1 px-1 py-0 bg-blue-50 text-blue-900 text-[7px] font-medium rounded hover:bg-blue-100 transition-colors">
                  <Plus size={8} /> Add Row
                </button>
              </div>
            )}

            <div className="flex justify-between items-end border-t border-black pt-1">
              <div className="text-center w-32">
                <div className="h-8 border-b border-neutral-400 mb-0"></div>
                <p className="text-[11px] text-neutral-500">Sale rep Signature</p>
              </div>

              <div className="text-center">
                <p className="text-[7px] text-neutral-600">No. <span className="font-bold text-red-600">{customer.invoiceNo}</span></p>
              </div>

              <div className="text-center w-32">
                <div className="h-8 border-b border-neutral-400 mb-0"></div>
                <p className="text-[11px] text-neutral-500">Customer Signature</p>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="w-52 shrink-0 mt-8 md:mt-12 lg:mt-8">
          <div className="bg-white rounded-lg shadow-2xl p-4 max-h-[60vh] overflow-y-auto">
            <label className="text-[10px] font-semibold text-neutral-700 block mb-1.5">Payment Mode</label>
            {isView ? (
              <div>
                <div className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs bg-neutral-100 text-neutral-600">
                  {paymentMode === 'cash' ? 'Cash' : paymentMode === 'cheque' ? 'Cheque' : paymentMode === 'bank_transfer' ? 'Bank Transfer' : 'Credit'}
                </div>
                {isView && paymentMode === 'bank_transfer' && (viewData?.btBankName || viewData?.btAmount || viewData?.btBalance) && (
                  <div className="mt-2 space-y-1 border border-neutral-300 rounded p-2 bg-neutral-50">
                    <p className="text-[8px] font-semibold text-neutral-600 uppercase tracking-wide">Bank Transfer Details</p>
                    {viewData?.btBankName && <div className="text-xs text-neutral-700"><span className="text-[8px] text-neutral-400 uppercase">Bank: </span>{viewData.btBankName}</div>}
                    {viewData?.btAmount && <div className="text-xs text-neutral-700"><span className="text-[8px] text-neutral-400 uppercase">Amount: </span>LKR {parseFloat(viewData.btAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>}
                    {(viewData?.payments || []).length > 0 && (
                      <div className="space-y-0.5">
                        {viewData.payments.map((p, i) => (
                          <p key={i} className="text-[8px] text-emerald-600 font-medium">{p.date} &middot; LKR {parseFloat(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} settled</p>
                        ))}
                      </div>
                    )}
                    {(() => {
                      const amt = parseFloat(viewData?.btAmount) || 0
                      const paid = (viewData?.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                      const total = parseFloat(netTotal) || 0
                      const due = total - amt - paid
                      if (due > 0) return <div className="text-xs text-red-600 font-semibold"><span className="text-[8px] text-red-400 uppercase">Due Balance: </span>LKR {due.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      return <div className="text-xs text-emerald-600 font-semibold">Payment Settled</div>
                    })()}
                  </div>
                )}
                {isView && paymentMode === 'credit' && (viewData?.payments || []).length > 0 && (parseFloat(cashGiven) || 0) >= (parseFloat(netTotal) || 0) && (
                  <div className="mt-1 px-1.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded">
                    Payment Settled
                  </div>
                )}
                {isView && paymentMode === 'credit' && (viewData?.payments || []).length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {viewData.payments.map((p, i) => (
                      <p key={i} className="text-[8px] text-emerald-600 font-medium">{p.date} &middot; LKR {parseFloat(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} settled</p>
                    ))}
                  </div>
                )}
                {isView && paymentMode === 'credit' && (
                  <div className="mt-1 px-1.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-300 rounded">
                    Credit: LKR {Math.max(0, (parseFloat(netTotal) || 0) - (parseFloat(cashGiven) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            ) : (
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-blue-900 bg-white"
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="credit">Credit</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            )}
            {isView && paymentMode === 'cheque' ? (
              <div className="mt-2 space-y-1 border border-neutral-300 rounded p-2 bg-neutral-50">
                <p className="text-[8px] font-semibold text-neutral-600 uppercase tracking-wide">Cheque Details</p>
                {[
                  { key: 'receivedDate', label: 'Received From' },
                  { key: 'chequeShop', label: 'Shop' },
                  { key: 'chequeAccount', label: 'Account No' },
                  { key: 'chequeAccountName', label: 'Account Name' },
                  { key: 'chequeBank', label: 'Bank' },
                  { key: 'chequeBranch', label: 'Branch' },
                  { key: 'chequeNumber', label: 'Cheque No' },
                  { key: 'chequeAmount', label: 'Amount' },
                  { key: 'chequeDate', label: 'Cheque Date' },
                ].map(({ key, label }) => (
                  <div key={key} className="text-xs text-neutral-700">
                    <span className="text-[8px] text-neutral-400 uppercase">{label}: </span>
                    {viewData?.[key] || ''}
                  </div>
                ))}
                {viewData?.chequeImage && (
                  <div className="mt-1">
                    <img src={viewData.chequeImage} alt="Cheque" className="w-full rounded border border-neutral-200" />
                  </div>
                )}
                {viewData?.chequeOldCreditTotal > 0 && (
                  <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-[8px] font-semibold text-neutral-600 uppercase tracking-wide">Old Credit Settled via This Cheque</p>
                    <p className="text-[10px] text-emerald-600 font-medium">LKR {parseFloat(viewData.chequeOldCreditTotal).toFixed(2)}</p>
                    {viewData.chequeOldCredits?.length > 0 && (
                      <p className="text-[7px] text-neutral-400 mt-0.5">{viewData.chequeOldCredits.length} bill(s) settled</p>
                    )}
                  </div>
                )}
              </div>
            ) : null}
            {paymentMode === 'cheque' && !isView && (
              <>
                <div className="mt-2 border border-neutral-300 rounded p-3 bg-neutral-50">
                  <p className="text-[8px] font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">Cheque Image</p>
                  {!chequeImagePreview ? (
                    <div className="flex gap-1">
                      <label className="flex items-center justify-center gap-1 px-3 py-2 rounded bg-white border border-neutral-400 text-[9px] text-neutral-600 cursor-pointer hover:bg-neutral-50 transition-colors flex-1">
                        <Upload size={12} />
                        <span>Upload</span>
                        <input type="file" accept="image/*" onChange={handleChequeImageUpload} className="hidden" />
                      </label>
                      <button onClick={startCamera} className="flex items-center justify-center gap-1 px-3 py-2 rounded bg-white border border-blue-400 text-[9px] text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors flex-1">
                        <Camera size={12} />
                        <span>Camera</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="relative">
                        <img src={chequeImagePreview} alt="Cheque" className="w-full rounded border border-neutral-300 bg-white" />
                        <button onClick={() => { setChequeImage(null); setChequeImagePreview(''); setShowChequePreview(false); setScanError(''); setScanSuccess(false); setScanResults(null) }} className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 text-neutral-500 hover:text-red-600 transition-colors shadow">
                          <X size={14} />
                        </button>
                      </div>
                      <button onClick={() => setShowChequePreview(true)} className="text-[8px] text-indigo-600 hover:text-indigo-800 underline text-center">View full size</button>
                    </div>
                  )}
                </div>

                <div className="mt-2 space-y-1.5 border border-neutral-300 rounded p-3 bg-neutral-50">
                  <p className="text-[8px] font-semibold text-neutral-600 uppercase tracking-wide">Cheque Details</p>
                  <input value={receivedDate} onChange={e => setReceivedDate(e.target.value)} placeholder="Received From" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input value={chequeShop} onChange={e => setChequeShop(e.target.value)} placeholder="Shop name" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input value={chequeAccount} onChange={e => setChequeAccount(e.target.value)} placeholder="Account No" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input value={chequeAccountName} onChange={e => setChequeAccountName(e.target.value)} placeholder="Account Name" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input value={chequeBank} onChange={e => setChequeBank(e.target.value)} placeholder="Bank name" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input value={chequeBranch} onChange={e => setChequeBranch(e.target.value)} placeholder="Branch name" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} placeholder="Cheque No" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input value={chequeAmount} onChange={e => setChequeAmount(e.target.value)} placeholder="Cheque amount" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                  <input type="date" value={chequeDate} onChange={e => setChequeDate(e.target.value)} placeholder="Cheque date" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-blue-900 bg-white" />
                </div>
                {chequeOldCredits.length > 0 && (
                  <div className="mt-1.5 p-2 border border-amber-200 rounded-lg bg-amber-50">
                    <p className="text-[8px] font-semibold text-neutral-600 uppercase tracking-wide mb-1">Settle Old Credit via This Cheque</p>
                    {chequeOldCredits.map(bill => {
                      const fd = bill.form_data
                      let paid
                      if (fd.paymentMode === 'cash' && (fd.cashGiven === '' || fd.cashGiven == null)) {
                        paid = parseFloat(fd.netTotal) || 0
                      } else {
                        paid = (parseFloat(fd.cashGiven) || 0) + (parseFloat(fd.btAmount) || 0) + (parseFloat(fd.chequeAmount) || 0) + (fd.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                      }
                      const due = (parseFloat(fd.netTotal) || 0) - paid
                      return (
                        <label key={bill.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-amber-100/50 rounded px-1">
                          <input type="checkbox" checked={chequeSelectedOldCreditIds.has(bill.id)} onChange={() => {
                            const next = new Set(chequeSelectedOldCreditIds)
                            if (next.has(bill.id)) next.delete(bill.id); else next.add(bill.id)
                            setChequeSelectedOldCreditIds(next)
                          }} className="accent-emerald-600 w-3 h-3" />
                          <span className="text-[8px] text-neutral-500 flex-1">{fd.customer.date} #{bill.id}</span>
                          <span className="text-[8px] font-medium text-red-500">LKR {due.toFixed(2)}</span>
                        </label>
                      )
                    })}
                    {chequeSelectedOldCreditIds.size > 0 && (
                      <p className="text-[9px] font-semibold text-emerald-600 mt-1 pt-1 border-t border-amber-200">
                        Total Old Credit: LKR {chequeOldCreditTotal.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            {paymentMode === 'bank_transfer' && !isView && (
              <div className="mt-2 space-y-1.5 border border-neutral-300 rounded p-3 bg-neutral-50">
                <p className="text-[8px] font-semibold text-neutral-600 uppercase tracking-wide">Bank Transfer Details</p>
                <div className="relative">
                  <input ref={bankInputRef} value={btBankName} onChange={e => setBtBankName(e.target.value)} placeholder="Bank name" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-emerald-900 bg-white" />
                  {showBankSuggestions && bankSuggestions.length > 0 && (
                    <div ref={bankSuggestionsRef} className="absolute z-10 top-full left-0 right-0 mt-0.5 bg-white border border-neutral-300 rounded shadow-lg max-h-40 overflow-y-auto">
                      {bankSuggestions.map(b => (
                        <div key={b} onMouseDown={() => { setBtBankName(b); setShowBankSuggestions(false); setBankSuggestions([]) }} className="px-2 py-1 text-xs text-neutral-800 hover:bg-emerald-50 cursor-pointer border-b border-neutral-100 last:border-0">
                          {b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input value={btAmount} onChange={e => { setBtAmount(e.target.value); const amt = parseFloat(e.target.value) || 0; const due = Math.max(0, netTotal - amt); setBtBalance(due > 0 ? String(due) : '0') }} placeholder="Amount" className="w-full border border-neutral-400 rounded px-1.5 py-1 text-xs outline-none focus:border-emerald-900 bg-white" />
                {(() => { if (!btAmount) return null; const amt = parseFloat(btAmount) || 0; const due = netTotal - amt; if (due > 0) { return <> <label className="text-[8px] font-semibold text-red-600 block mb-0.5">Due Balance</label>
                <input value={btBalance} readOnly placeholder="Due Balance" className="w-full border border-red-400 rounded px-1.5 py-1 text-xs outline-none bg-red-50 text-red-700 font-semibold" /> </> } return null })()}
              </div>
            )}
            {paymentMode === 'cash' && (
              <>
                <div className="flex gap-2 mt-2">
                  <div className="w-1/2">
                    <label className="text-[8px] font-semibold text-neutral-500 block mb-0.5">Net Total</label>
                    <input type="text" value={netTotal} readOnly placeholder="Net Total" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none bg-neutral-100 text-neutral-600" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-[8px] font-semibold text-neutral-500 block mb-0.5">Given Cash</label>
                    <input type="text" value={cashGiven} onChange={(e) => !isView && setCashGiven(e.target.value)} readOnly={isView} placeholder="Cash Given" className={`w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none ${isView ? 'bg-neutral-100 text-neutral-600' : 'bg-white focus:border-blue-900'}`} />
                  </div>
                </div>
                {!showCashBt && !isView && (
                  <button onClick={() => setShowCashBt(true)} className="w-full mt-2 px-3 py-1.5 rounded-lg border border-dashed border-blue-400 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors">
                    + Bank Transfer
                  </button>
                )}
                {showCashBt && (
                  <div className="mt-2 p-2 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-semibold text-blue-700">Bank Transfer</span>
                      {!isView && (
                        <button onClick={() => { setShowCashBt(false); setBtBankName(''); setBtAmount(''); setBtBalance('') }} className="p-0.5 rounded hover:bg-blue-200 transition-colors">
                          <X size={12} className="text-blue-500" />
                        </button>
                      )}
                    </div>
                    <div className="mb-1.5 relative">
                      <label className="text-[8px] font-semibold text-neutral-500 block mb-0.5">Bank Name</label>
                      <input ref={bankInputRef} type="text" value={btBankName} onChange={(e) => !isView && setBtBankName(e.target.value)} readOnly={isView} placeholder="Enter bank name" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none bg-white focus:border-blue-900" />
                      {showBankSuggestions && bankSuggestions.length > 0 && (
                        <div ref={bankSuggestionsRef} className="absolute z-10 top-full left-0 right-0 mt-0.5 bg-white border border-neutral-300 rounded shadow-lg max-h-40 overflow-y-auto">
                          {bankSuggestions.map(b => (
                            <div key={b} onMouseDown={() => { setBtBankName(b); setShowBankSuggestions(false); setBankSuggestions([]) }} className="px-2 py-1 text-xs text-neutral-800 hover:bg-emerald-50 cursor-pointer border-b border-neutral-100 last:border-0">
                              {b}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[8px] font-semibold text-neutral-500 block mb-0.5">Amount</label>
                      <input type="text" value={btAmount} onChange={(e) => { if (!isView) { setBtAmount(e.target.value); const amt = parseFloat(e.target.value) || 0; const due = Math.max(0, netTotal - amt); setBtBalance(due > 0 ? String(due) : '0') } }} readOnly={isView} placeholder="Enter amount" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none bg-white focus:border-blue-900" />
                    </div>
                  </div>
                )}
                {!showCashCheque && !isView && (
                  <button onClick={() => setShowCashCheque(true)} className="w-full mt-2 px-3 py-1.5 rounded-lg border border-dashed border-amber-400 text-amber-700 text-xs font-medium hover:bg-amber-50 transition-colors">
                    + Cheque
                  </button>
                )}
                {showCashCheque && (
                  <div className="mt-2 p-2 border border-amber-200 rounded-lg bg-amber-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-semibold text-amber-700">Cheque</span>
                      {!isView && (
                        <button onClick={() => { setShowCashCheque(false); setChequeImage(null); setChequeImagePreview(''); setChequeAmount(''); setChequeNumber(''); setChequeBank(''); setChequeShop(''); setChequeBranch(''); setChequeDate(''); setShowChequePreview(false); setScanError(''); setScanSuccess(false); setScanResults(null) }} className="p-0.5 rounded hover:bg-amber-200 transition-colors">
                          <X size={12} className="text-amber-500" />
                        </button>
                      )}
                    </div>
                    {!isView && (
                      <div className="mb-1.5">
                        {!chequeImagePreview ? (
                          <div className="flex gap-1">
                            <label className="flex items-center justify-center gap-1 px-3 py-2 rounded bg-white border border-neutral-400 text-[9px] text-neutral-600 cursor-pointer hover:bg-neutral-50 transition-colors flex-1">
                              <Upload size={12} />
                              <span>Upload</span>
                              <input type="file" accept="image/*" onChange={handleChequeImageUpload} className="hidden" />
                            </label>
                            <button onClick={startCamera} className="flex items-center justify-center gap-1 px-3 py-2 rounded bg-white border border-blue-400 text-[9px] text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors flex-1">
                              <Camera size={12} />
                              <span>Camera</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <div className="relative">
                              <img src={chequeImagePreview} alt="Cheque" className="w-full rounded border border-neutral-300 bg-white" />
                              <button onClick={() => { setChequeImage(null); setChequeImagePreview(''); setShowChequePreview(false); setScanError(''); setScanSuccess(false); setScanResults(null) }} className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 text-neutral-500 hover:text-red-600 transition-colors shadow">
                                <X size={14} />
                              </button>
                            </div>
                            <button onClick={() => setShowChequePreview(true)} className="text-[8px] text-indigo-600 hover:text-indigo-800 underline text-center">View full size</button>
                          </div>
                        )}
                      </div>
                    )}
                    {isView && chequeImagePreview && (
                      <div className="mb-1.5">
                        <img src={chequeImagePreview} alt="Cheque" className="w-full rounded border border-neutral-300 bg-white cursor-pointer" onClick={() => setShowChequePreview(true)} />
                        <button onClick={() => setShowChequePreview(true)} className="text-[8px] text-indigo-600 hover:text-indigo-800 underline text-center w-full mt-1">View full size</button>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <input value={receivedDate} onChange={e => setReceivedDate(e.target.value)} placeholder="Received From" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input value={chequeShop} onChange={e => setChequeShop(e.target.value)} placeholder="Shop name" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input value={chequeAccount} onChange={e => setChequeAccount(e.target.value)} placeholder="Account No" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input value={chequeAccountName} onChange={e => setChequeAccountName(e.target.value)} placeholder="Account Name" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input value={chequeBank} onChange={e => setChequeBank(e.target.value)} placeholder="Bank name" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input value={chequeBranch} onChange={e => setChequeBranch(e.target.value)} placeholder="Branch name" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} placeholder="Cheque No" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input value={chequeAmount} onChange={e => setChequeAmount(e.target.value)} placeholder="Cheque amount" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                      <input type="date" value={chequeDate} onChange={e => setChequeDate(e.target.value)} placeholder="Cheque date" className="w-full border border-neutral-400 rounded px-1.5 py-1.5 text-xs outline-none focus:border-amber-900 bg-white" />
                    </div>
                  </div>
                )}
                <div className="mt-2">
                  <label className="text-[8px] font-semibold text-red-600 block mb-0.5">Balance</label>
                  <input type="text" value={balance === '' ? '' : balance} readOnly placeholder="Balance" className="w-full border border-red-400 rounded px-1.5 py-1.5 text-xs outline-none bg-red-50 text-red-700 font-semibold" />
                  {(() => {
                    const payments = viewData?.payments || []
                    if (payments.length === 0) return null
                    return (
                      <div className="mt-0.5 space-y-0.5">
                        {payments.map((p, i) => (
                          <p key={i} className="text-[8px] text-emerald-600 font-medium text-right">{p.date} Paid LKR {parseFloat(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </>
            )}
            {isView && onUpdate && viewTrip && (
              <div className="mt-3 border-t border-neutral-200 pt-3">
                <button onClick={() => setShowLedger(true)} className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-xs font-medium hover:from-emerald-500 hover:to-emerald-700 transition-colors">
                  Settle Amount
                </button>
              </div>
            )}
            </div>
            </div>
        {isView && (() => {
          const dueBills = pastBills.filter(trip => {
            const fd = trip.form_data
            const paid = (parseFloat(fd.cashGiven) || 0) + (parseFloat(fd.btAmount) || 0) + (parseFloat(fd.chequeAmount) || 0) + (fd.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
            const total = parseFloat(fd.netTotal) || 0
            const bal = fd.cashGiven !== '' && fd.cashGiven != null ? paid - total : 0
            return Math.abs(bal) > 0.01
          })
          return dueBills.length > 0 ? (
            <div className="w-full mt-3">
              <div className="bg-white rounded-lg shadow-2xl p-3">
                <h3 className="text-[11px] font-bold text-neutral-800 mb-2 border-b border-neutral-200 pb-1">Due Bills</h3>
        {showLedger && viewTrip && (
          <OldCreditLedger trip={viewTrip} noBackdrop selectedDate={selectedDate} onPaymentEnter={onPendingPayments ? (payments) => onPendingPayments(payments) : undefined} onClose={() => { setShowLedger(false); if (onClose) onClose() }} />
        )}
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {dueBills.map(trip => {
                    const fd = trip.form_data
                    const payments = fd?.payments || []
                    const collected = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                    const bal = (parseFloat(fd.cashGiven) || 0) + collected - (parseFloat(fd.netTotal) || 0)
                    return (
                      <div key={trip.id} className={`border rounded p-2 transition-colors ${bal < 0 ? 'border-neutral-200 hover:border-red-300' : 'border-amber-200 hover:border-amber-400'}`}>
                        <p className="text-[9px] font-medium text-neutral-800 leading-tight">{fd.customer.name}</p>
                        <p className="text-[7px] text-neutral-400">{fd.customer.date} {trip.id ? `#${trip.id}` : ''}</p>
                        <p className={`text-[11px] font-bold ${bal < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {bal < 0 ? 'Due: ' : 'Excess: '}LKR {Math.abs(bal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {collected > 0 && (
                          <p className="text-[8px] text-emerald-600 font-medium mt-0.5">Collected: LKR {collected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null
        })()}
        {showChequePreview && chequeImagePreview && (
          <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wide">Cheque Preview</p>
                <button onClick={() => setShowChequePreview(false)} className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="rounded-lg border border-neutral-300 overflow-hidden bg-neutral-50 mb-3">
                <img src={chequeImagePreview} alt="Cheque" className="w-full object-contain" />
              </div>

              <div className="flex gap-1 mb-3">
                <label className="flex items-center justify-center gap-1 px-3 py-2 rounded bg-white border border-neutral-400 text-[10px] text-neutral-600 cursor-pointer hover:bg-neutral-50 transition-colors flex-1">
                  <Upload size={12} />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleChequeImageUpload} className="hidden" />
                </label>
                <button onClick={startCamera} className="flex items-center justify-center gap-1 px-3 py-2 rounded bg-white border border-blue-400 text-[10px] text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors flex-1">
                  <Camera size={12} />
                  <span>Camera</span>
                </button>
              </div>

              {!scanSuccess && !ocrLoading && (
                <button onClick={runAiScan} className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
                  <ScanLine size={14} />
                  <span>Scan Cheque with AI</span>
                </button>
              )}

              {ocrLoading && (
                <div className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-700">
                  <Loader2 size={16} className="animate-spin" />
                  <span>AI is scanning the cheque...</span>
                </div>
              )}

              {scanError && (
                <div className="flex items-start gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-red-700">{scanError}</p>
                    <button onClick={runAiScan} className="text-[10px] text-red-600 underline mt-0.5 hover:text-red-800">Retry scan</button>
                  </div>
                </div>
              )}

              {scanSuccess && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
                    <CheckCircle size={14} />
                    <span>Cheque scanned successfully. Review details below.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[7px] text-neutral-500 uppercase font-medium">Bank</label>
                      <input value={chequeBank} onChange={e => setChequeBank(e.target.value)} className="w-full border border-neutral-400 rounded px-1 py-0.5 text-[9px] outline-none focus:border-blue-900 bg-white" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[7px] text-neutral-500 uppercase font-medium">Branch</label>
                      <input value={chequeBranch} onChange={e => setChequeBranch(e.target.value)} className="w-full border border-neutral-400 rounded px-1 py-0.5 text-[9px] outline-none focus:border-blue-900 bg-white" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[7px] text-neutral-500 uppercase font-medium">Cheque No</label>
                      <input value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} className="w-full border border-neutral-400 rounded px-1 py-0.5 text-[9px] outline-none focus:border-blue-900 bg-white" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[7px] text-neutral-500 uppercase font-medium">Account No</label>
                      <input value={chequeAccount} onChange={e => setChequeAccount(e.target.value)} className="w-full border border-neutral-400 rounded px-1 py-0.5 text-[9px] outline-none focus:border-blue-900 bg-white" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[7px] text-neutral-500 uppercase font-medium">Amount</label>
                      <input value={chequeAmount} onChange={e => setChequeAmount(e.target.value)} className="w-full border border-neutral-400 rounded px-1 py-0.5 text-[9px] outline-none focus:border-blue-900 bg-white" />
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <label className="text-[7px] text-neutral-500 uppercase font-medium">Account Name</label>
                      <input value={chequeAccountName} onChange={e => setChequeAccountName(e.target.value)} className="w-full border border-neutral-400 rounded px-1 py-0.5 text-[9px] outline-none focus:border-blue-900 bg-white" />
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <label className="text-[7px] text-neutral-500 uppercase font-medium">Cheque Date</label>
                      <input type="date" value={chequeDate} onChange={e => setChequeDate(e.target.value)} className="w-full border border-neutral-400 rounded px-1 py-0.5 text-[9px] outline-none focus:border-blue-900 bg-white" />
                    </div>
                  </div>
                  <button onClick={() => setShowChequePreview(false)} className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-medium transition-colors">
                    <CheckCircle size={12} />
                    <span>Done</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showCamera && (
          <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                <span className="text-xs font-semibold text-neutral-700">Capture Cheque</span>
                <button onClick={stopCamera} className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="relative bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex items-center justify-center py-4">
                <button onClick={capturePhoto} className="w-14 h-14 rounded-full border-[3px] border-neutral-400 bg-white hover:bg-neutral-50 transition-colors shadow" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceForm
