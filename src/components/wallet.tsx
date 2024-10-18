//@ts-nocheck


import React, { useEffect, useState } from 'react';
import { Card, Badge, TextInput, Button } from 'flowbite-react';
import { useAuth } from '../hooks/auth';

const WalletInfoPage: React.FC = () => {
    // State for wallet address and balance
    const { stxAddress, stxBalance, isAuth, principalText } = useAuth();

    useEffect(() => {

    }, [isAuth])

    // Handle copy to clipboard functionality for the wallet address
    const handleCopyAddress = () => {
        navigator.clipboard.writeText(stxAddress);
        alert('Wallet address copied to clipboard!');
    };
    const handleCopyPrincipal = () => {
        navigator.clipboard.writeText(principalText);
        alert('Wallet address copied to clipboard!');
    }

    return (
        <>
            {isAuth && <div className="flex flex-col items-start min-h-screen m-5">

                <h1 className="text-2xl font-bold mb-4 dark:text-white">Wallet Information</h1>

                {/* Wallet Address */}
                {stxAddress && <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2 dark:text-white">STX Address</h2>
                    <div className="flex items-center">
                        <TextInput
                            id="walletAddress"
                            type="text"
                            value={stxAddress}
                            readOnly
                            className="w-full"
                        />
                        <Button
                            color="gray"
                            onClick={handleCopyAddress}
                            className="ml-2"
                        >
                            Copy
                        </Button>
                    </div>
                </div>}

                {/* Wallet Balance */}
                {stxBalance && <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2 dark:text-white">Balance</h2>
                    <div className="flex items-center">
                        <Badge color="info" size="lg">
                            {stxBalance} STX
                        </Badge>
                    </div>
                </div>}
                {principalText && <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2 dark:text-white">ICP PrincipalID</h2>
                    <div className="flex items-center">
                        <TextInput
                            id="principalText"
                            type="text"
                            value={principalText}
                            readOnly
                            className="w-full"
                        />
                        <Button
                            color="gray"
                            onClick={handleCopyAddress}
                            className="ml-2"
                        >
                            Copy
                        </Button>
                    </div>
                </div>}

            </div>
            }</>
    );
};

export default WalletInfoPage;
