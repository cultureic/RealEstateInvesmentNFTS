// @ts-nocheck
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import theme from "./flowbite-theme";
import { Flowbite } from "flowbite-react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "./pages";
import SignInPage from "./pages/authentication/sign-in";
import SignUpPage from "./pages/authentication/sign-up";
import EcommerceProductsPage from "./pages/e-commerce/products";
import UserListPage from "./pages/users/list";
import {AuthProvider} from  "./hooks/auth";
import CreateProperty from "./pages/create-property/CreateProperty";
import Properties from "./pages/my-properties/Properties"
import NFTGrid from "./pages/NFTs/NFTS";
import ModalManager from "./components/ModalManager";

const container = document.getElementById("root");

if (!container) {
  throw new Error("React root element doesn't exist!");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <Flowbite theme={{ theme }}>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} index />
          <Route
            path="/create-property"
            element={<CreateProperty />}
          />
          <Route path="/properties" element={<Properties/>} />
          <Route path="/nfts" element={<NFTGrid/>}/>
        </Routes>
          {/* Add ModalManager to render modals */}
          <ModalManager />
        </AuthProvider>
      </BrowserRouter>
    </Flowbite>
  </StrictMode>
);
