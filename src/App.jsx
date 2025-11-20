import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  onSnapshot,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  ChefHat, 
  UtensilsCrossed, 
  Trash2, 
  Edit2, 
  LogOut, 
  Save,
  Menu as MenuIcon,
  Clock,
  MapPin,
  Phone,
  Star,
  ClipboardList,
  CheckCircle,
  Truck,
  Instagram,
  Facebook,
  Twitter,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE (PROTEGIDO COM VARIÁVEIS DE AMBIENTE)
// ------------------------------------------------------------------
// Nota: No Vite, variáveis de ambiente devem começar com VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Inicialização Segura
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'sabor-arte-local'; 

// --- DADOS DE EXEMPLO (IMAGENS NOVAS E ROBUSTAS) ---
const INITIAL_MENU = [
  {
    name: "Tartare de Wagyu",
    description: "Filé mignon Wagyu picado na ponta da faca, gema curada, mostarda dijon e chips de raízes.",
    price: 68.00,
    category: "entradas",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a3a2b7b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Vieiras Seladas",
    description: "Vieiras canadenses frescas, purê de couve-flor trufado e crocante de pancetta.",
    price: 85.00,
    category: "entradas",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Risoto de Açafrão & Camarão",
    description: "Arroz arbóreo, açafrão importado, camarões rosa grelhados e finalizado com Grana Padano.",
    price: 92.00,
    category: "pratos principais",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Tornedor ao Molho Poivre",
    description: "Corte alto de filé mignon grelhado, molho de pimenta verde suave e batatas gratinadas.",
    price: 110.00,
    category: "pratos principais",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Mousse de Chocolate Belga",
    description: "Chocolate 70% cacau, flor de sal e tuile de amêndoa.",
    price: 38.00,
    category: "sobremesas",
    image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Royal Salute 21 Anos",
    description: "Dose (50ml). Whisky escocês envelhecido.",
    price: 120.00,
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1514218953589-2d7d37efd2dc?auto=format&fit=crop&w=800&q=80"
  }
];

const TESTIMONIALS = [
  { name: "Ana Silva", text: "A melhor experiência gastronômica que já tive em anos. O Wagyu estava divino!", role: "Crítica Gastronômica" },
  { name: "Carlos Mendes", text: "Ambiente sofisticado e atendimento impecável. Perfeito para ocasiões especiais.", role: "Cliente Frequente" },
  { name: "Mariana Costa", text: "A carta de vinhos é surpreendente. Recomendo de olhos fechados.", role: "Sommelier" }
];

// --- COMPONENTES REUTILIZÁVEIS ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm cursor-pointer";
  const variants = {
    primary: "bg-[#C9A86A] text-black hover:bg-[#b09055] hover:shadow-[0_0_15px_rgba(201,168,106,0.4)]",
    secondary: "bg-transparent border border-[#C9A86A] text-[#C9A86A] hover:bg-[#C9A86A] hover:text-black",
    danger: "bg-[#8A1C1C] text-white hover:bg-[#6b1515]",
    success: "bg-green-700 text-white hover:bg-green-600",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-xs uppercase tracking-widest text-[#C9A86A]">{label}</label>
    <input 
      {...props}
      className="bg-[#1A1A1A] border border-[#333] text-[#F5F5F5] p-3 rounded focus:outline-none focus:border-[#C9A86A] transition-colors w-full placeholder-gray-600"
    />
  </div>
);

const SectionTitle = ({ subtitle, title }) => (
  <div className="text-center mb-12">
    <span className="text-[#C9A86A] uppercase tracking-[0.2em] text-sm font-medium">{subtitle}</span>
    <h2 className="font-serif text-4xl md:text-5xl text-[#F5F5F5] mt-2">{title}</h2>
    <div className="w-24 h-1 bg-[#8A1C1C] mx-auto mt-6"></div>
  </div>
);

// --- APP PRINCIPAL ---

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('todas');
  const [notification, setNotification] = useState(null);

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerTable, setCustomerTable] = useState('');

  // Admin State
  const [isEditing, setIsEditing] = useState(false);
  const [adminTab, setAdminTab] = useState('menu');
  const [currentItem, setCurrentItem] = useState({ name: '', price: '', description: '', category: 'entradas', image: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      if (!auth.currentUser) {
         try {
             await signInAnonymously(auth);
         } catch (e) {
             console.error("Erro login anônimo:", e);
         }
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if(currentUser) fetchData(currentUser.uid);
      else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch
  const fetchData = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const qMenu = query(collection(db, 'artifacts', appId, 'public', 'data', 'menu_items'));
      onSnapshot(qMenu, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (items.length === 0) seedDatabase(); 
        else setMenuItems(items);
        setLoading(false);
      });

      const qOrders = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderBy('createdAt', 'desc'));
      onSnapshot(qOrders, (snapshot) => {
        const ords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ords);
      });

    } catch (error) {
      console.error("Erro query:", error);
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    if (!auth.currentUser) return;
    try {
      for (const item of INITIAL_MENU) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'menu_items'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Erro seed:", e);
    }
  };

  // RESTAURAR O MENU
  const handleResetMenu = async () => {
    if (!window.confirm("Isso irá apagar TODOS os itens atuais e restaurar o cardápio original. Tem certeza?")) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'menu_items'));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      for (const item of INITIAL_MENU) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'menu_items'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      
      showNotification("Menu restaurado com sucesso!");
    } catch (error) {
      console.error(error);
      showNotification("Erro ao restaurar menu.");
    } finally {
      setLoading(false);
    }
  };

  // Cart Logic
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
    showNotification(`Adicionado: ${item.name}`);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // CHECKOUT CORRIGIDO
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    try {
      // Verifica e garante autenticação
      let currentUser = auth.currentUser;
      if (!currentUser) {
         const userCred = await signInAnonymously(auth);
         currentUser = userCred.user;
      }

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
        customer: customerName,
        table: customerTable,
        items: cart,
        total: cartTotal,
        status: 'pendente',
        createdAt: serverTimestamp()
      });

      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCustomerName('');
      setCustomerTable('');
      showNotification("Pedido enviado para a cozinha!");
    } catch (error) {
      console.error("Erro checkout:", error);
      showNotification("Erro: " + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setView('admin-dashboard');
      showNotification("Bem-vindo, Chef!");
    } catch (error) {
      if (email === 'admin@sabor.com' && password === '123456') {
         try {
            await createUserWithEmailAndPassword(auth, email, password);
            setView('admin-dashboard');
         } catch(createErr) {
            showNotification("Erro login: " + error.message);
         }
      } else {
         showNotification("Erro de autenticação.");
      }
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!user) return;
    const itemData = { ...currentItem, price: parseFloat(currentItem.price) };
    try {
      if (isEditing && currentItem.id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'menu_items', currentItem.id), itemData);
        showNotification("Prato atualizado!");
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'menu_items'), itemData);
        showNotification("Prato criado!");
      }
      setIsEditing(false);
      setCurrentItem({ name: '', price: '', description: '', category: 'entradas', image: '' });
    } catch (error) {
      showNotification("Erro ao salvar.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Excluir este item?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'menu_items', id));
        showNotification("Item removido.");
      } catch (error) {
        showNotification("Erro ao remover.");
      }
    }
  };

  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
      showNotification(`Pedido ${newStatus}!`);
    } catch (error) {
      showNotification("Erro ao atualizar status.");
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const categories = ['entradas', 'pratos principais', 'sobremesas', 'bebidas'];
  const filteredMenu = activeCategory === 'todas' ? menuItems : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] font-sans flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>

      {/* TOAST */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#C9A86A] text-black px-6 py-3 rounded shadow-lg font-medium animate-pulse border border-[#F5F5F5]/20">
          {notification}
        </div>
      )}

      {/* NAV */}
      <nav className="fixed w-full z-40 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="text-2xl font-serif font-bold text-[#F5F5F5] cursor-pointer flex items-center gap-2" onClick={() => setView('home')}>
             <span className="text-[#C9A86A]">Sabor</span> & Arte
          </div>
          
          <div className="flex gap-4 md:gap-8 text-xs md:text-sm uppercase tracking-widest font-medium order-3 md:order-2 w-full md:w-auto justify-center md:justify-start border-t border-[#222] md:border-none pt-4 md:pt-0">
            <button onClick={() => setView('home')} className={`hover:text-[#C9A86A] transition ${view === 'home' ? 'text-[#C9A86A]' : 'text-gray-400'}`}>Início</button>
            <button onClick={() => setView('menu')} className={`hover:text-[#C9A86A] transition ${view === 'menu' ? 'text-[#C9A86A]' : 'text-gray-400'}`}>Cardápio</button>
            <button onClick={() => setView('admin-login')} className={`hover:text-[#C9A86A] transition ${view.includes('admin') ? 'text-[#C9A86A]' : 'text-gray-400'}`}>Admin</button>
          </div>

          <div className="flex items-center gap-4 order-2 md:order-3">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:text-[#C9A86A] transition group">
              <ShoppingBag size={24} className="group-hover:scale-110 transition"/>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8A1C1C] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow pt-32 md:pt-20">
        
        {/* HOME */}
        {view === 'home' && (
          <>
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80" alt="Background" className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_10s_ease-in-out_infinite]"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent"></div>
              </div>
              <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
                <span className="text-[#C9A86A] uppercase tracking-[0.3em] text-sm md:text-base animate-pulse">Gastronomia Contemporânea</span>
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#F5F5F5] mt-6 mb-8 leading-tight drop-shadow-2xl">O sabor da <br/><i className="text-[#C9A86A]">excelência.</i></h1>
                <Button onClick={() => setView('menu')}>Ver Cardápio Completo</Button>
              </div>
            </section>

            <section className="py-24 bg-[#0D0D0D]">
              <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="relative group">
                  <div className="absolute -top-4 -left-4 w-full h-full border border-[#C9A86A] rounded-sm z-0 transition group-hover:-top-6 group-hover:-left-6"></div>
                  <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80" alt="Chef" className="relative z-10 rounded-sm w-full shadow-2xl grayscale hover:grayscale-0 transition duration-700"/>
                </div>
                <div>
                  <SectionTitle subtitle="Nossa História" title="Tradição & Modernidade" />
                  <p className="text-gray-400 mb-6 leading-relaxed">Fundado em 2024, o Sabor & Arte nasceu do desejo de transformar ingredientes simples em obras de arte comestíveis.</p>
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className="flex flex-col items-center text-center p-4 border border-[#222] rounded hover:border-[#C9A86A] transition"><ChefHat className="text-[#C9A86A] mb-3" size={32} /><h4 className="font-serif text-xl">Chefs Premiados</h4></div>
                    <div className="flex flex-col items-center text-center p-4 border border-[#222] rounded hover:border-[#C9A86A] transition"><UtensilsCrossed className="text-[#C9A86A] mb-3" size={32} /><h4 className="font-serif text-xl">Menu Sazonal</h4></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-24 bg-[#151515]">
               <div className="max-w-7xl mx-auto px-6">
                 <SectionTitle subtitle="O que dizem" title="Experiências" />
                 <div className="grid md:grid-cols-3 gap-8">
                   {TESTIMONIALS.map((t, i) => (
                     <div key={i} className="bg-[#0D0D0D] p-8 rounded border border-[#222] hover:-translate-y-2 transition duration-300">
                       <div className="flex gap-1 text-[#C9A86A] mb-4"><Star size={16} fill="#C9A86A"/><Star size={16} fill="#C9A86A"/><Star size={16} fill="#C9A86A"/><Star size={16} fill="#C9A86A"/><Star size={16} fill="#C9A86A"/></div>
                       <p className="text-gray-300 italic mb-6">"{t.text}"</p>
                       <div>
                         <h5 className="font-serif text-lg text-[#F5F5F5]">{t.name}</h5>
                         <span className="text-xs text-[#C9A86A] uppercase tracking-wider">{t.role}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </section>
          </>
        )}

        {/* MENU */}
        {view === 'menu' && (
          <section className="py-16 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
              <SectionTitle subtitle="Nosso Cardápio" title="Selecione seus Pratos" />
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <button onClick={() => setActiveCategory('todas')} className={`px-6 py-2 rounded-full border ${activeCategory === 'todas' ? 'bg-[#C9A86A] border-[#C9A86A] text-black' : 'border-[#333] text-gray-400 hover:border-[#C9A86A]'} transition`}>Todas</button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full border capitalize ${activeCategory === cat ? 'bg-[#C9A86A] border-[#C9A86A] text-black' : 'border-[#333] text-gray-400 hover:border-[#C9A86A]'} transition`}>{cat}</button>
                ))}
              </div>
              {loading ? (
                <div className="text-center text-[#C9A86A] animate-pulse">Carregando delícias...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredMenu.map(item => (
                    <div key={item.id} className="group bg-[#151515] rounded-lg overflow-hidden hover:bg-[#1a1a1a] transition border border-transparent hover:border-[#333]">
                      <div className="h-64 overflow-hidden relative">
                        <img src={item.image} alt={item.name} onError={(e) => {e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546549010-63b5dd760c13?auto=format&fit=crop&w=800&q=80"}} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-[#C9A86A] px-3 py-1 rounded-full font-serif">R$ {item.price.toFixed(2)}</div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-serif text-[#F5F5F5] mb-2">{item.name}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{item.description}</p>
                        <Button variant="secondary" className="w-full text-xs" onClick={() => addToCart(item)}>Adicionar ao Pedido</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ADMIN LOGIN */}
        {view === 'admin-login' && (
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <div className="w-full max-w-md bg-[#151515] p-8 rounded-lg border border-[#333]">
              <div className="text-center mb-8"><h2 className="text-2xl font-serif text-[#F5F5F5]">Acesso Administrativo</h2></div>
              <form onSubmit={handleLogin}>
                <Input label="Email" type="email" placeholder="admin@sabor.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <Input label="Senha" type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <Button type="submit" className="w-full mt-4">Entrar no Dashboard</Button>
                <div className="mt-4 text-center"><p className="text-xs text-gray-500 mb-2">Credenciais de demonstração:</p><button type="button" className="text-[#C9A86A] text-sm underline" onClick={() => { setEmail('admin@sabor.com'); setPassword('123456'); }}>Preencher Automaticamente</button></div>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {view === 'admin-dashboard' && (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
               <div><h2 className="text-3xl font-serif">Dashboard do Chef</h2><p className="text-gray-400">Gerencie os itens disponíveis no cardápio.</p></div>
               <div className="flex gap-4">
                 <div className="bg-[#1A1A1A] p-1 rounded flex gap-2">
                   <button onClick={() => setAdminTab('menu')} className={`px-4 py-2 rounded text-sm ${adminTab === 'menu' ? 'bg-[#C9A86A] text-black font-bold' : 'text-gray-400'}`}>Cardápio</button>
                   <button onClick={() => setAdminTab('orders')} className={`px-4 py-2 rounded text-sm ${adminTab === 'orders' ? 'bg-[#C9A86A] text-black font-bold' : 'text-gray-400'}`}>Pedidos</button>
                 </div>
                 <Button variant="ghost" onClick={() => { signOut(auth); setView('home'); }}><LogOut size={18} /> Sair</Button>
               </div>
            </div>

            {/* TAB: MENU */}
            {adminTab === 'menu' && (
              <>
                <div className="flex justify-end gap-4 mb-6">
                    <Button variant="danger" onClick={handleResetMenu} disabled={loading}><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Restaurar Padrão</Button>
                    <Button onClick={() => { setCurrentItem({ name: '', price: '', description: '', category: 'entradas', image: '' }); setIsEditing(true); }}><Plus size={18} /> Novo Prato</Button>
                </div>
                {isEditing && (
                  <div className="mb-12 bg-[#1A1A1A] p-8 rounded border border-[#333] animate-fade-in">
                    <h3 className="text-xl mb-6 font-serif text-[#C9A86A]">{currentItem.id ? 'Editar Prato' : 'Novo Prato'}</h3>
                    <form onSubmit={handleSaveItem} className="grid md:grid-cols-2 gap-6">
                      <Input label="Nome do Prato" value={currentItem.name} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} required />
                      <Input label="Preço (R$)" type="number" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} required />
                      <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-[#C9A86A] block mb-1">Descrição</label><textarea className="bg-[#0D0D0D] border border-[#333] text-[#F5F5F5] p-3 rounded w-full focus:border-[#C9A86A] outline-none" rows="3" value={currentItem.description} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} required /></div>
                      <div><label className="text-xs uppercase tracking-widest text-[#C9A86A] block mb-1">Categoria</label><select className="bg-[#0D0D0D] border border-[#333] text-[#F5F5F5] p-3 rounded w-full focus:border-[#C9A86A] outline-none uppercase text-sm" value={currentItem.category} onChange={e => setCurrentItem({...currentItem, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                      <Input label="URL da Imagem" placeholder="https://..." value={currentItem.image} onChange={e => setCurrentItem({...currentItem, image: e.target.value})} required />
                      <div className="md:col-span-2 flex gap-4 justify-end mt-4"><Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button><Button type="submit"><Save size={18} /> Salvar Item</Button></div>
                    </form>
                  </div>
                )}
                <div className="bg-[#151515] rounded overflow-hidden border border-[#222]">
                  <table className="w-full text-left">
                    <thead className="bg-[#222] text-[#C9A86A] uppercase text-xs tracking-wider"><tr><th className="p-4">Imagem</th><th className="p-4">Nome</th><th className="p-4">Categoria</th><th className="p-4">Preço</th><th className="p-4 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y divide-[#222]">
                      {menuItems.map(item => (
                        <tr key={item.id} className="hover:bg-[#1a1a1a] transition">
                          <td className="p-4"><img src={item.image} alt="" onError={(e) => {e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546549010-63b5dd760c13?auto=format&fit=crop&w=800&q=80"}} className="w-12 h-12 object-cover rounded" /></td>
                          <td className="p-4 font-medium">{item.name}</td>
                          <td className="p-4 capitalize text-gray-400">{item.category}</td>
                          <td className="p-4">R$ {item.price.toFixed(2)}</td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button onClick={() => { setCurrentItem(item); setIsEditing(true); window.scrollTo(0,0); }} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-[#8A1C1C] hover:bg-[#8A1C1C]/20 rounded"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB: PEDIDOS */}
            {adminTab === 'orders' && (
                <div className="grid gap-6">
                    {orders.length === 0 && <p className="text-gray-500">Nenhum pedido registrado.</p>}
                    {orders.map(order => (
                        <div key={order.id} className="bg-[#151515] border border-[#222] p-6 rounded flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-xl text-[#F5F5F5] font-bold">Mesa {order.table} <span className="text-gray-500 text-sm font-normal">| {order.customer}</span></h3>
                                    <span className={`px-3 py-1 rounded-full text-xs uppercase font-bold ${
                                        order.status === 'pendente' ? 'bg-yellow-900/30 text-yellow-500' :
                                        order.status === 'pronto' ? 'bg-blue-900/30 text-blue-400' :
                                        'bg-green-900/30 text-green-500'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <ul className="text-gray-400 text-sm space-y-1 mb-4">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>{item.quantity}x {item.name}</li>
                                    ))}
                                </ul>
                                <div className="font-serif text-[#C9A86A] text-lg">Total: R$ {order.total.toFixed(2)}</div>
                            </div>
                            <div className="flex flex-col gap-2 justify-center">
                                <Button variant="secondary" className="text-xs" onClick={() => handleOrderStatus(order.id, 'pronto')}>Marcar Pronto</Button>
                                <Button variant="success" className="text-xs" onClick={() => handleOrderStatus(order.id, 'entregue')}>Concluir</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-[#222] pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-serif text-[#F5F5F5] mb-6"><span className="text-[#C9A86A]">Sabor</span> & Arte</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
               Uma fusão de tradição e modernidade. Ingredientes selecionados, ambiente acolhedor e uma experiência memorável.
            </p>
            <div className="flex gap-4 mt-6">
               <Instagram className="text-gray-500 hover:text-[#C9A86A] cursor-pointer"/>
               <Facebook className="text-gray-500 hover:text-[#C9A86A] cursor-pointer"/>
               <Twitter className="text-gray-500 hover:text-[#C9A86A] cursor-pointer"/>
            </div>
          </div>
          <div>
            <h4 className="text-[#C9A86A] uppercase tracking-widest text-sm mb-6">Contato</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
               <li className="flex gap-3 items-center"><MapPin size={16}/> R. Gastronomia, 123 - Jardins</li>
               <li className="flex gap-3 items-center"><Phone size={16}/> (11) 99999-9999</li>
               <li className="flex gap-3 items-center"><Clock size={16}/> reservas@saborarte.com</li>
            </ul>
          </div>
          <div>
             <h4 className="text-[#C9A86A] uppercase tracking-widest text-sm mb-6">Horários</h4>
             <ul className="space-y-2 text-gray-500 text-sm">
               <li className="flex justify-between"><span>Seg - Qui</span> <span>19h - 23h</span></li>
               <li className="flex justify-between"><span>Sex - Sáb</span> <span>19h - 01h</span></li>
               <li className="flex justify-between"><span>Domingo</span> <span>12h - 17h</span></li>
             </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-[#111] text-gray-600 text-xs">
          © 2024 Sabor & Arte. Todos os direitos reservados. Projeto de Portfólio desenvolvido com React e Firebase.
        </div>
      </footer>

      {/* CART & CHECKOUT */}
      {(isCartOpen || isCheckoutOpen) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(false); }}></div>
          
          <div className="relative w-full max-w-md bg-[#111] h-full shadow-2xl border-l border-[#222] flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-[#222] flex justify-between items-center">
              <h2 className="font-serif text-2xl">{isCheckoutOpen ? 'Finalizar' : 'Seu Pedido'}</h2>
              <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(false); }} className="hover:text-[#C9A86A]"><X size={24}/></button>
            </div>
            
            {!isCheckoutOpen ? (
                <>
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? <div className="text-center text-gray-500 mt-10 flex flex-col items-center gap-4"><ShoppingBag size={48} className="opacity-20"/><p>Seu carrinho está vazio.</p></div> : cart.map(item => (
                        <div key={item.id} className="flex gap-4 items-center bg-[#151515] p-3 rounded border border-[#222]">
                            <img src={item.image} alt="" onError={(e) => {e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546549010-63b5dd760c13?auto=format&fit=crop&w=800&q=80"}} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-grow"><h4 className="font-medium text-[#F5F5F5]">{item.name}</h4><div className="text-[#C9A86A]">R$ {item.price.toFixed(2)}</div></div>
                            <div className="flex items-center gap-3 bg-[#222] rounded-full px-2 py-1"><button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-[#C9A86A]"><Minus size={14}/></button><span className="text-sm w-4 text-center">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-[#C9A86A]"><Plus size={14}/></button></div>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-[#8A1C1C] ml-2"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    </div>
                    <div className="p-6 bg-[#151515] border-t border-[#222]">
                        <div className="flex justify-between text-lg font-serif mb-6"><span>Total</span><span className="text-[#C9A86A]">R$ {cartTotal.toFixed(2)}</span></div>
                        <Button className="w-full" onClick={() => {
                            if(cart.length > 0) setIsCheckoutOpen(true);
                            else showNotification("Adicione itens primeiro!");
                        }}>Continuar para Pagamento</Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-full">
                    <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col h-full">
                        <div className="flex-grow overflow-y-auto p-6">
                            <div className="bg-[#1A1A1A] p-4 rounded mb-6 border border-[#333]">
                                <h4 className="text-[#C9A86A] text-sm uppercase tracking-widest mb-4">Resumo</h4>
                                <p className="text-gray-400 text-sm mb-2">{cart.reduce((a,b)=>a+b.quantity,0)} itens</p>
                                <div className="text-xl text-[#F5F5F5] font-serif">Total: R$ {cartTotal.toFixed(2)}</div>
                            </div>

                            <Input label="Seu Nome" placeholder="Ex: João Silva" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                            <Input label="Número da Mesa" placeholder="Ex: 12" value={customerTable} onChange={e => setCustomerTable(e.target.value)} required />
                            
                            <div className="mt-8">
                                <label className="text-xs uppercase tracking-widest text-[#C9A86A]">Pagamento</label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="border border-[#C9A86A] bg-[#C9A86A]/10 p-4 rounded text-center cursor-pointer"><span className="block text-sm font-bold text-[#C9A86A]">Pagar no Caixa</span></div>
                                    <div className="border border-[#333] p-4 rounded text-center opacity-50 cursor-not-allowed"><span className="block text-sm">Cartão (App)</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#222] bg-[#111]">
                            <div className="flex gap-4">
                                <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)} className="flex-1">Voltar</Button>
                                <Button type="submit" className="flex-[2]">Confirmar Pedido</Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}