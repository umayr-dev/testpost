// import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import Login from "./page/Login";
// import Dashboard from "./page/Dashboard";

// const App = () => {
//   const isAuthenticated = Boolean(localStorage.getItem("token")); // Tokenni tekshiramiz va Boolean tipiga o'zgartiramiz

//   return (
//     <Router>
//       <Routes>
//         {/* Agar login bo‘lgan bo‘lsa, Dashboard'ga o‘tadi */}
//         <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        
//         {/* Agar login qilmagan bo‘lsa, login sahifasiga jo‘natamiz */}
//         <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        
//         {/* Barcha boshqa yo‘nalishlar login yoki dashboard'ga yo‘naltiriladi */}
//         <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
import Main from "./components/Main";

function App() {
  return <Main />;
}

export default App;
