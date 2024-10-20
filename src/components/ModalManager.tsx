
//@ts-nocheck
import { useState } from 'react';
import { Modal, Button, Spinner } from 'flowbite-react';
import  {useAuth} from "./../hooks/auth";

const ModalManager = () => {
    const{isError,isLoading,errorMessage,setIsError} = useAuth();
//   const [isLoading, setIsLoading] = useState(false); // State for the loading modal
//   const [isError, setIsError] = useState(false);     // State for the error modal
//   const [errorMessage, setErrorMessage] = useState(''); // State for the error message



  const hideErrorModal = () => setIsError(false);

  return (
    <div>
      {/* Loading Modal */}
      <Modal show={isLoading} size="md" >
        <Modal.Header>Loading...</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="loader">Loading...</div>
          </div>
          <Spinner size="lg" />
        </Modal.Body>
      </Modal>

      {/* Error Modal */}
      <Modal show={isError} size="md" onClose={hideErrorModal}>
        <Modal.Header>Error</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <p>{errorMessage}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={hideErrorModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ModalManager;
