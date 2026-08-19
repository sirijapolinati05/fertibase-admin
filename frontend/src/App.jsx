// src/App.jsx
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <AppRoutes /> 
      </ProductProvider>
    </AuthProvider>
  );
}
