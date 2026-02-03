
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Calendar as CalendarIcon,TrendingUp,Plus,Search,Phone,MapPin,
  FileText,Clock,Briefcase,ArrowRight,DollarSign,Tag,Handshake,Package, Scale,
  Eye,LogOut,ExternalLink,Wallet,Activity,Printer,X,ChevronLeft,ChevronRight,
  BarChart3,Edit3,Mail,Building2,History,ShoppingBag,Trophy,Target,Trash2,
  AlertTriangle,CheckCircle2,BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart,Bar,XAxis,YAxis,CartesianGrid,ResponsiveContainer,Tooltip,
  Cell,PieChart,Pie,Legend
} from 'recharts';
import { 
  DICT_STATUS_KLIENTA,
  DICT_TYP_ZADANIA,
  DICT_STATUS_ZADANIA,
  DICT_TYP_UMOWY,
  MOCK_EMPLOYEES
} from './constants';
import { 
  Client, Task, Employee, Contract, Product, TypUmowy, StatusKlienta, TypZadania, StatusZadania, DecisionMaker
} from './types';

// --- KONFIGURACJA ---
const API_URL = 'http://127.0.0.1:8000/api';

type Tab = 'dashboard' | 'clients' | 'schedule' | 'reports' | 'employees' | 'contracts' | 'products';

const POLISH_CAPITALS = [
  "Białystok", "Bydgoszcz", "Gdańsk", "Gorzów Wielkopolski", "Katowice", 
  "Kielce", "Kraków", "Lublin", "Łódź", "Olsztyn", "Opole", "Poznań", 
  "Rzeszów", "Szczecin", "Toruń", "Warszawa", "Wrocław", "Zielona Góra"
].sort((a, b) => a.localeCompare(b, 'pl'));

const inputClass = "w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 text-lg rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 font-semibold";
const labelClass = "block text-sm font-bold text-indigo-900 mb-1 ml-1";

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // --- DANE Z BAZY ---
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]); // Wszyscy pracownicy (do raportów)
  const [contractTypes, setContractTypes] = useState<TypUmowy[]>([]);
  const [clientStatuses, setClientStatuses] = useState<StatusKlienta[]>([]);
  const [taskTypes, setTaskTypes] = useState<TypZadania[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<StatusZadania[]>([]);
  
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskDefaultDate, setTaskDefaultDate] = useState<string>('');
  const [showAddContract, setShowAddContract] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditCompetitorPrice, setShowEditCompetitorPrice] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<Task | null>(null);

  const [pendingContractItems, setPendingContractItems] = useState<ContractItem[]>([]);
  const [contractProductSelect, setContractProductSelect] = useState<string>('');
  const [contractProductQty, setContractProductQty] = useState<number>(100);

  const isBossMode = loggedInUser?.Rola === 'Szef';

  // --- POBIERANIE DANYCH (API) ---
  const fetchData = async () => {
    try {
      console.log("🔄 Pobieranie danych z bazy...");
      const [resClients, resTasks, resContracts, resProducts, resTypes, resEmps, resStatuses, resTaskTypes, resTaskStatuses] = await Promise.all([
        fetch(`${API_URL}/klienci/`),
        fetch(`${API_URL}/zadania/`),
        fetch(`${API_URL}/umowy/`),
        fetch(`${API_URL}/produkty/`),
        fetch(`${API_URL}/typ-umowy/`),
        fetch(`${API_URL}/pracownicy/`), // Pobieramy też listę pracowników do raportów
        fetch(`${API_URL}/statusy/`),
        fetch(`${API_URL}/typ-zadania/`),
        fetch(`${API_URL}/status-zadania/`)
      ]);

      setClients(await resClients.json());
      setTasks(await resTasks.json());
      setContracts(await resContracts.json());
      setProducts(await resProducts.json());
      setContractTypes(await resTypes.json());
      setEmployeesList(await resEmps.json());
      setClientStatuses(await resStatuses.json());
      setTaskTypes(await resTaskTypes.json());
      setTaskStatuses(await resTaskStatuses.json());
    } catch (error) {
      console.error("Błąd API:", error);
    }
  };

  React.useEffect(() => {
    if (loggedInUser) { 
      fetchData();
    }
  }, [loggedInUser]);

  // --- LOGOWANIE (API) ---
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });

      if (response.ok) {
        const userData = await response.json();
        setLoggedInUser(userData);
      } else {
        alert("Błędny login lub hasło");
      }
    } catch (err) {
      alert("Błąd połączenia z serwerem");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setActiveTab('dashboard');
  };

  const handleUpdateClientStatus = async (clientId: number, newStatusId: number) => {
    try {
      await fetch(`${API_URL}/klienci/${clientId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idStatusKlienta: newStatusId })
      });
      // Aktualizacja lokalna (szybka)
      setClients(prev => prev.map(c => c.idKlienta === clientId ? { ...c, idStatusKlienta: newStatusId } : c));
    } catch (err) {
      alert("Błąd zmiany statusu");
    }
  };

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      NazwaFirmy: formData.get('NazwaFirmy') as string,
      NIP: formData.get('NIP') as string,
      Miasto: formData.get('Miasto') as string,
      Email: formData.get('Email') as string,
      Adres: formData.get('Adres') as string,
      idStatusKlienta: parseInt(formData.get('idStatusKlienta') as string),
    };
    
    try {
      const response = await fetch(`${API_URL}/klienci/`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(newClient)
      });

    if(response.ok) {
        fetchData(); // Odświeża dane z serwera, żeby dostać poprawne ID
        setShowAddClient(false);
        setActiveTab('clients');
      } else {
        alert("Błąd zapisu klienta");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loggedInUser) return;
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const newTask = {
      // idZadania: Date.now(),
      idPracownika: parseInt(formData.get('idPracownika') as string) || loggedInUser.idPracownika,
      idKlienta: parseInt(formData.get('idKlienta') as string),
      idTypZadania: parseInt(formData.get('idTypZadania') as string),
      DataPlanowana: `${formData.get('date')}T${formData.get('time')}:00`,
      idStatusZadania: 1,
      WynikNotatka: formData.get('WynikNotatka') as string || undefined,
    };

    await fetch(`${API_URL}/zadania/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask)
    });
    fetchData();
    setShowAddTask(false);
    setTaskDefaultDate('');
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTaskToEdit) return;

    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;

    const updatedTask = {
      idTypZadania: parseInt(formData.get('idTypZadania') as string),
      DataPlanowana: `${date}T${time}:00`,
      WynikNotatka: formData.get('WynikNotatka') as string,
      idStatusZadania: parseInt(formData.get('idStatusZadania') as string),
    };

    if (formData.get('idPracownika')) {
        updatedTask.idPracownika = parseInt(formData.get('idPracownika') as string);
    }

    try {
      await fetch(`${API_URL}/zadania/${selectedTaskToEdit.idZadania}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      fetchData(); // Odświeżenie danych na pulpicie i w kalendarzu
      setShowEditTask(false);
      setSelectedTaskToEdit(null);
    } catch (err) {
      alert("Błąd aktualizacji zadania");
    }
  };
  
  // Funkcja usuwania zadania z poziomu edycji
  const handleDeleteTask = async () => {
      if (!selectedTaskToEdit || !window.confirm("Czy na pewno usunąć to zadanie?")) return;
      try {
          await fetch(`${API_URL}/zadania/${selectedTaskToEdit.idZadania}/`, { method: 'DELETE' });
          fetchData();
          setShowEditTask(false);
          setSelectedTaskToEdit(null);
      } catch (err) { alert("Błąd usuwania"); }
  };

  const handleAddToPendingItems = () => {
    if (!contractProductSelect) return;
    const prodId = parseInt(contractProductSelect);
    const product = products.find(p => p.idProduktu === prodId);
    if (!product) return;

    const newItem: ContractItem = {
      idProduktu: prodId,
      NazwaProduktu: product.NazwaProduktu,
      Ilosc: contractProductQty,
      Jednostka: product.Jednostka,
      CenaJednostkowa: product.CenaBazowa,
      Wartosc: contractProductQty * product.CenaBazowa
    };

    setPendingContractItems(prev => [...prev, newItem]);
    setContractProductSelect('');
    setContractProductQty(100);
  };

  const handleRemoveFromPendingItems = (index: number) => {
    setPendingContractItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Sprawdzamy czy użytkownik jest zalogowany i czy koszyk nie jest pusty
    if (!loggedInUser || pendingContractItems.length === 0) return;
    
    const formData = new FormData(e.currentTarget);
    const idKlienta = parseInt(formData.get('idKlienta') as string);
    const idTypUmowy = parseInt(formData.get('idTypUmowy') as string);

    const formPracownikId = formData.get('idPracownika');
    const finalPracownikId = formPracownikId ? parseInt(formPracownikId as string) : loggedInUser.idPracownika;

    const dateNow = new Date().toISOString().split('T')[0]; // Dzisiejsza data

    // PĘTLA: Dla każdego produktu w koszyku wysyłamy osobne zapytanie do bazy
    const promises = pendingContractItems.map(item => {
        const contractData = {
            idKlienta: idKlienta,
            idPracownika: finalPracownikId,
            idProduktu: item.idProduktu,
            Ilosc: item.Ilosc,
            idTypUmowy: idTypUmowy,
            KwotaUmowy: item.Wartosc,
            PrzedmiotUmowy: pendingContractItems.length > 1 
                ? `Umowa zbiorcza: ${item.NazwaProduktu}` 
                : item.NazwaProduktu
        };

        return fetch(`${API_URL}/umowy/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contractData)
        });
    });

    // Czekamy aż WSZYSTKIE produkty się zapiszą
    try {
        await Promise.all(promises);
        fetchData(); // Pobieramy świeże dane z bazy
        setShowAddContract(false); 
        setPendingContractItems([]); // Czyścimy koszyk
        setActiveTab('contracts');
    } catch (error) {
        alert("Wystąpił błąd podczas zapisywania umowy.");
    }
};

  // --- USUWANIE KLIENTA ---
  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego klienta? Usunięte zostaną również wszystkie powiązane umowy i zadania. Tej operacji nie można cofnąć.")) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/klienci/${clientId}/`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setViewingClient(null); // Zamknij modal jeśli był otwarty
        fetchData(); // Odśwież listę
      } else {
        alert("Nie udało się usunąć klienta. Sprawdź czy nie ma aktywnych powiązań blokujących usunięcie.");
      }
    } catch (err) {
      console.error(err);
      alert("Błąd połączenia z serwerem");
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      const backendData = {
          NazwaProduktu: data.NazwaProduktu,
          Jednostka: data.Jednostka,
          CenaBazowa: parseFloat(data.CenaBazowa as string),
          CenaKonkurencji: parseFloat(data.CenaKonkurencji as string || "0"),
          StanMagazynowy: parseInt(data.StanMagazynowy as string || "0")
      };

      try {
          const res = await fetch(`${API_URL}/produkty/`, {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify(backendData)
          });
          if(res.ok){
             fetchData();
             setShowAddProduct(false);
          } else {
             alert("Błąd dodawania produktu. Sprawdź dane.");
          }
      } catch (error) {
          alert("Błąd połączenia z serwerem");
      }
  };
  const handleUpdateCompetitorPrice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    const formData = new FormData(e.currentTarget);
    const newPrice = parseFloat(formData.get('newPrice') as string);

    // Wysyłamy PATCH do bazy
    try {
        await fetch(`${API_URL}/produkty/${selectedProduct.idProduktu}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CenaKonkurencji: newPrice })
        });
        
        fetchData(); // Pobieramy zaktualizowane dane
        setShowEditCompetitorPrice(false);
        setSelectedProduct(null);
    } catch (error) {
        alert("Błąd aktualizacji ceny");
    }
  };

  const navItems = useMemo(() => {
    const base = [
      { id: 'dashboard', label: 'Pulpit', icon: <TrendingUp size={20} /> },
      { id: 'clients', label: 'Klienci', icon: <Users size={20} /> },
      { id: 'schedule', label: 'Harmonogram', icon: <CalendarIcon size={20} /> },
      { id: 'contracts', label: 'Umowy', icon: <Handshake size={20} /> },
      { id: 'products', label: 'Produkty', icon: <Package size={20} /> },
    ];
    // Raporty widzą wszyscy, ale treść się zmienia
    base.push({ id: 'reports', label: 'Raporty', icon: <BarChart3 size={20} /> });

    if (isBossMode) {
      base.push({ id: 'employees', label: 'Pracownicy', icon: <Briefcase size={20} /> });
    }
    return base;
  }, [isBossMode]);

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black">X</div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Firma X CRM</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={labelClass}>LOGIN</label>
              <input name="login" type="text" required className={inputClass} placeholder="Wprowadź login..." />
            </div>
            <div>
              <label className={labelClass}>HASŁO</label>
              <input name="password" type="password" required className={inputClass} placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest mt-4">Zaloguj się</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col hidden md:flex shrink-0">
        {/*<div className="p-6 text-2xl font-black">X CRM</div>*/}
        <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xl">X</div>
                <span className="text-2xl font-black tracking-tighter">CRM</span>
            </div>
            <div className="h-px bg-indigo-800 w-full mb-6"></div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === item.id ? 'bg-indigo-700 shadow-lg' : 'hover:bg-indigo-800'}`}>
              <span className={`${activeTab === item.id ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`}>{item.icon}</span>
              <span className={`font-bold tracking-wide ${activeTab === item.id ? 'text-white' : 'text-indigo-100 group-hover:text-white'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 p-3 bg-indigo-950/50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold shrink-0">{loggedInUser.Imie[0]}{loggedInUser.Nazwisko[0]}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{loggedInUser.Imie} {loggedInUser.Nazwisko}</p>
              <p className="text-xs text-indigo-400">{loggedInUser.Rola}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-3 bg-indigo-800 text-red-300 rounded-xl font-black text-xs uppercase hover:bg-red-900 hover:text-white transition-all flex items-center justify-center gap-2">
            <LogOut size={16} /> Wyloguj się
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold truncate pr-4">{navItems.find(i => i.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative hidden lg:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Szukaj..." className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm w-64" /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && (
            <DashboardView 
              isBoss={isBossMode} 
              user={loggedInUser} 
              tasks={tasks} 
              clients={clients} 
              contracts={contracts} 
              products={products} 
              employees={employeesList.length > 0 ? employeesList : MOCK_EMPLOYEES}
              onTabChange={setActiveTab}
              taskTypes={taskTypes}
              onEditTask={(task) => {
                setSelectedTaskToEdit(task);
                setShowEditTask(true);
              }}
            />
          )}
          {activeTab === 'clients' && 
            <ClientsView 
              clients={clients}
              contracts={contracts} 
              onAddClient={() => setShowAddClient(true)} 
              isBoss={isBossMode} 
              user={loggedInUser} 
              onUpdateStatus={handleUpdateClientStatus} 
              onSelectClient={setViewingClient} 
              clientStatuses={clientStatuses} 
            />}
          {activeTab === 'schedule' && (
            <ScheduleCalendarView 
              user={loggedInUser} 
              tasks={tasks} 
              clients={clients} 
              onAddTask={(date) => {
                setTaskDefaultDate(date);
                setShowAddTask(true);
              }} 
              isBoss={isBossMode}
              onEditTask={(task) => {
                setSelectedTaskToEdit(task);
                setShowEditTask(true);
              }}
            />
          )}
          {activeTab === 'contracts' && <ContractsView contracts={contracts} clients={clients} isBoss={isBossMode} user={loggedInUser} onAddContract={() => setShowAddContract(true)} onPreview={(c) => setSelectedContract(c)} />}
          {activeTab === 'products' && (
            <ProductsView 
              products={products} 
              contracts={contracts} 
              isBoss={isBossMode} 
              onAddProduct={() => setShowAddProduct(true)} 
              onEditCompetitorPrice={(p) => {
                setSelectedProduct(p);
                setShowEditCompetitorPrice(true);
              }}
            />
          )}
          {activeTab === 'reports' && isBossMode && 
            <ReportsView 
              employees={employeesList.length > 0 ? employeesList : MOCK_EMPLOYEES}
              tasks={tasks} 
              contracts={contracts} 
              clients={clients}
              contractTypes={contractTypes} />}
          {activeTab === 'employees' && isBossMode && 
            <EmployeesView 
              employees={employeesList.length > 0 ? employeesList : MOCK_EMPLOYEES}
              clients={clients} 
              contracts={contracts} 
              onSelectEmployee={setViewingEmployee} 
            />}
        </div>
      </div>
      </main>

      {/* Modal Podglądu Umowy */}
      {selectedContract && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white w-full max-w-4xl shadow-2xl relative animate-in zoom-in duration-300 my-8 print:shadow-none print:m-0 print:w-full print:max-w-none">
            
            {/* Przyciski - ukryte podczas drukowania (klasa print:hidden) */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden">
              <button onClick={() => window.print()} className="p-2 bg-gray-100 hover:bg-indigo-100 text-gray-600 rounded-lg transition-colors"><Printer size={20} /></button>
              <button onClick={() => setSelectedContract(null)} className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 md:p-16 text-gray-900 font-serif leading-relaxed print:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
                <div>
                  <h1 className="text-3xl font-black mb-1">FIRMA X</h1>
                  <p className="text-sm">Hurtownia Produktów Ekologicznych</p>
                  {/* ZMIANA ADRESU NA ZIELONĄ GÓRĘ */}
                  <p className="text-sm">ul. Zjednoczenia 106, 65-120 Zielona Góra</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Miejsce i data:</p>
                  <p>Zielona Góra, {new Date(selectedContract.DataZawarcia).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                  })}</p>
                </div>
              </div>
              
              <div className="text-center mb-16">
                <h2 className="text-2xl font-black border-b-2 border-black inline-block px-8 py-2">
                  UMOWA SPRZEDAŻY NR {selectedContract.idUmowy}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest mb-4 border-b">Sprzedawca</h3>
                  <p className="font-bold">Firma X Sp. z o.o.</p>
                  {/* ZMIANA ADRESU */}
                  <p>ul. Zjednoczenia 106, 65-120 Zielona Góra</p>
                  <p>NIP: 929-000-11-22</p>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest mb-4 border-b">Kupujący</h3>
                  <p className="font-bold">{clients.find(cl => cl.idKlienta === selectedContract.idKlienta)?.NazwaFirmy}</p>
                  <p>{clients.find(cl => cl.idKlienta === selectedContract.idKlienta)?.Adres}</p>
                  <p>{clients.find(cl => cl.idKlienta === selectedContract.idKlienta)?.Miasto}</p>
                  <p>NIP: {clients.find(cl => cl.idKlienta === selectedContract.idKlienta)?.NIP}</p>
                </div>
              </div>

              <div className="mb-16">
                {/* WYŚRODKOWANIE NAGŁÓWKA (text-center) */}
                <h3 className="font-bold mb-4 text-center">§1 PRZEDMIOT UMOWY</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50 print:bg-gray-200">
                        <th className="border border-gray-300 p-2 text-left">Produkt</th>
                        <th className="border border-gray-300 p-2 text-center">Ilość</th>
                        <th className="border border-gray-300 p-2 text-right">Wartość</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Obsługa sytuacji, gdy Pozycje są undefined (fallback do pojedynczego produktu) */}
                      {selectedContract.Pozycje ? (
                        selectedContract.Pozycje.map((pos, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 p-2">{pos.NazwaProduktu}</td>
                            <td className="border border-gray-300 p-2 text-center">{pos.Ilosc} {pos.Jednostka}</td>
                            <td className="border border-gray-300 p-2 text-right">{pos.Wartosc.toLocaleString()} zł</td>
                          </tr>
                        ))
                      ) : (
                         /* Fallback dla starych umów (jeśli pojedyncze) - opcjonalne, zależnie od struktury */
                         <tr>
                            <td className="border border-gray-300 p-2">{selectedContract.PrzedmiotUmowy}</td>
                            <td className="border border-gray-300 p-2 text-center">{selectedContract.Ilosc} szt</td>
                            <td className="border border-gray-300 p-2 text-right">{selectedContract.KwotaUmowy.toLocaleString()} zł</td>
                         </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold">
                        <td colSpan={2} className="border border-gray-300 p-2 text-right uppercase">Suma netto:</td>
                        {/* Zabezpieczenie przed błędem z dodawaniem stringów */}
                        <td className="border border-gray-300 p-2 text-right">{Number(selectedContract.KwotaUmowy).toLocaleString()} zł</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mt-24">
                <div className="text-center border-t border-black pt-2 text-xs uppercase font-bold">Podpis Sprzedawcy</div>
                <div className="text-center border-t border-black pt-2 text-xs uppercase font-bold">Podpis Kupującego</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formularze dodawania */}
      {showAddClient && <AddClientModal onAdd={handleAddClient} onClose={() => setShowAddClient(false)} statuses={clientStatuses} />}
      {showAddTask && <AddTaskModal onAdd={handleAddTask} onClose={() => setShowAddTask(false)} clients={clients} defaultDate={taskDefaultDate} taskTypes={taskTypes} employees={employeesList.length > 0 ? employeesList : MOCK_EMPLOYEES} isBoss={isBossMode} currentUser={loggedInUser}/>}
      {showAddContract && <AddContractModal onAdd={handleAddContract} onClose={() => { setShowAddContract(false); setPendingContractItems([]); }} clients={clients} products={products} pendingItems={pendingContractItems} setPendingItems={setPendingContractItems} onAddToPending={handleAddToPendingItems} prodSelect={contractProductSelect} setProdSelect={setContractProductSelect} prodQty={contractProductQty} setProdQty={setContractProductQty} onRemovePending={handleRemoveFromPendingItems} contractTypes={contractTypes} employees={employeesList.length > 0 ? employeesList : MOCK_EMPLOYEES} isBoss={isBossMode} currentUser={loggedInUser} />}
      {showAddProduct && <AddProductModal onAdd={handleAddProduct} onClose={() => setShowAddProduct(false)} />}
      {showEditCompetitorPrice && selectedProduct && <EditCompetitorPriceModal onAdd={handleUpdateCompetitorPrice} onClose={() => setShowEditCompetitorPrice(false)} product={selectedProduct} />}
      {viewingEmployee && ( <EmployeeDetailsModal employee={viewingEmployee} onClose={() => setViewingEmployee(null)} clients={clients} tasks={tasks} contracts={contracts} />)}
      {viewingClient && ( <ClientDetailsModal client={viewingClient} onClose={() => setViewingClient(null)} statuses={clientStatuses} contracts={contracts} tasks={tasks} onUpdateStatus={handleUpdateClientStatus} onDelete={handleDeleteClient} />)}
      {showEditTask && selectedTaskToEdit && (<EditTaskModal task={selectedTaskToEdit} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} onClose={() => { setShowEditTask(false); setSelectedTaskToEdit(null); }} clients={clients} taskTypes={taskTypes} taskStatuses={taskStatuses} employees={employeesList.length > 0 ? employeesList : MOCK_EMPLOYEES} isBoss={isBossMode} /> )}
    </div>
  );
};

// --- Komponenty Modalne ---

const AddClientModal: React.FC<{onAdd: any, onClose: any, statuses: StatusKlienta[]}> = ({onAdd, onClose, statuses}) => (
  <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
      <h3 className="text-2xl font-black uppercase mb-6">Nowy Kontrahent</h3>
      <form onSubmit={onAdd} className="space-y-4">
        <div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>NAZWA FIRMY *</label><input name="NazwaFirmy" required className={inputClass} /></div><div><label className={labelClass}>NIP *</label><input name="NIP" required pattern="\d{10}" className={inputClass} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>MIASTO *</label><select name="Miasto" required className={inputClass}>{POLISH_CAPITALS.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div><label className={labelClass}>STATUS *</label><select name="idStatusKlienta" required className={inputClass}>{statuses.map(s => <option key={s.idStatusKlienta} value={s.idStatusKlienta}>{s.Nazwa}</option>)}</select></div></div>
        <div><label className={labelClass}>ADRES *</label><input name="Adres" required className={inputClass} /></div>
        <div><label className={labelClass}>EMAIL *</label><input name="Email" type="email" required className={inputClass} /></div>
        <div className="flex justify-end gap-4 mt-6"><button type="button" onClick={onClose} className="px-6 py-2 text-gray-500 font-bold uppercase">Anuluj</button><button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg">Dodaj</button></div>
      </form>
    </div>
  </div>
);

const AddTaskModal: React.FC<{
  onAdd: any, 
  onClose: any, 
  clients: Client[], 
  defaultDate: string, 
  taskTypes: TypZadania[],
  employees: Employee[],
  isBoss: boolean, 
  currentUser: Employee 
}> = ({onAdd, onClose, clients, defaultDate, taskTypes, employees, isBoss, currentUser}) => (
  <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8 animate-in zoom-in duration-300">
      <h3 className="text-2xl font-black uppercase mb-6">Planuj Działanie</h3>
      <form onSubmit={onAdd} className="space-y-4">
        
        {/* SEKCJA PRZYPISANIA DO PRACOWNIKA (DLA SZEFA) */}
        {isBoss ? (
            <div>
                <label className={labelClass}>PRZYPISZ DO *</label>
                <select name="idPracownika" defaultValue={currentUser.idPracownika} className={inputClass}>
                    {employees.map(e => <option key={e.idPracownika} value={e.idPracownika}>{e.Imie} {e.Nazwisko}</option>)}
                </select>
            </div>
        ) : (
            <input type="hidden" name="idPracownika" value={currentUser.idPracownika} />
        )}

        {/*<div><label className={labelClass}>KLIENT *</label><select name="idKlienta" required className={inputClass}>{clients.map(c => <option key={c.idKlienta} value={c.idKlienta}>{c.NazwaFirmy}</option>)}</select></div>*/}
        <div><label className={labelClass}>KLIENT *</label>
          <select name="idKlienta" required className={inputClass}>
            {clients
              .sort((a, b) => a.NazwaFirmy.localeCompare(b.NazwaFirmy))
              .map(c => (
                <option key={c.idKlienta} value={c.idKlienta}>{c.NazwaFirmy}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4"><div><label className={labelClass}>TYP *</label><select name="idTypZadania" required className={inputClass}>{taskTypes.map(t => <option key={t.idTypZadania} value={t.idTypZadania}>{t.Nazwa}</option>)}</select></div><div><label className={labelClass}>DATA *</label><input name="date" type="date" required className={inputClass} defaultValue={defaultDate} /></div><div><label className={labelClass}>GODZINA *</label><input name="time" type="time" required className={inputClass} defaultValue="09:00" /></div></div>
        <div><label className={labelClass}>NOTATKA</label><textarea name="WynikNotatka" className={inputClass} /></div>
        <div className="flex justify-end gap-4 mt-6"><button type="button" onClick={onClose} className="px-6 py-2 text-gray-500 font-bold uppercase">Anuluj</button><button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg">Zapisz</button></div>
      </form>
    </div>
  </div>
);

const AddContractModal: React.FC<{
  onAdd: any, 
  onClose: any, 
  clients: Client[], 
  products: Product[], 
  pendingItems: ContractItem[], 
  setPendingItems: any, 
  onAddToPending: any, 
  prodSelect: string, 
  setProdSelect: any, 
  prodQty: number, 
  setProdQty: any, 
  onRemovePending: any,
  contractTypes: TypUmowy[],
  employees: Employee[],
  isBoss: boolean,  
  currentUser: Employee 
}> = ({
  onAdd, onClose, clients, products, pendingItems, 
  onAddToPending, prodSelect, setProdSelect, prodQty, setProdQty, onRemovePending,
  contractTypes, employees, isBoss, currentUser
}) => (
  <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-8 animate-in zoom-in duration-300 my-8">
      <h3 className="text-2xl font-black uppercase mb-6">Nowa Umowa Wielopozycyjna</h3>
      <form onSubmit={onAdd} className="space-y-6">
        
        {isBoss ? (
            <div>
                <label className={labelClass}>PRZYPISZ DO PRZEDSTAWICIELA *</label>
                <select name="idPracownika" defaultValue={currentUser.idPracownika} className={inputClass}>
                    {employees.map(e => (
                        <option key={e.idPracownika} value={e.idPracownika}>
                            {e.Imie} {e.Nazwisko} ({e.Rola})
                        </option>
                    ))}
                </select>
            </div>
        ) : (
            <input type="hidden" name="idPracownika" value={currentUser.idPracownika} />
        )}

        <div>
            <label className={labelClass}>KONTRAHENT *</label>
            <select name="idKlienta" required className={inputClass}>
                {clients.sort((a,b) => a.NazwaFirmy.localeCompare(b.NazwaFirmy)).map(c => <option key={c.idKlienta} value={c.idKlienta}>{c.NazwaFirmy}</option>)}
            </select>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
          <h4 className="text-xs font-black uppercase text-indigo-900 mb-4 tracking-widest">Dodaj produkt do listy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div><label className="text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">PRODUKT</label><select className={inputClass} value={prodSelect} onChange={(e) => setProdSelect(e.target.value)}><option value="">Wybierz...</option>{products.map(p => <option key={p.idProduktu} value={p.idProduktu}>{p.NazwaProduktu}</option>)}</select></div>
            <div className="flex gap-2"><div className="flex-1"><label className="text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">ILOŚĆ</label><input type="number" className={inputClass} value={prodQty} onChange={(e) => setProdQty(parseInt(e.target.value))} /></div><button type="button" onClick={onAddToPending} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg disabled:opacity-50" disabled={!prodSelect}><Plus size={20} /></button></div>
          </div>
        </div>
        
        {pendingItems.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-indigo-50 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-indigo-50 text-[10px] font-black uppercase text-indigo-400"><tr><th className="px-4 py-2">Produkt</th><th className="px-4 py-2 text-center">Ilość</th><th className="px-4 py-2 text-right">Wartość</th><th className="px-4 py-2"></th></tr></thead><tbody className="divide-y divide-gray-50">{pendingItems.map((item, idx) => (<tr key={idx}><td className="px-4 py-3 font-bold">{item.NazwaProduktu}</td><td className="px-4 py-3 text-center">{item.Ilosc} {item.Jednostka}</td><td className="px-4 py-3 text-right font-black">{item.Wartosc.toLocaleString()} zł</td><td className="px-4 py-3 text-center"><button type="button" onClick={() => onRemovePending(idx)} className="text-red-300 hover:text-red-600"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
        )}
        
        <div><label className={labelClass}>TYP UMOWY *</label><select name="idTypUmowy" required className={inputClass}>{contractTypes.map(t => <option key={t.idTypUmowy} value={t.idTypUmowy}>{t.Nazwa}</option>)}</select></div>
        
        <div className="flex justify-end gap-4 mt-6"><button type="button" onClick={onClose} className="px-6 py-2 text-gray-500 font-bold uppercase">Anuluj</button><button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg disabled:opacity-50" disabled={pendingItems.length === 0}>Generuj Umowę</button></div>
      </form>
    </div>
  </div>
);

const AddProductModal: React.FC<{onAdd: any, onClose: any}> = ({onAdd, onClose}) => (
  <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8 animate-in zoom-in duration-300">
      <h3 className="text-2xl font-black uppercase mb-6">Dodaj Produkt</h3>
      <form onSubmit={onAdd} className="space-y-4">
        <div><label className={labelClass}>NAZWA PRODUKTU *</label><input name="NazwaProduktu" required className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>JEDNOSTKA *</label><select name="Jednostka" required className={inputClass}><option value="kg">kg</option><option value="szt">szt</option></select></div><div><label className={labelClass}>CENA BAZOWA *</label><input name="CenaBazowa" type="number" step="0.01" required className={inputClass} /></div></div>
        <div><label className={labelClass}>STAN MAGAZYNOWY *</label><input name="StanMagazynowy" type="number" step="0.01" required className={inputClass} /></div>
        <div className="flex justify-end gap-4 mt-6"><button type="button" onClick={onClose} className="px-6 py-2 text-gray-500 font-bold uppercase">Anuluj</button><button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg">Zapisz</button></div>
      </form>
    </div>
  </div>
);

const EditCompetitorPriceModal: React.FC<{onAdd: any, onClose: any, product: Product}> = ({onAdd, onClose, product}) => (
  <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300">
      <h3 className="text-2xl font-black uppercase mb-2">Monitoring Cen</h3>
      <p className="text-sm text-gray-500 mb-6 font-bold uppercase">{product.NazwaProduktu}</p>
      <form onSubmit={onAdd} className="space-y-4">
        <div><label className={labelClass}>AKTUALNA CENA RYNKOWA *</label><input name="newPrice" type="number" step="0.01" required className={inputClass} defaultValue={product.CenaKonkurencji} /></div>
        <div className="flex justify-end gap-4 mt-6"><button type="button" onClick={onClose} className="px-6 py-2 text-gray-500 font-bold uppercase">Anuluj</button><button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg">Aktualizuj</button></div>
      </form>
    </div>
  </div>
);

// --- SZCZEGÓŁY PRACOWNIKA ---

const EmployeeDetailsModal: React.FC<{
  employee: Employee, 
  onClose: () => void,
  clients: Client[],
  tasks: Task[],
  contracts: Contract[]
}> = ({ employee, onClose, clients, tasks, contracts }) => {
  
  const empClients = clients.filter(c => {
      const isFromArea = c.Miasto === employee.ObszarZadania;
      const hasContract = contracts.some(con => con.idKlienta === c.idKlienta && con.idPracownika === employee.idPracownika);
      return isFromArea || hasContract;
  });

  const empTasks = tasks.filter(t => t.idPracownika === employee.idPracownika).sort((a,b) => a.DataPlanowana.localeCompare(b.DataPlanowana));
  const empContracts = contracts.filter(c => c.idPracownika === employee.idPracownika);
  
  const totalRevenue = empContracts.reduce((sum, c) => sum + Number(c.KwotaUmowy || 0), 0);
  const activeTasksCount = empTasks.filter(t => t.idStatusZadania === 1).length;

  return (
    <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md flex items-center justify-center z-[250] p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl relative animate-in zoom-in duration-300 my-8 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b flex justify-between items-start bg-gray-50 rounded-t-[40px]">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-200">
              {employee.Imie[0]}{employee.Nazwisko[0]}
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{employee.Imie} {employee.Nazwisko}</h2>
              <div className="flex gap-3 mt-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <Briefcase size={14} /> {employee.Rola}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <MapPin size={14} /> {employee.ObszarZadania}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Wygenerowany Obrót</p>
              <p className="text-3xl font-black text-indigo-900">{totalRevenue.toLocaleString()} zł</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Baza Klientów</p>
              <p className="text-3xl font-black text-emerald-900">{empClients.length}</p>
            </div>
            <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
              <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Otwarte Zadania</p>
              <p className="text-3xl font-black text-orange-900">{activeTasksCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase flex items-center gap-2">
                <Users size={20} className="text-indigo-600"/> Przypisani Klienci
              </h3>
              <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 sticky top-0">
                      <tr><th className="p-4">Nazwa Firmy</th><th className="p-4 text-right">Miasto</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {empClients.length > 0 ? empClients.map(c => (
                        <tr key={c.idKlienta}>
                          <td className="p-4 font-bold text-indigo-900">{c.NazwaFirmy}</td>
                          <td className="p-4 text-right text-gray-500">{c.Miasto}</td>
                        </tr>
                      )) : <tr><td colSpan={2} className="p-4 text-center text-gray-400">Brak klientów w tym obszarze</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-lg font-black uppercase flex items-center gap-2">
                <CalendarIcon size={20} className="text-indigo-600"/> Nadchodzące Zadania
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {empTasks.filter(t => t.idStatusZadania === 1).length > 0 ? 
                  empTasks.filter(t => t.idStatusZadania === 1).slice(0, 10).map(t => (
                  <div key={t.idZadania} className="p-4 border rounded-2xl flex gap-4 items-center bg-white hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      {t.idTypZadania === 1 ? <MapPin size={18} /> : <Phone size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase">
                        {new Date(t.DataPlanowana).toLocaleDateString()} • {t.DataPlanowana.split('T')[1].substring(0,5)}
                      </p>
                      <p className="font-bold text-sm text-gray-800">
                        {clients.find(c => c.idKlienta === t.idKlienta)?.NazwaFirmy || 'Klient'}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center border-2 border-dashed rounded-3xl text-gray-400">
                    Brak zaplanowanych zadań
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SZCZEGÓŁY KLIENTA ---
const ClientDetailsModal: React.FC<{
  client: Client,
  onClose: () => void,
  statuses: StatusKlienta[],
  contracts: Contract[],
  tasks: Task[],
  onUpdateStatus: (id: number, sid: number) => void,
  onDelete: (id: number) => void
}> = ({ client, onClose, statuses, contracts, tasks, onUpdateStatus, onDelete }) => {
  
  // Filtrowanie danych dla tego klienta
  const clContracts = contracts.filter(c => c.idKlienta === client.idKlienta);
  const clTasks = tasks.filter(t => t.idKlienta === client.idKlienta).sort((a,b) => b.DataPlanowana.localeCompare(a.DataPlanowana));
  
  const totalRevenue = clContracts.reduce((sum, c) => sum + Number(c.KwotaUmowy || 0), 0);
  const activeTasksCount = clTasks.filter(t => t.idStatusZadania === 1).length;

  return (
    <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md flex items-center justify-center z-[250] p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl relative animate-in zoom-in duration-300 my-8 flex flex-col max-h-[90vh]">
        
        {/* Nagłówek */}
        <div className="p-8 border-b flex justify-between items-start bg-gray-50 rounded-t-[40px]">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-200">
              {client.NazwaFirmy[0]}
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{client.NazwaFirmy}</h2>
              <div className="flex gap-4 mt-2 text-sm text-gray-500 font-bold">
                 <span className="flex items-center gap-1"><MapPin size={16}/> {client.Adres}, {client.Miasto}</span>
                 <span className="flex items-center gap-1"><FileText size={16}/> NIP: {client.NIP}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-gray-100 text-gray-400 rounded-2xl transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>

        {/* Treść */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
          
          {/* Panel Akcji */}
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-xs font-black uppercase text-indigo-900">Zmień Status:</span>
                <select 
                    value={client.idStatusKlienta} 
                    onChange={(e) => onUpdateStatus(client.idKlienta, parseInt(e.target.value))}
                    className="px-4 py-2 rounded-xl border-2 border-indigo-200 font-bold text-indigo-900 focus:border-indigo-600 outline-none"
                >
                    {statuses.map(s => <option key={s.idStatusKlienta} value={s.idStatusKlienta}>{s.Nazwa}</option>)}
                </select>
            </div>
            <button 
                onClick={() => onDelete(client.idKlienta)}
                className="px-6 py-2 bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl font-black uppercase text-xs flex items-center gap-2 transition-all shadow-sm"
            >
                <Trash2 size={16} /> Usuń Kontrahenta
            </button>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border rounded-3xl shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Przychód Całkowity</p>
              <p className="text-3xl font-black text-indigo-600">{totalRevenue.toLocaleString()} zł</p>
            </div>
            <div className="p-6 bg-white border rounded-3xl shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Podpisane Umowy</p>
              <p className="text-3xl font-black text-gray-900">{clContracts.length}</p>
            </div>
            <div className="p-6 bg-white border rounded-3xl shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Zadania (Otwarte/Wszystkie)</p>
              <p className="text-3xl font-black text-gray-900">{activeTasksCount} <span className="text-lg text-gray-400">/ {clTasks.length}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Historia Umów */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase flex items-center gap-2">
                <Handshake size={20} className="text-emerald-600"/> Historia Umów
              </h3>
              <div className="border rounded-3xl overflow-hidden">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400">
                      <tr><th className="p-4">Data</th><th className="p-4">Przedmiot</th><th className="p-4 text-right">Kwota</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {clContracts.length > 0 ? clContracts.map(c => (
                        <tr key={c.idUmowy}>
                          <td className="p-4 text-gray-500 font-mono text-xs">{new Date(c.DataZawarcia).toLocaleDateString('pl-PL')}</td>
                          <td className="p-4 font-bold truncate max-w-[150px]">{c.PrzedmiotUmowy}</td>
                          <td className="p-4 text-right font-black">{Number(c.KwotaUmowy).toLocaleString()} zł</td>
                        </tr>
                      )) : <tr><td colSpan={3} className="p-6 text-center text-gray-400 italic">Brak umów</td></tr>}
                    </tbody>
                 </table>
              </div>
            </div>

            {/* Historia Zadań */}
            <div className="space-y-4">
               <h3 className="text-lg font-black uppercase flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-600"/> Log Zdarzeń
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {clTasks.map(t => (
                  <div key={t.idZadania} className={`p-4 border rounded-2xl flex gap-4 items-start ${t.idStatusZadania === 2 ? 'bg-gray-50 opacity-70' : 'bg-white shadow-sm'}`}>
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${t.idStatusZadania === 2 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase">
                        {t.DataPlanowana.replace('T', ' ')}
                      </p>
                      <p className="font-bold text-sm text-gray-800 mb-1">
                         {t.WynikNotatka || "Brak notatki"}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded inline-block">
                         {t.idTypZadania === 1 ? 'Spotkanie' : 'Telefon'}
                      </p>
                    </div>
                  </div>
                ))}
                {clTasks.length === 0 && <div className="p-6 text-center text-gray-400 border-2 border-dashed rounded-3xl">Brak zarejestrowanych działań</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Główny Komponent Pulpitu ---

const DashboardView: React.FC<{ 
  isBoss: boolean, 
  user: Employee, 
  tasks: Task[], 
  clients: Client[], 
  contracts: Contract[], 
  products: Product[], 
  employees: Employee[],
  taskTypes: TypZadania[],
  onTabChange: (tab: Tab) => void,
  onEditTask: (t: Task) => void
}> = ({ isBoss, user, tasks, clients, contracts, products, employees, taskTypes, onTabChange, onEditTask }) => {
  
  const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayStr = getLocalDateString(today); 
  const myTasks = tasks.filter(t => t.idPracownika === user.idPracownika);
  
  const upcomingTasks = myTasks.filter(t => {
      const taskDateObj = new Date(t.DataPlanowana);
      const taskDateStr = getLocalDateString(taskDateObj);
      
      return taskDateStr >= todayStr && t.idStatusZadania !== 2; 
  }).sort((a,b) => a.DataPlanowana.localeCompare(b.DataPlanowana));
  
  const rankingData = useMemo(() => {
    return employees
      .filter(e => e.Rola && e.Rola.includes('Przedstawiciel'))
      .map(e => ({
        name: `${e.Imie} ${e.Nazwisko}`,
        revenue: contracts.filter(c => c.idPracownika === e.idPracownika).reduce((s, c) => s + Number(c.KwotaUmowy || 0), 0),
        shortName: `${e.Imie} ${e.Nazwisko[0]}.`
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [employees, contracts]);

  const lowStockProducts = products.filter(p => (p.StanMagazynowy || 0) < 200);
  const myRevenue = contracts.filter(c => c.idPracownika === user.idPracownika).reduce((s, c) => s + Number(c.KwotaUmowy || 0), 0);
  const myClientsCount = clients.filter(c => c.Miasto === user.ObszarZadania).length;

  const stats = isBoss ? [
    { label: 'Obrót Firmowy', value: contracts.reduce((s, c) => s + Number(c.KwotaUmowy || 0), 0).toLocaleString() + ' zł', color: 'bg-indigo-600', icon: <DollarSign />, targetTab: 'contracts' as Tab },
    { label: 'Baza Klientów', value: clients.length.toString(), color: 'bg-emerald-500', icon: <Users />, targetTab: 'clients' as Tab },
    { label: 'Aktywne Umowy', value: contracts.length.toString(), color: 'bg-blue-500', icon: <Handshake />, targetTab: 'contracts' as Tab },
    { label: 'Alert Magazynowy', value: lowStockProducts.length.toString(), color: lowStockProducts.length > 0 ? 'bg-red-500' : 'bg-green-500', icon: <Package />, targetTab: 'products' as Tab },
  ] : [
    { label: 'Mój Obrót', value: myRevenue.toLocaleString() + ' zł', color: 'bg-indigo-600', icon: <Wallet />, targetTab: 'contracts' as Tab },
    { label: 'Zadania (Oczekujące)', value: upcomingTasks.length.toString(), color: 'bg-orange-500', icon: <Clock />, targetTab: 'schedule' as Tab },
    { label: 'Skuteczność', value: `---`, color: 'bg-emerald-500', icon: <Target />, targetTab: 'schedule' as Tab },
    { label: 'Moi Klienci', value: myClientsCount.toString(), color: 'bg-blue-500', icon: <Users />, targetTab: 'clients' as Tab },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black">Cześć, {user.Imie}! 👋</h3>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
            {isBoss ? 'Pulpit Zarządczy (Perspektywa Firmy)' : `Pulpit Operacyjny (${user.ObszarZadania})`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <button key={i} onClick={() => onTabChange(s.targetTab)} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 text-left transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] group relative overflow-hidden">
            <div className={`p-4 ${s.color} text-white rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>{s.icon}</div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h4 className="font-black uppercase tracking-tighter mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2"><CalendarIcon className="text-indigo-600" /> Najbliższe działania</span>
            <span className="text-[10px] px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-black uppercase">{upcomingTasks.length} ZADAŃ</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTasks.length > 0 ? upcomingTasks.slice(0, 6).map(t => {
              
              // --- LOGIKA KOLORÓW ---
              const tDate = new Date(t.DataPlanowana);
              tDate.setHours(0,0,0,0);
              const today = new Date();
              today.setHours(0,0,0,0);
              
              let iconColorClass = "bg-emerald-100 text-emerald-600"; 
              
              if (t.idStatusZadania === 2) {
                  iconColorClass = "bg-gray-100 text-gray-400";
              } else if (tDate < today) {
                  iconColorClass = "bg-red-100 text-red-600"; 
              } else if (tDate.getTime() === today.getTime()) {
                  iconColorClass = "bg-orange-100 text-orange-600";
              }

              return (
              <div key={t.idZadania} 
                   onClick={() => onEditTask(t)}
                   className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all border border-gray-100 cursor-pointer group"
              >
                {/* UŻYCIE OBLICZONEGO KOLORU */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColorClass}`}>
                  {t.idTypZadania === 1 ? <MapPin size={20} /> : <Phone size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate">{clients.find(cl => cl.idKlienta === t.idKlienta)?.NazwaFirmy}</p>
                  <p className={`text-[10px] font-bold uppercase mt-0.5 ${tDate < today && t.idStatusZadania !== 2 ? 'text-red-500' : 'text-gray-400'}`}>
                      {new Date(t.DataPlanowana).toLocaleDateString()} • {new Date(t.DataPlanowana).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={16} className="text-indigo-400"/>
                </div>
              </div>
            )
            }) : (
              <div className="col-span-3 py-8 text-center text-gray-300 font-bold text-sm uppercase">Brak zaplanowanych zadań na najbliższy czas</div>
            )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isBoss ? (
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 h-full">
              <h4 className="font-black uppercase tracking-tighter mb-8 flex items-center justify-between">
                <span className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Ranking Sprzedaży</span>
                <button onClick={() => onTabChange('reports')} className="text-[10px] text-indigo-600 hover:underline">Szczegóły</button>
              </h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankingData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} width={120} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} content={({active, payload}) => (
                      active && payload && payload.length ? <div className="bg-indigo-900 text-white p-3 rounded-xl shadow-xl font-black text-xs">{payload[0].value.toLocaleString()} zł</div> : null
                    )} />
                    <Bar dataKey="revenue" radius={[0, 10, 10, 0]} barSize={30}>
                      {rankingData.map((_, index) => <Cell key={index} fill={index === 0 ? '#4f46e5' : '#818cf8'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
             <div className="bg-indigo-900 text-white p-8 rounded-[40px] shadow-xl flex flex-col justify-center items-center text-center h-full">
                <Trophy size={48} className="text-yellow-400 mb-4" />
                <h3 className="text-2xl font-black mb-2">Tak trzymaj!</h3>
                <p className="opacity-70 text-sm">Twoja realizacja planu wygląda świetnie.</p>
             </div>
          )}
        </div>

        <div className="space-y-8">
          {isBoss && (
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h4 className="font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><AlertTriangle className="text-red-500" /> Niskie stany</h4>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                  <div key={p.idProduktu} className="bg-red-50/50 p-4 rounded-3xl border border-red-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-red-900">{p.NazwaProduktu}</span>
                      <span className="text-xs font-black text-red-600">{p.StanMagazynowy} {p.Jednostka}</span>
                    </div>
                    <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, (p.StanMagazynowy || 0) / 2)}%` }}></div>
                    </div>
                  </div>
                )) : <p className="text-xs text-green-600 font-bold uppercase">Stany w normie</p>}
              </div>
            </div>
          )}
          
          {!isBoss && (
             <div className="bg-emerald-500 text-white p-8 rounded-[40px] shadow-xl h-full flex flex-col justify-center items-center text-center cursor-pointer hover:bg-emerald-600 transition-colors" onClick={() => onTabChange('clients')}>
                <Users size={48} className="mb-4" />
                <h3 className="text-2xl font-black mb-2">Baza Klientów</h3>
                <p className="opacity-90 text-sm">Przejdź do zarządzania</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Komponenty Widoków ---

const ClientsView: React.FC<{ 
  clients: Client[], 
  contracts: Contract[], // <--- Nowy props: lista umów
  onAddClient: any, 
  isBoss: boolean, 
  user: Employee, 
  onUpdateStatus: (id: number, sid: number) => void, 
  onSelectClient: any, 
  clientStatuses: StatusKlienta[] 
}> = ({ clients, contracts, onAddClient, isBoss, user, onSelectClient, clientStatuses, onUpdateStatus }) => {
  
  // Funkcja sprawdzająca, czy klient "należy" do handlowca
  const isClientMine = (client: Client) => {
    // 1. Czy jest z mojego miasta?
    const isFromMyCity = client.Miasto === user.ObszarZadania;
    // 2. Czy mam z nim podpisaną jakąkolwiek umowę?
    const hasContractWithMe = contracts.some(c => c.idKlienta === client.idKlienta && c.idPracownika === user.idPracownika);
    
    return isFromMyCity || hasContractWithMe;
  };

  // Sortowanie: "Moi" klienci zawsze na górze
  const sortedClients = [...clients].sort((a, b) => {
     const aIsMine = isClientMine(a);
     const bIsMine = isClientMine(b);
     if (aIsMine && !bIsMine) return -1;
     if (!aIsMine && bIsMine) return 1;
     return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-indigo-900">Baza Kontrahentów</h3>
        <button onClick={onAddClient} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"><Plus size={18} /> Dodaj</button>
      </div>
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">Firma</th>
              <th className="px-6 py-5">Lokalizacja / Opiekun</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedClients.map(c => {
              const isMine = isClientMine(c);
              return (
              <tr key={c.idKlienta} className={`transition-colors ${isMine ? 'bg-indigo-50/30 hover:bg-indigo-50/60' : 'hover:bg-gray-50'}`}>
                <td className="px-8 py-5">
                    <div className="font-bold text-gray-800">{c.NazwaFirmy}</div>
                    {isMine && <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">Twój Klient</span>}
                </td>
                <td className="px-6 py-5 text-sm font-medium">
                    <div className="text-gray-900">{c.Miasto}</div>
                    <div className="text-xs text-gray-400">{c.Adres}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="relative">
                    <select 
                        value={c.idStatusKlienta} 
                        onChange={(e) => onUpdateStatus(c.idKlienta, parseInt(e.target.value))}
                        disabled={!isMine && !isBoss} 
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-black uppercase cursor-pointer outline-none border-2 border-transparent focus:border-indigo-200 transition-all ${c.idStatusKlienta === 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'} ${(!isMine && !isBoss) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {clientStatuses.length > 0 ? clientStatuses.map(s => (
                          <option key={s.idStatusKlienta} value={s.idStatusKlienta}>{s.Nazwa}</option>
                          )) : <option>Ładowanie...</option>}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-5 text-right"><button onClick={() => onSelectClient(c)} className="text-gray-300 hover:text-indigo-600 transition-colors"><ArrowRight size={20} /></button></td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScheduleCalendarView: React.FC<{ 
  user: Employee, 
  tasks: Task[], 
  clients: Client[], 
  onAddTask: any, 
  isBoss: boolean,
  onEditTask: (t: Task) => void
}> = ({ user, tasks, clients, onAddTask, isBoss, onEditTask }) => {
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthName = currentDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' });
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = (startOfMonth.getDay() + 6) % 7;
  const daysInMonth = endOfMonth.getDate();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  
  const changeMonth = (offset: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  const isToday = (date: Date) => { const d = new Date(); return date.getDate() === d.getDate() && date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear(); };
  
  const filteredTasks = isBoss ? tasks : tasks.filter(t => t.idPracownika === user.idPracownika);

  // --- NAPRAWA DATY: Formatuje datę lokalnie (YYYY-MM-DD), ignorując strefę czasową UTC ---
  const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h3 className="text-2xl font-black uppercase tracking-tighter">Harmonogram</h3></div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={20} /></button>
            <span className="font-black uppercase text-xs w-32 text-center">{monthName}</span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="bg-white rounded-[40px] border shadow-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => <div key={d} className="py-4 text-center text-[10px] font-black uppercase text-gray-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((date, idx) => (
            <div key={idx} 
                 className={`min-h-[120px] border-r border-b p-2 transition-colors group ${!date ? 'bg-gray-50/50' : 'hover:bg-indigo-50/30 cursor-pointer'}`} 
                 onClick={() => date && onAddTask(getLocalDateString(date))}
            >
              {date && (
                <>
                  <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${isToday(date) ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>{date.getDate()}</span>
                  </div>
                  <div className="space-y-1">
                    {filteredTasks.filter(t => t.DataPlanowana.startsWith(getLocalDateString(date))).map(t => (
                        <div key={t.idZadania} 
                             onClick={(e) => { e.stopPropagation(); onEditTask(t); }}
                             className="text-[8px] p-1 rounded bg-indigo-50 text-indigo-700 truncate font-black uppercase hover:bg-indigo-100 cursor-pointer transition-colors"
                        >
                            {clients.find(cl => cl.idKlienta === t.idKlienta)?.NazwaFirmy}
                        </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContractsView: React.FC<{ contracts: Contract[], clients: Client[], isBoss: boolean, user: Employee, onAddContract: any, onPreview: any }> = ({ contracts, clients, isBoss, user, onAddContract, onPreview }) => {
  const filtered = isBoss ? contracts : contracts.filter(c => c.idPracownika === user.idPracownika);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h3 className="text-2xl font-black uppercase tracking-tighter">Umowy</h3><button onClick={onAddContract} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2"><Plus size={18} /> Nowa Umowa</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.idUmowy} className="bg-white p-6 rounded-[32px] border relative group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-6"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Handshake size={20} /></div><span className="text-[9px] font-black text-gray-300 uppercase">{c.DataZawarcia}</span></div>
            <h4 className="font-black text-lg mb-1 truncate">{c.PrzedmiotUmowy}</h4>
            <p className="text-[10px] font-bold text-indigo-600 uppercase mb-6">{clients.find(cl => cl.idKlienta === c.idKlienta)?.NazwaFirmy}</p>
            <div className="pt-6 border-t flex justify-between items-center"><div><p className="text-xl font-black text-indigo-900">{c.KwotaUmowy.toLocaleString()} zł</p></div><button onClick={() => onPreview(c)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Eye size={16} /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsView: React.FC<{ products: Product[], isBoss: boolean, onAddProduct: any, onEditCompetitorPrice: any }> = ({ products, isBoss, onAddProduct, onEditCompetitorPrice }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h3 className="text-2xl font-black uppercase tracking-tighter">Produkty</h3>{isBoss && <button onClick={onAddProduct} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2"><Plus size={18} /> Dodaj Produkt</button>}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(p => (
        <div key={p.idProduktu} className="bg-white p-6 rounded-[32px] border relative overflow-hidden group">
          <div className="flex justify-between mb-4"><Tag className="text-indigo-600" size={20} /><div className="flex gap-2">{(p.StanMagazynowy || 0) < 200 && <AlertTriangle className="text-red-500" size={16} />}<button onClick={() => onEditCompetitorPrice(p)} className="text-gray-300 hover:text-indigo-600"><Edit3 size={16} /></button></div></div>
          <h4 className="font-black text-lg mb-4">{p.NazwaProduktu}</h4>
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">Nasza Cena:</span><span className="text-indigo-600">{Number(p.CenaBazowa).toFixed(2)} zł</span></div>
            <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">Rynek:</span><span className="text-red-400">{Number(p.CenaKonkurencji || 0).toFixed(2)} zł</span></div>
            <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">Magazyn:</span><span className={`${(p.StanMagazynowy || 0) < 200 ? 'text-red-500' : 'text-gray-900'}`}>{p.StanMagazynowy} {p.Jednostka}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReportsView: React.FC<{ 
    employees: Employee[], 
    tasks: Task[], 
    contracts: Contract[], 
    clients: Client[],
    contractTypes: TypUmowy[]
}> = ({ employees, tasks, contracts, clients, contractTypes }) => {
  
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);

  // --- 1. OBLICZENIA BILANSU (ZYSKI I STRATY) ---
  const saleTypeId = contractTypes.find(t => t.Nazwa.toLowerCase().includes('sprzedaż'))?.idTypUmowy;
  const buyTypeId = contractTypes.find(t => t.Nazwa.toLowerCase().includes('kupno'))?.idTypUmowy;

  const totalSales = contracts
    .filter(c => c.idTypUmowy === saleTypeId)
    .reduce((sum, c) => sum + Number(c.KwotaUmowy || 0), 0);

  const totalPurchases = contracts
    .filter(c => c.idTypUmowy === buyTypeId)
    .reduce((sum, c) => sum + Number(c.KwotaUmowy || 0), 0);

  const balance = totalSales - totalPurchases;

  // --- 2. DANE DO WYKRESU SŁUPKOWEGO (PRZYCHÓD vs KOSZT) ---
  const doubleBarChartData = useMemo(() => {
    const monthly: { [key: string]: { month: string, income: number, expense: number } } = {};
    
    contracts.forEach(c => {
      const month = c.DataZawarcia.substring(0, 7); // YYYY-MM
      if (!monthly[month]) {
          monthly[month] = { month, income: 0, expense: 0 };
      }
      
      const val = Number(c.KwotaUmowy || 0);
      if (c.idTypUmowy === saleTypeId) {
          monthly[month].income += val;
      } else if (c.idTypUmowy === buyTypeId) {
          monthly[month].expense += val;
      }
    });

    return Object.values(monthly).sort((a,b) => a.month.localeCompare(b.month));
  }, [contracts, saleTypeId, buyTypeId]);

  const repStats = employees.filter(e => e.Rola && e.Rola.includes('Przedstawiciel')).map(e => {
    const eTasks = tasks.filter(t => t.idPracownika === e.idPracownika);
    const eContracts = contracts.filter(c => c.idPracownika === e.idPracownika);
    return {
      id: e.idPracownika,
      name: `${e.Imie} ${e.Nazwisko}`,
      visits: eTasks.filter(t => t.idTypZadania === 1 && t.idStatusZadania === 2).length,
      calls: eTasks.filter(t => t.idTypZadania === 2 && t.idStatusZadania === 2).length,
      plannedVisits: eTasks.filter(t => t.idTypZadania === 1 && t.idStatusZadania === 1).length,
      contractCount: eContracts.length,
      totalRevenue: eContracts.reduce((sum, c) => sum + Number(c.KwotaUmowy || 0), 0)
    };
  });

  const clientStats = clients.map(cl => {
    const clContracts = contracts.filter(c => c.idKlienta === cl.idKlienta);
    return {
      client: cl,
      totalRevenue: clContracts.reduce((sum, c) => sum + Number(c.KwotaUmowy || 0), 0),
      contractCount: clContracts.length
    };
  }).sort((a,b) => b.totalRevenue - a.totalRevenue);

  const getMonthlyDataForClient = (id: number) => {
    const clContracts = contracts.filter(c => c.idKlienta === id);
    const monthly: {[key: string]: number} = {};
    clContracts.forEach(c => {
      const month = c.DataZawarcia.substring(0, 7); 
      monthly[month] = (monthly[month] || 0) + Number(c.KwotaUmowy);
    });
    return Object.entries(monthly).map(([month, value]) => ({ month, value })).sort((a,b) => a.month.localeCompare(b.month));
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      
      {/* SEKCJA BILANSU */}
      <section>
        <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 mb-6">
            <Wallet className="text-indigo-600" /> Bilans Finansowy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10 text-emerald-600"><TrendingUpIcon size={64} /></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Przychody (Sprzedaż)</p>
                <p className="text-3xl font-black text-emerald-600">+{totalSales.toLocaleString()} zł</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10 text-red-600"><ShoppingBag size={64} /></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Koszty (Zakup)</p>
                <p className="text-3xl font-black text-red-600">-{totalPurchases.toLocaleString()} zł</p>
            </div>

            <div className={`p-6 rounded-[32px] border shadow-sm relative overflow-hidden text-white ${balance >= 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-orange-500 border-orange-500'}`}>
                {/* ZMIANA IKONY NA WAGĘ (SCALE) */}
                <div className="absolute right-0 top-0 p-4 opacity-20 text-white"><Scale size={64} /></div>
                <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">Wynik Finansowy</p>
                <p className="text-4xl font-black">{balance > 0 ? '+' : ''}{balance.toLocaleString()} zł</p>
            </div>
        </div>
      </section>

      {/* SEKCJA WYKRESU PORÓWNAWCZEGO */}
      <section className="space-y-6">
        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 mb-8">
            <TrendingUpIcon className="text-indigo-600" /> Przychody vs Koszty (Miesięcznie)
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doubleBarChartData} margin={{ left: 40, right: 40, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  content={({active, payload}) => active && payload && payload.length ? (
                    <div className="bg-white border p-4 rounded-2xl shadow-xl font-bold text-xs">
                      <p className="opacity-50 text-[9px] uppercase mb-2 text-gray-500">{payload[0].payload.month}</p>
                      <p className="text-emerald-600 mb-1">Przychód: {payload[0].value.toLocaleString()} zł</p>
                      {/* payload[1] może nie istnieć jeśli nie ma drugiego bara, ale tu zawsze renderujemy 2 */}
                      <p className="text-red-600">Koszt: {payload[1]?.value.toLocaleString()} zł</p>
                    </div>
                  ) : null}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 700}}/>
                {/* DWA SŁUPKI OBOK SIEBIE */}
                <Bar name="Przychody" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar name="Koszty" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 2. Sekcja Metryk Pracowników */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Users className="text-indigo-600" /> Efektywność Przedstawicieli
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Liczba wizyt, telefonów, umów oraz obrót zespołu</p>
          </div>
        </div>
        <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-8 py-6">Przedstawiciel</th>
                <th className="px-6 py-6 text-center">Real. Wizyty</th>
                <th className="px-6 py-6 text-center">Real. Tel</th>
                <th className="px-6 py-6 text-center">Plan. Wizyty</th>
                <th className="px-6 py-6 text-center">Umowy</th>
                <th className="px-8 py-6 text-right">Obrót całkowity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repStats.map(s => (
                <tr key={s.id} className="hover:bg-indigo-50/10 transition-all">
                  <td className="px-8 py-6 font-black text-indigo-950">{s.name}</td>
                  <td className="px-6 py-6 text-center">
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-black text-[10px] border border-emerald-100 uppercase tracking-widest">
                      {s.visits}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-black text-[10px] border border-blue-100 uppercase tracking-widest">
                      {s.calls}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full font-black text-[10px] border border-orange-100 uppercase tracking-widest">
                      {s.plannedVisits}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center font-bold text-gray-400">{s.contractCount}</td>
                  <td className="px-8 py-6 text-right font-black text-indigo-600 text-lg">{s.totalRevenue.toLocaleString()} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Sekcja Analizy Kontrahentów */}
      <section className="space-y-6">
        {/* ... (Tabela kontrahentów) */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Briefcase className="text-indigo-600" /> Portfel Kontrahentów
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Ranking obrotów i historia zakupowa</p>
          </div>
        </div>
        <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-8 py-6">Firma</th>
                <th className="px-6 py-6 text-center">Umowy</th>
                <th className="px-6 py-6 text-right">Obrót Firmy X</th>
                <th className="px-8 py-6 text-right">Miesięcznie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientStats.map(s => (
                <tr key={s.client.idKlienta} className="hover:bg-indigo-50/10 transition-all">
                  <td className="px-8 py-6">
                    <p className="font-black text-indigo-950">{s.client.NazwaFirmy}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{s.client.Miasto}</p>
                  </td>
                  <td className="px-6 py-6 text-center font-bold text-gray-300">{s.contractCount}</td>
                  <td className="px-6 py-6 text-right font-black text-indigo-900">{s.totalRevenue.toLocaleString()} zł</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedClientForHistory(s.client)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 ml-auto"
                    >
                      <BarChartIcon size={14} /> Pokaż historię
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Historii Miesięcznej Klienta */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 bg-indigo-950/70 backdrop-blur-xl flex items-center justify-center z-[300] p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl p-10 animate-in zoom-in duration-300 relative">
            <button 
              onClick={() => setSelectedClientForHistory(null)}
              className="absolute top-8 right-8 p-3 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-400 rounded-2xl transition-all shadow-sm"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-200">
                {selectedClientForHistory.NazwaFirmy[0]}
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedClientForHistory.NazwaFirmy}</h3>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Analityka obrotów miesięcznych</p>
              </div>
            </div>
            {/* ... zawartość modalu klienta bez zmian ... */}
             <div className="lg:col-span-3 h-[350px] bg-gray-50/50 p-8 rounded-[40px] border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlyDataForClient(selectedClientForHistory.idKlienta)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: '#4f46e5', opacity: 0.05}} content={({active, payload}) => active && payload ? (<div className="bg-indigo-900 text-white p-3 rounded-2xl text-[10px] font-black shadow-xl"><p className="mb-1 opacity-50 uppercase">{payload[0].payload.month}</p><p className="text-sm">{payload[0].value.toLocaleString()} zł</p></div>) : null} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};


const EmployeesView: React.FC<{ employees: Employee[], clients: Client[], contracts: Contract[], onSelectEmployee: any }> = ({ employees, clients, contracts, onSelectEmployee }) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-black uppercase tracking-tighter">Zespół Terenowy</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.filter(e => e.Rola && e.Rola.includes('Przedstawiciel')).map(e => {
        const clientCount = clients.filter(c => {
            const isFromArea = c.Miasto === e.ObszarZadania;
            const hasContract = contracts.some(con => con.idKlienta === c.idKlienta && con.idPracownika === e.idPracownika);
            return isFromArea || hasContract;
        }).length;

        return (
          <div key={e.idPracownika} className="bg-white p-8 rounded-[40px] border group hover:shadow-xl transition-all cursor-pointer" onClick={() => onSelectEmployee(e)}>
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black mb-6 group-hover:scale-110 transition-transform">{e.Imie[0]}{e.Nazwisko[0]}</div>
            <h4 className="text-xl font-black">{e.Imie} {e.Nazwisko}</h4>
            <p className="text-xs font-bold text-indigo-600 uppercase mt-1 flex items-center gap-1"><MapPin size={12} /> {e.ObszarZadania}</p>
            <div className="mt-8 pt-8 border-t flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase">Kontrahenci</p>
                  <p className="text-lg font-black">{clientCount}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><ArrowRight size={20} /></div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const EditTaskModal: React.FC<{
    task: Task, onUpdate: any, onDelete: any, onClose: any, 
    clients: Client[], taskTypes: TypZadania[], taskStatuses: StatusZadania[],
    employees: Employee[],
    isBoss: boolean 
}> = ({task, onUpdate, onDelete, onClose, clients, taskTypes, taskStatuses, employees, isBoss}) => {
    const defaultDate = task.DataPlanowana.split('T')[0];
    const defaultTime = task.DataPlanowana.split('T')[1].substring(0,5);

    return (
      <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8 animate-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase">Edycja Zadania</h3>
              <button onClick={onDelete} className="text-red-400 hover:text-red-600 font-bold text-xs uppercase flex items-center gap-1">
                  <Trash2 size={16}/> Usuń
              </button>
          </div>
          
          <form onSubmit={onUpdate} className="space-y-4">
            {/* SEKCJA PRZYPISANIA (TYLKO SZEF) */}
            {isBoss && (
                <div>
                    <label className={labelClass}>PRZYPISANE DO</label>
                    <select name="idPracownika" defaultValue={task.idPracownika} className={inputClass}>
                        {employees.map(e => <option key={e.idPracownika} value={e.idPracownika}>{e.Imie} {e.Nazwisko}</option>)}
                    </select>
                </div>
            )}

            <div>
                <label className={labelClass}>KLIENT</label>
                <input disabled className={`${inputClass} bg-gray-100 text-gray-500`} value={clients.find(c => c.idKlienta === task.idKlienta)?.NazwaFirmy || 'Klient usunięty'} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>TYP</label>
                    <select name="idTypZadania" defaultValue={task.idTypZadania} className={inputClass}>
                        {taskTypes.map(t => <option key={t.idTypZadania} value={t.idTypZadania}>{t.Nazwa}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>STATUS</label>
                    <select name="idStatusZadania" defaultValue={task.idStatusZadania} className={inputClass}>
                        {taskStatuses.map(s => <option key={s.idStatusZadania} value={s.idStatusZadania}>{s.Nazwa}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>DATA</label><input name="date" type="date" defaultValue={defaultDate} className={inputClass} /></div>
                <div><label className={labelClass}>GODZINA</label><input name="time" type="time" defaultValue={defaultTime} className={inputClass} /></div>
            </div>
            
            <div>
                <label className={labelClass}>NOTATKA / WYNIK</label>
                <textarea name="WynikNotatka" defaultValue={task.WynikNotatka} className={inputClass} rows={3} />
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 text-gray-500 font-bold uppercase">Anuluj</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg">Zapisz Zmiany</button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default App;
