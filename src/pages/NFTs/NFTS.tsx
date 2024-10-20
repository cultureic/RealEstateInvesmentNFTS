//@ts-nocheck
import { Card, TextInput } from 'flowbite-react';
import { useAuth } from '../../hooks/auth';
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { useEffect } from 'react';

const NFTGrid = () => {
    const { NFTS, login } = useAuth(); // Correcting from NFT to NFTS

    // No effect needed unless you are fetching the NFTS
    useEffect(() => {
        console.log("nfts")
        // You can add logic here if needed, such as fetching NFTs
    }, [NFTS]);

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
                {NFTS && NFTS.map((nftItem, index) => (  // Use NFTS.map instead of NFT.map
                    <Card key={index}>
                        {/* Display the picture (convert Uint8Array to base64 for image) */}
                        <img
                            src={`data:image/png;base64,${uint8ArrayToBase64(nftItem.nftData.picture)}`}
                            alt={`NFT ${index}`}
                            className="mb-4"
                        />

                        {/* Display the address */}
                        <TextInput
                            id={`address-${index}`}
                            type="text"
                            value={nftItem.nftData.address}  // Use nftItem.nftData
                            readOnly
                            className="mb-2"
                        />

                        {/* Display the description */}
                        <p className="text-gray-500">{nftItem.nftData.description}</p>

                        {/* Display contract with truncation */}
                        <p className="text-gray-500 mt-2 truncate">Contract: {nftItem.nftData.contract[0]}</p>

                        {/* Display BTC values */}
                        <div className="mt-4">
                            <p>Rent Value (BTC): {nftItem.nftData.rentValueBTC.toString()}</p>
                            <p>Value (BTC): {nftItem.nftData.valueBTC.toString()}</p>
                        </div>
                        <h1>NFT count</h1>
                          {/* Display the address */}
                          <TextInput
                            id={`address-${index}${nftItem.count}`}
                            type="text"
                            value={nftItem.count}  // Use nftItem.nftData
                            readOnly
                            className="mb-2"
                        />

                    </Card>
                ))}
            </div>
            </div>
        </NavbarSidebarLayout>
    );
};

export default NFTGrid;
