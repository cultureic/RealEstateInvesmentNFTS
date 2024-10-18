//@ts-nocheck

/* eslint-disable jsx-a11y/anchor-is-valid */
import { Badge, Dropdown, Table, useTheme } from "flowbite-react";
import type { FC } from "react";
import Chart from "react-apexcharts";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { useAuth } from "../../hooks/auth";
import MyForm from "../../components/propertyForm";





const CreatePropertyPage: FC = function () {
  const{login} = useAuth();
  return (
    <NavbarSidebarLayout login={login}>
      <div className="px-4 pt-6">
        <MyForm/>
      </div>
    </NavbarSidebarLayout>
  );
};


export default CreatePropertyPage;