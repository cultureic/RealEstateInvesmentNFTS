// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { Card, TextInput, Modal, Button, Badge, Spinner } from 'flowbite-react';
import { useAuth } from '../../hooks/auth';
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Principal } from '@dfinity/principal';
import { FaHome } from "react-icons/fa"; // Importing house icon


// Helper function to convert Uint8Array to Base64 string for image display
const arrayBufferToBase64 = (buffer: Uint8Array) => {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const UserProperties: React.FC = () => {
    const { userProperties, login, deployNFTContract, getNFTS, mintNFT, setShowModal, showModal, step } = useAuth();
    const [selectedEntity, setSelectedEntity] = useState<any | null>(null); // State for the selected entity
    const [isOpen, setIsOpen] = useState(false); // State to control main modal visibility
    const [isDeployModalOpen, setDeployModalOpen] = useState(false); // State for deploy confirmation modal

    useEffect(() => { }, [showModal, step])

    useEffect(() => {
        if (userProperties && userProperties[0]) {
            getNFTS(userProperties[0])
        }
    }, [userProperties])

    const openModal = (entity: any) => {
        setSelectedEntity(entity);
        setIsOpen(true);
    };

    const mint = (entity) => {
        mintNFT(entity)
    }

    const closeModal = () => {
        setIsOpen(false);
        setSelectedEntity(null);
    };

    const openDeployModal = (entity) => {
        setSelectedEntity(entity);
        setDeployModalOpen(true);

    };

    const closeDeployModal = () => {
        setDeployModalOpen(false);
    };

    const handleDeployContract = () => {
        if (selectedEntity) {
            // Logic to deploy the contract goes here
            console.log(`Deploying contract for ${selectedEntity.address}`);
            deployNFTContract(selectedEntity);
            closeDeployModal();
            closeModal(); // Close the main modal after deploying
        }
    };

    useEffect(() => { }, [userProperties]);

    return (
        <NavbarSidebarLayout login={login}>
            <div className="flex flex-col items-center min-h-screen space-y-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-7xl">
                    {userProperties && userProperties.map((entity, index) => {
                        const { address, owner, stxWallet, status } = entity;

                        return (
                            <Card className="w-full p-6 h-full flex flex-col justify-between" key={index}>
                                <h1 className="text-2xl font-bold mb-6 dark:text-white">Property {index + 1} Overview</h1>

                                {entity.picture && (
                                    <div className="col-span-1">
                                        <img
                                            src={`data:image/png;base64,${arrayBufferToBase64(entity.picture)}`}
                                            alt="Uploaded entity"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}

                                {/* Address */}
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold mb-2 dark:text-white">Address</h2>
                                    <TextInput id={`address-${index}`} type="text" value={address} readOnly />
                                </div>

                                {/* Owner (Principal) */}
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold mb-2 dark:text-white">Owner (Principal)</h2>
                                    <TextInput
                                        id={`owner-${index}`}
                                        type="text"
                                        value={Principal.fromUint8Array(owner._arr).toText()}
                                        readOnly
                                    />
                                </div>

                                {/* Status Handling */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold dark:text-white">Status</h3>
                                    {status === "notdeployed" ? (
                                        <Button onClick={() => { openDeployModal(entity); }} color="failure">Deploy Contract</Button>
                                    ) : (
                                        <>
                                            <Badge color="success" size="lg">Deployed</Badge>
                                            <div
                                                onClick={() => window.location.href = `https://explorer.hiro.so/address/${entity.contract[0]}?chain=testnet`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <TextInput
                                                    id={`address-${index + entity.contract[0]}`}
                                                    type="text"
                                                    value={entity.contract[0]}
                                                    readOnly
                                                />
                                            </div>
                                            <Button onClick={() => { mint(entity); }} color="failure">Mint</Button>
                                        </>
                                    )}
                                </div>

                                {/* View Details Button */}
                                <div className="mt-4 text-center">
                                    <Button onClick={() => openModal(entity)}>View Full Details</Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Modal to show full details */}
                {selectedEntity && (
                    <Modal show={isOpen} onClose={closeModal} dismissible={true}>
                        <Modal.Header>Property Details</Modal.Header>
                        <Modal.Body>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Picture in the top left */}
                                {selectedEntity.picture && (
                                    <div className="col-span-1">
                                        <img
                                            src={`data:image/png;base64,${arrayBufferToBase64(selectedEntity.picture)}`}
                                            alt="Uploaded entity"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}

                                {/* Two columns for the text */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    {/* First Column */}
                                    <div>
                                        <h3 className="text-lg font-semibold dark:text-white">Address</h3>
                                        <TextInput type="text" value={selectedEntity.address} readOnly />

                                        <h3 className="text-lg font-semibold mt-4 dark:text-white">Description</h3>
                                        <TextInput type="text" value={selectedEntity.description} readOnly />

                                        <h3 className="text-lg font-semibold mt-4 dark:text-white">ID</h3>
                                        <TextInput type="text" value={selectedEntity.id.toString()} readOnly />

                                        <h3 className="text-lg font-semibold mt-4 dark:text-white">Principal Owner</h3>
                                        <TextInput type="text" value={Principal.fromUint8Array(selectedEntity.owner._arr).toText()} readOnly />
                                    </div>

                                    {/* Second Column */}
                                    <div>
                                        <h3 className="text-lg font-semibold dark:text-white">Rent Value (in BTC)</h3>
                                        <Badge color="info" size="lg">{selectedEntity.rentValueBTC.toString()} BTC</Badge>

                                        <h3 className="text-lg font-semibold mt-4 dark:text-white">Value (in BTC)</h3>
                                        <Badge color="success" size="lg">{selectedEntity.valueBTC.toString()} BTC</Badge>

                                        <h3 className="text-lg font-semibold mt-4 dark:text-white">Status</h3>
                                        <TextInput type="text" value={selectedEntity.status} readOnly />

                                        <h3 className="text-lg font-semibold mt-4 dark:text-white">Stacks Wallet</h3>
                                        {selectedEntity.stxWallet.map((wallet: string, walletIndex: number) => (
                                            <TextInput
                                                key={walletIndex}
                                                type="text"
                                                value={wallet}
                                                readOnly
                                                className="mb-2"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                )}

                {/* Deploy Confirmation Modal */}
                {selectedEntity && (
                    <Modal show={isDeployModalOpen} onClose={closeDeployModal} dismissible={true}>
                        <Modal.Header>Confirm Deployment</Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to deploy the contract for this property: <strong>{selectedEntity.address}</strong>?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={handleDeployContract}>Yes, Deploy</Button>
                            <Button onClick={closeDeployModal} color="gray">Cancel</Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {/* Step-by-Step Modal */}
                <Modal show={showModal} onClose={() => setShowModal(false)}>
                    { step && step < 3 && <Modal.Header>Step {step} of 2</Modal.Header>
                    }          <Modal.Body>
                    {step && step > 3 && <Modal.Header>Minting NFT</Modal.Header>
                    }          <Modal.Body></Modal.Body>
                        <div className="flex justify-center items-center mb-4">
                            {/* Spinner added for all steps */}
                            <Spinner size="lg" />
                        </div>
                        {step === 1 ? (
                            <div>
                                <h3 className="text-lg font-medium">NFT property Contract Deployment</h3>
                                <p>STX contract being deployed!.</p>
                            </div>
                        ) : step === 2 ? (
                            <div>
                                <h3 className="text-lg font-medium">Signing TX</h3>
                                <p>Your STX transaction is being sign by the property wallet</p>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-medium">Signing TX</h3>
                                <p>Your STX NFT is being minted.</p>
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

export default UserProperties;
