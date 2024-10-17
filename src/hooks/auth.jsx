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
  broadcastTransaction
} from "@stacks/transactions";
import { createActor, canisterId } from "../declarations/STX/index.js";
import { createOisyFactoryActor } from "../ic/oisywallet/index.js";
import { Buffer } from "buffer";
import { StacksTestnet, StacksMainnet } from "@stacks/network";


let nftContractString = `;; This contract implements the SIP-009 community-standard Non-Fungible Token trait
(impl-trait 'ST1EM1QREZ5DMC93HJB4BYFZWF8V4EV0EZW8BWYJZ.acludo-nft.nft-trait)

;; Define the NFT's name
(define-non-fungible-token Your-NFT-Name uint)

;; Keep track of the last minted token ID
(define-data-var last-token-id uint u0)

;; Define constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant COLLECTION_LIMIT u1000) ;; Limit to series of 1000

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
  (ok (nft-get-owner? Your-NFT-Name token-id))
)

;; SIP-009 function: Transfer NFT token to another owner.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    ;; #[filter(sender)]
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (nft-transfer? Your-NFT-Name token-id sender recipient)
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
    (try! (nft-mint? Your-NFT-Name token-id recipient))

    ;; Update the last minted token ID.
    (var-set last-token-id token-id)
    ;; Return a success status and the newly minted NFT ID.
    (ok token-id)
  )
)`

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
  const [isAuth, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState("asdfadsas");
  const [principalText, setPrincipalText] = useState(null);
  const [STXactor, setSTX] = useState(null);
  const [oisyActor, setOisyActor] = useState(null);
  const [stxAddress, setStxAddress] = useState(null);
  //   const [tokenAactor, setTokenAactorState] = useState(null);
  //   const [tokenBactor, setTokenBactorState] = useState(null);
  //   const [poolActor, setPoolActorState] = useState(null);
  //   const [swapfactory, setSwapFactoryState] = useState(null);
  //   const [tokenDeployer, setTokenDeployer] = useState(null);
  //   const [shitToken, setShitToken] = useState(null);
  //   const [shitListener, setShitListener] = useState(
  //     "nqo5b-6qaaa-aaaap-ahauq-cai"
  //   );

  useEffect(() => {
    // Initialize AuthClient
    AuthClient.create(options.createOptions).then(async (client) => {
      console.log("coool", client);
      updateClient(client);
    });
  }, []);

  const login = () => {
    authClient.login({
      ...options.loginOptions,
      onSuccess: () => {
        console.log("on sucess");
        updateClient(authClient);
      },
    });
  };

  const deployNFTContract = async () => {
    let publicHex = await STXactor.canister_and_caller_pub_key();
    console.log("public hex", publicHex);
    let publicArray = publicHex.Ok.public_key;
    publicArray[32] = 1;
    let hex = Buffer.from(publicArray).toString("hex");
    // for mainnet, use `StacksMainnet()`
    const network = new StacksTestnet();


    const txOptions = {
      contractName: "contract_name",
      codeBody: nftContractString,
      senderKey: hex,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractDeploy(txOptions);
    console.log("TX", transaction);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    console.log("BROADCAST TX", broadcastResponse);
    const txId = broadcastResponse.txid;
    console.log("Brodcast id", txId);
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
  };

  const getSTXBalance = async (account) => {
    let balanceResponse = await fetch(
      `https://api.testnet.hiro.so/extended/v1/address/${account}/STX`,
      {
        method: "GET",
      }
    );
    let response = await balanceResponse.json();
    console.log("balance", response);
  };

  const createSTXPrivateKey = async () => {
    // let publicHex = await oisyActor.caller_eth_address();
    // console.log("public hex", publicHex);
    // const privateKey = createStacksPrivateKey(publicHex);
    // console.log("STX private key", privateKey);
    // const publicKey = getPublicKey(privateKey);
    // console.log("STX publicKey", publicKey);
    //    }
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
      await getStacksBalance(stacksAddress);
    }
  };

  //   const initSwapFactory = async () => {
  //     let factory = await createSwapFactoryActor();
  //     setSwapFactoryState(factory);
  //   };

  //   const setShitListenerF = (shit) => {
  //     setShitListener(shit);
  //   };

  //   const setPoolActor = (pool) => {
  //     let poolid = pool.ok.canisterId;
  //     let poolActor = createPoolActor(poolid, {
  //       agentOptions: { identity },
  //     });
  //     setPoolActorState(poolActor);
  //   };

  //   const setTokenAactor = async (canisterId) => {
  //     let actor = createicrc1Actor(canisterId, {
  //       agentOption: {
  //         identity,
  //       },
  //     });
  //     setTokenAactorState(actor);
  //   };

  //   const setTokenBactor = (canisterId) => {
  //     let actor = createicrc1Actor(canisterId, {
  //       agentOption: {
  //         identity,
  //       },
  //     });
  //     setTokenBactorState(actor);
  //   };

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

    // let icpCanister = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    // console.log("creating actors");
    // let shitTokenActor = createicrc1Actor(shitListener, {
    //   agentOptions: {
    //     identity,
    //   },
    // });

    // let Aactor = createicrc1Actor(icpCanister, {
    //   agentOptions: {
    //     identity,
    //   },
    // });

    // let Bactor = createicrc1Actor("nqo5b-6qaaa-aaaap-ahauq-cai", {
    //   agentOptions: {
    //     identity,
    //   },
    // });

    // let tokenDep = createActor("l5q4j-wyaaa-aaaap-ab2wq-cai", {
    //   agentOptions: {
    //     identity,
    //   },
    // });

    // setShitToken(shitTokenActor);

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
    // setTokenAactorState(Aactor);
    // setTokenBactorState(Bactor);
    // setTokenDeployer(tokenDep);
    setAuthClient(client);
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
    deployNFTContract
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
