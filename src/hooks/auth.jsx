import { AuthClient } from "@dfinity/auth-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createicrc1Actor } from "../ic/icpswap/icrc1/index.js";
import { createTokenlistActor } from "../ic/icpswap/tokenList/index.js";
import { createPoolActor } from "../ic/icpswap/pool/index.js";
import { createSwapFactoryActor } from "../ic/icpswap/swapV3/index.js";
import { Principal } from "@dfinity/principal";
import {
  createStacksPrivateKey,
  makeRandomPrivKey,
  getPublicKey,
  getAddressFromPrivateKey,
  TransactionVersion,
  privateKeyToString,
  AnchorMode,
  makeContractDeploy,
  broadcastTransaction,
  makeContractCall,
  callReadOnlyFunction,
  bufferCVFromString,
  principalCV
} from "@stacks/transactions";
import { noneCV } from "@stacks/transactions/dist/clarity/types/optionalCV.js";

import { createActor, canisterId } from "../declarations/STX/index.js";
import { createOisyFactoryActor } from "../ic/oisywallet/index.js";
import { Buffer } from "buffer";
import { StacksTestnet, StacksMainnet } from "@stacks/network";
import { useNavigate } from "react-router-dom";


const buildNFTContrat = (options) => {
  return `;; This contract implements the SIP-009 community-standard Non-Fungible Token trait
(impl-trait 'ST1EM1QREZ5DMC93HJB4BYFZWF8V4EV0EZW8BWYJZ.acludo-nft.nft-trait)

;; Define the NFT's name
(define-non-fungible-token ${options.name} uint)

;; Keep track of the last minted token ID
(define-data-var last-token-id uint u0)

;; Define constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant COLLECTION_LIMIT u${options.limit}) ;; Limit to series of 1000

(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_SOLD_OUT (err u300))

(define-data-var base-uri (string-ascii 80) "https://your.api.com/path/to/collection/{id}")

;; SIP-009 function: Get the last minted token ID.
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; SIP-009 function: Get link where token metadata is hosted
(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get base-uri)))
)

;; SIP-009 function: Get the owner of a given token
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? ${options.name} token-id))
)

;; SIP-009 function: Transfer NFT token to another owner.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    ;; #[filter(sender)]
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (nft-transfer? ${options.name} token-id sender recipient)
  )
)

;; Mint a new NFT.
(define-public (mint (recipient principal))
  ;; Create the new token ID by incrementing the last minted ID.
  (let ((token-id (+ (var-get last-token-id) u1)))
    ;; Ensure the collection stays within the limit.
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
    ;; Only the contract owner can mint.
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    ;; Mint the NFT and send it to the given recipient.
    (try! (nft-mint? ${options.name} token-id recipient))

    ;; Update the last minted token ID.
    (var-set last-token-id token-id)
    ;; Return a success status and the newly minted NFT ID.
    (ok token-id)
  )
)`;
};

// @ts-ignore
window.Buffer = Buffer;

//let canisterId = "dsaklfjadsfjkl";
const AuthContext = createContext(null);

//console.log("process", process.env);

const defaultOptions = {
  /**
   *  @type {import("@dfinity/auth-client").AuthClientCreateOptions}
   */
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
    },
  },
  /**
   * @type {import("@dfinity/auth-client").AuthClientLoginOptions}
   */
  loginOptions: {
    identityProvider: "https://identity.ic0.app/#authorize",
  },
};

/**
 *
 * @param options - Options for the AuthClient
 * @param {AuthClientCreateOptions} options.createOptions - Options for the AuthClient.create() method
 * @param {AuthClientLoginOptions} options.loginOptions - Options for the AuthClient.login() method
 * @returns
 */
export const useAuthClient = (options = defaultOptions) => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const [isAuth, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState("asdfadsas");
  const [principalText, setPrincipalText] = useState(null);
  const [STXactor, setSTX] = useState(null);
  const [oisyActor, setOisyActor] = useState(null);
  const [stxAddress, setStxAddress] = useState(null);
  const [STXPrivateKey, setSTXPrivate] = useState(null);
  const [stxBalance, setSTXBalance] = useState("0.0");
  const [userProperties, setUserProperties] = useState([]);
  const [NFTBalance, setNFTBalance] = useState(null);
  const[NFTS,setNFTS] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [step, setStep] = useState(1); // State to track the current step
  const[isLoading,setIsLoading] = useState(true);
  const[isError,setIsError] = useState(null);
  const[errorMessage,setErrorMessage] = useState(null);

  useEffect(() => {
    // Function to update data
    const updateData = () => {
      if (STXactor) {
        console.log("updating data")
        createSTXPrivateKey();
        getUserProperties();
      }
      if(NFTBalance){
        getNFTsData()
      }
    };

    // Call the update function every 2 minutes (120,000 ms)
    const interval = setInterval(() => {
      updateData();
    }, 120000);

    // Call updateData initially
    updateData();

    // Cleanup the interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize AuthClient
    AuthClient.create(options.createOptions).then(async (client) => {
      console.log("coool", client);
      updateClient(client);
    });
  }, []);

  useEffect(() => {
    if (STXactor) {
      createSTXPrivateKey();
      getUserProperties();
    }
  }, [STXactor]);

  useEffect(()=>{
    if(NFTBalance){
      getNFTsData()
    }
  },[NFTBalance])

  const login = () => {
    authClient.login({
      ...options.loginOptions,
      onSuccess: () => {
        console.log("on sucess");
        updateClient(authClient);
      },
    });
  };


  const mintNFT = async (entity) => {
    setStep(3)
    setShowModal(true)
    console.log("NFTS")
    const network = new StacksTestnet();
    let publicArray = entity.privateKey[0];
    publicArray[32] = 1;
    let hex = Buffer.from(publicArray).toString("hex");
    const txOptions = {
      contractAddress: entity.stxWallet[0],
      contractName: entity.address.replace(/ /g, "_"),
      functionName: "mint",
      functionArgs: [principalCV(stxAddress)],
      senderKey: hex,
      validateWithAbi: true,
      network,
      postConditions: [],
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);

    console.log("mintNFT", transaction);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    const txId = broadcastResponse.txid;
    setShowModal(false)
    navigate("/nfts")
  };

  const getNFTS = async (entity) => {
    console.log("getting NFTS");

    const contractAddress = entity.stxWallet[0];
    const contractName = entity.address.replace(/ /g, "_")
    const functionName = "get-last-token-id";
    //  const buffer = bufferCVFromString("");
    const network = new StacksTestnet();
    const senderAddress = stxAddress;

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [noneCV()],
      network,
      senderAddress,
    };

    const result = await callReadOnlyFunction(options);
    console.log("looking at result form read Only function", result)
    // const network = new StacksTestnet();
    // let publicArray = entity.privateKey[0];
    // publicArray[32] = 1;
    // let hex = Buffer.from(publicArray).toString("hex");
    // const txOptions = {
    //   contractAddress: entity.stxWallet[0],
    //   contractName: entity.address.replace(/ /g, "_"),
    //   functionName: "get-last-token-id",
    //   functionArgs: [],
    //   senderKey: hex,
    //   validateWithAbi: true,
    //   network,
    //   postConditions: [],
    //   anchorMode: AnchorMode.Any,
    // };

    // const transaction = await makeContractCall(txOptions);

    // console.log("getNFT",transaction);
    // const broadcastResponse = await broadcastTransaction(transaction, network);
    // const txId = broadcastResponse.txid;
  };

  const getUserProperties = async () => {
    let properties = await STXactor.getUserProperties();
    console.log("getUserProperties", properties);
    setUserProperties(properties);
  };

  const createProperty = async (property) => {
    setShowModal(true)
    setStep(1)
    let propertyRequest = {
      privateKey: [],
      contract: [],
      address: property.address,
      description: property.description,
      valueBTC: property.valueBTC,
      rentValueBTC: property.rentBTC,
      picture: property.picture,
      status: "notdeployed",
    };

    let response = await STXactor.createProperty(propertyRequest);
    setStep(2)
    console.log("response", response);
    let id = Number(response);
    let responsePrivateKey = await STXactor.crearPropertyWallet(id);
    let publicArray = responsePrivateKey.Ok;
    publicArray[32] = 1;
    let hex = Buffer.from(publicArray).toString("hex");
    console.log("response private key", responsePrivateKey);
    setStep(3)
    const stacksAddress = getAddressFromPrivateKey(
      hex,
      TransactionVersion.Testnet // remove for Mainnet addresses
    );
    let settingStxAddress = await STXactor.setStxPropertyWallet(
      id,
      stacksAddress
    );
    console.log("response to setting stxAddres", settingStxAddress);
    setShowModal(false);
    getUserProperties();
    navigate("/properties")
    ///todo create the STX wallet and register in the state to avoid privakey leakage. only owner of the property can call private key!
  };

  const deployNFTContract = async (entity) => {
    setShowModal(true)
    let publicArray = entity.privateKey[0];
    publicArray[32] = 1;
    let hex = Buffer.from(publicArray).toString("hex");
    // for mainnet, use `StacksMainnet()`
    const network = new StacksTestnet();

    const txOptions = {
      contractName: entity.address.replace(/ /g, "_"),
      codeBody: buildNFTContrat({
        name: `NFT-Property-${entity.id.toString()}`,
        limit: "1000",
      }),
      senderKey: hex,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractDeploy(txOptions);
    setStep(2)
    console.log("TX", transaction);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    console.log("BROADCAST TX", broadcastResponse);
    const txId = broadcastResponse.txid;
    console.log("Brodcast id", txId);
    setShowModal(false)
    if (
      !broadcastResponse.error
    ) {
      let deployedStatys = await STXactor.propertyDeployed(
        entity.id,
        entity.stxWallet[0] + "." + entity.address.replace(/ /g, "_")
      );
      console.log("deployed status", deployedStatys);
      getUserProperties()
    }else{
      setIsError(true);
      setErrorMessage(broadcastResponse.error)
    }
  };

  const getStacksBalance = async (account) => {
    let balanceResponse = await fetch(
      `https://api.testnet.hiro.so/extended/v1/address/${account}/balances`,
      {
        method: "GET",
      }
    );
    let response = await balanceResponse.json();
    console.log("balance", response);
    if (response && response.stx) {
      setSTXBalance(response.stx.balance);
      let nftKeys = (Object.keys(response.non_fungible_tokens));
      let nftParses = nftKeys.map((item) => {
        const count =  response.non_fungible_tokens[item].count;
        const parts = item.split("::");
        // Step 2: Split the second part (NFT section) by "-" and grab the last part
        const nftParts = parts[1].split("-");
        const nftNumber = parseInt(nftParts[nftParts.length - 1], 10); // Convert to a number
        // Step 3: Form the final array with the first part and the extracted number
        return [parts[0], nftNumber,count]
      })


      console.log("nft keys", nftParses)
      setNFTBalance(nftParses)
    }
  };


  const getNFTsData = async () =>{
   let NFTsData=  await Promise.all(NFTBalance.map(async (item)=>{
      let response =await STXactor.getPropertyNFTData(item[0]);
      console.log("response nft data",response)
      return {nftData:response[0],count:item[2]};
    }))
    console.log("NFT Data",NFTsData)
    setNFTS(NFTsData)
    setIsLoading(false)
  };

  const createSTXPrivateKey = async () => {
    let publicHex = await STXactor.canister_and_caller_pub_key();
    console.log("public hex", publicHex);
    let publicArray = publicHex.Ok.public_key;
    publicArray[32] = 1;
    let hex = Buffer.from(publicArray).toString("hex");
    console.log(" before if hex", hex);
    if (publicHex.Ok) {
      const privateKey = createStacksPrivateKey(hex);
      console.log("STX private key", privateKeyToString(privateKey));
      const publicKey = getPublicKey(privateKey);
      console.log("STX publicKey", publicKey);

      const stacksAddress = getAddressFromPrivateKey(
        hex,
        TransactionVersion.Testnet // remove for Mainnet addresses
      );

      console.log("stack aaddres", stacksAddress);
      setStxAddress(stacksAddress);
      await getStacksBalance(stacksAddress);
    }
  };

  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated();
    console.log("updating client", isAuthenticated);
    setIsAuthenticated(isAuthenticated);

    const identity = client.getIdentity();
    setIdentity(identity);

    const principal = identity.getPrincipal();
    console.log("principal", principal);
    let principalText = Principal.fromUint8Array(principal._arr).toText();
    console.log("principalText", principalText);

    let stxActor = createActor("djcrm-lqaaa-aaaaj-azulq-cai", {
      agentOptions: { identity },
    });
    let oisyActorInit = createOisyFactoryActor({
      agentOptions: {
        identity,
      },
    });

    setOisyActor(oisyActorInit);

    setPrincipalText(principalText);
    setPrincipal(principal);
    setSTX(stxActor);
    setAuthClient(client);
    createSTXPrivateKey();
  }

  async function logout() {
    await authClient?.logout();
    await updateClient(authClient);
  }

  return {
    isAuth,
    login,
    logout,
    authClient,
    identity,
    principal,
    STXactor,
    createSTXPrivateKey,
    oisyActor,
    deployNFTContract,
    stxAddress,
    stxBalance,
    principalText,
    createProperty,
    userProperties,
    getNFTS,
    mintNFT,
    NFTS,
    showModal,
    step,
    setShowModal,
    isLoading,
    errorMessage,
    isError,
    setIsError
  };
};

/**
 * @type {React.FC}
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
