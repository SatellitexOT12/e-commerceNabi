import React, { useState, useEffect, useRef } from 'react'
import { getOrders, saveOrder, updateOrderStatus, deleteOrder, updateOrderDeliveryDate, Order } from '../services/orders'
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/products'
import { getAgregos, getAllAgregos, createAgregado, updateAgregado, deleteAgregado, Agregado as AgregadoDB } from '../services/agregos'
import { Product } from '../contexts/CartContext'
import { getCurrentUser, signIn, signOut } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatPrice } from '../utils/formatPrice'
import { getAgregosConEnvaseAuto, calcularEnvasesNecesarios } from '../utils/envaseCalculator'
import './Admin.css'
import toast from 'react-hot-toast'

export const Admin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [agregos, setAgregos] = useState<AgregadoDB[]>([])
  const [allAgregos, setAllAgregos] = useState<AgregadoDB[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'agregos' | 'finanzas'>('products')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loggingIn, setLoggingIn] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    imagen_url: '',
    disponible: 'true',
    reinversion: '',
    fondo: ''
  })

  const [agregosFormData, setAgregosFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'Cremes',
    disponible: 'true',
    reinversion: '',
    fondo: ''
  })
  const [editingAgrego, setEditingAgrego] = useState<AgregadoDB | null>(null)
   const [showAgregosModal, setShowAgregosModal] = useState(false)
   const [showManualOrder, setShowManualOrder] = useState(false)
   type AgregadoConCantidad = AgregadoDB & { cantidad?: number }

   const [manualOrder, setManualOrder] = useState({
     cliente_nombre: '',
     cliente_telefono: '',
     fecha_entrega: '',
     items: [] as { 
       product: Product; 
       quantity: number; 
       agregos?: AgregadoConCantidad[]; 
       incluirEnvase?: boolean 
     }[],
     total: 0
   })
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [selectedProductForAgregos, setSelectedProductForAgregos] = useState<Product | null>(null)
  const [showAgregosSelector, setShowAgregosSelector] = useState(false)
  const [selectedAgregos, setSelectedAgregos] = useState<Record<string, number>>({})
  const [agregosForProduct, setAgregosForProduct] = useState<AgregadoDB[]>([])
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const [editingDeliveryDate, setEditingDeliveryDate] = useState<{ orderId: string; date: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      if (user) {
        setIsAuthenticated(true)
        loadData()
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const loadData = async () => {
    try {
      const [ordersData, productsData, agregosData] = await Promise.all([getOrders(), getProducts(), getAgregos()])
      setOrders(ordersData)
      setProducts(productsData)
      setAgregos(agregosData)
      // Also load all agregos (including unavailable) for envase calculations
      const allData = await getAllAgregos()
      setAllAgregos(allData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    try {
      await signIn(loginData.email, loginData.password)
      setIsAuthenticated(true)
      setShowLoginForm(false)
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setIsAuthenticated(false)
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="admin">
        <div className="admin-container">
          <div className="login-box">
            <h1>Panel de Administración</h1>
            {!showLoginForm ? (
              <div className="login-options">
                <p>Inicia sesión para gestionar productos</p>
                <button className="btn-primary" onClick={() => setShowLoginForm(true)}>
                  Iniciar Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={loggingIn}>
                    {loggingIn ? 'Entrando...' : 'Iniciar Sesión'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowLoginForm(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', precio: '', categoria: '', imagen_url: '', disponible: 'true', reinversion: '', fondo: '' })
    setEditingProduct(null)
    setImageFile(null)
    setImagePreview('')
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      categoria: product.categoria,
      imagen_url: product.imagen_url,
      disponible: product.disponible.toString(),
      reinversion: product.reinversion?.toString() || '',
      fondo: product.fondo?.toString() || ''
    })
    setImagePreview(product.imagen_url)
    setImageFile(null)
    setShowModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!useUrlInput && !imageFile && !editingProduct) {
      toast.error('Selecciona una imagen')
      return
    }
    if (useUrlInput && !formData.imagen_url) {
      toast.error('Ingresa una URL de imagen')
      return
    }
    setSaving(true)
    try {
      let imagen_url = formData.imagen_url
      if (!useUrlInput && imageFile) {
        imagen_url = await uploadProductImage(imageFile)
      }

      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        imagen_url,
        disponible: formData.disponible === 'true',
        reinversion: parseFloat(formData.reinversion) || 0,
        fondo: parseFloat(formData.fondo) || 0
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        toast.success('Producto actualizado')
      } else {
        await createProduct(productData)
        toast.success('Producto creado')
      }

      const productsData = await getProducts()
      setProducts(productsData)
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await deleteProduct(id)
      toast.success('Producto eliminado')
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error al eliminar el producto')
    }
  }

  const handleDeleteAgrego = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este agregado?')) return
    try {
      await deleteAgregado(id)
      toast.success('Agregado eliminado')
      const agregosData = await getAgregos()
      setAgregos(agregosData)
    } catch (error) {
      console.error('Error deleting agregado:', error)
      toast.error('Error al eliminar el agregado')
    }
  }

  const resetAgregosForm = () => {
    setAgregosFormData({ nombre: '', precio: '', categoria: 'Cremes', disponible: 'true', reinversion: '', fondo: '' })
    setEditingAgrego(null)
  }

  const openAgregosModal = (agregado?: AgregadoDB) => {
    if (agregado) {
      setEditingAgrego(agregado)
      setAgregosFormData({
        nombre: agregado.nombre,
        precio: agregado.precio.toString(),
        categoria: agregado.categoria,
        disponible: agregado.disponible.toString(),
        reinversion: agregado.reinversion?.toString() || '',
        fondo: agregado.fondo?.toString() || ''
      })
    } else {
      resetAgregosForm()
    }
    setShowAgregosModal(true)
  }

  const handleAgregosSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const agregadoData = {
        nombre: agregosFormData.nombre,
        precio: parseFloat(agregosFormData.precio),
        categoria: agregosFormData.categoria,
        disponible: agregosFormData.disponible === 'true',
        reinversion: parseFloat(agregosFormData.reinversion) || 0,
        fondo: parseFloat(agregosFormData.fondo) || 0
      }

      if (editingAgrego) {
        await updateAgregado(editingAgrego.id, agregadoData)
        toast.success('Agregado actualizado')
      } else {
        await createAgregado(agregadoData)
        toast.success('Agregado creado')
      }

      const agregosData = await getAgregos()
      setAgregos(agregosData)
      setShowAgregosModal(false)
      resetAgregosForm()
    } catch (error) {
      console.error('Error saving agregado:', error)
      toast.error('Error al guardar el agregado')
    }
  }

   const handleDeleteOrder = async (id: string) => {
     if (!confirm('¿Estás seguro de eliminar este pedido?')) return
     try {
       await deleteOrder(id)
       toast.success('Pedido eliminado')
       const ordersData = await getOrders()
       setOrders(ordersData)
     } catch (error) {
       console.error('Error deleting order:', error)
       toast.error('Error al eliminar el pedido')
     }
   }

  const saveManualOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (manualOrder.items.length === 0) {
        toast.error('Agrega al menos un producto')
        return
      }

      if (!manualOrder.fecha_entrega) {
        toast.error('Selecciona una fecha de entrega')
        return
      }

      const total = calculateManualTotal()

      const orderData = {
        cliente_nombre: manualOrder.cliente_nombre || 'Venta Manual',
        cliente_telefono: manualOrder.cliente_telefono || '',
        cliente_direccion: '',
        productos: manualOrder.items,
        total,
        estado: 'pendiente',
        fecha_entrega: manualOrder.fecha_entrega
      }

      await saveOrder(orderData)
      toast.success('Venta manual registrada')
      
      const ordersData = await getOrders()
      setOrders(ordersData)
      
      setManualOrder({ cliente_nombre: '', cliente_telefono: '', fecha_entrega: '', items: [], total: 0 })
      setShowManualOrder(false)
    } catch (error) {
      console.error('Error saving manual order:', error)
      toast.error('Error al registrar la venta')
    }
  }

  const addProductToManualOrder = (product: Product) => {
    const needsAgregos = product.categoria === 'Crepes' || product.categoria === 'Combos de Crepes' || product.categoria === 'Combos Mixtos' || product.categoria?.includes('Crepe')

    // Check if product qualifies for automatic envase (Mini Donas or Crepes)
    const calificaParaEnvase = product.categoria === 'Mini Donas' || product.categoria === 'Crepes'

    if (needsAgregos) {
      setSelectedProductForAgregos(product)
      setSelectedAgregos({})
      fetchAgregosForProduct(product)
      setShowAgregosSelector(true)
    } else {
      // For Mini Donas and other products, auto-add Envase based on all agregos
      const agregosBase: AgregadoConCantidad[] = []
      const agregosFinales = calificaParaEnvase 
        ? getAgregosConEnvaseAuto(product, 1, agregosBase, allAgregos) as AgregadoConCantidad[]
        : []

      setManualOrder(prev => ({
        ...prev,
        items: [...prev.items, { 
          product, 
          quantity: 1, 
          agregos: agregosFinales.length > 0 ? agregosFinales : undefined,
          incluirEnvase: calificaParaEnvase // Default true for products that qualify
        }]
      }))
      setShowProductSelector(false)
    }
  }

  const fetchAgregosForProduct = async (product: Product) => {
    try {
      // Only fetch available agregos for UI selection
      const data = await getAgregos()
      setAgregosForProduct(data)
    } catch (error) {
      console.error('Error fetching agregos:', error)
    }
  }

  const confirmAddProductWithAgregos = () => {
    if (!selectedProductForAgregos) return

    const agregosList: AgregadoConCantidad[] = Object.entries(selectedAgregos).map(([id, cantidad]) => {
      const agg = agregosForProduct.find(a => a.id === id)!
      return { ...agg, cantidad } as AgregadoConCantidad
    })

    // Determine if this product qualifies for automatic envase
    const calificaParaEnvase = selectedProductForAgregos.categoria === 'Mini Donas' || selectedProductForAgregos.categoria === 'Crepes'

    // Agregar envase automáticamente si aplica y está habilitado
    let agregosFinales = agregosList
    if (calificaParaEnvase) {
      agregosFinales = getAgregosConEnvaseAuto(selectedProductForAgregos, 1, agregosList, allAgregos) as AgregadoConCantidad[]
    }

    setManualOrder(prev => ({
      ...prev,
      items: [...prev.items, { 
        product: selectedProductForAgregos, 
        quantity: 1, 
        agregos: agregosFinales,
        incluirEnvase: calificaParaEnvase // Default true for qualifying products
      }]
    }))

    setSelectedProductForAgregos(null)
    setSelectedAgregos({})
    setShowAgregosSelector(false)
  }

  const removeManualItem = (productId: string) => {
    setManualOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product.id !== productId)
    }))
  }

   const updateManualItemQuantity = (productId: string, newQuantity: number) => {
     if (newQuantity <= 0) {
       removeManualItem(productId)
       return
     }
 
     setManualOrder(prev => ({
       ...prev,
       items: prev.items.map(item => {
         if (item.product.id !== productId) return item
 
         // Solo recalcular envase si el flag incluirEnvase está activo
         let agregosConEnvase = item.agregos
         if (item.incluirEnvase !== false) {
           const agregosBase = item.agregos?.filter(agg => agg.nombre.toLowerCase() !== 'envase') || []
           agregosConEnvase = getAgregosConEnvaseAuto(item.product, newQuantity, agregosBase, allAgregos) as AgregadoConCantidad[]
         }
 
         return {
           ...item,
           quantity: newQuantity,
           agregos: agregosConEnvase
         }
       })
     }))
   }
 
   const toggleEnvase = (productId: string) => {
    setManualOrder(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.product.id !== productId) return item

        const currentlyIncluye = item.incluirEnvase || false
        const newIncluir = !currentlyIncluye

        if (!newIncluir) {
          // Quitar el envase
          const agregosSinEnvase = item.agregos?.filter(agg => agg.nombre.toLowerCase() !== 'envase') || []
          return { ...item, incluirEnvase: false, agregos: agregosSinEnvase }
        } else {
          // Añadir el envase con la cantidad necesaria
          const envasesNecesarios = calcularEnvasesNecesarios(item.product, item.quantity)
          const agregosBase = item.agregos?.filter(agg => agg.nombre.toLowerCase() !== 'envase') || []
          const agregosConEnvase = getAgregosConEnvaseAuto(item.product, item.quantity, agregosBase, allAgregos) as AgregadoConCantidad[]
          return { ...item, incluirEnvase: true, agregos: agregosConEnvase }
        }
      })
    }))
  }

  const calculateManualTotal = () => {
    return manualOrder.items.reduce((sum, item) => {
      const basePrice = item.product.precio * item.quantity
      const agregosPrice = item.agregos?.reduce((a, agg) => a + (agg.precio * (agg.cantidad || 1)), 0) || 0
      return sum + basePrice + agregosPrice
    }, 0)
  }

  const handleSaveDeliveryDate = async () => {
    if (!editingDeliveryDate) return
    try {
      await updateOrderDeliveryDate(editingDeliveryDate.orderId, editingDeliveryDate.date)
      const ordersData = await getOrders()
      setOrders(ordersData)
      toast.success('Fecha de entrega actualizada')
      setEditingDeliveryDate(null)
    } catch (error) {
      console.error('Error updating delivery date:', error)
      toast.error('Error al actualizar la fecha')
    }
  }

  const renderProductSummary = (productos: any[]) => {
    if (!productos || productos.length === 0) return 'Sin productos'
    const summary = productos.slice(0, 2).map(item => `${item.product?.nombre || item.nombre} x${item.quantity}`).join(', ')
    if (productos.length > 2) {
      return `${summary} +${productos.length - 2} más`
    }
    return summary
  }

  return (
    <div className="admin">
      <div className="admin-container">
        <h1>Panel de Administración</h1>

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Productos</button>
          <button className={`tab-btn ${activeTab === 'agregos' ? 'active' : ''}`} onClick={() => setActiveTab('agregos')}>Agregos</button>
          <button className={`tab-btn ${activeTab === 'finanzas' ? 'active' : ''}`} onClick={() => setActiveTab('finanzas')}>Finanzas</button>
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Pedidos</button>
        </div>

        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Gestión de Productos</h2>
              <div className="header-actions">
                <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
                <button className="btn-primary" onClick={openAddModal}>Agregar Producto</button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Cargando productos...</div>
            ) : products.length === 0 ? (
              <div className="no-data">No hay productos</div>
            ) : (
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                     {products.map(product => (
                       <tr key={product.id}>
                         <td><img src={product.imagen_url} alt={product.nombre} className="product-thumb" /></td>
                         <td>{product.nombre}</td>
                         <td>{product.categoria}</td>
                         <td>{formatPrice(product.precio)}</td>
                         <td>
                           <span className={`status-badge ${product.disponible ? 'available' : 'unavailable'}`}>
                             {product.disponible ? 'Disponible' : 'No disponible'}
                           </span>
                         </td>
                         <td>
                           <button className="btn-edit" onClick={() => openEditModal(product)}>Editar</button>
                           <button className="btn-delete" onClick={() => handleDelete(product.id)}>Eliminar</button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'agregos' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Gestión de Agregos</h2>
              <button className="btn-primary" onClick={() => openAgregosModal()}>Agregar Agregado</button>
            </div>

            {loading ? (
              <div className="loading">Cargando agregos...</div>
            ) : agregos.length === 0 ? (
              <div className="no-data">No hay agregos</div>
            ) : (
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                     {agregos.map(agregado => (
                       <tr key={agregado.id}>
                         <td>{agregado.nombre}</td>
                         <td>{agregado.categoria}</td>
                         <td>{formatPrice(agregado.precio)}</td>
                         <td>
                           <span className={`status-badge ${agregado.disponible ? 'available' : 'unavailable'}`}>
                             {agregado.disponible ? 'Disponible' : 'No disponible'}
                           </span>
                         </td>
                         <td>
                           <button className="btn-edit" onClick={() => openAgregosModal(agregado)}>Editar</button>
                           <button className="btn-delete" onClick={() => handleDeleteAgrego(agregado.id)}>Eliminar</button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'finanzas' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Dashboard Financiero</h2>
              <button className="btn-primary" onClick={() => setShowManualOrder(true)}>+ Añadir Venta Manual</button>
            </div>

            {showManualOrder && (
              <div className="manual-order-form">
                <h3>Nueva Venta Manual</h3>
                <form onSubmit={saveManualOrder}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cliente (opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Nombre del cliente"
                        value={manualOrder.cliente_nombre}
                        onChange={e => setManualOrder({ ...manualOrder, cliente_nombre: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono (opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Número de teléfono"
                        value={manualOrder.cliente_telefono}
                        onChange={e => setManualOrder({ ...manualOrder, cliente_telefono: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha de Entrega *</label>
                      <input 
                        type="date" 
                        value={manualOrder.fecha_entrega}
                        onChange={e => setManualOrder({ ...manualOrder, fecha_entrega: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="manual-items-section">
                    <div className="section-header">
                      <h4>Productos</h4>
                      <button 
                        type="button" 
                        className="btn-add-item"
                        onClick={() => setShowProductSelector(true)}
                      >
                        + Agregar Producto
                      </button>
                    </div>

                      {manualOrder.items.length === 0 ? (
                        <p className="no-items">No hay productos agregados</p>
                      ) : (
                        <div className="manual-items-list">
                          {manualOrder.items.map((item, idx) => {
                            const calificaParaEnvase = item.product.categoria === 'Mini Donas' || item.product.categoria === 'Crepes'
                            return (
                              <div key={`${item.product.id}-${idx}`} className="manual-item">
                                <div className="item-info">
                                  <span>{item.product.nombre} x{item.quantity}</span>
                                  <span>{formatPrice(item.product.precio * item.quantity)}</span>
                                </div>
                                {item.agregos && item.agregos.length > 0 && (
                                  <div className="item-agregos">
                                    {item.agregos.map((ag, i) => (
                                      <span key={i} className="agrego-tag">
                                        + {ag.nombre} x{ag.cantidad || 1} ({formatPrice(ag.precio * (ag.cantidad || 1))})
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="item-actions">
                                  <div className="item-quantity">
                                    <button 
                                      type="button"
                                      className="qty-btn"
                                      onClick={() => updateManualItemQuantity(item.product.id, item.quantity - 1)}
                                    >
                                      -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button 
                                      type="button"
                                      className="qty-btn"
                                      onClick={() => updateManualItemQuantity(item.product.id, item.quantity + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  {calificaParaEnvase && (
                                    <label className="envase-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={item.incluirEnvase !== false}
                                        onChange={() => toggleEnvase(item.product.id)}
                                      />
                                      Envase
                                    </label>
                                  )}
                                  <button 
                                    type="button" 
                                    className="btn-remove-item"
                                    onClick={() => removeManualItem(item.product.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            )
                           })}
                          </div>
                        )}
                   </div>

                  <div>
                    <label>Total Calculado ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={calculateManualTotal().toFixed(2)}
                      readOnly
                      className="total-display"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">Guardar Venta</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowManualOrder(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {showProductSelector && (
              <div className="modal-overlay" onClick={() => setShowProductSelector(false)}>
                <div className="modal product-selector-modal" onClick={e => e.stopPropagation()}>
                  <h3>Seleccionar Producto</h3>
                  {loading ? (
                    <div className="loading">Cargando productos...</div>
                  ) : products.length === 0 ? (
                    <div className="no-data">No hay productos disponibles</div>
                  ) : (
                    <div className="products-grid-selector">
                      {products.filter(p => p.disponible).map(product => (
                        <div 
                          key={product.id} 
                          className="product-selector-card"
                          onClick={() => addProductToManualOrder(product)}
                        >
                          <img src={product.imagen_url} alt={product.nombre} />
                          <h4>{product.nombre}</h4>
                          <p className="price">{formatPrice(product.precio)}</p>
                          {product.reinversion !== undefined && product.fondo !== undefined && (
                            <p className="costs">
                              Reinversión: {formatPrice(product.reinversion)} | Fondo: {formatPrice(product.fondo)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="btn-secondary close-selector"
                    onClick={() => setShowProductSelector(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {showAgregosSelector && selectedProductForAgregos && (
              <div className="modal-overlay" onClick={() => setShowAgregosSelector(false)}>
                <div className="modal agregos-selector-modal" onClick={e => e.stopPropagation()}>
                  <h3>Selecciona agregos para {selectedProductForAgregos.nombre}</h3>
                  
                  {agregosForProduct.length === 0 ? (
                    <p className="no-agregos">No hay agregos disponibles</p>
                  ) : (
                    <div className="agregos-list-selector">
                      {agregosForProduct.map(agg => {
                        const cantidad = selectedAgregos[agg.id] || 0
                        return (
                          <div key={agg.id} className="agrego-selector-item">
                            <div className="agrego-info">
                              <span className="agrego-nombre">{agg.nombre}</span>
                              <span className="agrego-precio">+{formatPrice(agg.precio)} c/u</span>
                            </div>
                            <div className="agrego-cantidad">
                              <button 
                                type="button"
                                className="qty-btn"
                                onClick={() => {
                                  setSelectedAgregos(prev => {
                                    const current = prev[agg.id] || 0
                                    const newQty = Math.max(0, current - 1)
                                    if (newQty === 0) {
                                      const { [agg.id]: _, ...rest } = prev
                                      return rest
                                    }
                                    return { ...prev, [agg.id]: newQty }
                                  })
                                }}
                              >
                                -
                              </button>
                              <span className="qty-value">{cantidad}</span>
                              <button 
                                type="button"
                                className="qty-btn"
                                onClick={() => {
                                  setSelectedAgregos(prev => ({
                                    ...prev,
                                    [agg.id]: (prev[agg.id] || 0) + 1
                                  }))
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setShowAgregosSelector(false)
                        setSelectedProductForAgregos(null)
                        setSelectedAgregos({})
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={confirmAddProductWithAgregos}
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="loading">Cargando datos...</div>
            ) : orders.length === 0 ? (
              <div className="no-data">No hay ventas registradas</div>
            ) : (
              <>
                {(() => {
                  // Initialize daily aggregation
                  const dailySales: any = {}
                  let totalVendidoAll = 0
                  let reinversionAll = 0
                  let fondoAll = 0
                  let gananciaBrutaAll = 0

                  // Track product quantities for pie chart
                  const productQuantities: Record<string, { nombre: string; cantidad: number; color: string }> = {}

                  // Helper function for product colors
                  function getProductColor(categoria: string): string {
                    const colors: Record<string, string> = {
                      'Mini Donas': '#ff6b6b',
                      'Combos de Donas': '#ee5a5a',
                      'Crepes': '#4ecdc4',
                      'Combos de Crepes': '#45b7af',
                      'Combos Mixtos': '#9b59b6',
                      'Bebidas': '#3498db',
                      'Postres': '#f39c12'
                    }
                    return colors[categoria || ''] || '#95a5a6'
                  }

                  // Track product quantities for pie chart
                  orders.filter(order => order.estado === 'completado').forEach(order => {
                    const fecha = new Date(order.fecha).toLocaleDateString('es-ES')
                    if (!dailySales[fecha]) {
                      dailySales[fecha] = { fecha, total: 0, reinversion: 0, fondo: 0, gananciaBruta: 0 }
                    }
                    dailySales[fecha].total += order.total || 0
                    totalVendidoAll += order.total || 0

                    // Process each product in the order
                    order.productos?.forEach((item: any) => {
                      const product = item.product
                      const quantity = item.quantity || 1

                      // Track product quantities
                      if (product?.id && product?.nombre) {
                        if (!productQuantities[product.id]) {
                          productQuantities[product.id] = { 
                            nombre: product.nombre, 
                            cantidad: 0, 
                            color: getProductColor(product.categoria) 
                          }
                        }
                        productQuantities[product.id].cantidad += quantity
                      }

                      // Calculate reinversion and fondo from product
                      const productReinversion = (product?.reinversion || 0) * quantity
                      const productFondo = (product?.fondo || 0) * quantity

                      dailySales[fecha].reinversion += productReinversion
                      dailySales[fecha].fondo += productFondo
                      reinversionAll += productReinversion
                      fondoAll += productFondo

                      // Calculate gross profit for this product line
                      const productGananciaBruta = (product?.precio || 0) * quantity - productReinversion - productFondo
                      dailySales[fecha].gananciaBruta += productGananciaBruta
                      gananciaBrutaAll += productGananciaBruta

                      // Process agregos if present
                      if (item.agregos && Array.isArray(item.agregos)) {
                        item.agregos.forEach((agrego: any) => {
                          const agregoQty = agrego.cantidad || 1

                          const agregoReinversion = (agrego?.reinversion || 0) * agregoQty
                          const agregoFondo = (agrego?.fondo || 0) * agregoQty

                          dailySales[fecha].reinversion += agregoReinversion
                          dailySales[fecha].fondo += agregoFondo
                          reinversionAll += agregoReinversion
                          fondoAll += agregoFondo

                          const agregoGananciaBruta = (agrego?.precio || 0) * agregoQty - agregoReinversion - agregoFondo
                          dailySales[fecha].gananciaBruta += agregoGananciaBruta
                          gananciaBrutaAll += agregoGananciaBruta
                        })
                      }
                    })
                  })

                   // Convert product quantities to array for pie chart
                   const pieData = Object.values(productQuantities)
                     .filter(p => p.cantidad > 0)
                     .sort((a, b) => b.cantidad - a.cantidad)
                     .slice(0, 10) // Top 10 products

                   const chartData = Object.values(dailySales).reverse()
                  const ahorroAll = gananciaBrutaAll * 0.3
                  const gananciaPersonalAll = gananciaBrutaAll * 0.7

                  return (
                    <>
                      <div className="chart-container">
                        <h3>Ventas Diarias</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#5d4037" strokeWidth={2} name="Ventas ($)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="finanzas-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Total</th>
                              <th>Reinversión</th>
                              <th>Fondo</th>
                              <th>Gan. Bruta</th>
                              <th>Ahorro</th>
                              <th>Gan. Personal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(dailySales).reverse().map((day: any, idx) => (
                              <tr key={idx}>
                                <td>{day.fecha}</td>
                                <td>{formatPrice(day.total)}</td>
                                <td>{formatPrice(day.reinversion)}</td>
                                <td>{formatPrice(day.fondo)}</td>
                                <td>{formatPrice(day.gananciaBruta)}</td>
                                <td className="ahorro-cell">{formatPrice(day.gananciaBruta * 0.3)}</td>
                                <td className="personal-cell">{formatPrice(day.gananciaBruta * 0.7)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="finanzas-totales">
                        <h3>Totales Acumulados</h3>
                        <div className="totales-grid">
                          <div className="total-item">
                            <span className="total-label">Total Vendido</span>
                            <span className="total-value">{formatPrice(totalVendidoAll)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Reinversión</span>
                            <span className="total-value">{formatPrice(reinversionAll)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Fondo</span>
                            <span className="total-value">{formatPrice(fondoAll)}</span>
                          </div>
                          <div className="total-item highlight">
                            <span className="total-label">Ganancia Bruta Total</span>
                            <span className="total-value">{formatPrice(gananciaBrutaAll)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Ahorro (30%)</span>
                            <span className="total-value ahorro">{formatPrice(ahorroAll)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Ganancia Personal (70%)</span>
                            <span className="total-value personal">{formatPrice(gananciaPersonalAll)}</span>
                          </div>
                        </div>
                      </div>

                      {pieData.length > 0 && (
                        <div className="product-pie-chart">
                          <h3>Productos Más Vendidos</h3>
                          <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percent, payload }) => `${payload.nombre}: ${payload.cantidad} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="cantidad"
                                nameKey="nombre"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => [`${value} unidades`, 'Cantidad']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </>
                  )
                })()}
              </>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="tab-content">
            <h2>Pedidos Recibidos</h2>

            {loading ? (
              <div className="loading">Cargando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className="no-data">No hay pedidos</div>
            ) : (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Total</th>
                      <th>Fecha Pedido</th>
                      <th>Fecha Entrega</th>
                      <th>Estado</th>
                      <th>Productos</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                     {orders.map(order => (
                       <React.Fragment key={order.id}>
                         <tr>
                           <td>
                             <button 
                               className="expand-btn"
                               onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                               style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}
                             >
                               {expandedOrders[order.id] ? '▼' : '▶'}
                             </button>
                           </td>
                           <td>{order.cliente_nombre}</td>
                           <td>{order.cliente_telefono}</td>
                           <td>{formatPrice(order.total)}</td>
                           <td>{new Date(order.fecha).toLocaleDateString()}</td>
                           <td>{order.fecha_entrega ? new Date(order.fecha_entrega).toLocaleDateString() : '-'}</td>
                           <td>
                             <span className={`status ${order.estado === 'completado' ? 'completed' : ''}`}>
                               {order.estado}
                             </span>
                           </td>
                            <td>{renderProductSummary(order.productos)}</td>
                            <td>
                              <button 
                                className="btn-edit-date"
                                onClick={() => setEditingDeliveryDate({ orderId: order.id, date: order.fecha_entrega || '' })}
                                title="Editar fecha de entrega"
                              >
                                📅 Fecha
                              </button>
                              {order.estado !== 'completado' && (
                                <button 
                                  className="btn-complete"
                                  onClick={async () => {
                                    try {
                                      await updateOrderStatus(order.id, 'completado')
                                      const ordersData = await getOrders()
                                      setOrders(ordersData)
                                      toast.success('Pedido completado')
                                    } catch (error) {
                                      console.error('Error completing order:', error)
                                      toast.error('Error al completar pedido')
                                    }
                                  }}
                                >
                                  ✓ Completar
                                </button>
                              )}
                              <button 
                                className="btn-delete-order"
                                onClick={() => handleDeleteOrder(order.id)}
                                title="Eliminar pedido"
                              >
                                🗑️ Eliminar
                              </button>
                            </td>
                         </tr>
                         {expandedOrders[order.id] && (
                           <tr className="expanded-row">
                             <td colSpan={8}>
                               <div className="products-details">
                                 <h4>Detalles de productos:</h4>
                                 <div className="products-list">
                                   {order.productos.map((item, idx) => (
                                     <div key={idx} className="product-item-detail">
                                       <div className="product-name">{item.product?.nombre || 'Producto'}</div>
                                       <div className="product-qty">Cantidad: {item.quantity}</div>
                                       <div className="product-price">{formatPrice((item.product?.precio || 0) * item.quantity)}</div>
                                       {item.agregos && item.agregos.length > 0 && (
                                         <div className="product-agregos">
                                           <span className="agregos-label">+ Agregos:</span>
                                           {item.agregos.map((ag, i) => (
                                             <span key={i} className="agrego-detail">
                                               {ag.nombre} x{ag.cantidad || 1}
                                             </span>
                                           ))}
                                         </div>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </td>
                           </tr>
                         )}
                       </React.Fragment>
                     ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingDeliveryDate && (
              <div className="modal-overlay" onClick={() => setEditingDeliveryDate(null)}>
                <div className="modal edit-delivery-modal" onClick={e => e.stopPropagation()}>
                  <h3>Editar Fecha de Entrega</h3>
                  <div className="form-group">
                    <label>Fecha de Entrega</label>
                    <input
                      type="date"
                      value={editingDeliveryDate.date}
                      onChange={(e) => setEditingDeliveryDate({ ...editingDeliveryDate, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleSaveDeliveryDate}
                    >
                      Guardar
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setEditingDeliveryDate(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Precio</label>
                  <input type="number" step="0.01" value={formData.precio} onChange={e => setFormData({ ...formData, precio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <input type="text" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Imagen</label>
                  <div className="image-input-toggle">
                    <button
                      type="button"
                      className={`toggle-btn ${!useUrlInput ? 'active' : ''}`}
                      onClick={() => setUseUrlInput(false)}
                    >
                      Subir archivo
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${useUrlInput ? 'active' : ''}`}
                      onClick={() => setUseUrlInput(true)}
                    >
                      Usar URL
                    </button>
                  </div>
                  {useUrlInput ? (
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={formData.imagen_url}
                      onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                    />
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                      {imagePreview && (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </>
                  )}
                </div>
                 <div className="form-group">
                   <label>Disponible</label>
                   <select value={formData.disponible} onChange={e => setFormData({ ...formData, disponible: e.target.value })}>
                     <option value="true">Sí</option>
                     <option value="false">No</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label>Reinversión (por unidad)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     placeholder="0.00"
                     value={formData.reinversion}
                     onChange={e => setFormData({ ...formData, reinversion: e.target.value })}
                   />
                 </div>
                 <div className="form-group">
                   <label>Fondo (por unidad)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     placeholder="0.00"
                     value={formData.fondo}
                     onChange={e => setFormData({ ...formData, fondo: e.target.value })}
                   />
                 </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAgregosModal && (
          <div className="modal-overlay" onClick={() => setShowAgregosModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>{editingAgrego ? 'Editar Agregado' : 'Agregar Agregado'}</h3>
              <form onSubmit={handleAgregosSubmit}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={agregosFormData.nombre} onChange={e => setAgregosFormData({ ...agregosFormData, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Precio adicional</label>
                  <input type="number" step="0.01" value={agregosFormData.precio} onChange={e => setAgregosFormData({ ...agregosFormData, precio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={agregosFormData.categoria} onChange={e => setAgregosFormData({ ...agregosFormData, categoria: e.target.value })}>
                    <option value="Cremes">Cremes</option>
                    <option value="Chocolates">Chocolates</option>
                    <option value="Frutas">Frutas</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                 <div className="form-group">
                   <label>Disponible</label>
                   <select value={agregosFormData.disponible} onChange={e => setAgregosFormData({ ...agregosFormData, disponible: e.target.value })}>
                     <option value="true">Sí</option>
                     <option value="false">No</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label>Reinversión (por unidad)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     placeholder="0.00"
                     value={agregosFormData.reinversion}
                     onChange={e => setAgregosFormData({ ...agregosFormData, reinversion: e.target.value })}
                   />
                 </div>
                 <div className="form-group">
                   <label>Fondo (por unidad)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     placeholder="0.00"
                     value={agregosFormData.fondo}
                     onChange={e => setAgregosFormData({ ...agregosFormData, fondo: e.target.value })}
                   />
                 </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    {editingAgrego ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAgregosModal(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}