//@ts-nocheck
import { Button, Card, TextInput, Modal } from 'flowbite-react';
import { useAuth } from '../../hooks/auth';
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { useState, useEffect } from 'react';

const NFTGrid = () => {
    const { NFTS, login, transferNFTtoPrincipal } = useAuth(); // Correcting from NFT to NFTS
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [principalId, setPrincipalId] = useState('');
    const [selectedNFT, setSelectedNFT] = useState(null);

    // Handle modal opening with selected NFT
    const openModal = (nftItem) => {
        setSelectedNFT(nftItem);
        setIsModalOpen(true);
    };

    // Handle modal closing
    const closeModal = () => {
        setIsModalOpen(false);
        setPrincipalId('');
        setSelectedNFT(null);
    };

    // Handle transfer action
    const handleTransfer = () => {
        if (selectedNFT && principalId) {
            transferNFTtoPrincipal(selectedNFT, principalId);
            closeModal();
        } else {
            alert("Please enter a valid Principal ID.");
        }
    };

    // Convert Uint8Array to base64
    const uint8ArrayToBase64 = (uint8Array) => {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return window.btoa(binary);
    };

    return (
        <NavbarSidebarLayout login={login}>
            <div className='min-h-screen space-y-6 p-4'>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {NFTS && NFTS.map((nftItem, index) => {
                        if(nftItem && nftItem.nftData === undefined){
                            return null;
                        }
                       return <Card key={index}>
                            <img
                                src={`data:image/png;base64,${uint8ArrayToBase64(nftItem && nftItem.nftData && nftItem.nftData.picture)}`}
                                alt={`NFT ${index}`}
                                className="mb-4"
                            />
                            <TextInput
                                id={`address-${index}`}
                                type="text"
                                value={nftItem.nftData.address}
                                readOnly
                                className="mb-2"
                            />
                            <p className="text-gray-500">{nftItem.nftData.description}</p>
                            <p className="text-gray-500 mt-2 truncate">Contract: {nftItem.nftData.contract[0]}</p>
                            <div className="mt-4">
                                <p>Rent Value (BTC): {nftItem.nftData.rentValueBTC.toString()}</p>
                                <p>Value (BTC): {nftItem.nftData.valueBTC.toString()}</p>
                            </div>
                            <h1>NFT count</h1>
                            <TextInput
                                id={`address-${index}${nftItem.count}`}
                                type="text"
                                value={nftItem.count}
                                readOnly
                                className="mb-2"
                            />
                            <Button onClick={() => openModal(nftItem)}>Transfer NFT</Button>
                        </Card>
                    })}
                </div>

                {/* Transfer NFT Modal */}
                <Modal show={isModalOpen} onClose={closeModal}>
                    <Modal.Header>Transfer NFT</Modal.Header>
                    <Modal.Body>
                        <TextInput
                            placeholder="Enter Principal ID"
                            value={principalId}
                            onChange={(e) => setPrincipalId(e.target.value)}
                            className="mb-4"
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleTransfer}>Transfer</Button>
                        <Button color="gray" onClick={closeModal}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </NavbarSidebarLayout>
    );
};

export default NFTGrid;
