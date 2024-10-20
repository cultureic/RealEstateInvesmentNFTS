//@ts-nocheck

import { Modal, Button, Spinner } from "flowbite-react";
import { useEffect } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { useAuth } from "../../hooks/auth";
import MyForm from "../../components/propertyForm";
import { FaHome } from "react-icons/fa"; // Importing house icon

const CreatePropertyPage = () => {
  const { login, showModal, step, setShowModal } = useAuth();

  useEffect(() => {}, [showModal, step]);

  return (
    <NavbarSidebarLayout login={login}>
      <div className="px-4 pt-6">
        {/* Form or other content */}
        <MyForm />

        {/* Step-by-Step Modal */}
        <Modal  show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>Step {step} of 3</Modal.Header>
          <Modal.Body>
            <div className="flex justify-center items-center mb-4">
              {/* Spinner added for all steps */}
              <Spinner size="lg" />
            </div>
            {step === 1 ? (
              <div>
                <h3 className="text-lg font-medium">Property Info Submission</h3>
                <p>Submit property details to the Internet Computer.</p>
              </div>
            ) : step === 2 ? (
              <div>
                <h3 className="text-lg font-medium">Creating STX Private Key</h3>
                <p>Your STX private key is being generated.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium">Creating STX Address</h3>
                <p>Your STX address is being set up.</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            please be patient while we process your request.......
            {/* Animated house icon */}
            <FaHome
              className="ml-2 animate-bounce text-xl text-blue-500" // Bouncing animation
            />
          </Modal.Footer>
        </Modal>
      </div>
    </NavbarSidebarLayout>
  );
};

export default CreatePropertyPage;
