import React, { useState, useEffect, useRef } from 'react'
import { getOrders, saveOrder, updateOrderStatus, Order } from '../services/orders'
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, Product } from '../services/products'
import { getAgregos, createAgregado, updateAgregado, deleteAgregado, Agregado } from '../services/agregos'
import { getCurrentUser, signIn, signOut } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Admin.css'
import toast from 'react-hot-toast'

export const Admin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [agregos, setAgregos] = useState<Agregado[]>([])
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
    disponible: 'true'
  })

  const [agregosFormData, setAgregosFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'Cremes',
    disponible: 'true'
  })
  const [editingAgrego, setEditingAgrego] = useState<Agregado | null>(null)
  const [showAgregosModal, setShowAgregosModal] = useState(false)
  const [showManualOrder, setShowManualOrder] = useState(false)
  const [manualOrder, setManualOrder] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    mini_donas: '',
    crepes: '',
    total: ''
  })

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
    setFormData({ nombre: '', descripcion: '', precio: '', categoria: '', imagen_url: '', disponible: 'true' })
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
      disponible: product.disponible.toString()
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
        disponible: formData.disponible === 'true'
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

  const resetAgregosForm = () => {
    setAgregosFormData({ nombre: '', precio: '', categoria: 'Cremes', disponible: 'true' })
    setEditingAgrego(null)
  }

  const openAgregosModal = (agregado?: Agregado) => {
    if (agregado) {
      setEditingAgrego(agregado)
      setAgregosFormData({
        nombre: agregado.nombre,
        precio: agregado.precio.toString(),
        categoria: agregado.categoria,
        disponible: agregado.disponible.toString()
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
        disponible: agregosFormData.disponible === 'true'
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

  const saveManualOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const miniDonasQty = parseInt(manualOrder.mini_donas) || 0
      const crepesQty = parseInt(manualOrder.crepes) || 0
      const total = parseFloat(manualOrder.total) || 0
      
      const productos = []
      if (miniDonasQty > 0) {
        productos.push({ 
          product: { id: 'manual-minidonas', nombre: 'Mini Donas (Manual)', categoria: 'Mini Donas' }, 
          quantity: miniDonasQty 
        })
      }
      if (crepesQty > 0) {
        productos.push({ 
          product: { id: 'manual-crepes', nombre: 'Crepes (Manual)', categoria: 'Crepes' }, 
          quantity: crepesQty 
        })
      }

      const orderData = {
        cliente_nombre: manualOrder.cliente_nombre || 'Venta Manual',
        cliente_telefono: manualOrder.cliente_telefono || '',
        cliente_direccion: '',
        productos,
        total,
        estado: 'completado'
      }

      await saveOrder(orderData)
      toast.success('Venta manual registrada')
      
      const ordersData = await getOrders()
      setOrders(ordersData)
      
      setManualOrder({ cliente_nombre: '', cliente_telefono: '', mini_donas: '', crepes: '', total: '' })
      setShowManualOrder(false)
    } catch (error) {
      console.error('Error saving manual order:', error)
      toast.error('Error al registrar la venta')
    }
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
                        <td>${product.precio.toFixed(2)}</td>
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
                        <td>${agregado.precio.toFixed(2)}</td>
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
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cantidad Mini Donas</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={manualOrder.mini_donas}
                        onChange={e => setManualOrder({ ...manualOrder, mini_donas: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Cantidad Crepes</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={manualOrder.crepes}
                        onChange={e => setManualOrder({ ...manualOrder, crepes: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Total ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={manualOrder.total}
                      onChange={e => setManualOrder({ ...manualOrder, total: e.target.value })}
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">Guardar Venta</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowManualOrder(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
            
            {loading ? (
              <div className="loading">Cargando datos...</div>
            ) : orders.length === 0 ? (
              <div className="no-data">No hay ventas registradas</div>
            ) : (
              <>
                {(() => {
                  // Calculate daily sales for chart
                  const dailySales: any = {}
                  orders.forEach(order => {
                    const fecha = new Date(order.fecha).toLocaleDateString('es-ES')
                    if (!dailySales[fecha]) {
                      dailySales[fecha] = { fecha, total: 0, miniDonas: 0, crepes: 0 }
                    }
                    dailySales[fecha].total += order.total || 0
                    const miniDonas = order.productos?.filter((p: any) => p.product?.categoria === 'Mini Donas' || p.product?.categoria === 'Combos de Donas').reduce((s: number, p: any) => s + (p.quantity || 1), 0) || 0
                    const crepes = order.productos?.filter((p: any) => p.product?.categoria === 'Crepes' || p.product?.categoria === 'Combos de Crepes').reduce((s: number, p: any) => s + (p.quantity || 1), 0) || 0
                    dailySales[fecha].miniDonas += miniDonas
                    dailySales[fecha].crepes += crepes
                  })
                  
                  const chartData = Object.values(dailySales).reverse()
                  const totalVendidoAll = orders.reduce((sum, o) => sum + (o.total || 0), 0)
                  const totalMiniDonas = orders.reduce((sum, order) => sum + (order.productos?.filter((p: any) => p.product?.categoria === 'Mini Donas' || p.product?.categoria === 'Combos de Donas').reduce((s: number, p: any) => s + (p.quantity || 1), 0) || 0), 0)
                  const totalCrepes = orders.reduce((sum, order) => sum + (order.productos?.filter((p: any) => p.product?.categoria === 'Crepes' || p.product?.categoria === 'Combos de Crepes').reduce((s: number, p: any) => s + (p.quantity || 1), 0) || 0), 0)
                  const reinversionAll = totalVendidoAll * 0.5
                  const fondoAll = totalVendidoAll * 0.5
                  const gananciaBrutaAll = totalVendidoAll - reinversionAll
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
                              <th>Mini Donas</th>
                              <th>Crepes</th>
                              <th>Cantidad</th>
                              <th>Total</th>
                              <th>Reinversión</th>
                              <th>Fondo</th>
                              <th>Gan. Bruta</th>
                              <th>Ahorro</th>
                              <th>Gan. Personal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(dailySales).reverse().map((day: any, idx) => {
                              const gb = day.total * 0.5
                              return (
                                <tr key={idx}>
                                  <td>{day.fecha}</td>
                                  <td>{day.miniDonas}</td>
                                  <td>{day.crepes}</td>
                                  <td>{day.miniDonas + day.crepes}</td>
                                  <td>${day.total.toFixed(2)}</td>
                                  <td>${(day.total * 0.5).toFixed(2)}</td>
                                  <td>${(day.total * 0.5).toFixed(2)}</td>
                                  <td>${gb.toFixed(2)}</td>
                                  <td className="ahorro-cell">${(gb * 0.3).toFixed(2)}</td>
                                  <td className="personal-cell">${(gb * 0.7).toFixed(2)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="finanzas-totales">
                        <h3>Totales Acumulados</h3>
                        <div className="totales-grid">
                          <div className="total-item">
                            <span className="total-label">Total Vendido</span>
                            <span className="total-value">${totalVendidoAll.toFixed(2)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Mini Donas</span>
                            <span className="total-value">{totalMiniDonas}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Crepes</span>
                            <span className="total-value">{totalCrepes}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Reinversión</span>
                            <span className="total-value">${reinversionAll.toFixed(2)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Fondo</span>
                            <span className="total-value">${fondoAll.toFixed(2)}</span>
                          </div>
                          <div className="total-item highlight">
                            <span className="total-label">Ganancia Bruta Total</span>
                            <span className="total-value">${gananciaBrutaAll.toFixed(2)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Ahorro (30%)</span>
                            <span className="total-value ahorro">${ahorroAll.toFixed(2)}</span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">Ganancia Personal (70%)</span>
                            <span className="total-value personal">${gananciaPersonalAll.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
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
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Productos</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.cliente_nombre}</td>
                        <td>{order.cliente_telefono}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>{new Date(order.fecha).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${order.estado === 'completado' ? 'completed' : ''}`}>
                            {order.estado}
                          </span>
                        </td>
                        <td>{order.productos.length} items</td>
                        <td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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