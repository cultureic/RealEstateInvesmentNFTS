
//@ts-nocheck

import { Sidebar, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  HiChartPie,
  HiClipboard,
  HiCollection,
  HiInformationCircle,
  HiLogin,
  HiPencil,
  HiSearch,
  HiShoppingBag,
  HiUsers,
  HiCash,
  HiDocumentAdd,
  HiDatabase
} from "react-icons/hi";
import { useAuth } from "../hooks/auth";

const ExampleSidebar: FC = function () {
  const {isAuth,login,logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("");

  useEffect(()=>{},[isAuth])

  useEffect(() => {
    const newPage = window.location.pathname;

    setCurrentPage(newPage);
  }, [setCurrentPage]);

  return (
    <Sidebar aria-label="Sidebar with multi-level dropdown example">
      <div className="flex h-full flex-col justify-between py-2">
        <div>
          <form className="pb-3 md:hidden">
            <TextInput
              icon={HiSearch}
              type="search"
              placeholder="Search"
              required
              size={32}
            />
          </form>
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item
                href="/"
                icon={HiCash}
                className={
                  "/" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""
                }
              >
               Wallets
              </Sidebar.Item>
              <Sidebar.Item
                href="/create-property"
                icon={HiDocumentAdd}
                className={
                  "/e-commerce/products" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }
              >
                Create property
              </Sidebar.Item>
              <Sidebar.Item
                href="/properties"
                icon={HiDatabase}
                className={
                  "/users/list" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }
              >
                My Properties
              </Sidebar.Item>
              <Sidebar.Item
                href="/nfts"
                icon={HiDatabase}
                className={
                  "/users/list" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }
              >
                NFTS
              </Sidebar.Item>
            { !isAuth &&  <Sidebar.Item onClick={()=>{
              login()
            }} icon={HiLogin}>
                Sign in
              </Sidebar.Item>}
              { isAuth &&  <Sidebar.Item  icon={HiLogin}
              onClick={()=>{logout()}}
              >
                Log out 
              </Sidebar.Item>}
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </div>
      </div>
    </Sidebar>
  );
};

export default ExampleSidebar;
