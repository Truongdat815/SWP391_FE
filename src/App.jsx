
import './index.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Listing from './pages/Listing'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import SignIn from './pages/SignIn'
import AddCar from './pages/AddCar'
import DealerStaffDashboard from './pages/dashboard/DealerStaffDashboard'
import DealerManagerDashboard from './pages/dashboard/DealerManagerDashboard'
import NewOrder from './pages/dashboard/NewOrder'
import EVMDashboard from './pages/dashboard/EVMDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import VehicleDetail from './pages/VehicleDetail'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CreateQuote from './pages/dashboard/sales/CreateQuote'
import Orders from './pages/dashboard/sales/Orders'
import Payments from './pages/dashboard/sales/Payments'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Header and Footer */}
        <Route path="/" element={<>
          <Header />
          <Home />
          <Footer />
        </>} />
        <Route path="/about" element={<>
          <Header />
          <About />
          <Footer />
        </>} />
        <Route path="/listing" element={<>
          <Header />
          <Listing />
          <Footer />
        </>} />
        <Route path="/shop" element={<>
          <Header />
          <Shop />
          <Footer />
        </>} />
        <Route path="/contact" element={<>
          <Header />
          <Contact />
          <Footer />
        </>} />
        <Route path="/add-car" element={<>
          <Header />
          <AddCar />
          <Footer />
        </>} />
        
        {/* Login Route without Header/Footer */}
        <Route path="/signin" element={<SignIn />} />
        
        {/* Dashboard Routes without Header/Footer */}
        <Route path="/dashboard/dealer-staff" element={<DealerStaffDashboard />} />
        <Route path="/dashboard/dealer-staff/orders/new" element={<NewOrder />} />
        <Route path="/dashboard/dealer-staff/sales/create-quote" element={<CreateQuote />} />
        <Route path="/dashboard/dealer-staff/sales/orders" element={<Orders />} />
        <Route path="/dashboard/dealer-staff/sales/payments" element={<Payments />} />
        <Route path="/dashboard/dealer-manager" element={<DealerManagerDashboard />} />
        <Route path="/dashboard/evm-staff" element={<EVMDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        
        {/* Vehicle Detail Routes */}
        <Route path="/vehicle/:model" element={<VehicleDetail />} />
        
        <Route path="*" element={<>
          <Header />
          <Home />
          <Footer />
        </>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
